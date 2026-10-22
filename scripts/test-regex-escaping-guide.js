const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'regex-escaping-guide.html'), 'utf8');
const decode = value => value.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const snippets = [...html.matchAll(/<code data-example="javascript">([\s\S]*?)<\/code>/g)];
const expected = [[true, true, true, false], ['d+', true, true, false], [true, true, false]];
assert.equal(snippets.length, expected.length);
snippets.forEach(([, code], index) => {
  const output = [];
  vm.runInNewContext(decode(code), {console: {log: value => output.push(value)}}, {timeout: 1000});
  assert.deepEqual(output, expected[index]);
});
const rows = [...html.matchAll(/<tr><td><code>(\/.*?\/[a-z]*)<\/code><\/td><td><code>(.*?)<\/code><\/td><td>(true|false)<\/td>/g)];
assert.equal(rows.length, 6);
for (const [, regex, input, expectedResult] of rows) {
  assert.equal(vm.runInNewContext(decode(regex) + '.test(input)', {input: decode(input)}, {timeout: 1000}), expectedResult === 'true');
}
const schema = JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1]);
assert.equal(schema.headline, html.match(/<h1>(.*?)<\/h1>/)[1]);
assert.equal(schema.description, html.match(/<meta name="description" content="([^"]+)"/)[1]);
assert.equal(schema.dateModified, '2026-10-22');
assert.ok(html.includes('href="' + schema.mainEntityOfPage + '"'));
for (const [, href] of html.matchAll(/href="([^"#]+\.html)"/g)) {
  if (!href.startsWith('https:')) assert.ok(fs.existsSync(path.join(root, href)), href);
}
console.log('Regex escaping guide: three published snippets, six matrix rows, metadata and local links passed.');
