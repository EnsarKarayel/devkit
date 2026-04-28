# DevKit Launch Checklist

## Before Domain Launch

- Enable GitHub Pages from the `main` branch.
- Test `index.html`, `xml-formatter.html`, `privacy.html`, `terms.html`, `robots.txt`, `sitemap.xml`, `ads.txt`, and `.well-known/security.txt`.
- Confirm mobile layout at 390px width and desktop layout at 1440px width.
- Replace temporary GitHub Pages URLs after the real domain is connected.

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

