const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CACHE_VERSION = "20260915-lint-cleanup";
const LIBRARY_COUNT = 236;
const TODAY = "2026-09-15";
const HUMAN_DATE = "September 15, 2026";

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

const emailValidationPages = [
  {
    file: "email-regex-cheatsheet.html",
    category: "Email Validation",
    mode: "regex",
    icon: "@",
    h1: "Email Regex Cheatsheet",
    summary: "Compare practical email regex patterns, test cases and validation limits before using a pattern in forms, APIs or imports.",
    keywords: "email regex cheatsheet email validation regex examples",
    command: "Basic pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/\nUse for: quick client hints\nDo not use for: final deliverability proof",
    workflow: [["Start permissive", "Reject obvious mistakes while keeping valid real-world addresses such as plus tags and subdomains."], ["Test edge cases", "Check empty strings, missing domains, double at signs, whitespace and long addresses."], ["Separate syntax from delivery", "A regex can check shape, but it cannot prove that a mailbox exists."], ["Mirror server logic", "Client and server validation should disagree as little as possible."]],
    checks: ["Accept plus addressing such as name+tag@example.com.", "Reject spaces and missing domain dots.", "Keep the pattern readable enough for code review.", "Document whether internationalized domains are supported."],
    mistakes: ["Using a pattern so strict that valid addresses are rejected.", "Treating regex success as proof of deliverability.", "Running a catastrophic backtracking pattern on untrusted bulk input."],
    related: ["regex-email-validator.html", "email-regex-javascript-guide.html", "email-regex-test-cases.html"]
  },
  {
    file: "email-regex-test-cases.html",
    category: "Email Validation",
    mode: "regex",
    icon: "TST",
    h1: "Email Regex Test Cases",
    summary: "Use a focused list of valid and invalid email samples to review regex behavior before shipping a form or API validator.",
    keywords: "email regex test cases valid invalid email examples",
    command: "valid: dev@example.com, name+tag@example.co.uk\ninvalid: dev@, @example.com, dev example.com, dev@@example.com",
    workflow: [["Build a tiny matrix", "Keep a table of accepted, rejected and intentionally unsupported addresses."], ["Run the same samples everywhere", "Browser, API, import jobs and tests should use the same fixtures."], ["Add regression cases", "Every production validation bug should become one new sample."], ["Keep private data out", "Use synthetic examples instead of real user addresses."]],
    checks: ["Include uppercase, plus tags, subdomains and long but reasonable domains.", "Include common typing mistakes and copy-paste whitespace.", "Record intentional product limits so support can explain them.", "Use automated tests rather than manual form clicks only."],
    mistakes: ["Only testing happy-path addresses.", "Copying real customer emails into docs or public examples.", "Changing the regex without updating fixtures."],
    related: ["email-regex-cheatsheet.html", "developer-data-validation-guide.html", "regex-examples.html"]
  },
  {
    file: "email-validation-javascript-guide.html",
    category: "Email Validation",
    mode: "javascript",
    icon: "JS",
    h1: "Email Validation in JavaScript",
    summary: "Validate email input in JavaScript with clear client-side hints, safe trimming and server-side verification boundaries.",
    keywords: "email validation javascript regex guide form validation",
    command: "const email = input.value.trim();\nconst looksLikeEmail = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);",
    workflow: [["Trim before checking", "Whitespace around a copied address should not become a mysterious form failure."], ["Show helpful errors", "Tell the user what is missing without exposing internal rules."], ["Keep the server authoritative", "Browser validation improves UX, but server validation protects data quality."], ["Measure failures", "Unexpected validation drop-offs can reveal a bad pattern."]],
    checks: ["Use input type email as a hint, not the only rule.", "Avoid blocking paste, plus tags or normal subdomains.", "Keep validation messages short and specific.", "Store normalized values consistently."],
    mistakes: ["Depending only on HTML5 validation for API data.", "Mutating the user's address silently.", "Logging full email addresses in analytics events."],
    related: ["email-regex-cheatsheet.html", "javascript-regex-cheatsheet.html", "regex-email-validator.html"]
  },
  {
    file: "email-validation-typescript-guide.html",
    category: "Email Validation",
    mode: "javascript",
    icon: "TS",
    h1: "Email Validation in TypeScript",
    summary: "Model email validation in TypeScript with typed results, reusable helpers and safe error messages for frontend and API code.",
    keywords: "email validation typescript regex typed validator",
    command: "type EmailCheck = { ok: true; value: string } | { ok: false; reason: string };",
    workflow: [["Return structured results", "Avoid boolean-only helpers when the UI needs a reason."], ["Share fixtures", "Use the same test cases in frontend packages and API tests."], ["Keep types honest", "A string branded as email still needs runtime validation at boundaries."], ["Document normalization", "Lowercasing domains is different from changing the local part."]],
    checks: ["Separate parsing, normalization and business rules.", "Use narrow error reasons such as empty, missing-at or invalid-domain.", "Keep regex constants named and reviewed.", "Use tests for both accepted and rejected samples."],
    mistakes: ["Assuming TypeScript types validate runtime input.", "Branding an email before boundary checks finish.", "Throwing generic errors that the UI cannot translate."],
    related: ["email-validation-javascript-guide.html", "email-regex-test-cases.html", "javascript-regex-match-vs-test.html"]
  },
  {
    file: "email-regex-php-validation-guide.html",
    category: "Email Validation",
    mode: "php",
    icon: "PHP",
    h1: "Email Validation in PHP",
    summary: "Validate email addresses in PHP with filter_var, regex fallback rules and safe handling for forms, imports and logs.",
    keywords: "email validation php regex filter_var guide",
    command: "$email = trim($_POST['email'] ?? '');\n$isValid = filter_var($email, FILTER_VALIDATE_EMAIL) !== false;",
    workflow: [["Prefer built-ins first", "PHP's email filter is a safer baseline than a copied pattern for most apps."], ["Add product rules after syntax", "Blocked domains, disposable checks and uniqueness belong in separate steps."], ["Redact logs", "Validation failures can be counted without storing every submitted address."], ["Test imports separately", "Bulk CSV input needs memory, encoding and duplicate handling too."]],
    checks: ["Trim input before validation.", "Keep database uniqueness rules case-aware and documented.", "Return user-safe messages instead of regex internals.", "Do not send verification email until syntax and rate limits pass."],
    mistakes: ["Using a complex regex when filter_var is enough.", "Logging raw POST bodies on validation failure.", "Mixing disposable-domain policy with syntax checks."],
    related: ["email-regex-php-guide.html", "php-runtime-guide.html", "csv-utf8-encoding-guide.html"]
  },
  {
    file: "email-validation-python-guide.html",
    category: "Email Validation",
    mode: "python",
    icon: "PY",
    h1: "Email Validation in Python",
    summary: "Validate email input in Python services with simple syntax checks, normalization notes and batch import safeguards.",
    keywords: "email validation python regex guide data import",
    command: "import re\npattern = re.compile(r\"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$\")\nok = bool(pattern.match(email.strip()))",
    workflow: [["Validate at boundaries", "Check API input, CSV rows and admin forms before data reaches deeper workflows."], ["Keep fixtures in tests", "Use shared valid and invalid samples across services."], ["Normalize deliberately", "Trim whitespace, but avoid changing local-part semantics without a clear rule."], ["Report row-level errors", "Bulk imports should tell the operator which rows failed and why."]],
    checks: ["Compile reused regex patterns.", "Cap input length before expensive checks.", "Separate syntax errors from duplicate-account errors.", "Use synthetic addresses in test logs."],
    mistakes: ["Accepting whitespace because only the database constraint caught it.", "Letting one invalid CSV row fail the whole import without a report.", "Treating regex as mailbox verification."],
    related: ["email-regex-python-guide.html", "python-runtime-guide.html", "csv-to-json.html"]
  },
  {
    file: "email-domain-dns-validation-guide.html",
    category: "Email Validation",
    mode: "network",
    icon: "DNS",
    h1: "Email Domain DNS Validation Guide",
    summary: "Check email domains with DNS-aware validation boundaries, MX expectations and safe fallback behavior for signup flows.",
    keywords: "email domain dns validation mx records guide",
    command: "Syntax valid -> domain present -> optional MX lookup -> verification email",
    workflow: [["Do syntax first", "Avoid DNS lookups for obviously invalid strings."], ["Treat DNS as signal", "A temporary DNS failure should not always become a permanent user rejection."], ["Queue verification", "Email confirmation proves more than a regex or MX lookup alone."], ["Rate limit checks", "DNS validation at scale can become slow or noisy without caching."]],
    checks: ["Document whether MX, A or AAAA fallback is allowed.", "Cache domain lookup results for a short, safe window.", "Handle DNS timeouts gracefully.", "Keep domain checks separate from personal data logging."],
    mistakes: ["Blocking users during transient DNS outages.", "Running live DNS checks on every keypress.", "Calling MX presence proof that a specific mailbox exists."],
    related: ["dns-debugging-guide.html", "email-regex-cheatsheet.html", "api-timeout-debugging-guide.html"]
  },
  {
    file: "disposable-email-detection-guide.html",
    category: "Email Validation",
    mode: "security",
    icon: "MAIL",
    h1: "Disposable Email Detection Guide",
    summary: "Plan disposable email checks as a product policy layer instead of confusing them with basic email regex validation.",
    keywords: "disposable email detection guide validation security",
    command: "email syntax -> normalize domain -> policy list check -> verification -> risk review",
    workflow: [["Separate policy from syntax", "Disposable-domain blocking is a business rule, not an email format rule."], ["Use reviewable lists", "Domain deny lists need source, date and a rollback path."], ["Avoid silent rejection", "Tell legitimate users what changed and how to contact support."], ["Watch false positives", "Shared domains, aliases and privacy services can be legitimate."]],
    checks: ["Keep allowlist overrides for trusted partners.", "Version domain lists so support can explain decisions.", "Do not expose internal risk scores to the browser.", "Review conversion impact after policy changes."],
    mistakes: ["Blocking whole providers without measuring legitimate usage.", "Mixing anti-abuse logic into a reusable regex helper.", "Using copied domain lists with no maintenance owner."],
    related: ["email-domain-dns-validation-guide.html", "secure-cookie-checklist.html", "secrets-redaction-checklist.html"]
  }
];

const lintCleanupPages = [
  {
    file: "xml-lint-error-guide.html",
    category: "Lint and Cleanup",
    mode: "formatter",
    icon: "XML",
    h1: "XML Lint Error Guide",
    summary: "Decode common XML lint errors, line-column messages, malformed tags, escaping mistakes and namespace problems before fixing production payloads.",
    keywords: "xml lint error guide xmllint xml linter malformed xml",
    command: "xmllint --noout payload.xml\n# Check the first reported line, then validate again after each fix.",
    workflow: [["Read the first error first", "Later XML errors are often side effects of one missing bracket, quote or closing tag."], ["Check escaping", "Raw ampersands and angle brackets inside text nodes are common payload failures."], ["Verify namespaces", "A valid-looking tag can fail when the namespace declaration is missing or mismatched."], ["Retest after each fix", "One small XML repair can change the next reported line number."]],
    checks: ["Confirm every opening tag has the intended closing tag.", "Escape text values before pasting examples into public tools.", "Keep sample XML small enough to inspect manually.", "Separate well-formedness errors from schema validation errors."],
    mistakes: ["Starting with schema rules before the document is well formed.", "Sharing private XML payloads without redaction.", "Fixing all reported lines at once and losing the original root cause."],
    related: ["xml-linter.html", "xml-namespace-debugging-guide.html", "xml-schema-xsd-guide.html"]
  },
  {
    file: "xml-well-formed-vs-valid-guide.html",
    category: "Lint and Cleanup",
    mode: "formatter",
    icon: "XSD",
    h1: "XML Well-Formed vs Valid Guide",
    summary: "Understand the difference between well-formed XML syntax and schema-valid XML before debugging integrations, feeds or SOAP messages.",
    keywords: "xml well formed vs valid xsd validation guide",
    command: "Well-formed: parser can read the XML\nValid: XML also satisfies DTD or XSD rules",
    workflow: [["Parse first", "A schema validator cannot help until the document is readable XML."], ["Validate second", "Only after parsing should you check XSD-required elements, attributes and types."], ["Compare contracts", "Integration bugs often come from using an old schema or undocumented partner change."], ["Document unsupported cases", "Record which optional fields your system intentionally ignores."]],
    checks: ["Run a no-schema lint before an XSD validation.", "Keep example payloads synthetic and minimal.", "Version schemas next to integration code.", "Link validation failures to the owning contract or partner spec."],
    mistakes: ["Calling XML valid just because it opens in a formatter.", "Assuming pretty printed XML means contract compliance.", "Mixing partner-specific rules into a generic XML cleanup function."],
    related: ["xml-lint-error-guide.html", "xml-schema-xsd-guide.html", "api-request-body-validation-guide.html"]
  },
  {
    file: "yaml-lint-error-guide.html",
    category: "Lint and Cleanup",
    mode: "formatter",
    icon: "YML",
    h1: "YAML Lint Error Guide",
    summary: "Fix YAML lint errors caused by indentation, list nesting, tabs, duplicate keys and confusing scalar values in config files.",
    keywords: "yaml lint error guide yaml linter indentation duplicate keys",
    command: "yamllint config.yml\n# Fix indentation before changing application settings.",
    workflow: [["Look at indentation", "Most YAML failures start with a list item or map key aligned one level too far."], ["Remove tabs", "Tabs are hard to see and many parsers reject them."], ["Check duplicate keys", "Some parsers silently keep the last value, which makes reviews dangerous."], ["Retest with the app", "YAML can be syntactically valid while still wrong for Docker, CI or Kubernetes."]],
    checks: ["Use spaces consistently.", "Quote values that look like booleans, dates or version numbers when meaning matters.", "Keep environment secrets out of public examples.", "Validate with the target platform after generic linting."],
    mistakes: ["Changing indentation and semantic values in the same edit.", "Trusting a formatter to understand product-specific schema rules.", "Copying production secrets into troubleshooting samples."],
    related: ["yaml-lint-checklist.html", "yaml-indentation.html", "yaml-docker-compose-guide.html"]
  },
  {
    file: "yaml-ci-linting-guide.html",
    category: "Lint and Cleanup",
    mode: "delivery",
    icon: "CI",
    h1: "YAML CI Linting Guide",
    summary: "Add YAML lint checks to CI without blocking teams on noisy style rules or leaking environment configuration.",
    keywords: "yaml ci linting guide github actions yamllint pipeline",
    command: "yamllint .github/workflows docker-compose.yml k8s/\n# Fail on syntax and risky structure first.",
    workflow: [["Start with safety rules", "Syntax errors, duplicate keys and tabs should fail before style preferences."], ["Scope the paths", "Lint workflow, Docker, Kubernetes and config folders separately."], ["Use examples in reviews", "A failing lint message should point to a small, teachable config pattern."], ["Tune gradually", "Strict style rules are easier to adopt after the team trusts the signal."]],
    checks: ["Keep CI lint output short enough to read.", "Document suppressions and why they exist.", "Avoid printing secret-expanded config.", "Run product-specific validation after generic YAML linting."],
    mistakes: ["Failing builds on cosmetic style before syntax safety is stable.", "Linting generated files that developers cannot edit.", "Using one config for every repository without context."],
    related: ["github-actions-debugging-guide.html", "yaml-lint-error-guide.html", "ci-failing-tests-debugging-guide.html"]
  },
  {
    file: "sql-cleanup-checklist.html",
    category: "Lint and Cleanup",
    mode: "formatter",
    icon: "SQL",
    h1: "SQL Cleanup Checklist",
    summary: "Clean messy SQL before review by separating formatting, joins, filters, aliases, parameters and performance-sensitive changes.",
    keywords: "sql cleanup checklist clean sql formatter query review",
    command: "1. Format\n2. Name aliases\n3. Check joins\n4. Check WHERE\n5. Run EXPLAIN when behavior changes",
    workflow: [["Format without changing logic", "The first pass should make the query readable while preserving behavior."], ["Name every alias", "Meaningful aliases make joins and selected fields easier to review."], ["Inspect filters", "WHERE clauses decide data scope, security and performance."], ["Review plans after edits", "A readable query can still become slower if predicates or joins change."]],
    checks: ["Keep formatting commits separate from behavior changes when possible.", "Avoid SELECT star in shared reports and API queries.", "Use parameters rather than string-built values.", "Compare row counts before and after cleanup."],
    mistakes: ["Mixing a cosmetic cleanup with a logic rewrite.", "Changing join type to make the result look right.", "Removing parentheses from complex boolean filters without tests."],
    related: ["sql-cleanup.html", "sql-join-debugging-guide.html", "postgresql-explain-analyze-guide.html"]
  },
  {
    file: "sql-query-formatting-review-guide.html",
    category: "Lint and Cleanup",
    mode: "formatter",
    icon: "QRY",
    h1: "SQL Query Formatting Review Guide",
    summary: "Review formatted SQL by checking readability, data scope, execution risk and safe examples instead of only whitespace style.",
    keywords: "sql query formatting review guide sql formatter lint",
    command: "Review order: selected columns -> joins -> filters -> grouping -> ordering -> limits",
    workflow: [["Read the query top down", "A reviewer should understand selected fields before digging into filters."], ["Verify data ownership", "Team, tenant, account and permission filters deserve explicit attention."], ["Check aggregation", "GROUP BY mistakes often look like formatting changes until totals are wrong."], ["Keep a rollback note", "Production SQL changes need an easy way back."]],
    checks: ["Confirm aliases match business meaning.", "Check ORDER BY and LIMIT when pagination is involved.", "Run read-only verification queries for changed reports.", "Redact real IDs before asking for help."],
    mistakes: ["Approving a formatted query because it looks neat.", "Forgetting tenant or team scope during cleanup.", "Comparing only one example row after a rewrite."],
    related: ["sql-cleanup-checklist.html", "sql-group-by-debugging-guide.html", "database-incident-forum-template.html"]
  },
  {
    file: "json-lint-error-guide.html",
    category: "Lint and Cleanup",
    mode: "formatter",
    icon: "JSON",
    h1: "JSON Lint Error Guide",
    summary: "Fix JSON lint errors around trailing commas, invalid quotes, comments, escaping, arrays and object shape before API debugging.",
    keywords: "json lint error guide json linter parse error trailing comma",
    command: "JSON.parse(payload)\n# Fix the first syntax error, then validate shape separately.",
    workflow: [["Fix syntax first", "A parser error is different from an API contract error."], ["Look for JavaScript habits", "Single quotes, comments and trailing commas are not valid JSON."], ["Check escaping", "Newlines, quotes and backslashes inside strings need careful handling."], ["Validate shape second", "After parsing, compare required fields, types and arrays against the API contract."]],
    checks: ["Use double quotes for keys and strings.", "Remove trailing commas before sending payloads.", "Keep examples tiny and synthetic.", "Separate parse errors from schema errors in UI messages."],
    mistakes: ["Calling a JavaScript object literal JSON.", "Pasting secrets into public formatters.", "Trying to debug server validation before the payload parses."],
    related: ["json-formatting-guide.html", "json-schema-guide.html", "api-request-body-validation-guide.html"]
  },
  {
    file: "config-file-validation-guide.html",
    category: "Lint and Cleanup",
    mode: "ops",
    icon: "CFG",
    h1: "Config File Validation Guide",
    summary: "Validate JSON, YAML, XML, env and INI-style configuration files with syntax checks, schema rules and deployment-safe review steps.",
    keywords: "config file validation guide json yaml xml env ini lint",
    command: "syntax check -> schema check -> secret scan -> environment review -> deploy dry run",
    workflow: [["Start with syntax", "A malformed file should fail before deployment-specific checks begin."], ["Apply schema rules", "Product schemas catch missing keys and wrong value types."], ["Scan for secrets", "Config reviews must prevent tokens and passwords from entering public repos."], ["Test in a safe environment", "The best config validation ends with a dry run or staging deploy."]],
    checks: ["Choose the parser that matches the real runtime.", "Keep environment-specific values documented.", "Avoid committing generated config snapshots.", "Record who owns each critical setting."],
    mistakes: ["Using one generic linter as proof that deployment is safe.", "Mixing sample config and live secrets.", "Skipping rollback notes for config-only changes."],
    related: ["json-lint-error-guide.html", "yaml-lint-error-guide.html", "xml-lint-error-guide.html"]
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

function referencePage(page) {
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
    keywords: page.keywords
  };
  const workflowRows = page.workflow.map(([step, detail]) => `<tr><td>${htmlEscape(step)}</td><td>${htmlEscape(detail)}</td></tr>`).join("");
  const checks = page.checks.map((item) => `<li>${htmlEscape(item)}</li>`).join("");
  const mistakes = page.mistakes.map((item) => `<li>${htmlEscape(item)}</li>`).join("");
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
      <p>${htmlEscape(page.summary)} This reference is written for developers who need practical validation behavior, reviewable rules and safe examples rather than copied snippets with no explanation.</p>
      <h2>Recommended workflow</h2>
      <table class="workflow-table"><thead><tr><th>Step</th><th>Why it matters</th></tr></thead><tbody>${workflowRows}</tbody></table>
      <h2>Starter snippet</h2>
      <div class="command-block"><button class="copy-code-button" type="button" data-copy-code>Copy</button><pre><code>${htmlEscape(page.command)}</code></pre></div>
      <h2>Review checks</h2>
      <ul>${checks}</ul>
      <h2>Common mistakes</h2>
      <ul>${mistakes}</ul>
      <p class="guide-callout">Validation should help users correct input while protecting systems from bad data. Keep syntax checks, product policy, security review and deliverability checks separate.</p>
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
  ${head("Formalint Developer Forum - Softest Debugging Lounge", forumPage.summary, "forum.html", schema, `\n    <script defer src="assets/js/forum.js?v=${CACHE_VERSION}"></script>`)}
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
          <div class="forum-emoji-row" aria-label="Add tone to your note">
            <span>Tone:</span>
            <button type="button" data-forum-emoji="🙂" aria-label="Add friendly emoji">🙂</button>
            <button type="button" data-forum-emoji="👍" aria-label="Add thumbs up emoji">👍</button>
            <button type="button" data-forum-emoji="✅" aria-label="Add check emoji">✅</button>
            <button type="button" data-forum-emoji="⚠️" aria-label="Add warning emoji">⚠️</button>
            <button type="button" data-forum-emoji="💡" aria-label="Add idea emoji">💡</button>
            <button type="button" data-forum-emoji="🙏" aria-label="Add thanks emoji">🙏</button>
          </div>
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
  const page = guidePages.concat(emailValidationPages, lintCleanupPages).find((item) => item.file === file);
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

function sectionMarkup(id, eyebrow, h2, pages, includeForum = false) {
  const cards = includeForum ? [{ file: forumPage.file, h1: forumPage.h1, summary: forumPage.summary }].concat(pages) : pages;
  return `      <section class="directory-section" aria-labelledby="${id}" data-tools-section>
        <div class="section-heading">
          <p class="eyebrow">${eyebrow}</p>
          <h2 id="${id}">${h2}</h2>
        </div>
        <div class="directory-grid">
${cards.map((page) => normalizeToolCard(card(page))).join("\n")}
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
  if (!html.includes('data-tools-query="email regex"')) {
    html = html.replace('          <button type="button" data-tools-query="minimal reproduction" data-tools-topic-jump="community">minimal reproduction</button>', '          <button type="button" data-tools-query="minimal reproduction" data-tools-topic-jump="community">minimal reproduction</button>\n          <button type="button" data-tools-query="email regex" data-tools-topic-jump="regex">email regex</button>\n          <button type="button" data-tools-query="email validation" data-tools-topic-jump="regex">email validation</button>');
  }
  if (!html.includes('data-tools-query="xml linter"')) {
    html = html.replace('          <button type="button" data-tools-query="email validation" data-tools-topic-jump="regex">email validation</button>', '          <button type="button" data-tools-query="email validation" data-tools-topic-jump="regex">email validation</button>\n          <button type="button" data-tools-query="xml linter" data-tools-topic-jump="formatter">xml linter</button>\n          <button type="button" data-tools-query="yaml lint" data-tools-topic-jump="formatter">yaml lint</button>\n          <button type="button" data-tools-query="sql cleanup" data-tools-topic-jump="formatter">sql cleanup</button>');
  }
  if (!html.includes('data-tools-query="yaml lint"')) {
    html = html.replace('          <button type="button" data-tools-query="xml linter" data-tools-topic-jump="formatter">xml linter</button>', '          <button type="button" data-tools-query="xml linter" data-tools-topic-jump="formatter">xml linter</button>\n          <button type="button" data-tools-query="yaml lint" data-tools-topic-jump="formatter">yaml lint</button>');
  }
  const content = sectionMarkup("community-forum-title", "Community forum", "Forum, question templates and safe debugging threads", guidePages, true);
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint community sections start -->",
    "      <!-- Formalint community sections end -->",
    content,
    "      <!-- Formalint living index sections start -->"
  );
  const emailContent = sectionMarkup("email-validation-title", "Email validation", "Email regex, syntax checks and validation workflows", emailValidationPages);
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint email validation sections start -->",
    "      <!-- Formalint email validation sections end -->",
    emailContent,
    "      <!-- Formalint community sections start -->"
  );
  const lintContent = sectionMarkup("lint-cleanup-title", "Lint and cleanup", "XML, YAML, SQL and JSON cleanup references", lintCleanupPages);
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint lint cleanup sections start -->",
    "      <!-- Formalint lint cleanup sections end -->",
    lintContent,
    "      <!-- Formalint email validation sections start -->"
  );
  fs.writeFileSync(file, html, "utf8");
}

function insertCardsBefore(fileName, marker) {
  const file = path.join(ROOT, fileName);
  let html = fs.readFileSync(file, "utf8");
  const additions = [{ file: forumPage.file, h1: forumPage.h1, summary: forumPage.summary }].concat(guidePages, emailValidationPages, lintCleanupPages);
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
  const emailLinks = emailValidationPages.map((page) => ({
    label: page.h1,
    href: page.file,
    icon: page.icon,
    description: page.summary,
    keywords: page.keywords
  }));
  const emailGroup = `    {
      title: "Email Validation",
      mode: "regex",
      description: "Review email regex patterns, validation test cases and language-specific implementation notes.",
      links: [
${emailLinks.map((link) => `        { label: "${link.label.replace(/"/g, '\\"')}", href: "${link.href}", icon: "${link.icon}", description: "${link.description.replace(/"/g, '\\"')}", keywords: "${link.keywords}" }`).join(",\n")}
      ]
    },
`;
  const lintLinks = lintCleanupPages.map((page) => ({
    label: page.h1,
    href: page.file,
    icon: page.icon,
    description: page.summary,
    keywords: page.keywords
  }));
  const lintGroup = `    {
      title: "Lint and Cleanup",
      mode: "formatter",
      description: "Fix XML, YAML, SQL and JSON lint errors with reviewable cleanup workflows.",
      links: [
${lintLinks.map((link) => `        { label: "${link.label.replace(/"/g, '\\"')}", href: "${link.href}", icon: "${link.icon}", description: "${link.description.replace(/"/g, '\\"')}", keywords: "${link.keywords}" }`).join(",\n")}
      ]
    },
`;
  js = replaceOrInsertManagedBlock(
    js,
    "    // Formalint community groups start",
    "    // Formalint community groups end",
    group + emailGroup + lintGroup,
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
  if (!html.includes("236 Page Lint and Cleanup Update")) {
    const entry = `      <h2>September 15, 2026 - 236 Page Lint and Cleanup Update</h2>
      <p>Expanded Formalint to 236 public pages with a lint and cleanup cluster for XML lint errors, XML well-formed versus valid checks, YAML lint errors, YAML CI linting, SQL cleanup, SQL formatting review, JSON lint errors and config file validation. Updated the tools directory, quick search chips, sidebar discovery, cache version, sitemap lastmod values and changelog for the daily maintained release.</p>
`;
    html = html.replace("      <h2>September 14, 2026 - 228 Page Email Validation Update</h2>", entry + "      <h2>September 14, 2026 - 228 Page Email Validation Update</h2>");
  }
  if (!html.includes("228 Page Email Validation Update")) {
    const entry = `      <h2>September 14, 2026 - 228 Page Email Validation Update</h2>
      <p>Expanded Formalint to 228 public pages with a focused email validation cluster covering email regex cheatsheets, test cases, JavaScript, TypeScript, PHP, Python, DNS domain checks and disposable email policy. The update keeps the forum emoji composer, refreshes cache versions, updates the tools directory, sidebar discovery, sitemap lastmod values and changelog for the daily maintained release.</p>
`;
    html = html.replace("      <h2>September 9, 2026 - Forum Emoji Composer Update</h2>", entry + "      <h2>September 9, 2026 - Forum Emoji Composer Update</h2>");
  }
  if (!html.includes("220 Page Community Forum Update")) {
    const entry = `      <h2>September 8, 2026 - 220 Page Community Forum Update</h2>
      <p>Expanded Formalint to 220 public pages and added the local-first Formalint Developer Forum. The forum creates playful Softest handles in the browser, lets visitors draft safe debugging posts locally and links to new guides for forum questions, minimal reproductions, bug reports, code review questions, API debugging threads, database incident posts and community moderation. Updated tools discovery, sidebar navigation, cache version and sitemap for the daily maintained release.</p>
`;
    html = html.replace("      <h2>September 8, 2026 - 212 Page Living Index Update</h2>", entry + "      <h2>September 8, 2026 - 212 Page Living Index Update</h2>");
  }
  if (!html.includes("Forum Emoji Composer Update")) {
    const entry = `      <h2>September 9, 2026 - Forum Emoji Composer Update</h2>
      <p>Added an emoji tone bar to the local-first Formalint Developer Forum so visitors can make short technical notes warmer and clearer without creating accounts or sharing personal identity. Updated forum JavaScript, forum styling, cache version and sitemap lastmod values for the daily maintained release.</p>
`;
    html = html.replace("      <h2>September 8, 2026 - 220 Page Community Forum Update</h2>", entry + "      <h2>September 8, 2026 - 220 Page Community Forum Update</h2>");
  }
  fs.writeFileSync(file, html, "utf8");
}

function updateSitemap() {
  const htmlFiles = fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).sort((a, b) => a.localeCompare(b));
  const newPageFiles = new Set([forumPage.file].concat(guidePages.map((page) => page.file), emailValidationPages.map((page) => page.file), lintCleanupPages.map((page) => page.file)));
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
emailValidationPages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), referencePage(page), "utf8"));
lintCleanupPages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), referencePage(page), "utf8"));
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
