(function () {
  "use strict";

  if (document.body.dataset.tool !== "url") {
    return;
  }

  var $ = window.DevKit.$;
  var input = $("#urlInput");
  var output = $("#urlOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + window.DevKit.lineCount(input.value) + " lines";
  }

  function setResult(text, mode) {
    lastOutput = text;
    output.textContent = text;
    window.DevKit.setStatus(statusMessage, "ok", mode + " complete");
    window.DevKit.renderMetrics(metrics, [
      { label: "Mode", value: mode },
      { label: "Input", value: window.DevKit.formatBytes(input.value) },
      { label: "Output", value: window.DevKit.formatBytes(text) },
      { label: "Percent", value: String((text.match(/%/g) || []).length) }
    ]);
  }

  function runEncode() {
    try {
      setResult(encodeURIComponent(input.value), "Encode");
    } catch (error) {
      lastOutput = error.message;
      output.textContent = error.message;
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runDecode() {
    try {
      setResult(decodeURIComponent(input.value.replace(/\+/g, " ")), "Decode");
    } catch (error) {
      lastOutput = error.message;
      output.textContent = error.message;
      window.DevKit.setStatus(statusMessage, "error", "Invalid percent-encoded input.");
    }
  }

  function handleAction(action) {
    if (action === "encode") {
      runEncode();
    }
    if (action === "decode") {
      runDecode();
    }
    if (action === "sample") {
      input.value = "https://formalint.com/search?q=json formatter&lang=en";
      updateInputMeta();
      runEncode();
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

  input.addEventListener("input", window.DevKit.debounce(updateInputMeta, 120));
  input.value = "https://formalint.com/search?q=json formatter&lang=en";
  updateInputMeta();
  runEncode();
})();

