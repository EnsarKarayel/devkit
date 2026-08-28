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
      mode: "data",
      description: "Format, lint and clean the payload or code sample you are actively debugging.",
      links: [
        { label: "JSON Formatter", href: "index.html", icon: "{ }", description: "Format, minify, validate and inspect JSON tree output." },
        { label: "XML Formatter", href: "xml-formatter.html", icon: "</>", description: "Beautify XML and catch malformed structure before integration tests." },
        { label: "YAML Formatter", href: "yaml-formatter.html", icon: "Y", description: "Clean indentation for CI, Docker, Kubernetes and config files." },
        { label: "SQL Formatter", href: "sql-formatter.html", icon: "SQL", description: "Make long queries readable before review or debugging." },
        { label: "Python Formatter", href: "python-formatter.html", icon: "PY", description: "Normalize indentation and whitespace in Python snippets." },
        { label: "Python Indent Fixer", href: "python-indentation-fixer.html", icon: "TAB", description: "Fix mixed tabs and spaces before Python raises indentation errors." }
      ]
    },
    {
      title: "Regex Lab",
      mode: "regex",
      description: "Test patterns, capture groups and validation expressions with focused examples.",
      links: [
        { label: "Regex Matcher", href: "regex-tester.html", icon: ".*", description: "Run JavaScript regex patterns against sample text." },
        { label: "Regex Guide", href: "regex-matcher.html", icon: "RX", description: "Learn matcher behavior, flags and parser tradeoffs." },
        { label: "Regex Examples", href: "regex-examples.html", icon: "EX", description: "Review practical validation and extraction patterns." },
        { label: "Email Regex", href: "regex-email-validator.html", icon: "@", description: "Compare realistic email validation cases." },
        { label: "URL Regex", href: "regex-url-validator.html", icon: "URL", description: "Check link-shaped strings before parser-level validation." },
        { label: "UUID Regex", href: "regex-uuid-validator.html", icon: "ID", description: "Validate UUID v4 version and variant characters." },
        { label: "Date Regex", href: "regex-date-validator.html", icon: "DATE", description: "Understand date pattern limits before calendar parsing." },
        { label: "Log Parser", href: "regex-log-parser.html", icon: "LOG", description: "Extract timestamps, levels and messages from logs." }
      ]
    },
    {
      title: "Inspect & Convert",
      mode: "data",
      description: "Compare, decode, encode and generate values without leaving the browser.",
      links: [
        { label: "JSON Diff", href: "json-diff.html", icon: "DIFF", description: "Compare two JSON payloads field by field." },
        { label: "JSON Schema", href: "json-schema-generator.html", icon: "SCH", description: "Infer a starting schema from sample JSON." },
        { label: "CSV to JSON", href: "csv-to-json.html", icon: "CSV", description: "Convert tabular text into JSON arrays." },
        { label: "Base64", href: "base64-encoder-decoder.html", icon: "64", description: "Encode and decode UTF-8 Base64 strings." },
        { label: "URL Encode", href: "url-encoder-decoder.html", icon: "URL", description: "Escape query values and decode percent-encoded text." },
        { label: "Hash Generator", href: "hash-generator.html", icon: "#", description: "Create SHA digests for browser-side text samples." },
        { label: "UUID Generator", href: "uuid-generator.html", icon: "ID", description: "Generate UUID v4 identifiers quickly." },
        { label: "Color Converter", href: "color-converter.html", icon: "RGB", description: "Convert HEX, RGB and HSL values." }
      ]
    },
    {
      title: "API Debugging",
      mode: "api",
      description: "Use when a request fails and you need status, headers, tokens, timing and incident notes.",
      links: [
        { label: "API Checklist", href: "api-debugging-checklist.html", icon: "FIX", description: "Track request identity, auth, payload, logs and fix notes." },
        { label: "HTTP Status", href: "http-status-codes.html", icon: "HTTP", description: "Search status codes and debugging meaning." },
        { label: "HTTP Headers", href: "http-headers-reference.html", icon: "HDR", description: "Review cache, CORS, auth and security headers." },
        { label: "JWT Decoder", href: "jwt-decoder.html", icon: "JWT", description: "Decode token headers, claims and expiration values." },
        { label: "Timestamp", href: "timestamp-converter.html", icon: "TIME", description: "Convert Unix and ISO timestamps while debugging logs." },
        { label: "Cron Parser", href: "cron-expression-parser.html", icon: "CRON", description: "Explain schedules and preview upcoming runs." }
      ]
    },
    {
      title: "Reference",
      mode: "learn",
      description: "Read original guides that explain when each formatter, linter or validator is the right tool.",
      links: [
        { label: "All Tools", href: "tools.html", icon: "ALL", description: "Browse the complete Formalint tool directory." },
        { label: "Guides", href: "guides.html", icon: "DOC", description: "Start from the full reference library." },
        { label: "Complete Regex Guide", href: "complete-regex-guide.html", icon: "RX", description: "Learn regex fundamentals and testing discipline." },
        { label: "Data Formats Guide", href: "data-formats-guide.html", icon: "FMT", description: "Compare JSON, XML and YAML tradeoffs." },
        { label: "API Handbook", href: "api-debugging-handbook.html", icon: "API", description: "Follow a repeatable API debugging process." },
        { label: "Data Validation", href: "developer-data-validation-guide.html", icon: "VAL", description: "Separate syntax checks from business validation." },
        { label: "Formatter vs Linter", href: "formatter-linter-validator-guide.html", icon: "LINT", description: "Understand formatter, linter and validator responsibilities." },
        { label: "Safe Tools", href: "safe-online-dev-tools.html", icon: "SEC", description: "Know what not to paste into online utilities." },
        { label: "How Formalint Works", href: "how-formalint-works.html", icon: "OPS", description: "Read privacy, local-first and maintenance notes." }
      ]
    }
  ];

  var railModes = [
    {
      mode: "data",
      icon: "{ }",
      label: "Data tools",
      description: "Format, convert and inspect structured data.",
      tip: "Start here when a payload is hard to read, compare or validate.",
      href: "index.html",
      workflow: [
        "Paste only safe sample data, not secrets or customer records.",
        "Format or lint the payload before changing business logic.",
        "Compare schema, diff or conversion output when structure looks suspicious.",
        "Copy the clean result back into your local editor and review it there."
      ]
    },
    {
      mode: "regex",
      icon: ".*",
      label: "Regex lab",
      description: "Test patterns and validation examples.",
      tip: "Use this mode to check matches, groups, edge cases and realistic validation limits.",
      href: "regex-tester.html",
      workflow: [
        "Write the smallest pattern that proves the exact match you need.",
        "Test valid, invalid, empty and long examples before using it in production.",
        "Check capture groups separately from the full match.",
        "Move strict business validation into code when regex becomes too clever."
      ]
    },
    {
      mode: "api",
      icon: "API",
      label: "API debugging",
      description: "Debug status codes, headers, tokens and schedules.",
      tip: "Use this mode when a request fails and you need repeatable incident notes.",
      href: "api-debugging-checklist.html",
      workflow: [
        "Record method, URL, status code, correlation id and environment first.",
        "Check authentication, headers, payload shape and retry behavior separately.",
        "Decode timestamps or JWT claims only from safe non-sensitive samples.",
        "Write the final cause and fix note so the issue is searchable later."
      ]
    },
    {
      mode: "learn",
      icon: "?",
      label: "Guides",
      description: "Open original guides and safety references.",
      tip: "Use this mode when you need the why behind a formatter, linter or validator.",
      href: "guides.html",
      workflow: [
        "Choose the guide that matches the decision you are making.",
        "Confirm whether you need formatting, linting, parsing or validation.",
        "Use the safety guidance before pasting data into any web tool.",
        "Return to the matching Formalint tool once the workflow is clear."
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
      '<span class="sidebar-link-copy"><span>' +
      escapeHtml(link.label) +
      "</span><small>" +
      escapeHtml(link.description || "") +
      "</small></span>" +
      "</a>"
    );
  }

  function detectInitialMode(pageName) {
    var matchedMode = "data";
    sidebarGroups.forEach(function (group) {
      group.links.forEach(function (link) {
        if (link.href === pageName) {
          matchedMode = group.mode;
        }
      });
    });
    return matchedMode;
  }

  function modeDetails(mode) {
    return (
      railModes.filter(function (item) {
        return item.mode === mode;
      })[0] || railModes[0]
    );
  }

  function activateRailMode(mode, sidebar) {
    var root = sidebar || document.querySelector(".app-sidebar");
    if (!root) {
      return;
    }

    root.setAttribute("data-active-mode", mode);
    $$(".rail-mark", root).forEach(function (button) {
      var isActive = button.getAttribute("data-rail-mode") === mode;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    $$(".sidebar-group", root).forEach(function (group) {
      var isActiveGroup = group.getAttribute("data-sidebar-mode") === mode;
      group.classList.toggle("mode-focused", isActiveGroup);
    });

    var details = modeDetails(mode);
    var modeCard = $(".sidebar-mode-card", root);
    if (modeCard) {
      modeCard.innerHTML =
        '<span class="mode-kicker">Active mode</span>' +
        "<strong>" +
        escapeHtml(details.label) +
        "</strong>" +
        "<p>" +
        escapeHtml(details.tip) +
        "</p>" +
        '<div class="sidebar-mode-actions">' +
        '<a href="' +
        escapeHtml(details.href) +
        '">Open starter</a>' +
        '<button type="button" data-copy-workflow="' +
        escapeHtml(details.mode) +
        '">Copy workflow</button>' +
        "</div>";
    }

    var activeGroup = $('.sidebar-group[data-sidebar-mode="' + mode + '"]', root);
    if (activeGroup && root.querySelector(".sidebar-panel")) {
      activeGroup.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function workflowText(mode) {
    var details = modeDetails(mode);
    return (
      details.label +
      " workflow\n" +
      details.workflow
        .map(function (step, index) {
          return index + 1 + ". " + step;
        })
        .join("\n")
    );
  }

  function filterSidebarLinks(sidebar, query) {
    var normalized = String(query || "").trim().toLowerCase();
    var visibleCount = 0;

    $$(".sidebar-link", sidebar).forEach(function (link) {
      var haystack = link.textContent.toLowerCase();
      var isVisible = !normalized || haystack.indexOf(normalized) !== -1;
      link.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    $$(".sidebar-group", sidebar).forEach(function (group) {
      var hasVisibleLink = $$(".sidebar-link", group).some(function (link) {
        return !link.hidden;
      });
      group.hidden = Boolean(normalized && !hasVisibleLink);
    });

    var empty = $(".sidebar-search-empty", sidebar);
    if (empty) {
      empty.hidden = !normalized || visibleCount > 0;
    }

    var count = $(".sidebar-search-count", sidebar);
    if (count) {
      count.textContent = normalized ? visibleCount + " matches" : "Search 37 tools and guides";
    }

    var modeCard = $(".sidebar-mode-card", sidebar);
    if (modeCard && normalized) {
      modeCard.innerHTML =
        '<span class="mode-kicker">Search results</span>' +
        "<strong>" +
        visibleCount +
        " matching resources</strong>" +
        "<p>Search checks tool names and short explanations, so you can jump from a debugging symptom to the right Formalint page faster.</p>";
    } else if (modeCard) {
      activateRailMode(sidebar.getAttribute("data-active-mode") || "data", sidebar);
    }
  }

  function initAppSidebar() {
    if (document.querySelector(".app-sidebar")) {
      document.body.classList.add("with-app-sidebar");
      return;
    }

    var pageName = currentPageName();
    var activeMode = detectInitialMode(pageName);
    var sidebar = document.createElement("aside");
    sidebar.className = "app-sidebar";
    sidebar.setAttribute("aria-label", "Formalint workspace navigation");
    sidebar.innerHTML =
      '<div class="sidebar-rail" aria-label="Workspace modes">' +
      railModes
        .map(function (item) {
          return (
            '<button class="rail-mark" type="button" data-rail-mode="' +
            escapeHtml(item.mode) +
            '" aria-pressed="false" title="' +
            escapeHtml(item.label + " - " + item.description) +
            '"><span aria-hidden="true">' +
            escapeHtml(item.icon) +
            '</span><span class="sr-only">' +
            escapeHtml(item.label) +
            "</span></button>"
          );
        })
        .join("") +
      "</div>" +
      '<nav class="sidebar-panel">' +
      '<div class="sidebar-brandline"><strong>Formalint</strong><span>Developer console</span><p>Choose a mode on the left, then open the exact tool or guide for the debugging task.</p></div>' +
      '<div class="sidebar-search"><label for="formalintSidebarSearch">Find a tool</label><input id="formalintSidebarSearch" type="search" autocomplete="off" placeholder="Search JSON, regex, JWT..."><span class="sidebar-search-count">Search 37 tools and guides</span></div>' +
      '<div class="sidebar-mode-card" aria-live="polite"></div>' +
      sidebarGroups
        .map(function (group) {
          return (
            '<section class="sidebar-group" data-sidebar-mode="' +
            escapeHtml(group.mode) +
            '">' +
            "<h2>" +
            escapeHtml(group.title) +
            "</h2>" +
            "<p>" +
            escapeHtml(group.description) +
            "</p>" +
            group.links
              .map(function (link) {
                return buildSidebarLink(link, pageName);
              })
              .join("") +
            "</section>"
          );
        })
        .join("") +
      '<p class="sidebar-search-empty" hidden>No matching Formalint tool yet. Try JSON, regex, API, JWT, YAML or SQL.</p>' +
      '<div class="sidebar-footer"><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a></div>' +
      "</nav>";

    var header = document.querySelector(".site-header");
    document.body.insertBefore(sidebar, header ? header.nextSibling : document.body.firstChild);
    document.body.classList.add("with-app-sidebar");
    $$(".rail-mark", sidebar).forEach(function (button) {
      button.addEventListener("click", function () {
        var search = $("#formalintSidebarSearch", sidebar);
        if (search) {
          search.value = "";
          filterSidebarLinks(sidebar, "");
        }
        activateRailMode(button.getAttribute("data-rail-mode"), sidebar);
      });
    });
    var searchInput = $("#formalintSidebarSearch", sidebar);
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        debounce(function () {
          filterSidebarLinks(sidebar, searchInput.value);
        }, 80)
      );
    }
    sidebar.addEventListener("click", function (event) {
      var target = event.target && event.target.closest ? event.target.closest("[data-copy-workflow]") : null;
      if (!target) {
        return;
      }
      var mode = target.getAttribute("data-copy-workflow");
      copyText(workflowText(mode)).then(function () {
        var oldText = target.textContent;
        target.textContent = "Copied";
        window.setTimeout(function () {
          target.textContent = oldText;
        }, 1300);
      });
    });
    document.addEventListener("keydown", function (event) {
      var tagName = event.target && event.target.tagName;
      var isTyping = tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
      if (event.key === "/" && !isTyping && searchInput) {
        event.preventDefault();
        searchInput.focus();
      }
    });
    activateRailMode(activeMode, sidebar);
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

