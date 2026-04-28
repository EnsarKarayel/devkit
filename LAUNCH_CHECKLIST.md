# Formalint Launch Checklist

## Before Domain Launch

- Enable GitHub Pages from the `main` branch.
- Test `index.html`, `xml-formatter.html`, `regex-tester.html`, `jwt-decoder.html`, `timestamp-converter.html`, `base64-encoder-decoder.html`, `url-encoder-decoder.html`, `hash-generator.html`, `privacy.html`, `terms.html`, `robots.txt`, `sitemap.xml`, `ads.txt`, and `.well-known/security.txt`.
- Confirm mobile layout at 390px width and desktop layout at 1440px width.
- Use `formalint.com` as the primary domain.
- Redirect `formalint.com.tr`, `formalint.info`, and `formalint.online` to `https://formalint.com/` after the primary domain is live.

## SEO

- Submit the production domain to Google Search Console.
- Submit `https://your-domain.com/sitemap.xml`.
- Keep each tool page focused on one primary query.
- Add more useful reference content before adding many similar tools.

## AdSense

- Keep Privacy and Terms linked from every page.
- Replace `ads.txt` with the exact AdSense publisher line.
- Avoid intrusive ad placements around the editor buttons.
- Prefer one responsive ad below the tool and one between reference sections after approval.
- Update CSP only after the final AdSense script is known.

## Security

- Keep third-party scripts out until they are necessary.
- Do not add server-side logging of tool input without an explicit privacy update.
- Use HTTPS on the custom domain.
- Add HTTP security headers through the hosting/CDN layer when available.
