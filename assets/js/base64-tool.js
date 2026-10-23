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
    var binary;
    try {
      binary = atob(compact);
    } catch (error) {
      throw new Error("Invalid Base64 input. Use the standard Base64 alphabet without a data URL prefix.");
    }
    var bytes = new Uint8Array(binary.length);
    for (var index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    try {
      return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    } catch (error) {
      throw new Error("Decoded bytes are not valid UTF-8 text. Binary files and other character encodings are not supported.");
    }
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
      { label: "Lines", value: String(window.DevKit.lineCount(text)) }
    ]);
  }

  function runEncode() {
    try {
      setResult(encodeBase64(input.value), "Encode");
    } catch (error) {
      invalidateResult();
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runDecode() {
    try {
      setResult(decodeBase64(input.value), "Decode");
    } catch (error) {
      invalidateResult();
      window.DevKit.setStatus(statusMessage, "error", error.message);
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
  input.value = "Formalint developer tools";
  updateInputMeta();
  runEncode();
})();

