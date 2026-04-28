(function () {
  "use strict";

  if (document.body.dataset.tool !== "color") {
    return;
  }

  var $ = window.DevKit.$;
  var escapeHtml = window.DevKit.escapeHtml;
  var input = $("#colorInput");
  var output = $("#colorOutput");
  var swatch = $("#colorSwatch");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function parseColor(value) {
    var text = value.trim();
    var hex = text.match(/^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/);
    if (hex) {
      var raw = hex[1];
      if (raw.length === 3) {
        raw = raw.split("").map(function (char) { return char + char; }).join("");
      }
      return {
        r: parseInt(raw.slice(0, 2), 16),
        g: parseInt(raw.slice(2, 4), 16),
        b: parseInt(raw.slice(4, 6), 16)
      };
    }

    var rgb = text.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
    if (rgb) {
      return {
        r: clamp(Number(rgb[1]), 0, 255),
        g: clamp(Number(rgb[2]), 0, 255),
        b: clamp(Number(rgb[3]), 0, 255)
      };
    }

    var hsl = text.match(/^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i);
    if (hsl) {
      return hslToRgb(Number(hsl[1]), Number(hsl[2]), Number(hsl[3]));
    }
    throw new Error("Enter HEX, rgb(r,g,b), or hsl(h,s%,l%).");
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m = l - c / 2;
    var temp = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return {
      r: Math.round((temp[0] + m) * 255),
      g: Math.round((temp[1] + m) * 255),
      b: Math.round((temp[2] + m) * 255)
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0;
    var s = 0;
    var l = (max + min) / 2;
    var d = max - min;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
    }
    return {
      h: Math.round((h + 360) % 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function toHexPart(value) {
    return value.toString(16).padStart(2, "0");
  }

  function highlightJson(text) {
    return escapeHtml(text).replace(/(&quot;.*?&quot;(\s*:)?|-?\d+)/g, function (match) {
      var className = /^&quot;/.test(match) ? (/:$/.test(match) ? "token-key" : "token-string") : "token-number";
      return '<span class="' + className + '">' + match + "</span>";
    });
  }

  function convert() {
    try {
      var rgb = parseColor(input.value);
      var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      var hex = "#" + toHexPart(rgb.r) + toHexPart(rgb.g) + toHexPart(rgb.b);
      var result = {
        hex: hex,
        rgb: "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")",
        hsl: "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)",
        channels: rgb
      };
      swatch.style.background = hex;
      lastOutput = JSON.stringify(result, null, 2);
      output.innerHTML = highlightJson(lastOutput);
      inputMeta.textContent = hex;
      window.DevKit.setStatus(statusMessage, "ok", "Converted");
      window.DevKit.renderMetrics(metrics, [
        { label: "HEX", value: hex },
        { label: "Red", value: String(rgb.r) },
        { label: "Green", value: String(rgb.g) },
        { label: "Blue", value: String(rgb.b) }
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
      input.value = "#0f8b8d";
      convert();
    }
    if (action === "clear") {
      input.value = "";
      output.textContent = "";
      swatch.style.background = "";
      lastOutput = "";
      inputMeta.textContent = "Ready";
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
  input.addEventListener("input", window.DevKit.debounce(convert, 160));
  input.value = "#0f8b8d";
  convert();
})();

