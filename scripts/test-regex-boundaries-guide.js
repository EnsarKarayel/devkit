const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'regex-greedy-vs-lazy-guide.html'), 'utf8');
const decode = text => text.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const snippets = [...html.matchAll(/<code data-example="javascript">([\s\S]*?)<\/code>/g)];
const expected = [
  [['"alex" action="read"'], ['"alex"', '"read"'], ['"alex"', '"read"']],
  ['"first" "second" END', false],
  [false, true, false, 0, 'abc']
];
assert.equal(snippets.length, expected.length);
snippets.forEach(([, code], index) => {
  const output = [];
  vm.runInNewContext(decode(code), {console: {log: value => output.push(JSON.parse(JSON.stringify(value)))}}, {timeout: 1000});
  assert.deepEqual(output, expected[index]);
});
const pattern = decode(html.match(/Use <code>(.*?)<\/code> without flags/)[1]);
const rows = [...html.matchAll(/<tr><td><code>(.*?)<\/code><\/td><td>(true|false)<\/td>/g)];
assert.equal(rows.length, 7);
for (const [, encoded, expectedResult] of rows) {
  const input = JSON.parse(decode(encoded));
  assert.equal(vm.runInNewContext(pattern + '.test(input)', {input}, {timeout: 1000}), expectedResult === 'true');
}
const schema = JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1]);
assert.equal(schema.headline, html.match(/<h1>(.*?)<\/h1>/)[1]);
assert.equal(schema.description, html.match(/<meta name="description" content="([^"]+)"/)[1]);
assert.equal(schema.dateModified, '2026-10-24');
assert.ok(html.includes('href="' + schema.mainEntityOfPage + '"'));
for (const [, href] of html.matchAll(/href="([^"#]+\.html)"/g)) {
  if (!href.startsWith('https:')) assert.ok(fs.existsSync(path.join(root, href)), href);
}
console.log('Regex boundaries guide: three published examples, seven matrix cases, metadata and links passed.');
