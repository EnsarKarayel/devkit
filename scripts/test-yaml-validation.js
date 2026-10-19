const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const nodes = Object.fromEntries(['yamlInput', 'yamlOutput', 'statusMessage', 'inputMeta', 'metrics'].map(id => [id, {value: '', textContent: '', addEventListener() {}}]));
let click, copied, downloaded;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/yaml-tool.js'), 'utf8'), {
  document: {body: {dataset: {tool: 'yaml'}}, addEventListener(type, fn) { click = fn; }},
  window: {DevKit: {
    $: selector => nodes[selector.slice(1)],
    formatBytes: value => String(value.length), lineCount: value => value.split('\n').length,
    setStatus(node, kind, message) { node.kind = kind; node.textContent = message; },
    renderMetrics(node, values) { node.values = values; }, debounce: fn => fn,
    copyText(value) { copied = value; return {then() {}}; },
    downloadText(name, value) { downloaded = value; }
  }}
}, {timeout: 1000});
const action = name => click({target: {closest: () => ({dataset: {action: name}})}});
for (const mode of ['format', 'validate']) {
  for (const key of ['constructor', '__proto__', 'toString', 'port']) {
    nodes.yamlInput.value = `${key}: first`;
    action(mode);
    assert.equal(nodes.statusMessage.kind, 'ok', key);
    nodes.yamlInput.value += `\n${key}: second`;
    action(mode);
    assert.equal(nodes.statusMessage.kind, 'error');
    assert.match(nodes.statusMessage.textContent, /duplicate key/);
  }
  action('sample');
  nodes.yamlInput.value = 'server:\n\tport: 8080';
  action(mode);
  assert.match(nodes.statusMessage.textContent, /tabs are not valid indentation/);
  assert.equal(nodes.yamlOutput.textContent, nodes.yamlInput.value);
  action('copy'); action('download');
  assert.equal(copied, nodes.yamlInput.value);
  assert.equal(downloaded, nodes.yamlInput.value);
}
nodes.yamlInput.value = 'name: dev  \r\n\r\n\r\n';
action('validate');
assert.equal(nodes.statusMessage.kind, 'ok');
assert.equal(nodes.yamlOutput.textContent, nodes.yamlInput.value);
console.log('YAML checks passed: special keys, real duplicates, raw tabs, error exports and unchanged validation output.');
