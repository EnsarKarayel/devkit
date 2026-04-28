(function () {
  "use strict";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function byteSize(value) {
    var text = String(value || "");
    if (window.TextEncoder) {
      return new TextEncoder().encode(text).length;
    }
    return unescape(encodeURIComponent(text)).length;
  }

  function formatBytes(value) {
    var bytes = byteSize(value);
    if (bytes < 1024) {
      return bytes + " bytes";
    }
    return (bytes / 1024).toFixed(1) + " KB";
  }

  function lineCount(value) {
    var text = String(value || "");
    if (!text) {
      return 0;
    }
    return text.split(/\r\n|\r|\n/).length;
  }

  function setStatus(element, type, message) {
    if (!element) {
      return;
    }
    element.classList.remove("status-ok", "status-error");
    if (type === "ok") {
      element.classList.add("status-ok");
    }
    if (type === "error") {
      element.classList.add("status-error");
    }
    element.textContent = message;
  }

  function renderMetrics(element, items) {
    if (!element) {
      return;
    }
    element.innerHTML = items
      .map(function (item) {
        return (
          '<div class="metric"><b>' +
          escapeHtml(item.value) +
          "</b><span>" +
          escapeHtml(item.label) +
          "</span></div>"
        );
      })
      .join("");
  }

  function downloadText(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function copyText(content) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(content);
    }

    var textarea = document.createElement("textarea");
    textarea.value = content;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return Promise.resolve();
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var args = arguments;
      var context = this;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  window.DevKit = {
    $: $,
    $$: $$,
    escapeHtml: escapeHtml,
    byteSize: byteSize,
    formatBytes: formatBytes,
    lineCount: lineCount,
    setStatus: setStatus,
    renderMetrics: renderMetrics,
    downloadText: downloadText,
    copyText: copyText,
    debounce: debounce
  };
})();

