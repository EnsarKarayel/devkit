# Security

Formalint is currently a static, browser-only tool. JSON and XML input is processed locally by client-side JavaScript in this release.

## Current Protections

- No backend API.
- No account system.
- No upload endpoint.
- No third-party scripts in the current static release.
- Content Security Policy meta tags restrict scripts, styles, images, forms, frames and network connections to same-origin resources.
- Privacy and terms pages are available from every page.

## Recommended Hosting Headers

When a custom domain is connected through Cloudflare, Netlify, Vercel or another host that supports response headers, add equivalent HTTP headers:

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; connect-src 'none'; font-src 'self'; form-action 'none'; frame-src 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'nonce-formalint-schema'; style-src 'self'; upgrade-insecure-requests
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

## AdSense Note

When AdSense is enabled, the Content Security Policy must be updated to allow the approved Google advertising domains. Do not add broad wildcards until the exact production ad script and consent flow are known.
