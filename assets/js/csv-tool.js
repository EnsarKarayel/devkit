(function () {
  "use strict";

  if (document.body.dataset.tool !== "csv") {
    return;
  }

  var $ = window.DevKit.$;
  var escapeHtml = window.DevKit.escapeHtml;
  var input = $("#csvInput");
  var output = $("#csvOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + window.DevKit.lineCount(input.value) + " lines";
  }

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = "";
    var quoted = false;
    for (var index = 0; index < text.length; index += 1) {
      var char = text[index];
      var next = text[index + 1];
      if (quoted) {
        if (char === '"' && next === '"') {
          field += '"';
          index += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          field += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (char !== "\r") {
        field += char;
      }
    }
    row.push(field);
    rows.push(row);
    return rows.filter(function (item) {
      return item.some(function (value) { return value !== ""; });
    });
  }

  function highlightJson(text) {
    return escapeHtml(text).replace(/(&quot;.*?&quot;(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?)/g, function (match) {
      var className = /^&quot;/.test(match) ? (/:$/.test(match) ? "token-key" : "token-string") : "token-number";
      return '<span class="' + className + '">' + match + "</span>";
    });
  }

  function convert() {
    try {
      var rows = parseCsv(input.value);
      if (rows.length < 2) {
        throw new Error("CSV needs a header row and at least one data row.");
      }
      var headers = rows[0].map(function (header, index) {
        return header || "column_" + (index + 1);
      });
      var data = rows.slice(1).map(function (row) {
        return headers.reduce(function (record, header, index) {
          record[header] = row[index] === undefined ? "" : row[index];
          return record;
        }, {});
      });
      lastOutput = JSON.stringify(data, null, 2);
      output.innerHTML = highlightJson(lastOutput);
      window.DevKit.setStatus(statusMessage, "ok", "Converted");
      window.DevKit.renderMetrics(metrics, [
        { label: "Rows", value: String(data.length) },
        { label: "Columns", value: String(headers.length) },
        { label: "Input", value: window.DevKit.formatBytes(input.value) },
        { label: "Output", value: window.DevKit.formatBytes(lastOutput) }
      ]);
    } catch (error) {
      lastOutput = error.message;
      output.textContent = error.message;
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function handleAction(action) {
    if (action === "convert") {
      convert();
    }
    if (action === "sample") {
      input.value = 'id,name,role\n1,Ensar,Founder\n2,"Formalint, Tools",Developer';
      updateInputMeta();
      convert();
    }
    if (action === "clear") {
      input.value = "";
      output.textContent = "";
      lastOutput = "";
      updateInputMeta();
      window.DevKit.setStatus(statusMessage, "", "Ready");
    }
    if (action === "copy") {
      window.DevKit.copyText(lastOutput).then(function () {
        window.DevKit.setStatus(statusMessage, "ok", "Copied");
      });
    }
  }

  document.addEventListener("click", function (event) {
    var actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleAction(actionButton.dataset.action);
    }
  });
  input.addEventListener("input", window.DevKit.debounce(function () {
    updateInputMeta();
    convert();
  }, 180));
  input.value = 'id,name,role\n1,Ensar,Founder\n2,"Formalint, Tools",Developer';
  updateInputMeta();
  convert();
})();

