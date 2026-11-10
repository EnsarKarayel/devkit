const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/shared.js'), 'utf8');
const paletteSource = source.slice(source.indexOf('  function createCommandPalette('), source.indexOf('  function filterSidebarLinks('));
const handler = paletteSource.match(/document\.addEventListener\("keydown", (function \(event\) \{[\s\S]*?)\n    \}\);/);
assert.ok(handler, 'shared palette keyboard handler exists');
let focused;
const first = { focus() { focused = this; }, getClientRects: () => [1] };
const last = { focus() { focused = this; }, getClientRects: () => [1] };
const input = {};
let opened = 0;
let closed = 0;
let navigated = 0;
const context = {
  input, palette: { hidden: false }, document: { activeElement: first },
  currentResults: [{}, {}], activeIndex: 0,
  $$: () => [first, last], renderResults() {},
  openPalette() { opened++; }, closePalette() { closed++; },
  openActiveResult() { navigated++; }
};
vm.createContext(context);
const keydown = vm.runInContext('(' + handler[1] + '\n})', context);
function press(key, target = input, extra = {}) {
  let prevented = false;
  keydown({ key, target, preventDefault() { prevented = true; }, ...extra });
  return prevented;
}
assert.equal(press('Enter', first), false, 'Close keeps native Enter click');
assert.equal(press('Enter', last), false, 'links keep native Enter navigation');
assert.equal(navigated, 0);
assert.equal(press('Enter'), true);
assert.equal(navigated, 1);
press('ArrowDown');
assert.equal(context.activeIndex, 1);
press('ArrowUp');
assert.equal(context.activeIndex, 0);
assert.equal(press('ArrowDown', last), false);
press('Tab', first, { shiftKey: true });
assert.equal(focused, last);
context.document.activeElement = last;
press('Tab', last);
assert.equal(focused, first);
press('Escape', last);
assert.equal(closed, 1);
context.palette.hidden = true;
assert.equal(press('Enter'), false);
press('k', input, { ctrlKey: true });
assert.equal(opened, 1);
assert.match(paletteSource, /document\.addEventListener\("click",/);
assert.match(paletteSource, /aria-label="Search tools and guides"/);
console.log('Shared palette keyboard regression checks passed; browser tests cover native clicks and focus.');
