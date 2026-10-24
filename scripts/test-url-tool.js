const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let click, edited, failClipboard = false;
const copied = [];
const nodes = Object.fromEntries(['urlInput', 'urlOutput', 'statusMessage', 'inputMeta', 'metrics'].map(id => [id, {
  value: '', textContent: '', addEventListener(type, fn) { edited = fn; }
}]));
const root = path.join(__dirname, '..');
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/js/url-tool.js'), 'utf8'), {
  document: {body: {dataset: {tool: 'url'}}, addEventListener(type, fn) { click = fn; }},
  window: {DevKit: {
    $: selector => nodes[selector.slice(1)], formatBytes: text => String(text.length), lineCount: () => 1,
    setStatus(node, kind, message) { node.kind = kind; node.textContent = message; },
    renderMetrics(node, values) { node.values = values; },
    copyText(text) { copied.push(text); return failClipboard ? Promise.reject(new Error('Denied')) : Promise.resolve(); }
  }}
}, {timeout: 1000});
const action = name => click({target: {closest: () => ({dataset: {action: name}})}});
function run(input, mode) { nodes.urlInput.value = input; action(mode); }
function blocked() {
  const count = copied.length;
  action('copy');
  assert.equal(copied.length, count);
  assert.equal(nodes.urlOutput.textContent, '');
  assert.equal(nodes.metrics.values.length, 0);
}
async function test() {
  const html = fs.readFileSync(path.join(root, 'url-encoder-decoder.html'), 'utf8');
  const rows = [...html.matchAll(/<tr><td><code>(.*?)<\/code><\/td>/g)];
  const expected = [['C++', 'C  '], ['C++', 'C++'], ['a+b c', 'a b c'], ['%2F', '%2F'], ['\u00e9', '\u00e9'], [null, null], [null, null]];
  assert.equal(rows.length, expected.length);
  rows.forEach(([, input], index) => ['decode', 'decode-form'].forEach((mode, column) => {
    run(input, mode);
    if (expected[index][column] === null) {
      assert.equal(nodes.statusMessage.kind, 'error'); blocked();
    } else assert.equal(nodes.urlOutput.textContent, expected[index][column]);
  }));
  for (const text of ['', 'C++', 'a b', '\ud83d\ude00', 'https://example.test/?q=a&b=c']) {
    run(text, 'encode');
    assert.equal(nodes.urlOutput.textContent, encodeURIComponent(text));
    run(nodes.urlOutput.textContent, 'decode');
    assert.equal(nodes.urlOutput.textContent, text);
    action('copy'); await Promise.resolve();
    assert.equal(copied.at(-1), text);
  }
  run('\ud800', 'encode'); assert.equal(nodes.statusMessage.kind, 'error'); blocked();
  action('sample'); nodes.urlInput.value = 'edit'; edited(); blocked();
  action('sample'); nodes.urlInput.value = 'programmatic'; blocked();
  action('sample'); action('clear'); blocked();
  action('sample'); failClipboard = true; action('copy');
  await Promise.resolve(); await Promise.resolve();
  assert.match(nodes.statusMessage.textContent, /Clipboard access failed/);
  for (const [, raw] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(raw);
  for (const [, href] of html.matchAll(/href="([^"#]+\.html)"/g)) {
    if (!href.startsWith('https:')) assert.ok(fs.existsSync(path.join(root, href)), href);
  }
  console.log('URL codec passed: seven published cases in both modes, round trips, invalid input, stale output, clipboard errors and page links.');
}
test().catch(error => { console.error(error); process.exitCode = 1; });
