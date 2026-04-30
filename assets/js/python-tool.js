(function () {
  "use strict";

  if (document.body.dataset.tool !== "python") {
    return;
  }

  var $ = window.DevKit.$;
  var input = $("#pythonInput");
  var output = $("#pythonOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  var samplePython = [
    "def build_slug(value):",
    "\tclean = value.strip().lower()",
    "    parts = clean.replace('_', '-').split()",
    "    return '-'.join(parts)",
    "",
    "",
    "print(build_slug('Formalint Dev Tools'))"
  ].join("\n");

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + window.DevKit.lineCount(input.value) + " lines";
  }

  function normalizePython(text) {
    var lines = text.replace(/\r\n|\r/g, "\n").split("\n");
    var out = [];
    var blankCount = 0;

    lines.forEach(function (line) {
      var expanded = line.replace(/\t/g, "    ").replace(/\s+$/g, "");
      var isBlank = expanded.trim() === "";

      if (isBlank) {
        blankCount += 1;
        if (blankCount <= 2 && out.length) {
          out.push("");
        }
        return;
      }

      blankCount = 0;
      out.push(expanded);
    });

    while (out.length && out[out.length - 1] === "") {
      out.pop();
    }

    return out.join("\n") + (out.length ? "\n" : "");
  }

  function checkPython(text) {
    var lines = text.replace(/\r\n|\r/g, "\n").split("\n");
    var indentStack = [0];
    var bracketStack = [];
    var previousSignificant = "";

    for (var index = 0; index < lines.length; index += 1) {
      var line = lines[index];
      var lineNumber = index + 1;
      var trimmed = line.trim();

      if (!trimmed || trimmed.charAt(0) === "#") {
        continue;
      }

      if (/\t/.test(line)) {
        throw new Error("Line " + lineNumber + ": tab indentation found. Use spaces for Python.");
      }

      var indent = line.match(/^ */)[0].length;
      if (indent % 4 !== 0) {
        throw new Error("Line " + lineNumber + ": indentation should be a multiple of 4 spaces.");
      }

      var top = indentStack[indentStack.length - 1];
      if (indent > top) {
        if (indent !== top + 4 && bracketStack.length === 0) {
          throw new Error("Line " + lineNumber + ": indentation jumps more than one level.");
        }
        indentStack.push(indent);
      }

      while (indent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
      }

      if (indent !== indentStack[indentStack.length - 1]) {
        throw new Error("Line " + lineNumber + ": dedent does not match a previous indentation level.");
      }

      if (indent > top && previousSignificant && !/[([{:]$/.test(previousSignificant)) {
        throw new Error("Line " + lineNumber + ": indented block should follow a colon or open bracket.");
      }

      scanBrackets(trimmed, bracketStack, lineNumber);
      previousSignificant = trimmed.replace(/#.*$/, "").trim();
    }

    if (bracketStack.length) {
      throw new Error("Unclosed bracket or parenthesis.");
    }
  }

  function scanBrackets(line, stack, lineNumber) {
    var pairs = { ")": "(", "]": "[", "}": "{" };
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

      if (char === "#" && !quote) {
        return;
      }

      if (char === "(" || char === "[" || char === "{") {
        stack.push(char);
      }

      if (char === ")" || char === "]" || char === "}") {
        if (stack.pop() !== pairs[char]) {
          throw new Error("Line " + lineNumber + ": mismatched bracket.");
        }
      }
    }

    if (quote) {
      throw new Error("Line " + lineNumber + ": unclosed string quote.");
    }
  }

  function renderMetrics(text) {
    var functionCount = (text.match(/^\s*def\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/gm) || []).length;
    var classCount = (text.match(/^\s*class\s+[A-Za-z_][A-Za-z0-9_]*/gm) || []).length;
    window.DevKit.renderMetrics(metrics, [
      { label: "Size", value: window.DevKit.formatBytes(text) },
      { label: "Lines", value: String(window.DevKit.lineCount(text)) },
      { label: "Functions", value: String(functionCount) },
      { label: "Classes", value: String(classCount) }
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
      var text = normalizePython(input.value);
      checkPython(text);
      setResult(text, "Python snippet cleaned");
    } catch (error) {
      lastOutput = normalizePython(input.value);
      output.textContent = lastOutput || error.message;
      renderMetrics(lastOutput);
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runCheck() {
    try {
      var text = normalizePython(input.value);
      checkPython(text);
      setResult(text, "Basic Python checks passed");
    } catch (error) {
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function handleAction(action) {
    if (action === "format") {
      runFormat();
    }
    if (action === "validate") {
      runCheck();
    }
    if (action === "sample") {
      input.value = samplePython;
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
      window.DevKit.downloadText("formatted.py", lastOutput || input.value, "text/x-python;charset=utf-8");
    }
  }

  document.addEventListener("click", function (event) {
    var actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleAction(actionButton.dataset.action);
    }
  });

  input.addEventListener("input", window.DevKit.debounce(updateInputMeta, 120));
  input.value = samplePython;
  updateInputMeta();
  runFormat();
})();
