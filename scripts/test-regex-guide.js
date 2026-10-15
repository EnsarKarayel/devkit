const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '../regex-flags-guide.html'), 'utf8');
const snippets = [...html.matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)].map(match => match[1].replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&'));
const expected = [
  [[true, 3], [false, 0], [true, 3]],
  [[[true, true, false]], [true], [true]],
  [[false], [true]]
];
assert.equal(snippets.length, expected.length);
snippets.forEach((code, index) => {
  const output = [];
  vm.runInNewContext(code, {console: {log: (...args) => output.push(JSON.parse(JSON.stringify(args)))}}, {timeout: 1000});
  assert.deepEqual(output, expected[index]);
});
const rows = [...html.matchAll(/<tr><td><code>(\/.*?\/[a-z]*)<\/code><\/td><td><code>(.*?)<\/code><\/td><td>(true|false)<\/td>/g)];
assert.equal(rows.length, 4);
for (const [, expression, escapedInput, expectedResult] of rows) {
  const actual = vm.runInNewContext(`${expression}.test(input)`, {input: escapedInput.replace(/\\n/g, '\n')}, {timeout: 1000});
  assert.equal(actual, expectedResult === 'true');
}
console.log('Published regex guide: three runnable snippets and four matrix rows passed.');
