const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const sitemapFile = path.join(ROOT, "sitemap.xml");
const today = "2026-09-30";
const changedToday = new Set([
  "regex-tester.html",
  "regex-email-validator.html",
  "xml-linter.html",
  "sql-cleanup.html",
  "changelog.html"
]);

function committedDate(file) {
  if (changedToday.has(file)) return today;
  try {
    const dates = execFileSync("git", ["log", "--diff-filter=A", "--format=%cs", "--", file], {
      cwd: ROOT,
      encoding: "utf8"
    }).trim().split(/\r?\n/).filter(Boolean);
    return dates.at(-1) || today;
  } catch {
    return today;
  }
}

const xml = fs.readFileSync(sitemapFile, "utf8");
const updated = xml.replace(/<url>\s*<loc>https:\/\/formalint\.com\/(.*?)<\/loc>\s*<lastmod>[^<]+<\/lastmod>/g, (block, route) => {
  const file = route || "index.html";
  return block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${committedDate(file)}</lastmod>`);
});

fs.writeFileSync(sitemapFile, updated, "utf8");
console.log("Restored conservative sitemap dates from page creation history.");
