(function () {
  "use strict";

  if (document.body.dataset.tool !== "yaml") {
    return;
  }

  var $ = window.DevKit.$;
  var input = $("#yamlInput");
  var output = $("#yamlOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  var sampleYaml = [
    "project: Formalint",
    "release: 0.2.0",
    "tools:",
    "  - name: JSON Formatter",
    "    status: live",
    "  - name: YAML Formatter",
    "    status: new",
    "security:",
    "  localProcessing: true",
    "  uploadInput: false"
  ].join("\n");

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + window.DevKit.lineCount(input.value) + " lines";
  }

  function normalizeYaml(text) {
    var cleaned = text.replace(/\r\n|\r/g, "\n").replace(/\t/g, "  ");
    var lines = cleaned.split("\n");
    var out = [];
    var previousBlank = false;

    lines.forEach(function (line) {
      var next = line.replace(/\s+$/g, "");
      var isBlank = next.trim() === "";

      if (isBlank) {
        if (!previousBlank && out.length) {
          out.push("");
        }
        previousBlank = true;
        return;
      }

      out.push(next);
      previousBlank = false;
    });

    while (out.length && out[out.length - 1] === "") {
      out.pop();
    }

    return out.join("\n") + (out.length ? "\n" : "");
  }

  function checkBalanced(line, lineNumber) {
    var stack = [];
    var pairs = { "]": "[", "}": "{" };
    var quote = "";

    for (var index = 0; index < line.length; index += 1) {
      var char = line.charAt(index);
      var previous = line.charAt(index - 1);

      if (quote) {
        if (char === quote && previous !== "\\") {
          quote = "";
        }
        continue;
      }

      if (char === "\"" || char === "'") {
        quote = char;
        continue;
      }

      if (char === "[" || char === "{") {
        stack.push(char);
      }

      if (char === "]" || char === "}") {
        if (stack.pop() !== pairs[char]) {
          return "Line " + lineNumber + ": unbalanced bracket.";
        }
      }
    }

    if (quote) {
      return "Line " + lineNumber + ": unclosed quote.";
    }

    if (stack.length) {
      return "Line " + lineNumber + ": unbalanced bracket.";
    }

    return "";
  }

  function validateYaml(text) {
    var lines = text.replace(/\r\n|\r/g, "\n").split("\n");
    var blockKeys = {};
    var contexts = [{ indent: -1, id: "root" }];
    var contextId = 0;
    var previousIndent = 0;
    var nonEmpty = 0;

    for (var index = 0; index < lines.length; index += 1) {
      var line = lines[index];
      var lineNumber = index + 1;
      var trimmed = line.trim();

      if (!trimmed || trimmed.charAt(0) === "#") {
        continue;
      }

      nonEmpty += 1;

      if (/^\s*\t/.test(line) || /\t/.test(line.match(/^\s*/)[0])) {
        throw new Error("Line " + lineNumber + ": tabs are not valid indentation in YAML.");
      }

      var indent = line.match(/^ */)[0].length;
      if (indent % 2 !== 0) {
        throw new Error("Line " + lineNumber + ": use even indentation for readable YAML.");
      }

      if (indent > previousIndent + 2) {
        throw new Error("Line " + lineNumber + ": indentation jumps more than one level.");
      }

      previousIndent = indent;

      while (contexts.length > 1 && indent <= contexts[contexts.length - 1].indent) {
        contexts.pop();
      }

      if (/^-\s+/.test(trimmed)) {
        contextId += 1;
        contexts.push({ indent: indent, id: contexts[contexts.length - 1].id + "/item" + contextId });
      }

      var balancedMessage = checkBalanced(line, lineNumber);
      if (balancedMessage) {
        throw new Error(balancedMessage);
      }

      var keyText = trimmed.replace(/^-\s+/, "");
      var keyMatch = keyText.match(/^([A-Za-z0-9_.-]+)\s*:/);
      if (keyMatch) {
        var blockId = contexts[contexts.length - 1].id;
        var key = keyMatch[1];
        blockKeys[blockId] = blockKeys[blockId] || {};
        if (blockKeys[blockId][key]) {
          throw new Error("Line " + lineNumber + ": duplicate key \"" + key + "\" in the same indentation block.");
        }
        blockKeys[blockId][key] = true;

        if (/:\s*(#.*)?$/.test(keyText)) {
          contextId += 1;
          contexts.push({ indent: indent, id: blockId + "/" + key + contextId });
        }
      }

      if (/:\s*[^"'[{].*:\s*/.test(trimmed)) {
        throw new Error("Line " + lineNumber + ": quote values that contain another colon.");
      }
    }

    if (!nonEmpty) {
      throw new Error("Input is empty.");
    }
  }

  function renderMetrics(text) {
    var keyCount = (text.match(/^\s*[A-Za-z0-9_.-]+\s*:/gm) || []).length;
    var listCount = (text.match(/^\s*-\s+/gm) || []).length;
    window.DevKit.renderMetrics(metrics, [
      { label: "Size", value: window.DevKit.formatBytes(text) },
      { label: "Lines", value: String(window.DevKit.lineCount(text)) },
      { label: "Keys", value: String(keyCount) },
      { label: "List items", value: String(listCount) }
    ]);
  }

  function setResult(text, message) {
    lastOutput = text;
    output.textContent = text;
    renderMetrics(text);
    window.DevKit.setStatus(statusMessage, "ok", message);
  }

  function runFormat() {
    try {
      var text = normalizeYaml(input.value);
      validateYaml(text);
      setResult(text, "YAML cleaned");
    } catch (error) {
      lastOutput = normalizeYaml(input.value);
      output.textContent = lastOutput || error.message;
      renderMetrics(lastOutput);
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runValidate() {
    try {
      var text = normalizeYaml(input.value);
      validateYaml(text);
      setResult(text, "Common YAML checks passed");
    } catch (error) {
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function handleAction(action) {
    if (action === "format") {
      runFormat();
    }
    if (action === "validate") {
      runValidate();
    }
    if (action === "sample") {
      input.value = sampleYaml;
      updateInputMeta();
      runFormat();
    }
    if (action === "clear") {
      input.value = "";
      output.textContent = "";
      lastOutput = "";
      updateInputMeta();
      window.DevKit.setStatus(statusMessage, "", "Ready");
      window.DevKit.renderMetrics(metrics, []);
    }
    if (action === "copy") {
      window.DevKit.copyText(lastOutput).then(function () {
        window.DevKit.setStatus(statusMessage, "ok", "Copied");
      });
    }
    if (action === "download") {
      window.DevKit.downloadText("formatted.yaml", lastOutput || input.value, "text/yaml;charset=utf-8");
    }
  }

  document.addEventListener("click", function (event) {
    var actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleAction(actionButton.dataset.action);
    }
  });

  input.addEventListener("input", window.DevKit.debounce(updateInputMeta, 120));
  input.value = sampleYaml;
  updateInputMeta();
  runFormat();
})();
