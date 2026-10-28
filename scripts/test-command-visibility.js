const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'assets/css/styles.css'), 'utf8');
// Guard the CSS contract used by the command search's hidden property.
// This source check supplements, and does not replace, browser verification.
assert.match(css, /\.workspace-command-palette\s+\[data-command\]\[hidden\]\s*\{\s*display:\s*none\s*;?\s*\}/);
assert.match(css, /\.workspace-command-palette:not\(\[open\]\)\s*\{\s*display:\s*none/);
console.log('Command palette CSS guards passed: hidden results and closed dialog.');
