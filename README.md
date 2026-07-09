# Formalint

Formalint is a fast, privacy-friendly developer toolbox. The current release ships browser-based formatters, encoders, validators, and code cleanup tools.

## Tools

- JSON format, minify, validate, copy, download, and tree view
- JSON diff viewer for comparing two snippets side by side
- JSON Schema generator and basic validation from sample payloads
- API debugging checklist with local incident notes and Markdown report export
- HTTP status code reference with API debugging notes and filters
- HTTP headers reference for request, response, cache, CORS and security debugging
- XML format, minify, validate, copy, download, and JSON conversion
- YAML formatter and common structure checks
- SQL formatter, compact mode, and common query checks
- Python indentation and whitespace cleaner
- Regex tester with flags, matches, indexes, and capture groups
- JWT decoder with readable claims and expiration timestamps
- Timestamp converter for Unix seconds, Unix milliseconds, and ISO dates
- Base64 encoder and decoder for UTF-8 text
- URL encoder and decoder for query values and percent-encoded text
- SHA hash generator for text digests
- Cron expression parser with upcoming run previews
- UUID v4 generator
- HEX, RGB, and HSL color converter
- CSV to JSON converter
- Tools directory, about page, and contact page for trust and navigation
- Original developer guides and reference pages for API debugging, HTTP status codes, HTTP headers, JSON, JSON Schema, YAML, SQL, and safer use of online developer tools
- Local-first processing. Input is handled in the browser.
- GitHub Pages ready. No build step is required.

## SEO and Monetization Readiness

- Per-page titles, descriptions, canonical URLs, Open Graph and Twitter card metadata
- WebApplication and FAQ structured data
- `sitemap.xml` and `robots.txt`
- `tools.html`, `guides.html`, article pages, `about.html`, `contact.html`, `privacy.html`, `terms.html`, `ads.txt`, `SECURITY.md`, and `.well-known/security.txt`
- SVG favicon, wordmark, app icon, and social preview image

The production canonical and sitemap URLs use:

```text
https://formalint.com/
```

The root `CNAME` file points GitHub Pages to `formalint.com`.

## Open Locally

From PowerShell:

```powershell
Start-Process .\index.html
```

## Suggested GitHub Pages Setup

1. Push this repository to GitHub.
2. Open repository settings.
3. Go to Pages.
4. Set source to `Deploy from a branch`.
5. Select `main` and `/root`.

## AdSense Setup Notes

1. Publish the site on `formalint.com`.
2. Add the site in Google AdSense.
3. Keep `ads.txt` aligned with the publisher line from AdSense.
4. Keep the consent preference flow available from the footer.
5. Review Content Security Policy entries when adding new Google services or advertising partners.

## Frontend Direction

The UI should stay quiet, fast, and developer-focused: a compact header, direct tool workspace in the first viewport, restrained color palette, code-first panels, and reference content below the tool for search engines and AdSense review quality.

## Roadmap

- SQL to NoSQL converter
- Bulk file tools
- Premium API access
