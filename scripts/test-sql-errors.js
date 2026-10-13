const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/sql-tool.js'), 'utf8');
const nodes = Object.fromEntries(['sqlInput', 'sqlOutput', 'statusMessage', 'inputMeta', 'metrics'].map(id => [id, {value: '', textContent: '', addEventListener() {}}]));
let click, copied, downloaded;
const context = {
  document: {body: {dataset: {tool: 'sql'}}, addEventListener: (type, fn) => { click = fn; }},
  window: {DevKit: {
    $: selector => nodes[selector.slice(1)],
    formatBytes: value => String(value.length), lineCount: value => value.split('\n').length,
    setStatus: (node, kind, message) => { node.kind = kind; node.textContent = message; },
    renderMetrics: (node, values) => { node.values = values; }, debounce: fn => fn,
    copyText: value => { copied = value; return {then() {}}; },
    downloadText: (name, value) => { downloaded = value; }
  }}
};
vm.runInNewContext(source, context, {timeout: 1000});
const action = name => click({target: {closest: () => ({dataset: {action: name}})}});
for (const mode of ['format', 'compact', 'check']) {
  for (const invalid of ['', "SELECT 'oops FROM orders;", 'SELECT (id FROM orders;', 'DELETE FROM orders;']) {
    nodes.sqlInput.value = 'select id from orders;';
    action('format');
    assert.equal(nodes.statusMessage.kind, 'ok');
    nodes.sqlInput.value = invalid;
    action(mode);
    assert.equal(nodes.statusMessage.kind, 'error');
    assert.equal(nodes.sqlOutput.textContent, invalid || 'Input is empty.');
    action('copy');
    action('download');
    assert.equal(copied, invalid);
    assert.equal(downloaded, invalid);
    assert.equal(nodes.metrics.values[0].value, String(invalid.length));
  }
}
console.log('12 SQL error transitions passed: output, status, copy, download and metrics.');
