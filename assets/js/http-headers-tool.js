(function () {
  "use strict";

  var $ = window.DevKit.$;
  var $$ = window.DevKit.$$;
  var escapeHtml = window.DevKit.escapeHtml;
  var copyText = window.DevKit.copyText;
  var setStatus = window.DevKit.setStatus;

  var headers = [
    { name: "Accept", category: "request", example: "Accept: application/json", note: "Tells the server which response formats the client can handle. API clients often use it to request JSON instead of HTML.", check: "If an API returns an HTML error page, confirm the Accept header and error handling path." },
    { name: "Authorization", category: "request", example: "Authorization: Bearer <token>", note: "Carries credentials such as bearer tokens. Authentication failures often begin with this header missing, malformed or removed by a proxy.", check: "Verify token scheme, expiration, audience and whether the header reaches the application service." },
    { name: "Content-Type", category: "request", example: "Content-Type: application/json", note: "Describes the request body format. Servers use it to decide how to parse payloads.", check: "For 400, 415 or empty body bugs, compare Content-Type with the actual payload format." },
    { name: "User-Agent", category: "request", example: "User-Agent: FormalintClient/1.0", note: "Identifies the client. It can help separate browser, mobile, server and integration traffic in logs.", check: "When only one client fails, compare User-Agent patterns and gateway rules." },
    { name: "Origin", category: "cors", example: "Origin: https://app.example.com", note: "Browsers send this during cross-origin requests. Servers use it to decide whether a browser request should be allowed.", check: "For CORS errors, compare the exact Origin value with the server allowlist." },
    { name: "Access-Control-Request-Method", category: "cors", example: "Access-Control-Request-Method: PATCH", note: "Sent by browsers during preflight to ask whether a cross-origin method is allowed.", check: "If PATCH or DELETE fails only in the browser, inspect the preflight response for allowed methods." },
    { name: "Access-Control-Request-Headers", category: "cors", example: "Access-Control-Request-Headers: authorization, content-type", note: "Sent during preflight to ask whether custom request headers are allowed.", check: "Make sure Authorization, Content-Type and custom request IDs are listed in Access-Control-Allow-Headers." },
    { name: "Access-Control-Allow-Origin", category: "cors", example: "Access-Control-Allow-Origin: https://app.example.com", note: "Tells the browser which origin may read the response.", check: "Avoid mixing wildcard origins with credentialed requests. Match the exact frontend origin when cookies or auth headers are involved." },
    { name: "Access-Control-Allow-Methods", category: "cors", example: "Access-Control-Allow-Methods: GET, POST, PATCH", note: "Lists HTTP methods accepted for cross-origin browser requests.", check: "Compare this header with the method that fails in the browser console." },
    { name: "Access-Control-Allow-Headers", category: "cors", example: "Access-Control-Allow-Headers: Authorization, Content-Type", note: "Lists request headers a browser may send in a cross-origin request.", check: "Add only the headers the client needs and verify case-insensitive matching across proxies." },
    { name: "Access-Control-Allow-Credentials", category: "cors", example: "Access-Control-Allow-Credentials: true", note: "Allows browsers to include credentials such as cookies in cross-origin requests when the client opts in.", check: "Confirm the frontend request uses credentials mode and the origin is not a wildcard." },
    { name: "Cache-Control", category: "cache", example: "Cache-Control: no-store", note: "Controls how clients and intermediaries cache responses.", check: "For stale data, compare Cache-Control on API responses, CDN responses and browser network entries." },
    { name: "ETag", category: "cache", example: "ETag: \"customer-42-v7\"", note: "A response validator clients can send back to avoid downloading unchanged content.", check: "If clients receive 304 unexpectedly, compare ETag generation with the resource version." },
    { name: "If-None-Match", category: "cache", example: "If-None-Match: \"customer-42-v7\"", note: "Lets the client ask whether the cached representation is still current.", check: "When debugging 304 responses, pair this request header with the response ETag." },
    { name: "Last-Modified", category: "cache", example: "Last-Modified: Mon, 01 Jun 2026 10:00:00 GMT", note: "Indicates when the server believes the resource last changed.", check: "For cache bugs, verify server clocks and whether generated resources use meaningful modification times." },
    { name: "Location", category: "response", example: "Location: /api/jobs/123", note: "Points clients to a created resource, redirect target or asynchronous job status URL.", check: "For 201, 202 and 3xx responses, confirm Location is absolute or relative in the way clients expect." },
    { name: "Retry-After", category: "response", example: "Retry-After: 60", note: "Tells clients how long to wait before retrying a request.", check: "Use it with 429 or 503 responses so clients do not create retry storms." },
    { name: "WWW-Authenticate", category: "response", example: "WWW-Authenticate: Bearer realm=\"api\"", note: "Explains how a client should authenticate after a 401 response.", check: "If clients cannot recover from 401 responses, inspect whether this header gives enough context." },
    { name: "X-Request-ID", category: "response", example: "X-Request-ID: req_01J...", note: "Connects a client-visible response to gateway, service and database logs.", check: "Expose a stable request ID on errors so support teams can find the exact server-side trace." },
    { name: "RateLimit-Limit", category: "response", example: "RateLimit-Limit: 1000", note: "Shows the request quota for a rate limit window when an API exposes standardized rate limit hints.", check: "Pair limit, remaining and reset information so clients can slow down before receiving 429." },
    { name: "Content-Security-Policy", category: "security", example: "Content-Security-Policy: default-src 'self'", note: "Restricts where pages can load scripts, images, frames and other resources.", check: "If analytics, ads or embedded tools fail to load, compare the blocked source with the CSP directives." },
    { name: "Strict-Transport-Security", category: "security", example: "Strict-Transport-Security: max-age=31536000; includeSubDomains", note: "Tells browsers to use HTTPS for future requests to the site.", check: "Enable it only after HTTPS works reliably for the domain and expected subdomains." },
    { name: "X-Content-Type-Options", category: "security", example: "X-Content-Type-Options: nosniff", note: "Tells browsers not to guess a different content type from the declared one.", check: "Use it with correct Content-Type values so scripts, styles and JSON are served predictably." },
    { name: "Referrer-Policy", category: "security", example: "Referrer-Policy: strict-origin-when-cross-origin", note: "Controls how much referrer information is sent when users navigate away or load subresources.", check: "Use a policy that keeps useful origin context without leaking full sensitive URLs." },
    { name: "Permissions-Policy", category: "security", example: "Permissions-Policy: geolocation=(), camera=()", note: "Limits access to browser features such as camera, microphone and geolocation.", check: "Use it to make unused powerful browser features unavailable by default." }
  ];

  var search = $("#headerSearch");
  var results = $("#headerResults");
  var meta = $("#headerMeta");

  function selectedCategory() {
    var selected = $('input[name="headerCategory"]:checked');
    return selected ? selected.value : "all";
  }

  function matches(item, query, category) {
    var categoryMatches = category === "all" || item.category === category;
    var haystack = [item.name, item.category, item.example, item.note, item.check].join(" ").toLowerCase();
    return categoryMatches && (!query || haystack.indexOf(query) !== -1);
  }

  function render() {
    var query = String(search.value || "").trim().toLowerCase();
    var category = selectedCategory();
    var visible = headers.filter(function (item) {
      return matches(item, query, category);
    });

    if (!visible.length) {
      results.innerHTML = '<div class="empty-reference">No headers matched this filter.</div>';
      setStatus(meta, "error", "0 matches");
      return;
    }

    setStatus(meta, "ok", visible.length + " matching headers");
    results.innerHTML = visible
      .map(function (item) {
        return (
          '<article class="status-card header-card">' +
          '<div class="header-card-title"><h2>' +
          escapeHtml(item.name) +
          "</h2><span>" +
          escapeHtml(item.category.toUpperCase()) +
          "</span></div><code>" +
          escapeHtml(item.example) +
          "</code><p>" +
          escapeHtml(item.note) +
          "</p><p><b>Debug check:</b> " +
          escapeHtml(item.check) +
          "</p>" +
          '<button class="secondary" type="button" data-copy-header="' +
          escapeHtml(item.name) +
          '">Copy note</button>' +
          "</article>"
        );
      })
      .join("");
  }

  function noteText(item) {
    return item.name + "\n" + item.example + "\n" + item.note + "\nDebug check: " + item.check;
  }

  function visibleText() {
    var query = String(search.value || "").trim().toLowerCase();
    var category = selectedCategory();
    return headers
      .filter(function (item) {
        return matches(item, query, category);
      })
      .map(noteText)
      .join("\n\n");
  }

  search.addEventListener("input", render);
  $$('input[name="headerCategory"]').forEach(function (input) {
    input.addEventListener("change", render);
  });

  document.addEventListener("click", function (event) {
    var copyHeader = event.target.getAttribute("data-copy-header");
    var action = event.target.getAttribute("data-action");

    if (copyHeader) {
      var item = headers.find(function (entry) {
        return entry.name === copyHeader;
      });
      if (item) {
        copyText(noteText(item)).then(function () {
          setStatus(meta, "ok", "Copied " + item.name);
        });
      }
    }

    if (action === "clear") {
      search.value = "";
      $('input[name="headerCategory"][value="all"]').checked = true;
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
