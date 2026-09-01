(function () {
  "use strict";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function byteSize(value) {
    var text = String(value || "");
    if (window.TextEncoder) {
      return new TextEncoder().encode(text).length;
    }
    return unescape(encodeURIComponent(text)).length;
  }

  function formatBytes(value) {
    var bytes = byteSize(value);
    if (bytes < 1024) {
      return bytes + " bytes";
    }
    return (bytes / 1024).toFixed(1) + " KB";
  }

  function lineCount(value) {
    var text = String(value || "");
    if (!text) {
      return 0;
    }
    return text.split(/\r\n|\r|\n/).length;
  }

  function setStatus(element, type, message) {
    if (!element) {
      return;
    }
    element.classList.remove("status-ok", "status-error");
    if (type === "ok") {
      element.classList.add("status-ok");
    }
    if (type === "error") {
      element.classList.add("status-error");
    }
    element.textContent = message;
  }

  function renderMetrics(element, items) {
    if (!element) {
      return;
    }
    element.innerHTML = items
      .map(function (item) {
        return (
          '<div class="metric"><b>' +
          escapeHtml(item.value) +
          "</b><span>" +
          escapeHtml(item.label) +
          "</span></div>"
        );
      })
      .join("");
  }

  function downloadText(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function copyText(content) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(content);
    }

    var textarea = document.createElement("textarea");
    textarea.value = content;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return Promise.resolve();
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var args = arguments;
      var context = this;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  var sidebarGroups = [
    {
      title: "Workspace",
      mode: "data",
      description: "Format, lint and clean the payload or code sample you are actively debugging.",
      links: [
        { label: "JSON Formatter", href: "index.html", icon: "{ }", description: "Format, minify, validate and inspect JSON tree output.", keywords: "json formatter json validator json beautifier json lint" },
        { label: "XML Formatter", href: "xml-formatter.html", icon: "</>", description: "Beautify XML and catch malformed structure before integration tests.", keywords: "xml formatter xml beautifier xml validator" },
        { label: "XML Linter", href: "xml-linter.html", icon: "XML", description: "Lint XML structure, parser errors and common document mistakes.", keywords: "xml lint xml linter xmllint xml validator" },
        { label: "YAML Formatter", href: "yaml-formatter.html", icon: "Y", description: "Clean indentation for CI, Docker, Kubernetes and config files.", keywords: "yaml formatter yaml lint yaml linter yaml indent" },
        { label: "YAML Indentation", href: "yaml-indentation.html", icon: "YML", description: "Review YAML spacing rules and indentation pitfalls.", keywords: "yaml indentation yaml indent yaml lint yaml linter" },
        { label: "SQL Formatter", href: "sql-formatter.html", icon: "SQL", description: "Make long queries readable before review or debugging.", keywords: "sql formatter sql beautifier sql format" },
        { label: "SQL Cleanup", href: "sql-cleanup.html", icon: "SQL", description: "Clean noisy SQL before sharing, comparing or reviewing it.", keywords: "sql cleanup clean sql sql clean query cleanup" },
        { label: "Python Formatter", href: "python-formatter.html", icon: "PY", description: "Normalize indentation and whitespace in Python snippets.", keywords: "python formatter python format python beautifier" },
        { label: "Python Indent Fixer", href: "python-indentation-fixer.html", icon: "TAB", description: "Fix mixed tabs and spaces before Python raises indentation errors.", keywords: "python indentation fixer python indent fixer python indentation" },
        { label: "XML Schema XSD", href: "xml-schema-xsd-guide.html", icon: "XSD", description: "Validate XML structure, elements, attributes, namespaces and integration contracts.", keywords: "xml schema xsd validation xml linter validate xml schema" },
        { label: "XML to JSON Guide", href: "xml-to-json-conversion-guide.html", icon: "X2J", description: "Handle attributes, arrays, namespaces, text nodes and safe API migration notes.", keywords: "xml to json conversion guide convert xml json attributes arrays namespaces" },
        { label: "YAML Lint Checklist", href: "yaml-lint-checklist.html", icon: "YML", description: "Review indentation, tabs, anchors, quoted strings, booleans and CI configuration.", keywords: "yaml lint checklist yaml indentation yaml parser github actions docker compose" },
        { label: "YAML Docker Compose", href: "yaml-docker-compose-guide.html", icon: "YML", description: "Review Docker Compose YAML indentation, environment variables, ports, volumes and service blocks.", keywords: "yaml docker compose guide indentation environment ports volumes" },
        { label: "XML Namespace Debugging", href: "xml-namespace-debugging-guide.html", icon: "NS", description: "Debug XML namespace prefixes, default namespaces and XPath surprises in integration payloads.", keywords: "xml namespace debugging default namespace prefix xpath integration" },
        { label: "CSV Cleanup", href: "csv-cleanup-guide.html", icon: "CSV", description: "Clean CSV headers, delimiters, quotes, blank rows and encoding issues before conversion to JSON.", keywords: "csv cleanup guide headers delimiter quotes encoding convert json" },
        { label: "JSON Array Filtering", href: "json-array-filtering-guide.html", icon: "ARR", description: "Inspect JSON arrays, missing fields, duplicates and filter assumptions before transforming data.", keywords: "json array filtering duplicate fields api response" },
        { label: "JSON Merge Patch", href: "json-merge-patch-guide.html", icon: "PATCH", description: "Understand partial JSON updates, null semantics and safer API PATCH request review.", keywords: "json merge patch api patch partial update null semantics" },
        { label: "JSON Path Query", href: "json-path-query-guide.html", icon: "PATH", description: "Use JSON path thinking to inspect nested payloads, arrays and optional fields before transforming data.", keywords: "json path query nested arrays" },
        { label: "JSON null vs undefined", href: "json-null-vs-undefined-guide.html", icon: "NULL", description: "Separate JSON null, missing fields and JavaScript undefined before debugging PATCH and schema behavior.", keywords: "json null vs undefined missing fields" },
        { label: "XML XPath Debugging", href: "xml-xpath-debugging-guide.html", icon: "XP", description: "Debug XPath selectors, namespaces, attributes and text nodes in XML integrations.", keywords: "xml xpath debugging namespace attribute" },
        { label: "YAML Anchors and Aliases", href: "yaml-anchors-aliases-guide.html", icon: "Y&A", description: "Use YAML anchors, aliases and merge keys carefully in CI, Docker and infrastructure configuration.", keywords: "yaml anchors aliases merge keys" },
        { label: "CSV UTF-8 Encoding", href: "csv-utf8-encoding-guide.html", icon: "UTF8", description: "Debug CSV encoding, delimiters, byte order marks and broken characters before imports.", keywords: "csv utf8 encoding bom delimiter" }
      ]
    },
    {
      title: "Regex Lab",
      mode: "regex",
      description: "Test patterns, capture groups and validation expressions with focused examples.",
      links: [
        { label: "Regex Matcher", href: "regex-tester.html", icon: ".*", description: "Run JavaScript regex patterns against sample text.", keywords: "regex matcher regex parser regex validator regular expression matcher validate regular expression" },
        { label: "Regex Guide", href: "regex-matcher.html", icon: "RX", description: "Learn matcher behavior, flags and parser tradeoffs.", keywords: "regex guide regex tutorial regex parser regular expression guide" },
        { label: "Regex Examples", href: "regex-examples.html", icon: "EX", description: "Review practical validation and extraction patterns.", keywords: "regex examples pattern checker regex pattern checker" },
        { label: "Email Regex", href: "regex-email-validator.html", icon: "@", description: "Compare realistic email validation cases.", keywords: "email regex email regex javascript email validation regex regex for email validation" },
        { label: "URL Regex", href: "regex-url-validator.html", icon: "URL", description: "Check link-shaped strings before parser-level validation.", keywords: "url regex url validator regex link regex" },
        { label: "UUID Regex", href: "regex-uuid-validator.html", icon: "ID", description: "Validate UUID v4 version and variant characters.", keywords: "uuid regex uuid validator uuid v4 regex" },
        { label: "Date Regex", href: "regex-date-validator.html", icon: "DATE", description: "Understand date pattern limits before calendar parsing.", keywords: "date regex date validator regex date pattern" },
        { label: "Log Parser", href: "regex-log-parser.html", icon: "LOG", description: "Extract timestamps, levels and messages from logs.", keywords: "regex log parser log parser regex log pattern" },
        { label: "Email Regex JavaScript", href: "email-regex-javascript-guide.html", icon: "@JS", description: "Review realistic JavaScript email validation rules, examples and edge cases.", keywords: "email regex javascript email validation regex regex for email validation js" },
        { label: "JavaScript Regex Cheatsheet", href: "javascript-regex-cheatsheet.html", icon: "JSRX", description: "Use flags, anchors, groups, classes, quantifiers, replacement and validation patterns.", keywords: "javascript regex cheatsheet js regex flags groups anchors replace match" },
        { label: "Lookahead Lookbehind", href: "regex-lookahead-lookbehind-guide.html", icon: "?=", description: "Use positive and negative assertions when nearby text should not be consumed.", keywords: "regex lookahead lookbehind positive negative assertion javascript regex" },
        { label: "Regex Replace", href: "regex-replace-guide.html", icon: "REP", description: "Clean strings with capture groups, whitespace normalization and safe replacements.", keywords: "regex replace javascript string replace capture groups cleanup" },
        { label: "Regex Performance", href: "regex-performance-guide.html", icon: "PERF", description: "Debug slow patterns, backtracking risk, large logs, input limits and parser choices.", keywords: "regex performance catastrophic backtracking slow regex javascript regex debug" },
        { label: "JavaScript Regex match vs test", href: "javascript-regex-match-vs-test.html", icon: "JS", description: "Choose the right JavaScript regex method before trusting a result.", keywords: "javascript regex match vs test regexp test string match matchall exec regex guide" },
        { label: "HEX Color Regex Validator", href: "regex-hex-color-validator.html", icon: "HEX", description: "Check color strings before converting them into RGB or HSL.", keywords: "hex color regex validator css color regex hex rgb hsl" },
        { label: "Slug Regex Validator", href: "regex-slug-validator.html", icon: "SLUG", description: "Keep public URLs clean, readable and predictable.", keywords: "slug regex url slug validator javascript seo friendly urls" },
        { label: "IP Address Regex Validator", href: "regex-ip-address-validator.html", icon: "IP", description: "Check IPv4 string shape before using network tools or address parsers.", keywords: "ip address regex ipv4 regex validator network debugging regular expression" },
        { label: "Password Regex Validation", href: "regex-password-validation-guide.html", icon: "PASS", description: "Design password checks that help users without creating fragile security theater.", keywords: "password regex validation javascript password policy regular expression security checklist" },
        { label: "Phone Number Regex Validation", href: "regex-phone-number-guide.html", icon: "TEL", description: "Validate phone-shaped input without pretending regex can prove a reachable number.", keywords: "phone regex phone number regex validation javascript international phone form validation" },
        { label: "Regex Capture Groups", href: "regex-capture-groups-guide.html", icon: "CAP", description: "Use numbered groups, named groups and non-capturing groups without making extraction code fragile.", keywords: "regex capture groups named groups non capturing javascript" },
        { label: "Regex Whitespace Normalization", href: "regex-whitespace-normalization.html", icon: "WS", description: "Normalize spaces, tabs, blank lines and pasted text safely before validation or import.", keywords: "regex whitespace normalization spaces tabs blank lines trim" },
        { label: "Regex Remove Duplicate Lines", href: "regex-remove-duplicate-lines.html", icon: "DUP", description: "Clean repeated lines in logs, lists and copied text with regex-aware review notes.", keywords: "regex remove duplicate lines duplicated text log cleanup" },
        { label: "Regex Extract Numbers", href: "regex-extract-numbers-guide.html", icon: "123", description: "Extract integers, decimals, negative values and IDs from text while keeping parsing limits clear.", keywords: "regex extract numbers integers decimals negative javascript" },
        { label: "Email Regex Python", href: "email-regex-python-guide.html", icon: "PY@", description: "Validate email-shaped strings in Python while keeping deliverability and account rules outside regex.", keywords: "email regex python re fullmatch validation" },
        { label: "Email Regex PHP", href: "email-regex-php-guide.html", icon: "PHP@", description: "Use PHP email validation, regex checks and filter_var without turning format checks into business truth.", keywords: "email regex php filter_var validation" },
        { label: "Regex Word Boundary", href: "regex-word-boundary-guide.html", icon: "\b", description: "Use word boundaries for tokens, IDs and search terms without surprising Unicode or punctuation behavior.", keywords: "regex word boundary javascript tokens" },
        { label: "Regex Multiline Anchors", href: "regex-multiline-anchors-guide.html", icon: "^$", description: "Understand anchors, multiline flags and line-by-line matching before parsing copied logs.", keywords: "regex multiline anchors flag javascript" },
        { label: "Regex URL Extraction", href: "regex-url-extraction-guide.html", icon: "URL", description: "Extract URLs from logs, Markdown and pasted text while knowing when a real URL parser is safer.", keywords: "regex url extraction link parser" }
      ]
    },
    {
      title: "Inspect & Convert",
      mode: "data",
      description: "Compare, decode, encode and generate values without leaving the browser.",
      links: [
        { label: "JSON Diff", href: "json-diff.html", icon: "DIFF", description: "Compare two JSON payloads field by field." },
        { label: "JSON Schema", href: "json-schema-generator.html", icon: "SCH", description: "Infer a starting schema from sample JSON." },
        { label: "CSV to JSON", href: "csv-to-json.html", icon: "CSV", description: "Convert tabular text into JSON arrays." },
        { label: "Base64", href: "base64-encoder-decoder.html", icon: "64", description: "Encode and decode UTF-8 Base64 strings." },
        { label: "URL Encode", href: "url-encoder-decoder.html", icon: "URL", description: "Escape query values and decode percent-encoded text." },
        { label: "Hash Generator", href: "hash-generator.html", icon: "#", description: "Create SHA digests for browser-side text samples." },
        { label: "UUID Generator", href: "uuid-generator.html", icon: "ID", description: "Generate UUID v4 identifiers quickly." },
        { label: "Color Converter", href: "color-converter.html", icon: "RGB", description: "Convert HEX, RGB and HSL values." }
      ]
    },
    {
      title: "API Debugging",
      mode: "api",
      description: "Use when a request fails and you need status, headers, tokens, retries, GraphQL evidence, cookies and incident notes.",
      links: [
        { label: "API Checklist", href: "api-debugging-checklist.html", icon: "FIX", description: "Track request identity, auth, payload, logs and fix notes." },
        { label: "curl API Cheatsheet", href: "curl-api-debugging-cheatsheet.html", icon: "curl", description: "Copy curl commands for headers, JSON payloads, auth, timing, TLS and preflight checks.", keywords: "curl api debugging cheatsheet curl headers json post bearer token timing tls cors preflight" },
        { label: "OAuth JWT Debugging", href: "oauth-jwt-debugging-checklist.html", icon: "AUTH", description: "Separate 401, 403, scopes, issuer, audience, expiration and refresh-token failures.", keywords: "oauth jwt debugging checklist 401 403 bearer token scopes issuer audience exp refresh token" },
        { label: "OpenAPI Contract Checklist", href: "openapi-contract-checklist.html", icon: "OAS", description: "Review paths, operations, parameters, schemas, responses, examples and auth contracts.", keywords: "openapi checklist swagger api contract paths operations parameters schemas responses examples security" },
        { label: "Webhook Debugging", href: "webhook-debugging-guide.html", icon: "HOOK", description: "Debug deliveries, signatures, retries, idempotency, raw body handling and queue handoff.", keywords: "webhook debugging guide webhook signature delivery retry idempotency raw body queue hmac" },
        { label: "API Pagination", href: "api-pagination-debugging.html", icon: "PAGE", description: "Debug Link headers, page size, cursors, offsets, missing results and duplicate rows.", keywords: "api pagination debugging link header cursor offset page per_page missing results duplicates" },
        { label: "Idempotency Retry Guide", href: "api-idempotency-retry-guide.html", icon: "RETRY", description: "Design safe retries, idempotency keys, duplicate POST handling and timeout recovery.", keywords: "api idempotency retry guide idempotency key duplicate post timeout backoff safe retry" },
        { label: "GraphQL API Debugging", href: "graphql-api-debugging-guide.html", icon: "GQL", description: "Debug GraphQL queries, variables, operation names, errors, partial data and HTTP behavior.", keywords: "graphql api debugging guide query variables errors partial data operation name graphql over http" },
        { label: "Cookie SameSite Debugging", href: "cookie-samesite-debugging.html", icon: "COOKIE", description: "Debug Secure, HttpOnly, SameSite, CORS credentials and session cookie failures.", keywords: "cookie samesite debugging secure httponly samesite none lax strict cors credentials session" },
        { label: "CORS Debugging", href: "cors-debugging-guide.html", icon: "CORS", description: "Debug Access-Control-Allow-Origin, OPTIONS preflight, credentials and Vary Origin behavior.", keywords: "cors debugging guide access-control-allow-origin preflight options credentials vary origin" },
        { label: "429 Rate Limit Debugging", href: "api-rate-limit-debugging.html", icon: "429", description: "Inspect Retry-After, RateLimit headers, quotas, backoff and throttled clients.", keywords: "429 too many requests rate limit debugging retry-after ratelimit headers quota backoff api throttling" },
        { label: "Cache-Control Guide", href: "http-cache-control-guide.html", icon: "CACHE", description: "Review browser cache, CDN cache, no-cache, no-store, max-age and immutable rules.", keywords: "cache-control guide http cache headers max-age no-cache no-store immutable cdn browser cache" },
        { label: "Security Headers", href: "http-security-headers-checklist.html", icon: "SEC", description: "Check CSP, HSTS, nosniff, frame protection, referrer policy and permissions policy.", keywords: "http security headers checklist csp hsts x-content-type-options nosniff referrer-policy permissions-policy" },
        { label: "HTTP Status", href: "http-status-codes.html", icon: "HTTP", description: "Search status codes and debugging meaning." },
        { label: "HTTP Headers", href: "http-headers-reference.html", icon: "HDR", description: "Review cache, CORS, auth and security headers." },
        { label: "JWT Decoder", href: "jwt-decoder.html", icon: "JWT", description: "Decode token headers, claims and expiration values." },
        { label: "Timestamp", href: "timestamp-converter.html", icon: "TIME", description: "Convert Unix and ISO timestamps while debugging logs." },
        { label: "Cron Parser", href: "cron-expression-parser.html", icon: "CRON", description: "Explain schedules and preview upcoming runs." },
        { label: "JWT Expiration Debugging", href: "jwt-expiration-debugging.html", icon: "EXP", description: "Understand token time claims without exposing real credentials.", keywords: "jwt expiration debugging exp iat nbf clock skew refresh token bearer token" },
        { label: "API Timeout Debugging", href: "api-timeout-debugging-guide.html", icon: "TIME", description: "Turn vague timeout reports into ordered evidence.", keywords: "api timeout debugging gateway timeout client timeout curl timing dns tls upstream database" },
        { label: "API 401 vs 403 Debugging", href: "api-401-403-debugging-guide.html", icon: "401", description: "Separate missing authentication from denied authorization.", keywords: "401 403 api debugging unauthorized forbidden jwt oauth bearer token scope role" },
        { label: "OAuth Refresh Token Debugging", href: "oauth-refresh-token-debugging.html", icon: "RT", description: "Debug refresh-token rotation, expired sessions, revoked grants and frontend retry loops.", keywords: "oauth refresh token debugging rotation revoked grant session" },
        { label: "Webhook Signature Verification", href: "webhook-signature-verification-guide.html", icon: "HMAC", description: "Verify webhook signatures with raw bodies, timestamps, HMAC secrets and replay protection.", keywords: "webhook signature verification hmac raw body timestamp replay" },
        { label: "API Versioning Strategy", href: "api-versioning-strategy-guide.html", icon: "VER", description: "Plan URL, header and media-type API versioning so client integrations do not break quietly.", keywords: "api versioning strategy url header media type backward compatibility" },
        { label: "REST API Error Response", href: "rest-api-error-response-guide.html", icon: "ERR", description: "Design and debug consistent REST API error responses with status, code, message, details and correlation IDs.", keywords: "rest api error response format status code correlation id problem details" },
        { label: "HTTP Request Methods", href: "http-request-methods-guide.html", icon: "HTTP", description: "Understand GET, POST, PUT, PATCH, DELETE, HEAD and OPTIONS before debugging API behavior.", keywords: "http request methods get post put patch delete options api" },
        { label: "curl POST JSON Request", href: "curl-post-json-guide.html", icon: "POST", description: "Build repeatable curl POST requests for JSON APIs without losing headers, body shape or auth context.", keywords: "curl post json request api debugging content-type bearer token" },
        { label: "curl Headers Debugging", href: "curl-headers-debugging-guide.html", icon: "HDR", description: "Inspect request and response headers with curl before changing API clients, proxies or CORS settings.", keywords: "curl headers debugging response request" },
        { label: "curl Bearer Token", href: "curl-bearer-token-guide.html", icon: "AUTH", description: "Test bearer-token APIs with curl while redacting secrets and separating auth from payload errors.", keywords: "curl bearer token authorization header api" },
        { label: "Postman to curl Debugging", href: "postman-to-curl-debugging-guide.html", icon: "PM", description: "Turn a Postman request into a repeatable curl command for tickets, terminals and CI evidence.", keywords: "postman to curl debugging api" },
        { label: "API Request Body Validation", href: "api-request-body-validation-guide.html", icon: "BODY", description: "Debug JSON request-body validation, content types, required fields and schema mismatch errors.", keywords: "api request body validation json schema" },
        { label: "API Correlation ID Logging", href: "api-correlation-id-logging-guide.html", icon: "CID", description: "Use correlation IDs to connect frontend errors, gateway logs, service logs and database evidence.", keywords: "api correlation id logging request id" },
        { label: "JWT Signature Verification", href: "jwt-signature-verification-guide.html", icon: "JWS", description: "Verify JWT algorithms, keys and signatures without exposing real tokens or trusting decoded claims blindly.", keywords: "jwt signature verification jwks algorithm" }
      ]
    },
    {
      title: "Shell & DBA Ops",
      mode: "ops",
      description: "Move between Windows shells, Git Bash and Linux server consoles with repeatable DBA checks.",
      links: [
        { label: "DBA Admin Roadmap", href: "dba-admin-roadmap.html", icon: "DBA", description: "Follow a practical database administrator operating path from access to incidents.", keywords: "dba admin roadmap database administrator checklist backup restore monitoring maintenance incident" },
        { label: "Terminal Workflows", href: "terminal-workflows-for-developers.html", icon: ">_", description: "Choose CMD, PowerShell, Git Bash or Linux shell for daily engineering tasks.", keywords: "cmd powershell git bash linux terminal command line developer dba workflow" },
        { label: "Cockpit Server Guide", href: "linux-cockpit-server-guide.html", icon: "9090", description: "Install Cockpit and expose a safe browser console for Linux server administration.", keywords: "cockpit linux server setup dba web console install ubuntu debian rhel centos fedora cockpit 9090" },
        { label: "Docker Compose Debugging", href: "docker-compose-debugging-guide.html", icon: "DC", description: "Inspect services, logs, ports, volumes, healthchecks and rebuilds without guesswork.", keywords: "docker compose debugging docker compose logs up down ps exec healthcheck volumes ports" },
        { label: "Nginx Reverse Proxy Checklist", href: "nginx-reverse-proxy-checklist.html", icon: "NGX", description: "Debug proxy config, upstreams, headers, TLS, redirects and service logs.", keywords: "nginx reverse proxy checklist nginx config test proxy_pass upstream headers tls redirect logs" },
        { label: "Docker Env Files", href: "docker-env-file-guide.html", icon: ".ENV", description: "Debug Compose variables, quoting, secrets boundaries, defaults and deployments.", keywords: "docker env file docker compose environment variables .env guide" },
        { label: "Kubernetes Pod Debugging", href: "kubernetes-pod-debugging-guide.html", icon: "K8S", description: "Investigate Pending, CrashLoopBackOff, ImagePullBackOff, logs and events.", keywords: "kubernetes pod debugging crashloopbackoff imagepullbackoff kubectl describe logs" },
        { label: "DNS Debugging", href: "dns-debugging-guide.html", icon: "DNS", description: "Check A, CNAME, TXT, MX, nameservers, propagation, TTL and domain launch issues.", keywords: "dns debugging guide a cname txt mx nameserver ttl propagation" },
        { label: "TLS Certificate Debugging", href: "tls-certificate-debugging-guide.html", icon: "TLS", description: "Debug HTTPS failures, redirects, certificate names, expiry, chains and mixed content.", keywords: "tls certificate debugging https ssl certificate chain expiry mixed content" },
        { label: "Nginx 502 504", href: "nginx-502-504-debugging-guide.html", icon: "502", description: "Debug upstream health, proxy timeouts, logs, DNS, TLS and gateway ownership.", keywords: "nginx 502 504 debugging bad gateway gateway timeout proxy upstream" },
        { label: "PowerShell Network Debugging", href: "powershell-network-debugging-guide.html", icon: "PS", description: "Use ping, TCP port tests, DNS, routes, services and Windows API connectivity checks.", keywords: "powershell network debugging test-netconnection port dns route windows" },
        { label: "Git Merge Conflicts", href: "git-merge-conflict-guide.html", icon: "GIT", description: "Read conflict markers, choose changes, test the result and finish merges safely.", keywords: "git merge conflict guide resolve conflict markers git status" },
        { label: "Git Rebase Workflow", href: "git-rebase-workflow-guide.html", icon: "BASE", description: "Update branches, resolve conflicts, continue safely and avoid history surprises.", keywords: "git rebase workflow resolve conflicts rebase continue abort" },
        { label: "PowerShell curl vs Invoke-WebRequest", href: "powershell-curl-invoke-webrequest-guide.html", icon: "PS", description: "Avoid Windows shell surprises while testing APIs.", keywords: "powershell curl invoke-webrequest invoke-restmethod api debugging windows" },
        { label: "Linux journalctl for Developers and DBAs", href: "linux-journalctl-guide.html", icon: "JNL", description: "Turn Linux service logs into ordered incident evidence.", keywords: "journalctl guide linux service logs systemd dba incident debugging" },
        { label: "Docker Container Logs", href: "docker-container-logs-guide.html", icon: "LOGS", description: "Read container logs without losing service context.", keywords: "docker logs container logs docker compose logs tail timestamps debugging guide" },
        { label: "Git Branch Cleanup", href: "git-branch-cleanup-guide.html", icon: "BR", description: "Clean local and remote Git branches safely after merges, releases and abandoned experiments.", keywords: "git branch cleanup delete local remote merged branches" },
        { label: "Linux systemctl Debugging", href: "linux-systemctl-debugging-guide.html", icon: "SYS", description: "Use systemctl status, restart history, unit files and journal evidence during service incidents.", keywords: "linux systemctl debugging service status unit file journalctl" },
        { label: "Kubernetes CrashLoopBackOff", href: "kubernetes-crashloopbackoff-guide.html", icon: "K8S", description: "Investigate CrashLoopBackOff with logs, events, probes, env vars and container exit codes.", keywords: "kubernetes crashloopbackoff guide pod logs events probes exit code" },
        { label: "Docker Volume Debugging", href: "docker-volume-debugging-guide.html", icon: "VOL", description: "Debug Docker volumes, bind mounts, permissions, persistence and missing files.", keywords: "docker volume debugging bind mount permissions persistence" },
        { label: "Linux Disk Space Debugging", href: "linux-disk-space-debugging-guide.html", icon: "DISK", description: "Find which filesystem, directory, container or log stream is consuming Linux disk space.", keywords: "linux disk space debugging df du journal" },
        { label: "Nginx Access Log Analysis", href: "nginx-access-log-analysis-guide.html", icon: "LOG", description: "Use access logs to inspect status codes, latency, upstream behavior and suspicious traffic.", keywords: "nginx access log analysis status latency" }
      ]
    },
    {
      title: "Database Operations",
      mode: "db",
      description: "Start from connection, health, sessions, storage and backup evidence before tuning SQL.",
      links: [
        { label: "PostgreSQL DBA Checklist", href: "postgresql-dba-checklist.html", icon: "PG", description: "Use psql, system checks and safe SQL to inspect PostgreSQL hosts.", keywords: "postgresql dba checklist psql postgres commands backup restore vacuum connections locks database admin" },
        { label: "MySQL DBA Checklist", href: "mysql-dba-checklist.html", icon: "MY", description: "Inspect MySQL identity, processlist, InnoDB, slow logs, backups and service state.", keywords: "mysql dba checklist mysql commands processlist innodb slow query mysqldump mysqladmin database admin" },
        { label: "Redis Debugging Checklist", href: "redis-debugging-checklist.html", icon: "RED", description: "Use redis-cli, INFO, memory, clients, slowlog and keyspace checks safely.", keywords: "redis debugging checklist redis-cli info memory clients slowlog keyspace latency cache" },
        { label: "DBA Admin Roadmap", href: "dba-admin-roadmap.html", icon: "DBA", description: "Follow access, backup, restore, monitoring and incident routines.", keywords: "dba admin roadmap database administrator checklist backup restore monitoring maintenance incident" },
        { label: "SQL Cleanup", href: "sql-cleanup.html", icon: "SQL", description: "Clean noisy SQL before sharing, comparing or reviewing it.", keywords: "sql cleanup clean sql sql clean query cleanup" },
        { label: "SQL Formatter", href: "sql-formatter.html", icon: "SQL", description: "Make long queries readable before review or debugging.", keywords: "sql formatter sql beautifier sql format" },
        { label: "PostgreSQL Locks", href: "postgresql-lock-debugging-guide.html", icon: "LOCK", description: "Debug blocked sessions, pg_stat_activity, pg_locks, transactions and incidents.", keywords: "postgresql lock debugging pg_locks pg_stat_activity blocked sessions" },
        { label: "PostgreSQL Indexes", href: "postgresql-index-debugging-guide.html", icon: "IDX", description: "Review EXPLAIN, missing indexes, unused indexes, row estimates and query evidence.", keywords: "postgresql index debugging explain analyze missing unused indexes" },
        { label: "MySQL Slow Queries", href: "mysql-slow-query-debugging-guide.html", icon: "SLOW", description: "Use slow query log, EXPLAIN, indexes, lock time and rows examined evidence.", keywords: "mysql slow query debugging slow query log explain rows examined indexes" },
        { label: "Redis Memory Debugging", href: "redis-memory-debugging-guide.html", icon: "RAM", description: "Find Redis memory pressure before deleting keys in a hurry.", keywords: "redis memory debugging info memory maxmemory policy big keys cache incident" },
        { label: "MySQL Index Debugging", href: "mysql-index-debugging-guide.html", icon: "MYI", description: "Use evidence before adding another index.", keywords: "mysql index debugging explain composite index rows examined slow query guide" },
        { label: "PostgreSQL VACUUM and ANALYZE", href: "postgresql-vacuum-analyze-guide.html", icon: "VAC", description: "Read PostgreSQL maintenance symptoms before tuning blindly.", keywords: "postgresql vacuum analyze guide table bloat autovacuum planner statistics dba" },
        { label: "SQL WHERE Clause Debugging", href: "sql-where-clause-debugging.html", icon: "WHERE", description: "Stop tiny WHERE mistakes from becoming wrong reports.", keywords: "sql where clause debugging and or precedence null date range query filter" },
        { label: "SQL JOIN Debugging", href: "sql-join-debugging-guide.html", icon: "JOIN", description: "Find why a JOIN returns too many, too few or duplicated rows.", keywords: "sql join debugging inner join left join duplicate rows missing rows query guide" },
        { label: "Redis SLOWLOG Debugging", href: "redis-slowlog-debugging-guide.html", icon: "SLOW", description: "Use Redis SLOWLOG to inspect expensive commands, latency symptoms and cache misuse.", keywords: "redis slowlog debugging latency expensive commands cache" },
        { label: "MySQL Processlist Debugging", href: "mysql-processlist-debugging-guide.html", icon: "PROC", description: "Use MySQL processlist evidence to inspect active queries, locks, sleep sessions and incidents.", keywords: "mysql processlist debugging show full processlist active queries locks" },
        { label: "PostgreSQL EXPLAIN ANALYZE", href: "postgresql-explain-analyze-guide.html", icon: "PLAN", description: "Read PostgreSQL query plans, row estimates, loops, timing and index usage safely.", keywords: "postgresql explain analyze guide query plan index scan seq scan" },
        { label: "SQL Date Range Debugging", href: "sql-date-range-debugging.html", icon: "DATE", description: "Review SQL date ranges, inclusive boundaries, timezones and index-friendly filters.", keywords: "sql date range debugging timezone inclusive boundary timestamp" },
        { label: "SQL GROUP BY Debugging", href: "sql-group-by-debugging-guide.html", icon: "GRP", description: "Debug grouped SQL reports, aggregates, HAVING filters and missing dimensions.", keywords: "sql group by debugging aggregate having count sum report" },
        { label: "PostgreSQL Connection Limit", href: "postgresql-connection-limit-guide.html", icon: "CONN", description: "Inspect active PostgreSQL sessions, pool pressure and connection limits before restarting services.", keywords: "postgresql connection limit pg_stat_activity" },
        { label: "MySQL Deadlock Debugging", href: "mysql-deadlock-debugging-guide.html", icon: "DEAD", description: "Read InnoDB deadlock evidence and transaction patterns before changing indexes or retry logic.", keywords: "mysql deadlock debugging innodb status" },
        { label: "Redis Key Naming", href: "redis-key-naming-guide.html", icon: "KEY", description: "Design Redis key names that are searchable, safe to expire and easier to debug during incidents.", keywords: "redis key naming convention cache" }
      ]
    },
    {
      title: "Operating Systems",
      mode: "os",
      description: "Choose Windows or Linux first, then use the commands that match the host you are administering.",
      links: [
        { label: "Windows Admin Commands", href: "windows-admin-command-guide.html", icon: "WIN", description: "Use CMD and PowerShell checks for services, ports, disks, logs and database hosts.", keywords: "windows admin commands powershell cmd dba services ports event logs disk sql server" },
        { label: "Linux Admin Commands", href: "linux-admin-command-guide.html", icon: "LIN", description: "Use Linux shell checks for services, logs, ports, storage, packages and users.", keywords: "linux admin commands bash dba systemctl journalctl ss df firewall server" }
      ]
    },
    {
      title: "Software Runtime",
      mode: "code",
      description: "Inspect language runtimes before blaming application code or deployment scripts.",
      links: [
        { label: "PHP Runtime Guide", href: "php-runtime-guide.html", icon: "PHP", description: "Check PHP CLI, FPM, Composer, extensions, php.ini and web server integration.", keywords: "php runtime guide php install composer php-fpm php ini extensions apache nginx" },
        { label: "Java Runtime Guide", href: "java-runtime-guide.html", icon: "JAVA", description: "Check JDK, JAVA_HOME, Maven, Gradle, memory flags and service runtime behavior.", keywords: "java runtime guide jdk install java_home maven gradle openjdk jar service" },
        { label: "Python Runtime Guide", href: "python-runtime-guide.html", icon: "PY", description: "Check Python, pip, virtual environments, services and package paths.", keywords: "python runtime guide python install pip venv virtualenv django flask fastapi service" },
        { label: "Node.js Runtime Guide", href: "nodejs-runtime-guide.html", icon: "NODE", description: "Check Node, npm, npx, package managers, build scripts, ports and process managers.", keywords: "nodejs runtime guide node npm npx pnpm yarn pm2 vite next express install debug" },
        { label: "npm Dependency Debugging", href: "nodejs-npm-dependency-debugging.html", icon: "NPM", description: "Debug package-lock, npm install, npm ci, scripts, engines and module resolution.", keywords: "nodejs npm dependency debugging package lock npm install npm ci module not found" },
        { label: "PHP Composer Autoload", href: "php-composer-autoload-guide.html", icon: "CMP", description: "Debug vendor files, namespaces, class maps, optimized autoload and deployments.", keywords: "php composer autoload debugging class not found vendor dump autoload" },
        { label: "Java Memory Debugging", href: "java-memory-debugging-guide.html", icon: "HEAP", description: "Check heap settings, OutOfMemoryError, container limits, GC logs and JVM evidence.", keywords: "java memory debugging heap outofmemoryerror xmx gc logs container" },
        { label: "Node.js Environment Variable Debugging", href: "nodejs-env-debugging-guide.html", icon: "ENV", description: "Find where an environment variable disappears.", keywords: "nodejs env debugging environment variables npm scripts docker pm2 vite next" },
        { label: "Python Virtualenv Debugging", href: "python-virtualenv-debugging-guide.html", icon: "VENV", description: "Find why Python works in one shell but fails in the service.", keywords: "python virtualenv debugging venv pip import module not found service deployment" },
        { label: "Java Thread Dump Debugging", href: "java-thread-dump-guide.html", icon: "THD", description: "Capture JVM evidence before restarting the service.", keywords: "java thread dump debugging jstack deadlock blocked threads high cpu jvm" },
        { label: "PHP-FPM and Nginx Debugging", href: "php-fpm-nginx-debugging-guide.html", icon: "FPM", description: "Find whether the failure belongs to Nginx, PHP-FPM or application code.", keywords: "php-fpm nginx debugging 502 socket pool permissions php runtime guide" },
        { label: "Java Maven Dependency Debugging", href: "java-maven-dependency-debugging.html", icon: "MVN", description: "Debug Maven dependency trees, version conflicts, exclusions and build-classpath surprises.", keywords: "java maven dependency debugging tree conflict exclusion" },
        { label: "PHP Composer Dependency Conflict", href: "php-composer-dependency-conflict-guide.html", icon: "CMP", description: "Debug Composer version conflicts, platform requirements, lock files and package constraints.", keywords: "php composer dependency conflict lock file platform requirements" },
        { label: "Python pip Requirements", href: "python-pip-requirements-guide.html", icon: "PIP", description: "Debug requirements.txt, pip installs, package versions and virtual environment mismatches.", keywords: "python pip requirements debugging" },
        { label: "PHP ini Configuration", href: "php-ini-configuration-guide.html", icon: "INI", description: "Find which php.ini file is active for CLI, FPM and web requests before changing settings.", keywords: "php ini configuration cli fpm" },
        { label: "Java Classpath Debugging", href: "java-classpath-debugging-guide.html", icon: "CP", description: "Debug classpath, missing classes, duplicate jars and service runtime differences in Java apps.", keywords: "java classpath debugging classnotfound" },
        { label: "Node.js package.json Scripts", href: "nodejs-package-json-scripts-guide.html", icon: "NPM", description: "Read npm scripts, environment variables and build commands before debugging Node.js deployments.", keywords: "nodejs package json scripts npm" }
      ]
    },
    // Formalint expanded domain groups start
    {
      title: "Security & Compliance",
      mode: "security",
      description: "Review browser security, secrets, cookies, API keys and dependency risk before release.",
      links: [
        { label: "Content Security Policy Debugging", href: "csp-debugging-guide.html", icon: "CSP", description: "Debug CSP violations, script sources, nonce usage, reports and safe rollout steps without weakening browser security.", keywords: "csp debugging content security policy nonce script-src" },
        { label: "HSTS Preload", href: "hsts-preload-guide.html", icon: "HSTS", description: "Review HSTS headers, preload requirements, subdomain risk and HTTPS rollout checks before submitting a domain.", keywords: "hsts preload guide strict transport security" },
        { label: "CSRF Token Debugging", href: "csrf-token-debugging-guide.html", icon: "CSRF", description: "Debug CSRF token mismatches, SameSite cookies, forms, headers and cross-origin session flows.", keywords: "csrf token debugging samesite cookie header" },
        { label: "API Key Rotation", href: "api-key-rotation-guide.html", icon: "KEY", description: "Rotate API keys with inventory, staged rollout, logging, rollback and safe secret handling.", keywords: "api key rotation secrets rollback" },
        { label: "Secrets Redaction Checklist", href: "secrets-redaction-checklist.html", icon: "MASK", description: "Redact tokens, passwords, connection strings and customer identifiers before sharing logs or payloads.", keywords: "secrets redaction checklist token password log" },
        { label: "Dependency Vulnerability Triage", href: "dependency-vulnerability-triage-guide.html", icon: "CVE", description: "Triage dependency vulnerabilities by reachability, exploitability, version constraints and release risk.", keywords: "dependency vulnerability triage cve npm composer maven pip" },
        { label: "Secure Cookie Checklist", href: "secure-cookie-checklist.html", icon: "CK", description: "Review Secure, HttpOnly, SameSite, domain, path and expiration choices for web session cookies.", keywords: "secure cookie checklist httponly samesite" }
      ]
    },
    {
      title: "CI/CD & Release",
      mode: "delivery",
      description: "Debug build pipelines, release checks, failing tests, secrets and rollback paths.",
      links: [
        { label: "GitHub Actions Debugging", href: "github-actions-debugging-guide.html", icon: "GHA", description: "Debug failed GitHub Actions jobs with logs, runners, checkout state, caches, secrets and matrix values.", keywords: "github actions debugging workflow logs runner" },
        { label: "GitHub Actions Environment Secrets", href: "github-actions-env-secrets-guide.html", icon: "ENV", description: "Use GitHub Actions secrets, variables and environments without leaking values into logs or builds.", keywords: "github actions secrets environment variables" },
        { label: "Docker Build Cache Debugging", href: "docker-build-cache-debugging-guide.html", icon: "BUILD", description: "Debug Docker build cache, layers, build args, context size and stale images in CI pipelines.", keywords: "docker build cache debugging buildkit layers" },
        { label: "CI Failing Tests Debugging", href: "ci-failing-tests-debugging-guide.html", icon: "TEST", description: "Separate flaky tests, missing services, env drift, dependency changes and timeout failures in CI.", keywords: "ci failing tests debugging flaky env timeout" },
        { label: "Deployment Rollback Checklist", href: "deployment-rollback-checklist.html", icon: "ROLL", description: "Prepare rollback evidence, database compatibility, feature flags and release notes before production deploys.", keywords: "deployment rollback checklist release" },
        { label: "Release Checklist for Developers", href: "release-checklist-for-developers.html", icon: "REL", description: "Ship safer releases with version notes, migrations, monitoring, smoke tests and support handoff.", keywords: "release checklist developers deployment" }
      ]
    },
    {
      title: "Observability",
      mode: "observe",
      description: "Keep logs, health checks, uptime monitors and reliability signals actionable.",
      links: [
        { label: "Log Levels", href: "log-levels-guide.html", icon: "LOG", description: "Choose debug, info, warn and error levels so production logs stay useful during incidents.", keywords: "log levels guide debug info warn error" },
        { label: "Structured Logging", href: "structured-logging-guide.html", icon: "JSON", description: "Design JSON logs with correlation IDs, event names, user-safe fields and searchable incident context.", keywords: "structured logging json correlation id" },
        { label: "Application Health Check", href: "application-health-check-guide.html", icon: "HEALTH", description: "Design health endpoints that separate liveness, readiness, dependencies and degraded service states.", keywords: "application health check liveness readiness" },
        { label: "Uptime Monitoring Checklist", href: "uptime-monitoring-checklist.html", icon: "UP", description: "Monitor public endpoints, APIs, certificates and user-visible flows without creating noisy alerts.", keywords: "uptime monitoring checklist api certificate" },
        { label: "Error Budget and SLO", href: "error-budget-slo-guide.html", icon: "SLO", description: "Use SLOs and error budgets to explain reliability work, incidents and release risk.", keywords: "error budget slo guide reliability" }
      ]
    },
    {
      title: "Cloud Deployment",
      mode: "cloud",
      description: "Prepare DNS, HTTPS, static hosting, platform environment variables and CDN cache changes.",
      links: [
        { label: "Cloudflare DNS Deployment", href: "cloudflare-dns-deployment-guide.html", icon: "CF", description: "Prepare Cloudflare DNS, proxy mode, SSL settings, redirects and verification before launching a site.", keywords: "cloudflare dns deployment ssl proxy" },
        { label: "Vercel Environment Variables", href: "vercel-environment-variables-guide.html", icon: "VC", description: "Debug Vercel environment variables across preview, production and local development builds.", keywords: "vercel environment variables production preview" },
        { label: "Static Site Deployment Checklist", href: "static-site-deployment-checklist.html", icon: "STATIC", description: "Launch static sites with canonical URLs, sitemap, robots, HTTPS, analytics and cache checks.", keywords: "static site deployment checklist sitemap https" },
        { label: "GitHub Pages Custom Domain", href: "github-pages-custom-domain-guide.html", icon: "PAGES", description: "Connect a custom domain to GitHub Pages with A records, CNAME, HTTPS and DNS propagation checks.", keywords: "github pages custom domain cname a record https" },
        { label: "SSL Renewal Debugging", href: "ssl-renewal-debugging-guide.html", icon: "SSL", description: "Debug SSL renewal, certificate chains, DNS validation, rate limits and expired HTTPS endpoints.", keywords: "ssl renewal debugging certificate dns validation" },
        { label: "CDN Cache Purge", href: "cdn-cache-purge-guide.html", icon: "CDN", description: "Purge CDN cache safely while preserving user performance, asset versioning and rollout evidence.", keywords: "cdn cache purge guide asset versioning" },
        { label: "Robots.txt and Sitemap Launch", href: "robots-txt-sitemap-launch-guide.html", icon: "BOT", description: "Review robots.txt, sitemap URLs, canonical targets and indexing signals before a public launch.", keywords: "robots txt sitemap launch canonical indexing" }
      ]
    },
    // Formalint expanded domain groups end
    {
      title: "Hardware & Capacity",
      mode: "hardware",
      description: "Connect CPU, memory, disk and network symptoms to database and application incidents.",
      links: [
        { label: "Hardware Diagnostics", href: "hardware-diagnostics-guide.html", icon: "HW", description: "Run safe Windows and Linux checks for CPU, RAM, disks, IO and network pressure.", keywords: "hardware diagnostics cpu memory disk io network windows linux dba capacity" }
      ]
    },
    {
      title: "Reference",
      mode: "learn",
      description: "Read original guides that explain when each formatter, linter or validator is the right tool.",
      links: [
        { label: "All Tools", href: "tools.html", icon: "ALL", description: "Browse the complete Formalint tool directory." },
        { label: "Guides", href: "guides.html", icon: "DOC", description: "Start from the full reference library." },
        { label: "Complete Regex Guide", href: "complete-regex-guide.html", icon: "RX", description: "Learn regex fundamentals and testing discipline." },
        { label: "Data Formats Guide", href: "data-formats-guide.html", icon: "FMT", description: "Compare JSON, XML and YAML tradeoffs." },
        { label: "API Handbook", href: "api-debugging-handbook.html", icon: "API", description: "Follow a repeatable API debugging process." },
        { label: "Data Validation", href: "developer-data-validation-guide.html", icon: "VAL", description: "Separate syntax checks from business validation." },
        { label: "Formatter vs Linter", href: "formatter-linter-validator-guide.html", icon: "LINT", description: "Understand formatter, linter and validator responsibilities." },
        { label: "Safe Tools", href: "safe-online-dev-tools.html", icon: "SEC", description: "Know what not to paste into online utilities." },
        { label: "How Formalint Works", href: "how-formalint-works.html", icon: "OPS", description: "Read privacy, local-first and maintenance notes." }
      ]
    }
  ];

  var railModes = [
    {
      mode: "data",
      icon: "{ }",
      label: "Data tools",
      description: "Format, convert and inspect structured data.",
      tip: "Start here when a payload is hard to read, compare or validate.",
      href: "index.html",
      workflow: [
        "Paste only safe sample data, not secrets or customer records.",
        "Format or lint the payload before changing business logic.",
        "Compare schema, diff or conversion output when structure looks suspicious.",
        "Copy the clean result back into your local editor and review it there."
      ]
    },
    {
      mode: "regex",
      icon: ".*",
      label: "Regex lab",
      description: "Test patterns and validation examples.",
      tip: "Use this mode to check matches, groups, edge cases and realistic validation limits.",
      href: "regex-tester.html",
      workflow: [
        "Write the smallest pattern that proves the exact match you need.",
        "Test valid, invalid, empty and long examples before using it in production.",
        "Check capture groups separately from the full match.",
        "Move strict business validation into code when regex becomes too clever."
      ]
    },
    {
      mode: "api",
      icon: "API",
      label: "API debugging",
      description: "Debug curl requests, auth, webhooks, pagination, contracts, status codes, headers, CORS, cache, security, tokens and schedules.",
      tip: "Use this mode when a request fails and you need reproducible curl evidence, auth checks, webhook delivery notes, pagination proof, OpenAPI contract checks and browser headers.",
      href: "api-debugging-checklist.html",
      workflow: [
        "Record method, URL, status code, correlation id and environment first.",
        "Use curl to capture headers, response body, redirects and timing without browser noise.",
        "Check authentication, webhook delivery, pagination, OpenAPI contract drift, CORS, cache, security headers, payload shape and retry behavior separately.",
        "Decode timestamps or JWT claims only from safe non-sensitive samples.",
        "Write the final cause and fix note so the issue is searchable later."
      ]
    },
    {
      mode: "learn",
      icon: "?",
      label: "Guides",
      description: "Open original guides and safety references.",
      tip: "Use this mode when you need the why behind a formatter, linter or validator.",
      href: "guides.html",
      workflow: [
        "Choose the guide that matches the decision you are making.",
        "Confirm whether you need formatting, linting, parsing or validation.",
        "Use the safety guidance before pasting data into any web tool.",
        "Return to the matching Formalint tool once the workflow is clear."
      ]
    },
    {
      mode: "ops",
      icon: ">_",
      label: "Shell & DBA ops",
      description: "Use command-line and Linux web console references.",
      tip: "Use this mode when you need repeatable shell commands, DBA checks or a Cockpit server console setup.",
      href: "terminal-workflows-for-developers.html",
      workflow: [
        "Pick the shell that matches the host: CMD or PowerShell for Windows, Git Bash for Git habits, Bash for Linux servers.",
        "Run read-only discovery commands before changing packages, services, firewall rules or database settings.",
        "Use Cockpit for browser-based Linux visibility, then keep privileged changes deliberate and logged.",
        "Document the final commands so another DBA can repeat the setup safely."
      ]
    },
    {
      mode: "os",
      icon: "OS",
      label: "OS admin",
      description: "Choose Windows or Linux operating-system workflows.",
      tip: "Use this mode first when the host operating system decides which commands, logs and service tools are available.",
      href: "windows-admin-command-guide.html",
      workflow: [
        "Identify the host operating system and shell before copying commands.",
        "Use Windows tools for services, Event Viewer, PowerShell networking and SQL Server hosts.",
        "Use Linux tools for systemd, journal logs, sockets, packages, mounts and permissions.",
        "Keep platform-specific findings in the incident note so handoff is repeatable."
      ]
    },
    {
      mode: "db",
      icon: "DB",
      label: "Database ops",
      description: "Inspect PostgreSQL, MySQL, Redis and SQL-side operational evidence.",
      tip: "Use this mode when a slow API, failing job or blocked deployment may really be a database connection, lock, cache, storage or backup issue.",
      href: "postgresql-dba-checklist.html",
      workflow: [
        "Confirm connection identity and server version before running diagnostic SQL.",
        "Check sessions, locks, cache health, database size and recent errors with read-only commands.",
        "Separate SQL readability from database health, Redis behavior, backup and restore evidence.",
        "Save commands and timestamps so the DBA handoff is repeatable."
      ]
    },
    {
      mode: "code",
      icon: "</>",
      label: "Software",
      description: "Inspect PHP, Java, Python, Node.js and runtime-level developer systems.",
      tip: "Use this mode when the problem might be a runtime, dependency, package, web server or environment-variable issue.",
      href: "php-runtime-guide.html",
      workflow: [
        "Check runtime version and executable path before changing code.",
        "Confirm package manager state, extensions and environment variables.",
        "Separate CLI behavior from service behavior for PHP, Java, Python and Node.js jobs.",
        "Write the exact runtime evidence beside the failing request or deployment."
      ]
    },
    {
      mode: "hardware",
      icon: "HW",
      label: "Hardware",
      description: "Inspect capacity, IO and host-level pressure.",
      tip: "Use this mode when slow queries, timeouts or service failures may be caused by CPU, memory, disk or network pressure.",
      href: "hardware-diagnostics-guide.html",
      workflow: [
        "Check CPU, memory, disk and network before tuning application code.",
        "Correlate host pressure with database slow queries and application timeouts.",
        "Keep destructive stress tests out of production unless approved.",
        "Document capacity evidence with timestamps and host names."
      ]
    }
  ];

  function currentPageName() {
    var path = window.location.pathname.split("/").pop();
    return path || "index.html";
  }

  function sidebarResourceList() {
    var resources = [];
    sidebarGroups.forEach(function (group) {
      group.links.forEach(function (link) {
        resources.push({
          label: link.label,
          href: link.href,
          icon: link.icon,
          description: link.description || "",
          keywords: link.keywords || "",
          group: group.title,
          mode: group.mode
        });
      });
    });
    return resources;
  }

  function readStoredJson(key, fallback) {
    try {
      var value = window.localStorage ? window.localStorage.getItem(key) : null;
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStoredJson(key, value) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      // Browser privacy modes can disable localStorage; Formalint still works without recents.
    }
  }

  function rememberResource(href) {
    if (!href) {
      return;
    }
    var existing = readStoredJson("formalintRecentTools", []);
    var updated = [href].concat(
      existing.filter(function (item) {
        return item !== href;
      })
    );
    writeStoredJson("formalintRecentTools", updated.slice(0, 6));
  }

  function recentResources(resources) {
    var hrefs = readStoredJson("formalintRecentTools", []);
    return hrefs
      .map(function (href) {
        return resources.filter(function (resource) {
          return resource.href === href;
        })[0];
      })
      .filter(Boolean);
  }

  function buildSidebarLink(link, pageName) {
    var isActive = link.href === pageName || (pageName === "" && link.href === "index.html");
    return (
      '<a class="sidebar-link' +
      (isActive ? " active" : "") +
      '" href="' +
      escapeHtml(link.href) +
      '">' +
      '<span class="sidebar-icon" aria-hidden="true">' +
      escapeHtml(link.icon) +
      "</span>" +
      '<span class="sidebar-link-copy"><span>' +
      escapeHtml(link.label) +
      "</span><small>" +
      escapeHtml(link.description || "") +
      "</small></span>" +
      "</a>"
    );
  }

  function setSidebarGroupOpen(group, isOpen) {
    if (!group) {
      return;
    }
    var button = $(".sidebar-group-toggle", group);
    var state = Boolean(isOpen);
    group.classList.toggle("open", state);
    if (button) {
      button.setAttribute("aria-expanded", state ? "true" : "false");
    }
  }

  function collapseSidebarGroups(sidebar) {
    $$(".sidebar-group", sidebar).forEach(function (group) {
      setSidebarGroupOpen(group, false);
    });
  }

  function buildSidebarGroup(group, index, pageName) {
    var groupId = "formalint-sidebar-group-" + index;
    return (
      '<section class="sidebar-group" data-sidebar-mode="' +
      escapeHtml(group.mode) +
      '">' +
      '<button class="sidebar-group-toggle" type="button" data-sidebar-group-toggle aria-expanded="false" aria-controls="' +
      groupId +
      '">' +
      '<span class="sidebar-group-heading">' +
      escapeHtml(group.title) +
      "</span>" +
      '<span class="sidebar-group-count">' +
      group.links.length +
      "</span>" +
      '<span class="sidebar-group-caret" aria-hidden="true">+</span>' +
      "</button>" +
      '<div class="sidebar-group-content" id="' +
      groupId +
      '">' +
      '<p class="sidebar-group-description">' +
      escapeHtml(group.description) +
      "</p>" +
      group.links
        .map(function (link) {
          return buildSidebarLink(link, pageName);
        })
        .join("") +
      "</div>" +
      "</section>"
    );
  }

  function detectInitialMode(pageName) {
    var matchedMode = "data";
    sidebarGroups.forEach(function (group) {
      group.links.forEach(function (link) {
        if (link.href === pageName) {
          matchedMode = group.mode;
        }
      });
    });
    return matchedMode;
  }

  function modeDetails(mode) {
    return (
      railModes.filter(function (item) {
        return item.mode === mode;
      })[0] || railModes[0]
    );
  }

  function activateRailMode(mode, sidebar, openGroups) {
    var root = sidebar || document.querySelector(".app-sidebar");
    if (!root) {
      return;
    }

    root.setAttribute("data-active-mode", mode);
    $$(".rail-mark", root).forEach(function (button) {
      var isActive = button.getAttribute("data-rail-mode") === mode;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    $$(".sidebar-group", root).forEach(function (group) {
      var isActiveGroup = group.getAttribute("data-sidebar-mode") === mode;
      group.classList.toggle("mode-focused", isActiveGroup);
      if (openGroups) {
        setSidebarGroupOpen(group, isActiveGroup);
      }
    });

    var details = modeDetails(mode);
    var modeCard = $(".sidebar-mode-card", root);
    if (modeCard) {
      modeCard.innerHTML =
        '<span class="mode-kicker">Active mode</span>' +
        "<strong>" +
        escapeHtml(details.label) +
        "</strong>" +
        "<p>" +
        escapeHtml(details.tip) +
        "</p>" +
        '<div class="sidebar-mode-actions">' +
        '<a href="' +
        escapeHtml(details.href) +
        '">Open starter</a>' +
        '<button type="button" data-copy-workflow="' +
        escapeHtml(details.mode) +
        '">Copy workflow</button>' +
        "</div>";
    }

    var activeGroup = $('.sidebar-group[data-sidebar-mode="' + mode + '"]', root);
    if (openGroups && activeGroup && root.querySelector(".sidebar-panel")) {
      activeGroup.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function workflowText(mode) {
    var details = modeDetails(mode);
    return (
      details.label +
      " workflow\n" +
      details.workflow
        .map(function (step, index) {
          return index + 1 + ". " + step;
        })
        .join("\n")
    );
  }

  var paletteWorkflows = [
    {
      title: "Clean a broken API payload",
      mode: "data",
      href: "index.html",
      steps: "Format JSON, compare with schema, convert CSV only after the structure is trusted."
    },
    {
      title: "Validate an email pattern",
      mode: "regex",
      href: "regex-email-validator.html",
      steps: "Test realistic valid, invalid and edge case addresses before shipping a regex."
    },
    {
      title: "Debug a failing request",
      mode: "api",
      href: "curl-api-debugging-cheatsheet.html",
      steps: "Capture curl headers, timing, auth context, CORS preflight and fix notes in one pass."
    },
    {
      title: "Use web tools safely",
      mode: "learn",
      href: "safe-online-dev-tools.html",
      steps: "Remove secrets, customer data and production tokens before using browser tools."
    },
    {
      title: "Prepare a Linux DBA console",
      mode: "ops",
      href: "linux-cockpit-server-guide.html",
      steps: "Install Cockpit, open port 9090 only where needed, then verify services and storage."
    },
    {
      title: "Choose the right OS path",
      mode: "os",
      href: "windows-admin-command-guide.html",
      steps: "Start with Windows or Linux, then inspect services, logs, ports and disks in the native shell."
    },
    {
      title: "Check a runtime before code",
      mode: "code",
      href: "php-runtime-guide.html",
      steps: "Verify PHP or Java versions, package managers, extensions and service environment before editing code."
    },
    {
      title: "Rule out hardware pressure",
      mode: "hardware",
      href: "hardware-diagnostics-guide.html",
      steps: "Check CPU, memory, IO, disk and network signals before blaming SQL or API logic."
    }
  ];

  function initCopyCodeButtons(root) {
    $$("[data-copy-code]", root || document).forEach(function (button) {
      if (button.getAttribute("data-copy-bound") === "true") {
        return;
      }
      button.setAttribute("data-copy-bound", "true");
      button.addEventListener("click", function () {
        var block = button.closest(".command-block");
        var code = block ? $("code", block) : null;
        if (!code) {
          return;
        }
        copyText(code.textContent).then(function () {
          var oldText = button.textContent;
          button.textContent = "Copied";
          window.setTimeout(function () {
            button.textContent = oldText;
          }, 1300);
        });
      });
    });
  }

  function createCommandPalette(sidebar) {
    if (document.querySelector(".command-palette")) {
      return;
    }

    var resources = sidebarResourceList();
    var activeIndex = 0;
    var currentResults = [];
    var lastFocused = null;
    var palette = document.createElement("div");
    palette.className = "command-palette";
    palette.hidden = true;
    palette.innerHTML =
      '<div class="command-backdrop" data-close-command-palette></div>' +
      '<section class="command-panel" role="dialog" aria-modal="true" aria-labelledby="formalintCommandTitle">' +
      '<div class="command-header">' +
      '<div><span class="command-kicker">Formalint console</span><h2 id="formalintCommandTitle">Command palette</h2></div>' +
      '<button class="command-close" type="button" data-close-command-palette aria-label="Close command palette">Esc</button>' +
      "</div>" +
      '<label class="command-input-wrap" for="formalintCommandInput"><span aria-hidden="true">/</span><input id="formalintCommandInput" type="search" autocomplete="off" placeholder="Search a tool, guide, regex, JWT, YAML, SQL..."></label>' +
      '<div class="command-results" role="listbox" aria-label="Formalint command results"></div>' +
      '<div class="command-workflows" aria-label="Suggested developer workflows"></div>' +
      "</section>";
    document.body.appendChild(palette);

    var input = $("#formalintCommandInput", palette);
    var resultsEl = $(".command-results", palette);
    var workflowsEl = $(".command-workflows", palette);

    function scoreResource(resource, query) {
      var haystack = [resource.label, resource.description, resource.keywords, resource.group, resource.icon].join(" ").toLowerCase();
      var tokens = query.split(/\s+/).filter(Boolean);
      var score = 0;
      tokens.forEach(function (token) {
        if (resource.label.toLowerCase().indexOf(token) !== -1) {
          score += 6;
        }
        if (resource.href.toLowerCase().indexOf(token) !== -1) {
          score += 4;
        }
        if (haystack.indexOf(token) !== -1) {
          score += 2;
        }
      });
      if (resource.href === currentPageName()) {
        score += 1;
      }
      return tokens.length && tokens.every(function (token) { return haystack.indexOf(token) !== -1 || resource.href.toLowerCase().indexOf(token) !== -1; }) ? score : 0;
    }

    function renderResults(query) {
      var normalized = String(query || "").trim().toLowerCase();
      if (normalized) {
        currentResults = resources
          .map(function (resource) {
            return { resource: resource, score: scoreResource(resource, normalized) };
          })
          .filter(function (item) {
            return item.score > 0;
          })
          .sort(function (a, b) {
            return b.score - a.score || a.resource.label.localeCompare(b.resource.label);
          })
          .slice(0, 12)
          .map(function (item) {
            return item.resource;
          });
      } else {
        var recent = recentResources(resources);
        currentResults = recent.length ? recent.concat(resources.filter(function (resource) {
          return recent.every(function (recentItem) {
            return recentItem.href !== resource.href;
          });
        })).slice(0, 10) : resources.slice(0, 10);
      }

      activeIndex = Math.min(activeIndex, Math.max(currentResults.length - 1, 0));
      resultsEl.innerHTML =
        '<div class="command-section-title">' +
        escapeHtml(normalized ? currentResults.length + " matching resources" : recentResources(resources).length ? "Recent and recommended tools" : "Recommended tools") +
        "</div>" +
        (currentResults.length
          ? currentResults
              .map(function (resource, index) {
                return (
                  '<a class="command-result' +
                  (index === activeIndex ? " active" : "") +
                  (resource.href === currentPageName() ? " current" : "") +
                  '" role="option" aria-selected="' +
                  (index === activeIndex ? "true" : "false") +
                  '" href="' +
                  escapeHtml(resource.href) +
                  '" data-command-index="' +
                  index +
                  '">' +
                  '<span class="command-icon">' +
                  escapeHtml(resource.icon) +
                  "</span>" +
                  '<span class="command-copy"><strong>' +
                  escapeHtml(resource.label) +
                  "</strong><small>" +
                  escapeHtml(resource.group + " - " + resource.description) +
                  "</small></span>" +
                  '<span class="command-open">Open</span>' +
                  "</a>"
                );
              })
              .join("")
          : '<p class="command-empty">No matching tool yet. Try JSON, regex, email, JWT, XML, SQL, YAML or API.</p>');

      workflowsEl.innerHTML =
        '<div class="command-section-title">Suggested workflows</div>' +
        paletteWorkflows
          .map(function (workflow) {
            return (
              '<a class="command-workflow" href="' +
              escapeHtml(workflow.href) +
              '" data-command-workflow="' +
              escapeHtml(workflow.mode) +
              '">' +
              "<strong>" +
              escapeHtml(workflow.title) +
              "</strong><span>" +
              escapeHtml(workflow.steps) +
              "</span></a>"
            );
          })
          .join("");
    }

    function openPalette() {
      lastFocused = document.activeElement;
      palette.hidden = false;
      document.body.classList.add("command-palette-open");
      renderResults(input ? input.value : "");
      window.setTimeout(function () {
        if (input) {
          input.focus();
          input.select();
        }
      }, 0);
    }

    function closePalette() {
      palette.hidden = true;
      document.body.classList.remove("command-palette-open");
      if (lastFocused && lastFocused.focus) {
        lastFocused.focus();
      }
    }

    function openActiveResult() {
      var resource = currentResults[activeIndex];
      if (!resource) {
        return;
      }
      rememberResource(resource.href);
      window.location.href = resource.href;
    }

    if (input) {
      input.addEventListener(
        "input",
        debounce(function () {
          activeIndex = 0;
          renderResults(input.value);
        }, 40)
      );
    }

    palette.addEventListener("click", function (event) {
      var closeTarget = event.target && event.target.closest ? event.target.closest("[data-close-command-palette]") : null;
      if (closeTarget) {
        closePalette();
        return;
      }
      var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
      if (link) {
        rememberResource(link.getAttribute("href"));
      }
    });

    palette.addEventListener("mousemove", function (event) {
      var result = event.target && event.target.closest ? event.target.closest("[data-command-index]") : null;
      if (!result) {
        return;
      }
      activeIndex = Number(result.getAttribute("data-command-index")) || 0;
      renderResults(input ? input.value : "");
    });

    document.addEventListener("keydown", function (event) {
      var isCommandShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isCommandShortcut) {
        event.preventDefault();
        openPalette();
        return;
      }
      if (palette.hidden) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = Math.min(activeIndex + 1, Math.max(currentResults.length - 1, 0));
        renderResults(input ? input.value : "");
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        renderResults(input ? input.value : "");
      } else if (event.key === "Enter") {
        event.preventDefault();
        openActiveResult();
      }
    });

    sidebar.addEventListener("click", function (event) {
      var opener = event.target && event.target.closest ? event.target.closest("[data-open-command-palette]") : null;
      if (opener) {
        openPalette();
        return;
      }
      var link = event.target && event.target.closest ? event.target.closest(".sidebar-link[href]") : null;
      if (link) {
        rememberResource(link.getAttribute("href"));
      }
    });
  }

  function filterSidebarLinks(sidebar, query) {
    var normalized = String(query || "").trim().toLowerCase();
    var visibleCount = 0;
    var totalCount = sidebarResourceList().length;

    $$(".sidebar-link", sidebar).forEach(function (link) {
      var haystack = link.textContent.toLowerCase();
      var isVisible = !normalized || haystack.indexOf(normalized) !== -1;
      link.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    $$(".sidebar-group", sidebar).forEach(function (group) {
      var hasVisibleLink = $$(".sidebar-link", group).some(function (link) {
        return !link.hidden;
      });
      group.hidden = Boolean(normalized && !hasVisibleLink);
      setSidebarGroupOpen(group, Boolean(normalized && hasVisibleLink));
    });

    var empty = $(".sidebar-search-empty", sidebar);
    if (empty) {
      empty.hidden = !normalized || visibleCount > 0;
    }

    var count = $(".sidebar-search-count", sidebar);
    if (count) {
      count.textContent = normalized ? visibleCount + " matches" : "Search " + totalCount + " tools and guides";
    }

    var modeCard = $(".sidebar-mode-card", sidebar);
    if (modeCard && normalized) {
      modeCard.innerHTML =
        '<span class="mode-kicker">Search results</span>' +
        "<strong>" +
        visibleCount +
        " matching resources</strong>" +
        "<p>Search checks tool names and short explanations, so you can jump from a debugging symptom to the right Formalint page faster.</p>";
    } else if (modeCard) {
      collapseSidebarGroups(sidebar);
      activateRailMode(sidebar.getAttribute("data-active-mode") || "data", sidebar, false);
    }
  }

  function initAppSidebar() {
    if (document.querySelector(".app-sidebar")) {
      document.body.classList.add("with-app-sidebar");
      initCopyCodeButtons(document);
      return;
    }

    var pageName = currentPageName();
    var activeMode = detectInitialMode(pageName);
    var sidebar = document.createElement("aside");
    sidebar.className = "app-sidebar";
    sidebar.setAttribute("aria-label", "Formalint workspace navigation");
    sidebar.innerHTML =
      '<div class="sidebar-rail" aria-label="Workspace modes">' +
      '<button class="rail-mark rail-command" type="button" data-open-command-palette title="Open command palette - Ctrl K"><span aria-hidden="true">K</span><span class="sr-only">Open command palette</span></button>' +
      railModes
        .map(function (item) {
          return (
            '<button class="rail-mark" type="button" data-rail-mode="' +
            escapeHtml(item.mode) +
            '" aria-pressed="false" title="' +
            escapeHtml(item.label + " - " + item.description) +
            '"><span aria-hidden="true">' +
            escapeHtml(item.icon) +
            '</span><span class="sr-only">' +
            escapeHtml(item.label) +
            "</span></button>"
          );
        })
        .join("") +
      "</div>" +
      '<nav class="sidebar-panel">' +
      '<div class="sidebar-brandline"><strong>Formalint</strong><span>Developer console</span><p>Choose a mode on the left, then open the exact tool or guide for the debugging task.</p></div>' +
      '<div class="sidebar-search"><label for="formalintSidebarSearch">Find a tool</label><input id="formalintSidebarSearch" type="search" autocomplete="off" placeholder="Search JSON, regex, JWT..."><button class="sidebar-command-button" type="button" data-open-command-palette><span>Command palette</span><kbd>Ctrl K</kbd></button><span class="sidebar-search-count">Search ' +
      sidebarResourceList().length +
      ' tools and guides</span></div>' +
      '<div class="sidebar-mode-card" aria-live="polite"></div>' +
      sidebarGroups
        .map(function (group, index) {
          return buildSidebarGroup(group, index, pageName);
        })
        .join("") +
      '<p class="sidebar-search-empty" hidden>No matching Formalint tool yet. Try JSON, regex, API, JWT, YAML or SQL.</p>' +
      '<div class="sidebar-footer"><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a></div>' +
      "</nav>";

    var header = document.querySelector(".site-header");
    document.body.insertBefore(sidebar, header ? header.nextSibling : document.body.firstChild);
    document.body.classList.add("with-app-sidebar");
    $$(".rail-mark[data-rail-mode]", sidebar).forEach(function (button) {
      button.addEventListener("click", function () {
        var search = $("#formalintSidebarSearch", sidebar);
        if (search) {
          search.value = "";
          filterSidebarLinks(sidebar, "");
        }
        activateRailMode(button.getAttribute("data-rail-mode"), sidebar, true);
      });
    });
    var searchInput = $("#formalintSidebarSearch", sidebar);
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        debounce(function () {
          filterSidebarLinks(sidebar, searchInput.value);
        }, 80)
      );
    }
    sidebar.addEventListener("click", function (event) {
      var groupToggle = event.target && event.target.closest ? event.target.closest("[data-sidebar-group-toggle]") : null;
      if (groupToggle) {
        var group = groupToggle.closest(".sidebar-group");
        setSidebarGroupOpen(group, !group.classList.contains("open"));
        return;
      }

      var target = event.target && event.target.closest ? event.target.closest("[data-copy-workflow]") : null;
      if (!target) {
        return;
      }
      var mode = target.getAttribute("data-copy-workflow");
      copyText(workflowText(mode)).then(function () {
        var oldText = target.textContent;
        target.textContent = "Copied";
        window.setTimeout(function () {
          target.textContent = oldText;
        }, 1300);
      });
    });
    document.addEventListener("keydown", function (event) {
      var tagName = event.target && event.target.tagName;
      var isTyping = tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
      if (event.key === "/" && !isTyping && searchInput) {
        event.preventDefault();
        searchInput.focus();
      }
    });
    createCommandPalette(sidebar);
    initCopyCodeButtons(document);
    activateRailMode(activeMode, sidebar, false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAppSidebar);
  } else {
    initAppSidebar();
  }

  window.DevKit = {
    $: $,
    $$: $$,
    escapeHtml: escapeHtml,
    byteSize: byteSize,
    formatBytes: formatBytes,
    lineCount: lineCount,
    setStatus: setStatus,
    renderMetrics: renderMetrics,
    downloadText: downloadText,
    copyText: copyText,
    debounce: debounce
  };
})();

