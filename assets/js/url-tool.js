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
  var resultInput = null;

  function invalidateResult() {
    lastOutput = "";
    resultInput = null;
    output.textContent = "";
    window.DevKit.renderMetrics(metrics, []);
  }

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + window.DevKit.lineCount(input.value) + " lines";
  }

  function setResult(text, mode) {
    lastOutput = text;
    resultInput = input.value;
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
      invalidateResult();
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runDecode(formValue) {
    try {
      var value = formValue ? input.value.replace(/\+/g, " ") : input.value;
      setResult(decodeURIComponent(value), formValue ? "Decode form value" : "Decode component");
    } catch (error) {
      invalidateResult();
      window.DevKit.setStatus(statusMessage, "error", "Invalid percent-encoded input.");
    }
  }

  function handleAction(action) {
    if (action === "encode") {
      runEncode();
    }
    if (action === "decode") {
      runDecode(false);
    }
    if (action === "decode-form") {
      runDecode(true);
    }
    if (action === "sample") {
      input.value = "https://formalint.com/search?q=json formatter&lang=en";
      updateInputMeta();
      runEncode();
    }
    if (action === "clear") {
      input.value = "";
      invalidateResult();
      updateInputMeta();
      window.DevKit.setStatus(statusMessage, "", "Ready");
    }
    if (action === "copy") {
      if (resultInput === null || resultInput !== input.value) {
        invalidateResult();
        window.DevKit.setStatus(statusMessage, "error", "Encode or decode the current input before copying.");
        return;
      }
      window.DevKit.copyText(lastOutput).then(function () {
        window.DevKit.setStatus(statusMessage, "ok", "Copied");
      }).catch(function () {
        window.DevKit.setStatus(statusMessage, "error", "Clipboard access failed. Select and copy the result manually.");
      });
    }
  }

  document.addEventListener("click", function (event) {
    var actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleAction(actionButton.dataset.action);
    }
  });

  input.addEventListener("input", function () {
    invalidateResult();
    updateInputMeta();
    window.DevKit.setStatus(statusMessage, "", "Input changed. Encode or decode to refresh the result.");
  });
  input.value = "https://formalint.com/search?q=json formatter&lang=en";
  updateInputMeta();
  runEncode();
})();

