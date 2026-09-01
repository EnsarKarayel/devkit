const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CACHE_VERSION = "20260901-library-175";
const LIBRARY_COUNT = 175;
const TODAY = "2026-09-01";

const pages = [
  ["email-regex-python-guide.html", "Regex Lab", "regex", "PY@", "Email Regex Python Guide", "Validate email-shaped strings in Python while keeping deliverability and account rules outside regex.", "email regex python re fullmatch validation"],
  ["email-regex-php-guide.html", "Regex Lab", "regex", "PHP@", "Email Regex PHP Guide", "Use PHP email validation, regex checks and filter_var without turning format checks into business truth.", "email regex php filter_var validation"],
  ["regex-word-boundary-guide.html", "Regex Lab", "regex", "\\b", "Regex Word Boundary Guide", "Use word boundaries for tokens, IDs and search terms without surprising Unicode or punctuation behavior.", "regex word boundary javascript tokens"],
  ["regex-multiline-anchors-guide.html", "Regex Lab", "regex", "^$", "Regex Multiline Anchors Guide", "Understand anchors, multiline flags and line-by-line matching before parsing copied logs.", "regex multiline anchors flag javascript"],
  ["regex-url-extraction-guide.html", "Regex Lab", "regex", "URL", "Regex URL Extraction Guide", "Extract URLs from logs, Markdown and pasted text while knowing when a real URL parser is safer.", "regex url extraction link parser"],
  ["curl-headers-debugging-guide.html", "API Debugging", "api", "HDR", "curl Headers Debugging Guide", "Inspect request and response headers with curl before changing API clients, proxies or CORS settings.", "curl headers debugging response request"],
  ["curl-bearer-token-guide.html", "API Debugging", "api", "AUTH", "curl Bearer Token Guide", "Test bearer-token APIs with curl while redacting secrets and separating auth from payload errors.", "curl bearer token authorization header api"],
  ["postman-to-curl-debugging-guide.html", "API Debugging", "api", "PM", "Postman to curl Debugging Guide", "Turn a Postman request into a repeatable curl command for tickets, terminals and CI evidence.", "postman to curl debugging api"],
  ["api-request-body-validation-guide.html", "API Debugging", "api", "BODY", "API Request Body Validation Guide", "Debug JSON request-body validation, content types, required fields and schema mismatch errors.", "api request body validation json schema"],
  ["api-correlation-id-logging-guide.html", "API Debugging", "api", "CID", "API Correlation ID Logging Guide", "Use correlation IDs to connect frontend errors, gateway logs, service logs and database evidence.", "api correlation id logging request id"],
  ["jwt-signature-verification-guide.html", "API Debugging", "api", "JWS", "JWT Signature Verification Guide", "Verify JWT algorithms, keys and signatures without exposing real tokens or trusting decoded claims blindly.", "jwt signature verification jwks algorithm"],
  ["json-path-query-guide.html", "Data Formatting", "data", "PATH", "JSON Path Query Guide", "Use JSON path thinking to inspect nested payloads, arrays and optional fields before transforming data.", "json path query nested arrays"],
  ["json-null-vs-undefined-guide.html", "Data Formatting", "data", "NULL", "JSON null vs undefined Guide", "Separate JSON null, missing fields and JavaScript undefined before debugging PATCH and schema behavior.", "json null vs undefined missing fields"],
  ["xml-xpath-debugging-guide.html", "Data Formatting", "data", "XP", "XML XPath Debugging Guide", "Debug XPath selectors, namespaces, attributes and text nodes in XML integrations.", "xml xpath debugging namespace attribute"],
  ["yaml-anchors-aliases-guide.html", "Data Formatting", "data", "Y&A", "YAML Anchors and Aliases Guide", "Use YAML anchors, aliases and merge keys carefully in CI, Docker and infrastructure configuration.", "yaml anchors aliases merge keys"],
  ["csv-utf8-encoding-guide.html", "Data Formatting", "data", "UTF8", "CSV UTF-8 Encoding Guide", "Debug CSV encoding, delimiters, byte order marks and broken characters before imports.", "csv utf8 encoding bom delimiter"],
  ["postgresql-connection-limit-guide.html", "Database Operations", "db", "CONN", "PostgreSQL Connection Limit Guide", "Inspect active PostgreSQL sessions, pool pressure and connection limits before restarting services.", "postgresql connection limit pg_stat_activity"],
  ["mysql-deadlock-debugging-guide.html", "Database Operations", "db", "DEAD", "MySQL Deadlock Debugging Guide", "Read InnoDB deadlock evidence and transaction patterns before changing indexes or retry logic.", "mysql deadlock debugging innodb status"],
  ["redis-key-naming-guide.html", "Database Operations", "db", "KEY", "Redis Key Naming Guide", "Design Redis key names that are searchable, safe to expire and easier to debug during incidents.", "redis key naming convention cache"],
  ["linux-disk-space-debugging-guide.html", "Shell & DBA Ops", "ops", "DISK", "Linux Disk Space Debugging Guide", "Find which filesystem, directory, container or log stream is consuming Linux disk space.", "linux disk space debugging df du journal"],
  ["nginx-access-log-analysis-guide.html", "Shell & DBA Ops", "ops", "LOG", "Nginx Access Log Analysis Guide", "Use access logs to inspect status codes, latency, upstream behavior and suspicious traffic.", "nginx access log analysis status latency"],
  ["python-pip-requirements-guide.html", "Software Runtime", "code", "PIP", "Python pip Requirements Guide", "Debug requirements.txt, pip installs, package versions and virtual environment mismatches.", "python pip requirements debugging"],
  ["php-ini-configuration-guide.html", "Software Runtime", "code", "INI", "PHP ini Configuration Guide", "Find which php.ini file is active for CLI, FPM and web requests before changing settings.", "php ini configuration cli fpm"],
  ["java-classpath-debugging-guide.html", "Software Runtime", "code", "CP", "Java Classpath Debugging Guide", "Debug classpath, missing classes, duplicate jars and service runtime differences in Java apps.", "java classpath debugging classnotfound"],
  ["nodejs-package-json-scripts-guide.html", "Software Runtime", "code", "NPM", "Node.js package.json Scripts Guide", "Read npm scripts, environment variables and build commands before debugging Node.js deployments.", "nodejs package json scripts npm"]
].map(([file, category, mode, icon, h1, summary, keywords]) => ({
  file,
  category,
  mode,
  icon,
  h1,
  summary,
  keywords,
  title: `${h1} | Formalint`,
  command: commandFor(file),
  related: relatedFor(mode)
}));

function htmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function commandFor(file) {
  const commands = {
    "email-regex-python-guide.html": `import re\npattern = re.compile(r"^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")\nprint(bool(pattern.fullmatch("ada@example.com")))`,
    "email-regex-php-guide.html": `$email = "ada@example.com";\n$isValid = filter_var($email, FILTER_VALIDATE_EMAIL) !== false;`,
    "regex-word-boundary-guide.html": `\\buser\\b`,
    "regex-multiline-anchors-guide.html": `/^ERROR .*$/gm`,
    "regex-url-extraction-guide.html": `https?:\\/\\/[^\\s)\\]"]+`,
    "curl-headers-debugging-guide.html": `curl -i https://api.example.com/orders\ncurl -s -D headers.txt -o body.json https://api.example.com/orders`,
    "curl-bearer-token-guide.html": `curl -i https://api.example.com/me \\\n  -H "Authorization: Bearer REDACTED_TOKEN"`,
    "postman-to-curl-debugging-guide.html": `curl -i -X POST https://api.example.com/items \\\n  -H "Content-Type: application/json" \\\n  --data '{"name":"sample"}'`,
    "api-request-body-validation-guide.html": `Content-Type: application/json\n\n{ "email": "ada@example.com", "roles": ["admin"] }`,
    "api-correlation-id-logging-guide.html": `curl -i https://api.example.com/orders \\\n  -H "X-Correlation-ID: formalint-test-001"`,
    "jwt-signature-verification-guide.html": `alg: RS256\nkid: key-2026-09\nverify signature against the matching JWKS public key`,
    "json-path-query-guide.html": `$.orders[*].items[*].sku`,
    "json-null-vs-undefined-guide.html": `{ "displayName": null }\n// Missing field means no key was sent at all.`,
    "xml-xpath-debugging-guide.html": `/*[local-name()='order']/*[local-name()='id']/text()`,
    "yaml-anchors-aliases-guide.html": `defaults: &defaults\n  restart: unless-stopped\napi:\n  <<: *defaults`,
    "csv-utf8-encoding-guide.html": `file -bi import.csv\niconv -f ISO-8859-9 -t UTF-8 import.csv > import-utf8.csv`,
    "postgresql-connection-limit-guide.html": `SELECT usename, state, count(*)\nFROM pg_stat_activity\nGROUP BY usename, state\nORDER BY count(*) DESC;`,
    "mysql-deadlock-debugging-guide.html": `SHOW ENGINE INNODB STATUS\\G`,
    "redis-key-naming-guide.html": `user:42:session:active\norder:2026-09:12345:status`,
    "linux-disk-space-debugging-guide.html": `df -h\ndu -xh /var/log --max-depth=1 | sort -h\njournalctl --disk-usage`,
    "nginx-access-log-analysis-guide.html": `awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr`,
    "python-pip-requirements-guide.html": `python -m pip freeze\npython -m pip install -r requirements.txt\npython -m pip check`,
    "php-ini-configuration-guide.html": `php --ini\nphp -i | grep "Loaded Configuration File"\nsystemctl status php-fpm --no-pager`,
    "java-classpath-debugging-guide.html": `java -XshowSettings:properties -version\njar tf app.jar | head\nmvn dependency:tree`,
    "nodejs-package-json-scripts-guide.html": `npm run\nnpm run build -- --help\nnode -p "process.env.NODE_ENV"`
  };
  return commands[file];
}

function relatedFor(mode) {
  const groups = {
    regex: ["regex-tester.html", "regex-examples.html", "complete-regex-guide.html"],
    api: ["api-debugging-checklist.html", "curl-api-debugging-cheatsheet.html", "http-headers-reference.html"],
    data: ["json-formatting-guide.html", "xml-linter.html", "yaml-lint-checklist.html"],
    db: ["dba-admin-roadmap.html", "postgresql-dba-checklist.html", "mysql-dba-checklist.html"],
    ops: ["linux-admin-command-guide.html", "docker-compose-debugging-guide.html", "nginx-reverse-proxy-checklist.html"],
    code: ["nodejs-runtime-guide.html", "python-runtime-guide.html", "php-runtime-guide.html"]
  };
  return groups[mode] || ["tools.html", "guides.html", "safe-online-dev-tools.html"];
}

function workflowFor(mode) {
  const shared = {
    regex: [
      ["Scope the pattern", "Decide whether the expression validates a whole value or extracts a fragment from a larger text."],
      ["Test real edges", "Use empty values, copied text, long strings and invalid samples before trusting one green match."],
      ["Keep policy separate", "Let regex check text shape; keep account rules, permissions and deliverability in application logic."]
    ],
    api: [
      ["Capture the exact request", "Record method, URL, headers, body, status, timings and a safe correlation identifier."],
      ["Separate client from server", "Prove whether the issue is in the browser, gateway, upstream service, auth provider or database."],
      ["Repeat with one variable changed", "Use the same request after each fix so the new response is comparable."]
    ],
    data: [
      ["Reduce the sample", "Create the smallest payload that still shows the parser, schema or conversion problem."],
      ["Name the ambiguity", "Mark missing fields, null values, namespaces, encodings or indentation before transforming the data."],
      ["Validate after cleanup", "Run formatting and linting first, then compare behavior against the receiving system."]
    ],
    db: [
      ["Collect read-only evidence", "Capture sessions, locks, plans, status counters or slow queries before changing database state."],
      ["Connect symptom to owner", "Separate application pool pressure, query shape, indexes, storage and service configuration."],
      ["Document the safe fix", "Keep the command, timestamp, result and rollback note with the incident record."]
    ],
    ops: [
      ["Identify the host boundary", "Record whether the command runs on local Windows, WSL, Linux, a container or a remote server."],
      ["Use status before restart", "Collect service state, logs, ports, disk and config before changing the running system."],
      ["Leave a trail", "Write down what changed and how to reverse it after the incident is stable."]
    ],
    code: [
      ["Verify the active runtime", "Capture version, package manager, path and service environment before editing source code."],
      ["Compare shell and service", "A command working in an interactive shell does not prove the deployed process uses the same setup."],
      ["Pin dependency evidence", "Keep the command that proves which package, jar, ini file or script actually ran."]
    ]
  };
  return shared[mode] || shared.data;
}

function mistakesFor(mode) {
  const mistakes = {
    regex: "The common trap is treating one matching example as proof that the expression is safe for every user input.",
    api: "The common trap is changing client code before proving which layer returned the response.",
    data: "The common trap is formatting a sample without preserving the exact parser error and receiving-system context.",
    db: "The common trap is adding indexes or restarting services before collecting session, lock and plan evidence.",
    ops: "The common trap is running the strongest command first instead of collecting read-only status and logs.",
    code: "The common trap is debugging the source file while the running process uses a different runtime or dependency path."
  };
  return mistakes[mode] || mistakes.data;
}

function generatePage(page) {
  const workflowRows = workflowFor(page.mode).map(([step, detail]) => `<tr><td>${htmlEscape(step)}</td><td>${htmlEscape(detail)}</td></tr>`).join("");
  const relatedLinks = page.related.map((href) => `<a href="${href}">${titleFromFile(href)}</a>`).join(", ");
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `https://formalint.com/${page.file}#article`,
    headline: page.h1,
    description: page.summary,
    datePublished: TODAY,
    dateModified: TODAY,
    author: { "@type": "Person", name: "Ensar Karayel" },
    publisher: { "@type": "Organization", name: "Formalint", url: "https://formalint.com/" },
    mainEntityOfPage: `https://formalint.com/${page.file}`,
    proficiencyLevel: "Intermediate"
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; connect-src 'self' https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net https://www.google-analytics.com https://region1.google-analytics.com; font-src 'self'; form-action 'none'; frame-src https://*.googlesyndication.com https://*.doubleclick.net; img-src 'self' data: https://*.googlesyndication.com https://*.google.com https://www.google-analytics.com; object-src 'none'; script-src 'self' 'nonce-formalint-schema' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <title>${htmlEscape(page.title)}</title>
    <meta name="description" content="${htmlEscape(page.summary)}">
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
    <header class="site-header"><a class="brand" href="index.html" aria-label="Formalint home"><img src="assets/img/favicon.svg" alt="" width="34" height="34"><span>Formalint</span></a><nav class="main-nav" aria-label="Main navigation"><a href="index.html">JSON</a><a href="json-diff.html">JSON Diff</a><a href="xml-formatter.html">XML</a><a href="yaml-formatter.html">YAML</a><a href="sql-formatter.html">SQL</a><a href="python-formatter.html">Python</a><a class="active" href="tools.html">All Tools</a><a href="guides.html">Guides</a><a href="about.html">About</a></nav></header>
    <main class="document-page">
      <p class="eyebrow">${htmlEscape(page.category)}</p>
      <h1>${htmlEscape(page.h1)}</h1>
      <p class="guide-meta">${htmlEscape(page.summary)} Last updated September 1, 2026.</p>
      <p>${htmlEscape(page.summary)} This page is written as a practical engineering reference: it starts with evidence, keeps risky assumptions visible and links the next useful Formalint checks.</p>
      <p>Use it when a ticket, incident or pull request needs a repeatable explanation rather than a quick guess. Keep secrets, customer data and production tokens out of browser tools and shared notes.</p>
      <h2>When this page is useful</h2>
      <ul><li>You need a small, shareable diagnostic sequence.</li><li>You want to compare shell output, payload shape or parser behavior before changing code.</li><li>You are preparing notes for another developer, DBA or support engineer.</li></ul>
      <h2>Practical workflow</h2>
      <table class="workflow-table"><thead><tr><th>Step</th><th>What to verify</th></tr></thead><tbody>${workflowRows}</tbody></table>
      <h2>Command or pattern to start with</h2>
      <div class="command-block"><button class="copy-code-button" type="button" data-copy-code>Copy</button><pre><code>${htmlEscape(page.command)}</code></pre></div>
      <h2>Review checklist</h2>
      <ol><li>Confirm the environment where the symptom happens.</li><li>Use a redacted sample that is still realistic enough to reproduce the behavior.</li><li>Keep request headers, payloads, logs and timestamps together.</li><li>Change one variable at a time so the result stays explainable.</li><li>Link the final note to a related Formalint reference for the next person.</li></ol>
      <h2>Common mistake</h2>
      <p>${htmlEscape(mistakesFor(page.mode))}</p>
      <p class="guide-callout">Formalint is strongest when it becomes part of the incident rhythm: reduce the sample, format the evidence, verify the assumption and only then change the system.</p>
      <h2>Related Formalint references</h2>
      <p>Continue with ${relatedLinks}.</p>
      <h2>Frequently asked questions</h2>
      <div class="faq-list"><details><summary>Can I paste production data into this workflow?</summary><p>No. Use redacted or synthetic examples. The workflow is about evidence order, not copying sensitive systems into a browser.</p></details><details><summary>Is this a replacement for logs and tests?</summary><p>No. Treat it as a field guide that helps you decide which logs, tests and commands matter first.</p></details></div>
    </main>
    <footer class="site-footer"><div class="footer-signature" aria-label="Contact"><strong>&copy; 2026 Formalint</strong><span aria-hidden="true">-</span><span>Ensar Karayel</span><span aria-hidden="true">-</span><a href="mailto:karayelensar@gmail.com">karayelensar@gmail.com</a></div><nav aria-label="Footer navigation"><button class="footer-link" type="button" data-consent-open>Privacy Preferences</button><a href="about.html">About</a><a href="how-formalint-works.html">How It Works</a><a href="editorial-policy.html">Editorial Policy</a><a href="changelog.html">Changelog</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></nav></footer>
    <script src="assets/js/shared.js"></script>
  </body>
</html>
`;
}

function titleFromFile(file) {
  const page = pages.find((item) => item.file === file);
  if (page) return htmlEscape(page.h1.replace(" Guide", ""));
  return htmlEscape(file.replace(/\.html$/, "").split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "));
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

function updateCounters() {
  ["index.html", "tools.html"].forEach((name) => {
    const file = path.join(ROOT, name);
    let html = fs.readFileSync(file, "utf8");
    html = html.replace(/Search (100|120|124|150|175) Formalint tools and guides/g, `Search ${LIBRARY_COUNT} Formalint tools and guides`);
    html = html.replace(/Showing (100|120|124|150|175) resources/g, `Showing ${LIBRARY_COUNT} resources`);
    html = html.replace(/(100|120|124|150|175) public pages/g, `${LIBRARY_COUNT} public pages`);
    html = html.replace(/<strong>(100|120|124|150|175)<\/strong><span>Public HTML targets/g, `<strong>${LIBRARY_COUNT}</strong><span>Public HTML targets`);
    fs.writeFileSync(file, html, "utf8");
  });
}

function normalizeToolCard(markup) {
  return markup.trim().split("\n").map((line) => `          ${line.trim()}`).join("\n");
}

function updateToolsAdvancedSection() {
  const file = path.join(ROOT, "tools.html");
  let html = fs.readFileSync(file, "utf8");
  const startMarker = '      <section class="directory-section" aria-labelledby="advanced-reference-title" data-tools-section>';
  const endMarker = '      <section class="directory-section" aria-labelledby="trust-title" data-tools-section>';
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start === -1 || end === -1) throw new Error("Advanced references section markers not found");
  const current = html.slice(start, end);
  const byHref = new Map();
  for (const match of current.matchAll(/<a class="tool-card" href="([^"]+\.html)">[\s\S]*?<\/a>/g)) {
    byHref.set(match[1], normalizeToolCard(match[0]));
  }
  pages.forEach((page) => byHref.set(page.file, normalizeToolCard(card(page))));
  const replacement = `${startMarker}
        <div class="section-heading">
          <p class="eyebrow">Advanced references</p>
          <h2 id="advanced-reference-title">Regex, API, SQL, runtime and operations deep dives</h2>
        </div>
        <div class="directory-grid">
${Array.from(byHref.values()).join("\n")}
        </div>
      </section>

`;
  html = html.slice(0, start) + replacement + html.slice(end);
  fs.writeFileSync(file, html, "utf8");
}

function insertCardsBefore(fileName, marker) {
  const file = path.join(ROOT, fileName);
  let html = fs.readFileSync(file, "utf8");
  const missing = pages.filter((page) => !html.includes(`href="${page.file}"`));
  if (!missing.length) return;
  if (!html.includes(marker)) throw new Error(`Marker not found in ${fileName}`);
  html = html.replace(marker, missing.map(card).join("\n          ") + "\n          " + marker);
  fs.writeFileSync(file, html, "utf8");
}

function updateDirectories() {
  updateToolsAdvancedSection();
  insertCardsBefore("guides.html", '          <a class="tool-card" href="complete-regex-guide.html">');
  insertCardsBefore("index.html", '          <a class="tool-card" href="complete-regex-guide.html"><span>Regex Toolkit</span>');
}

function updateShared() {
  const file = path.join(ROOT, "assets", "js", "shared.js");
  let js = fs.readFileSync(file, "utf8");
  const groupMap = {
    regex: "Regex Lab",
    api: "API Debugging",
    data: "Workspace",
    db: "Database Operations",
    ops: "Shell & DBA Ops",
    code: "Software Runtime"
  };
  Object.entries(groupMap).forEach(([mode, title]) => {
    const groupPages = pages.filter((page) => page.mode === mode && !js.includes(`href: "${page.file}"`));
    if (!groupPages.length) return;
    const start = js.indexOf(`      title: "${title}",`);
    if (start === -1) throw new Error(`Sidebar group not found: ${title}`);
    const linksStart = js.indexOf("      links: [", start);
    const insertAt = js.indexOf("\n      ]", linksStart);
    const links = groupPages.map((page) => `        { label: "${page.h1.replace(/"/g, '\\"').replace(" Guide", "")}", href: "${page.file}", icon: "${page.icon}", description: "${page.summary.replace(/"/g, '\\"')}", keywords: "${page.keywords}" }`).join(",\n");
    js = js.slice(0, insertAt) + ",\n" + links + js.slice(insertAt);
  });
  fs.writeFileSync(file, js, "utf8");
}

function updateToolFilters() {
  const file = path.join(ROOT, "assets", "js", "tools-directory.js");
  let js = fs.readFileSync(file, "utf8");
  js = js.replace(/formatter: \[[^\]]+\]/, 'formatter: ["formatter", "format", "lint", "linter", "indent", "cleanup", "schema", "csv", "utf8", "encoding", "json", "json path", "null", "undefined", "ndjson", "xml", "xpath", "namespace", "yaml", "anchors", "compose", "sql", "python"]');
  js = js.replace(/regex: \[[^\]]+\]/, 'regex: ["regex", "regular expression", "lookahead", "lookbehind", "email", "python", "php", "word boundary", "multiline", "anchors", "phone", "password", "ip address", "slug", "hex", "capture", "numbers", "duplicate", "whitespace", "uuid", "url", "date", "log parser", "javascript regex"]');
  js = js.replace(/api: \[[^\]]+\]/, 'api: ["api", "http", "method", "post", "json request", "headers", "bearer token", "authorization", "postman", "request body", "versioning", "error response", "correlation id", "jwt", "signature", "jwks", "expiration", "401", "403", "timeout", "oauth", "refresh token", "cors", "webhook", "graphql", "cookie", "samesite", "rate limit", "cache-control", "status"]');
  js = js.replace(/ops: \[[^\]]+\]/, 'ops: ["dba", "database", "postgresql", "connection limit", "mysql", "deadlock", "redis", "key naming", "docker", "volume", "kubernetes", "crashloopbackoff", "nginx", "access log", "linux", "disk space", "systemctl", "journalctl", "windows", "powershell", "git", "branch", "dns", "tls", "cockpit"]');
  js = js.replace(/runtime: \[[^\]]+\]/, 'runtime: ["runtime", "node", "node.js", "npm", "package.json", "scripts", "environment", "php", "composer", "php.ini", "dependency", "fpm", "java", "jdk", "maven", "classpath", "thread dump", "python", "pip", "requirements", "virtualenv", "fastapi", "django", "flask"]');
  fs.writeFileSync(file, js, "utf8");
}

function updateChangelog() {
  const file = path.join(ROOT, "changelog.html");
  let html = fs.readFileSync(file, "utf8");
  const entry = `      <h2>September 1, 2026 - 175 Page Reference Expansion</h2>
      <p>Expanded Formalint to 175 public pages with 25 additional regex, curl, API request evidence, JWT, JSON, XML, YAML, CSV, PostgreSQL, MySQL, Redis, Linux, Nginx, Python, PHP, Java and Node.js references. Updated internal discovery, sidebar search, sitemap and cache version so the larger library is visible to users and crawlers.</p>
`;
  if (!html.includes("175 Page Reference Expansion")) {
    html = html.replace("      <h2>September 1, 2026 - 150 Page Search Expansion</h2>", entry + "      <h2>September 1, 2026 - 150 Page Search Expansion</h2>");
  }
  fs.writeFileSync(file, html, "utf8");
}

function updateSitemap() {
  const htmlFiles = fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).sort((a, b) => a.localeCompare(b));
  const body = htmlFiles.map((name) => {
    const priority = name === "index.html" ? "1.0" : pages.some((page) => page.file === name) ? "0.72" : "0.7";
    return `  <url>
    <loc>https://formalint.com/${name === "index.html" ? "" : name}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`, "utf8");
}

pages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), generatePage(page), "utf8"));
replaceAllCacheVersions();
updateCounters();
updateDirectories();
updateShared();
updateToolFilters();
updateChangelog();
updateSitemap();

console.log(`Formalint library expanded to ${fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).length} HTML pages.`);
