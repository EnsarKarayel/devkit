const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CACHE_VERSION = "20260908-library-212";
const LIBRARY_COUNT = 212;
const TODAY = "2026-09-08";
const HUMAN_DATE = "September 8, 2026";

const pages = [
  {
    file: "search-console-indexing-checklist.html",
    category: "SEO & Indexing",
    mode: "seo",
    icon: "GSC",
    h1: "Google Search Console Indexing Checklist",
    summary: "Review indexing status, submitted sitemaps, canonical signals, crawl errors and page quality before requesting another Google review.",
    keywords: "search console indexing checklist google indexing sitemap canonical",
    command: "site:formalint.com regex matcher\nsite:formalint.com xml linter\nsite:formalint.com email regex",
    useCases: ["A new page is published but not appearing in Search Console yet.", "Google shows impressions for a query but the page is not earning clicks.", "A sitemap was resubmitted and you need a repeatable verification checklist."],
    workflow: [["Confirm the canonical URL", "Open URL Inspection and compare the inspected URL, user-declared canonical and Google-selected canonical."], ["Check sitemap coverage", "Verify the URL exists in sitemap.xml with the correct HTTPS host and a current lastmod when the content changed."], ["Review page value", "Make sure the page answers one focused developer task with original examples, not thin repeated copy."], ["Request indexing carefully", "Use request indexing after a meaningful content update, not after cosmetic churn."]],
    mistake: "The common mistake is resubmitting the same weak page repeatedly instead of improving title intent, examples, internal links and page usefulness.",
    related: ["sitemap-lastmod-strategy-guide.html", "canonical-url-debugging-guide.html", "tools.html"]
  },
  {
    file: "sitemap-lastmod-strategy-guide.html",
    category: "SEO & Indexing",
    mode: "seo",
    icon: "MAP",
    h1: "Sitemap Lastmod Strategy Guide",
    summary: "Use sitemap lastmod dates honestly so crawlers can separate real content updates from unchanged static pages.",
    keywords: "sitemap lastmod strategy xml sitemap google search console",
    command: "<lastmod>2026-09-08</lastmod>\n<changefreq>monthly</changefreq>\n<priority>0.72</priority>",
    useCases: ["You added new Formalint pages and need Search Console to see them.", "A page changed substantially and should be recrawled.", "You want to avoid noisy sitemap updates that look artificial."],
    workflow: [["Update only real changes", "Treat new pages, rewritten sections, changed canonical targets and changed internal links as legitimate lastmod updates."], ["Keep one canonical host", "Use https://formalint.com/ consistently so the sitemap does not split signals across hosts."], ["Submit after publishing", "Wait for GitHub Pages deployment, then resubmit sitemap.xml in Search Console."], ["Watch discovered URLs", "Use Page indexing and performance query data to decide which cluster needs the next useful page."]],
    mistake: "The common mistake is changing every lastmod every day without changing the pages. That can reduce trust in the signal.",
    related: ["search-console-indexing-checklist.html", "robots-meta-debugging-guide.html", "github-pages-deployment-log-guide.html"]
  },
  {
    file: "canonical-url-debugging-guide.html",
    category: "SEO & Indexing",
    mode: "seo",
    icon: "CAN",
    h1: "Canonical URL Debugging Guide",
    summary: "Debug canonical tags, duplicate URLs, index.html variants, trailing slash behavior and Search Console canonical mismatches.",
    keywords: "canonical url debugging google selected canonical duplicate urls",
    command: "<link rel=\"canonical\" href=\"https://formalint.com/regex-matcher.html\">",
    useCases: ["A page appears as Duplicate without user-selected canonical.", "formalint.com/index.html and formalint.com/ compete for the same content.", "A tool page is indexed under an older or redirected URL."],
    workflow: [["Pick the public URL", "Choose one HTTPS URL for each page and use it in canonical tags, sitemap entries and internal links."], ["Avoid mixed variants", "Do not link to both slash and index.html versions when one should represent the page."], ["Inspect duplicates", "Use Search Console URL Inspection for both the preferred and duplicate variants."], ["Fix internal links", "Canonical tags help, but consistent internal links make the signal much clearer."]],
    mistake: "The common mistake is adding a canonical tag but continuing to link to the duplicate version throughout the site.",
    related: ["search-console-indexing-checklist.html", "sitemap-lastmod-strategy-guide.html", "static-site-deployment-checklist.html"]
  },
  {
    file: "robots-meta-debugging-guide.html",
    category: "SEO & Indexing",
    mode: "seo",
    icon: "BOT",
    h1: "Robots Meta Tag Debugging Guide",
    summary: "Check robots meta tags, robots.txt rules and crawl directives before assuming Google ignored a new developer page.",
    keywords: "robots meta debugging noindex robots txt indexing",
    command: "<meta name=\"robots\" content=\"index, follow, max-image-preview:large\">",
    useCases: ["A page is live but excluded by noindex.", "A static site moved from private testing to public launch.", "A crawler can reach assets but not page HTML."],
    workflow: [["Read the page source", "Confirm the final deployed HTML has index, follow or no robots meta tag blocking indexing."], ["Check robots.txt", "Confirm robots.txt allows the page path and points to the sitemap."], ["Look for templates", "If one template is wrong, many generated pages may inherit the same directive."], ["Retest after deploy", "Use URL Inspection only after the public page is updated."]],
    mistake: "The common mistake is checking local files while Google sees an older deployed page or a different host.",
    related: ["robots-txt-sitemap-launch-guide.html", "ads-txt-debugging-guide.html", "search-console-indexing-checklist.html"]
  },
  {
    file: "ads-txt-debugging-guide.html",
    category: "SEO & Indexing",
    mode: "seo",
    icon: "ADS",
    h1: "ads.txt Debugging Guide",
    summary: "Verify ads.txt placement, publisher ID, HTTPS access, redirects and cache state before an AdSense site review.",
    keywords: "ads txt debugging adsense publisher id github pages",
    command: "google.com, pub-6534346834787678, DIRECT, f08c47fec0942fa0",
    useCases: ["AdSense says the site is not ready or cannot verify ads.txt yet.", "A custom domain was connected to GitHub Pages.", "You changed DNS and need to prove the public ads.txt response."],
    workflow: [["Open the root file", "ads.txt must be available at https://formalint.com/ads.txt, not only inside a subfolder."], ["Match the publisher ID", "Compare the pub ID in AdSense with the exact ads.txt line."], ["Avoid broken redirects", "HTTP should redirect to HTTPS and the final response should be 200."], ["Allow cache time", "After a fix, give crawlers time to fetch the new file before requesting another review."]],
    mistake: "The common mistake is fixing ads.txt while the real AdSense rejection is still low-value content or weak page quality.",
    related: ["how-formalint-works.html", "sitemap-lastmod-strategy-guide.html", "search-console-indexing-checklist.html"]
  },
  {
    file: "github-pages-deployment-log-guide.html",
    category: "SEO & Indexing",
    mode: "seo",
    icon: "GH",
    h1: "GitHub Pages Deployment Log Guide",
    summary: "Use GitHub Pages deployment evidence to verify what Google and users can actually reach after a static-site update.",
    keywords: "github pages deployment log guide static site deploy google pages",
    command: "git log -1 --oneline\ngit status --short --branch\ncurl -I https://formalint.com/sitemap.xml",
    useCases: ["The repository changed but the live site still shows an older version.", "Search Console was updated before GitHub Pages finished deploying.", "A custom domain and HTTPS setting recently changed."],
    workflow: [["Confirm the commit", "Write down the commit hash that contains the content update."], ["Check Pages status", "Wait for the Pages deployment to finish before submitting URLs."], ["Verify public headers", "Use the live domain to check response code, cache and content type."], ["Record the update", "Add a changelog note so the site shows a visible maintenance history."]],
    mistake: "The common mistake is treating a local preview as proof that Google can see the production page.",
    related: ["github-pages-custom-domain-guide.html", "static-site-deployment-checklist.html", "sitemap-lastmod-strategy-guide.html"]
  },
  {
    file: "browser-console-debugging-guide.html",
    category: "Browser Debugging",
    mode: "browser",
    icon: "CON",
    h1: "Browser Console Debugging Guide",
    summary: "Use the browser console to capture JavaScript errors, CSP messages, failed resources and runtime context without guessing.",
    keywords: "browser console debugging javascript error devtools csp",
    command: "console.table({ page: location.href, userAgent: navigator.userAgent, time: new Date().toISOString() })",
    useCases: ["A button does nothing in production.", "A script works locally but fails after deployment.", "A CSP, CORS or missing-file message appears only in the browser."],
    workflow: [["Preserve the first error", "Reload the page with the console open and capture the first red error before clicking around."], ["Separate warnings", "Warnings can matter, but fix blocking exceptions and failed resources first."], ["Check the source link", "Open the linked file and line number, then compare it with the deployed commit."], ["Write a reproducible note", "Include browser, URL, timestamp, action and exact error message."]],
    mistake: "The common mistake is screenshotting the last error while the first error already explains why everything after it failed.",
    related: ["javascript-error-stack-trace-guide.html", "csp-debugging-guide.html", "network-tab-debugging-guide.html"]
  },
  {
    file: "network-tab-debugging-guide.html",
    category: "Browser Debugging",
    mode: "browser",
    icon: "NET",
    h1: "DevTools Network Tab Debugging Guide",
    summary: "Read request URLs, status codes, response headers, payloads and cache behavior from the browser Network tab.",
    keywords: "devtools network tab debugging request headers cache status code",
    command: "Preserve log: on\nDisable cache: on\nFilter: fetch/xhr, document, script, css",
    useCases: ["An API call fails but the page only shows a generic message.", "A CSS or JavaScript file is stale after deploy.", "A redirect, CORS rule or cache header changes browser behavior."],
    workflow: [["Preserve the log", "Keep requests visible across redirects and reloads when debugging login, checkout or tool output."], ["Filter by resource type", "Start with document, fetch/xhr, script and css before opening every image or font request."], ["Read status and headers", "Status code, content type, cache-control and CORS headers usually explain the browser symptom."], ["Compare working and failing requests", "Copy the two request summaries side by side before editing code."]],
    mistake: "The common mistake is changing JavaScript while the failing request is actually a redirect, cache or header problem.",
    related: ["http-status-codes.html", "http-headers-reference.html", "curl-headers-debugging-guide.html"]
  },
  {
    file: "source-map-debugging-guide.html",
    category: "Browser Debugging",
    mode: "browser",
    icon: "MAP",
    h1: "Source Map Debugging Guide",
    summary: "Use source maps to connect minified production JavaScript errors back to readable files, functions and release commits.",
    keywords: "source map debugging minified javascript production error",
    command: "// production bundle footer\n//# sourceMappingURL=app.js.map",
    useCases: ["A production error points to app.min.js:1:12893.", "A monitoring tool reports a stack trace from a minified bundle.", "A release needs readable debugging without exposing sensitive source context."],
    workflow: [["Confirm maps exist", "Check whether the deployed bundle references a map file and whether the browser can fetch it."], ["Match the release", "The map must belong to the same build hash as the minified file."], ["Protect sensitive code", "Decide whether maps should be public, private to monitoring or omitted for a specific project."], ["Map the stack", "Use the mapped source, line and column to find the real failing function."]],
    mistake: "The common mistake is uploading a new source map for an old bundle and trusting the resulting stack trace.",
    related: ["javascript-error-stack-trace-guide.html", "github-pages-deployment-log-guide.html", "browser-console-debugging-guide.html"]
  },
  {
    file: "core-web-vitals-debugging-guide.html",
    category: "Browser Debugging",
    mode: "browser",
    icon: "CWV",
    h1: "Core Web Vitals Debugging Guide",
    summary: "Debug LCP, CLS, INP and page responsiveness with browser evidence instead of guessing from a single score.",
    keywords: "core web vitals debugging lcp cls inp lighthouse",
    command: "LCP: largest visible content\nCLS: layout shifts\nINP: interaction responsiveness",
    useCases: ["Search Console reports poor page experience.", "A static tool page feels slow even though assets are small.", "Ads, fonts, scripts or layout shifts affect perceived speed."],
    workflow: [["Identify the metric", "Treat LCP, CLS and INP as separate problems with different evidence."], ["Test the real template", "Measure the same page type that users reach from search."], ["Reserve stable space", "Prevent layout shifts by giving editors, cards, ads and images predictable dimensions."], ["Reduce main-thread work", "Keep parsing, highlighting and large examples from blocking input responsiveness."]],
    mistake: "The common mistake is optimizing a homepage score while the search traffic lands on a tool or reference page.",
    related: ["lighthouse-audit-checklist.html", "network-tab-debugging-guide.html", "static-site-deployment-checklist.html"]
  },
  {
    file: "lighthouse-audit-checklist.html",
    category: "Browser Debugging",
    mode: "browser",
    icon: "LHS",
    h1: "Lighthouse Audit Checklist",
    summary: "Turn a Lighthouse report into practical fixes for performance, accessibility, SEO, best practices and static-site quality.",
    keywords: "lighthouse audit checklist performance seo accessibility devtools",
    command: "Chrome DevTools > Lighthouse > Navigation > Desktop and Mobile",
    useCases: ["A page has impressions but weak click-through or poor experience metrics.", "A newly published guide needs a final quality pass.", "A developer wants quick checks before Search Console resubmission."],
    workflow: [["Run mobile and desktop", "A page can pass one profile and still fail the other because layout and main-thread cost differ."], ["Fix blocking items first", "Prioritize crawlability, title, meta description, contrast, broken links and severe performance bottlenecks."], ["Retest one URL", "Measure the changed page before applying the same template fix everywhere."], ["Document the fix", "Add the update to the changelog when it meaningfully changes the public site."]],
    mistake: "The common mistake is chasing a perfect score while ignoring whether the page answers the searcher's intent.",
    related: ["core-web-vitals-debugging-guide.html", "search-console-indexing-checklist.html", "browser-console-debugging-guide.html"]
  },
  {
    file: "javascript-error-stack-trace-guide.html",
    category: "Browser Debugging",
    mode: "browser",
    icon: "ERR",
    h1: "JavaScript Error Stack Trace Guide",
    summary: "Read JavaScript stack traces by message, call order, async boundary, source file and release context.",
    keywords: "javascript error stack trace debugging browser console",
    command: "TypeError: Cannot read properties of undefined\n    at renderResult (app.js:42:13)\n    at HTMLButtonElement.handleClick (app.js:77:5)",
    useCases: ["A browser console error points at code but the real cause is earlier data shape.", "An async API failure appears as a frontend exception.", "A minified production stack needs to be connected to source maps."],
    workflow: [["Read the message first", "The error type and message usually explain the failed assumption."], ["Follow the call order", "Start at the top application frame, then inspect the caller that passed bad data."], ["Find async boundaries", "Promises, event handlers and timers can hide where the original bad state entered."], ["Connect to release", "Use source maps and deployment logs to ensure you are debugging the right version."]],
    mistake: "The common mistake is editing the line where the exception appears instead of fixing the invalid data that reached it.",
    related: ["source-map-debugging-guide.html", "browser-console-debugging-guide.html", "api-debugging-checklist.html"]
  }
];

function htmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function titleFromFile(file) {
  const page = pages.find((item) => item.file === file);
  if (page) {
    return page.h1.replace(" Guide", "").replace(" Checklist", "");
  }

  return file
    .replace(/\.html$/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function pageCard(page) {
  return `<a class="tool-card" href="${page.file}"><span>${htmlEscape(page.h1.replace(" Guide", "").replace(" Checklist", ""))}</span><small>${htmlEscape(page.summary)}</small></a>`;
}

function generatePage(page) {
  const workflowRows = page.workflow
    .map(([step, detail]) => `<tr><td>${htmlEscape(step)}</td><td>${htmlEscape(detail)}</td></tr>`)
    .join("");
  const useCases = page.useCases.map((item) => `<li>${htmlEscape(item)}</li>`).join("");
  const relatedLinks = page.related
    .map((href) => `<a href="${href}">${htmlEscape(titleFromFile(href))}</a>`)
    .join(", ");
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
    <title>${htmlEscape(page.h1)} | Formalint</title>
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
      <p class="guide-meta">${htmlEscape(page.summary)} Last updated ${HUMAN_DATE}.</p>
      <p>${htmlEscape(page.summary)} This reference is written as a practical operating note for developers, DBAs and platform teams who need to make the next troubleshooting step visible.</p>
      <p>Use it with the live Formalint tools, then keep the final finding in a ticket, release note or runbook so the next person can repeat the same checks.</p>
      <h2>Good fit for</h2>
      <ul>${useCases}</ul>
      <h2>Practical workflow</h2>
      <table class="workflow-table"><thead><tr><th>Step</th><th>What to verify</th></tr></thead><tbody>${workflowRows}</tbody></table>
      <h2>Command or evidence sample</h2>
      <div class="command-block"><button class="copy-code-button" type="button" data-copy-code>Copy</button><pre><code>${htmlEscape(page.command)}</code></pre></div>
      <h2>Quality checklist</h2>
      <ol><li>Confirm the public URL, browser, terminal, deployment or Search Console context.</li><li>Capture the first useful error, header, status, sitemap entry or metric before editing.</li><li>Keep secrets, tokens, cookies and private user data out of copied examples.</li><li>Make one meaningful fix, publish it, then verify the live page rather than the local preview.</li><li>Link the page to related Formalint references so visitors and crawlers can understand the topic cluster.</li></ol>
      <h2>Common mistake</h2>
      <p>${htmlEscape(page.mistake)}</p>
      <p class="guide-callout">Formalint's rule for this topic: improve the page because it helps a real developer, then let Search Console observe the improvement naturally.</p>
      <h2>Related Formalint references</h2>
      <p>Continue with ${relatedLinks}.</p>
      <h2>Frequently asked questions</h2>
      <div class="faq-list"><details><summary>Should this be checked after every release?</summary><p>Check it whenever the related page, deployment path, crawler signal, browser behavior or user-facing workflow changes in a meaningful way.</p></details><details><summary>Can I use sensitive production data in examples?</summary><p>No. Redact secrets and personal data before copying commands, URLs, payloads, logs or screenshots into a public tool or support note.</p></details></div>
    </main>
    <footer class="site-footer"><div class="footer-signature" aria-label="Contact"><strong>&copy; 2026 Formalint</strong><span aria-hidden="true">-</span><span>Ensar Karayel</span><span aria-hidden="true">-</span><a href="mailto:karayelensar@gmail.com">karayelensar@gmail.com</a></div><nav aria-label="Footer navigation"><button class="footer-link" type="button" data-consent-open>Privacy Preferences</button><a href="about.html">About</a><a href="how-formalint-works.html">How It Works</a><a href="editorial-policy.html">Editorial Policy</a><a href="changelog.html">Changelog</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></nav></footer>
    <script src="assets/js/shared.js"></script>
  </body>
</html>
`;
}

function replaceCacheVersions() {
  fs.readdirSync(ROOT)
    .filter((name) => name.endsWith(".html"))
    .forEach((name) => {
      const file = path.join(ROOT, name);
      const html = fs.readFileSync(file, "utf8").replace(/styles\.css\?v=[0-9a-z-]+/g, `styles.css?v=${CACHE_VERSION}`);
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

function normalizeToolCard(markup) {
  return markup
    .trim()
    .split("\n")
    .map((line) => `          ${line.trim()}`)
    .join("\n");
}

function sectionMarkup(id, eyebrow, h2, groupPages) {
  return `      <section class="directory-section" aria-labelledby="${id}" data-tools-section>
        <div class="section-heading">
          <p class="eyebrow">${eyebrow}</p>
          <h2 id="${id}">${h2}</h2>
        </div>
        <div class="directory-grid">
${groupPages.map((page) => normalizeToolCard(pageCard(page))).join("\n")}
        </div>
      </section>

`;
}

function replaceOrInsertManagedBlock(source, startComment, endComment, content, marker, markerAfter = false) {
  if (source.includes(startComment) && source.includes(endComment)) {
    const start = source.indexOf(startComment);
    const end = source.indexOf(endComment, start) + endComment.length;
    return source.slice(0, start) + startComment + "\n" + content + endComment + source.slice(end);
  }

  if (!source.includes(marker)) {
    throw new Error(`Marker not found: ${marker}`);
  }

  if (markerAfter) {
    return source.replace(marker, marker + "\n" + startComment + "\n" + content + endComment);
  }

  return source.replace(marker, startComment + "\n" + content + endComment + "\n\n" + marker);
}

function updateToolsPage() {
  const file = path.join(ROOT, "tools.html");
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes('data-tools-topic="seo"')) {
    html = html.replace('          <button type="button" data-tools-topic="cloud" aria-pressed="false">Cloud</button>', '          <button type="button" data-tools-topic="cloud" aria-pressed="false">Cloud</button>\n          <button type="button" data-tools-topic="seo" aria-pressed="false">SEO</button>\n          <button type="button" data-tools-topic="browser" aria-pressed="false">Browser</button>');
  }
  if (!html.includes('data-tools-query="search console"')) {
    html = html.replace('          <button type="button" data-tools-query="logs" data-tools-topic-jump="observe">logs</button>', '          <button type="button" data-tools-query="logs" data-tools-topic-jump="observe">logs</button>\n          <button type="button" data-tools-query="search console" data-tools-topic-jump="seo">search console</button>\n          <button type="button" data-tools-query="sitemap" data-tools-topic-jump="seo">sitemap</button>\n          <button type="button" data-tools-query="lighthouse" data-tools-topic-jump="browser">lighthouse</button>\n          <button type="button" data-tools-query="devtools" data-tools-topic-jump="browser">devtools</button>');
  }

  const sections = [
    sectionMarkup("seo-indexing-title", "SEO & indexing", "Search Console, sitemap, canonical and AdSense readiness checks", pages.filter((page) => page.mode === "seo")),
    sectionMarkup("browser-debugging-title", "Browser debugging", "DevTools, network, Lighthouse and JavaScript evidence", pages.filter((page) => page.mode === "browser"))
  ].join("");
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint living index sections start -->",
    "      <!-- Formalint living index sections end -->",
    sections,
    "      <!-- Formalint expanded domain sections start -->"
  );

  fs.writeFileSync(file, html, "utf8");
}

function insertCardsBefore(fileName, marker) {
  const file = path.join(ROOT, fileName);
  let html = fs.readFileSync(file, "utf8");
  const missing = pages.filter((page) => !html.includes(`href="${page.file}"`));
  if (!missing.length) {
    return;
  }
  if (!html.includes(marker)) {
    throw new Error(`Marker not found in ${fileName}`);
  }
  html = html.replace(marker, missing.map(pageCard).join("\n          ") + "\n          " + marker);
  fs.writeFileSync(file, html, "utf8");
}

function updateHomeAndGuides() {
  insertCardsBefore("guides.html", '          <a class="tool-card" href="complete-regex-guide.html">');
  insertCardsBefore("index.html", '          <a class="tool-card" href="complete-regex-guide.html"><span>Regex Toolkit</span>');
}

function updateSharedSidebar() {
  const file = path.join(ROOT, "assets", "js", "shared.js");
  let js = fs.readFileSync(file, "utf8");
  const groups = [
    {
      title: "SEO & Indexing",
      mode: "seo",
      description: "Use Search Console, sitemap, canonical, robots and ads.txt evidence to keep public pages crawlable.",
      links: pages.filter((page) => page.mode === "seo")
    },
    {
      title: "Browser Debugging",
      mode: "browser",
      description: "Capture console, network, source map, Lighthouse and JavaScript error evidence from the browser.",
      links: pages.filter((page) => page.mode === "browser")
    }
  ];
  const content = groups
    .map((group) => `    {
      title: "${group.title}",
      mode: "${group.mode}",
      description: "${group.description}",
      links: [
${group.links.map((page) => `        { label: "${page.h1.replace(/"/g, '\\"').replace(" Guide", "").replace(" Checklist", "")}", href: "${page.file}", icon: "${page.icon}", description: "${page.summary.replace(/"/g, '\\"')}", keywords: "${page.keywords}" }`).join(",\n")}
      ]
    }`)
    .join(",\n") + ",\n";

  js = replaceOrInsertManagedBlock(
    js,
    "    // Formalint living index groups start",
    "    // Formalint living index groups end",
    content,
    "    // Formalint expanded domain groups start"
  );
  fs.writeFileSync(file, js, "utf8");
}

function updateToolMatchers() {
  const file = path.join(ROOT, "assets", "js", "tools-directory.js");
  let js = fs.readFileSync(file, "utf8");
  if (!js.includes("seo: [")) {
    js = js.replace(
      '    cloud: ["cloud", "cloudflare", "vercel", "github pages", "static site", "custom domain", "dns", "ssl", "cdn", "cache purge", "robots", "sitemap"]',
      '    cloud: ["cloud", "cloudflare", "vercel", "github pages", "static site", "custom domain", "dns", "ssl", "cdn", "cache purge", "robots", "sitemap"],\n    seo: ["seo", "search console", "indexing", "sitemap", "lastmod", "canonical", "robots", "ads.txt", "adsense", "github pages", "deployment"],\n    browser: ["browser", "devtools", "console", "network tab", "source map", "core web vitals", "lighthouse", "javascript error", "stack trace"]'
    );
  }
  fs.writeFileSync(file, js, "utf8");
}

function updateChangelog() {
  const file = path.join(ROOT, "changelog.html");
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes("212 Page Living Index Update")) {
    const entry = `      <h2>September 8, 2026 - 212 Page Living Index Update</h2>
      <p>Expanded Formalint to 212 public pages with SEO &amp; Indexing and Browser Debugging reference clusters. Added Search Console, sitemap lastmod, canonical, robots meta, ads.txt, GitHub Pages deployment, browser console, Network tab, source map, Core Web Vitals, Lighthouse and JavaScript stack trace guides. Updated tools discovery, sidebar navigation, sitemap lastmod values and cache-busted assets for this maintained release.</p>
`;
    html = html.replace("      <h2>September 1, 2026 - 200 Page Domain Expansion</h2>", entry + "      <h2>September 1, 2026 - 200 Page Domain Expansion</h2>");
    fs.writeFileSync(file, html, "utf8");
  }
}

function updateSitemap() {
  const htmlFiles = fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).sort((a, b) => a.localeCompare(b));
  const newPageFiles = new Set(pages.map((page) => page.file));
  const body = htmlFiles.map((name) => {
    const loc = name === "index.html" ? "https://formalint.com/" : `https://formalint.com/${name}`;
    const priority = name === "index.html" ? "1.0" : newPageFiles.has(name) ? "0.74" : "0.7";
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

pages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), generatePage(page), "utf8"));
replaceCacheVersions();
updateCounters();
updateToolsPage();
updateHomeAndGuides();
updateSharedSidebar();
updateToolMatchers();
updateChangelog();
updateSitemap();

console.log(`Formalint library expanded to ${fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).length} HTML pages.`);
