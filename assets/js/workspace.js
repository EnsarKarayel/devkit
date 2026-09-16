(function () {
  "use strict";

  var input = document.querySelector("[data-json-input]");
  var output = document.querySelector("[data-inspector-output]");
  var status = document.querySelector("[data-json-status]");
  var activePath = document.querySelector("[data-active-path]");
  var currentView = "tree";
  var parsed = null;

  var samples = {
    user: { id: "usr_2048", name: "Ada Lovelace", email: "ada@formalint.dev", roles: ["engineer", "reviewer"], auth_token: "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c3JfMjA0OCIsInJvbGUiOiJlbmdpbmVlciJ9.", meta: { active: true, last_login: "2026-09-15T08:42:10Z" } },
    commerce: { order_id: "ord_9134", currency: "USD", total: 149.9, records: [{ sku: "DEV-101", quantity: 2, price: 49.95 }, { sku: "API-204", quantity: 1, price: 50 }], meta: { paid: true, channel: "web" } },
    kubernetes: { apiVersion: "v1", kind: "Pod", metadata: { name: "formalint-worker", labels: { app: "formatter" } }, spec: { containers: [{ name: "worker", image: "formalint/worker:2.4.0", ports: [{ containerPort: 8080 }] }] } }
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]; });
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(value);
    var helper = document.createElement("textarea"); helper.value = value; document.body.appendChild(helper); helper.select(); document.execCommand("copy"); helper.remove(); return Promise.resolve();
  }

  function parseInput() {
    try {
      parsed = JSON.parse(input.value);
      status.className = "editor-status status-ok";
      status.firstElementChild.textContent = "No errors detected. RFC 8259 compliant.";
      return parsed;
    } catch (error) {
      parsed = null;
      status.className = "editor-status status-error";
      status.firstElementChild.textContent = error.message;
      output.innerHTML = '<div class="empty-inspector"><strong>JSON cannot be inspected yet</strong><p>' + escapeHtml(error.message) + "</p></div>";
      return null;
    }
  }

  function valueType(value) {
    if (Array.isArray(value)) return "Array[" + value.length + "]";
    if (value === null) return "null";
    if (typeof value === "object") return "Object";
    if (typeof value === "string") return "str";
    if (typeof value === "number") return "num";
    if (typeof value === "boolean") return "bool";
    return typeof value;
  }

  function pathFor(parent, key, isArray) {
    return isArray ? parent + "[" + key + "]" : parent + "." + key;
  }

  function treeNode(key, value, path, depth, parentArray) {
    var type = valueType(value);
    var branch = value !== null && typeof value === "object";
    var nodePath = key === "root" ? "$" : pathFor(path, key, parentArray);
    var smart = /token|jwt|auth|secret/i.test(String(key)) && typeof value === "string" ? '<span class="smart-action" role="button" tabindex="0" data-smart-action="jwt" data-smart-value="' + escapeHtml(value) + '">JWT Inspector</span><span class="smart-action" role="button" tabindex="0" data-smart-action="base64" data-smart-value="' + escapeHtml(value) + '">Base64</span>' : "";
    if (!branch) return '<button class="tree-row" style="--depth:' + depth + '" type="button" data-json-path="' + escapeHtml(nodePath) + '"><span class="tree-spacer"></span><b>' + escapeHtml(key) + '</b><span class="tree-value ' + typeof value + '">' + escapeHtml(JSON.stringify(value)) + '</span><em>' + type + "</em>" + smart + "</button>";
    var children = Object.keys(value).map(function (child) { return treeNode(child, value[child], nodePath, depth + 1, Array.isArray(value)); }).join("");
    return '<details class="tree-branch" open><summary class="tree-row" style="--depth:' + depth + '" data-json-path="' + escapeHtml(nodePath) + '"><span class="tree-chevron"></span><b>' + escapeHtml(key) + '</b><em>' + type + "</em></summary><div>" + children + "</div></details>";
  }

  function inferSchema(value) {
    if (Array.isArray(value)) return { type: "array", items: value.length ? inferSchema(value[0]) : {} };
    if (value === null) return { type: "null" };
    if (typeof value === "object") {
      var properties = {}; Object.keys(value).forEach(function (key) { properties[key] = inferSchema(value[key]); });
      return { type: "object", properties: properties, required: Object.keys(value) };
    }
    return { type: typeof value === "number" && Number.isInteger(value) ? "integer" : typeof value };
  }

  function tsType(value, name) {
    if (Array.isArray(value)) return value.length ? tsType(value[0], name) + "[]" : "unknown[]";
    if (value === null) return "null";
    if (typeof value !== "object") return typeof value;
    return "{\n" + Object.keys(value).map(function (key) { return "  " + key + ": " + tsType(value[key], key) + ";"; }).join("\n") + "\n}";
  }

  function toYaml(value, depth) {
    var pad = "  ".repeat(depth || 0);
    if (Array.isArray(value)) return value.map(function (item) { return pad + "- " + (typeof item === "object" ? "\n" + toYaml(item, (depth || 0) + 1) : String(item)); }).join("\n");
    if (value && typeof value === "object") return Object.keys(value).map(function (key) { var item = value[key]; return pad + key + ":" + (item && typeof item === "object" ? "\n" + toYaml(item, (depth || 0) + 1) : " " + JSON.stringify(item)); }).join("\n");
    return pad + String(value);
  }

  function toXml(value, key) {
    var tag = String(key || "root").replace(/[^a-zA-Z0-9_-]/g, "_");
    if (Array.isArray(value)) return value.map(function (item) { return toXml(item, "item"); }).join("");
    if (value && typeof value === "object") return "<" + tag + ">" + Object.keys(value).map(function (child) { return toXml(value[child], child); }).join("") + "</" + tag + ">";
    return "<" + tag + ">" + escapeHtml(value === null ? "" : value) + "</" + tag + ">";
  }

  function render(view) {
    currentView = view || currentView;
    var data = parseInput(); if (data === null) return;
    document.querySelectorAll("[data-view]").forEach(function (button) { button.classList.toggle("active", button.dataset.view === currentView); });
    if (currentView === "tree") output.innerHTML = '<div class="tree-view">' + treeNode("root", data, "", 0, false) + "</div>";
    if (currentView === "code") output.innerHTML = '<pre class="generated-code"><code>' + escapeHtml(JSON.stringify(data, null, 2)) + "</code></pre>";
    if (currentView === "typescript") output.innerHTML = '<pre class="generated-code"><code>export interface Root ' + escapeHtml(tsType(data, "Root")) + "</code></pre>";
    if (currentView === "schema") output.innerHTML = '<pre class="generated-code"><code>' + escapeHtml(JSON.stringify({ "$schema": "https://json-schema.org/draft/2020-12/schema", title: "Root", "type": inferSchema(data).type, properties: inferSchema(data).properties, required: inferSchema(data).required }, null, 2)) + "</code></pre>";
  }

  function updateLines() {
    var count = Math.max(1, input.value.split("\n").length); document.querySelector("[data-line-numbers]").textContent = Array.from({ length: count }, function (_, index) { return String(index + 1).padStart(2, "0"); }).join("\n");
    var before = input.value.slice(0, input.selectionStart).split("\n"); document.querySelector("[data-editor-position]").textContent = "Ln " + before.length + ", Col " + (before[before.length - 1].length + 1);
    updateHighlight();
  }

  function updateHighlight() {
    var source = input.value || " "; var highlighted = ""; var lastIndex = 0;
    var tokenPattern = /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)/gi; var match;
    while ((match = tokenPattern.exec(source))) {
      highlighted += escapeHtml(source.slice(lastIndex, match.index));
      var className = match[1] ? "json-key" : match[2] ? "json-string" : match[3] ? "json-literal" : "json-number";
      highlighted += '<span class="' + className + '">' + escapeHtml(match[0]) + "</span>";
      lastIndex = tokenPattern.lastIndex;
    }
    highlighted += escapeHtml(source.slice(lastIndex));
    document.querySelector("[data-code-highlight]").innerHTML = highlighted + (input.value.endsWith("\n") ? "\n " : "");
  }

  function formatJson() { var data = parseInput(); if (data !== null) { input.value = JSON.stringify(data, null, 2); updateLines(); render(); } }
  function sorted(value) { if (Array.isArray(value)) return value.map(sorted); if (value && typeof value === "object") return Object.keys(value).sort().reduce(function (result, key) { result[key] = sorted(value[key]); return result; }, {}); return value; }
  function showGenerated(title, content) { output.innerHTML = '<div class="generated-heading"><strong>' + escapeHtml(title) + '</strong><button type="button" data-copy-generated>Copy result</button></div><pre class="generated-code"><code>' + escapeHtml(content) + "</code></pre>"; output.querySelector("[data-copy-generated]").addEventListener("click", function () { copyText(content); }); }

  function decodeBase64Url(value) {
    var normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4) normalized += "=";
    return decodeURIComponent(Array.from(atob(normalized)).map(function (char) { return "%" + char.charCodeAt(0).toString(16).padStart(2, "0"); }).join(""));
  }

  document.addEventListener("click", function (event) {
    var smartAction = event.target.closest("[data-smart-action]");
    if (smartAction) {
      event.preventDefault(); event.stopPropagation();
      try {
        var value = smartAction.dataset.smartValue;
        if (smartAction.dataset.smartAction === "jwt") {
          var parts = value.split(".");
          showGenerated("Decoded JWT header and payload (signature not verified)", JSON.stringify({ header: JSON.parse(decodeBase64Url(parts[0])), payload: JSON.parse(decodeBase64Url(parts[1])) }, null, 2));
        } else {
          showGenerated("Base64 decoded value", decodeBase64Url(value.split(".")[1] || value));
        }
      } catch (error) { showGenerated("Decode result", "This value is not valid Base64 or JWT data: " + error.message); }
      return;
    }
    var button = event.target.closest("button, summary"); if (!button) return;
    if (button.matches("[data-format]")) formatJson();
    if (button.matches("[data-clear]")) { input.value = ""; updateLines(); render(); }
    if (button.matches("[data-sort]")) { var data = parseInput(); if (data !== null) { input.value = JSON.stringify(sorted(data), null, 2); formatJson(); } }
    if (button.matches("[data-preset]")) { input.value = JSON.stringify(samples[button.dataset.preset], null, 2); formatJson(); }
    if (button.matches("[data-view]")) render(button.dataset.view);
    if (button.matches("[data-json-path]")) { activePath.textContent = button.dataset.jsonPath; document.querySelectorAll("[data-json-path]").forEach(function (row) { row.classList.toggle("selected", row === button); }); }
    if (button.matches("[data-copy-path]")) copyText(activePath.textContent);
    if (button.matches("[data-copy-output]")) copyText(output.textContent);
    if (button.matches("[data-export]")) { var blob = new Blob([input.value], { type: "application/json" }); var link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "formalint-payload.json"; link.click(); URL.revokeObjectURL(link.href); }
    if (button.matches("[data-transform]")) { var data = parseInput(); if (data === null) return; var kind = button.dataset.transform; if (kind === "minify") { input.value = JSON.stringify(data); updateLines(); render("code"); } if (kind === "yaml") showGenerated("YAML output", toYaml(data, 0)); if (kind === "typescript") showGenerated("TypeScript interface", "export interface Root " + tsType(data, "Root")); if (kind === "xml") showGenerated("XML output", '<?xml version="1.0" encoding="UTF-8"?>\n' + toXml(data, "root")); }
    if (button.matches("[data-layout]")) { document.querySelector("[data-editor-workspace]").classList.toggle("unified", button.dataset.layout === "unified"); document.querySelectorAll("[data-layout]").forEach(function (item) { item.classList.toggle("active", item === button); }); }
    if (button.matches("[data-focus-widget]")) document.querySelector('[data-widget="' + button.dataset.focusWidget + '"]').scrollIntoView({ behavior: "smooth", block: "center" });
    if (button.matches("[data-command-open]")) { document.querySelector("[data-command-dialog]").showModal(); document.querySelector("[data-command-search]").focus(); }
  });

  input.addEventListener("input", function () { updateLines(); window.clearTimeout(input._timer); input._timer = window.setTimeout(function () { render(); }, 180); });
  input.addEventListener("keydown", function (event) {
    var pairs = { "{": "}", "[": "]", '"': '"' };
    if (!pairs[event.key]) return;
    var start = input.selectionStart; var end = input.selectionEnd; var selected = input.value.slice(start, end);
    if (event.key === '"' && input.value.charAt(start) === '"' && start === end) { event.preventDefault(); input.setSelectionRange(start + 1, start + 1); return; }
    event.preventDefault(); input.setRangeText(event.key + selected + pairs[event.key], start, end, "end"); input.setSelectionRange(start + 1, start + 1 + selected.length); input.dispatchEvent(new Event("input"));
  });
  input.addEventListener("keyup", updateLines); input.addEventListener("click", updateLines); input.addEventListener("scroll", function () { document.querySelector("[data-line-numbers]").scrollTop = input.scrollTop; var highlight = document.querySelector("[data-code-highlight]"); highlight.scrollTop = input.scrollTop; highlight.scrollLeft = input.scrollLeft; });
  document.querySelector("[data-load-file]").addEventListener("change", function (event) { var file = event.target.files[0]; if (!file || file.size > 2 * 1024 * 1024) return; file.text().then(function (text) { input.value = text; formatJson(); }); });
  document.querySelector("[data-paste]").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.readText().then(function (text) { input.value = text; formatJson(); }); });

  var regexPattern = document.querySelector("[data-regex-pattern]"); var regexText = document.querySelector("[data-regex-text]");
  function runRegex() { try { var expression = new RegExp(regexPattern.value, "gi"); var matches = Array.from(regexText.value.matchAll(expression)); document.querySelector("[data-regex-count]").textContent = matches.length + (matches.length === 1 ? " match" : " matches"); document.querySelector("[data-regex-result]").textContent = matches.length ? matches.slice(0, 4).map(function (match) { return match[0]; }).join(" | ") : "No matches in the current target."; } catch (error) { document.querySelector("[data-regex-result]").textContent = error.message; } }
  regexPattern.addEventListener("input", runRegex); regexText.addEventListener("input", runRegex);

  var epochInput = document.querySelector("[data-epoch-input]"); var isoInput = document.querySelector("[data-iso-input]");
  function setRelativeTime(date) { var days = Math.round((date.getTime() - Date.now()) / 86400000); document.querySelector("[data-relative-time]").textContent = days === 0 ? "Today" : Math.abs(days) + " days " + (days < 0 ? "ago" : "from now"); }
  function convertEpoch() { var value = Number(epochInput.value.trim()); var date = new Date(value < 100000000000 ? value * 1000 : value); if (isNaN(date.getTime())) { isoInput.value = "Invalid timestamp"; return; } isoInput.value = date.toISOString(); setRelativeTime(date); }
  function convertIso() { var date = new Date(isoInput.value.trim()); if (isNaN(date.getTime())) { document.querySelector("[data-relative-time]").textContent = "Invalid ISO date"; return; } epochInput.value = String(Math.floor(date.getTime() / 1000)); setRelativeTime(date); }
  epochInput.addEventListener("input", convertEpoch);
  isoInput.addEventListener("change", convertIso);

  var urlInput = document.querySelector("[data-url-input]");
  function inspectUrl() { try { var url = new URL(urlInput.value); document.querySelector("[data-url-breakdown]").textContent = "Host: " + url.host + " | Path: " + url.pathname + " | Query keys: " + Array.from(url.searchParams.keys()).join(", "); } catch (_) { document.querySelector("[data-url-breakdown]").textContent = "Component mode: encode or decode selected text."; } }
  document.querySelectorAll("[data-url-action]").forEach(function (button) { button.addEventListener("click", function () { try { urlInput.value = button.dataset.urlAction === "encode" ? encodeURIComponent(urlInput.value) : decodeURIComponent(urlInput.value); inspectUrl(); } catch (error) { document.querySelector("[data-url-safety]").textContent = "Invalid encoding"; } }); }); urlInput.addEventListener("input", inspectUrl);

  var hashInput = document.querySelector("[data-hash-input]");
  function updateHash() { if (!window.crypto || !window.crypto.subtle) { document.querySelector("[data-hash-output]").textContent = "Web Crypto requires HTTPS"; return; } crypto.subtle.digest("SHA-256", new TextEncoder().encode(hashInput.value)).then(function (buffer) { document.querySelector("[data-hash-output]").textContent = Array.from(new Uint8Array(buffer)).map(function (byte) { return byte.toString(16).padStart(2, "0"); }).join(""); }); }
  hashInput.addEventListener("input", updateHash); document.querySelector("[data-copy-hash]").addEventListener("click", function () { copyText(document.querySelector("[data-hash-output]").textContent); });

  var dialog = document.querySelector("[data-command-dialog]"); var commandSearch = document.querySelector("[data-command-search]");
  function closeCommandPalette() { if (dialog.open) dialog.close(); commandSearch.value = ""; dialog.querySelectorAll("[data-command]").forEach(function (button) { button.hidden = false; }); }
  commandSearch.addEventListener("input", function () { dialog.querySelectorAll("[data-command]").forEach(function (button) { button.hidden = !button.textContent.toLowerCase().includes(commandSearch.value.toLowerCase()); }); });
  dialog.querySelector("[data-command-close]").addEventListener("click", closeCommandPalette);
  dialog.addEventListener("cancel", function (event) { event.preventDefault(); closeCommandPalette(); });
  dialog.addEventListener("click", function (event) { if (event.target === dialog) { closeCommandPalette(); return; } var command = event.target.closest("[data-command]"); if (!command) return; closeCommandPalette(); if (command.dataset.command === "format") formatJson(); if (command.dataset.command === "minify") document.querySelector('[data-transform="minify"]').click(); if (["tree", "typescript", "schema"].includes(command.dataset.command)) render(command.dataset.command); if (command.dataset.command === "regex") document.querySelector('[data-widget="regex"]').scrollIntoView({ behavior: "smooth" }); });
  document.querySelector("[data-sidebar-toggle]").addEventListener("click", function () { var layout = document.querySelector(".workspace-layout"); var collapsed = layout.classList.toggle("sidebar-collapsed"); this.setAttribute("aria-expanded", String(!collapsed)); this.setAttribute("aria-label", collapsed ? "Expand tool navigation" : "Collapse tool navigation"); this.title = this.getAttribute("aria-label"); this.innerHTML = collapsed ? "&rsaquo;" : "&lsaquo;"; localStorage.setItem("formalint-workspace-sidebar", collapsed ? "collapsed" : "expanded"); });
  if (localStorage.getItem("formalint-workspace-sidebar") === "collapsed") document.querySelector("[data-sidebar-toggle]").click();
  document.addEventListener("keydown", function (event) { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); dialog.showModal(); commandSearch.focus(); } if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); formatJson(); } if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "c") { event.preventDefault(); copyText(output.textContent); } });

  input.value = JSON.stringify(samples.commerce, null, 2); updateLines(); render("tree"); runRegex(); convertEpoch(); inspectUrl(); updateHash();
})();
