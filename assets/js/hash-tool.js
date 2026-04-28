(function () {
  "use strict";

  if (document.body.dataset.tool !== "hash") {
    return;
  }

  var $ = window.DevKit.$;
  var escapeHtml = window.DevKit.escapeHtml;
  var input = $("#hashInput");
  var output = $("#hashOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";
  var algorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + window.DevKit.lineCount(input.value) + " lines";
  }

  function toHex(buffer) {
    return Array.prototype.map
      .call(new Uint8Array(buffer), function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function highlightJson(text) {
    return escapeHtml(text).replace(
      /(&quot;(?:\\u[a-fA-F0-9]{4}|\\[^u]|(?!&quot;).)*&quot;(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      function (match) {
        var className = "token-number";
        if (/^&quot;/.test(match)) {
          className = /:$/.test(match) ? "token-key" : "token-string";
        }
        return '<span class="' + className + '">' + match + "</span>";
      }
    );
  }

  function runHash() {
    if (!window.crypto || !window.crypto.subtle) {
      lastOutput = "Web Crypto API is not available in this browser context.";
      output.textContent = lastOutput;
      window.DevKit.setStatus(statusMessage, "error", "Web Crypto unavailable");
      return;
    }

    var bytes = new TextEncoder().encode(input.value);
    Promise.all(
      algorithms.map(function (algorithm) {
        return window.crypto.subtle.digest(algorithm, bytes).then(function (digest) {
          return [algorithm, toHex(digest)];
        });
      })
    )
      .then(function (entries) {
        var result = {};
        entries.forEach(function (entry) {
          result[entry[0].toLowerCase().replace("-", "")] = entry[1];
        });
        lastOutput = JSON.stringify(result, null, 2);
        output.innerHTML = highlightJson(lastOutput);
        window.DevKit.setStatus(statusMessage, "ok", "Generated");
        window.DevKit.renderMetrics(metrics, [
          { label: "Input", value: window.DevKit.formatBytes(input.value) },
          { label: "Algorithms", value: String(algorithms.length) },
          { label: "SHA-256", value: result.sha256.slice(0, 10) + "..." },
          { label: "Mode", value: "Text" }
        ]);
      })
      .catch(function (error) {
        lastOutput = error.message;
        output.textContent = error.message;
        window.DevKit.setStatus(statusMessage, "error", error.message);
      });
  }

  function handleAction(action) {
    if (action === "hash") {
      runHash();
    }
    if (action === "sample") {
      input.value = "Formalint developer tools";
      updateInputMeta();
      runHash();
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
    runHash();
  }, 180));

  input.value = "Formalint developer tools";
  updateInputMeta();
  runHash();
})();

