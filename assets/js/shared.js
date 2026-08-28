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

  var sidebarGroups = [
    {
      title: "Workspace",
      links: [
        { label: "JSON Formatter", href: "index.html", icon: "{ }" },
        { label: "Regex Matcher", href: "regex-tester.html", icon: ".*" },
        { label: "XML Formatter", href: "xml-formatter.html", icon: "</>" },
        { label: "YAML Formatter", href: "yaml-formatter.html", icon: "Y" },
        { label: "SQL Formatter", href: "sql-formatter.html", icon: "SQL" },
        { label: "Python Formatter", href: "python-formatter.html", icon: "PY" }
      ]
    },
    {
      title: "Inspect",
      links: [
        { label: "JSON Diff", href: "json-diff.html", icon: "DIFF" },
        { label: "JSON Schema", href: "json-schema-generator.html", icon: "SCH" },
        { label: "HTTP Status", href: "http-status-codes.html", icon: "HTTP" },
        { label: "HTTP Headers", href: "http-headers-reference.html", icon: "HDR" },
        { label: "JWT Decoder", href: "jwt-decoder.html", icon: "JWT" },
        { label: "Cron Parser", href: "cron-expression-parser.html", icon: "CRON" }
      ]
    },
    {
      title: "Convert",
      links: [
        { label: "Base64", href: "base64-encoder-decoder.html", icon: "64" },
        { label: "URL Encode", href: "url-encoder-decoder.html", icon: "URL" },
        { label: "Hash Generator", href: "hash-generator.html", icon: "#" },
        { label: "UUID Generator", href: "uuid-generator.html", icon: "ID" },
        { label: "CSV to JSON", href: "csv-to-json.html", icon: "CSV" },
        { label: "Color Converter", href: "color-converter.html", icon: "RGB" }
      ]
    },
    {
      title: "Reference",
      links: [
        { label: "All Tools", href: "tools.html", icon: "ALL" },
        { label: "Guides", href: "guides.html", icon: "DOC" },
        { label: "Regex Guide", href: "complete-regex-guide.html", icon: "RX" },
        { label: "API Handbook", href: "api-debugging-handbook.html", icon: "API" },
        { label: "Safe Tools", href: "safe-online-dev-tools.html", icon: "SEC" },
        { label: "About", href: "about.html", icon: "i" }
      ]
    }
  ];

  function currentPageName() {
    var path = window.location.pathname.split("/").pop();
    return path || "index.html";
  }

  function buildSidebarLink(link, pageName) {
    var isActive = link.href === pageName || (pageName === "" && link.href === "index.html");
    return (
      '<a class="sidebar-link' +
      (isActive ? " active" : "") +
      '" href="' +
      escapeHtml(link.href) +
      '">' +
      '<span class="sidebar-icon" aria-hidden="true">' +
      escapeHtml(link.icon) +
      "</span>" +
      "<span>" +
      escapeHtml(link.label) +
      "</span>" +
      "</a>"
    );
  }

  function initAppSidebar() {
    if (document.querySelector(".app-sidebar")) {
      document.body.classList.add("with-app-sidebar");
      return;
    }

    var pageName = currentPageName();
    var sidebar = document.createElement("aside");
    sidebar.className = "app-sidebar";
    sidebar.setAttribute("aria-label", "Formalint workspace navigation");
    sidebar.innerHTML =
      '<div class="sidebar-rail" aria-hidden="true">' +
      '<span class="rail-mark active">{ }</span>' +
      '<span class="rail-mark">.*</span>' +
      '<span class="rail-mark">API</span>' +
      '<span class="rail-mark">?</span>' +
      "</div>" +
      '<nav class="sidebar-panel">' +
      '<div class="sidebar-brandline"><strong>Formalint</strong><span>Developer console</span></div>' +
      sidebarGroups
        .map(function (group) {
          return (
            '<section class="sidebar-group">' +
            "<h2>" +
            escapeHtml(group.title) +
            "</h2>" +
            group.links
              .map(function (link) {
                return buildSidebarLink(link, pageName);
              })
              .join("") +
            "</section>"
          );
        })
        .join("") +
      '<div class="sidebar-footer"><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a></div>' +
      "</nav>";

    var header = document.querySelector(".site-header");
    document.body.insertBefore(sidebar, header ? header.nextSibling : document.body.firstChild);
    document.body.classList.add("with-app-sidebar");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAppSidebar);
  } else {
    initAppSidebar();
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

