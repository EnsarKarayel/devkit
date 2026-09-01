const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CACHE_VERSION = "20260901-library-200";
const LIBRARY_COUNT = 200;
const TODAY = "2026-09-01";

const pages = [
  ["csp-debugging-guide.html", "Security & Compliance", "security", "CSP", "Content Security Policy Debugging Guide", "Debug CSP violations, script sources, nonce usage, reports and safe rollout steps without weakening browser security.", "csp debugging content security policy nonce script-src"],
  ["hsts-preload-guide.html", "Security & Compliance", "security", "HSTS", "HSTS Preload Guide", "Review HSTS headers, preload requirements, subdomain risk and HTTPS rollout checks before submitting a domain.", "hsts preload guide strict transport security"],
  ["csrf-token-debugging-guide.html", "Security & Compliance", "security", "CSRF", "CSRF Token Debugging Guide", "Debug CSRF token mismatches, SameSite cookies, forms, headers and cross-origin session flows.", "csrf token debugging samesite cookie header"],
  ["api-key-rotation-guide.html", "Security & Compliance", "security", "KEY", "API Key Rotation Guide", "Rotate API keys with inventory, staged rollout, logging, rollback and safe secret handling.", "api key rotation secrets rollback"],
  ["secrets-redaction-checklist.html", "Security & Compliance", "security", "MASK", "Secrets Redaction Checklist", "Redact tokens, passwords, connection strings and customer identifiers before sharing logs or payloads.", "secrets redaction checklist token password log"],
  ["dependency-vulnerability-triage-guide.html", "Security & Compliance", "security", "CVE", "Dependency Vulnerability Triage Guide", "Triage dependency vulnerabilities by reachability, exploitability, version constraints and release risk.", "dependency vulnerability triage cve npm composer maven pip"],
  ["secure-cookie-checklist.html", "Security & Compliance", "security", "CK", "Secure Cookie Checklist", "Review Secure, HttpOnly, SameSite, domain, path and expiration choices for web session cookies.", "secure cookie checklist httponly samesite"],
  ["github-actions-debugging-guide.html", "CI/CD & Release", "delivery", "GHA", "GitHub Actions Debugging Guide", "Debug failed GitHub Actions jobs with logs, runners, checkout state, caches, secrets and matrix values.", "github actions debugging workflow logs runner"],
  ["github-actions-env-secrets-guide.html", "CI/CD & Release", "delivery", "ENV", "GitHub Actions Environment Secrets Guide", "Use GitHub Actions secrets, variables and environments without leaking values into logs or builds.", "github actions secrets environment variables"],
  ["docker-build-cache-debugging-guide.html", "CI/CD & Release", "delivery", "BUILD", "Docker Build Cache Debugging Guide", "Debug Docker build cache, layers, build args, context size and stale images in CI pipelines.", "docker build cache debugging buildkit layers"],
  ["ci-failing-tests-debugging-guide.html", "CI/CD & Release", "delivery", "TEST", "CI Failing Tests Debugging Guide", "Separate flaky tests, missing services, env drift, dependency changes and timeout failures in CI.", "ci failing tests debugging flaky env timeout"],
  ["deployment-rollback-checklist.html", "CI/CD & Release", "delivery", "ROLL", "Deployment Rollback Checklist", "Prepare rollback evidence, database compatibility, feature flags and release notes before production deploys.", "deployment rollback checklist release"],
  ["release-checklist-for-developers.html", "CI/CD & Release", "delivery", "REL", "Release Checklist for Developers", "Ship safer releases with version notes, migrations, monitoring, smoke tests and support handoff.", "release checklist developers deployment"],
  ["log-levels-guide.html", "Observability", "observe", "LOG", "Log Levels Guide", "Choose debug, info, warn and error levels so production logs stay useful during incidents.", "log levels guide debug info warn error"],
  ["structured-logging-guide.html", "Observability", "observe", "JSON", "Structured Logging Guide", "Design JSON logs with correlation IDs, event names, user-safe fields and searchable incident context.", "structured logging json correlation id"],
  ["application-health-check-guide.html", "Observability", "observe", "HEALTH", "Application Health Check Guide", "Design health endpoints that separate liveness, readiness, dependencies and degraded service states.", "application health check liveness readiness"],
  ["uptime-monitoring-checklist.html", "Observability", "observe", "UP", "Uptime Monitoring Checklist", "Monitor public endpoints, APIs, certificates and user-visible flows without creating noisy alerts.", "uptime monitoring checklist api certificate"],
  ["error-budget-slo-guide.html", "Observability", "observe", "SLO", "Error Budget and SLO Guide", "Use SLOs and error budgets to explain reliability work, incidents and release risk.", "error budget slo guide reliability"],
  ["cloudflare-dns-deployment-guide.html", "Cloud Deployment", "cloud", "CF", "Cloudflare DNS Deployment Guide", "Prepare Cloudflare DNS, proxy mode, SSL settings, redirects and verification before launching a site.", "cloudflare dns deployment ssl proxy"],
  ["vercel-environment-variables-guide.html", "Cloud Deployment", "cloud", "VC", "Vercel Environment Variables Guide", "Debug Vercel environment variables across preview, production and local development builds.", "vercel environment variables production preview"],
  ["static-site-deployment-checklist.html", "Cloud Deployment", "cloud", "STATIC", "Static Site Deployment Checklist", "Launch static sites with canonical URLs, sitemap, robots, HTTPS, analytics and cache checks.", "static site deployment checklist sitemap https"],
  ["github-pages-custom-domain-guide.html", "Cloud Deployment", "cloud", "PAGES", "GitHub Pages Custom Domain Guide", "Connect a custom domain to GitHub Pages with A records, CNAME, HTTPS and DNS propagation checks.", "github pages custom domain cname a record https"],
  ["ssl-renewal-debugging-guide.html", "Cloud Deployment", "cloud", "SSL", "SSL Renewal Debugging Guide", "Debug SSL renewal, certificate chains, DNS validation, rate limits and expired HTTPS endpoints.", "ssl renewal debugging certificate dns validation"],
  ["cdn-cache-purge-guide.html", "Cloud Deployment", "cloud", "CDN", "CDN Cache Purge Guide", "Purge CDN cache safely while preserving user performance, asset versioning and rollout evidence.", "cdn cache purge guide asset versioning"],
  ["robots-txt-sitemap-launch-guide.html", "Cloud Deployment", "cloud", "BOT", "Robots.txt and Sitemap Launch Guide", "Review robots.txt, sitemap URLs, canonical targets and indexing signals before a public launch.", "robots txt sitemap launch canonical indexing"]
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
  workflow: workflowFor(mode),
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
    "csp-debugging-guide.html": `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-example'; object-src 'none'; base-uri 'self'`,
    "hsts-preload-guide.html": `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
    "csrf-token-debugging-guide.html": `curl -i -X POST https://app.example.com/form \\\n  -H "X-CSRF-Token: REDACTED" \\\n  -b "session=REDACTED"`,
    "api-key-rotation-guide.html": `old_key: active-readonly\nnew_key: active\ncutover_time: 2026-09-01T21:00:00Z\nrollback_owner: platform`,
    "secrets-redaction-checklist.html": `Authorization: Bearer [REDACTED]\npostgres://user:[REDACTED]@db.example.com/app\napi_key=[REDACTED]`,
    "dependency-vulnerability-triage-guide.html": `npm audit --omit=dev\ncomposer audit\nmvn org.owasp:dependency-check-maven:check\npython -m pip-audit`,
    "secure-cookie-checklist.html": `Set-Cookie: session=...; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`,
    "github-actions-debugging-guide.html": `gh run list\ngh run view RUN_ID --log\ngh workflow view build.yml`,
    "github-actions-env-secrets-guide.html": "env:\n  NODE_ENV: production\nsecrets:\n  API_TOKEN: ${{ secrets.API_TOKEN }}",
    "docker-build-cache-debugging-guide.html": `docker build --no-cache -t app:test .\ndocker buildx build --progress=plain .`,
    "ci-failing-tests-debugging-guide.html": `npm test -- --runInBand\npytest -q --maxfail=1\nmvn -q test`,
    "deployment-rollback-checklist.html": `release: 2026.09.01\nprevious_version: 2026.08.31\nrollback_command: documented\nmigration_backward_compatible: yes`,
    "release-checklist-for-developers.html": `version\nmigration\nfeature flags\nsmoke tests\nmonitoring\nsupport note\nrollback owner`,
    "log-levels-guide.html": `debug: internal troubleshooting\ninfo: normal business event\nwarn: recoverable risk\nerror: failed user-visible operation`,
    "structured-logging-guide.html": `{"level":"error","event":"checkout_failed","correlationId":"req_123","service":"api","safeUserId":"u_42"}`,
    "application-health-check-guide.html": `GET /healthz\nGET /readyz\nGET /livez`,
    "uptime-monitoring-checklist.html": `check: https://formalint.com/\ninterval: 60s\nexpected_status: 200\nalert_after: 3 failures`,
    "error-budget-slo-guide.html": `SLO: 99.9% successful API requests over 30 days\nerror budget: 0.1% failed requests`,
    "cloudflare-dns-deployment-guide.html": `A @ 185.199.108.153\nCNAME www ensarkarayel.github.io\nSSL mode: Full`,
    "vercel-environment-variables-guide.html": `vercel env ls\nvercel env pull .env.local\nvercel --prod`,
    "static-site-deployment-checklist.html": `canonical URLs\nsitemap.xml\nrobots.txt\nads.txt\nHTTPS\nanalytics\ncache-busted assets`,
    "github-pages-custom-domain-guide.html": `A @ 185.199.108.153\nA @ 185.199.109.153\nA @ 185.199.110.153\nA @ 185.199.111.153\nCNAME www username.github.io`,
    "ssl-renewal-debugging-guide.html": `openssl s_client -connect formalint.com:443 -servername formalint.com\ncurl -I https://formalint.com/`,
    "cdn-cache-purge-guide.html": `asset.css?v=20260901-release\npurge: single URL first\nverify: curl -I`,
    "robots-txt-sitemap-launch-guide.html": `User-agent: *\nAllow: /\nSitemap: https://formalint.com/sitemap.xml`
  };
  return commands[file];
}

function workflowFor(mode) {
  const workflows = {
    security: [
      ["Inventory the boundary", "Name the browser, API, cookie, token, dependency or domain boundary that is affected."],
      ["Collect safe evidence", "Redact secrets before sharing headers, logs, payloads or dependency output."],
      ["Roll out gradually", "Prefer report-only, staged keys, feature flags or small blast-radius changes before enforcement."]
    ],
    delivery: [
      ["Read the failing run", "Capture job name, runner, commit SHA, environment, cache state and exact failing command."],
      ["Compare with local", "Prove whether the same command fails locally, in CI, in preview or only in production."],
      ["Release with rollback", "Keep rollback owner, smoke test result and monitoring link next to the deployment note."]
    ],
    observe: [
      ["Define the signal", "Decide whether the symptom should be visible in logs, metrics, traces, health checks or alerts."],
      ["Keep fields searchable", "Use stable event names, correlation IDs, service names and safe identifiers."],
      ["Tune for action", "Alerts should point to a user-visible problem, runbook or clear ownership path."]
    ],
    cloud: [
      ["Check DNS and HTTPS first", "Verify records, canonical host, certificate state and redirect behavior before application changes."],
      ["Separate build from edge", "Distinguish source build output from CDN cache, platform routing and browser cache."],
      ["Verify publicly", "Use a fresh URL, cache-busted asset or header check after deployment."]
    ]
  };
  return workflows[mode];
}

function relatedFor(mode) {
  const related = {
    security: ["http-security-headers-checklist.html", "cookie-samesite-debugging.html", "safe-online-dev-tools.html"],
    delivery: ["git-rebase-workflow-guide.html", "docker-compose-debugging-guide.html", "api-debugging-checklist.html"],
    observe: ["api-correlation-id-logging-guide.html", "linux-journalctl-guide.html", "nginx-access-log-analysis-guide.html"],
    cloud: ["dns-debugging-guide.html", "tls-certificate-debugging-guide.html", "github-pages-custom-domain-guide.html"]
  };
  return related[mode];
}

function mistakeFor(mode) {
  const mistakes = {
    security: "The common mistake is weakening a policy permanently to fix one symptom instead of collecting the violation and narrowing the exception.",
    delivery: "The common mistake is rerunning CI until it passes without preserving the command, runner and environment evidence.",
    observe: "The common mistake is logging more text without making the event searchable, safe and tied to ownership.",
    cloud: "The common mistake is changing app code before proving whether DNS, HTTPS, redirects or CDN cache is actually responsible."
  };
  return mistakes[mode];
}

function titleFromFile(file) {
  const page = pages.find((item) => item.file === file);
  if (page) return htmlEscape(page.h1.replace(" Guide", ""));
  return htmlEscape(file.replace(/\.html$/, "").split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "));
}

function generatePage(page) {
  const workflowRows = page.workflow.map(([step, detail]) => `<tr><td>${htmlEscape(step)}</td><td>${htmlEscape(detail)}</td></tr>`).join("");
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
      <p>${htmlEscape(page.summary)} This Formalint reference is designed for developers, DBAs, platform engineers and support teams who need an ordered troubleshooting path.</p>
      <p>The page keeps the work practical: collect evidence, avoid leaking secrets, make the smallest safe change and leave a note another engineer can repeat.</p>
      <h2>When to use it</h2>
      <ul><li>A deployment, policy, incident or integration behaves differently than expected.</li><li>You need a repeatable command or checklist before changing production behavior.</li><li>You want to keep the debugging note understandable for another engineer.</li></ul>
      <h2>Practical workflow</h2>
      <table class="workflow-table"><thead><tr><th>Step</th><th>What to verify</th></tr></thead><tbody>${workflowRows}</tbody></table>
      <h2>Command or evidence sample</h2>
      <div class="command-block"><button class="copy-code-button" type="button" data-copy-code>Copy</button><pre><code>${htmlEscape(page.command)}</code></pre></div>
      <h2>Review checklist</h2>
      <ol><li>Write down the affected host, endpoint, job, service or browser context.</li><li>Redact tokens, session cookies, passwords and customer identifiers.</li><li>Capture timestamps, headers, logs or command output before changing settings.</li><li>Prefer staged rollout, report-only mode, preview checks or single-URL cache purges where possible.</li><li>Link the final note to a related Formalint page so the next step is obvious.</li></ol>
      <h2>Common mistake</h2>
      <p>${htmlEscape(mistakeFor(page.mode))}</p>
      <p class="guide-callout">Formalint's rule for these areas is simple: make the hidden system boundary visible before you tune it.</p>
      <h2>Related Formalint references</h2>
      <p>Continue with ${relatedLinks}.</p>
      <h2>Frequently asked questions</h2>
      <div class="faq-list"><details><summary>Is this page enough for production approval?</summary><p>No. Use it as a diagnostic and review aid, then follow your team's release, security and compliance process.</p></details><details><summary>Can I paste real secrets or logs here?</summary><p>No. Keep secrets and customer data out of browser tools. Use redacted examples and preserve sensitive evidence only in approved internal systems.</p></details></div>
    </main>
    <footer class="site-footer"><div class="footer-signature" aria-label="Contact"><strong>&copy; 2026 Formalint</strong><span aria-hidden="true">-</span><span>Ensar Karayel</span><span aria-hidden="true">-</span><a href="mailto:karayelensar@gmail.com">karayelensar@gmail.com</a></div><nav aria-label="Footer navigation"><button class="footer-link" type="button" data-consent-open>Privacy Preferences</button><a href="about.html">About</a><a href="how-formalint-works.html">How It Works</a><a href="editorial-policy.html">Editorial Policy</a><a href="changelog.html">Changelog</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></nav></footer>
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

function updateCounters() {
  ["index.html", "tools.html"].forEach((name) => {
    const file = path.join(ROOT, name);
    let html = fs.readFileSync(file, "utf8");
    html = html.replace(/Search (100|120|124|150|175|200) Formalint tools and guides/g, `Search ${LIBRARY_COUNT} Formalint tools and guides`);
    html = html.replace(/Showing (100|120|124|150|175|200) resources/g, `Showing ${LIBRARY_COUNT} resources`);
    html = html.replace(/(100|120|124|150|175|200) public pages/g, `${LIBRARY_COUNT} public pages`);
    html = html.replace(/<strong>(100|120|124|150|175|200)<\/strong><span>Public HTML targets/g, `<strong>${LIBRARY_COUNT}</strong><span>Public HTML targets`);
    fs.writeFileSync(file, html, "utf8");
  });
}

function normalizeToolCard(markup) {
  return markup.trim().split("\n").map((line) => `          ${line.trim()}`).join("\n");
}

function sectionMarkup(id, eyebrow, h2, groupPages) {
  return `      <section class="directory-section" aria-labelledby="${id}" data-tools-section>
        <div class="section-heading">
          <p class="eyebrow">${eyebrow}</p>
          <h2 id="${id}">${h2}</h2>
        </div>
        <div class="directory-grid">
${groupPages.map((page) => normalizeToolCard(card(page))).join("\n")}
        </div>
      </section>

`;
}

function replaceManagedArea(html, startComment, endComment, content) {
  if (html.includes(startComment) && html.includes(endComment)) {
    const start = html.indexOf(startComment);
    const end = html.indexOf(endComment, start) + endComment.length;
    return html.slice(0, start) + startComment + "\n" + content + "      " + endComment + html.slice(end);
  }
  const marker = '      <section class="directory-section" aria-labelledby="advanced-reference-title" data-tools-section>';
  if (!html.includes(marker)) throw new Error("Advanced section marker not found in tools.html");
  return html.replace(marker, startComment + "\n" + content + "      " + endComment + "\n\n" + marker);
}

function updateToolsSections() {
  const file = path.join(ROOT, "tools.html");
  let html = fs.readFileSync(file, "utf8");
  const startComment = "      <!-- Formalint expanded domain sections start -->";
  const endComment = "<!-- Formalint expanded domain sections end -->";
  const sections = [
    sectionMarkup("security-compliance-title", "Security & compliance", "Policies, secrets, cookies and browser security", pages.filter((page) => page.mode === "security")),
    sectionMarkup("delivery-release-title", "CI/CD & release", "Builds, tests, releases and rollback evidence", pages.filter((page) => page.mode === "delivery")),
    sectionMarkup("observability-title", "Observability", "Logs, health checks, monitoring and reliability signals", pages.filter((page) => page.mode === "observe")),
    sectionMarkup("cloud-deployment-title", "Cloud deployment", "DNS, HTTPS, static hosting and CDN launch checks", pages.filter((page) => page.mode === "cloud"))
  ].join("");
  html = replaceManagedArea(html, startComment, endComment, sections);
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

function updateGuidesAndHome() {
  insertCardsBefore("guides.html", '          <a class="tool-card" href="complete-regex-guide.html">');
  insertCardsBefore("index.html", '          <a class="tool-card" href="complete-regex-guide.html"><span>Regex Toolkit</span>');
}

function updateToolsControls() {
  const file = path.join(ROOT, "tools.html");
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes('data-tools-topic="delivery"')) {
    html = html.replace(
      '          <button type="button" data-tools-topic="security" aria-pressed="false">Security</button>',
      '          <button type="button" data-tools-topic="security" aria-pressed="false">Security</button>\n          <button type="button" data-tools-topic="delivery" aria-pressed="false">CI/CD</button>\n          <button type="button" data-tools-topic="observe" aria-pressed="false">Observability</button>\n          <button type="button" data-tools-topic="cloud" aria-pressed="false">Cloud</button>'
    );
  }
  if (!html.includes('data-tools-query="github actions"')) {
    html = html.replace(
      '          <button type="button" data-tools-query="postgresql" data-tools-topic-jump="ops">postgresql</button>',
      '          <button type="button" data-tools-query="postgresql" data-tools-topic-jump="ops">postgresql</button>\n          <button type="button" data-tools-query="github actions" data-tools-topic-jump="delivery">github actions</button>\n          <button type="button" data-tools-query="csp" data-tools-topic-jump="security">csp</button>\n          <button type="button" data-tools-query="cloudflare" data-tools-topic-jump="cloud">cloudflare</button>\n          <button type="button" data-tools-query="logs" data-tools-topic-jump="observe">logs</button>'
    );
  }
  fs.writeFileSync(file, html, "utf8");
}

function updateShared() {
  const file = path.join(ROOT, "assets", "js", "shared.js");
  let js = fs.readFileSync(file, "utf8");
  const startComment = "    // Formalint expanded domain groups start";
  const endComment = "    // Formalint expanded domain groups end";
  const groupDefinitions = [
    ["Security & Compliance", "security", "Review browser security, secrets, cookies, API keys and dependency risk before release.", pages.filter((page) => page.mode === "security")],
    ["CI/CD & Release", "delivery", "Debug build pipelines, release checks, failing tests, secrets and rollback paths.", pages.filter((page) => page.mode === "delivery")],
    ["Observability", "observe", "Keep logs, health checks, uptime monitors and reliability signals actionable.", pages.filter((page) => page.mode === "observe")],
    ["Cloud Deployment", "cloud", "Prepare DNS, HTTPS, static hosting, platform environment variables and CDN cache changes.", pages.filter((page) => page.mode === "cloud")]
  ];
  const groups = groupDefinitions.map(([title, mode, description, groupPages]) => `    {
      title: "${title}",
      mode: "${mode}",
      description: "${description}",
      links: [
${groupPages.map((page) => `        { label: "${page.h1.replace(/"/g, '\\"').replace(" Guide", "")}", href: "${page.file}", icon: "${page.icon}", description: "${page.summary.replace(/"/g, '\\"')}", keywords: "${page.keywords}" }`).join(",\n")}
      ]
    }`).join(",\n");

  if (js.includes(startComment) && js.includes(endComment)) {
    const start = js.indexOf(startComment);
    const end = js.indexOf(endComment, start) + endComment.length;
    js = js.slice(0, start) + startComment + "\n" + groups + "\n" + endComment + js.slice(end);
  } else {
    const marker = '    {\n      title: "Hardware & Capacity",';
    if (!js.includes(marker)) throw new Error("Hardware group marker not found in shared.js");
    js = js.replace(marker, startComment + "\n" + groups + ",\n" + endComment + "\n" + marker);
  }
  fs.writeFileSync(file, js, "utf8");
}

function updateToolFilters() {
  const file = path.join(ROOT, "assets", "js", "tools-directory.js");
  let js = fs.readFileSync(file, "utf8");
  js = js.replace(/security: \[[^\]]+\]/, 'security: ["security", "injection", "jwt", "oauth", "password", "cookie", "samesite", "tls", "https", "headers", "csp", "hsts", "csrf", "secret", "redaction", "api key", "vulnerability", "dependency", "compliance", "privacy"]');
  if (!js.includes("delivery: [")) {
    js = js.replace(
      /security: \[[^\]]+\]/,
      'security: ["security", "injection", "jwt", "oauth", "password", "cookie", "samesite", "tls", "https", "headers", "csp", "hsts", "csrf", "secret", "redaction", "api key", "vulnerability", "dependency", "compliance", "privacy"],\n    delivery: ["ci", "cd", "github actions", "workflow", "runner", "secrets", "docker build", "cache", "tests", "flaky", "deployment", "release", "rollback"],\n    observe: ["observability", "logs", "log levels", "structured logging", "health check", "uptime", "monitoring", "slo", "error budget", "alert"],\n    cloud: ["cloud", "cloudflare", "vercel", "github pages", "static site", "custom domain", "dns", "ssl", "cdn", "cache purge", "robots", "sitemap"]'
    );
  }
  fs.writeFileSync(file, js, "utf8");
}

function updateChangelog() {
  const file = path.join(ROOT, "changelog.html");
  let html = fs.readFileSync(file, "utf8");
  const entry = `      <h2>September 1, 2026 - 200 Page Domain Expansion</h2>
      <p>Expanded Formalint to 200 public pages and opened four new content areas: Security &amp; Compliance, CI/CD &amp; Release, Observability and Cloud Deployment. Added practical pages for CSP, HSTS, CSRF, secrets, GitHub Actions, Docker builds, health checks, uptime monitoring, Cloudflare, GitHub Pages, SSL renewal, CDN cache and robots/sitemap launch checks.</p>
`;
  if (!html.includes("200 Page Domain Expansion")) {
    html = html.replace("      <h2>September 1, 2026 - 175 Page Reference Expansion</h2>", entry + "      <h2>September 1, 2026 - 175 Page Reference Expansion</h2>");
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
updateToolsSections();
updateToolsControls();
updateGuidesAndHome();
updateShared();
updateToolFilters();
updateChangelog();
updateSitemap();

console.log(`Formalint library expanded to ${fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).length} HTML pages.`);
