(function () {
  "use strict";

  if (document.body.dataset.tool !== "jwt") {
    return;
  }

  var $ = window.DevKit.$;
  var escapeHtml = window.DevKit.escapeHtml;
  var input = $("#jwtInput");
  var output = $("#jwtOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  var sampleToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZvcm1hbGludCIsImlhdCI6MTc0NTgyNzIwMCwiZXhwIjoxNzc3MzYzMjAwLCJyb2xlIjoiZGV2ZWxvcGVyIn0." +
    "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + input.value.split(".").length + " parts";
  }

  function decodeBase64Url(value) {
    var normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4) {
      normalized += "=";
    }

    var binary = atob(normalized);
    var bytes = [];
    for (var index = 0; index < binary.length; index += 1) {
      bytes.push(binary.charCodeAt(index));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  function formatNumericDate(value) {
    if (typeof value !== "number" || !isFinite(value)) {
      return null;
    }
    return new Date(value * 1000).toISOString();
  }

  function decodeToken() {
    var token = input.value.trim();
    if (!token) {
      throw new Error("Token is empty.");
    }

    var parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("JWT must have three dot-separated parts.");
    }

    var header = JSON.parse(decodeBase64Url(parts[0]));
    var payload = JSON.parse(decodeBase64Url(parts[1]));
    var claims = {};
    ["iat", "nbf", "exp"].forEach(function (key) {
      var formatted = formatNumericDate(payload[key]);
      if (formatted) {
        claims[key + "_iso"] = formatted;
      }
    });

    return {
      header: header,
      payload: payload,
      readableClaims: claims,
      signature: {
        present: Boolean(parts[2]),
        length: parts[2].length,
        verified: false
      }
    };
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

  function runDecode() {
    try {
      var decoded = decodeToken();
      var text = JSON.stringify(decoded, null, 2);
      lastOutput = text;
      output.innerHTML = highlightJson(text);
      window.DevKit.setStatus(statusMessage, "ok", "Decoded. Signature not verified.");
      window.DevKit.renderMetrics(metrics, [
        { label: "Algorithm", value: decoded.header.alg || "-" },
        { label: "Type", value: decoded.header.typ || "-" },
        { label: "Claims", value: String(Object.keys(decoded.payload).length) },
        { label: "Signature", value: decoded.signature.present ? "Present" : "Missing" }
      ]);
    } catch (error) {
      lastOutput = error.message;
      output.textContent = error.message;
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function handleAction(action) {
    if (action === "decode") {
      runDecode();
    }
    if (action === "clear") {
      input.value = "";
      output.textContent = "";
      lastOutput = "";
      updateInputMeta();
      window.DevKit.setStatus(statusMessage, "", "Ready");
    }
    if (action === "sample") {
      input.value = sampleToken;
      updateInputMeta();
      runDecode();
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
    runDecode();
  }, 180));

  input.value = sampleToken;
  updateInputMeta();
  runDecode();
})();

