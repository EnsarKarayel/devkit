const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CACHE_VERSION = "20260924-safe-deployments";
const LIBRARY_COUNT = 277;
const TODAY = "2026-09-24";
const HUMAN_DATE = "September 24, 2026";

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

const apiReliabilityPages = [
  {
    file: "api-schema-drift-debugging-guide.html",
    category: "API Reliability",
    mode: "api",
    icon: "DRIFT",
    h1: "API Schema Drift Debugging Guide",
    summary: "Detect API schema drift when fields, types, nullability or nested response shapes change without a coordinated client release.",
    keywords: "api schema drift debugging response contract json schema",
    command: "capture known-good response -> compare current shape -> classify breaking change -> update contract test",
    workflow: [["Preserve both payloads", "Keep small redacted examples from the last known-good response and the failing response."], ["Compare structure", "Look for renamed fields, number-to-string changes, new null values and arrays that became objects."], ["Find the contract owner", "Confirm whether the producer changed intentionally or the consumer relied on undocumented behavior."], ["Add a regression check", "Turn the resolved difference into a schema or consumer contract test."]],
    checks: ["Compare field presence separately from field value.", "Review nullable and optional fields explicitly.", "Keep real customer data out of captured payloads.", "Version schema changes with release notes."],
    mistakes: ["Comparing only pretty-printed text instead of parsed structure.", "Treating every added field as a breaking change.", "Silently coercing changed types in multiple clients."],
    related: ["json-diff.html", "json-schema-guide.html", "api-versioning-strategy-guide.html"]
  },
  {
    file: "api-retry-exponential-backoff-guide.html",
    category: "API Reliability",
    mode: "api",
    icon: "RETRY",
    h1: "API Retry and Exponential Backoff Guide",
    summary: "Design API retries with exponential backoff, jitter, attempt limits and idempotency boundaries instead of multiplying an outage.",
    keywords: "api retry exponential backoff jitter idempotency guide",
    command: "delay = min(cap, base * 2^attempt) + random_jitter\nretry only transient failures",
    workflow: [["Classify the failure", "Retry connection resets, selected timeouts and documented 429 or 5xx responses, not every error."], ["Protect writes", "Use idempotency keys or operation identifiers before retrying create and payment requests."], ["Add jitter", "Randomized delay prevents many clients from retrying at the same instant."], ["Stop predictably", "Set attempt, elapsed-time and caller-deadline limits."]],
    checks: ["Honor Retry-After when the API sends it.", "Record attempt number and final outcome in logs.", "Keep retries below the parent request deadline.", "Test duplicate-write behavior deliberately."],
    mistakes: ["Retrying validation and authentication failures.", "Stacking library retries behind proxy retries.", "Using fixed delays across a large fleet."],
    related: ["api-idempotency-retry-guide.html", "api-timeout-debugging-guide.html", "api-rate-limit-debugging.html"]
  },
  {
    file: "api-rate-limit-headers-guide.html",
    category: "API Reliability",
    mode: "api",
    icon: "429",
    h1: "API Rate Limit Headers Guide",
    summary: "Interpret 429 responses, Retry-After and common rate-limit headers while keeping client throttling observable and predictable.",
    keywords: "api rate limit headers retry-after 429 x-ratelimit guide",
    command: "curl -i https://api.example.test/resource\n# Inspect status, Retry-After, remaining quota and reset time.",
    workflow: [["Read the status and body", "A 429 body often identifies the quota scope or operation that was limited."], ["Honor server timing", "Retry-After can be seconds or an HTTP date, so parse both forms."], ["Throttle before exhaustion", "Remaining and reset hints can smooth traffic before requests fail."], ["Measure by caller", "Separate user, token, tenant and global quota metrics."]],
    checks: ["Treat undocumented X-RateLimit headers as provider-specific.", "Use a monotonic wait timer after parsing reset time.", "Avoid logging full authorization tokens.", "Expose final rate-limit failure to callers clearly."],
    mistakes: ["Immediately retrying every 429 response.", "Assuming reset timestamps use local time.", "Sharing one client quota bucket across unrelated tenants."],
    related: ["api-rate-limit-debugging.html", "curl-headers-debugging-guide.html", "api-retry-exponential-backoff-guide.html"]
  },
  {
    file: "webhook-replay-debugging-guide.html",
    category: "API Reliability",
    mode: "api",
    icon: "HOOK",
    h1: "Webhook Replay Debugging Guide",
    summary: "Replay webhooks safely with captured metadata, idempotent handlers, signature-aware fixtures and observable delivery outcomes.",
    keywords: "webhook replay debugging duplicate delivery idempotency",
    command: "store redacted fixture -> preserve event id -> replay in staging -> verify one durable side effect",
    workflow: [["Capture a safe fixture", "Keep event type, delivery ID, timestamp and redacted body without retaining secrets."], ["Choose the verification mode", "Use a test secret and regenerated signature when validating the full HTTP handler."], ["Replay in isolation", "Point at staging or a local endpoint with outbound side effects disabled."], ["Verify deduplication", "The same delivery ID should not create a second durable action."]],
    checks: ["Preserve the raw body when signature verification depends on bytes.", "Record replay origin separately from live delivery.", "Expire stored fixtures according to data policy.", "Test retry ordering as well as duplicates."],
    mistakes: ["Replaying a production event against production.", "Changing JSON whitespace before checking the original signature.", "Using timestamps that the verifier correctly considers expired."],
    related: ["webhook-debugging-guide.html", "webhook-signature-verification-guide.html", "api-idempotency-retry-guide.html"]
  },
  {
    file: "api-hmac-request-signing-guide.html",
    category: "API Reliability",
    mode: "security",
    icon: "HMAC",
    h1: "API HMAC Request Signing Guide",
    summary: "Debug HMAC request signatures by making canonical input, body bytes, timestamps and constant-time verification explicit.",
    keywords: "api hmac request signing signature verification canonical string",
    command: "signature = HMAC-SHA256(secret, timestamp + '.' + raw_body)\ncompare decoded bytes in constant time",
    workflow: [["Write the signing contract", "Document encoding, separators, header names, timestamp units and the exact body representation."], ["Log safe intermediates", "Compare hashes and canonical string length without printing the shared secret."], ["Verify freshness", "Reject requests outside a small clock-skew window before accepting a valid old signature."], ["Rotate secrets", "Support overlapping keys briefly and identify which key verified the request."]],
    checks: ["Use raw request bytes, not reserialized JSON.", "Decode expected and actual signatures before constant-time comparison.", "Reject missing timestamps and delivery identifiers.", "Keep signing secrets out of browser code."],
    mistakes: ["Comparing hexadecimal strings with ordinary equality.", "Trimming or normalizing the body before hashing.", "Accepting valid signatures forever."],
    related: ["webhook-signature-verification-guide.html", "secrets-redaction-checklist.html", "api-key-rotation-guide.html"]
  },
  {
    file: "curl-tls-debugging-guide.html",
    category: "API Reliability",
    mode: "network",
    icon: "TLS",
    h1: "cURL TLS Debugging Guide",
    summary: "Use cURL verbose output to separate DNS, TCP, certificate chain, hostname, protocol and proxy failures without disabling verification.",
    keywords: "curl tls debugging ssl certificate verbose api",
    command: "curl --verbose --connect-timeout 5 https://api.example.test/health\nopenssl s_client -connect api.example.test:443 -servername api.example.test",
    workflow: [["Confirm the hostname", "Check DNS results and ensure the requested hostname matches the certificate identity."], ["Read the TLS phase", "Verbose output shows protocol negotiation, certificate verification and proxy behavior."], ["Inspect the chain", "Use an SNI-aware certificate check to find missing intermediates or an unexpected issuer."], ["Fix trust deliberately", "Update the server chain or trusted CA bundle instead of reaching for insecure mode."]],
    checks: ["Keep system time accurate.", "Test through the same proxy path as the failing client.", "Redact authorization headers from verbose output.", "Verify IPv4 and IPv6 paths when results differ."],
    mistakes: ["Using curl -k as the final fix.", "Testing an IP address while expecting hostname verification to pass.", "Blaming TLS when a corporate proxy replaced the certificate."],
    related: ["tls-certificate-debugging-guide.html", "ssl-renewal-debugging-guide.html", "curl-api-debugging-cheatsheet.html"]
  },
  {
    file: "openapi-breaking-change-checklist.html",
    category: "API Reliability",
    mode: "delivery",
    icon: "OAS",
    h1: "OpenAPI Breaking Change Checklist",
    summary: "Review OpenAPI changes for removed operations, stricter inputs, response shape drift and generated-client impact before release.",
    keywords: "openapi breaking change checklist api contract diff",
    command: "baseline spec -> structural diff -> classify client impact -> run contract tests -> publish migration note",
    workflow: [["Diff parsed specifications", "Compare operations, parameters, schemas and response codes structurally rather than line by line."], ["Check stricter inputs", "A new required field, narrower enum or smaller limit can break existing callers."], ["Check response compatibility", "Removed fields, changed types and newly nullable values affect generated and handwritten clients."], ["Prove the migration", "Run consumer tests and publish examples before deploying the producer change."]],
    checks: ["Resolve references before comparing schemas.", "Review default and nullable semantics.", "Include authentication and server URL changes.", "Version generated SDKs with the contract."],
    mistakes: ["Calling every additive schema change safe.", "Reviewing only endpoint paths.", "Publishing a changed spec after code is already live."],
    related: ["openapi-contract-checklist.html", "api-schema-drift-debugging-guide.html", "api-versioning-strategy-guide.html"]
  },
  {
    file: "api-error-response-design-guide.html",
    category: "API Reliability",
    mode: "api",
    icon: "ERR",
    h1: "API Error Response Design Guide",
    summary: "Design stable API error responses with machine-readable codes, safe messages, field details, correlation IDs and retry guidance.",
    keywords: "api error response design problem details correlation id",
    command: "status + stable code + safe message + field details + correlation id + retry hint",
    workflow: [["Choose the HTTP status", "Use transport semantics to separate invalid input, authentication, conflicts, limits and server failures."], ["Add a stable code", "Clients should branch on a documented code, not a translated human message."], ["Include safe context", "Field-level details and correlation IDs help debugging without exposing stack traces."], ["Document recovery", "Say whether callers should fix input, refresh credentials, retry later or contact support."]],
    checks: ["Keep the envelope consistent across services.", "Do not expose SQL, filesystem paths or internal exceptions.", "Return correlation IDs in both body and logs.", "Document which errors are safe to retry."],
    mistakes: ["Returning HTTP 200 with an error flag.", "Using one generic message for every validation field.", "Changing public error codes during copy edits."],
    related: ["rest-api-error-response-guide.html", "api-correlation-id-logging-guide.html", "api-request-body-validation-guide.html"]
  }
];

const observabilityPages = [
  {
    file: "opentelemetry-trace-debugging-guide.html",
    category: "Observability",
    mode: "observe",
    icon: "OTEL",
    h1: "OpenTelemetry Trace Debugging Guide",
    summary: "Debug missing or incomplete OpenTelemetry traces by checking context propagation, sampling, exporters and service boundaries in order.",
    keywords: "opentelemetry trace debugging context propagation exporter sampling",
    command: "request -> trace context -> child spans -> collector -> exporter -> backend",
    workflow: [["Verify trace headers", "Confirm traceparent reaches every HTTP, queue and worker boundary."], ["Inspect span creation", "Check parent-child relationships, status and end timestamps before blaming the backend."], ["Check sampling", "Head and tail sampling can intentionally remove traces or partial paths."], ["Follow the export path", "Review SDK queues, collector logs and backend ingestion errors separately."]],
    checks: ["Keep service.name stable across deploys.", "Propagate context through async jobs explicitly.", "Redact secrets from span attributes.", "Measure dropped spans and exporter queue pressure."],
    mistakes: ["Creating a new root span at every service.", "Recording full request bodies as attributes.", "Assuming a visible root span proves every child was exported."],
    related: ["structured-logging-guide.html", "api-correlation-id-logging-guide.html", "application-health-check-guide.html"]
  },
  {
    file: "opentelemetry-collector-pipeline-guide.html",
    category: "Observability",
    mode: "observe",
    icon: "COL",
    h1: "OpenTelemetry Collector Pipeline Guide",
    summary: "Build and troubleshoot OpenTelemetry Collector receiver, processor and exporter pipelines without hiding dropped telemetry.",
    keywords: "opentelemetry collector pipeline receiver processor exporter",
    command: "receivers -> memory_limiter -> batch -> redaction -> exporters",
    workflow: [["Start with one signal", "Prove a small traces or metrics pipeline before combining every receiver."], ["Order processors", "Memory limits, filtering, enrichment and batching have different failure effects."], ["Expose collector metrics", "Queue size, refused items and exporter failures reveal pressure early."], ["Test failure behavior", "Disconnect the backend and confirm retry, queue and data-loss expectations."]],
    checks: ["Set memory limits below the container limit.", "Use bounded sending queues.", "Keep credentials in environment-backed secrets.", "Validate configuration before deployment."],
    mistakes: ["Adding retries without queue limits.", "Filtering telemetry before measuring what was removed.", "Running one collector pipeline with no health endpoint."],
    related: ["opentelemetry-trace-debugging-guide.html", "docker-container-logs-guide.html", "kubernetes-pod-debugging-guide.html"]
  },
  {
    file: "prometheus-high-cardinality-guide.html",
    category: "Observability",
    mode: "observe",
    icon: "PROM",
    h1: "Prometheus High Cardinality Guide",
    summary: "Find and reduce high-cardinality Prometheus metrics caused by unbounded labels, identifiers and accidental dimensions.",
    keywords: "prometheus high cardinality labels metrics debugging",
    command: "series growth -> metric family -> label cardinality -> source instrumentation -> bounded replacement",
    workflow: [["Measure series growth", "Identify when active series and memory use changed."], ["Rank label values", "Look for user IDs, request IDs, raw URLs and error messages in labels."], ["Fix instrumentation", "Replace unbounded labels with routes, classes or controlled buckets."], ["Verify after rollout", "Confirm new series growth slows while useful aggregation remains."]],
    checks: ["Keep IDs in logs or traces, not metric labels.", "Normalize URL paths to route templates.", "Review histogram bucket counts.", "Set ownership for custom metrics."],
    mistakes: ["Deleting historical data before fixing the producer.", "Using exception messages as labels.", "Adding a tenant label without estimating tenant count."],
    related: ["structured-logging-guide.html", "error-budget-slo-guide.html", "uptime-monitoring-checklist.html"]
  },
  {
    file: "prometheus-alert-rule-debugging-guide.html",
    category: "Observability",
    mode: "observe",
    icon: "ALRT",
    h1: "Prometheus Alert Rule Debugging Guide",
    summary: "Debug Prometheus alert rules by separating query results, evaluation timing, pending duration, labels and notification delivery.",
    keywords: "prometheus alert rule debugging promql for pending alertmanager",
    command: "PromQL result -> rule evaluation -> pending for -> firing -> Alertmanager route",
    workflow: [["Run the expression", "Evaluate the exact PromQL at the rule timestamp and inspect returned labels."], ["Check rule state", "A true query remains pending until the for duration completes."], ["Inspect label stability", "Changing labels create new alert identities and reset pending time."], ["Trace notification routing", "After firing, verify inhibition, silence, grouping and receiver delivery."]],
    checks: ["Test rules against recorded fixtures.", "Include runbook and owner annotations.", "Use severity labels consistently.", "Alert on user impact rather than raw noise."],
    mistakes: ["Changing the query while investigating historical behavior.", "Using volatile labels in alert identity.", "Testing Alertmanager before proving the rule is firing."],
    related: ["prometheus-high-cardinality-guide.html", "error-budget-slo-guide.html", "application-health-check-guide.html"]
  },
  {
    file: "grafana-dashboard-debugging-guide.html",
    category: "Observability",
    mode: "observe",
    icon: "GRAF",
    h1: "Grafana Dashboard Debugging Guide",
    summary: "Fix empty or misleading Grafana panels by checking time range, variables, data source queries, units and aggregation semantics.",
    keywords: "grafana dashboard debugging empty panel variables datasource",
    command: "time range -> datasource -> variables -> raw query -> transformations -> visualization",
    workflow: [["Freeze the time range", "Use an absolute interval that includes known data."], ["Inspect variables", "Resolve template variables and compare their final values with label names."], ["Run the raw query", "Use query inspection to separate data-source results from panel transformations."], ["Review presentation", "Units, null handling and stacked series can change the story without changing data."]],
    checks: ["Show dashboard timezone clearly.", "Document variable defaults.", "Use rate functions for counters.", "Link panels to logs or traces when possible."],
    mistakes: ["Treating no-data and zero as the same state.", "Using an instant query for a time-series panel accidentally.", "Sharing dashboards with hidden environment filters."],
    related: ["prometheus-high-cardinality-guide.html", "structured-logging-guide.html", "opentelemetry-trace-debugging-guide.html"]
  },
  {
    file: "log-correlation-id-guide.html",
    category: "Observability",
    mode: "observe",
    icon: "CID",
    h1: "Log Correlation ID Guide",
    summary: "Carry correlation and trace identifiers across APIs, queues and workers so one incident can be followed without logging sensitive payloads.",
    keywords: "log correlation id trace id request logging guide",
    command: "accept safe request id -> create when absent -> propagate -> log structured field -> return response header",
    workflow: [["Choose identifiers", "Use trace IDs for distributed work and a separate business operation ID when needed."], ["Validate inbound values", "Bound length and characters before copying caller IDs into logs."], ["Propagate every boundary", "Forward context through HTTP clients, messages, scheduled jobs and retries."], ["Query consistently", "Keep one field name and format across services."]],
    checks: ["Do not use session tokens as correlation IDs.", "Return a safe identifier to support teams.", "Keep IDs searchable in structured logs.", "Preserve the original ID across retries."],
    mistakes: ["Generating a new ID after every hop.", "Embedding user email or account data in IDs.", "Logging IDs only in error paths."],
    related: ["api-correlation-id-logging-guide.html", "structured-logging-guide.html", "opentelemetry-trace-debugging-guide.html"]
  },
  {
    file: "slo-burn-rate-alerting-guide.html",
    category: "Observability",
    mode: "observe",
    icon: "SLO",
    h1: "SLO Burn Rate Alerting Guide",
    summary: "Design multi-window burn-rate alerts that detect fast outages and slow error-budget exhaustion without paging on every fluctuation.",
    keywords: "slo burn rate alerting error budget multi window",
    command: "burn rate = observed error ratio / allowed error ratio",
    workflow: [["Define the SLI", "Use a measurable good-event ratio tied to user experience."], ["Set the objective", "The SLO determines the allowed error ratio and budget."], ["Pair windows", "Combine short and long windows to require both urgency and sustained impact."], ["Tune with incidents", "Backtest thresholds against known outages and harmless spikes."]],
    checks: ["Exclude planned traffic only with documented policy.", "Use enough request volume for stable ratios.", "Link every page to a runbook.", "Track remaining budget outside alert state."],
    mistakes: ["Alerting directly on monthly budget remaining.", "Using availability SLOs for latency failures.", "Paging on a short window with no confirmation window."],
    related: ["error-budget-slo-guide.html", "prometheus-alert-rule-debugging-guide.html", "uptime-monitoring-checklist.html"]
  },
  {
    file: "incident-timeline-template-guide.html",
    category: "Observability",
    mode: "observe",
    icon: "TIME",
    h1: "Incident Timeline Template Guide",
    summary: "Build an evidence-based incident timeline from alerts, deploys, logs, traces and decisions without turning it into a blame document.",
    keywords: "incident timeline template observability postmortem guide",
    command: "UTC time | signal or action | source | observed impact | owner | result",
    workflow: [["Choose one clock", "Normalize evidence to UTC while preserving original timestamps when useful."], ["Separate facts and inference", "Record what the system showed separately from the team's hypothesis."], ["Link source evidence", "Attach safe alert, deploy, log and trace references rather than copying secrets."], ["Mark decision points", "Explain why mitigation changed and what result followed."]],
    checks: ["Record detection and recovery separately.", "Include customer-impact start and end estimates.", "Redact personal and customer data.", "Convert follow-ups into owned actions."],
    mistakes: ["Writing the timeline from memory days later.", "Listing chat messages without operational meaning.", "Using the document to assign blame instead of improve controls."],
    related: ["database-incident-forum-template.html", "deployment-rollback-checklist.html", "log-correlation-id-guide.html"]
  }
];

const productionSecurityPages = [
  {
    file: "ssh-permission-denied-debugging-guide.html", category: "Production Security", mode: "secure", icon: "SSH",
    h1: "SSH Permission Denied Debugging Guide",
    summary: "Debug SSH public-key authentication failures by checking the selected identity, server policy, file ownership and authorization logs in a safe order.",
    keywords: "ssh permission denied publickey debugging authorized keys",
    command: "ssh -vvv user@host",
    workflow: [["Confirm the target", "Verify hostname, port and remote username before changing keys."], ["Inspect client selection", "Use verbose output to see which identities the client offers and which configuration block applies."], ["Check server authorization", "Review authorized_keys ownership, permissions and key restrictions from an existing trusted session."], ["Read authentication logs", "Use the server log to distinguish rejected algorithms, policy failures and unreadable key files."]],
    checks: ["Keep a working administrative session open while testing.", "Prefer dedicated keys per automation boundary.", "Verify the host key before accepting changes.", "Remove obsolete authorized keys after recovery."],
    mistakes: ["Regenerating every key before reading verbose output.", "Disabling host-key verification to hide a mismatch.", "Making .ssh writable by unrelated users."],
    related: ["linux-admin-command-guide.html", "linux-journalctl-guide.html", "secrets-redaction-checklist.html"]
  },
  {
    file: "linux-firewall-debugging-guide.html", category: "Production Security", mode: "secure", icon: "FW",
    h1: "Linux Firewall Debugging Guide",
    summary: "Troubleshoot blocked Linux traffic across listening sockets, host firewalls, cloud rules and return paths without opening broad production access.",
    keywords: "linux firewall debugging nftables ufw firewalld port",
    command: "ss -lntup && sudo nft list ruleset",
    workflow: [["Prove the listener", "Confirm the process is bound to the expected address and port."], ["Test locally", "Separate application failure from packet filtering with a loopback or host-local request."], ["Trace policy layers", "Review nftables, firewalld or UFW before checking cloud security groups and network ACLs."], ["Verify both directions", "Routing, state tracking and asymmetric return paths can look like an inbound block."]],
    checks: ["Record the exact source, destination, protocol and port.", "Add the narrowest temporary rule with an expiry plan.", "Preserve console access before changing remote rules.", "Capture counters before and after the test."],
    mistakes: ["Opening all ports to prove one service works.", "Editing multiple firewall layers at once.", "Testing a TCP service with an unrelated UDP probe."],
    related: ["powershell-network-debugging-guide.html", "nginx-reverse-proxy-checklist.html", "application-health-check-guide.html"]
  },
  {
    file: "tls-certificate-chain-debugging-guide.html", category: "Production Security", mode: "secure", icon: "TLS",
    h1: "TLS Certificate Chain Debugging Guide",
    summary: "Diagnose incomplete TLS chains, wrong virtual hosts and trust-store failures using reproducible client and server evidence.",
    keywords: "tls certificate chain debugging openssl intermediate certificate",
    command: "openssl s_client -connect example.com:443 -servername example.com -showcerts",
    workflow: [["Send the server name", "Use SNI so the endpoint returns the certificate for the intended virtual host."], ["Inspect the served chain", "Check leaf, intermediate order, issuer relationships and unexpected duplicates."], ["Verify identity and time", "Match SAN names and validity dates against the client clock."], ["Compare trust contexts", "Browser, container, JVM and operating-system stores may trust different roots."]],
    checks: ["Serve intermediates but not the root certificate.", "Test from outside the origin network.", "Document renewal ownership and expiry monitoring.", "Keep private keys out of diagnostic output."],
    mistakes: ["Testing by IP without SNI.", "Assuming one successful browser proves every client trusts the chain.", "Appending certificates without checking order."],
    related: ["tls-certificate-debugging-guide.html", "ssl-renewal-debugging-guide.html", "curl-tls-debugging-guide.html"]
  },
  {
    file: "docker-image-vulnerability-triage-guide.html", category: "Production Security", mode: "secure", icon: "CVE",
    h1: "Docker Image Vulnerability Triage Guide",
    summary: "Triage container image findings by proving package reachability, base-image ownership, available fixes and deployment exposure.",
    keywords: "docker image vulnerability triage container cve remediation",
    command: "scanner result -> package origin -> reachable use -> fixed version -> rebuilt digest",
    workflow: [["Pin the artifact", "Record the immutable image digest and scanner database time."], ["Identify package origin", "Separate operating-system packages, language dependencies and copied binaries."], ["Assess practical exposure", "Check whether the affected component is loaded, reachable and enabled in the deployed runtime."], ["Rebuild and verify", "Update the smallest owning layer, rebuild from clean inputs and scan the resulting digest."]],
    checks: ["Prefer maintained minimal base images.", "Generate an SBOM during the build.", "Track accepted risk with owner and expiry.", "Redeploy by digest after remediation."],
    mistakes: ["Ignoring every finding marked unfixed.", "Patching a running container instead of its build source.", "Comparing scans from different database dates without noting it."],
    related: ["dependency-vulnerability-triage-guide.html", "docker-build-cache-debugging-guide.html", "secrets-redaction-checklist.html"]
  },
  {
    file: "kubernetes-secret-debugging-guide.html", category: "Production Security", mode: "secure", icon: "K8S",
    h1: "Kubernetes Secret Debugging Guide",
    summary: "Debug Kubernetes Secret references, mounts and rollout behavior without printing credentials into terminals, logs or support tickets.",
    keywords: "kubernetes secret debugging secretKeyRef volume mount rollout",
    command: "kubectl describe pod <pod>  # inspect references and events, not secret values",
    workflow: [["Confirm the reference", "Check namespace, Secret name, key and optional flags in the workload specification."], ["Inspect delivery mode", "Environment variables and projected volumes update with different timing and restart behavior."], ["Review pod events", "Missing objects, keys and mount failures appear without decoding secret data."], ["Roll out safely", "After rotation, verify new pods consume the new version before revoking the old credential."]],
    checks: ["Use metadata and hashes for comparison instead of plaintext.", "Restrict RBAC get and list permissions.", "Redact terminal history and CI output.", "Document rotation and rollback order."],
    mistakes: ["Decoding secrets into shared chat.", "Expecting existing environment variables to refresh in place.", "Granting cluster-wide Secret access for troubleshooting."],
    related: ["kubernetes-pod-debugging-guide.html", "github-actions-env-secrets-guide.html", "api-key-rotation-guide.html"]
  },
  {
    file: "github-actions-oidc-deployment-guide.html", category: "Production Security", mode: "secure", icon: "OIDC",
    h1: "GitHub Actions OIDC Deployment Guide",
    summary: "Replace long-lived deployment keys with short-lived GitHub Actions OIDC credentials and tightly scoped trust conditions.",
    keywords: "github actions oidc deployment short lived credentials security",
    command: "workflow identity -> OIDC token -> cloud trust policy -> short-lived role session",
    workflow: [["Define the workload identity", "Choose the repository, branch, environment and workflow conditions that may deploy."], ["Create narrow trust", "Bind token issuer, audience and subject claims to one deployment role."], ["Request minimum permissions", "Grant id-token write only to the job that exchanges the token."], ["Prove denial paths", "Test forks, pull requests and unapproved environments cannot assume the role."]],
    checks: ["Use protected environments for production.", "Limit cloud permissions independently of token trust.", "Log role sessions and deployment provenance.", "Remove the old static secret after a verified migration."],
    mistakes: ["Trusting every branch in a repository.", "Granting id-token write at workflow scope without need.", "Keeping permanent credentials as an undocumented fallback."],
    related: ["github-actions-env-secrets-guide.html", "static-site-deployment-checklist.html", "deployment-rollback-checklist.html"]
  }
];

const runtimeDiagnosticsPages = [
  {
    file: "python-module-not-found-debugging-guide.html", category: "Runtime Diagnostics", mode: "python", icon: "PY",
    h1: "Python ModuleNotFoundError Debugging Guide",
    summary: "Resolve Python ModuleNotFoundError by proving the active interpreter, environment, import path, package name and project layout before reinstalling dependencies.",
    keywords: "python modulenotfounderror debugging import path virtual environment",
    command: "python -c \"import sys; print(sys.executable); print(*sys.path, sep='\\n')\"",
    workflow: [["Identify the interpreter", "Compare the executable used by the shell, IDE, test runner and service."], ["Check package presence", "Query the same interpreter with python -m pip rather than a separate pip command."], ["Inspect import resolution", "Review sys.path, package directories and working directory without adding broad path hacks."], ["Validate project packaging", "Confirm package markers, editable installs and module names match the repository layout."]],
    checks: ["Reproduce in a fresh virtual environment.", "Use python -m pip for installs and inspection.", "Check case-sensitive file names on Linux.", "Keep application modules distinct from dependency names."],
    mistakes: ["Installing globally until the import works.", "Appending repository paths in production code.", "Naming a local file after a standard or third-party module."],
    related: ["python-virtualenv-debugging-guide.html", "python-pip-requirements-guide.html", "python-runtime-guide.html"]
  },
  {
    file: "python-pip-dependency-conflict-guide.html", category: "Runtime Diagnostics", mode: "python", icon: "PIP",
    h1: "Python pip Dependency Conflict Guide",
    summary: "Debug pip dependency conflicts with isolated resolution, dependency ownership, compatible constraints and reproducible lock evidence.",
    keywords: "python pip dependency conflict resolver requirements debugging",
    command: "python -m pip check && python -m pip inspect",
    workflow: [["Start clean", "Reproduce resolution in an empty environment so stale packages cannot satisfy hidden constraints."], ["Find the owning constraints", "Trace which direct dependency requires each incompatible transitive version."], ["Choose a compatible range", "Upgrade, constrain or replace the smallest direct dependency rather than pinning every transitive package."], ["Verify the artifact", "Install from the resolved file in CI and run import plus behavioral tests."]],
    checks: ["Record Python and platform versions.", "Separate application constraints from library metadata.", "Review yanked and pre-release versions explicitly.", "Run pip check after installation."],
    mistakes: ["Using --no-deps as a permanent fix.", "Copying a lock file across incompatible Python versions blindly.", "Adding arbitrary pins without documenting ownership."],
    related: ["python-pip-requirements-guide.html", "dependency-vulnerability-triage-guide.html", "python-module-not-found-debugging-guide.html"]
  },
  {
    file: "java-ssl-handshake-debugging-guide.html", category: "Runtime Diagnostics", mode: "java", icon: "TLS",
    h1: "Java SSLHandshakeException Debugging Guide",
    summary: "Diagnose Java SSLHandshakeException failures across certificate chains, hostnames, protocols, trust stores and mutual TLS without disabling verification.",
    keywords: "java sslhandshakeexception debugging truststore certificate chain",
    command: "java -Djavax.net.debug=ssl,handshake -jar app.jar",
    workflow: [["Capture the exact cause", "Separate certificate-path, hostname, protocol, cipher and client-certificate failures."], ["Inspect the endpoint", "Use SNI-aware certificate checks and compare the served chain with the Java error."], ["Confirm the runtime trust store", "Identify the exact JDK, configured trustStore and container image used by the failing process."], ["Test the narrow fix", "Add the required CA or correct the server chain, then retest with verification enabled."]],
    checks: ["Redact tokens and session data from SSL debug logs.", "Check JVM and system clocks.", "Prefer public or managed CA chains when possible.", "Document custom trust-store ownership and rotation."],
    mistakes: ["Installing a permissive TrustManager.", "Importing the leaf certificate as a permanent trust anchor.", "Testing with a different JDK than production."],
    related: ["tls-certificate-chain-debugging-guide.html", "java-runtime-guide.html", "java-classpath-debugging-guide.html"]
  },
  {
    file: "java-maven-test-failure-debugging-guide.html", category: "Runtime Diagnostics", mode: "java", icon: "MVN",
    h1: "Maven Test Failure Debugging Guide",
    summary: "Debug Maven Surefire and Failsafe failures by separating test discovery, forked JVM crashes, environment drift and integration-test lifecycle issues.",
    keywords: "maven surefire failsafe test failure debugging forked jvm",
    command: "mvn -e -X -Dtest=ClassName#method test",
    workflow: [["Classify the phase", "Confirm whether Surefire unit tests or Failsafe integration tests are failing."], ["Run one test", "Reproduce the smallest class or method while preserving the same profile and JVM options."], ["Inspect reports", "Read XML, text reports and dump files before relying on the final Maven summary."], ["Compare environments", "Check JDK, locale, timezone, ports, services and parallel execution between local and CI runs."]],
    checks: ["Keep plugin versions explicit.", "Capture forked-process exit codes.", "Avoid shared mutable test data.", "Run integration verification through the verify phase."],
    mistakes: ["Adding unlimited retries to flaky tests.", "Running failsafe tests with only the test phase.", "Deleting reports before examining JVM dump files."],
    related: ["java-maven-dependency-debugging.html", "ci-failing-tests-debugging-guide.html", "java-thread-dump-guide.html"]
  },
  {
    file: "php-500-error-debugging-guide.html", category: "Runtime Diagnostics", mode: "php", icon: "PHP",
    h1: "PHP 500 Error Debugging Guide",
    summary: "Trace PHP HTTP 500 responses through the reverse proxy, PHP-FPM pool, application logs, runtime configuration and failing request context.",
    keywords: "php 500 error debugging php-fpm nginx logs",
    command: "request id -> web server log -> PHP-FPM log -> application exception",
    workflow: [["Preserve the failing request", "Record route, method, timestamp and correlation ID without copying credentials or personal data."], ["Check the proxy layer", "Separate upstream connection failures from application-generated 500 responses."], ["Follow PHP-FPM", "Review pool logs, worker limits, timeouts and the effective php.ini for the serving process."], ["Reproduce safely", "Use a non-production request with the same code path and controlled input."]],
    checks: ["Keep display_errors off in production.", "Log a safe correlation ID in every layer.", "Check disk space and file permissions.", "Verify opcache state after deployment."],
    mistakes: ["Showing stack traces to public clients.", "Editing CLI php.ini while PHP-FPM uses another file.", "Restarting every service before collecting evidence."],
    related: ["php-fpm-nginx-debugging-guide.html", "nginx-502-504-debugging-guide.html", "php-ini-configuration-guide.html"]
  },
  {
    file: "php-composer-memory-debugging-guide.html", category: "Runtime Diagnostics", mode: "php", icon: "CMP",
    h1: "Composer Memory and Process Debugging Guide",
    summary: "Troubleshoot Composer memory exhaustion and stalled dependency operations by checking PHP limits, solver pressure, plugins and constrained build environments.",
    keywords: "composer memory limit debugging dependency solver php",
    command: "php --ini && php -r \"echo ini_get('memory_limit'), PHP_EOL;\" && composer diagnose",
    workflow: [["Confirm the runtime", "Identify the CLI PHP binary, configuration files and Composer version used by the failing command."], ["Measure the operation", "Use verbose output to distinguish downloads, plugins, scripts and dependency solving."], ["Reduce solver pressure", "Review broad constraints, stale locks and unnecessary platform variation before increasing memory."], ["Fix the build environment", "Give CI a documented bounded resource allocation and reuse verified package caches."]],
    checks: ["Commit composer.lock for applications.", "Audit plugins and scripts before running them in CI.", "Use production install flags only after resolution.", "Record platform requirements explicitly."],
    mistakes: ["Setting memory_limit to unlimited everywhere.", "Deleting the lock file as the first response.", "Running Composer as root with unreviewed plugins."],
    related: ["php-composer-dependency-conflict-guide.html", "php-composer-autoload-guide.html", "php-runtime-guide.html"]
  }
];

const databaseOperationsPages = [
  {
    file: "postgresql-replication-lag-debugging-guide.html", category: "Database Operations", mode: "database", icon: "PG",
    h1: "PostgreSQL Replication Lag Debugging Guide",
    summary: "Diagnose PostgreSQL replication lag by separating WAL generation, transport, replay, slot retention and standby resource pressure.",
    keywords: "postgresql replication lag debugging wal standby replay",
    command: "SELECT application_name, state, sent_lsn, write_lsn, flush_lsn, replay_lsn FROM pg_stat_replication;",
    workflow: [["Measure each stage", "Compare sent, written, flushed and replayed positions instead of relying on one lag number."], ["Check WAL transport", "Inspect network stability, sender state and receiver logs for interruptions."], ["Inspect replay pressure", "Long queries, recovery conflicts, storage latency and CPU saturation can delay apply."], ["Review retention", "Replication slots and archive failures can grow storage while a standby is unavailable."]],
    checks: ["Record byte lag and time lag together.", "Monitor slot retained WAL volume.", "Test failover readiness separately from streaming state.", "Keep clocks synchronized across nodes."],
    mistakes: ["Restarting the standby before collecting LSN evidence.", "Treating an idle primary as proof replication recovered.", "Dropping a slot without confirming consumer ownership."],
    related: ["postgresql-dba-checklist.html", "postgresql-connection-limit-guide.html", "postgresql-lock-debugging-guide.html"]
  },
  {
    file: "postgresql-connection-refused-debugging-guide.html", category: "Database Operations", mode: "database", icon: "PG",
    h1: "PostgreSQL Connection Refused Debugging Guide",
    summary: "Troubleshoot PostgreSQL connection refused errors across service state, listening addresses, ports, containers, firewalls and client routing.",
    keywords: "postgresql connection refused debugging listen addresses port",
    command: "pg_isready -h host -p 5432 && ss -lntp",
    workflow: [["Resolve the endpoint", "Confirm DNS, address family, port and container or service boundary used by the client."], ["Prove the listener", "Check PostgreSQL service state and the exact addresses bound by the server."], ["Test network layers", "Separate local socket access, host TCP, firewall and cloud policy one hop at a time."], ["Move to authentication", "Only inspect pg_hba.conf after a TCP connection reaches PostgreSQL."]],
    checks: ["Compare IPv4 and IPv6 resolution.", "Verify container port publication and service discovery.", "Preserve server logs around startup.", "Avoid exposing PostgreSQL publicly for a quick test."],
    mistakes: ["Editing pg_hba.conf for a refused TCP connection.", "Testing localhost from the wrong container.", "Opening port 5432 to the internet."],
    related: ["linux-firewall-debugging-guide.html", "docker-compose-debugging-guide.html", "postgresql-dba-checklist.html"]
  },
  {
    file: "mysql-replication-lag-debugging-guide.html", category: "Database Operations", mode: "database", icon: "MY",
    h1: "MySQL Replication Lag Debugging Guide",
    summary: "Debug MySQL replication lag by checking source throughput, relay log delivery, SQL applier workers, locks and replica hardware pressure.",
    keywords: "mysql replication lag debugging replica sql thread relay log",
    command: "SHOW REPLICA STATUS\\G",
    workflow: [["Validate thread state", "Confirm receiver and applier status plus the last IO and SQL errors."], ["Measure backlog", "Use executed positions and relay log growth rather than Seconds_Behind_Source alone."], ["Inspect apply blockers", "Long transactions, metadata locks and single-threaded work can stall progress."], ["Compare capacity", "Check replica storage latency, CPU and configuration against source write volume."]],
    checks: ["Monitor GTID progress and relay log size.", "Keep replica clocks synchronized.", "Test read consistency requirements explicitly.", "Document safe skip and rebuild procedures."],
    mistakes: ["Using only Seconds_Behind_Source.", "Skipping a transaction without understanding data impact.", "Running heavy reports on the only failover replica."],
    related: ["mysql-dba-checklist.html", "mysql-processlist-debugging-guide.html", "mysql-deadlock-debugging-guide.html"]
  },
  {
    file: "database-backup-restore-verification-guide.html", category: "Database Operations", mode: "database", icon: "BAK",
    h1: "Database Backup Restore Verification Guide",
    summary: "Prove database backups are recoverable with isolated restores, integrity checks, application smoke tests and measured recovery objectives.",
    keywords: "database backup restore verification checklist rpo rto",
    command: "backup artifact -> checksum -> isolated restore -> integrity query -> application smoke test",
    workflow: [["Select a real artifact", "Use the same encrypted backup and retrieval path intended for an incident."], ["Restore in isolation", "Prevent accidental writes, callbacks and external integrations from the restored environment."], ["Verify integrity", "Check schemas, row counts, constraints, recent business records and required extensions."], ["Measure recovery", "Record retrieval, restore, replay and validation times against RPO and RTO targets."]],
    checks: ["Test encryption-key recovery.", "Verify point-in-time replay boundaries.", "Automate safe smoke queries.", "Record evidence without copying production data."],
    mistakes: ["Calling a successful backup job a restore test.", "Restoring over a shared database.", "Checking only that the server starts."],
    related: ["dba-admin-roadmap.html", "database-incident-forum-template.html", "deployment-rollback-checklist.html"]
  },
  {
    file: "database-migration-rollback-guide.html", category: "Database Operations", mode: "database", icon: "DDL",
    h1: "Database Migration Rollback Guide",
    summary: "Plan database migration rollback with expand-contract changes, compatibility windows, data backfills, evidence gates and forward-fix options.",
    keywords: "database migration rollback guide schema expand contract",
    command: "expand -> dual-compatible deploy -> backfill -> verify -> contract",
    workflow: [["Classify reversibility", "Separate additive schema changes from destructive data transformations and one-way backfills."], ["Create a compatibility window", "Keep old and new application versions functional during rollout and rollback."], ["Define evidence gates", "Use row counts, constraints, latency and error rates before advancing phases."], ["Choose rollback or forward fix", "Document when restoring code is safer than reversing data changes."]],
    checks: ["Back up affected data before destructive steps.", "Test lock duration on production-like volume.", "Make backfills resumable and observable.", "Assign an explicit stop decision owner."],
    mistakes: ["Combining column removal with the first code deploy.", "Assuming down migrations restore deleted data.", "Running an unbounded update in one transaction."],
    related: ["deployment-rollback-checklist.html", "release-checklist-for-developers.html", "database-backup-restore-verification-guide.html"]
  },
  {
    file: "database-connection-pool-debugging-guide.html", category: "Database Operations", mode: "database", icon: "POOL",
    h1: "Database Connection Pool Debugging Guide",
    summary: "Diagnose database connection pool exhaustion using wait time, checkout duration, transaction boundaries, leaks and server capacity evidence.",
    keywords: "database connection pool exhaustion debugging timeout leak",
    command: "pool wait -> checkout duration -> active transaction -> server sessions -> capacity budget",
    workflow: [["Confirm pool pressure", "Measure active, idle, pending and timeout counts from the application pool."], ["Find long checkouts", "Trace requests holding connections across slow calls, streaming work or missing cleanup."], ["Inspect database sessions", "Correlate application owners with active, idle-in-transaction and blocked sessions."], ["Set a capacity budget", "Divide server connection limits across replicas, workers, jobs and administrative access."]],
    checks: ["Always release connections in finally or scoped constructs.", "Set statement and transaction timeouts.", "Reserve emergency DBA capacity.", "Load test queueing behavior before raising pool size."],
    mistakes: ["Increasing every pool until the database refuses connections.", "Treating idle-in-transaction as harmless idle.", "Retrying pool timeouts without backoff."],
    related: ["postgresql-connection-limit-guide.html", "mysql-processlist-debugging-guide.html", "api-timeout-debugging-guide.html"]
  }
];

const safeDeploymentPages = [
  {
    file: "docker-healthcheck-debugging-guide.html", category: "Safe Deployments", mode: "deploy", icon: "HC",
    h1: "Docker Healthcheck Debugging Guide",
    summary: "Debug Docker healthcheck failures by reproducing the probe inside the image and separating command, timing, dependency and application-readiness problems.",
    keywords: "docker healthcheck debugging unhealthy container start period",
    command: "docker inspect --format '{{json .State.Health}}' <container>",
    workflow: [["Read probe history", "Inspect exit codes and output for each recent healthcheck attempt."], ["Run the exact command", "Execute the probe inside the same image with the same user, path and environment."], ["Review timing", "Compare interval, timeout, retries and start period with realistic application startup."], ["Separate dependencies", "Make the probe represent this container's readiness rather than every remote service."]],
    checks: ["Keep probe output short and non-sensitive.", "Use tools that actually exist in the runtime image.", "Test failure and recovery transitions.", "Distinguish liveness from readiness at the orchestrator layer."],
    mistakes: ["Installing curl only for an oversized probe.", "Checking a public endpoint that bypasses the container.", "Using an aggressive timeout during cold startup."],
    related: ["docker-container-logs-guide.html", "application-health-check-guide.html", "docker-compose-debugging-guide.html"]
  },
  {
    file: "kubernetes-rollout-stuck-debugging-guide.html", category: "Safe Deployments", mode: "deploy", icon: "K8S",
    h1: "Kubernetes Rollout Stuck Debugging Guide",
    summary: "Diagnose stuck Kubernetes rollouts through Deployment conditions, ReplicaSets, pod scheduling, image pulls, probes and availability budgets.",
    keywords: "kubernetes rollout stuck debugging deployment progress deadline",
    command: "kubectl rollout status deployment/<name> && kubectl describe deployment <name>",
    workflow: [["Read Deployment conditions", "Identify progress deadline, unavailable replica and minimum availability signals."], ["Find the active ReplicaSet", "Compare desired, current, ready and available counts across revisions."], ["Inspect the newest pods", "Use events and container state to separate scheduling, image, configuration and probe failures."], ["Check rollout constraints", "Review surge, unavailable limits, quotas and disruption budgets before changing strategy."]],
    checks: ["Record the intended image digest.", "Keep previous ReplicaSet evidence before rollback.", "Validate Secret and ConfigMap references.", "Confirm service endpoints include new ready pods."],
    mistakes: ["Restarting all pods before reading events.", "Raising progress deadlines to hide a broken probe.", "Deleting the old ReplicaSet during investigation."],
    related: ["kubernetes-pod-debugging-guide.html", "kubernetes-crashloopbackoff-guide.html", "deployment-rollback-checklist.html"]
  },
  {
    file: "blue-green-deployment-checklist.html", category: "Safe Deployments", mode: "deploy", icon: "BG",
    h1: "Blue-Green Deployment Checklist",
    summary: "Plan blue-green releases with environment parity, database compatibility, traffic switching, session behavior and tested rollback evidence.",
    keywords: "blue green deployment checklist rollback traffic switch",
    command: "deploy green -> verify privately -> shift traffic -> observe -> retire blue",
    workflow: [["Build parity", "Keep configuration, dependencies and infrastructure differences explicit between blue and green."], ["Prove compatibility", "Validate database, queues, caches and external callbacks with both application versions."], ["Test the switch", "Exercise routing, connection draining, sessions and DNS or load-balancer propagation."], ["Hold rollback capacity", "Keep blue healthy until green passes a defined observation window."]],
    checks: ["Use immutable release artifacts.", "Run synthetic and business smoke tests.", "Define a traffic-switch owner.", "Preserve logs and metrics for both colors."],
    mistakes: ["Applying a destructive migration before the switch.", "Reusing stateful workers across colors blindly.", "Retiring blue immediately after one successful request."],
    related: ["database-migration-rollback-guide.html", "release-checklist-for-developers.html", "application-health-check-guide.html"]
  },
  {
    file: "canary-deployment-observability-guide.html", category: "Safe Deployments", mode: "deploy", icon: "CAN",
    h1: "Canary Deployment Observability Guide",
    summary: "Evaluate canary releases with comparable traffic, version-labelled telemetry, guardrail metrics and explicit promotion or rollback decisions.",
    keywords: "canary deployment observability metrics rollback guide",
    command: "baseline vs canary: errors + latency + saturation + business outcome",
    workflow: [["Define the cohort", "Choose representative traffic and document exclusions before deployment."], ["Label the release", "Attach stable version dimensions to metrics, logs and traces without adding unbounded cardinality."], ["Set guardrails", "Compare error rate, latency, resource pressure and one business signal against the baseline."], ["Make a timed decision", "Promote, pause or roll back using thresholds and a named owner rather than intuition."]],
    checks: ["Account for low sample sizes.", "Keep alerts distinct from experiment analysis.", "Verify rollback removes canary traffic.", "Record decision evidence in the incident or release timeline."],
    mistakes: ["Sending only internal users to the canary.", "Comparing different time windows without seasonality context.", "Promoting after infrastructure metrics alone look healthy."],
    related: ["slo-burn-rate-alerting-guide.html", "grafana-dashboard-debugging-guide.html", "incident-timeline-template-guide.html"]
  },
  {
    file: "github-environment-protection-guide.html", category: "Safe Deployments", mode: "deploy", icon: "GH",
    h1: "GitHub Environment Protection Guide",
    summary: "Protect production deployments with GitHub environments, scoped secrets, reviewers, branch rules and concurrency controls.",
    keywords: "github environment protection deployment reviewers secrets concurrency",
    command: "workflow job -> protected environment -> approval -> scoped credentials -> deployment record",
    workflow: [["Create environment boundaries", "Separate production from preview and staging credentials and policies."], ["Restrict deployment sources", "Limit branches or tags that may target the protected environment."], ["Add human and automated gates", "Use required reviewers alongside tests, provenance and policy checks."], ["Control concurrency", "Prevent overlapping production deployments and define cancellation behavior."]],
    checks: ["Keep environment secrets narrower than repository secrets.", "Use OIDC for cloud credentials.", "Audit approval and deployment history.", "Document emergency access separately."],
    mistakes: ["Granting every workflow access to production secrets.", "Using approvals instead of automated verification.", "Allowing concurrent migrations from multiple runs."],
    related: ["github-actions-oidc-deployment-guide.html", "github-actions-env-secrets-guide.html", "static-site-deployment-checklist.html"]
  },
  {
    file: "zero-downtime-deployment-guide.html", category: "Safe Deployments", mode: "deploy", icon: "0DT",
    h1: "Zero-Downtime Deployment Guide",
    summary: "Design zero-downtime application releases with readiness gates, connection draining, backward-compatible data changes and observable rollback.",
    keywords: "zero downtime deployment guide readiness connection draining",
    command: "compatible schema -> new instances ready -> drain old traffic -> verify -> retire old version",
    workflow: [["Make state compatible", "Use expand-contract schemas and version-tolerant messages before replacing application instances."], ["Gate readiness", "Route traffic only after startup, dependency and warm-up checks pass."], ["Drain old instances", "Stop new work while allowing bounded requests, jobs and connections to finish."], ["Verify mixed-version behavior", "Observe errors, latency and data correctness while both versions are active."]],
    checks: ["Set a finite termination grace period.", "Make background jobs idempotent.", "Preserve rollback-compatible configuration.", "Test long-lived connections and queues."],
    mistakes: ["Using process started as readiness.", "Terminating old workers during active jobs.", "Deploying incompatible producers and consumers together."],
    related: ["database-migration-rollback-guide.html", "blue-green-deployment-checklist.html", "application-health-check-guide.html"]
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
  return `<header class="site-header global-topbar"><a class="global-brand" href="index.html" aria-label="Formalint home"><span class="global-logo" aria-hidden="true">{ }</span><strong>Formalint</strong><span class="global-local-badge"><i></i>Local-first (Zero-Server)</span></a><button class="global-command-trigger" type="button" data-open-command-palette><span>Command Palette, Transformers, Encoders...</span><kbd>Ctrl K</kbd></button><nav class="global-top-actions" aria-label="Primary navigation"><span class="global-sandbox-pill"><i></i>Local Sandbox: Ready</span><a href="guides.html">Guides</a><a href="forum.html">Forum</a><a href="tools.html">Docs</a><a href="https://github.com/EnsarKarayel/devkit" rel="noopener noreferrer">GitHub</a><a class="global-settings-link" href="about.html" aria-label="About and settings" title="About and settings">&#9881;</a></nav></header>`;
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
  const page = guidePages.concat(emailValidationPages, lintCleanupPages, apiReliabilityPages, observabilityPages, productionSecurityPages, runtimeDiagnosticsPages, databaseOperationsPages, safeDeploymentPages).find((item) => item.file === file);
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
    if (name !== "workspace.html") {
      html = html.replace(/<header class="site-header(?: global-topbar)?">[\s\S]*?<\/header>/, header(""));
    }
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
  const workspaceContent = sectionMarkup("workspace-title", "Developer workspace", "A local-first multi-tool workstation for active debugging", [{
    file: "workspace.html",
    h1: "All-in-One Developer Workspace",
    summary: "Format and inspect JSON, generate TypeScript and XML, test regex, convert timestamps, encode URLs and compute SHA-256 hashes without leaving the page."
  }]);
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint workspace section start -->",
    "      <!-- Formalint workspace section end -->",
    workspaceContent,
    '      <section class="directory-section" aria-labelledby="formatters-title" data-tools-section>'
  );
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
  const apiReliabilityContent = sectionMarkup("api-reliability-title", "API reliability", "Production API contracts, retries, signatures and delivery troubleshooting", apiReliabilityPages);
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint API reliability sections start -->",
    "      <!-- Formalint API reliability sections end -->",
    apiReliabilityContent,
    "      <!-- Formalint lint cleanup sections start -->"
  );
  const observabilityContent = sectionMarkup("telemetry-engineering-title", "Telemetry Engineering", "Tracing, metrics, dashboards, alerting and incident evidence", observabilityPages);
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint observability sections start -->",
    "      <!-- Formalint observability sections end -->",
    observabilityContent,
    "      <!-- Formalint API reliability sections start -->"
  );
  const productionSecurityContent = sectionMarkup("production-security-title", "Production Security", "SSH, firewall, TLS, container, Kubernetes and deployment identity troubleshooting", productionSecurityPages);
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint production security sections start -->",
    "      <!-- Formalint production security sections end -->",
    productionSecurityContent,
    "      <!-- Formalint observability sections start -->"
  );
  const runtimeDiagnosticsContent = sectionMarkup("runtime-diagnostics-title", "Runtime Diagnostics", "Python, Java and PHP runtime, dependency and test failures", runtimeDiagnosticsPages);
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint runtime diagnostics sections start -->",
    "      <!-- Formalint runtime diagnostics sections end -->",
    runtimeDiagnosticsContent,
    "      <!-- Formalint production security sections start -->"
  );
  const databaseOperationsContent = sectionMarkup("database-operations-title", "Database Operations", "Replication, connectivity, recovery, migrations and connection capacity", databaseOperationsPages);
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint database operations sections start -->",
    "      <!-- Formalint database operations sections end -->",
    databaseOperationsContent,
    "      <!-- Formalint runtime diagnostics sections start -->"
  );
  const safeDeploymentContent = sectionMarkup("safe-deployments-title", "Safe Deployments", "Container health, rollout diagnosis, release strategies and production gates", safeDeploymentPages);
  html = replaceOrInsertManagedBlock(
    html,
    "      <!-- Formalint safe deployment sections start -->",
    "      <!-- Formalint safe deployment sections end -->",
    safeDeploymentContent,
    "      <!-- Formalint database operations sections start -->"
  );
  fs.writeFileSync(file, html, "utf8");
}

function insertCardsBefore(fileName, marker) {
  const file = path.join(ROOT, fileName);
  let html = fs.readFileSync(file, "utf8");
  const additions = [{ file: "workspace.html", h1: "All-in-One Developer Workspace", summary: "Format JSON, inspect trees and use instant regex, epoch, URL and SHA-256 utilities in one local-first browser workspace." }, { file: forumPage.file, h1: forumPage.h1, summary: forumPage.summary }].concat(guidePages, emailValidationPages, lintCleanupPages, apiReliabilityPages, observabilityPages, productionSecurityPages, runtimeDiagnosticsPages, databaseOperationsPages, safeDeploymentPages);
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
  if (!js.includes('{ label: "All-in-One Workspace", href: "workspace.html"')) {
    js = js.replace(
      '      links: [\n        { label: "JSON Formatter", href: "index.html"',
      '      links: [\n        { label: "All-in-One Workspace", href: "workspace.html", icon: "{+}", description: "Keep JSON inspection, transforms and instant developer utilities in one local-first workstation.", keywords: "developer workspace json formatter tree regex epoch url sha256" },\n        { label: "JSON Formatter", href: "index.html"'
    );
  }
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
  const apiReliabilityLinks = apiReliabilityPages.map((page) => ({
    label: page.h1,
    href: page.file,
    icon: page.icon,
    description: page.summary,
    keywords: page.keywords
  }));
  const apiReliabilityGroup = `    {
      title: "API Reliability",
      mode: "api",
      description: "Debug API contracts, retries, limits, signatures, webhook delivery and TLS failures.",
      links: [
${apiReliabilityLinks.map((link) => `        { label: "${link.label.replace(/"/g, '\\"')}", href: "${link.href}", icon: "${link.icon}", description: "${link.description.replace(/"/g, '\\"')}", keywords: "${link.keywords}" }`).join(",\n")}
      ]
    },
`;
  const observabilityLinks = observabilityPages.map((page) => ({
    label: page.h1,
    href: page.file,
    icon: page.icon,
    description: page.summary,
    keywords: page.keywords
  }));
  const observabilityGroup = `    {
      title: "Telemetry Engineering",
      mode: "observe",
      description: "Connect traces, metrics, logs, alerts and incident evidence without leaking production data.",
      links: [
${observabilityLinks.map((link) => `        { label: "${link.label.replace(/"/g, '\\"')}", href: "${link.href}", icon: "${link.icon}", description: "${link.description.replace(/"/g, '\\"')}", keywords: "${link.keywords}" }`).join(",\n")}
      ]
    },
`;
  const productionSecurityLinks = productionSecurityPages.map((page) => ({
    label: page.h1,
    href: page.file,
    icon: page.icon,
    description: page.summary,
    keywords: page.keywords
  }));
  const productionSecurityGroup = `    {
      title: "Production Security",
      mode: "secure",
      description: "Troubleshoot access, network, certificate, container and deployment identity failures without weakening production controls.",
      links: [
${productionSecurityLinks.map((link) => `        { label: "${link.label.replace(/"/g, '\\"')}", href: "${link.href}", icon: "${link.icon}", description: "${link.description.replace(/"/g, '\\"')}", keywords: "${link.keywords}" }`).join(",\n")}
      ]
    },
`;
  const runtimeDiagnosticsLinks = runtimeDiagnosticsPages.map((page) => ({
    label: page.h1,
    href: page.file,
    icon: page.icon,
    description: page.summary,
    keywords: page.keywords
  }));
  const runtimeDiagnosticsGroup = `    {
      title: "Runtime Diagnostics",
      mode: "runtime",
      description: "Debug Python imports and dependencies, Java TLS and tests, and PHP web and Composer failures.",
      links: [
${runtimeDiagnosticsLinks.map((link) => `        { label: "${link.label.replace(/"/g, '\\"')}", href: "${link.href}", icon: "${link.icon}", description: "${link.description.replace(/"/g, '\\"')}", keywords: "${link.keywords}" }`).join(",\n")}
      ]
    },
`;
  const databaseOperationsLinks = databaseOperationsPages.map((page) => ({
    label: page.h1,
    href: page.file,
    icon: page.icon,
    description: page.summary,
    keywords: page.keywords
  }));
  const databaseOperationsGroup = `    {
      title: "Database Operations",
      mode: "database",
      description: "Diagnose replication, connectivity, restore readiness, schema rollouts and connection capacity with operational evidence.",
      links: [
${databaseOperationsLinks.map((link) => `        { label: "${link.label.replace(/"/g, '\\"')}", href: "${link.href}", icon: "${link.icon}", description: "${link.description.replace(/"/g, '\\"')}", keywords: "${link.keywords}" }`).join(",\n")}
      ]
    },
`;
  const safeDeploymentLinks = safeDeploymentPages.map((page) => ({ label: page.h1, href: page.file, icon: page.icon, description: page.summary, keywords: page.keywords }));
  const safeDeploymentGroup = `    {
      title: "Safe Deployments",
      mode: "deploy",
      description: "Debug rollout health and choose observable release strategies with explicit rollback gates.",
      links: [
${safeDeploymentLinks.map((link) => `        { label: "${link.label.replace(/"/g, '\\"')}", href: "${link.href}", icon: "${link.icon}", description: "${link.description.replace(/"/g, '\\"')}", keywords: "${link.keywords}" }`).join(",\n")}
      ]
    },
`;
  js = replaceOrInsertManagedBlock(
    js,
    "    // Formalint community groups start",
    "    // Formalint community groups end",
    group + emailGroup + lintGroup + apiReliabilityGroup + observabilityGroup + productionSecurityGroup + runtimeDiagnosticsGroup + databaseOperationsGroup + safeDeploymentGroup,
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
  if (!html.includes("253 Page Observability Update")) {
    const entry = `      <h2>September 17, 2026 - 253 Page Observability Update</h2>
      <p>Expanded Formalint to 253 public pages with eight production observability references covering OpenTelemetry trace debugging, Collector pipelines, Prometheus cardinality and alert rules, Grafana dashboards, log correlation IDs, SLO burn-rate alerting and evidence-based incident timelines. Updated internal links, tools discovery, sidebar navigation, cache version, sitemap and structured metadata validation.</p>
`;
    html = html.replace("      <h2>September 16, 2026 - Unified Product Navigation Update</h2>", entry + "      <h2>September 16, 2026 - Unified Product Navigation Update</h2>");
  }
  if (!html.includes("259 Page Production Security Update")) {
    const entry = `      <h2>September 19, 2026 - 259 Page Production Security Update</h2>
      <p>Expanded Formalint to 259 public pages with six practical production security guides covering SSH authentication, Linux firewall diagnosis, TLS certificate chains, container vulnerability triage, Kubernetes Secret delivery and GitHub Actions OIDC deployments. Updated internal links, tools discovery, sidebar navigation, cache version, sitemap and structured metadata validation while preserving the local-first forum and emoji workflow.</p>
`;
    html = html.replace("      <h2>September 17, 2026 - 253 Page Observability Update</h2>", entry + "      <h2>September 17, 2026 - 253 Page Observability Update</h2>");
  }
  if (!html.includes("265 Page Runtime Diagnostics Update")) {
    const entry = `      <h2>September 20, 2026 - 265 Page Runtime Diagnostics Update</h2>
      <p>Expanded Formalint to 265 public pages with six focused runtime troubleshooting guides for Python import and pip conflicts, Java TLS handshakes and Maven tests, and PHP 500 responses and Composer memory failures. Updated internal links, tools discovery, sidebar navigation, cache version, sitemap and structured metadata while retaining the local-first forum and emoji composer.</p>
`;
    html = html.replace("      <h2>September 19, 2026 - 259 Page Production Security Update</h2>", entry + "      <h2>September 19, 2026 - 259 Page Production Security Update</h2>");
  }
  if (!html.includes("271 Page Database Operations Update")) {
    const entry = `      <h2>September 21, 2026 - 271 Page Database Operations Update</h2>
      <p>Expanded Formalint to 271 public pages with six evidence-driven database operations guides covering PostgreSQL and MySQL replication lag, PostgreSQL connection refusal, backup restore verification, migration rollback planning and connection pool exhaustion. Updated internal links, tools discovery, sidebar navigation, cache version, sitemap and structured metadata while preserving the local-first forum and emoji composer.</p>
`;
    html = html.replace("      <h2>September 20, 2026 - 265 Page Runtime Diagnostics Update</h2>", entry + "      <h2>September 20, 2026 - 265 Page Runtime Diagnostics Update</h2>");
  }
  if (!html.includes("277 Page Safe Deployments Update")) {
    const entry = `      <h2>September 24, 2026 - 277 Page Safe Deployments Update</h2>
      <p>Expanded Formalint to 277 public pages with six practical deployment references covering Docker healthchecks, stuck Kubernetes rollouts, blue-green and canary releases, GitHub environment protections and zero-downtime deployments. Updated internal links, tools discovery, sidebar navigation, cache version, sitemap and structured metadata while preserving the local-first forum and emoji composer.</p>
`;
    html = html.replace("      <h2>September 21, 2026 - 271 Page Database Operations Update</h2>", entry + "      <h2>September 21, 2026 - 271 Page Database Operations Update</h2>");
  }
  if (!html.includes("Unified Product Navigation Update")) {
    const entry = `      <h2>September 16, 2026 - Unified Product Navigation Update</h2>
      <p>Unified the navigation across Formalint's public library with the all-in-one workspace product bar: shared brand and local-first status, a working command palette trigger, sandbox readiness, direct Workspace, Guides, Docs and GitHub routes, consistent settings access and responsive mobile behavior. The generator now preserves this shared navigation for every future page.</p>
`;
    html = html.replace("      <h2>September 16, 2026 - Workspace Interaction Update</h2>", entry + "      <h2>September 16, 2026 - Workspace Interaction Update</h2>");
  }
  if (!html.includes("Workspace Interaction Update")) {
    const entry = `      <h2>September 16, 2026 - Workspace Interaction Update</h2>
      <p>Improved the all-in-one developer workspace with JSON syntax highlighting, padded line numbers, automatic bracket and quote pairing, bidirectional Epoch and ISO-8601 conversion, a collapsible locally remembered sidebar and a corrected keyboard shortcut for copying inspector output. Payload values remain in browser memory and are never added to analytics events, URLs or server requests.</p>
`;
    html = html.replace("      <h2>September 16, 2026 - 245 Page API Reliability Update</h2>", entry + "      <h2>September 16, 2026 - 245 Page API Reliability Update</h2>");
  }
  if (!html.includes("245 Page API Reliability Update")) {
    const entry = `      <h2>September 16, 2026 - 245 Page API Reliability Update</h2>
      <p>Expanded Formalint to 245 public pages with eight production-focused API references covering schema drift, retry and exponential backoff, rate-limit headers, webhook replay, HMAC request signing, cURL TLS troubleshooting, OpenAPI breaking changes and stable API error response design. Updated internal discovery, tools directory, sidebar navigation, cache version, sitemap and structured metadata checks.</p>
`;
    html = html.replace("      <h2>September 15, 2026 - All-in-One Developer Workspace Update</h2>", entry + "      <h2>September 15, 2026 - All-in-One Developer Workspace Update</h2>");
  }
  if (!html.includes("All-in-One Developer Workspace Update")) {
    const entry = `      <h2>September 15, 2026 - All-in-One Developer Workspace Update</h2>
      <p>Added a dense local-first workstation that combines JSON formatting, validation, interactive tree inspection, JSONPath selection, TypeScript and schema generation, YAML and XML transforms, regex matching, epoch conversion, URL encoding and SHA-256 hashing. Added keyboard commands, file loading, exports, privacy documentation links, tools discovery, sidebar navigation and sitemap coverage.</p>
`;
    html = html.replace("      <h2>September 15, 2026 - 236 Page Lint and Cleanup Update</h2>", entry + "      <h2>September 15, 2026 - 236 Page Lint and Cleanup Update</h2>");
  }
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
  const newPageFiles = new Set(["workspace.html", forumPage.file].concat(guidePages.map((page) => page.file), emailValidationPages.map((page) => page.file), lintCleanupPages.map((page) => page.file), apiReliabilityPages.map((page) => page.file), observabilityPages.map((page) => page.file), productionSecurityPages.map((page) => page.file), runtimeDiagnosticsPages.map((page) => page.file), databaseOperationsPages.map((page) => page.file), safeDeploymentPages.map((page) => page.file)));
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
apiReliabilityPages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), referencePage(page), "utf8"));
observabilityPages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), referencePage(page), "utf8"));
productionSecurityPages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), referencePage(page), "utf8"));
runtimeDiagnosticsPages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), referencePage(page), "utf8"));
databaseOperationsPages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), referencePage(page), "utf8"));
safeDeploymentPages.forEach((page) => fs.writeFileSync(path.join(ROOT, page.file), referencePage(page), "utf8"));
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
