const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CACHE_VERSION = "20260901-library-124";
const LIBRARY_COUNT = 124;
const TODAY = "2026-09-01";

const pages = [
  {
    file: "regex-phone-number-guide.html",
    category: "Regex Lab",
    mode: "regex",
    icon: "TEL",
    title: "Phone Number Regex Validation Guide | Formalint",
    h1: "Phone Number Regex Validation Guide",
    description: "Learn practical phone number regex validation for forms, imports and support tools, with examples, limits and safer normalization notes.",
    summary: "Validate phone-shaped input without pretending regex can prove a reachable number.",
    keywords: "phone regex phone number regex validation javascript international phone form validation",
    commandTitle: "Starter patterns to test",
    command: String.raw`# Simple UI-level shape check
^\+?[0-9][0-9 .()-]{6,24}$

# Digits after normalization
^\+?[1-9][0-9]{7,14}$`,
    workflow: [
      ["Capture the product rule", "Decide whether the field accepts local numbers, country codes or only international format."],
      ["Normalize before storage", "Remove spaces, parentheses and dashes only after you know which characters are allowed."],
      ["Validate in layers", "Use regex for shape, then use product rules or verification flows for ownership and reachability."]
    ],
    checklist: [
      "Keep the pattern readable enough for another developer to review.",
      "Test copied values with spaces, hyphens, parentheses and leading plus signs.",
      "Do not strip a leading zero unless your country-specific rule explicitly says so.",
      "Store the normalized value separately from the display value when user experience matters.",
      "Treat phone verification, SMS delivery and fraud checks as separate systems."
    ],
    pitfalls: "The biggest mistake is trying to make one global phone regex decide every country rule. That creates support friction and still does not prove the number receives messages.",
    faqs: [
      ["Should a phone regex allow spaces?", "For a user-facing field, yes in many products. Normalize whitespace after capture so people can paste numbers naturally."],
      ["Can regex verify a real phone number?", "No. Regex can check shape. Reachability needs confirmation, carrier lookup, SMS delivery or a business verification process."]
    ],
    related: ["regex-tester.html", "regex-examples.html", "developer-data-validation-guide.html"]
  },
  {
    file: "regex-password-validation-guide.html",
    category: "Regex Lab",
    mode: "regex",
    icon: "PASS",
    title: "Password Regex Validation Guide | Formalint",
    h1: "Password Regex Validation Guide",
    description: "Use password regex carefully for length and composition checks, with safer guidance for UX, security and server-side validation.",
    summary: "Design password checks that help users without creating fragile security theater.",
    keywords: "password regex validation javascript password policy regular expression security checklist",
    commandTitle: "Example composition pattern",
    command: String.raw`# At least 12 chars, one lowercase, one uppercase, one number
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$`,
    workflow: [
      ["Prefer length first", "Longer passwords usually matter more than a complicated symbol rule."],
      ["Explain the rule", "Show users exactly which requirement is missing instead of saying invalid password."],
      ["Repeat on the server", "Client-side checks improve feedback, but server-side validation owns enforcement."]
    ],
    checklist: [
      "Set a minimum length that matches your product risk.",
      "Allow pasted passwords and password-manager generated values.",
      "Do not silently trim passwords unless the policy documents it.",
      "Check breached-password lists separately when your stack supports it.",
      "Rate-limit signup, login and reset endpoints."
    ],
    pitfalls: "A strict regex can reject strong password-manager values while allowing predictable human patterns. Keep policy simple and pair it with rate limiting and secure storage.",
    faqs: [
      ["Should symbols be required?", "Only if your policy really needs it. A high minimum length with password-manager support is often easier for users."],
      ["Is a password regex a security control?", "It is only one validation rule. Hashing, storage, rate limits, MFA and reset flows matter more."]
    ],
    related: ["regex-lookahead-lookbehind-guide.html", "http-security-headers-checklist.html", "developer-data-validation-guide.html"]
  },
  {
    file: "regex-ip-address-validator.html",
    category: "Regex Lab",
    mode: "regex",
    icon: "IP",
    title: "IP Address Regex Validator Guide | Formalint",
    h1: "IP Address Regex Validator Guide",
    description: "Validate IPv4-shaped strings with regex, learn where range checks belong and avoid confusing text matching with network reachability.",
    summary: "Check IPv4 string shape before using network tools or address parsers.",
    keywords: "ip address regex ipv4 regex validator network debugging regular expression",
    commandTitle: "IPv4 regex pattern",
    command: String.raw`^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$`,
    workflow: [
      ["Match shape", "Use regex to catch obvious non-address strings in forms and logs."],
      ["Parse for meaning", "Use a real parser when CIDR ranges, IPv6, private ranges or subnet math matter."],
      ["Test reachability separately", "Use ping, curl, Test-NetConnection or nc only after the value is trusted enough to probe."]
    ],
    checklist: [
      "Test 0.0.0.0, 127.0.0.1, 192.168.1.1 and 255.255.255.255.",
      "Reject octets above 255.",
      "Decide whether leading zeros are allowed.",
      "Do not use regex alone for firewall or access-control decisions.",
      "Document whether IPv6 is out of scope."
    ],
    pitfalls: "IPv4 regex is useful for log filters and simple inputs, but it does not know route ownership, DNS, firewall state or whether the host is alive.",
    faqs: [
      ["Should one regex validate IPv4 and IPv6?", "For maintainability, usually no. Treat IPv4 and IPv6 as separate cases unless a library owns parsing."],
      ["Can this prove the host exists?", "No. It only validates the string shape."]
    ],
    related: ["dns-debugging-guide.html", "powershell-network-debugging-guide.html", "linux-admin-command-guide.html"]
  },
  {
    file: "regex-slug-validator.html",
    category: "Regex Lab",
    mode: "regex",
    icon: "SLUG",
    title: "Slug Regex Validator Guide | Formalint",
    h1: "Slug Regex Validator Guide",
    description: "Create and validate URL slugs for docs, blogs and tools with practical regex rules, examples and collision handling notes.",
    summary: "Keep public URLs clean, readable and predictable.",
    keywords: "slug regex url slug validator javascript seo friendly urls",
    commandTitle: "Common slug pattern",
    command: String.raw`^[a-z0-9]+(?:-[a-z0-9]+)*$`,
    workflow: [
      ["Normalize the title", "Lowercase text, remove unsupported punctuation and collapse whitespace to hyphens."],
      ["Validate the final slug", "Reject empty strings, double hyphens and leading or trailing hyphens."],
      ["Handle collisions", "Use a unique suffix or database constraint so two pages never share one slug."]
    ],
    checklist: [
      "Keep slugs short enough to scan in search results and logs.",
      "Do not put dates, versions or IDs in every slug unless they help users.",
      "Redirect old slugs when a published title changes.",
      "Avoid mixing uppercase and lowercase routes on static hosting.",
      "Store the original title separately from the URL slug."
    ],
    pitfalls: "A valid-looking slug can still point to the wrong content. Validation controls shape; routing and canonical URLs control meaning.",
    faqs: [
      ["Should slugs include underscores?", "Hyphens are easier to read in URLs and are the common choice for public pages."],
      ["Can slugs improve SEO?", "Readable slugs can help users understand a URL, but useful content and clear titles matter more."]
    ],
    related: ["url-encoder-decoder.html", "tools.html", "editorial-policy.html"]
  },
  {
    file: "regex-hex-color-validator.html",
    category: "Regex Lab",
    mode: "regex",
    icon: "HEX",
    title: "HEX Color Regex Validator Guide | Formalint",
    h1: "HEX Color Regex Validator Guide",
    description: "Validate HEX color strings with regex and understand shorthand, alpha channel and design-token review rules.",
    summary: "Check color strings before converting them into RGB or HSL.",
    keywords: "hex color regex validator css color regex hex rgb hsl",
    commandTitle: "HEX color patterns",
    command: String.raw`# 3 or 6 digit HEX
^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$

# 3, 4, 6 or 8 digit HEX including alpha
^#?(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`,
    workflow: [
      ["Choose accepted formats", "Decide whether the hash sign, shorthand and alpha values are allowed."],
      ["Validate first", "Reject invalid characters before conversion."],
      ["Convert for display", "Use a color converter after the string is trusted."]
    ],
    checklist: [
      "Test lowercase and uppercase letters.",
      "Document whether three-digit shorthand is expanded.",
      "Do not accept arbitrary CSS color functions if the field expects HEX only.",
      "Check contrast separately for UI accessibility.",
      "Normalize stored values to one format."
    ],
    pitfalls: "HEX validation cannot tell whether a color is readable, accessible or on brand. It only proves the string is a valid color notation.",
    faqs: [
      ["Should the hash sign be required?", "For CSS copy-paste fields, requiring # is clearer. For data imports, accepting both forms can be friendlier."],
      ["Does HEX include transparency?", "Eight-digit HEX can encode alpha, but not every design workflow allows it."]
    ],
    related: ["color-converter.html", "regex-examples.html", "developer-data-validation-guide.html"]
  },
  {
    file: "javascript-regex-match-vs-test.html",
    category: "Regex Lab",
    mode: "regex",
    icon: "JS",
    title: "JavaScript Regex match vs test Guide | Formalint",
    h1: "JavaScript Regex match vs test Guide",
    description: "Understand when to use RegExp.test, String.match, matchAll and exec in JavaScript regex debugging and validation workflows.",
    summary: "Choose the right JavaScript regex method before trusting a result.",
    keywords: "javascript regex match vs test regexp test string match matchall exec regex guide",
    commandTitle: "Method comparison",
    command: String.raw`const pattern = /\bERROR\b/g;
pattern.test("ERROR 500");
"ERROR 500".match(pattern);
[..."ERROR 500 ERROR 401".matchAll(/\bERROR\b/g)];`,
    workflow: [
      ["Use test for yes or no", "RegExp.test is good when validation only needs a boolean answer."],
      ["Use match for values", "String.match is useful when you need matched text but not a full iterator."],
      ["Use matchAll for groups", "matchAll is easier to read when global matches and capture groups both matter."]
    ],
    checklist: [
      "Be careful with the global flag and repeated test calls.",
      "Reset lastIndex when reusing global regex objects.",
      "Prefer named groups when extracted values have business meaning.",
      "Keep validation regex separate from extraction regex when possible.",
      "Test empty strings and long strings."
    ],
    pitfalls: "The global flag can make repeated test calls look inconsistent because RegExp objects track lastIndex. That bug is small, common and wonderfully annoying.",
    faqs: [
      ["Is test faster than match?", "For simple validation it is usually the cleaner choice, but readability and correct state handling matter more."],
      ["When should I use exec?", "Use exec when you intentionally need low-level iteration and understand lastIndex behavior."]
    ],
    related: ["javascript-regex-cheatsheet.html", "regex-tester.html", "regex-performance-guide.html"]
  },
  {
    file: "json-escape-unescape-guide.html",
    category: "Data Formatting",
    mode: "data",
    icon: "ESC",
    title: "JSON Escape and Unescape Guide | Formalint",
    h1: "JSON Escape and Unescape Guide",
    description: "Understand escaped quotes, backslashes, newlines and Unicode sequences in JSON strings before debugging API payloads.",
    summary: "Read JSON string escaping without breaking valid payloads.",
    keywords: "json escape unescape escaped quotes backslash newline unicode api payload",
    commandTitle: "Escaped JSON examples",
    command: String.raw`{
  "message": "Line one\nLine two",
  "path": "C:\\temp\\report.json",
  "quote": "She said \"ok\""
}`,
    workflow: [
      ["Format first", "Use a JSON formatter to separate object structure from escaped string content."],
      ["Decode carefully", "Unescape only the nested string you intend to inspect."],
      ["Preserve meaning", "Do not remove backslashes from a payload unless the receiving parser expects raw text."]
    ],
    checklist: [
      "Check whether the value is JSON or a JSON string containing JSON.",
      "Look for newline, tab, quote and backslash escapes.",
      "Keep sample data free of secrets before using browser tools.",
      "Validate the final JSON after any manual edit.",
      "Document where double-encoding entered the workflow."
    ],
    pitfalls: "Many API debugging sessions go sideways because a JSON string containing JSON is mistaken for a normal object. Fix the layer, not just the slash.",
    faqs: [
      ["Why do I see many backslashes?", "The value may be a serialized JSON string inside another JSON object."],
      ["Should I unescape before sending?", "Only if the API contract expects raw nested JSON instead of a string value."]
    ],
    related: ["index.html", "json-formatting-guide.html", "api-debugging-handbook.html"]
  },
  {
    file: "json-lines-ndjson-guide.html",
    category: "Data Formatting",
    mode: "data",
    icon: "NDJ",
    title: "JSON Lines and NDJSON Guide | Formalint",
    h1: "JSON Lines and NDJSON Guide",
    description: "Learn how JSON Lines and NDJSON differ from a single JSON array, and how to validate logs, streams and exports safely.",
    summary: "Debug newline-delimited JSON exports without wrapping everything by instinct.",
    keywords: "json lines ndjson newline delimited json logs streaming export validation",
    commandTitle: "NDJSON sample",
    command: String.raw`{"level":"info","message":"job started"}
{"level":"warn","message":"retry scheduled"}
{"level":"info","message":"job finished"}`,
    workflow: [
      ["Validate each line", "Every non-empty line should be an independent JSON object."],
      ["Keep order meaningful", "Streaming exports often depend on sequence and timestamps."],
      ["Convert only when needed", "Wrap lines into an array for tools that require one JSON document."]
    ],
    checklist: [
      "Reject blank lines or decide how the importer handles them.",
      "Do not add commas between NDJSON records.",
      "Check that each line has the same expected fields when importing.",
      "Keep large log samples small before pasting into web tools.",
      "Record whether the file extension is .jsonl or .ndjson."
    ],
    pitfalls: "A valid NDJSON file is not valid as one normal JSON document. That is expected, not broken.",
    faqs: [
      ["Can I format NDJSON with a JSON formatter?", "Only one line at a time unless the tool specifically supports NDJSON."],
      ["Why use NDJSON?", "It is convenient for logs, streams and large exports because each line can be processed independently."]
    ],
    related: ["json-diff.html", "regex-log-parser.html", "csv-to-json.html"]
  },
  {
    file: "api-401-403-debugging-guide.html",
    category: "API Debugging",
    mode: "api",
    icon: "401",
    title: "API 401 vs 403 Debugging Guide | Formalint",
    h1: "API 401 vs 403 Debugging Guide",
    description: "Debug 401 Unauthorized and 403 Forbidden API responses with headers, tokens, scopes, roles and gateway evidence.",
    summary: "Separate missing authentication from denied authorization.",
    keywords: "401 403 api debugging unauthorized forbidden jwt oauth bearer token scope role",
    commandTitle: "curl evidence to capture",
    command: String.raw`curl -i https://api.example.com/resource \
  -H "Authorization: Bearer TOKEN" \
  -H "Accept: application/json"`,
    workflow: [
      ["Read the status literally", "401 usually means authentication is missing or invalid; 403 usually means identity is known but not allowed."],
      ["Capture auth headers", "Check WWW-Authenticate, request Authorization and any gateway error metadata."],
      ["Compare identity to permission", "Decode safe token samples, then verify scopes, roles, tenant and resource ownership."]
    ],
    checklist: [
      "Confirm the token is being sent to the same host that validates it.",
      "Check expiration, issuer, audience and clock skew.",
      "Compare the failing user with a known working user.",
      "Inspect gateway, application and identity-provider logs separately.",
      "Never paste real bearer tokens into browser tools or chat logs."
    ],
    pitfalls: "Teams often rotate tokens when the real problem is a missing scope or tenant mismatch. The status code is a clue, not the full diagnosis.",
    faqs: [
      ["Can a 403 be fixed by logging in again?", "Sometimes, but only if the session lost permission context. Usually the role or resource rule must be checked."],
      ["Should APIs reveal why access failed?", "Enough detail for debugging is useful, but public responses should avoid leaking sensitive authorization rules."]
    ],
    related: ["oauth-jwt-debugging-checklist.html", "jwt-decoder.html", "api-debugging-checklist.html"]
  },
  {
    file: "api-timeout-debugging-guide.html",
    category: "API Debugging",
    mode: "api",
    icon: "TIME",
    title: "API Timeout Debugging Guide | Formalint",
    h1: "API Timeout Debugging Guide",
    description: "Debug API timeouts by separating client timeout, DNS, TLS, gateway, upstream service, database and retry behavior.",
    summary: "Turn vague timeout reports into ordered evidence.",
    keywords: "api timeout debugging gateway timeout client timeout curl timing dns tls upstream database",
    commandTitle: "curl timing template",
    command: String.raw`curl -o /dev/null -s -w \
"dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} start=%{time_starttransfer} total=%{time_total}\n" \
https://api.example.com/health`,
    workflow: [
      ["Measure phases", "Separate DNS, TCP connect, TLS negotiation, first byte and total time."],
      ["Find the owner", "A timeout may belong to the browser, API client, CDN, proxy, service or database."],
      ["Control retries", "Make sure clients do not multiply load while the system is already slow."]
    ],
    checklist: [
      "Record the exact timeout value and which layer set it.",
      "Compare health checks with the slow endpoint.",
      "Check gateway logs and upstream service logs with the same timestamp.",
      "Look for database locks, slow queries and exhausted connection pools.",
      "Avoid raising every timeout before understanding the bottleneck."
    ],
    pitfalls: "Increasing the timeout can hide the symptom while users still wait too long. The useful question is where the time is being spent.",
    faqs: [
      ["Is a 504 the same as a timeout?", "A 504 is a gateway reporting that an upstream did not respond in time. The root cause may be deeper."],
      ["Should clients retry timeouts?", "Only when the operation is safe to repeat or has an idempotency key."]
    ],
    related: ["nginx-502-504-debugging-guide.html", "api-idempotency-retry-guide.html", "postgresql-lock-debugging-guide.html"]
  },
  {
    file: "jwt-expiration-debugging.html",
    category: "API Debugging",
    mode: "api",
    icon: "EXP",
    title: "JWT Expiration Debugging Guide | Formalint",
    h1: "JWT Expiration Debugging Guide",
    description: "Debug JWT exp, iat and nbf claims, clock skew, refresh-token behavior and safe token inspection practices.",
    summary: "Understand token time claims without exposing real credentials.",
    keywords: "jwt expiration debugging exp iat nbf clock skew refresh token bearer token",
    commandTitle: "Claims to inspect",
    command: String.raw`{
  "iat": 1798790400,
  "nbf": 1798790400,
  "exp": 1798794000,
  "iss": "https://auth.example.com",
  "aud": "formalint-api"
}`,
    workflow: [
      ["Decode only safe samples", "Use redacted or development tokens when inspecting claims."],
      ["Convert timestamps", "Translate exp, iat and nbf into the same timezone as your logs."],
      ["Check refresh behavior", "An access token expiring normally should trigger a documented refresh flow."]
    ],
    checklist: [
      "Compare browser time, server time and identity-provider time.",
      "Check whether nbf is in the future.",
      "Verify issuer and audience before blaming expiration.",
      "Look for cached expired tokens in local storage, cookies or memory.",
      "Never log complete production JWTs."
    ],
    pitfalls: "JWT expiration bugs often look random because one server has clock skew or a frontend keeps using an old token after refresh fails.",
    faqs: [
      ["What does exp mean?", "It is the timestamp after which the token should not be accepted."],
      ["Can I extend exp on the client?", "No. Token lifetime is signed by the issuer and must be changed in the identity system."]
    ],
    related: ["jwt-decoder.html", "timestamp-converter.html", "oauth-jwt-debugging-checklist.html"]
  },
  {
    file: "sql-join-debugging-guide.html",
    category: "Database Operations",
    mode: "db",
    icon: "JOIN",
    title: "SQL JOIN Debugging Guide | Formalint",
    h1: "SQL JOIN Debugging Guide",
    description: "Debug SQL JOIN queries by checking row multiplication, missing rows, join keys, null behavior and readable query structure.",
    summary: "Find why a JOIN returns too many, too few or duplicated rows.",
    keywords: "sql join debugging inner join left join duplicate rows missing rows query guide",
    commandTitle: "JOIN debugging sketch",
    command: String.raw`SELECT a.id, COUNT(*) AS matched_rows
FROM accounts a
LEFT JOIN orders o ON o.account_id = a.id
GROUP BY a.id
ORDER BY matched_rows DESC;`,
    workflow: [
      ["Start with counts", "Measure row counts before and after each join."],
      ["Check key uniqueness", "A join key that is not unique can multiply rows unexpectedly."],
      ["Move filters deliberately", "A WHERE filter on a right-side table can turn a LEFT JOIN into inner-join behavior."]
    ],
    checklist: [
      "Format the query before changing it.",
      "Run each join one at a time with row counts.",
      "Check null keys on both sides.",
      "Confirm whether the relationship is one-to-one, one-to-many or many-to-many.",
      "Keep performance tuning separate from correctness debugging."
    ],
    pitfalls: "The most common JOIN bug is not syntax. It is assuming a relationship is unique when the data says otherwise.",
    faqs: [
      ["Why does LEFT JOIN lose rows?", "A WHERE clause may filter the joined table after the join. Move conditions into the ON clause when needed."],
      ["Why are rows duplicated?", "The join key probably matches more than one row on the joined side."]
    ],
    related: ["sql-formatter.html", "sql-cleanup.html", "postgresql-index-debugging-guide.html"]
  },
  {
    file: "sql-where-clause-debugging.html",
    category: "Database Operations",
    mode: "db",
    icon: "WHERE",
    title: "SQL WHERE Clause Debugging Guide | Formalint",
    h1: "SQL WHERE Clause Debugging Guide",
    description: "Debug SQL WHERE clauses with parentheses, AND/OR precedence, null checks, date ranges and safer review habits.",
    summary: "Stop tiny WHERE mistakes from becoming wrong reports.",
    keywords: "sql where clause debugging and or precedence null date range query filter",
    commandTitle: "Safer condition shape",
    command: String.raw`WHERE status = 'active'
  AND created_at >= '2026-09-01'
  AND created_at < '2026-10-01'
  AND (region = 'EU' OR region = 'US')`,
    workflow: [
      ["Format conditions vertically", "One condition per line makes precedence visible."],
      ["Use explicit parentheses", "Never make reviewers remember AND/OR precedence under pressure."],
      ["Prefer half-open date ranges", "Use >= start and < next boundary for timestamp columns."]
    ],
    checklist: [
      "Check NULL with IS NULL or IS NOT NULL.",
      "Avoid wrapping indexed columns in functions before checking the query plan.",
      "Verify timezone assumptions for date filters.",
      "Run before and after counts.",
      "Write a tiny sample table when logic is hard to see."
    ],
    pitfalls: "A WHERE clause can be syntactically valid and still tell a completely different business story than intended.",
    faqs: [
      ["Should I always add parentheses?", "When AND and OR mix, yes. It is cheap clarity."],
      ["Why do date filters miss records?", "Inclusive end dates often miss timestamps later in the day. Half-open ranges are safer."]
    ],
    related: ["sql-formatting-guide.html", "sql-join-debugging-guide.html", "mysql-slow-query-debugging-guide.html"]
  },
  {
    file: "sql-injection-prevention-checklist.html",
    category: "Security",
    mode: "security",
    icon: "SQLI",
    title: "SQL Injection Prevention Checklist | Formalint",
    h1: "SQL Injection Prevention Checklist",
    description: "Review parameterized queries, escaping boundaries, ORM raw SQL, logging and testing habits that reduce SQL injection risk.",
    summary: "Keep SQL cleanup separate from SQL injection prevention.",
    keywords: "sql injection prevention checklist parameterized queries prepared statements orm raw sql security",
    commandTitle: "Parameterized query shape",
    command: String.raw`-- Good shape: values are bound, not concatenated
SELECT id, email
FROM users
WHERE email = ?;`,
    workflow: [
      ["Bind values", "Use prepared statements or framework parameters instead of string concatenation."],
      ["Review raw SQL", "ORM escape hatches deserve the same attention as hand-written queries."],
      ["Keep logs safe", "Do not log secrets or full user-provided payloads while debugging security cases."]
    ],
    checklist: [
      "Never build WHERE clauses by concatenating user input.",
      "Validate identifiers separately from values.",
      "Use least-privilege database accounts.",
      "Add tests for quotes, comments and unexpected operators.",
      "Treat formatting tools as readability helpers, not security controls."
    ],
    pitfalls: "A formatted SQL string can still be injectable. Formatting improves review; parameter binding changes execution safety.",
    faqs: [
      ["Can escaping alone prevent SQL injection?", "Escaping is easy to get wrong. Parameterized queries are the normal safer default."],
      ["Are ORMs always safe?", "No. Raw query APIs and dynamic identifiers still need careful review."]
    ],
    related: ["sql-cleanup.html", "http-security-headers-checklist.html", "developer-data-validation-guide.html"]
  },
  {
    file: "postgresql-vacuum-analyze-guide.html",
    category: "Database Operations",
    mode: "db",
    icon: "VAC",
    title: "PostgreSQL VACUUM and ANALYZE Guide | Formalint",
    h1: "PostgreSQL VACUUM and ANALYZE Guide",
    description: "Understand PostgreSQL VACUUM, ANALYZE, table bloat, planner statistics and safe DBA checks before changing maintenance settings.",
    summary: "Read PostgreSQL maintenance symptoms before tuning blindly.",
    keywords: "postgresql vacuum analyze guide table bloat autovacuum planner statistics dba",
    commandTitle: "Read-only maintenance checks",
    command: String.raw`SELECT schemaname, relname, n_live_tup, n_dead_tup, last_vacuum, last_autovacuum, last_analyze, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 20;`,
    workflow: [
      ["Inspect stats first", "Look at dead tuples and last maintenance timestamps before making changes."],
      ["Separate VACUUM from ANALYZE", "VACUUM reclaims dead row space for reuse; ANALYZE refreshes planner statistics."],
      ["Change slowly", "Autovacuum tuning belongs in measured maintenance, not panic edits."]
    ],
    checklist: [
      "Check pg_stat_user_tables before and after maintenance.",
      "Look for long transactions preventing cleanup.",
      "Review table size and index size together.",
      "Avoid VACUUM FULL in production without a lock plan.",
      "Record exact commands and timestamps."
    ],
    pitfalls: "The loud symptom may be a slow query, but the quiet cause can be stale statistics or a long transaction blocking cleanup.",
    faqs: [
      ["Does VACUUM shrink the file immediately?", "Normal VACUUM makes space reusable. VACUUM FULL rewrites and locks more aggressively."],
      ["When does ANALYZE help?", "When planner statistics are stale and query plans stop matching real data distribution."]
    ],
    related: ["postgresql-dba-checklist.html", "postgresql-lock-debugging-guide.html", "postgresql-index-debugging-guide.html"]
  },
  {
    file: "mysql-index-debugging-guide.html",
    category: "Database Operations",
    mode: "db",
    icon: "MYI",
    title: "MySQL Index Debugging Guide | Formalint",
    h1: "MySQL Index Debugging Guide",
    description: "Debug MySQL index usage with EXPLAIN, rows examined, composite index order and slow query evidence.",
    summary: "Use evidence before adding another index.",
    keywords: "mysql index debugging explain composite index rows examined slow query guide",
    commandTitle: "Index evidence commands",
    command: String.raw`EXPLAIN SELECT *
FROM orders
WHERE customer_id = 42
  AND created_at >= '2026-09-01';

SHOW INDEX FROM orders;`,
    workflow: [
      ["Read EXPLAIN", "Check possible_keys, key, rows and filtered before changing schema."],
      ["Match index order", "Composite indexes work best when their leftmost columns match common filters."],
      ["Measure write cost", "Each new index can slow inserts and updates."]
    ],
    checklist: [
      "Format the query before reading the plan.",
      "Compare estimated rows with actual business expectations.",
      "Check selectivity of leading index columns.",
      "Avoid duplicate or nearly duplicate indexes.",
      "Test on production-like data volume before celebrating."
    ],
    pitfalls: "Adding indexes without reading query shape can create maintenance cost without improving the slow endpoint.",
    faqs: [
      ["Why is MySQL not using my index?", "The optimizer may estimate that another path is cheaper, or the index order does not match the filter."],
      ["Should every foreign key have an index?", "Often yes for joins and deletes, but verify workload and schema rules."]
    ],
    related: ["mysql-dba-checklist.html", "mysql-slow-query-debugging-guide.html", "sql-join-debugging-guide.html"]
  },
  {
    file: "redis-memory-debugging-guide.html",
    category: "Database Operations",
    mode: "db",
    icon: "RAM",
    title: "Redis Memory Debugging Guide | Formalint",
    h1: "Redis Memory Debugging Guide",
    description: "Debug Redis memory pressure with INFO, maxmemory policy, keyspace evidence, big keys and safer cache incident notes.",
    summary: "Find Redis memory pressure before deleting keys in a hurry.",
    keywords: "redis memory debugging info memory maxmemory policy big keys cache incident",
    commandTitle: "Redis memory checks",
    command: String.raw`redis-cli INFO memory
redis-cli CONFIG GET maxmemory
redis-cli CONFIG GET maxmemory-policy
redis-cli --bigkeys`,
    workflow: [
      ["Capture memory first", "Save used_memory, maxmemory and policy before changes."],
      ["Find key patterns", "Look for large keys, unbounded prefixes and missing TTLs."],
      ["Protect production", "Avoid expensive scans during peak traffic without a plan."]
    ],
    checklist: [
      "Check eviction policy and whether evictions are happening.",
      "Inspect TTL coverage for cache keys.",
      "Look for sudden client growth or connection leaks.",
      "Measure big keys in a safe window.",
      "Confirm whether Redis is cache, queue, session store or primary data."
    ],
    pitfalls: "Deleting a big key can fix memory briefly while the application immediately recreates it. Find the producing code path.",
    faqs: [
      ["Is Redis memory high always bad?", "Not necessarily. Redis is designed to use memory, but maxmemory, eviction and growth rate matter."],
      ["Should I run KEYS in production?", "Avoid it on large instances. Prefer safer scanning and controlled diagnostics."]
    ],
    related: ["redis-debugging-checklist.html", "hardware-diagnostics-guide.html", "api-timeout-debugging-guide.html"]
  },
  {
    file: "docker-container-logs-guide.html",
    category: "Shell and Ops",
    mode: "ops",
    icon: "LOGS",
    title: "Docker Container Logs Guide | Formalint",
    h1: "Docker Container Logs Guide",
    description: "Use docker logs, timestamps, tailing, service names and Compose context to debug containerized applications safely.",
    summary: "Read container logs without losing service context.",
    keywords: "docker logs container logs docker compose logs tail timestamps debugging guide",
    commandTitle: "Log commands",
    command: String.raw`docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
docker logs --tail 100 --timestamps container-name
docker logs -f --since 10m container-name
docker compose logs --tail 120 api`,
    workflow: [
      ["Identify the container", "Use names, status and ports before opening logs."],
      ["Limit output", "Start with tail and since filters to avoid drowning in old noise."],
      ["Correlate timestamps", "Compare container logs with API client, proxy and database timestamps."]
    ],
    checklist: [
      "Check whether the container is restarting.",
      "Use compose service names when the project is Compose-managed.",
      "Keep secrets out of copied logs.",
      "Capture the command you used beside the output.",
      "Inspect healthchecks and exit codes when logs are empty."
    ],
    pitfalls: "A log line without container name, timestamp and service context is easy to misread during an incident.",
    faqs: [
      ["Why are docker logs empty?", "The process may log to a file, exit early, use another logging driver or never start."],
      ["Should I follow logs forever?", "No. Follow long enough to reproduce, then stop and save focused evidence."]
    ],
    related: ["docker-compose-debugging-guide.html", "docker-env-file-guide.html", "nginx-502-504-debugging-guide.html"]
  },
  {
    file: "linux-journalctl-guide.html",
    category: "Shell and Ops",
    mode: "ops",
    icon: "JNL",
    title: "Linux journalctl Guide for Developers and DBAs | Formalint",
    h1: "Linux journalctl Guide for Developers and DBAs",
    description: "Use journalctl to inspect Linux service logs, boot logs, time windows and unit failures during application and database incidents.",
    summary: "Turn Linux service logs into ordered incident evidence.",
    keywords: "journalctl guide linux service logs systemd dba incident debugging",
    commandTitle: "journalctl commands",
    command: String.raw`journalctl -u nginx -n 100 --no-pager
journalctl -u postgresql --since "30 minutes ago" --no-pager
journalctl -p warning..alert --since today --no-pager
journalctl -b -u docker --no-pager`,
    workflow: [
      ["Start with the unit", "Read the service that owns the failing behavior first."],
      ["Narrow time", "Use since, until and boot filters to keep output relevant."],
      ["Escalate severity", "Warnings and errors can reveal host-level causes faster than full logs."]
    ],
    checklist: [
      "Record hostname, date and timezone with log extracts.",
      "Use --no-pager for copyable incident notes.",
      "Check current boot with -b when a restart occurred.",
      "Compare service logs with application timestamps.",
      "Avoid pasting secrets from logs into public tools."
    ],
    pitfalls: "Reading all logs at once feels productive and usually is not. Time-boxed, unit-specific logs are faster.",
    faqs: [
      ["What does -u mean?", "It filters logs to a systemd unit such as nginx, docker or postgresql."],
      ["Why do logs disappear after reboot?", "Persistent journald storage may not be enabled on every system."]
    ],
    related: ["linux-admin-command-guide.html", "linux-cockpit-server-guide.html", "docker-container-logs-guide.html"]
  },
  {
    file: "powershell-curl-invoke-webrequest-guide.html",
    category: "Shell and Ops",
    mode: "ops",
    icon: "PS",
    title: "PowerShell curl vs Invoke-WebRequest Guide | Formalint",
    h1: "PowerShell curl vs Invoke-WebRequest Guide",
    description: "Understand curl.exe, Invoke-WebRequest and Invoke-RestMethod differences when debugging APIs on Windows.",
    summary: "Avoid Windows shell surprises while testing APIs.",
    keywords: "powershell curl invoke-webrequest invoke-restmethod api debugging windows",
    commandTitle: "Windows API checks",
    command: String.raw`curl.exe -i https://api.example.com/health
Invoke-WebRequest -Uri "https://api.example.com/health"
Invoke-RestMethod -Uri "https://api.example.com/health" -Headers @{ Accept = "application/json" }`,
    workflow: [
      ["Use curl.exe explicitly", "On Windows, typing curl may resolve differently depending on shell and version."],
      ["Choose the PowerShell cmdlet", "Invoke-WebRequest is useful for response details; Invoke-RestMethod parses API bodies."],
      ["Keep command evidence", "Copy the exact shell and command into the ticket."]
    ],
    checklist: [
      "Write curl.exe when you want real curl behavior.",
      "Check status code, headers and body separately.",
      "Avoid hiding errors behind aliases.",
      "Use Test-NetConnection for port reachability.",
      "Mask bearer tokens before sharing commands."
    ],
    pitfalls: "A command that works in Git Bash can fail in PowerShell because quoting, aliases and object output differ.",
    faqs: [
      ["Should I use curl or Invoke-RestMethod?", "Use curl.exe for portable raw HTTP evidence, and Invoke-RestMethod when PowerShell object output helps."],
      ["Why does JSON quoting break?", "PowerShell, CMD and Bash treat quotes differently. Match examples to the shell you are using."]
    ],
    related: ["powershell-network-debugging-guide.html", "curl-api-debugging-cheatsheet.html", "terminal-workflows-for-developers.html"]
  },
  {
    file: "php-fpm-nginx-debugging-guide.html",
    category: "Software Runtime",
    mode: "code",
    icon: "FPM",
    title: "PHP-FPM and Nginx Debugging Guide | Formalint",
    h1: "PHP-FPM and Nginx Debugging Guide",
    description: "Debug PHP-FPM and Nginx integration issues with service status, sockets, pools, logs, permissions and 502 evidence.",
    summary: "Find whether the failure belongs to Nginx, PHP-FPM or application code.",
    keywords: "php-fpm nginx debugging 502 socket pool permissions php runtime guide",
    commandTitle: "PHP-FPM evidence commands",
    command: String.raw`php -v
systemctl status php-fpm --no-pager
systemctl status nginx --no-pager
ss -lx | grep php
journalctl -u php-fpm -n 100 --no-pager`,
    workflow: [
      ["Confirm runtime", "Check PHP CLI version and PHP-FPM service version separately."],
      ["Inspect the socket", "Nginx and PHP-FPM must agree on socket path or TCP port."],
      ["Read both logs", "Nginx access/error logs and PHP-FPM logs tell different halves of the story."]
    ],
    checklist: [
      "Check pool user and file permissions.",
      "Verify fastcgi_pass matches the active PHP-FPM listener.",
      "Inspect memory limits and slowlog settings.",
      "Reload services only after config tests pass.",
      "Keep deploy rollback notes close to runtime changes."
    ],
    pitfalls: "A 502 may look like an Nginx issue while PHP-FPM is down, overloaded or listening somewhere else.",
    faqs: [
      ["Is PHP CLI the same as PHP-FPM?", "No. They can use different ini files and extensions."],
      ["Why does a PHP page download instead of executing?", "Nginx may not be passing PHP files to PHP-FPM correctly."]
    ],
    related: ["php-runtime-guide.html", "nginx-502-504-debugging-guide.html", "nginx-reverse-proxy-checklist.html"]
  },
  {
    file: "java-thread-dump-guide.html",
    category: "Software Runtime",
    mode: "code",
    icon: "THD",
    title: "Java Thread Dump Debugging Guide | Formalint",
    h1: "Java Thread Dump Debugging Guide",
    description: "Use Java thread dumps to investigate stuck requests, blocked threads, deadlocks, high CPU and service timeouts.",
    summary: "Capture JVM evidence before restarting the service.",
    keywords: "java thread dump debugging jstack deadlock blocked threads high cpu jvm",
    commandTitle: "Thread dump commands",
    command: String.raw`jcmd <pid> Thread.print
jstack <pid>
ps -ef | grep java
top -H -p <pid>`,
    workflow: [
      ["Find the JVM process", "Record PID, command line and service name."],
      ["Capture multiple dumps", "Two or three dumps a few seconds apart show whether threads are moving."],
      ["Connect to symptoms", "Compare blocked threads with API timeouts, database locks and CPU spikes."]
    ],
    checklist: [
      "Capture before restart when the process is still alive.",
      "Redact sensitive strings from dumps before sharing.",
      "Look for BLOCKED, WAITING and repeated stack frames.",
      "Compare with GC and memory evidence.",
      "Keep timestamps for each dump."
    ],
    pitfalls: "One dump is a snapshot. Multiple dumps tell a story.",
    faqs: [
      ["Does a thread dump stop the JVM?", "It is normally a diagnostic action, but still run it according to production policy."],
      ["What is a deadlock?", "Two or more threads are waiting on locks in a cycle, so none can continue."]
    ],
    related: ["java-memory-debugging-guide.html", "api-timeout-debugging-guide.html", "postgresql-lock-debugging-guide.html"]
  },
  {
    file: "python-virtualenv-debugging-guide.html",
    category: "Software Runtime",
    mode: "code",
    icon: "VENV",
    title: "Python Virtualenv Debugging Guide | Formalint",
    h1: "Python Virtualenv Debugging Guide",
    description: "Debug Python virtual environments, pip paths, package imports, service users and deployment differences.",
    summary: "Find why Python works in one shell but fails in the service.",
    keywords: "python virtualenv debugging venv pip import module not found service deployment",
    commandTitle: "Python environment checks",
    command: String.raw`python --version
python -m pip --version
python -c "import sys; print(sys.executable); print(sys.path)"
where python
# Linux/macOS:
which python`,
    workflow: [
      ["Identify the executable", "The Python binary decides which packages and paths are visible."],
      ["Use python -m pip", "Install into the interpreter you are actually using."],
      ["Compare shell and service", "A systemd, Docker or web worker process may use a different environment."]
    ],
    checklist: [
      "Check virtualenv activation and prompt.",
      "Print sys.executable inside the failing process.",
      "Keep requirements and lock files aligned.",
      "Check service user permissions.",
      "Avoid global pip installs as a debugging shortcut."
    ],
    pitfalls: "Most virtualenv bugs are not about Python syntax. They are about which Python is running.",
    faqs: [
      ["Why does import work locally but fail in production?", "The package may be installed in a different environment or missing from the service image."],
      ["Should I activate venv in scripts?", "For repeatable operations, call the virtualenv Python path or document activation explicitly."]
    ],
    related: ["python-runtime-guide.html", "python-indentation-fixer.html", "docker-container-logs-guide.html"]
  },
  {
    file: "nodejs-env-debugging-guide.html",
    category: "Software Runtime",
    mode: "code",
    icon: "ENV",
    title: "Node.js Environment Variable Debugging Guide | Formalint",
    h1: "Node.js Environment Variable Debugging Guide",
    description: "Debug Node.js environment variables across npm scripts, shells, Docker, PM2, services and frontend build boundaries.",
    summary: "Find where an environment variable disappears.",
    keywords: "nodejs env debugging environment variables npm scripts docker pm2 vite next",
    commandTitle: "Environment evidence",
    command: String.raw`node -e "console.log(process.version); console.log(process.env.NODE_ENV)"
npm run env
printenv | sort
docker compose config`,
    workflow: [
      ["Name the runtime", "Server-side Node, frontend build tools and browser code see different variables."],
      ["Render config", "For Docker Compose, inspect the rendered config before blaming application code."],
      ["Restart intentionally", "Many process managers need a restart before new environment values appear."]
    ],
    checklist: [
      "Check spelling and case of variable names.",
      "Separate build-time variables from runtime variables.",
      "Do not expose secrets through frontend prefixes.",
      "Compare local shell, npm script and service manager environment.",
      "Mask values in screenshots and logs."
    ],
    pitfalls: "A variable can exist in your terminal and still be absent from the process that serves users.",
    faqs: [
      ["Why does Vite need prefixed variables?", "Frontend tools intentionally expose only selected variables to browser bundles."],
      ["Does changing .env update a running service?", "Usually no. The process normally needs a reload or restart."]
    ],
    related: ["nodejs-runtime-guide.html", "nodejs-npm-dependency-debugging.html", "docker-env-file-guide.html"]
  }
];

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function header(activeHref = "tools.html") {
  const items = [
    ["index.html", "JSON"],
    ["json-diff.html", "JSON Diff"],
    ["xml-formatter.html", "XML"],
    ["yaml-formatter.html", "YAML"],
    ["sql-formatter.html", "SQL"],
    ["python-formatter.html", "Python"],
    ["tools.html", "All Tools"],
    ["guides.html", "Guides"],
    ["about.html", "About"]
  ];
  return `<header class="site-header"><a class="brand" href="index.html" aria-label="Formalint home"><img src="assets/img/favicon.svg" alt="" width="34" height="34"><span>Formalint</span></a><nav class="main-nav" aria-label="Main navigation">${items
    .map(([href, label]) => `<a${href === activeHref ? ' class="active"' : ""} href="${href}">${label}</a>`)
    .join("")}</nav></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-signature" aria-label="Contact"><strong>&copy; 2026 Formalint</strong><span aria-hidden="true">-</span><span>Ensar Karayel</span><span aria-hidden="true">-</span><a href="mailto:karayelensar@gmail.com">karayelensar@gmail.com</a></div><nav aria-label="Footer navigation"><button class="footer-link" type="button" data-consent-open>Privacy Preferences</button><a href="about.html">About</a><a href="how-formalint-works.html">How It Works</a><a href="editorial-policy.html">Editorial Policy</a><a href="changelog.html">Changelog</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></nav></footer>`;
}

function relatedLinks(related) {
  return related
    .map((href) => `<a href="${href}">${htmlEscape(titleFromFile(href))}</a>`)
    .join(", ");
}

function titleFromFile(file) {
  const known = {
    "index.html": "JSON Formatter",
    "regex-tester.html": "Regex Tester",
    "regex-examples.html": "Regex Examples",
    "developer-data-validation-guide.html": "Developer Data Validation",
    "http-security-headers-checklist.html": "HTTP Security Headers Checklist",
    "regex-lookahead-lookbehind-guide.html": "Regex Lookahead and Lookbehind",
    "dns-debugging-guide.html": "DNS Debugging Guide",
    "powershell-network-debugging-guide.html": "PowerShell Network Debugging",
    "linux-admin-command-guide.html": "Linux Admin Commands",
    "url-encoder-decoder.html": "URL Encoder Decoder",
    "tools.html": "Developer Tools Directory",
    "editorial-policy.html": "Editorial Policy",
    "color-converter.html": "Color Converter",
    "javascript-regex-cheatsheet.html": "JavaScript Regex Cheatsheet",
    "regex-performance-guide.html": "Regex Performance Guide",
    "json-formatting-guide.html": "JSON Formatting Guide",
    "api-debugging-handbook.html": "API Debugging Handbook",
    "json-diff.html": "JSON Diff",
    "regex-log-parser.html": "Regex Log Parser",
    "csv-to-json.html": "CSV to JSON",
    "oauth-jwt-debugging-checklist.html": "OAuth JWT Debugging Checklist",
    "jwt-decoder.html": "JWT Decoder",
    "api-debugging-checklist.html": "API Debugging Checklist",
    "nginx-502-504-debugging-guide.html": "Nginx 502 504 Debugging",
    "api-idempotency-retry-guide.html": "API Idempotency Retry Guide",
    "postgresql-lock-debugging-guide.html": "PostgreSQL Lock Debugging",
    "timestamp-converter.html": "Timestamp Converter",
    "sql-formatter.html": "SQL Formatter",
    "sql-cleanup.html": "SQL Cleanup",
    "postgresql-index-debugging-guide.html": "PostgreSQL Index Debugging",
    "sql-formatting-guide.html": "SQL Formatting Guide",
    "mysql-slow-query-debugging-guide.html": "MySQL Slow Query Debugging",
    "mysql-dba-checklist.html": "MySQL DBA Checklist",
    "postgresql-dba-checklist.html": "PostgreSQL DBA Checklist",
    "redis-debugging-checklist.html": "Redis Debugging Checklist",
    "hardware-diagnostics-guide.html": "Hardware Diagnostics",
    "docker-compose-debugging-guide.html": "Docker Compose Debugging",
    "docker-env-file-guide.html": "Docker Env Files",
    "linux-cockpit-server-guide.html": "Linux Cockpit Server Guide",
    "curl-api-debugging-cheatsheet.html": "curl API Debugging Cheatsheet",
    "terminal-workflows-for-developers.html": "Terminal Workflows",
    "php-runtime-guide.html": "PHP Runtime Guide",
    "nginx-reverse-proxy-checklist.html": "Nginx Reverse Proxy Checklist",
    "java-memory-debugging-guide.html": "Java Memory Debugging",
    "python-runtime-guide.html": "Python Runtime Guide",
    "python-indentation-fixer.html": "Python Indentation Fixer",
    "nodejs-runtime-guide.html": "Node.js Runtime Guide",
    "nodejs-npm-dependency-debugging.html": "npm Dependency Debugging"
  };
  return known[file] || file.replace(/\.html$/, "").split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function generatePage(page) {
  const tableRows = page.workflow.map(([step, reason]) => `<tr><td>${htmlEscape(step)}</td><td>${htmlEscape(reason)}</td></tr>`).join("");
  const checklist = page.checklist.map((item) => `<li>${htmlEscape(item)}</li>`).join("");
  const faq = page.faqs
    .map(([q, a]) => `<details><summary>${htmlEscape(q)}</summary><p>${htmlEscape(a)}</p></details>`)
    .join("");
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `https://formalint.com/${page.file}#article`,
    headline: page.h1,
    description: page.description,
    datePublished: TODAY,
    dateModified: TODAY,
    author: { "@type": "Person", name: "Ensar Karayel" },
    publisher: { "@type": "Organization", name: "Formalint", url: "https://formalint.com/" },
    mainEntityOfPage: `https://formalint.com/${page.file}`,
    proficiencyLevel: "Beginner"
  };

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
    ${header(page.category === "Regex Lab" ? "regex-tester.html" : page.category === "Data Formatting" ? "index.html" : "tools.html")}
    <main class="document-page">
      <h1>${htmlEscape(page.h1)}</h1>
      <p class="guide-meta">${htmlEscape(page.summary)} Last updated September 1, 2026.</p>
      <p>${htmlEscape(page.description)} This Formalint reference is written for working developers, DBAs and support engineers who need a repeatable debugging path instead of a one-line snippet with no context.</p>
      <p>Use the notes below as a practical review order: understand the input, capture evidence, make one small change and verify the result before moving to the next assumption.</p>

      <h2>When to use this page</h2>
      <p>${htmlEscape(page.summary)} It is most useful when a small validation or debugging mistake can create noisy tickets, misleading logs or hard-to-review production changes.</p>

      <h2>Practical workflow</h2>
      <table class="workflow-table">
        <thead><tr><th>Step</th><th>What to confirm</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>

      <h2>${htmlEscape(page.commandTitle)}</h2>
      <div class="command-block"><button class="copy-code-button" type="button" data-copy-code>Copy</button><pre><code>${htmlEscape(page.command)}</code></pre></div>

      <h2>Review checklist</h2>
      <ol>${checklist}</ol>

      <h2>Common mistake</h2>
      <p>${htmlEscape(page.pitfalls)}</p>
      <p class="guide-callout">Formalint is strongest when the page helps the developer decide what the tool cannot prove. Treat every formatter, regex and command as one layer of evidence, not the whole truth.</p>

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
  return `<a class="tool-card" href="${page.file}"><span>${htmlEscape(page.h1.replace(" Guide", "").replace(" | Formalint", ""))}</span><small>${htmlEscape(page.summary)}</small></a>`;
}

function jsLink(page) {
  return `{ label: "${page.h1.replace(/"/g, '\\"').replace(" Guide", "")}", href: "${page.file}", icon: "${page.icon}", description: "${page.summary.replace(/"/g, '\\"')}", keywords: "${page.keywords}" }`;
}

function writePages() {
  pages.forEach((page) => {
    fs.writeFileSync(path.join(ROOT, page.file), generatePage(page), "utf8");
  });
}

function updateCacheVersions() {
  fs.readdirSync(ROOT)
    .filter((name) => name.endsWith(".html"))
    .forEach((name) => {
      const file = path.join(ROOT, name);
      const next = fs.readFileSync(file, "utf8").replace(/styles\.css\?v=[0-9a-z-]+/g, `styles.css?v=${CACHE_VERSION}`);
      fs.writeFileSync(file, next, "utf8");
    });
}

function replaceOnce(content, marker, insertion) {
  if (content.includes(insertion.trim().slice(0, 60))) {
    return content;
  }
  if (!content.includes(marker)) {
    throw new Error(`Marker not found: ${marker}`);
  }
  return content.replace(marker, insertion + marker);
}

function updateTools() {
  const file = path.join(ROOT, "tools.html");
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/Search (100|120|124) Formalint tools and guides/g, `Search ${LIBRARY_COUNT} Formalint tools and guides`);
  html = html.replace(/Showing (100|120|124) resources/g, `Showing ${LIBRARY_COUNT} resources`);
  const newSection = `
      <section class="directory-section" aria-labelledby="advanced-reference-title" data-tools-section>
        <div class="section-heading">
          <p class="eyebrow">Advanced references</p>
          <h2 id="advanced-reference-title">Regex, API, SQL, runtime and operations deep dives</h2>
        </div>
        <div class="directory-grid">
          ${pages.map(card).join("\n          ")}
        </div>
      </section>

`;
  html = replaceOnce(html, '      <section class="directory-section" aria-labelledby="trust-title" data-tools-section>', newSection);
  fs.writeFileSync(file, html, "utf8");
}

function updateGuides() {
  const file = path.join(ROOT, "guides.html");
  let html = fs.readFileSync(file, "utf8");
  const cards = pages.map(card).join("\n          ") + "\n          ";
  html = replaceOnce(html, '          <a class="tool-card" href="complete-regex-guide.html">', cards);
  fs.writeFileSync(file, html, "utf8");
}

function updateHome() {
  const file = path.join(ROOT, "index.html");
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/(100|120|124) public pages/g, `${LIBRARY_COUNT} public pages`);
  html = html.replace(/<strong>(100|120|124)<\/strong><span>Public HTML targets/g, `<strong>${LIBRARY_COUNT}</strong><span>Public HTML targets`);
  const spotlight = pages
    .slice(0, 8)
    .map(card)
    .join("\n          ");
  html = replaceOnce(html, '          <a class="tool-card" href="complete-regex-guide.html"><span>Regex Toolkit</span>', spotlight + "\n          ");
  fs.writeFileSync(file, html, "utf8");
}

function updateShared() {
  const file = path.join(ROOT, "assets", "js", "shared.js");
  let js = fs.readFileSync(file, "utf8");
  const groups = [
    ["Regex Lab", pages.filter((page) => page.mode === "regex")],
    ["API Debugging", pages.filter((page) => page.mode === "api")],
    ["Database Operations", pages.filter((page) => page.mode === "db")],
    ["Shell & DBA Ops", pages.filter((page) => page.mode === "ops")],
    ["Software Runtime", pages.filter((page) => page.mode === "code")]
  ];
  groups.forEach(([title, groupPages]) => {
    if (!groupPages.length) return;
    const marker = `      title: "${title}",`;
    const start = js.indexOf(marker);
    if (start === -1) throw new Error(`Sidebar group not found: ${title}`);
    const linksStart = js.indexOf("      links: [", start);
    const insertAt = js.indexOf("\n      ]", linksStart);
    groupPages.forEach((page) => {
      if (js.includes(`href: "${page.file}"`)) return;
      js = js.slice(0, insertAt) + ",\n        " + jsLink(page) + js.slice(insertAt);
    });
  });
  fs.writeFileSync(file, js, "utf8");
}

function updateChangelog() {
  const file = path.join(ROOT, "changelog.html");
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/      <h2>September 1, 2026 - 12[04] Page Developer Library<\/h2>\n      <p>Expanded Formalint beyond 100 public pages with (20|24) new regex, API timeout, JWT expiration, SQL, PostgreSQL, MySQL, Redis, Docker, Linux, PowerShell, PHP, Java, Python and Node\.js references\. Updated tools, guides, sitemap, sidebar search and cache version so the deeper library is visible to both users and crawlers\.<\/p>\n/g, "");
  const entry = `      <h2>September 1, 2026 - 124 Page Developer Library</h2>
      <p>Expanded Formalint beyond 100 public pages with 24 new regex, API timeout, JWT expiration, SQL, PostgreSQL, MySQL, Redis, Docker, Linux, PowerShell, PHP, Java, Python and Node.js references. Updated tools, guides, sitemap, sidebar search and cache version so the deeper library is visible to both users and crawlers.</p>
`;
  html = replaceOnce(html, "      <h2>September 1, 2026 - Shareable Directory Search</h2>", entry);
  fs.writeFileSync(file, html, "utf8");
}

function updateSitemap() {
  const htmlFiles = fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).sort((a, b) => a.localeCompare(b));
  const urls = htmlFiles.map((name) => {
    const loc = name === "index.html" ? "https://formalint.com/" : `https://formalint.com/${name}`;
    const priority = name === "index.html" ? "1.0" : ["tools.html", "guides.html"].includes(name) ? "0.85" : pages.some((page) => page.file === name) ? "0.72" : "0.7";
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, "utf8");
}

function ensureStructuredData() {
  fs.readdirSync(ROOT)
    .filter((name) => name.endsWith(".html"))
    .forEach((name) => {
      const file = path.join(ROOT, name);
      let html = fs.readFileSync(file, "utf8");
      if (html.includes('type="application/ld+json"')) {
        return;
      }
      const title = (html.match(/<title>([^<]+)<\/title>/) || [null, "Formalint"])[1];
      const description = (html.match(/<meta name="description" content="([^"]+)">/) || [null, "Formalint developer reference page."])[1];
      const canonical = (html.match(/<link rel="canonical" href="([^"]+)">/) || [null, `https://formalint.com/${name}`])[1];
      const schema = {
        "@context": "https://schema.org",
        "@type": ["privacy.html", "terms.html", "about.html", "contact.html"].includes(name) ? "WebPage" : "TechArticle",
        "@id": `${canonical}#webpage`,
        name: title.replace(" | Formalint", ""),
        description,
        url: canonical,
        dateModified: TODAY,
        author: { "@type": "Person", name: "Ensar Karayel" },
        publisher: { "@type": "Organization", name: "Formalint", url: "https://formalint.com/" },
        isAccessibleForFree: true
      };
      const script = `    <script type="application/ld+json" nonce="formalint-schema">\n      ${JSON.stringify(schema)}\n    </script>\n`;
      html = html.replace("  </head>", `${script}  </head>`);
      fs.writeFileSync(file, html, "utf8");
    });
}

writePages();
updateCacheVersions();
updateTools();
updateGuides();
updateHome();
updateShared();
updateChangelog();
updateSitemap();
ensureStructuredData();

console.log(`Formalint library expanded to ${fs.readdirSync(ROOT).filter((name) => name.endsWith(".html")).length} HTML pages.`);
