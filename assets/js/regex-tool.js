(function () {
  "use strict";

  if (document.body.dataset.tool !== "regex") {
    return;
  }

  var $ = window.DevKit.$;
  var escapeHtml = window.DevKit.escapeHtml;
  var patternInput = $("#regexPattern");
  var textInput = $("#regexText");
  var output = $("#regexOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  var samplePattern = "user(?:name)?=([A-Za-z0-9_]+)";
  var sampleText = "username=ensar\nuser=admin\nname=ignored\nusername=formalint_2026";

  function getFlags() {
    return Array.prototype.slice.call(document.querySelectorAll(".option-grid input:checked"))
      .map(function (input) {
        return input.value;
      })
      .join("");
  }

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(textInput.value) + " / " + window.DevKit.lineCount(textInput.value) + " lines";
  }

  function renderEmpty(message) {
    output.innerHTML = '<div class="empty-state">' + escapeHtml(message) + "</div>";
    lastOutput = message;
  }

  function runTest() {
    var pattern = patternInput.value;
    var text = textInput.value;
    var flags = getFlags();

    if (!pattern) {
      window.DevKit.setStatus(statusMessage, "error", "Pattern is empty.");
      renderEmpty("Enter a regular expression pattern.");
      return;
    }

    if (text.length > 200000) {
      window.DevKit.setStatus(statusMessage, "error", "Input is too large for the browser tester.");
      renderEmpty("Keep regex test input under 200 KB for responsive browser testing.");
      return;
    }

    try {
      var regex = new RegExp(pattern, flags);
      var matches = [];
      var matcher = regex.global ? regex : new RegExp(pattern, flags.indexOf("g") === -1 ? flags + "g" : flags);
      var match;

      while ((match = matcher.exec(text)) !== null && matches.length < 200) {
        matches.push({
          index: match.index,
          text: match[0],
          groups: match.slice(1)
        });

        if (match[0] === "") {
          matcher.lastIndex += 1;
        }
      }

      if (!matches.length) {
        window.DevKit.setStatus(statusMessage, "", "No matches");
        renderEmpty("No matches found.");
      } else {
        var html = matches
          .map(function (item, index) {
            var groups = item.groups.length
              ? '<div class="match-groups">' +
                item.groups
                  .map(function (group, groupIndex) {
                    return "<span>Group " + (groupIndex + 1) + ": " + escapeHtml(group === undefined ? "undefined" : group) + "</span>";
                  })
                  .join("") +
                "</div>"
              : '<div class="match-groups"><span>No capture groups</span></div>';

            return (
              '<article class="match-card"><div><b>#' +
              (index + 1) +
              '</b><span> index ' +
              item.index +
              '</span></div><code>' +
              escapeHtml(item.text) +
              "</code>" +
              groups +
              "</article>"
            );
          })
          .join("");

        output.innerHTML = html;
        lastOutput = matches
          .map(function (item, index) {
            return "#" + (index + 1) + " index " + item.index + ": " + item.text;
          })
          .join("\n");
        window.DevKit.setStatus(statusMessage, "ok", matches.length + " match" + (matches.length === 1 ? "" : "es"));
      }

      window.DevKit.renderMetrics(metrics, [
        { label: "Matches", value: String(matches.length) },
        { label: "Flags", value: flags || "-" },
        { label: "Pattern", value: String(pattern.length) },
        { label: "Text", value: window.DevKit.formatBytes(text) }
      ]);
    } catch (error) {
      window.DevKit.setStatus(statusMessage, "error", error.message);
      renderEmpty(error.message);
    }
  }

  function handleAction(action) {
    if (action === "test") {
      runTest();
    }
    if (action === "clear") {
      patternInput.value = "";
      textInput.value = "";
      updateInputMeta();
      window.DevKit.setStatus(statusMessage, "", "Ready");
      renderEmpty("Enter a pattern and sample text.");
      window.DevKit.renderMetrics(metrics, [
        { label: "Matches", value: "0" },
        { label: "Flags", value: "-" },
        { label: "Pattern", value: "0" },
        { label: "Text", value: "0 bytes" }
      ]);
    }
    if (action === "sample") {
      patternInput.value = samplePattern;
      textInput.value = sampleText;
      updateInputMeta();
      runTest();
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

  document.addEventListener("input", window.DevKit.debounce(function () {
    updateInputMeta();
    runTest();
  }, 180));

  patternInput.value = samplePattern;
  textInput.value = sampleText;
  updateInputMeta();
  runTest();
})();

