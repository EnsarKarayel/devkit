(function () {
  "use strict";

  if (document.body.dataset.tool !== "timestamp") {
    return;
  }

  var $ = window.DevKit.$;
  var escapeHtml = window.DevKit.escapeHtml;
  var input = $("#timestampInput");
  var output = $("#timestampOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  function updateInputMeta() {
    inputMeta.textContent = input.value ? input.value.length + " chars" : "Ready";
  }

  function parseInput(value) {
    var text = value.trim();
    if (!text) {
      throw new Error("Input is empty.");
    }

    if (/^-?\d+$/.test(text)) {
      var numeric = Number(text);
      if (!Number.isSafeInteger(numeric)) {
        throw new Error("Timestamp is outside the safe integer range.");
      }

      if (Math.abs(numeric) >= 100000000000) {
        return new Date(numeric);
      }
      return new Date(numeric * 1000);
    }

    var parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Enter Unix seconds, Unix milliseconds, or a valid date string.");
    }
    return parsed;
  }

  function renderResult(date) {
    var ms = date.getTime();
    var seconds = Math.floor(ms / 1000);
    var result = {
      unixSeconds: seconds,
      unixMilliseconds: ms,
      isoUtc: date.toISOString(),
      localTime: date.toString(),
      utcString: date.toUTCString(),
      timezoneOffsetMinutes: date.getTimezoneOffset()
    };

    lastOutput = JSON.stringify(result, null, 2);
    output.innerHTML = highlightJson(lastOutput);
    window.DevKit.setStatus(statusMessage, "ok", "Converted");
    window.DevKit.renderMetrics(metrics, [
      { label: "Unix", value: String(seconds) },
      { label: "Milliseconds", value: String(ms) },
      { label: "Year", value: String(date.getUTCFullYear()) },
      { label: "Timezone", value: "Local" }
    ]);
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

  function runConvert() {
    try {
      renderResult(parseInput(input.value));
    } catch (error) {
      lastOutput = error.message;
      output.textContent = error.message;
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function setNow() {
    input.value = String(Math.floor(Date.now() / 1000));
    updateInputMeta();
    runConvert();
  }

  function handleAction(action) {
    if (action === "convert") {
      runConvert();
    }
    if (action === "now") {
      setNow();
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
    runConvert();
  }, 180));

  setNow();
})();

