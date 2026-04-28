(function () {
  "use strict";

  if (document.body.dataset.tool !== "uuid") {
    return;
  }

  var $ = window.DevKit.$;
  var countInput = $("#uuidCount");
  var output = $("#uuidOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  function fallbackUuid() {
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    var hex = Array.prototype.map.call(bytes, function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
    return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
  }

  function createUuid() {
    return crypto.randomUUID ? crypto.randomUUID() : fallbackUuid();
  }

  function generate() {
    var count = Math.max(1, Math.min(100, Number(countInput.value) || 1));
    countInput.value = String(count);
    var values = [];
    for (var index = 0; index < count; index += 1) {
      values.push(createUuid());
    }
    lastOutput = values.join("\n");
    output.textContent = lastOutput;
    inputMeta.textContent = count + " UUID" + (count === 1 ? "" : "s");
    window.DevKit.setStatus(statusMessage, "ok", "Generated");
    window.DevKit.renderMetrics(metrics, [
      { label: "Count", value: String(count) },
      { label: "Version", value: "v4" },
      { label: "Source", value: "Crypto" },
      { label: "Format", value: "RFC 4122" }
    ]);
  }

  document.addEventListener("click", function (event) {
    var actionButton = event.target.closest("[data-action]");
    if (!actionButton) {
      return;
    }
    if (actionButton.dataset.action === "generate") {
      generate();
    }
    if (actionButton.dataset.action === "copy") {
      window.DevKit.copyText(lastOutput).then(function () {
        window.DevKit.setStatus(statusMessage, "ok", "Copied");
      });
    }
  });
  countInput.addEventListener("input", window.DevKit.debounce(generate, 120));
  generate();
})();

