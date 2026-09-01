const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CACHE_VERSION = "20260901-library-150";
const LIBRARY_COUNT = 150;
const TODAY = "2026-09-01";

const pages = [
  ["curl-post-json-guide.html", "API Debugging", "api", "POST", "curl POST JSON Request Guide", "Build repeatable curl POST requests for JSON APIs without losing headers, body shape or auth context.", "curl post json request api debugging content-type bearer token"],
  ["http-request-methods-guide.html", "API Debugging", "api", "HTTP", "HTTP Request Methods Guide", "Understand GET, POST, PUT, PATCH, DELETE, HEAD and OPTIONS before debugging API behavior.", "http request methods get post put patch delete options api"],
  ["rest-api-error-response-guide.html", "API Debugging", "api", "ERR", "REST API Error Response Guide", "Design and debug consistent REST API error responses with status, code, message, details and correlation IDs.", "rest api error response format status code correlation id problem details"],
  ["api-versioning-strategy-guide.html", "API Debugging", "api", "VER", "API Versioning Strategy Guide", "Plan URL, header and media-type API versioning so client integrations do not break quietly.", "api versioning strategy url header media type backward compatibility"],
  ["webhook-signature-verification-guide.html", "API Debugging", "api", "HMAC", "Webhook Signature Verification Guide", "Verify webhook signatures with raw bodies, timestamps, HMAC secrets and replay protection.", "webhook signature verification hmac raw body timestamp replay"],
  ["oauth-refresh-token-debugging.html", "API Debugging", "api", "RT", "OAuth Refresh Token Debugging Guide", "Debug refresh-token rotation, expired sessions, revoked grants and frontend retry loops.", "oauth refresh token debugging rotation revoked grant session"],
  ["regex-extract-numbers-guide.html", "Regex Lab", "regex", "123", "Regex Extract Numbers Guide", "Extract integers, decimals, negative values and IDs from text while keeping parsing limits clear.", "regex extract numbers integers decimals negative javascript"],
  ["regex-remove-duplicate-lines.html", "Regex Lab", "regex", "DUP", "Regex Remove Duplicate Lines Guide", "Clean repeated lines in logs, lists and copied text with regex-aware review notes.", "regex remove duplicate lines duplicated text log cleanup"],
  ["regex-whitespace-normalization.html", "Regex Lab", "regex", "WS", "Regex Whitespace Normalization Guide", "Normalize spaces, tabs, blank lines and pasted text safely before validation or import.", "regex whitespace normalization spaces tabs blank lines trim"],
  ["regex-capture-groups-guide.html", "Regex Lab", "regex", "CAP", "Regex Capture Groups Guide", "Use numbered groups, named groups and non-capturing groups without making extraction code fragile.", "regex capture groups named groups non capturing javascript"],
  ["json-merge-patch-guide.html", "Data Formatting", "data", "PATCH", "JSON Merge Patch Guide", "Understand partial JSON updates, null semantics and safer API PATCH request review.", "json merge patch api patch partial update null semantics"],
  ["json-array-filtering-guide.html", "Data Formatting", "data", "ARR", "JSON Array Filtering Guide", "Inspect JSON arrays, missing fields, duplicates and filter assumptions before transforming data.", "json array filtering duplicate fields api response"],
  ["csv-cleanup-guide.html", "Data Formatting", "data", "CSV", "CSV Cleanup Guide", "Clean CSV headers, delimiters, quotes, blank rows and encoding issues before conversion to JSON.", "csv cleanup guide headers delimiter quotes encoding convert json"],
  ["xml-namespace-debugging-guide.html", "Data Formatting", "data", "NS", "XML Namespace Debugging Guide", "Debug XML namespace prefixes, default namespaces and XPath surprises in integration payloads.", "xml namespace debugging default namespace prefix xpath integration"],
  ["yaml-docker-compose-guide.html", "Data Formatting", "data", "YML", "YAML Docker Compose Guide", "Review Docker Compose YAML indentation, environment variables, ports, volumes and service blocks.", "yaml docker compose guide indentation environment ports volumes"],
  ["sql-group-by-debugging-guide.html", "Database Operations", "db", "GRP", "SQL GROUP BY Debugging Guide", "Debug grouped SQL reports, aggregates, HAVING filters and missing dimensions.", "sql group by debugging aggregate having count sum report"],
  ["sql-date-range-debugging.html", "Database Operations", "db", "DATE", "SQL Date Range Debugging Guide", "Review SQL date ranges, inclusive boundaries, timezones and index-friendly filters.", "sql date range debugging timezone inclusive boundary timestamp"],
  ["postgresql-explain-analyze-guide.html", "Database Operations", "db", "PLAN", "PostgreSQL EXPLAIN ANALYZE Guide", "Read PostgreSQL query plans, row estimates, loops, timing and index usage safely.", "postgresql explain analyze guide query plan index scan seq scan"],
  ["mysql-processlist-debugging-guide.html", "Database Operations", "db", "PROC", "MySQL Processlist Debugging Guide", "Use MySQL processlist evidence to inspect active queries, locks, sleep sessions and incidents.", "mysql processlist debugging show full processlist active queries locks"],
  ["redis-slowlog-debugging-guide.html", "Database Operations", "db", "SLOW", "Redis SLOWLOG Debugging Guide", "Use Redis SLOWLOG to inspect expensive commands, latency symptoms and cache misuse.", "redis slowlog debugging latency expensive commands cache"],
  ["docker-volume-debugging-guide.html", "Shell & DBA Ops", "ops", "VOL", "Docker Volume Debugging Guide", "Debug Docker volumes, bind mounts, permissions, persistence and missing files.", "docker volume debugging bind mount permissions persistence"],
  ["kubernetes-crashloopbackoff-guide.html", "Shell & DBA Ops", "ops", "K8S", "Kubernetes CrashLoopBackOff Guide", "Investigate CrashLoopBackOff with logs, events, probes, env vars and container exit codes.", "kubernetes crashloopbackoff guide pod logs events probes exit code"],
  ["linux-systemctl-debugging-guide.html", "Shell & DBA Ops", "ops", "SYS", "Linux systemctl Debugging Guide", "Use systemctl status, restart history, unit files and journal evidence during service incidents.", "linux systemctl debugging service status unit file journalctl"],
  ["git-branch-cleanup-guide.html", "Shell & DBA Ops", "ops", "BR", "Git Branch Cleanup Guide", "Clean local and remote Git branches safely after merges, releases and abandoned experiments.", "git branch cleanup delete local remote merged branches"],
  ["php-composer-dependency-conflict-guide.html", "Software Runtime", "code", "CMP", "PHP Composer Dependency Conflict Guide", "Debug Composer version conflicts, platform requirements, lock files and package constraints.", "php composer dependency conflict lock file platform requirements"],
  ["java-maven-dependency-debugging.html", "Software Runtime", "code", "MVN", "Java Maven Dependency Debugging Guide", "Debug Maven dependency trees, version conflicts, exclusions and build-classpath surprises.", "java maven dependency debugging tree conflict exclusion"]
].map(([file, category, mode, icon, h1, summary, keywords]) => ({
  file,
  category,
  mode,
  icon,
  title: `${h1} | Formalint`,
  h1,
  description: summary,
  summary,
  keywords,
  commandTitle: commandTitleFor(mode, h1),
  command: commandFor(file),
  workflow: workflowFor(mode, h1),
  checklist: checklistFor(mode, h1),
  pitfalls: pitfallFor(mode, h1),
  faqs: faqFor(mode, h1),
  related: relatedFor(file, mode)
}));

function commandTitleFor(mode, h1) {
  if (mode === "api") return "Evidence command";
  if (mode === "regex") return "Pattern or cleanup example";
  if (mode === "db") return "Database evidence query";
  if (mode === "ops") return "Terminal evidence commands";
  if (mode === "code") return "Runtime evidence commands";
  return `${h1.replace(" Guide", "")} example`;
}

function commandFor(file) {
  const commands = {
    "curl-post-json-guide.html": `curl -i -X POST https://api.example.com/items \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer TOKEN" \\\n  --data '{"name":"sample","active":true}'`,
    "http-request-methods-guide.html": `GET /items\nPOST /items\nPUT /items/123\nPATCH /items/123\nDELETE /items/123\nOPTIONS /items`,
    "rest-api-error-response-guide.html": `{\n  "error": {\n    "code": "validation_failed",\n    "message": "One or more fields are invalid.",\n    "correlationId": "req_123"\n  }\n}`,
    "api-versioning-strategy-guide.html": `GET /v1/orders/123\nAccept: application/vnd.example.v2+json\nX-API-Version: 2026-09-01`,
    "webhook-signature-verification-guide.html": `timestamp + "." + rawBody\nHMAC_SHA256(secret, signedPayload)\ncompareDigest(expectedSignature, receivedSignature)`,
    "oauth-refresh-token-debugging.html": `grant_type=refresh_token\nrefresh_token=REDACTED\nclient_id=public-client\nscope=offline_access`,
    "regex-extract-numbers-guide.html": `-?\\d+(?:\\.\\d+)?`,
    "regex-remove-duplicate-lines.html": `^(.*)(\\r?\\n\\1)+$`,
    "regex-whitespace-normalization.html": `text.replace(/\\s+/g, " ").trim();`,
    "regex-capture-groups-guide.html": `(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})`,
    "json-merge-patch-guide.html": `PATCH /profile\nContent-Type: application/merge-patch+json\n\n{ "displayName": "Ada", "avatarUrl": null }`,
    "json-array-filtering-guide.html": `items.filter(item => item.status === "active" && item.id);`,
    "csv-cleanup-guide.html": `id,email,status\n1,ada@example.com,active\n2,grace@example.com,inactive`,
    "xml-namespace-debugging-guide.html": `<order xmlns="urn:orders">\n  <id>123</id>\n</order>`,
    "yaml-docker-compose-guide.html": `services:\n  api:\n    image: formalint/api\n    ports:\n      - "8080:8080"`,
    "sql-group-by-debugging-guide.html": `SELECT status, COUNT(*) AS total\nFROM orders\nGROUP BY status\nORDER BY total DESC;`,
    "sql-date-range-debugging.html": `WHERE created_at >= '2026-09-01'\n  AND created_at < '2026-10-01'`,
    "postgresql-explain-analyze-guide.html": `EXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders WHERE customer_id = 42;`,
    "mysql-processlist-debugging-guide.html": `SHOW FULL PROCESSLIST;\nSHOW ENGINE INNODB STATUS\\G`,
    "redis-slowlog-debugging-guide.html": `redis-cli SLOWLOG GET 10\nredis-cli INFO commandstats`,
    "docker-volume-debugging-guide.html": `docker volume ls\ndocker inspect volume-name\ndocker compose config`,
    "kubernetes-crashloopbackoff-guide.html": `kubectl describe pod pod-name\nkubectl logs pod-name --previous\nkubectl get events --sort-by=.lastTimestamp`,
    "linux-systemctl-debugging-guide.html": `systemctl status service-name --no-pager\nsystemctl cat service-name\njournalctl -u service-name -n 100 --no-pager`,
    "git-branch-cleanup-guide.html": `git branch --merged\ngit branch -d feature-name\ngit push origin --delete feature-name`,
    "php-composer-dependency-conflict-guide.html": `composer why-not vendor/package 2.0\ncomposer show -t\ncomposer validate`,
    "java-maven-dependency-debugging.html": `mvn dependency:tree\nmvn -X test\nmvn help:effective-pom`
  };
  return commands[file] || "Capture the smallest safe sample and verify one change at a time.";
}

function workflowFor(mode, h1) {
  if (mode === "api") {
    return [
      ["Capture the request", "Record method, URL, headers, body shape, status code and correlation identifiers."],
      ["Separate layers", "Check client behavior, gateway behavior, upstream service logs and data dependencies independently."],
      ["Verify the fix", "Repeat the same request after the change so the evidence is comparable."]
    ];
  }
  if (mode === "regex") {
    return [
      ["Define the target", "Write down whether the pattern validates a whole value or extracts part of a larger string."],
      ["Test edges", "Include empty input, long input, copied text and realistic invalid examples."],
      ["Move business rules out", "Use regex for text shape and keep deeper product meaning in application code."]
    ];
  }
  if (mode === "db") {
    return [
      ["Format the query", "Make clauses, joins and filters readable before judging correctness or performance."],
      ["Measure the result", "Capture row counts, plans, locks or session evidence before changing indexes or SQL."],
      ["Document the cause", "Write the exact data or plan behavior that explains the incident."]
    ];
  }
  if (mode === "ops") {
    return [
      ["Identify the host", "Record OS, service name, container name, namespace or repository before running commands."],
      ["Use read-only checks first", "Gather status, logs, config and timestamps before restarting or deleting anything."],
      ["Keep a rollback path", "Every operational fix should be explainable and reversible."]
    ];
  }
  if (mode === "code") {
    return [
      ["Check the toolchain", "Capture runtime version, package manager version and dependency tree before editing code."],
      ["Compare environments", "Separate local shell behavior from service, container or CI behavior."],
      ["Pin the evidence", "Keep the command output that proves which dependency or runtime is active."]
    ];
  }
  return [
    ["Inspect the input", "Capture a safe sample before transforming it."],
    ["Run one cleanup", "Apply a single clear normalization step."],
    ["Validate again", "Check the output with a parser, linter or downstream tool."]
  ];
}

function checklistFor(mode, h1) {
  const base = [
    `Use ${h1.replace(" Guide", "")} as a workflow, not as a copy-paste shortcut.`,
    "Keep production secrets and customer data out of browser tools and tickets.",
    "Capture the exact input and output shape before changing behavior.",
    "Prefer small, reversible changes while debugging.",
    "Link the final note to a related Formalint reference for future handoff."
  ];
  if (mode === "api") base[2] = "Keep headers, status code, body shape and correlation IDs together.";
  if (mode === "regex") base[2] = "Save accepted and rejected examples beside the final pattern.";
  if (mode === "db") base[2] = "Capture row counts, explain plans or process evidence before tuning.";
  if (mode === "ops") base[2] = "Record host, shell, service and timestamp with every command.";
  if (mode === "code") base[2] = "Compare lock files, installed versions and runtime paths.";
  return base;
}

function pitfallFor(mode, h1) {
  if (mode === "api") return `${h1.replace(" Guide", "")} fails when teams keep changing the client without proving which layer produced the response.`;
  if (mode === "regex") return `${h1.replace(" Guide", "")} becomes fragile when the pattern tries to own parsing, validation and product policy at once.`;
  if (mode === "db") return `${h1.replace(" Guide", "")} is risky when query readability, result correctness and performance tuning are mixed into one rushed change.`;
  if (mode === "ops") return `${h1.replace(" Guide", "")} gets dangerous when restart, delete or firewall commands happen before read-only evidence is captured.`;
  if (mode === "code") return `${h1.replace(" Guide", "")} gets confusing when local shell behavior is treated as proof of production runtime behavior.`;
  return `${h1.replace(" Guide", "")} works best when the input format and expected output are written down first.`;
}

function faqFor(mode, h1) {
  return [
    [`Is ${h1.replace(" Guide", "")} enough for production?`, "It is enough as a review workflow. Production safety still depends on tests, logs, access control, monitoring and team change process."],
    ["Should I paste real production data here?", "No. Use redacted, synthetic or minimal samples when working in browser-based developer tools."]
  ];
}

function relatedFor(file, mode) {
  const byMode = {
    api: ["api-debugging-checklist.html", "curl-api-debugging-cheatsheet.html", "http-status-codes.html"],
    regex: ["regex-tester.html", "regex-examples.html", "javascript-regex-cheatsheet.html"],
    data: ["index.html", "json-formatting-guide.html", "developer-data-validation-guide.html"],
    db: ["sql-formatter.html", "sql-cleanup.html", "postgresql-dba-checklist.html"],
    ops: ["terminal-workflows-for-developers.html", "linux-admin-command-guide.html", "docker-compose-debugging-guide.html"],
    code: ["php-runtime-guide.html", "java-runtime-guide.html", "nodejs-runtime-guide.html"]
  };
  return (byMode[mode] || byMode.data).filter((href) => href !== file);
}

function htmlEscape(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function header(activeHref = "tools.html") {
  const items = [["index.html", "JSON"], ["json-diff.html", "JSON Diff"], ["xml-formatter.html", "XML"], ["yaml-formatter.html", "YAML"], ["sql-formatter.html", "SQL"], ["python-formatter.html", "Python"], ["tools.html", "All Tools"], ["guides.html", "Guides"], ["about.html", "About"]];
  return `<header class="site-header"><a class="brand" href="index.html" aria-label="Formalint home"><img src="assets/img/favicon.svg" alt="" width="34" height="34"><span>Formalint</span></a><nav class="main-nav" aria-label="Main navigation">${items.map(([href, label]) => `<a${href === activeHref ? ' class="active"' : ""} href="${href}">${label}</a>`).join("")}</nav></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-signature" aria-label="Contact"><strong>&copy; 2026 Formalint</strong><span aria-hidden="true">-</span><span>Ensar Karayel</span><span aria-hidden="true">-</span><a href="mailto:karayelensar@gmail.com">karayelensar@gmail.com</a></div><nav aria-label="Footer navigation"><button class="footer-link" type="button" data-consent-open>Privacy Preferences</button><a href="about.html">About</a><a href="how-formalint-works.html">How It Works</a><a href="editorial-policy.html">Editorial Policy</a><a href="changelog.html">Changelog</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></nav></footer>`;
}

function titleFromFile(file) {
  if (file === "index.html") return "JSON Formatter";
  const contentPath = path.join(ROOT, file);
  if (fs.existsSync(contentPath)) {
    const title = (fs.readFileSync(contentPath, "utf8").match(/<h1>([^<]+)<\/h1>/) || [null, ""])[1];
    if (title) return title.replace(" Guide", "");
  }
  return file.replace(/\.html$/, "").split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function relatedLinks(related) {
  return related.map((href) => `<a href="${href}">${htmlEscape(titleFromFile(href))}</a>`).join(", ");
}

function generatePage(page) {
  const schema = {"@context":"https://schema.org","@type":"TechArticle","@id":`https://formalint.com/${page.file}#article`,headline:page.h1,description:page.description,datePublished:TODAY,dateModified:TODAY,author:{"@type":"Person",name:"Ensar Karayel"},publisher:{"@type":"Organization",name:"Formalint",url:"https://formalint.com/"},mainEntityOfPage:`https://formalint.com/${page.file}`,proficiencyLevel:"Beginner"};
  const tableRows = page.workflow.map(([step, reason]) => `<tr><td>${htmlEscape(step)}</td><td>${htmlEscape(reason)}</td></tr>`).join("");
  const checklist = page.checklist.map((item) => `<li>${htmlEscape(item)}</li>`).join("");
  const faq = page.faqs.map(([q, a]) => `<details><summary>${htmlEscape(q)}</summary><p>${htmlEscape(a)}</p></details>`).join("");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; connect-src 'self' https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net https://www.google-analytics.com https://region1.google-analytics.com; font-src 'self'; form-action 'none'; frame-src https://*.googlesyndication.com https://*.doubleclick.net; img-src 'self' data: https://*.googlesyndication.com https://*.google.com https://www.google-analytics.com; object-src 'none'; script-src 'self' 'nonce-formalint-schema' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <title>${htmlEscape(page.title)}</title>
    <meta name="description" content="${htmlEscape(page.description)}">
    <meta name="author" content="Ensar Karayel">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="https://formalint.com/${page.file}">
    <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.svg">
    <link rel="manifest" href="manifest.webmanifest">
    <link rel="stylesheet" href="assets/css/styles.css?v=${CACHE_VERSION}">
    <script src="assets/js/analytics-consent.js"></script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6534346834787678" crossorigin="anonymous"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-SGR2EZG0BM"></script>
    <script type="application/ld+json" nonce="formalint-schema">
      ${JSON.stringify(schema)}
    </script>
  </head>
  <body>
    ${header(page.mode === "regex" ? "regex-tester.html" : page.mode === "data" ? "index.html" : "tools.html")}
    <main class="document-page">
      <h1>${htmlEscape(page.h1)}</h1>
      <p class="guide-meta">${htmlEscape(page.summary)} Last updated September 1, 2026.</p>
      <p>${htmlEscape(page.description)} This Formalint guide is built as practical reference content for developers, DBAs and support engineers who need repeatable steps during real debugging work.</p>
      <p>The goal is not to replace your local editor, logs or database tools. The goal is to give you a clean order of operations so you can move from symptom to evidence faster.</p>
      <h2>Practical workflow</h2>
      <table class="workflow-table"><thead><tr><th>Step</th><th>What to verify</th></tr></thead><tbody>${tableRows}</tbody></table>
      <h2>${htmlEscape(page.commandTitle)}</h2>
      <div class="command-block"><button class="copy-code-button" type="button" data-copy-code>Copy</button><pre><code>${htmlEscape(page.command)}</code></pre></div>
      <h2>Review checklist</h2>
      <ol>${checklist}</ol>
      <h2>Common mistake</h2>
      <p>${htmlEscape(page.pitfalls)}</p>
      <p class="guide-callout">Keep the smallest useful sample, remove secrets and verify each assumption separately. That is the Formalint rhythm.</p>
      <h2>Frequently asked questions</h2>
      <div class="faq-list">${faq}</div>
      <h2>Related Formalint references</h2>
      <p>Continue with ${relatedLinks(page.related)}.</p>
    </main>
    ${footer()}
    <script src="assets/js/shared.js"></script>
  </body>
</html>
`;
}

function card(page) {
  return `<a class="tool-card" href="${page.file}"><span>${htmlEscape(page.h1.replace(" Guide", ""))}</span><small>${htmlEscape(page.summary)}</small></a>`;
}

function replaceAllCacheVersions() {
  fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).forEach((name) => {
    const file = path.join(ROOT, name);
    const html = fs.readFileSync(file, "utf8").replace(/styles\.css\?v=[0-9a-z-]+/g, `styles.css?v=${CACHE_VERSION}`);
    fs.writeFileSync(file, html, "utf8");
  });
}

function insertCardsBefore(fileName, marker) {
  const file = path.join(ROOT, fileName);
  let html = fs.readFileSync(file, "utf8");
  const missing = pages.filter((page) => !html.includes(`href="${page.file}"`));
  if (!missing.length) return;
  if (!html.includes(marker)) throw new Error(`Marker not found in ${fileName}: ${marker}`);
  html = html.replace(marker, missing.map(card).join("\n          ") + "\n          " + marker);
  fs.writeFileSync(file, html, "utf8");
}

function normalizeToolCardIndent(markup) {
  return markup
    .trim()
    .split("\n")
    .map((line) => `          ${line.trim()}`)
    .join("\n");
}

function updateToolsAdvancedSection() {
  const file = path.join(ROOT, "tools.html");
  let html = fs.readFileSync(file, "utf8");
  const startMarker = '      <section class="directory-section" aria-labelledby="advanced-reference-title" data-tools-section>';
  const endMarker = '      <section class="directory-section" aria-labelledby="trust-title" data-tools-section>';
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start === -1 || end === -1) throw new Error("Advanced references section markers not found in tools.html");

  const currentBlock = html.slice(start, end);
  const byHref = new Map();
  for (const match of currentBlock.matchAll(/<a class="tool-card" href="([^"]+\.html)">[\s\S]*?<\/a>/g)) {
    byHref.set(match[1], normalizeToolCardIndent(match[0]));
  }
  pages.forEach((page) => byHref.set(page.file, normalizeToolCardIndent(card(page))));

  const advancedSection = `${startMarker}
        <div class="section-heading">
          <p class="eyebrow">Advanced references</p>
          <h2 id="advanced-reference-title">Regex, API, SQL, runtime and operations deep dives</h2>
        </div>
        <div class="directory-grid">
${Array.from(byHref.values()).join("\n")}
        </div>
      </section>

`;

  html = html.slice(0, start) + advancedSection + html.slice(end);
  fs.writeFileSync(file, html, "utf8");
}

function updateCounters() {
  ["index.html", "tools.html", "changelog.html"].forEach((name) => {
    const file = path.join(ROOT, name);
    let html = fs.readFileSync(file, "utf8");
    html = html.replace(/Search (100|120|124|150) Formalint tools and guides/g, `Search ${LIBRARY_COUNT} Formalint tools and guides`);
    html = html.replace(/Showing (100|120|124|150) resources/g, `Showing ${LIBRARY_COUNT} resources`);
    html = html.replace(/(100|120|124|150) public pages/g, `${LIBRARY_COUNT} public pages`);
    html = html.replace(/<strong>(100|120|124|150)<\/strong><span>Public HTML targets/g, `<strong>${LIBRARY_COUNT}</strong><span>Public HTML targets`);
    fs.writeFileSync(file, html, "utf8");
  });
}

function updateToolsAndGuides() {
  updateToolsAdvancedSection();
  insertCardsBefore("guides.html", '          <a class="tool-card" href="complete-regex-guide.html">');
  insertCardsBefore("index.html", '          <a class="tool-card" href="complete-regex-guide.html"><span>Regex Toolkit</span>');
}

function updateShared() {
  const file = path.join(ROOT, "assets", "js", "shared.js");
  let js = fs.readFileSync(file, "utf8");
  const groups = [
    ["Regex Lab", pages.filter((page) => page.mode === "regex")],
    ["API Debugging", pages.filter((page) => page.mode === "api")],
    ["Database Operations", pages.filter((page) => page.mode === "db")],
    ["Shell & DBA Ops", pages.filter((page) => page.mode === "ops")],
    ["Software Runtime", pages.filter((page) => page.mode === "code")],
    ["Workspace", pages.filter((page) => page.mode === "data")]
  ];
  groups.forEach(([title, groupPages]) => {
    const start = js.indexOf(`      title: "${title}",`);
    if (start === -1) throw new Error(`Sidebar group not found: ${title}`);
    const linksStart = js.indexOf("      links: [", start);
    const insertAt = js.indexOf("\n      ]", linksStart);
    groupPages.forEach((page) => {
      if (js.includes(`href: "${page.file}"`)) return;
      const link = `{ label: "${page.h1.replace(/"/g, '\\"').replace(" Guide", "")}", href: "${page.file}", icon: "${page.icon}", description: "${page.summary.replace(/"/g, '\\"')}", keywords: "${page.keywords}" }`;
      js = js.slice(0, insertAt) + ",\n        " + link + js.slice(insertAt);
    });
  });
  fs.writeFileSync(file, js, "utf8");
}

function updateToolFilters() {
  const file = path.join(ROOT, "assets", "js", "tools-directory.js");
  let js = fs.readFileSync(file, "utf8");
  js = js.replace('formatter: ["formatter", "format", "lint", "linter", "indent", "cleanup", "schema", "csv", "json", "xml", "yaml", "sql", "python"]', 'formatter: ["formatter", "format", "lint", "linter", "indent", "cleanup", "schema", "csv", "json", "ndjson", "xml", "namespace", "yaml", "compose", "sql", "python"]');
  js = js.replace('regex: ["regex", "regular expression", "lookahead", "lookbehind", "email", "phone", "password", "ip address", "slug", "hex", "uuid", "url", "date", "log parser", "javascript regex"]', 'regex: ["regex", "regular expression", "lookahead", "lookbehind", "email", "phone", "password", "ip address", "slug", "hex", "capture", "numbers", "duplicate", "whitespace", "uuid", "url", "date", "log parser", "javascript regex"]');
  js = js.replace('api: ["api", "http", "jwt", "expiration", "401", "403", "timeout", "oauth", "cors", "webhook", "graphql", "cookie", "samesite", "rate limit", "cache-control", "status", "headers"]', 'api: ["api", "http", "method", "post", "json request", "versioning", "error response", "jwt", "expiration", "401", "403", "timeout", "oauth", "refresh token", "cors", "webhook", "signature", "graphql", "cookie", "samesite", "rate limit", "cache-control", "status", "headers"]');
  js = js.replace('ops: ["dba", "database", "postgresql", "mysql", "redis", "docker", "kubernetes", "nginx", "linux", "journalctl", "windows", "powershell", "git", "dns", "tls", "cockpit"]', 'ops: ["dba", "database", "postgresql", "mysql", "redis", "docker", "volume", "kubernetes", "crashloopbackoff", "nginx", "linux", "systemctl", "journalctl", "windows", "powershell", "git", "branch", "dns", "tls", "cockpit"]');
  js = js.replace('runtime: ["runtime", "node", "node.js", "npm", "environment", "php", "composer", "fpm", "java", "jdk", "thread dump", "python", "virtualenv", "fastapi", "django", "flask"]', 'runtime: ["runtime", "node", "node.js", "npm", "environment", "php", "composer", "dependency", "fpm", "java", "jdk", "maven", "thread dump", "python", "virtualenv", "fastapi", "django", "flask"]');
  fs.writeFileSync(file, js, "utf8");
}

function updateChangelog() {
  const file = path.join(ROOT, "changelog.html");
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(
    "Expanded Formalint beyond 150 public pages with 24 new regex",
    "Expanded Formalint to 124 public pages with 24 new regex"
  );
  const entry = `      <h2>September 1, 2026 - 150 Page Search Expansion</h2>
      <p>Expanded Formalint to 150 public pages with 26 additional API, HTTP, regex, JSON, CSV, XML, YAML, SQL, database, Linux, Kubernetes, Docker, Git, PHP and Java references. Updated the tools directory, guide index, command palette, sitemap, structured data coverage and cache version for the larger developer library.</p>
`;
  if (!html.includes("150 Page Search Expansion")) {
    html = html.replace("      <h2>September 1, 2026 - 124 Page Developer Library</h2>", entry + "      <h2>September 1, 2026 - 124 Page Developer Library</h2>");
  }
  fs.writeFileSync(file, html, "utf8");
}

function updateSitemap() {
  const htmlFiles = fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).sort((a, b) => a.localeCompare(b));
  const urls = htmlFiles.map((name) => {
    const loc = name === "index.html" ? "https://formalint.com/" : `https://formalint.com/${name}`;
    const priority = name === "index.html" ? "1.0" : ["tools.html", "guides.html"].includes(name) ? "0.85" : pages.some((page) => page.file === name) ? "0.72" : "0.7";
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join("\n");
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, "utf8");
}

function ensureStructuredData() {
  fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).forEach((name) => {
    const file = path.join(ROOT, name);
    let html = fs.readFileSync(file, "utf8");
    if (html.includes('type="application/ld+json"')) return;
    const title = (html.match(/<title>([^<]+)<\/title>/) || [null, "Formalint"])[1];
    const description = (html.match(/<meta name="description" content="([^"]+)">/) || [null, "Formalint developer reference page."])[1];
    const canonical = (html.match(/<link rel="canonical" href="([^"]+)">/) || [null, `https://formalint.com/${name}`])[1];
    const schema = {"@context":"https://schema.org","@type":["privacy.html","terms.html","about.html","contact.html"].includes(name) ? "WebPage" : "TechArticle","@id":`${canonical}#webpage`,name:title.replace(" | Formalint",""),description,url:canonical,dateModified:TODAY,author:{"@type":"Person",name:"Ensar Karayel"},publisher:{"@type":"Organization",name:"Formalint",url:"https://formalint.com/"},isAccessibleForFree:true};
    html = html.replace("  </head>", `    <script type="application/ld+json" nonce="formalint-schema">\n      ${JSON.stringify(schema)}\n    </script>\n  </head>`);
    fs.writeFileSync(file, html, "utf8");
  });
}

pages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), generatePage(page), "utf8"));
replaceAllCacheVersions();
updateCounters();
updateToolsAndGuides();
updateShared();
updateToolFilters();
updateChangelog();
updateSitemap();
ensureStructuredData();

console.log(`Formalint library expanded to ${fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).length} HTML pages.`);
