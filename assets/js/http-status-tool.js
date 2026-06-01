(function () {
  "use strict";

  var $ = window.DevKit.$;
  var $$ = window.DevKit.$$;
  var escapeHtml = window.DevKit.escapeHtml;
  var copyText = window.DevKit.copyText;
  var setStatus = window.DevKit.setStatus;

  var codes = [
    { code: 100, phrase: "Continue", className: "Informational", note: "The server accepted the request headers and the client may continue with the body. In API debugging, this usually matters when uploads, proxies or expect-continue behavior are involved.", check: "Confirm that the client eventually sends the body and that proxies do not strip the Expect header." },
    { code: 101, phrase: "Switching Protocols", className: "Informational", note: "The server is switching protocols as requested by the client. Developers usually see this around WebSocket upgrades or protocol negotiation.", check: "Check upgrade headers, reverse proxy support and whether TLS termination preserves the connection upgrade." },
    { code: 200, phrase: "OK", className: "Success", note: "The request succeeded and the response body should match the documented contract for the endpoint.", check: "Validate that the body shape, pagination metadata and caching headers are correct, not only that the status is green." },
    { code: 201, phrase: "Created", className: "Success", note: "A new resource was created. Good APIs often include a Location header or an identifier in the response body.", check: "Confirm idempotency expectations, duplicate handling and whether follow-up reads can find the created resource." },
    { code: 202, phrase: "Accepted", className: "Success", note: "The request was accepted for asynchronous processing but is not complete yet.", check: "Look for a job ID, polling endpoint, webhook callback or retry policy so callers know how to track completion." },
    { code: 204, phrase: "No Content", className: "Success", note: "The request succeeded and intentionally returned no body. This is common for deletes, toggles and lightweight updates.", check: "If a client fails to parse the response, make sure it does not expect JSON from a bodyless response." },
    { code: 301, phrase: "Moved Permanently", className: "Redirect", note: "The resource has a permanent new URL. In APIs, unexpected 301 responses often come from missing trailing slashes, HTTP-to-HTTPS routing or old domains.", check: "Check whether the client follows redirects and whether method and body are preserved correctly." },
    { code: 302, phrase: "Found", className: "Redirect", note: "The resource is temporarily available at another URL. For browser flows this is normal, but for API clients it may hide an authentication or routing issue.", check: "Inspect the Location header and make sure API clients are not being sent to an HTML login page." },
    { code: 304, phrase: "Not Modified", className: "Redirect", note: "The cached representation is still valid. This is useful for efficient reads but confusing if the client expects a fresh payload every time.", check: "Review ETag, If-None-Match, Last-Modified and cache-control behavior." },
    { code: 400, phrase: "Bad Request", className: "Client error", note: "The server could not understand or accept the request. It often means malformed JSON, invalid query syntax or a missing required parameter.", check: "Format the payload, confirm content type, inspect required fields and compare the request against the API contract." },
    { code: 401, phrase: "Unauthorized", className: "Client error", note: "The request is not authenticated. The token may be missing, expired, malformed, issued for the wrong audience or sent with the wrong scheme.", check: "Decode the token, verify exp, aud, iss and scopes, then confirm the Authorization header reaches the application." },
    { code: 403, phrase: "Forbidden", className: "Client error", note: "The caller is authenticated but not allowed to access the resource or action.", check: "Compare user role, tenant, ownership rules and feature flags. Do not debug this as a password problem unless authentication also fails." },
    { code: 404, phrase: "Not Found", className: "Client error", note: "The route or resource was not found. For APIs this can mean a wrong base URL, wrong tenant, missing record or intentionally hidden resource.", check: "Verify environment, route version, resource ID, tenant ID and whether authorization rules intentionally return 404." },
    { code: 405, phrase: "Method Not Allowed", className: "Client error", note: "The path exists, but the HTTP method does not match the allowed operation.", check: "Compare the client method with the API docs and inspect CORS preflight behavior for browser requests." },
    { code: 409, phrase: "Conflict", className: "Client error", note: "The request conflicts with the current state of the resource. It is common for duplicate keys, stale versions and concurrent updates.", check: "Look for unique constraints, optimistic locking fields, version headers and retry behavior." },
    { code: 410, phrase: "Gone", className: "Client error", note: "The resource used to exist but is no longer available. This is stronger than a normal 404.", check: "Check deletion history, migration rules and whether clients still reference retired endpoints." },
    { code: 415, phrase: "Unsupported Media Type", className: "Client error", note: "The server rejected the request body format. This often happens when JSON is sent without the right Content-Type header.", check: "Confirm Content-Type, charset, multipart boundaries and whether the endpoint expects JSON, form data or a file upload." },
    { code: 422, phrase: "Unprocessable Content", className: "Client error", note: "The request is syntactically valid, but the server cannot process it because validation or business rules failed.", check: "Inspect field-level errors, generated JSON Schema, enum values, nullable fields and cross-field rules." },
    { code: 429, phrase: "Too Many Requests", className: "Client error", note: "The caller has hit a rate limit. A good response includes enough information to back off safely.", check: "Review Retry-After, quota windows, client retry loops and whether multiple workers share the same key." },
    { code: 500, phrase: "Internal Server Error", className: "Server error", note: "The server failed unexpectedly. It is a symptom, not a root cause.", check: "Start with request ID, logs, stack trace, recent deploys and the exact payload that triggered the failure." },
    { code: 502, phrase: "Bad Gateway", className: "Server error", note: "A gateway or proxy received an invalid response from an upstream service.", check: "Check upstream health, proxy timeout settings, DNS, TLS certificates and response size limits." },
    { code: 503, phrase: "Service Unavailable", className: "Server error", note: "The service cannot handle the request right now. It may be down, overloaded or intentionally in maintenance mode.", check: "Inspect autoscaling, queue depth, dependency status and whether clients respect Retry-After." },
    { code: 504, phrase: "Gateway Timeout", className: "Server error", note: "A gateway waited too long for an upstream response.", check: "Compare client timeout, gateway timeout and service timeout. Look for slow queries, cold starts and blocked dependencies." }
  ];

  var search = $("#statusSearch");
  var results = $("#statusResults");
  var meta = $("#statusMeta");

  function selectedClass() {
    var selected = $('input[name="statusClass"]:checked');
    return selected ? selected.value : "all";
  }

  function matches(item, query, statusClass) {
    var classMatches = statusClass === "all" || String(item.code).charAt(0) === statusClass;
    var haystack = [item.code, item.phrase, item.className, item.note, item.check].join(" ").toLowerCase();
    return classMatches && (!query || haystack.indexOf(query) !== -1);
  }

  function render() {
    var query = String(search.value || "").trim().toLowerCase();
    var statusClass = selectedClass();
    var visible = codes.filter(function (item) {
      return matches(item, query, statusClass);
    });

    if (!visible.length) {
      results.innerHTML = '<div class="empty-reference">No status codes matched this filter.</div>';
      setStatus(meta, "error", "0 matches");
      return;
    }

    setStatus(meta, "ok", visible.length + " matching codes");
    results.innerHTML = visible
      .map(function (item) {
        return (
          '<article class="status-card">' +
          '<div class="status-code-row"><strong>' +
          item.code +
          "</strong><div><h2>" +
          escapeHtml(item.phrase) +
          "</h2><span>" +
          escapeHtml(item.className) +
          "</span></div></div>" +
          "<p>" +
          escapeHtml(item.note) +
          "</p><p><b>Debug check:</b> " +
          escapeHtml(item.check) +
          "</p>" +
          '<button class="secondary" type="button" data-copy-code="' +
          item.code +
          '">Copy note</button>' +
          "</article>"
        );
      })
      .join("");
  }

  function noteText(item) {
    return item.code + " " + item.phrase + "\n" + item.note + "\nDebug check: " + item.check;
  }

  function visibleText() {
    var query = String(search.value || "").trim().toLowerCase();
    var statusClass = selectedClass();
    return codes
      .filter(function (item) {
        return matches(item, query, statusClass);
      })
      .map(noteText)
      .join("\n\n");
  }

  search.addEventListener("input", render);
  $$('input[name="statusClass"]').forEach(function (input) {
    input.addEventListener("change", render);
  });

  document.addEventListener("click", function (event) {
    var copyCode = event.target.getAttribute("data-copy-code");
    var action = event.target.getAttribute("data-action");

    if (copyCode) {
      var item = codes.find(function (entry) {
        return String(entry.code) === copyCode;
      });
      if (item) {
        copyText(noteText(item)).then(function () {
          setStatus(meta, "ok", "Copied " + item.code);
        });
      }
    }

    if (action === "clear") {
      search.value = "";
      $('input[name="statusClass"][value="all"]').checked = true;
      render();
      search.focus();
    }

    if (action === "copy-visible") {
      copyText(visibleText()).then(function () {
        setStatus(meta, "ok", "Visible notes copied");
      });
    }
  });

  render();
})();
