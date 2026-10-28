# Formalint Quality Tracker

## Working Rules

Maintain this record after meaningful verification or a shipped fix, not merely
because a scheduled run occurred. Work from current main and preserve user edits.
Do not grow the page inventory to meet a quota. Do not repeat completed work unless
a regression or a relevant change warrants it.

AdSense has already been applied for. Its current review status is unknown without
fresh panel evidence. Do not submit reviews automatically or promise approval.
Short pages are not automatically low-value content. Canonical consolidation needs
equivalent intent/content; noindex is not an approval shortcut.

## Baseline: 2026-10-27

- Source reviewed: `3bdbe400b51a87828d4525fc22a7265686fdb9c1`; fetch completed,
  local main matched origin/main, and working tree was clean before this record.
- Root inventory: 301 HTML files; audit classifies 298 as self-canonical/indexable
  and 3 as consolidated/noindex. This is source eligibility, not Google's index count.
- Existing audit: `scripts/audit-content-quality.js`. It reports 91 warnings,
  including word-count heuristics. These are review candidates, not Google violations.
- Existing launch checklist is historical, not evidence that deployment, consent,
  accessibility or AdSense checks have passed.
- No current Search Console data or AdSense panel access in this run. Historical
  regex/email/XML screenshots are not current metrics.

## Live Browser Evidence

Observed `https://formalint.com/` and `https://formalint.com/workspace.html`
in the in-app browser at its available desktop viewport (screenshot 1265 x 712).

- Homepage loads the sample JSON editor and result, navigation and consent banner.
- Workspace loads the JSON sample and interactive tree.
- Opened workspace command palette from header, pressed Escape: palette disappeared
  and focus returned to trigger. Reopened and clicked Close command palette: closed.
  The formerly reported stuck modal was not reproduced in this desktop session.
- Workspace header is crowded: command trigger's focused outline intrudes into
  the Local Sandbox status area at this width. Treat responsive layout as open.
- Homepage exposes a very long portal of guide links plus additional library links;
  two sidebar groups use the same Database Operations label. Navigation needs
  task-based review, not further link accumulation.
- Mobile verification is OPEN. The exposed tab capabilities did not include viewport
  resizing; no 390px test was performed. Desktop observations are not mobile proof.
- This was a limited smoke check, not certification of all tools or menu controls.

## Prioritized Open Work

| ID | Priority | Scope | Evidence / next action | Completion gate |
| --- | --- | --- | --- | --- |
| Q01 | P1 | workspace.html header and shared navigation | Reproduce crowded command/status area; inspect CSS sizing and focus outline. | Desktop 1265px and 1440px plus mobile 390px screenshots; readable controls, no overlap; keyboard navigation verified. |
| Q02 | P1 | Homepage/workspace mobile and dialogs | Mobile not exercised; preserve known desktop close behavior. | Test menu open/close, command search, Escape, close button, focus return and editor access at mobile size. |
| Q03 | P1 | Core tool accuracy | Existing regressions pass; browser exercise of JSON/XML/YAML and large/invalid payloads remains incomplete. | Record expected/actual output, error recovery and copy/export state; add regression only for a demonstrated gap. |
| Q04 | P2 | index.html, tools.html, sidebar | Long portal and duplicate group label observed. Review discoverability and repeated links. | Useful tool entry points remain accessible; no broken links; desktop/mobile inspection of revised navigation. |
| Q05 | P2 | Similar content families | Compare email PHP guides, API error-response guides and XML lint guides by actual content and user task. No consolidation decided today. | Document pairwise overlap and unique value before any canonical/redirect/noindex decision. Preserve distinct useful material. |
| Q06 | P2 | Privacy, consent, forum | Audit actual network behavior before/after consent and match privacy/local-processing claims; preserve emoji. | Browser evidence, consent withdrawal check and forum emoji round trip, with no private payloads sent. |
| Q07 | P2 | Search intent / metadata | Current Search Console export unavailable. Metadata inventory alone cannot establish CTR opportunities. | Use fresh query/page/position data when available; request a 28-day export only when selecting search-driven edits. |

Next priority: Q01 and Q02 together. Do not mark a UI fix complete without both
desktop and mobile evidence. If browser testing remains unavailable, retain the
blocker instead of silently passing the visual gate.

### Q02 confirmed defect: command search visibility (2026-10-28)

At live `workspace.html`, open the header command palette and type `minify`.
All six commands remain exposed in the accessibility tree. Read-only DOM inspection
confirms five nonmatching buttons have `hidden: true` but computed `display: flex`.
`assets/css/styles.css` sets display:flex on `.workspace-command-palette [data-command]`
without a matching hidden-state rule; the input listener in `assets/js/workspace.js`
does set the hidden property correctly. This is a confirmed filtering defect, not
a repeat of the previously resolved dialog-close issue.

Next fix: narrowly restore display:none for hidden command buttons, then test
matching, no matches, clearing the query, closing/reopening and keyboard access.
Do not mark Q02 complete based on this diagnosis alone.

Browser viewport control is available at the browser capability level (not the
tab level). On this run it successfully set 390 x 844, verified via DOM dimensions.
However, both screenshot APIs failed, including after resetting the viewport;
the final capture reported a Page.captureScreenshot timeout. Mobile functional
inspection is now possible, but the visual gate remains BLOCKED. The temporary
viewport override was reset. No CSS fix has been shipped without visual validation.

## Verification Log

### 2026-10-28 follow-up: Q02 command filtering fixed locally

- Added scoped `[data-command][hidden] { display: none; }` so the existing
  search listener's hidden state takes precedence over the flex button layout.
- Local browser testing at desktop default (1265 x 712) and 390 x 844: `minify`
  leaves one visible command; nonmatching commands have computed display:none.
  Mobile unmatched query hides all commands; clearing restores six. Escape and
  Close both dismiss the dialog; reopening restores six commands.
- Desktop and mobile screenshots succeeded on this follow-up and were inspected.
  Earlier capture blocker did not recur. Temporary viewport override reset.
- Added a source-level CSS guard, explicitly not a replacement for browser tests.
- Q02 filtering defect is resolved locally; broader navigation/keyboard coverage
  and Q01 header sizing remain open. No claim that every mobile flow is tested.
- No new pages, consolidation, consent or forum changes. Search Console action: none.
- All 12 regression test files passed; changelog lastmod updated only for its real
  content change. Workspace markup and other sitemap dates remain untouched.

### 2026-10-28: confirmed command-filter defect; visual verification blocked

- Fetched origin; working tree was clean on main before the documentation update.
- Inspected current CSS and workspace search listener, reproduced the live search
  defect at 390 x 844 and confirmed the hidden/computed-style conflict.
- No public URLs improved or changed in this run. Inventory remains the prior
  verified 301 HTML / 298 source-indexable baseline; no page or sitemap edits.
- No runtime changes, so regression suites were not rerun. No claim of visual
  completion, current Search Console performance, AdSense status or deployment.
- Search Console action: none. Resume Q02 filtering fix when screenshot capture
  works, then address Q01 header sizing with desktop and mobile checks.

### 2026-10-27: baseline established, no public-page changes

- All 11 `scripts/test-*.js` files passed, including published JS/Python examples,
  regex behavior, URL/Base64 input errors, SQL error state, XML conversion/state and YAML.
- Content audit ran: 301 HTML, 298 eligible, 3 consolidated/noindex, 91 review warnings.
- Parsed sitemap XML: all 298 targets exist and none has a noindex meta tag.
- Scanned root HTML href file targets: zero missing local targets. This does not
  validate fragments, external services or every dynamically generated menu link.
- Parsed 322 JSON-LD blocks successfully. Syntax validity does not prove visible-content
  consistency or rich-result eligibility; semantic review remains open.
- No sitemap, lastmod, canonical, robots, forum, payload handling or public content changed.
- No new Search Console action needed for this documentation-only change.
- No production deployment claim: live observations above describe the existing site,
  not deployment of this repository record.
