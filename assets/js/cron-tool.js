(function () {
  "use strict";

  if (document.body.dataset.tool !== "cron") {
    return;
  }

  var $ = window.DevKit.$;
  var escapeHtml = window.DevKit.escapeHtml;
  var input = $("#cronInput");
  var output = $("#cronOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";
  var fields = [
    { name: "minute", min: 0, max: 59 },
    { name: "hour", min: 0, max: 23 },
    { name: "dayOfMonth", min: 1, max: 31 },
    { name: "month", min: 1, max: 12 },
    { name: "dayOfWeek", min: 0, max: 6 }
  ];

  function parseField(part, spec) {
    var values = new Set();
    part.split(",").forEach(function (segment) {
      var step = 1;
      var base = segment;
      if (segment.indexOf("/") !== -1) {
        var split = segment.split("/");
        base = split[0];
        step = Number(split[1]);
      }
      if (!Number.isInteger(step) || step < 1) {
        throw new Error("Invalid step in " + spec.name + ".");
      }

      var start = spec.min;
      var end = spec.max;
      if (base && base !== "*") {
        if (base.indexOf("-") !== -1) {
          var range = base.split("-").map(Number);
          start = range[0];
          end = range[1];
        } else {
          start = Number(base);
          end = Number(base);
        }
      }

      if (!Number.isInteger(start) || !Number.isInteger(end) || start < spec.min || end > spec.max || start > end) {
        throw new Error("Invalid " + spec.name + " field.");
      }

      for (var value = start; value <= end; value += step) {
        values.add(value);
      }
    });
    return Array.from(values).sort(function (a, b) { return a - b; });
  }

  function parseCron(expression) {
    var parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error("Enter exactly five cron fields.");
    }
    return fields.reduce(function (result, spec, index) {
      result[spec.name] = parseField(parts[index], spec);
      return result;
    }, {});
  }

  function matches(date, parsed) {
    return parsed.minute.indexOf(date.getMinutes()) !== -1 &&
      parsed.hour.indexOf(date.getHours()) !== -1 &&
      parsed.dayOfMonth.indexOf(date.getDate()) !== -1 &&
      parsed.month.indexOf(date.getMonth() + 1) !== -1 &&
      parsed.dayOfWeek.indexOf(date.getDay()) !== -1;
  }

  function nextRuns(parsed) {
    var runs = [];
    var cursor = new Date();
    cursor.setSeconds(0, 0);
    cursor = new Date(cursor.getTime() + 60000);
    var limit = 366 * 24 * 60;

    for (var index = 0; index < limit && runs.length < 8; index += 1) {
      if (matches(cursor, parsed)) {
        runs.push(new Date(cursor));
      }
      cursor = new Date(cursor.getTime() + 60000);
    }
    return runs;
  }

  function describe(values, spec) {
    if (values.length === spec.max - spec.min + 1) {
      return "every " + spec.name;
    }
    return values.join(", ");
  }

  function highlightJson(text) {
    return escapeHtml(text).replace(/(&quot;.*?&quot;(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+)/g, function (match) {
      var className = /^&quot;/.test(match) ? (/:$/.test(match) ? "token-key" : "token-string") : "token-number";
      return '<span class="' + className + '">' + match + "</span>";
    });
  }

  function runParse() {
    try {
      var parsed = parseCron(input.value);
      var runs = nextRuns(parsed);
      var result = {
        expression: input.value.trim(),
        fields: {
          minute: describe(parsed.minute, fields[0]),
          hour: describe(parsed.hour, fields[1]),
          dayOfMonth: describe(parsed.dayOfMonth, fields[2]),
          month: describe(parsed.month, fields[3]),
          dayOfWeek: describe(parsed.dayOfWeek, fields[4])
        },
        nextRunsLocal: runs.map(function (date) { return date.toString(); }),
        nextRunsUtc: runs.map(function (date) { return date.toISOString(); })
      };
      lastOutput = JSON.stringify(result, null, 2);
      output.innerHTML = highlightJson(lastOutput);
      window.DevKit.setStatus(statusMessage, "ok", runs.length ? "Parsed" : "Parsed, no run found within one year");
      window.DevKit.renderMetrics(metrics, [
        { label: "Fields", value: "5" },
        { label: "Next Runs", value: String(runs.length) },
        { label: "Minutes", value: String(parsed.minute.length) },
        { label: "Hours", value: String(parsed.hour.length) }
      ]);
    } catch (error) {
      lastOutput = error.message;
      output.textContent = error.message;
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function handleAction(action) {
    if (action === "parse") {
      runParse();
    }
    if (action === "sample") {
      input.value = "*/15 9-17 * * 1-5";
      inputMeta.textContent = "Weekday business hours";
      runParse();
    }
    if (action === "clear") {
      input.value = "";
      output.textContent = "";
      lastOutput = "";
      inputMeta.textContent = "5 fields";
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
  input.addEventListener("input", window.DevKit.debounce(runParse, 180));
  input.value = "*/15 9-17 * * 1-5";
  runParse();
})();

