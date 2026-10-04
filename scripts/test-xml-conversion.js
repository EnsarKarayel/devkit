const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/xml-tool.js'), 'utf8');
const text = value => ({nodeType: 3, nodeValue: value});
const cdata = value => ({nodeType: 4, nodeValue: value});
const element = (name, children = [], attributes = []) => ({
  nodeType: 1, nodeName: name, childNodes: children, attributes
});

// Drive the public To JSON action using DOM-shaped fixtures; parsing is browser-owned.
function convert(root) {
  const nodes = Object.fromEntries(['xmlInput', 'xmlOutput', 'statusMessage', 'inputMeta', 'metrics'].map(id => [id, {value: '', innerHTML: '', addEventListener() {}}]));
  let click;
  let copied;
  const doc = {documentElement: root, getElementsByTagName: name => name === 'parsererror' ? [] : [root]};
  const context = {
    Node: {ELEMENT_NODE: 1, TEXT_NODE: 3, CDATA_SECTION_NODE: 4},
    DOMParser: class { parseFromString() { return doc; } },
    XMLSerializer: class { serializeToString() { return '<fixture/>'; } },
    document: {body: {dataset: {tool: 'xml'}}, addEventListener: (type, fn) => { click = fn; }},
    window: {DevKit: {
      $: selector => nodes[selector.slice(1)], escapeHtml: value => value,
      formatBytes: value => String(value.length), lineCount: () => 1,
      setStatus() {}, renderMetrics() {}, debounce: fn => fn,
      copyText: value => { copied = value; return Promise.resolve(); }
    }}
  };
  vm.runInNewContext(source, context, {timeout: 1000});
  for (const action of ['to-json', 'copy']) click({target: {closest: () => ({dataset: {action}})}});
  return JSON.parse(copied);
}

assert.deepEqual(convert(element('note', [cdata('A & B')])), {note: 'A & B'});
assert.deepEqual(convert(element('note', [text('a'), cdata('b'), text(' c ')])), {note: 'ab c '});
assert.deepEqual(convert(element('note', [text('   ')])), {note: '   '});
assert.deepEqual(convert(element('list', [text('\n '), element('tag', [text('a')]), text('\n '), element('tag', [text('b')])])), {list: {tag: ['a', 'b']}});
const special = convert(element('__proto__', [element('__proto__', [text('first')]), element('__proto__', [text('second')]), element('constructor', [text('data')])], [{name: '__proto__', value: 'attribute'}]));
assert.ok(Object.hasOwn(special, '__proto__'));
assert.deepEqual(special.__proto__.__proto__, ['first', 'second']);
assert.equal(special.__proto__.constructor, 'data');
assert.equal(special.__proto__['@attributes'].__proto__, 'attribute');
assert.deepEqual(convert(element('p', [text('Hello '), element('b', [text('world')]), text('!')])), {p: {b: 'world', '#text': 'Hello !'}});
assert.deepEqual(convert(element('empty')), {empty: {}});
console.log('XML conversion passed: CDATA, text boundaries, whitespace, arrays, special names, mixed content and empty nodes.');
