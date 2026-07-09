(function () {
  "use strict";

  if (document.body.dataset.tool !== "json-diff") {
    return;
  }

  var $ = window.DevKit.$;
  var escapeHtml = window.DevKit.escapeHtml;
  var leftInput = $("#leftJsonInput");
  var rightInput = $("#rightJsonInput");
  var leftMeta = $("#leftMeta");
  var rightMeta = $("#rightMeta");
  var statusMessage = $("#statusMessage");
  var diffOutput = $("#diffOutput");
  var metrics = $("#metrics");
  var lastDiffText = "";

  var sampleLeft = {
    user: { id: 42, name: "Asiye", plan: "trial" },
    flags: ["api", "beta"],
    active: true
  };

  var sampleRight = {
    user: { id: 42, name: "Asiye", plan: "pro" },
    flags: ["api", "beta", "webhook"],
    active: true,
    region: "eu"
  };

  function normalizeJsonError(error, raw, label) {
    var message = error && error.message ? error.message : "Invalid JSON.";
    var positionMatch = message.match(/position\s+(\d+)/i);
    if (positionMatch) {
      var position = Number(positionMatch[1]);
      var before = raw.slice(0, position);
      var lines = before.split(/\r\n|\r|\n/);
      return label + " JSON is invalid at line " + lines.length + ", column " + (lines[lines.length - 1].length + 1) + ".";
    }
    return label + " JSON is invalid: " + message;
  }

  function parseInput(input, label) {
    var raw = input.value.trim();
    if (!raw) {
      throw new Error(label + " JSON is empty.");
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error(normalizeJsonError(error, raw, label));
    }
  }

  function isObject(value) {
    return value !== null && typeof value === "object";
  }

  function isEqual(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  function formatValue(value) {
    if (value === undefined) {
      return "";
    }
    return JSON.stringify(value);
  }

  function pathToText(path) {
    return path.length ? path.join("") : "root";
  }

  function joinChild(path, parent, key) {
    if (Array.isArray(parent)) {
      return path.concat("[" + key + "]");
    }
    return path.concat((path.length ? "." : "") + key);
  }

  function collectDiffs(left, right, path, rows) {
    if (isEqual(left, right)) {
      return;
    }

    if (!isObject(left) || !isObject(right) || Array.isArray(left) !== Array.isArray(right)) {
      rows.push({
        type: left === undefined ? "added" : right === undefined ? "removed" : "changed",
        path: pathToText(path),
        left: formatValue(left),
        right: formatValue(right)
      });
      return;
    }

    var keys = Array.isArray(left) || Array.isArray(right)
      ? Array.from({ length: Math.max(left.length || 0, right.length || 0) }, function (_, index) { return index; })
      : Array.from(new Set(Object.keys(left).concat(Object.keys(right)))).sort();

    keys.forEach(function (key) {
      var hasLeft = Object.prototype.hasOwnProperty.call(left, key);
      var hasRight = Object.prototype.hasOwnProperty.call(right, key);
      var childPath = joinChild(path, left, key);

      if (!hasLeft) {
        rows.push({ type: "added", path: pathToText(childPath), left: "", right: formatValue(right[key]) });
        return;
      }
      if (!hasRight) {
        rows.push({ type: "removed", path: pathToText(childPath), left: formatValue(left[key]), right: "" });
        return;
      }
      collectDiffs(left[key], right[key], childPath, rows);
    });
  }

  function renderRows(rows) {
    if (!rows.length) {
      diffOutput.innerHTML = '<p class="empty-state">No differences found. The two JSON snippets match.</p>';
      return;
    }

    diffOutput.innerHTML = rows.map(function (row) {
      return (
        '<article class="diff-row diff-' + row.type + '">' +
          '<div class="diff-path"><span>' + escapeHtml(row.type) + '</span><b>' + escapeHtml(row.path) + '</b></div>' +
          '<pre><code>' + escapeHtml(row.left) + '</code></pre>' +
          '<pre><code>' + escapeHtml(row.right) + '</code></pre>' +
        '</article>'
      );
    }).join("");
  }

  function updateMeta() {
    leftMeta.textContent = window.DevKit.formatBytes(leftInput.value) + " / " + window.DevKit.lineCount(leftInput.value) + " lines";
    rightMeta.textContent = window.DevKit.formatBytes(rightInput.value) + " / " + window.DevKit.lineCount(rightInput.value) + " lines";
  }

  function runDiff() {
    try {
      var left = parseInput(leftInput, "Left");
      var right = parseInput(rightInput, "Right");
      var rows = [];
      collectDiffs(left, right, [], rows);
      renderRows(rows);
      lastDiffText = rows.map(function (row) {
        return row.type.toUpperCase() + " " + row.path + "\n- " + row.left + "\n+ " + row.right;
      }).join("\n\n");
      window.DevKit.renderMetrics(metrics, [
        { label: "Changes", value: String(rows.length) },
        { label: "Added", value: String(rows.filter(function (row) { return row.type === "added"; }).length) },
        { label: "Removed", value: String(rows.filter(function (row) { return row.type === "removed"; }).length) },
        { label: "Changed", value: String(rows.filter(function (row) { return row.type === "changed"; }).length) }
      ]);
      window.DevKit.setStatus(statusMessage, "ok", rows.length ? "Differences found" : "JSON matches");
    } catch (error) {
      diffOutput.innerHTML = "";
      window.DevKit.renderMetrics(metrics, [
        { label: "Changes", value: "0" },
        { label: "Added", value: "0" },
        { label: "Removed", value: "0" },
        { label: "Changed", value: "0" }
      ]);
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function handleAction(action) {
    if (action === "compare") {
      updateMeta();
      runDiff();
    }
    if (action === "sample") {
      leftInput.value = JSON.stringify(sampleLeft, null, 2);
      rightInput.value = JSON.stringify(sampleRight, null, 2);
      updateMeta();
      runDiff();
    }
    if (action === "clear") {
      leftInput.value = "";
      rightInput.value = "";
      diffOutput.innerHTML = "";
      lastDiffText = "";
      updateMeta();
      window.DevKit.setStatus(statusMessage, "", "Ready");
    }
    if (action === "copy") {
      window.DevKit.copyText(lastDiffText).then(function () {
        window.DevKit.setStatus(statusMessage, "ok", "Copied diff summary");
      });
    }
  }

  document.addEventListener("click", function (event) {
    var actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleAction(actionButton.dataset.action);
    }
  });

  leftInput.addEventListener("input", window.DevKit.debounce(updateMeta, 120));
  rightInput.addEventListener("input", window.DevKit.debounce(updateMeta, 120));
  handleAction("sample");
})();
