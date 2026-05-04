(function () {
  "use strict";

  if (document.body.dataset.tool !== "sql") {
    return;
  }

  var $ = window.DevKit.$;
  var input = $("#sqlInput");
  var output = $("#sqlOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastOutput = "";

  var sampleSql = [
    "select c.customer_id, c.name, sum(o.total_amount) as revenue from customers c",
    "left join orders o on o.customer_id = c.customer_id",
    "where o.created_at >= '2026-01-01' and o.status in ('paid', 'shipped')",
    "group by c.customer_id, c.name order by revenue desc limit 25;"
  ].join(" ");

  var keywords = [
    "select", "from", "where", "inner join", "left join", "right join", "full join", "cross join", "join",
    "on", "and", "or", "group by", "order by", "having", "limit", "offset", "union all", "union",
    "insert into", "values", "update", "set", "delete from", "create table", "alter table", "drop table",
    "case", "when", "then", "else", "end", "as", "in", "is null", "is not null", "between", "like", "distinct"
  ];

  var clausePattern = /\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|UNION ALL|UNION|VALUES|SET)\b/gi;
  var joinPattern = /\b(INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|JOIN)\b/gi;
  var logicPattern = /\b(AND|OR)\b/gi;

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + window.DevKit.lineCount(input.value) + " lines";
  }

  function stripExtraWhitespace(sql) {
    return sql.replace(/\r\n|\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, " ").trim();
  }

  function uppercaseKeywords(sql) {
    var result = sql;
    keywords
      .slice()
      .sort(function (a, b) {
        return b.length - a.length;
      })
      .forEach(function (keyword) {
        var pattern = new RegExp("\\b" + keyword.replace(/\s+/g, "\\s+") + "\\b", "gi");
        result = result.replace(pattern, keyword.toUpperCase());
      });
    return result;
  }

  function splitCommaLines(sql) {
    var depth = 0;
    var quote = "";
    var result = "";

    for (var index = 0; index < sql.length; index += 1) {
      var char = sql.charAt(index);
      var previous = sql.charAt(index - 1);

      if (quote) {
        result += char;
        if (char === quote && previous !== "\\") {
          quote = "";
        }
        continue;
      }

      if (char === "'" || char === '"' || char === "`") {
        quote = char;
        result += char;
        continue;
      }

      if (char === "(") {
        depth += 1;
      }
      if (char === ")") {
        depth = Math.max(0, depth - 1);
      }

      if (char === "," && depth === 0) {
        result += ",\n  ";
        continue;
      }

      result += char;
    }

    return result;
  }

  function indentSql(sql) {
    return sql
      .replace(clausePattern, function (match, keyword, offset) {
        return (offset === 0 ? "" : "\n") + keyword.toUpperCase();
      })
      .replace(joinPattern, "\n  $1")
      .replace(logicPattern, "\n  $1")
      .split("\n")
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean)
      .join("\n");
  }

  function formatSql(sql) {
    var compact = uppercaseKeywords(stripExtraWhitespace(sql));
    var withLines = splitCommaLines(indentSql(compact));
    return withLines.replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }

  function compactSql(sql) {
    return uppercaseKeywords(stripExtraWhitespace(sql)).replace(/\s*;\s*$/, ";");
  }

  function checkSql(sql) {
    var trimmed = sql.trim();
    var quote = "";
    var parens = 0;

    if (!trimmed) {
      throw new Error("Input is empty.");
    }

    for (var index = 0; index < trimmed.length; index += 1) {
      var char = trimmed.charAt(index);
      var previous = trimmed.charAt(index - 1);

      if (quote) {
        if (char === quote && previous !== "\\") {
          quote = "";
        }
        continue;
      }

      if (char === "'" || char === '"' || char === "`") {
        quote = char;
      }
      if (char === "(") {
        parens += 1;
      }
      if (char === ")") {
        parens -= 1;
      }
      if (parens < 0) {
        throw new Error("Closing parenthesis appears before an opening parenthesis.");
      }
    }

    if (quote) {
      throw new Error("Unclosed string quote.");
    }
    if (parens !== 0) {
      throw new Error("Unbalanced parentheses.");
    }

    if (/\b(DROP|TRUNCATE|DELETE|UPDATE|ALTER)\b/i.test(trimmed)) {
      throw new Error("Destructive SQL keyword found. Review carefully before running this query.");
    }

    if (/\bSELECT\b/i.test(trimmed) && !/\bFROM\b/i.test(trimmed)) {
      throw new Error("SELECT query does not include a FROM clause.");
    }
  }

  function renderMetrics(text) {
    window.DevKit.renderMetrics(metrics, [
      { label: "Size", value: window.DevKit.formatBytes(text) },
      { label: "Lines", value: String(window.DevKit.lineCount(text)) },
      { label: "Joins", value: String((text.match(/\bJOIN\b/gi) || []).length) },
      { label: "Clauses", value: String((text.match(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT)\b/gi) || []).length) }
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
      checkSql(input.value);
      setResult(formatSql(input.value), "SQL formatted");
    } catch (error) {
      lastOutput = input.value;
      output.textContent = input.value || error.message;
      renderMetrics(input.value);
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runCompact() {
    try {
      checkSql(input.value);
      setResult(compactSql(input.value), "SQL compacted");
    } catch (error) {
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function runCheck() {
    try {
      checkSql(input.value);
      setResult(formatSql(input.value), "Basic SQL checks passed");
    } catch (error) {
      window.DevKit.setStatus(statusMessage, "error", error.message);
    }
  }

  function handleAction(action) {
    if (action === "format") {
      runFormat();
    }
    if (action === "compact") {
      runCompact();
    }
    if (action === "check") {
      runCheck();
    }
    if (action === "sample") {
      input.value = sampleSql;
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
      window.DevKit.downloadText("formatted.sql", lastOutput || input.value, "application/sql;charset=utf-8");
    }
  }

  document.addEventListener("click", function (event) {
    var actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleAction(actionButton.dataset.action);
    }
  });

  input.addEventListener("input", window.DevKit.debounce(updateInputMeta, 120));
  input.value = sampleSql;
  updateInputMeta();
  runFormat();
})();
