(function () {
  "use strict";

  if (document.body.dataset.tool !== "base64") {
    return;
  }

  var $ = window.DevKit.$;
  var input = $("#base64Input");
  var output = $("#base64Output");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + window.DevKit.lineCount(input.value) + " lines";
  }

  function encodeBase64(text) {
    var bytes = new TextEncoder().encode(text);
    var binary = "";
    bytes.forEach(function (byte) {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  function decodeBase64(text) {
    var compact = text.replace(/\s+/g, "");
    var binary = atob(compact);
    var bytes = new Uint8Array(binary.length);
    for (var index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new TextDecoder().decode(bytes);
  }

  function setResult(text, mode) {
    lastOutput = text;
    output.textContent = text;
    window.DevKit.setStatus(statusMessage, "ok", mode + " complete");
    window.DevKit.renderMetrics(metrics, [
      { label: "Mode", value: mode },
      { label: "Input", value: window.DevKit.formatBytes(input.value) },
      { label: "Output", value: window.DevKit.formatBytes(text) },
      { label: "Lines", value: String(window.DevKit.lineCount(text)) }
    ]);
  }

  function runEncode() {
    try {
      setResult(encodeBase64(input.value), "Encode");
    } catch (error) {
      lastOutput = error.message;
      output.textContent = error.message;
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runDecode() {
    try {
      setResult(decodeBase64(input.value), "Decode");
    } catch (error) {
      lastOutput = error.message;
      output.textContent = error.message;
      window.DevKit.setStatus(statusMessage, "error", "Invalid Base64 input.");
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
      input.value = "Formalint developer tools";
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
  input.value = "Formalint developer tools";
  updateInputMeta();
  runEncode();
})();

