(function () {
  "use strict";

  if (document.body.dataset.tool !== "json") {
    return;
  }

  var $ = window.DevKit.$;
  var $$ = window.DevKit.$$;
  var escapeHtml = window.DevKit.escapeHtml;
  var input = $("#jsonInput");
  var output = $("#jsonOutput");
  var tree = $("#jsonTree");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  var sampleJson = {
    project: "DevKit",
    release: "0.1.0",
    tools: ["json-formatter", "xml-formatter"],
    monetization: {
      ads: true,
      premium: "planned",
      apiAccess: "planned"
    },
    privacy: {
      runsInBrowser: true,
      uploadsInput: false
    }
  };

  function parseJson() {
    var raw = input.value.trim();
    if (!raw) {
      throw new Error("Input is empty.");
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error(normalizeJsonError(error, raw));
    }
  }

  function normalizeJsonError(error, raw) {
    var message = error && error.message ? error.message : "Invalid JSON.";
    var positionMatch = message.match(/position\s+(\d+)/i);
    var lineMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);

    if (lineMatch) {
      return "Invalid JSON at line " + lineMatch[1] + ", column " + lineMatch[2] + ".";
    }

    if (positionMatch) {
      var position = Number(positionMatch[1]);
      var before = raw.slice(0, position);
      var lines = before.split(/\r\n|\r|\n/);
      return "Invalid JSON at line " + lines.length + ", column " + (lines[lines.length - 1].length + 1) + ".";
    }

    return message;
  }

  function highlightJson(text) {
    return escapeHtml(text).replace(
      /(&quot;(?:\\u[a-fA-F0-9]{4}|\\[^u]|(?!&quot;).)*&quot;(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      function (match) {
        var className = "token-number";
        if (/^&quot;/.test(match)) {
          className = /:$/.test(match) ? "token-key" : "token-string";
        } else if (/true|false/.test(match)) {
          className = "token-boolean";
        } else if (/null/.test(match)) {
          className = "token-null";
        }
        return '<span class="' + className + '">' + match + "</span>";
      }
    );
  }

  function getDepth(value) {
    if (!value || typeof value !== "object") {
      return 0;
    }
    var children = Array.isArray(value) ? value : Object.keys(value).map(function (key) { return value[key]; });
    if (!children.length) {
      return 1;
    }
    return 1 + Math.max.apply(null, children.map(getDepth));
  }

  function countKeys(value) {
    if (!value || typeof value !== "object") {
      return 0;
    }
    if (Array.isArray(value)) {
      return value.reduce(function (total, item) {
        return total + countKeys(item);
      }, 0);
    }
    return Object.keys(value).reduce(function (total, key) {
      return total + 1 + countKeys(value[key]);
    }, 0);
  }

  function renderTree(value, key) {
    var label = key === undefined ? "root" : key;

    if (value && typeof value === "object") {
      var isArray = Array.isArray(value);
      var keys = isArray ? value.map(function (_, index) { return index; }) : Object.keys(value);
      var type = isArray ? "array" : "object";
      var summary = escapeHtml(label) + " <span class=\"tree-type\">" + type + " / " + keys.length + "</span>";
      var children = keys
        .map(function (childKey) {
          return renderTree(value[childKey], childKey);
        })
        .join("");
      return "<details open><summary><span class=\"tree-key\">" + summary + "</span></summary>" + children + "</details>";
    }

    return (
      '<div><span class="tree-key">' +
      escapeHtml(label) +
      ':</span> <span class="tree-value">' +
      escapeHtml(JSON.stringify(value)) +
      "</span></div>"
    );
  }

  function setOutput(text, parsed) {
    lastOutput = text;
    output.innerHTML = highlightJson(text);
    tree.innerHTML = parsed === undefined ? "" : renderTree(parsed);
    updateMetrics(text, parsed);
  }

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + window.DevKit.lineCount(input.value) + " lines";
  }

  function updateMetrics(text, parsed) {
    window.DevKit.renderMetrics(metrics, [
      { label: "Size", value: window.DevKit.formatBytes(text) },
      { label: "Lines", value: String(window.DevKit.lineCount(text)) },
      { label: "Depth", value: parsed === undefined ? "0" : String(getDepth(parsed)) },
      { label: "Keys", value: parsed === undefined ? "0" : String(countKeys(parsed)) }
    ]);
  }

  function runFormat(space) {
    try {
      var parsed = parseJson();
      var text = JSON.stringify(parsed, null, space);
      setOutput(text, parsed);
      window.DevKit.setStatus(statusMessage, "ok", "Valid JSON");
    } catch (error) {
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runValidate() {
    try {
      var parsed = parseJson();
      var text = JSON.stringify(parsed, null, 2);
      setOutput(text, parsed);
      window.DevKit.setStatus(statusMessage, "ok", "Valid JSON");
    } catch (error) {
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function switchView(name) {
    $$(".segmented button").forEach(function (button) {
      var active = button.dataset.view === name;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    $("#codeView").classList.toggle("active", name === "code");
    $("#codeView").hidden = name !== "code";
    $("#treeView").classList.toggle("active", name === "tree");
    $("#treeView").hidden = name !== "tree";
  }

  function handleAction(action) {
    if (action === "format") {
      runFormat(2);
    }
    if (action === "minify") {
      runFormat(0);
    }
    if (action === "validate") {
      runValidate();
    }
    if (action === "clear") {
      input.value = "";
      setOutput("", undefined);
      updateInputMeta();
      window.DevKit.setStatus(statusMessage, "", "Ready");
    }
    if (action === "sample") {
      input.value = JSON.stringify(sampleJson, null, 2);
      updateInputMeta();
      runFormat(2);
    }
    if (action === "copy") {
      window.DevKit.copyText(lastOutput).then(function () {
        window.DevKit.setStatus(statusMessage, "ok", "Copied");
      });
    }
    if (action === "download") {
      window.DevKit.downloadText("formatted.json", lastOutput || input.value, "application/json;charset=utf-8");
    }
  }

  document.addEventListener("click", function (event) {
    var actionButton = event.target.closest("[data-action]");
    var viewButton = event.target.closest("[data-view]");

    if (actionButton) {
      handleAction(actionButton.dataset.action);
    }
    if (viewButton) {
      switchView(viewButton.dataset.view);
    }
  });

  input.addEventListener("input", window.DevKit.debounce(updateInputMeta, 120));
  input.value = JSON.stringify(sampleJson, null, 2);
  updateInputMeta();
  runFormat(2);
})();
