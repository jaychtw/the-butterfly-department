# The Butterfly Department — release receipt

**Complete — v1.0.1**, implementing the owner-frozen v1.0 contract. No environment
configuration was republished. Incremental spend: $0; no paid providers, backend,
accounts or telemetry were added.

## Game

- Play: https://jaychtw.github.io/the-butterfly-department/
- Verified runtime/source commit: `86eee1a8689bf87c678ec4081d55810033b90c44`.
- Implementation: https://github.com/jaychtw/the-butterfly-department/pull/1 .
- Commute/causality correction: https://github.com/jaychtw/the-butterfly-department/pull/2 .
- Main validation: https://github.com/jaychtw/the-butterfly-department/actions/runs/42641836252 .
- Successful manual Pages deployment: https://github.com/jaychtw/the-butterfly-department/actions/runs/42641997207 .
- Independent live proof: `evidence/public/game-verification.json`, matching all
  11 deployed files exactly and performing real START, repair, causal archive,
  rewind and delayed-departure/private-appointment failure.

The game includes eight autonomous residents, six nodes and real graph travel,
three assignments and their ordinary-play win/fail routes, Open Desk, all four
intervention categories, the evidence-backed textual causal DAG, immutable
parent histories, computed counterfactuals, eight-resident/day comparisons,
local save validation/export/import, EN/zh-TW, keyboard/pointer/touch, optional
muted synthesized feedback and reduced motion. Original gameplay SVG is stored
as editable source; the approved raster cover remains unchanged.

Version 1.0.1 separates boarding a bus from actually reaching Nora's fixed
08:05 Hall appointment. Both rider and driver traverse the graph; shifts and
missed boarding produce real time conflicts. Simulation schema 2 rejects the
brief first build's schema-1 saves with recovery/export/reset; no automatic
migration is claimed.

## Independent Possibility publication

- Gallery: https://jaychtw.github.io/
- Catalog: https://jaychtw.github.io/games/the-butterfly-department/
- Catalog PR: https://github.com/jaychtw/jaychtw.github.io/pull/11 .
- Published portal commit: `85842e6f962c4682c1d8dd16ca9603246f99904f`.
- Successful exact-SHA manual dispatch: https://github.com/jaychtw/jaychtw.github.io/actions/runs/42644420279 .
- Independent live proof: `evidence/public/portal-verification.json` and
  `portal-integrity.json`; live approved cover, bilingual fact sheet, card/Play
  navigation and real START at desktop and phone widths.

Only the correct Games entry, approved exact WebP, destination evidence and
release documentation were added. Portal runtime, unrelated projects and the
manual publication policy remain unchanged. The pre-publication live rollback
source was `6833dfc191569e465fee37200740cbe94cd7261d`. One first validation attempt
failed in its fresh-link stage after all application/browser checks passed;
the same commit passed local validation, parallel CI and its failed-job rerun.

## Verification

| Check | Result |
| --- | --- |
| Pure core, ordinary engine win/fail witnesses, physical travel, dependencies, determinism, serialization and artwork custody | PASS — 16 Node tests |
| Real Chromium controls, all assignment wins, I failure, replay/branch preservation and cap, save round trip/corruption, fullscreen allow/deny, touch, language, reduced motion and audio/storage fallback | PASS — 39 browser checks |
| Targeted desktop/phone title, morning and archive WCAG A/AA audits | PASS — six audits, zero violations |
| Actual desktop/portrait/landscape and consequential gameplay screenshots | PASS — inspected; `docs/QA.md` indexes captures and recording |
| Game production build, deployed file identity and actual live interactions | PASS |
| Portal typecheck, lint/format, 14 catalog/publishing tests, gallery/Apps/Shadow browser suites, fresh links and clean exact-source packaging | PASS |
| Portal deployed integrity, real live card and Play destination | PASS |
| Firefox/WebKit, physical devices, OS-level minimize, assistive technology, independent human aesthetic/first-time-player review | NOT VERIFIED |

Blur/visibility handler checks use emulated browser conditions; no physical OS
minimize test is claimed. The game is a finite authored fictional model, not
open-ended social AI or real psychological advice. Human approval applies to
the frozen contract and supplied cover, not to unperformed final human reviews.

## Immutable source artwork

All nine handoff-manifest files passed exact size and SHA-256 verification.
The master is 1672×941, PNG; the 1920×1080 derivative is not native higher-detail
artwork. No layered PSD/AIF exists and no magazine reference images were added.

- `assets/approved/cover-master.png`:
  `52959c6c95ed6051791a42b746b1d71de58bce39e2cda138ce1097334c108411`
- `assets/approved/possibility-cover.webp` (also the exact admitted portal source):
  `d06a8435202b49657c834cad058df488bf297efafb3fa64f15d62fd352052c95`
- `assets/approved/title-1920x1080.png`:
  `55922480d699f12006d4aafbedd9301b3a814fbdc56f5d26fa3be4e2ded9c39a`

Original software code is MIT. Artwork, characters, narrative, localized game
text and design documents are rights reserved. See `CONTENT-RIGHTS.md` and the
original `ARTIFACT-INTEGRITY.json`.

This receipt is a documentation-only successor to the deployed game source;
its addition does not dispatch another Pages release. The runtime identity
above remains the independently verified published artifact.
