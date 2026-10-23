const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let click, edited, failClipboard = false;
const copied = [];
const nodes = Object.fromEntries(['base64Input', 'base64Output', 'statusMessage', 'inputMeta', 'metrics'].map(id => [id, {
  value: '', textContent: '', addEventListener(type, fn) { edited = fn; }
}]));
const source = fs.readFileSync(path.join(__dirname, '../assets/js/base64-tool.js'), 'utf8');
vm.runInNewContext(source, {
  TextEncoder, TextDecoder, Uint8Array, btoa, atob,
  document: {body: {dataset: {tool: 'base64'}}, addEventListener(type, fn) { click = fn; }},
  window: {DevKit: {
    $: selector => nodes[selector.slice(1)],
    formatBytes: text => String(Buffer.byteLength(text)), lineCount: () => 1,
    setStatus(node, kind, message) { node.kind = kind; node.textContent = message; },
    renderMetrics(node, values) { node.values = values; },
    copyText(text) { copied.push(text); return failClipboard ? Promise.reject(new Error('Denied')) : Promise.resolve(); }
  }}
}, {timeout: 1000});
const action = name => click({target: {closest: () => ({dataset: {action: name}})}});
function run(input, mode) { nodes.base64Input.value = input; action(mode); }
function blocked() {
  const count = copied.length;
  action('copy');
  assert.equal(copied.length, count);
  assert.equal(nodes.base64Output.textContent, '');
  assert.equal(nodes.metrics.values.length, 0);
}
async function test() {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'base64-encoder-decoder.html'), 'utf8');
  const schemas = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(([, raw]) => JSON.parse(raw));
  assert.equal(schemas[0].url, 'https://formalint.com/base64-encoder-decoder.html');
  for (const question of schemas[1].mainEntity) {
    assert.ok(html.includes('<summary>' + question.name + '</summary>'));
    assert.ok(html.includes('<p>' + question.acceptedAnswer.text + '</p>'));
  }
  const rows = [...html.matchAll(/<tr><td><code>(.*?)<\/code><\/td><td>(.*?)<\/td>/g)];
  assert.equal(rows.length, 6);
  const results = ['hello', '\u00e9', '\ud83d\ude00', null, null, null];
  rows.forEach(([, encoded], index) => {
    run(encoded, 'decode');
    if (results[index] === null) assert.equal(nodes.statusMessage.kind, 'error');
    else assert.equal(nodes.base64Output.textContent, results[index]);
  });
  for (const [, href] of html.matchAll(/href="([^"#]+\.html)"/g)) {
    if (!href.startsWith('https:')) assert.ok(fs.existsSync(path.join(root, href)), href);
  }
  for (const text of ['', 'hello', '\u00e9', '\ud83d\ude00', '\ufeffhello', 'a\0b']) {
    run(text, 'encode');
    const encoded = nodes.base64Output.textContent;
    assert.equal(encoded, Buffer.from(text, 'utf8').toString('base64'));
    run(encoded, 'decode');
    assert.equal(nodes.base64Output.textContent, text);
    assert.equal(nodes.statusMessage.kind, 'ok');
    action('copy');
    await Promise.resolve();
    assert.equal(copied.at(-1), text);
  }
  for (const bad of ['/w==', 'ww==', '7aCA']) {
    run('aGVsbG8=', 'decode');
    run(bad, 'decode');
    assert.match(nodes.statusMessage.textContent, /not valid UTF-8/);
    blocked();
  }
  for (const bad of ['%%%', 'a', 'data:text/plain;base64,aA==', '_w==']) {
    run(bad, 'decode');
    assert.match(nodes.statusMessage.textContent, /Invalid Base64/);
    blocked();
  }
  run(' aGVs\nbG8= ', 'decode');
  assert.equal(nodes.base64Output.textContent, 'hello');
  run('aA', 'decode');
  assert.equal(nodes.base64Output.textContent, 'h');
  nodes.base64Input.value = 'edited';
  edited();
  blocked();
  action('sample');
  nodes.base64Input.value = 'programmatic edit';
  blocked();
  action('sample'); action('clear'); blocked();
  action('sample');
  failClipboard = true;
  action('copy');
  await Promise.resolve(); await Promise.resolve();
  assert.match(nodes.statusMessage.textContent, /Clipboard access failed/);
  console.log('Base64 passed: Unicode/BOM round trips, malformed UTF-8, invalid syntax, whitespace, result invalidation and clipboard failure.');
}
test().catch(error => { console.error(error); process.exitCode = 1; });
