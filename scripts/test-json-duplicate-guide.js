const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'json-duplicate-keys-guide.html'), 'utf8');
const decode = text => text.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const snippet = language => decode(html.match(new RegExp('<code data-example="' + language + '">([\\s\\S]*?)</code>'))[1]);
const output = [];
vm.runInNewContext(snippet('javascript'), {console: {log: value => output.push(value)}}, {timeout: 1000});
assert.deepEqual(output, ['admin', 1]);
const rows = [...html.matchAll(/<tr><td><code>(.*?)<\/code><\/td><td>(Accept|Reject)<\/td>/g)];
assert.equal(rows.length, 7);
const cases = rows.map(([, input, result]) => [decode(input), result]);
const python = snippet('python') + '\nimport sys\nfor text, expected in json.loads(sys.argv[1]):\n    try:\n        load_unique(text)\n        actual = "Accept"\n    except ValueError:\n        actual = "Reject"\n    assert actual == expected, (text, actual, expected)\n';
const run = spawnSync('python', ['-c', python, JSON.stringify(cases)], {encoding: 'utf8', timeout: 10000});
assert.equal(run.status, 0, run.stderr || String(run.error));
assert.equal(run.stdout.trim(), "Duplicate JSON key: 'role'");
const schema = JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1]);
assert.equal(schema.dateModified, '2026-10-21');
assert.equal(schema.headline, html.match(/<h1>(.*?)<\/h1>/)[1]);
for (const [, href] of html.matchAll(/href="([^"#]+\.html)"/g)) {
  if (!href.startsWith('https:')) assert.ok(fs.existsSync(path.join(root, href)), href);
}
console.log('Duplicate-key guide: published JS/Python examples, seven matrix cases, schema and local links passed.');
