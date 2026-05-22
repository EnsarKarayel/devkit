(function () {
  "use strict";

  if (document.body.dataset.tool !== "api-debugging") {
    return;
  }

  var $ = window.DevKit.$;
  var STORAGE_KEY = "formalint_api_debugging_v1";
  var checklistGroups = [
    {
      title: "Request identity",
      items: [
        "Confirm environment, base URL and route",
        "Capture method, status code and request ID",
        "Record timestamp with timezone",
        "Confirm the same request fails outside the UI"
      ]
    },
    {
      title: "Authentication and permissions",
      items: [
        "Decode token claims without sharing the token",
        "Check token expiration and clock skew",
        "Confirm scopes, roles and tenant boundaries",
        "Test with a known-good user or service account"
      ]
    },
    {
      title: "Payload and schema",
      items: [
        "Validate JSON syntax",
        "Compare payload with expected schema",
        "Check required fields and nullable values",
        "Check enum values, IDs and date formats"
      ]
    },
    {
      title: "Server behavior",
      items: [
        "Read application logs around the request ID",
        "Check upstream services and database constraints",
        "Look for rate limit, timeout or retry signals",
        "Separate client-side validation from server validation"
      ]
    },
    {
      title: "Resolution notes",
      items: [
        "Write the smallest reproducible example",
        "Document the root cause in one sentence",
        "List the fix and verification step",
        "Create a regression test or monitoring note"
      ]
    }
  ];

  var fields = {
    title: $("#apiTitle"),
    endpoint: $("#apiEndpoint"),
    method: $("#apiMethod"),
    status: $("#apiStatus"),
    expected: $("#apiExpected"),
    observed: $("#apiObserved"),
    evidence: $("#apiEvidence")
  };
  var groupsElement = $("#checklistGroups");
  var statusElement = $("#checklistStatus");
  var metaElement = $("#apiMeta");
  var metricsElement = $("#apiMetrics");
  var state = loadState();

  function defaultState() {
    return {
      fields: {
        title: "",
        endpoint: "",
        method: "GET",
        status: "",
        expected: "",
        observed: "",
        evidence: ""
      },
      checked: {}
    };
  }

  function loadState() {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || defaultState();
    } catch (error) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      metaElement.textContent = "Saved locally";
    } catch (error) {
      metaElement.textContent = "Local save unavailable";
    }
  }

  function itemId(groupIndex, itemIndex) {
    return "g" + groupIndex + "-i" + itemIndex;
  }

  function renderChecklist() {
    groupsElement.innerHTML = checklistGroups
      .map(function (group, groupIndex) {
        var items = group.items
          .map(function (item, itemIndex) {
            var id = itemId(groupIndex, itemIndex);
            var checked = state.checked[id] ? " checked" : "";
            return (
              '<label class="check-item">' +
              '<input type="checkbox" data-check-id="' + id + '"' + checked + ">" +
              "<span>" + window.DevKit.escapeHtml(item) + "</span>" +
              "</label>"
            );
          })
          .join("");
        return (
          '<section class="check-group">' +
          "<h3>" + window.DevKit.escapeHtml(group.title) + "</h3>" +
          items +
          "</section>"
        );
      })
      .join("");
  }

  function hydrateFields() {
    Object.keys(fields).forEach(function (key) {
      fields[key].value = state.fields[key] || "";
    });
  }

  function updateMetrics() {
    var total = checklistGroups.reduce(function (sum, group) {
      return sum + group.items.length;
    }, 0);
    var done = Object.keys(state.checked).filter(function (key) {
      return state.checked[key];
    }).length;
    var percent = total ? Math.round((done / total) * 100) : 0;
    window.DevKit.renderMetrics(metricsElement, [
      { label: "Progress", value: percent + "%" },
      { label: "Checked", value: String(done) },
      { label: "Open", value: String(total - done) },
      { label: "Status", value: state.fields.status || "-" }
    ]);
    window.DevKit.setStatus(statusElement, done === total ? "ok" : "", done + " of " + total + " checks complete");
  }

  function syncFields() {
    Object.keys(fields).forEach(function (key) {
      state.fields[key] = fields[key].value;
    });
    saveState();
    updateMetrics();
  }

  function buildReport() {
    var checkedLines = [];
    checklistGroups.forEach(function (group, groupIndex) {
      checkedLines.push("", "### " + group.title);
      group.items.forEach(function (item, itemIndex) {
        var id = itemId(groupIndex, itemIndex);
        checkedLines.push("- [" + (state.checked[id] ? "x" : " ") + "] " + item);
      });
    });

    return [
      "# API Debugging Report",
      "",
      "- Issue: " + (state.fields.title || "-"),
      "- Endpoint: " + (state.fields.method || "-") + " " + (state.fields.endpoint || "-"),
      "- Status: " + (state.fields.status || "-"),
      "",
      "## Expected behavior",
      state.fields.expected || "-",
      "",
      "## Observed behavior",
      state.fields.observed || "-",
      "",
      "## Evidence and reproduction notes",
      state.fields.evidence || "-",
      "",
      "## Checklist"
    ].concat(checkedLines).join("\n");
  }

  function applySample() {
    state.fields = {
      title: "422 when creating a customer",
      endpoint: "/api/customers",
      method: "POST",
      status: "422",
      expected: "The API should create a customer and return a 201 response with the new customer id.",
      observed: "The API returns 422 with a validation error for address.country even when the UI sends a country value.",
      evidence: "Request id: sample-req-7f2a. Environment: staging. Reproduces with sanitized payload in JSON Formatter."
    };
    state.checked = {
      "g0-i0": true,
      "g0-i1": true,
      "g2-i0": true,
      "g2-i1": true
    };
    hydrateFields();
    renderChecklist();
    saveState();
    updateMetrics();
  }

  function resetAll() {
    state = defaultState();
    hydrateFields();
    renderChecklist();
    saveState();
    updateMetrics();
  }

  document.addEventListener("click", function (event) {
    var actionButton = event.target.closest("[data-action]");
    if (!actionButton) {
      return;
    }
    var action = actionButton.dataset.action;
    if (action === "sample") {
      applySample();
    }
    if (action === "copy-report") {
      syncFields();
      window.DevKit.copyText(buildReport()).then(function () {
        window.DevKit.setStatus(statusElement, "ok", "Report copied");
      });
    }
    if (action === "download-report") {
      syncFields();
      window.DevKit.downloadText("api-debugging-report.md", buildReport(), "text/markdown;charset=utf-8");
    }
    if (action === "reset") {
      resetAll();
    }
  });

  groupsElement.addEventListener("change", function (event) {
    var checkbox = event.target.closest("[data-check-id]");
    if (!checkbox) {
      return;
    }
    state.checked[checkbox.dataset.checkId] = checkbox.checked;
    saveState();
    updateMetrics();
  });

  Object.keys(fields).forEach(function (key) {
    fields[key].addEventListener("input", window.DevKit.debounce(syncFields, 160));
    fields[key].addEventListener("change", syncFields);
  });

  hydrateFields();
  renderChecklist();
  updateMetrics();
})();
