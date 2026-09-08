const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CACHE_VERSION = "20260908-library-220";
const LIBRARY_COUNT = 220;
const TODAY = "2026-09-08";
const HUMAN_DATE = "September 8, 2026";

const guidePages = [
  {
    file: "developer-forum-question-guide.html",
    category: "Community Forum",
    mode: "community",
    icon: "Q",
    h1: "Developer Forum Question Guide",
    summary: "Write developer forum questions with context, expected behavior, actual behavior, safe samples and a clear next step.",
    keywords: "developer forum question guide programming help debugging question",
    command: "Context:\nExpected result:\nActual result:\nWhat I tried:\nSafe sample:\nEnvironment:",
    workflow: [["Start with the task", "Explain what you were trying to build, validate, deploy or debug."], ["Show safe evidence", "Include redacted payloads, commands, error text, versions and timestamps."], ["Name the gap", "Say whether you need explanation, a regex, a query review, deployment advice or DBA triage."], ["Close the loop", "Reply with the final fix so the thread becomes useful to the next developer."]],
    related: ["forum.html", "minimal-reproduction-guide.html", "bug-report-template-guide.html"]
  },
  {
    file: "minimal-reproduction-guide.html",
    category: "Community Forum",
    mode: "community",
    icon: "MIN",
    h1: "Minimal Reproduction Guide",
    summary: "Reduce a bug report to the smallest safe example that still proves the behavior another developer needs to inspect.",
    keywords: "minimal reproduction guide debugging example bug report",
    command: "1. Remove private data\n2. Keep the failing input\n3. Keep the exact error\n4. Add versions\n5. Describe one expected result",
    workflow: [["Remove unrelated systems", "Cut the example down until only the failing parser, request, query or runtime behavior remains."], ["Keep the failing input", "Do not simplify away the exact value that triggers the bug."], ["Add versions", "Runtime, browser, package, database and operating-system versions often decide the answer."], ["Make it runnable", "A pasted sample, command or short file should let another developer reproduce the issue."]],
    related: ["forum.html", "developer-forum-question-guide.html", "browser-console-debugging-guide.html"]
  },
  {
    file: "bug-report-template-guide.html",
    category: "Community Forum",
    mode: "community",
    icon: "BUG",
    h1: "Bug Report Template Guide",
    summary: "Use a concise bug report structure for browser, API, database, formatter and deployment problems without leaking sensitive data.",
    keywords: "bug report template guide developer debugging report",
    command: "Title:\nImpact:\nSteps to reproduce:\nExpected:\nActual:\nLogs or screenshots:\nSafe sample:\nOwner:",
    workflow: [["Name the impact", "Say who is blocked and whether the problem is production, staging, local or documentation only."], ["List exact steps", "Write the shortest click path, command sequence or API request flow."], ["Separate expected from actual", "This prevents diagnosis from turning into a vague complaint."], ["Attach safe proof", "Use redacted logs, screenshots, headers or payloads and keep secrets out."]],
    related: ["developer-forum-question-guide.html", "api-debugging-checklist.html", "github-pages-deployment-log-guide.html"]
  },
  {
    file: "code-review-question-guide.html",
    category: "Community Forum",
    mode: "community",
    icon: "CR",
    h1: "Code Review Question Guide",
    summary: "Ask code review questions that focus on behavior, risk, tests, edge cases and maintainability instead of personal preference.",
    keywords: "code review question guide developer review checklist",
    command: "Behavior risk:\nSecurity or data risk:\nTests added:\nEdge cases:\nRollback note:",
    workflow: [["Lead with behavior", "Ask whether the change preserves user-visible and API-visible behavior."], ["Point at risk", "Security, data loss, auth, performance and migration risk deserve the first review pass."], ["Ask for missing tests", "Name the exact edge case that would make you trust the change more."], ["Document the decision", "If the review teaches a rule, turn it into a short team note."]],
    related: ["forum.html", "release-checklist-for-developers.html", "dependency-vulnerability-triage-guide.html"]
  },
  {
    file: "api-debugging-forum-template.html",
    category: "Community Forum",
    mode: "community",
    icon: "API",
    h1: "API Debugging Forum Template",
    summary: "Share API debugging questions with method, endpoint, status, headers, safe payload shape and correlation evidence.",
    keywords: "api debugging forum template curl status headers correlation id",
    command: "Method: POST\nEndpoint: /v1/orders\nStatus: 403\nCorrelation-ID: req_redacted\nHeaders: redacted\nBody shape: { ... }",
    workflow: [["Record request identity", "Method, endpoint, environment and status code come before framework guesses."], ["Redact auth data", "Never paste bearer tokens, cookies, API keys or customer records."], ["Include one reproduction", "A safe curl command usually beats a paragraph of memory."], ["Link related evidence", "CORS, timeout, pagination, webhook and auth pages should be linked when relevant."]],
    related: ["curl-api-debugging-cheatsheet.html", "api-401-403-debugging-guide.html", "forum.html"]
  },
  {
    file: "database-incident-forum-template.html",
    category: "Community Forum",
    mode: "community",
    icon: "DB",
    h1: "Database Incident Forum Template",
    summary: "Ask database incident questions with read-only evidence for sessions, locks, slow queries, storage, cache and timestamps.",
    keywords: "database incident forum template dba slow query locks sessions",
    command: "Database:\nVersion:\nSymptom window:\nRead-only checks:\nSlow query sample:\nLock/session evidence:\nRecent deployment:",
    workflow: [["Start read-only", "Use safe diagnostic SQL and avoid destructive fixes while the incident is unclear."], ["Capture time windows", "Database symptoms need timestamps to match API logs, jobs and user reports."], ["Separate query from host", "Slow pages can come from SQL, connection pools, disk IO, Redis or network pressure."], ["Share only safe samples", "Hash IDs, remove customer data and redact connection strings."]],
    related: ["postgresql-dba-checklist.html", "mysql-slow-query-debugging-guide.html", "forum.html"]
  },
  {
    file: "community-moderation-policy.html",
    category: "Community Forum",
    mode: "community",
    icon: "MOD",
    h1: "Community Moderation Policy",
    summary: "Define Formalint forum rules for safe samples, respectful technical discussion, no secrets, no spam and practical developer help.",
    keywords: "community moderation policy developer forum rules safe samples",
    command: "No secrets\nNo personal data\nNo spam\nNo harassment\nUse safe examples\nKeep answers technical and reproducible",
    workflow: [["Protect private data", "Remove credentials, tokens, cookies, personal data and customer records from every example."], ["Keep it technical", "Threads should help someone debug, validate, format, deploy or understand a developer workflow."], ["Reject spam", "Thin promotional content and unrelated links reduce trust for users and crawlers."], ["Prefer closure", "Good threads end with the fix, limitation or next safe diagnostic step."]],
    related: ["forum.html", "privacy.html", "editorial-policy.html"]
  }
];

const forumPage = {
  file: "forum.html",
  h1: "Formalint Developer Forum",
  summary: "A local-first developer forum workspace for drafting debugging questions, collecting safe examples and sharing Formalint notes without account tracking."
};

function htmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function header(activeHref) {
  const items = [
    ["index.html", "JSON"],
    ["json-diff.html", "JSON Diff"],
    ["xml-formatter.html", "XML"],
    ["yaml-formatter.html", "YAML"],
    ["sql-formatter.html", "SQL"],
    ["python-formatter.html", "Python"],
    ["tools.html", "All Tools"],
    ["guides.html", "Guides"],
    ["forum.html", "Forum"],
    ["about.html", "About"]
  ];
  return `<header class="site-header"><a class="brand" href="index.html" aria-label="Formalint home"><img src="assets/img/favicon.svg" alt="" width="34" height="34"><span>Formalint</span></a><nav class="main-nav" aria-label="Main navigation">${items.map(([href, label]) => `<a${href === activeHref ? ' class="active"' : ""} href="${href}">${label}</a>`).join("")}</nav></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-signature" aria-label="Contact"><strong>&copy; 2026 Formalint</strong><span aria-hidden="true">-</span><span>Ensar Karayel</span><span aria-hidden="true">-</span><a href="mailto:karayelensar@gmail.com">karayelensar@gmail.com</a></div><nav aria-label="Footer navigation"><button class="footer-link" type="button" data-consent-open>Privacy Preferences</button><a href="about.html">About</a><a href="how-formalint-works.html">How It Works</a><a href="editorial-policy.html">Editorial Policy</a><a href="changelog.html">Changelog</a><a href="forum.html">Forum</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></nav></footer>`;
}

function head(title, description, canonical, schema, extraScript = "") {
  return `<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; connect-src 'self' https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net https://www.google-analytics.com https://region1.google-analytics.com; font-src 'self'; form-action 'none'; frame-src https://*.googlesyndication.com https://*.doubleclick.net; img-src 'self' data: https://*.googlesyndication.com https://*.google.com https://www.google-analytics.com; object-src 'none'; script-src 'self' 'nonce-formalint-schema' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <title>${htmlEscape(title)}</title>
    <meta name="description" content="${htmlEscape(description)}">
    <meta name="author" content="Ensar Karayel">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="https://formalint.com/${canonical}">
    <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.svg">
    <link rel="manifest" href="manifest.webmanifest">
    <link rel="stylesheet" href="assets/css/styles.css?v=${CACHE_VERSION}">
    <script src="assets/js/analytics-consent.js"></script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6534346834787678" crossorigin="anonymous"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-SGR2EZG0BM"></script>
    <script type="application/ld+json" nonce="formalint-schema">
      ${JSON.stringify(schema)}
    </script>${extraScript}
  </head>`;
}

function guidePage(page) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `https://formalint.com/${page.file}#article`,
    headline: page.h1,
    description: page.summary,
    datePublished: TODAY,
    dateModified: TODAY,
    author: { "@type": "Person", name: "Ensar Karayel", email: "karayelensar@gmail.com" },
    publisher: { "@type": "Organization", name: "Formalint", url: "https://formalint.com/" },
    mainEntityOfPage: `https://formalint.com/${page.file}`
  };
  const workflowRows = page.workflow.map(([step, detail]) => `<tr><td>${htmlEscape(step)}</td><td>${htmlEscape(detail)}</td></tr>`).join("");
  const relatedLinks = page.related.map((href) => `<a href="${href}">${htmlEscape(titleFromFile(href))}</a>`).join(", ");
  return `<!doctype html>
<html lang="en">
  ${head(`${page.h1} | Formalint`, page.summary, page.file, schema)}
  <body>
    ${header("guides.html")}
    <main class="document-page">
      <p class="eyebrow">${htmlEscape(page.category)}</p>
      <h1>${htmlEscape(page.h1)}</h1>
      <p class="guide-meta">${htmlEscape(page.summary)} Last updated ${HUMAN_DATE}.</p>
      <p>${htmlEscape(page.summary)} It helps developers ask better questions, preserve useful evidence and keep public examples safe enough to share.</p>
      <h2>Use this when</h2>
      <ul><li>You want another developer to understand the issue without guessing.</li><li>You need to remove secrets and private data before sharing evidence.</li><li>You want the final answer to become a reusable Formalint-style reference.</li></ul>
      <h2>Practical workflow</h2>
      <table class="workflow-table"><thead><tr><th>Step</th><th>What to include</th></tr></thead><tbody>${workflowRows}</tbody></table>
      <h2>Template</h2>
      <div class="command-block"><button class="copy-code-button" type="button" data-copy-code>Copy</button><pre><code>${htmlEscape(page.command)}</code></pre></div>
      <h2>Safety checklist</h2>
      <ol><li>Remove passwords, tokens, cookies, private keys and connection strings.</li><li>Replace customer records with tiny synthetic examples.</li><li>Keep exact error text, versions, command output and timestamps when safe.</li><li>Say what changed after the fix so the answer helps future readers.</li></ol>
      <p class="guide-callout">Good forum content is not long by default. It is specific, safe, reproducible and useful after the first reader leaves.</p>
      <h2>Related Formalint references</h2>
      <p>Continue with ${relatedLinks}.</p>
    </main>
    ${footer()}
    <script src="assets/js/shared.js"></script>
  </body>
</html>
`;
}

function forumHtml() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://formalint.com/forum.html#webpage",
    name: "Formalint Developer Forum",
    description: forumPage.summary,
    url: "https://formalint.com/forum.html",
    datePublished: TODAY,
    dateModified: TODAY,
    publisher: { "@type": "Organization", name: "Formalint", url: "https://formalint.com/" }
  };
  return `<!doctype html>
<html lang="en">
  ${head("Formalint Developer Forum - Softest Debugging Lounge", forumPage.summary, "forum.html", schema, '\n    <script defer src="assets/js/forum.js"></script>')}
  <body>
    ${header("forum.html")}
    <main class="forum-page" data-forum-board>
      <section class="forum-hero">
        <div>
          <p class="eyebrow">Community workspace</p>
          <h1>Formalint Developer Forum</h1>
          <p class="hero-copy">Draft debugging questions, keep safe local notes and prepare shareable developer threads with a playful Softest handle. No account, no username tracking, no server-side storage in this static release.</p>
        </div>
        <aside class="forum-identity-card" aria-label="Local forum identity">
          <span class="eyebrow">Your local handle</span>
          <strong class="forum-handle" data-forum-handle>Softest-0000</strong>
          <p class="forum-note">This name is generated in your browser. It is only for fun and can be changed anytime.</p>
          <button type="button" class="secondary-action" data-regenerate-handle>Generate another Softest</button>
        </aside>
      </section>
      <section class="forum-board">
        <form class="forum-composer" data-forum-form>
          <h2>Write a debugging note</h2>
          <label for="forumTopic">Topic<select id="forumTopic"><option>General</option><option>Regex</option><option>JSON</option><option>API</option><option>DBA</option><option>Linux</option><option>Frontend</option><option>AdSense and SEO</option></select></label>
          <label for="forumTitle">Title<input id="forumTitle" maxlength="120" placeholder="Example: Regex works locally but fails in JavaScript"></label>
          <label for="forumBody">Details<textarea id="forumBody" maxlength="1200" placeholder="What did you expect, what happened, what did you try, and what safe sample can someone inspect?"></textarea></label>
          <p class="forum-note">Posts in this version stay in this browser. Do not paste secrets, tokens, cookies, private keys or customer data.</p>
          <div class="forum-actions">
            <button type="submit" class="primary-action">Save local post</button>
            <button type="button" class="secondary-action" data-copy-forum-draft>Copy draft</button>
            <button type="button" class="secondary-action" data-clear-forum-posts>Clear local posts</button>
          </div>
          <p class="forum-status" data-forum-status aria-live="polite"></p>
        </form>
        <section class="forum-panel" aria-labelledby="forumThreadsTitle">
          <div class="section-heading">
            <p class="eyebrow">Threads</p>
            <h2 id="forumThreadsTitle">Softest debugging lounge</h2>
          </div>
          <div class="forum-list" data-forum-list></div>
          <p class="forum-note" data-forum-empty hidden>No local notes yet. Start with one safe debugging question.</p>
        </section>
      </section>
      <section class="directory-section" aria-labelledby="forumGuideTitle">
        <div class="section-heading">
          <p class="eyebrow">Better threads</p>
          <h2 id="forumGuideTitle">Write questions developers can answer</h2>
        </div>
        <div class="directory-grid">
          ${guidePages.map(card).join("\n          ")}
        </div>
      </section>
    </main>
    ${footer()}
    <script src="assets/js/shared.js"></script>
  </body>
</html>
`;
}

function titleFromFile(file) {
  const page = guidePages.find((item) => item.file === file);
  if (page) {
    return page.h1.replace(" Guide", "").replace(" Template", "");
  }
  if (file === "forum.html") {
    return "Formalint Developer Forum";
  }
  return file.replace(/\.html$/, "").split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function card(page) {
  return `<a class="tool-card" href="${page.file}"><span>${htmlEscape(page.h1.replace(" Guide", "").replace(" Template", ""))}</span><small>${htmlEscape(page.summary)}</small></a>`;
}

function replaceCacheAndNav() {
  fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).forEach((name) => {
    const file = path.join(ROOT, name);
    let html = fs.readFileSync(file, "utf8");
    html = html.replace(/styles\.css\?v=[0-9a-z-]+/g, `styles.css?v=${CACHE_VERSION}`);
    if (!html.includes('href="forum.html"')) {
      html = html.replace(/(<a(?: class="active")? href="guides\.html">Guides<\/a>)/g, '$1<a href="forum.html">Forum</a>');
      html = html.replace(/(<a href="changelog\.html">Changelog<\/a>)/g, '$1<a href="forum.html">Forum</a>');
    }
    fs.writeFileSync(file, html, "utf8");
  });
}

function updateCounters() {
  ["index.html", "tools.html"].forEach((name) => {
    const file = path.join(ROOT, name);
    let html = fs.readFileSync(file, "utf8");
    html = html.replace(/Search \d+ Formalint tools and guides/g, `Search ${LIBRARY_COUNT} Formalint tools and guides`);
    html = html.replace(/Showing \d+ resources/g, `Showing ${LIBRARY_COUNT} resources`);
    html = html.replace(/\d+ public pages/g, `${LIBRARY_COUNT} public pages`);
    html = html.replace(/<strong>\d+<\/strong><span>Public HTML targets/g, `<strong>${LIBRARY_COUNT}</strong><span>Public HTML targets`);
    fs.writeFileSync(file, html, "utf8");
  });
}

function replaceOrInsertManagedBlock(source, startComment, endComment, content, marker) {
  if (source.includes(startComment) && source.includes(endComment)) {
    const start = source.indexOf(startComment);
    const end = source.indexOf(endComment, start) + endComment.length;
    return source.slice(0, start) + startComment + "\n" + content + endComment + source.slice(end);
  }
  if (!source.includes(marker)) {
    throw new Error(`Marker not found: ${marker}`);
  }
  return source.replace(marker, startComment + "\n" + content + endComment + "\n\n" + marker);
}

function normalizeToolCard(markup) {
  return markup.trim().split("\n").map((line) => `          ${line.trim()}`).join("\n");
}

function sectionMarkup(id, eyebrow, h2, pages) {
  return `      <section class="directory-section" aria-labelledby="${id}" data-tools-section>
        <div class="section-heading">
          <p class="eyebrow">${eyebrow}</p>
          <h2 id="${id}">${h2}</h2>
        </div>
        <div class="directory-grid">
          ${normalizeToolCard(`<a class="tool-card" href="${forumPage.file}"><span>${forumPage.h1}</span><small>${forumPage.summary}</small></a>`)}
${pages.map((page) => normalizeToolCard(card(page))).join("\n")}
        </div>
      </section>

`;
}

function updateToolsPage() {
  const file = path.join(ROOT, "tools.html");
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes('data-tools-topic="community"')) {
    html = html.replace('          <button type="button" data-tools-topic="browser" aria-pressed="false">Browser</button>', '          <button type="button" data-tools-topic="browser" aria-pressed="false">Browser</button>\n          <button type="button" data-tools-topic="community" aria-pressed="false">Community</button>');
  }
  if (!html.includes('data-tools-query="softest"')) {
    html = html.replace('          <button type="button" data-tools-query="devtools" data-tools-topic-jump="browser">devtools</button>', '          <button type="button" data-tools-query="devtools" data-tools-topic-jump="browser">devtools</button>\n          <button type="button" data-tools-query="softest" data-tools-topic-jump="community">softest</button>\n          <button type="button" data-tools-query="minimal reproduction" data-tools-topic-jump="community">minimal reproduction</button>');
  }
  const content = sectionMarkup("community-forum-title", "Community forum", "Forum, question templates and safe debugging threads", guidePages);
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint community sections start -->",
    "      <!-- Formalint community sections end -->",
    content,
    "      <!-- Formalint living index sections start -->"
  );
  fs.writeFileSync(file, html, "utf8");
}

function insertCardsBefore(fileName, marker) {
  const file = path.join(ROOT, fileName);
  let html = fs.readFileSync(file, "utf8");
  const additions = [{ file: forumPage.file, h1: forumPage.h1, summary: forumPage.summary }].concat(guidePages);
  const missing = additions.filter((page) => !html.includes(`href="${page.file}"`));
  if (!missing.length) {
    return;
  }
  if (!html.includes(marker)) {
    throw new Error(`Marker not found in ${fileName}`);
  }
  html = html.replace(marker, missing.map(card).join("\n          ") + "\n          " + marker);
  fs.writeFileSync(file, html, "utf8");
}

function updateHomeAndGuides() {
  insertCardsBefore("guides.html", '          <a class="tool-card" href="complete-regex-guide.html">');
  insertCardsBefore("index.html", '          <a class="tool-card" href="complete-regex-guide.html"><span>Regex Toolkit</span>');
}

function updateSharedSidebar() {
  const file = path.join(ROOT, "assets", "js", "shared.js");
  let js = fs.readFileSync(file, "utf8");
  const links = [
    { label: "Formalint Developer Forum", href: "forum.html", icon: "CHAT", description: forumPage.summary, keywords: "forum softest developer questions community debugging" }
  ].concat(guidePages.map((page) => ({
    label: page.h1.replace(" Guide", "").replace(" Template", ""),
    href: page.file,
    icon: page.icon,
    description: page.summary,
    keywords: page.keywords
  })));
  const group = `    {
      title: "Community Forum",
      mode: "community",
      description: "Draft safe debugging questions, local Softest posts and reusable community templates.",
      links: [
${links.map((link) => `        { label: "${link.label.replace(/"/g, '\\"')}", href: "${link.href}", icon: "${link.icon}", description: "${link.description.replace(/"/g, '\\"')}", keywords: "${link.keywords}" }`).join(",\n")}
      ]
    },
`;
  js = replaceOrInsertManagedBlock(
    js,
    "    // Formalint community groups start",
    "    // Formalint community groups end",
    group,
    "    // Formalint living index groups start"
  );
  if (!js.includes('label: "Forum",\n      description: "Open the Softest developer forum workspace."')) {
    js = js.replace('    {\n      mode: "hardware",', `    {
      mode: "community",
      icon: "CHAT",
      label: "Forum",
      description: "Open the Softest developer forum workspace.",
      tip: "Use this mode to draft safe questions, bug reports and minimal reproductions without account tracking.",
      href: "forum.html",
      workflow: [
        "Use a local Softest handle instead of a real username.",
        "Remove secrets, customer data, tokens and private URLs before writing.",
        "Turn the question into a minimal reproduction or template when possible.",
        "Copy the final note into your team system or future public forum backend."
      ]
    },
    {
      mode: "hardware",`);
  }
  if (!js.includes('{ label: "Forum", href: "forum.html"')) {
    js = js.replace('{ label: "Guides", href: "guides.html", icon: "DOC", description: "Start from the full reference library." },', '{ label: "Guides", href: "guides.html", icon: "DOC", description: "Start from the full reference library." },\n        { label: "Forum", href: "forum.html", icon: "CHAT", description: "Open the local-first Formalint developer forum." },');
  }
  fs.writeFileSync(file, js, "utf8");
}

function updateToolMatchers() {
  const file = path.join(ROOT, "assets", "js", "tools-directory.js");
  let js = fs.readFileSync(file, "utf8");
  if (!js.includes("community: [")) {
    js = js.replace(
      '    browser: ["browser", "devtools", "console", "network tab", "source map", "core web vitals", "lighthouse", "javascript error", "stack trace"]',
      '    browser: ["browser", "devtools", "console", "network tab", "source map", "core web vitals", "lighthouse", "javascript error", "stack trace"],\n    community: ["community", "forum", "softest", "question", "bug report", "minimal reproduction", "code review", "api debugging forum", "database incident", "moderation"]'
    );
  }
  fs.writeFileSync(file, js, "utf8");
}

function updateChangelog() {
  const file = path.join(ROOT, "changelog.html");
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes("220 Page Community Forum Update")) {
    const entry = `      <h2>September 8, 2026 - 220 Page Community Forum Update</h2>
      <p>Expanded Formalint to 220 public pages and added the local-first Formalint Developer Forum. The forum creates playful Softest handles in the browser, lets visitors draft safe debugging posts locally and links to new guides for forum questions, minimal reproductions, bug reports, code review questions, API debugging threads, database incident posts and community moderation. Updated tools discovery, sidebar navigation, cache version and sitemap for the daily maintained release.</p>
`;
    html = html.replace("      <h2>September 8, 2026 - 212 Page Living Index Update</h2>", entry + "      <h2>September 8, 2026 - 212 Page Living Index Update</h2>");
    fs.writeFileSync(file, html, "utf8");
  }
}

function updateSitemap() {
  const htmlFiles = fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).sort((a, b) => a.localeCompare(b));
  const newPageFiles = new Set([forumPage.file].concat(guidePages.map((page) => page.file)));
  const body = htmlFiles.map((name) => {
    const loc = name === "index.html" ? "https://formalint.com/" : `https://formalint.com/${name}`;
    const priority = name === "index.html" ? "1.0" : newPageFiles.has(name) ? "0.75" : "0.7";
    return `  <url>
    <loc>${loc}</loc>
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

guidePages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), guidePage(page), "utf8"));
fs.writeFileSync(path.join(ROOT, forumPage.file), forumHtml(), "utf8");
replaceCacheAndNav();
updateCounters();
updateToolsPage();
updateHomeAndGuides();
updateSharedSidebar();
updateToolMatchers();
updateChangelog();
updateSitemap();

console.log(`Formalint library expanded to ${fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).length} HTML pages.`);
