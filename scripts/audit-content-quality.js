const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const files = fs.readdirSync(ROOT).filter((name) => name.endsWith(".html"));
const titles = new Map();
const descriptions = new Map();
const issues = [];
let indexableCount = 0;
let consolidatedCount = 0;

function textContent(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function remember(map, value, file, label) {
  if (!value) {
    issues.push(`${file}: missing ${label}`);
    return;
  }
  if (map.has(value)) {
    issues.push(`${file}: duplicate ${label} with ${map.get(value)}`);
  } else {
    map.set(value, file);
  }
}

for (const file of files) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] || "";
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  const expectedCanonical = file === "index.html" ? "https://formalint.com/" : `https://formalint.com/${file}`;
  const words = textContent(html).split(/\s+/).filter(Boolean).length;

  if (/noindex/i.test(robots) || (canonical && canonical !== expectedCanonical)) {
    consolidatedCount += 1;
    continue;
  }

  indexableCount += 1;

  remember(titles, title, file, "title");
  remember(descriptions, description, file, "meta description");
  if (!canonical) issues.push(`${file}: missing canonical`);
  if (words < 300) issues.push(`${file}: only ${words} visible words`);
}

const summary = `${files.length} HTML pages audited; ${indexableCount} indexable, ${consolidatedCount} consolidated/noindex; ${issues.length} quality warnings.`;
console.log(summary);
issues.slice(0, 80).forEach((issue) => console.log(`- ${issue}`));
if (issues.length > 80) console.log(`- ...and ${issues.length - 80} more`);

// This is an inventory gate: it fails only when core metadata is absent.
const fatal = issues.filter((issue) => /missing (title|meta description|canonical)/.test(issue));
if (fatal.length) process.exitCode = 1;
