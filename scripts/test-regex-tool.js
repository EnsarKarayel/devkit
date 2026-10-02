const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/regex-tool.js'), 'utf8');

function run(pattern, text, flags) {
  const nodes = Object.fromEntries(['regexPattern', 'regexText', 'regexOutput', 'statusMessage', 'inputMeta', 'metrics'].map(id => [id, {value: '', textContent: '', innerHTML: ''}]));
  const events = {};
  const document = {
    body: {dataset: {tool: 'regex', regexSamplePattern: pattern, regexSampleText: text}},
    querySelectorAll: () => [...flags].map(value => ({value})),
    addEventListener: (type, callback) => { events[type] = callback; }
  };
  const DevKit = {
    $: selector => nodes[selector.slice(1)],
    escapeHtml: value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;'),
    formatBytes: value => String(value.length), lineCount: value => value.split('\n').length,
    setStatus: (node, kind, value) => { node.textContent = value; },
    renderMetrics: (node, values) => { node.textContent = JSON.stringify(values); },
    debounce: callback => callback
  };
  vm.runInNewContext(source, {document, window: {DevKit}}, {timeout: 1000});
  return {nodes, events};
}

assert.equal(run('cat', 'cat cat', '').nodes.statusMessage.textContent, '1 match');
assert.equal(run('cat', 'cat cat', 'g').nodes.statusMessage.textContent, '2 matches');
assert.equal(run('^cat$', 'cat\ncat', 'g').nodes.statusMessage.textContent, 'No matches');
assert.equal(run('^cat$', 'cat\ncat', 'gm').nodes.statusMessage.textContent, '2 matches');
const unicode = run('(?:)', '\u{1F600}', 'gu').nodes;
assert.equal(unicode.statusMessage.textContent, '2 matches');
assert.ok(unicode.regexOutput.innerHTML.includes('index 2'));
assert.equal(run('(?:)', '\u{1F600}', 'g').nodes.statusMessage.textContent, '3 matches');
assert.equal(run('.', 'a'.repeat(201), 'g').nodes.statusMessage.textContent, 'Showing first 200 matches (display limit)');
const state = run('cat', 'cat', 'g');
state.nodes.regexPattern.value = '[';
state.events.input();
assert.equal(state.nodes.metrics.textContent, '');
assert.ok(state.nodes.statusMessage.textContent.includes('Invalid regular expression'));
const html = fs.readFileSync(path.join(__dirname, '../regex-email-validator.html'), 'utf8');
const pattern = html.match(/data-regex-sample-pattern="([^"]+)"/)[1];
const sample = html.match(/data-regex-sample-text="([^"]+)"/)[1];
const flags = [...html.matchAll(/type="checkbox" value="([^"]+)" checked/g)].map(match => match[1]).join('');
assert.equal(run(pattern, sample, flags).nodes.statusMessage.textContent, '2 matches');
console.log('Regex regression checks passed: flags, Unicode, result limit, error metrics and page sample.');
