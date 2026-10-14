const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/xml-tool.js'), 'utf8');
let click, edited, copied = 0, downloads = [];
const nodes = Object.fromEntries(['xmlInput', 'xmlOutput', 'statusMessage', 'inputMeta', 'metrics'].map(id => [id, {value: '', textContent: '', innerHTML: '', addEventListener(type, fn) { edited = fn; }}]));
const root = {nodeType: 1, nodeName: 'root', childNodes: [], attributes: []};
const context = {
  Node: {ELEMENT_NODE: 1, TEXT_NODE: 3, CDATA_SECTION_NODE: 4},
  DOMParser: class { parseFromString(raw) { return {documentElement: root, getElementsByTagName: name => name === 'parsererror' ? (raw === '<broken>' ? [{textContent: 'Invalid XML'}] : []) : [root]}; } },
  XMLSerializer: class { serializeToString() { return '<root/>'; } },
  document: {body: {dataset: {tool: 'xml'}}, addEventListener(type, fn) { click = fn; }},
  window: {DevKit: {
    $: selector => nodes[selector.slice(1)], escapeHtml: value => value,
    formatBytes: value => String(value.length), lineCount: () => 1,
    setStatus(node, kind, message) { node.textContent = message; },
    renderMetrics(node, values) { node.values = values; },
    copyText() { copied++; return {then() {}}; },
    downloadText(name, content, mime) { downloads.push({name, content, mime}); }
  }}
};
vm.runInNewContext(source, context, {timeout: 1000});
const action = name => click({target: {closest: () => ({dataset: {action: name}})}});
function assertBlocked() {
  const previous = [copied, downloads.length];
  action('copy'); action('download');
  assert.deepEqual([copied, downloads.length], previous);
  assert.equal(nodes.xmlOutput.textContent, '');
  assert.equal(nodes.metrics.values.length, 0);
}
for (const mode of ['format', 'minify', 'validate', 'to-json']) {
  for (const invalid of ['', '<broken>']) {
    nodes.xmlInput.value = '<root/>';
    action('to-json'); action('download');
    assert.equal(downloads.at(-1).name, 'formatted.json');
    nodes.xmlInput.value = invalid;
    action(mode);
    assertBlocked();
    nodes.xmlInput.value = '<root/>';
    action('format'); action('download');
    assert.equal(downloads.at(-1).name, 'formatted.xml');
    assert.equal(downloads.at(-1).content, '<root/>');
  }
}
nodes.xmlInput.value = '<changed/>';
edited();
assertBlocked();
action('format');
nodes.xmlInput.value = '<programmatic-change/>';
assertBlocked();
action('sample'); action('clear');
assertBlocked();
console.log('XML state tests passed: eight error transitions, recovery, edits, programmatic changes and clear.');
