# Formalint

Formalint is a fast, privacy-friendly developer toolbox. The first release ships a JSON formatter and validator plus an XML formatter, validator, and XML to JSON converter.

## Tools

- JSON format, minify, validate, copy, download, and tree view
- XML format, minify, validate, copy, download, and JSON conversion
- Local-first processing. Input is handled in the browser.
- GitHub Pages ready. No build step is required.

## SEO and Monetization Readiness

- Per-page titles, descriptions, canonical URLs, Open Graph and Twitter card metadata
- WebApplication and FAQ structured data
- `sitemap.xml` and `robots.txt`
- `privacy.html`, `terms.html`, `ads.txt`, `SECURITY.md`, and `.well-known/security.txt`
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
3. Replace the placeholder line in `ads.txt` with the publisher-specific line from AdSense.
4. Add a consent/CMP flow if targeting regions that require consent.
5. Only then add AdSense script tags and update the Content Security Policy to allow the exact Google ad domains.

Do not publish fake ad units or placeholder ad code. Empty ad containers can hurt the user experience and are not needed before approval.

## Frontend Direction

The UI should stay quiet, fast, and developer-focused: a compact header, direct tool workspace in the first viewport, restrained color palette, code-first panels, and reference content below the tool for search engines and AdSense review quality.

## Roadmap

- Regex tester
- Cron expression parser
- SQL to NoSQL converter
- Bulk file tools
- Premium API access
