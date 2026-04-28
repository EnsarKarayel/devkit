(function () {
  "use strict";

  if (document.body.dataset.tool !== "xml") {
    return;
  }

  var $ = window.DevKit.$;
  var escapeHtml = window.DevKit.escapeHtml;
  var input = $("#xmlInput");
  var output = $("#xmlOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";
  var lastMode = "xml";

  var sampleXml =
    '<project name="DevKit" version="0.1.0"><tools><tool type="formatter">JSON</tool><tool type="formatter">XML</tool></tools><privacy runsInBrowser="true">local-first</privacy></project>';

  function parseXml() {
    var raw = input.value.trim();
    if (!raw) {
      throw new Error("Input is empty.");
    }
    var parser = new DOMParser();
    var doc = parser.parseFromString(raw, "application/xml");
    var parserError = doc.getElementsByTagName("parsererror")[0];

    if (parserError) {
      throw new Error(parserError.textContent.replace(/\s+/g, " ").trim() || "Invalid XML.");
    }

    return doc;
  }

  function serialize(doc) {
    return new XMLSerializer().serializeToString(doc);
  }

  function formatXml(xml) {
    var compact = xml.replace(/>\s+</g, "><").trim();
    var tokens = compact.replace(/(>)(<)(\/*)/g, "$1\n$2$3").split("\n");
    var depth = 0;

    return tokens
      .map(function (token) {
        if (/^<\/\w/.test(token)) {
          depth = Math.max(depth - 1, 0);
        }

        var line = new Array(depth + 1).join("  ") + token;

        if (/^<[^!?/][^>]*[^/]?>$/.test(token) && !/^<[^>]+>[^<]*<\/[^>]+>$/.test(token)) {
          depth += 1;
        }

        return line;
      })
      .join("\n");
  }

  function highlightXml(text) {
    return escapeHtml(text)
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token-comment">$1</span>')
      .replace(/(&lt;\/?[\w:.-]+)/g, '<span class="token-tag">$1</span>')
      .replace(/([\w:.-]+)=(&quot;.*?&quot;)/g, '<span class="token-attribute">$1</span>=$2')
      .replace(/(\/?&gt;)/g, '<span class="token-tag">$1</span>');
  }

  function xmlToObject(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue.trim();
    }

    var result = {};
    if (node.attributes && node.attributes.length) {
      result["@attributes"] = {};
      Array.prototype.forEach.call(node.attributes, function (attribute) {
        result["@attributes"][attribute.name] = attribute.value;
      });
    }

    var elementChildren = [];
    var textParts = [];
    Array.prototype.forEach.call(node.childNodes, function (child) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        elementChildren.push(child);
      }
      if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim()) {
        textParts.push(child.nodeValue.trim());
      }
    });

    elementChildren.forEach(function (child) {
      var value = xmlToObject(child);
      if (Object.prototype.hasOwnProperty.call(result, child.nodeName)) {
        if (!Array.isArray(result[child.nodeName])) {
          result[child.nodeName] = [result[child.nodeName]];
        }
        result[child.nodeName].push(value);
      } else {
        result[child.nodeName] = value;
      }
    });

    if (textParts.length) {
      if (Object.keys(result).length) {
        result["#text"] = textParts.join(" ");
      } else {
        return textParts.join(" ");
      }
    }

    return result;
  }

  function setOutput(text, mode, doc) {
    lastOutput = text;
    lastMode = mode || "xml";
    output.innerHTML = mode === "json" ? highlightJson(text) : highlightXml(text);
    updateMetrics(text, doc);
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

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + window.DevKit.lineCount(input.value) + " lines";
  }

  function updateMetrics(text, doc) {
    var elementCount = "0";
    if (doc) {
      elementCount = String(doc.getElementsByTagName("*").length);
    }

    window.DevKit.renderMetrics(metrics, [
      { label: "Size", value: window.DevKit.formatBytes(text) },
      { label: "Lines", value: String(window.DevKit.lineCount(text)) },
      { label: "Elements", value: elementCount },
      { label: "Mode", value: lastMode.toUpperCase() }
    ]);
  }

  function runFormat() {
    try {
      var doc = parseXml();
      var text = formatXml(serialize(doc));
      setOutput(text, "xml", doc);
      window.DevKit.setStatus(statusMessage, "ok", "Valid XML");
    } catch (error) {
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runMinify() {
    try {
      var doc = parseXml();
      var text = serialize(doc).replace(/>\s+</g, "><").trim();
      setOutput(text, "xml", doc);
      window.DevKit.setStatus(statusMessage, "ok", "Valid XML");
    } catch (error) {
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runValidate() {
    try {
      var doc = parseXml();
      var text = formatXml(serialize(doc));
      setOutput(text, "xml", doc);
      window.DevKit.setStatus(statusMessage, "ok", "Valid XML");
    } catch (error) {
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runToJson() {
    try {
      var doc = parseXml();
      var root = {};
      root[doc.documentElement.nodeName] = xmlToObject(doc.documentElement);
      var text = JSON.stringify(root, null, 2);
      setOutput(text, "json", doc);
      window.DevKit.setStatus(statusMessage, "ok", "Converted to JSON");
    } catch (error) {
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function handleAction(action) {
    if (action === "format") {
      runFormat();
    }
    if (action === "minify") {
      runMinify();
    }
    if (action === "validate") {
      runValidate();
    }
    if (action === "to-json") {
      runToJson();
    }
    if (action === "clear") {
      input.value = "";
      setOutput("", "xml", null);
      updateInputMeta();
      window.DevKit.setStatus(statusMessage, "", "Ready");
    }
    if (action === "sample") {
      input.value = sampleXml;
      updateInputMeta();
      runFormat();
    }
    if (action === "copy") {
      window.DevKit.copyText(lastOutput).then(function () {
        window.DevKit.setStatus(statusMessage, "ok", "Copied");
      });
    }
    if (action === "download") {
      var extension = lastMode === "json" ? "json" : "xml";
      var mimeType = lastMode === "json" ? "application/json;charset=utf-8" : "application/xml;charset=utf-8";
      window.DevKit.downloadText("formatted." + extension, lastOutput || input.value, mimeType);
    }
  }

  document.addEventListener("click", function (event) {
    var actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleAction(actionButton.dataset.action);
    }
  });

  input.addEventListener("input", window.DevKit.debounce(updateInputMeta, 120));
  input.value = sampleXml;
  updateInputMeta();
  runFormat();
})();
