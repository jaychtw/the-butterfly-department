# The Butterfly Department

A local-first, bilingual game of small interventions and independent lives.
The frozen contract is [docs/GDD-FINAL.md](docs/GDD-FINAL.md), with AICP 2.1.1
and UGDS 2.0.0 pinned to standards commit
`61c24205f437826f1fc901f1741c49b677502f66`.

## Develop and verify

Node 24 and Python 3 are sufficient for the app. It has no npm dependencies,
remote runtime assets, accounts, telemetry, API keys or backend.

```sh
npm test
npm run build
python3 -m http.server 4173 --bind 0.0.0.0 --directory dist
```

The production path is `/the-butterfly-department/`. Use the existing isolated
checkout; do not create a worktree unless explicitly requested. Processes must
restart in each task; files alone do not start a server.

Browser QA: install Python `playwright==1.62.0` in a virtual environment, use
system Chromium, and run `python3 tests/browser.py` while the production server
runs. `CHROMIUM_PATH` overrides `/usr/bin/chromium`. Optional `RECORD_BROWSER=1`
requires Playwright's FFmpeg executable; an installed trusted system FFmpeg may
be linked at `$PLAYWRIGHT_BROWSERS_PATH/ffmpeg-1011/ffmpeg-linux`. No verification
is disabled. To reproduce the accessibility audit, install `axe-core@4.14.0` in
a separate QA directory and set `AXE_PATH` to its `axe.min.js` before running
`python3 tests/accessibility.py`.

## Play

START attempts fullscreen; denial keeps windowed play. Choose an assignment,
then one intervention (or none) each morning. Play/pause, 1×/4×, next meaningful
event and observe-to-evening control time. Select a resident on the map or name
strip to inspect their knowledge, commitments, trust and schedule. The archive
contains actual chronology, dependency links and timeline comparison. Rewind
creates a preserved parent and a new morning branch. A maximum of 12 tips per
assignment prompts export or explicit deletion. Export/import uses local JSON.
The desk menu returns to title and manages saves. EN/繁中 switching retains the
same canonical simulation; optional synthesized feedback defaults muted.

[scenarios.json](scenarios.json) records ordinary-engine winning/failing routes.
[docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) explains delegated schedule
choices and rule boundaries. [docs/QA.md](docs/QA.md) indexes actual evidence and
limitations. Original software is MIT; **art, characters and creative text are
rights reserved**, as described in [CONTENT-RIGHTS.md](CONTENT-RIGHTS.md).

Publication uses protected-main PRs, validation, then manual `Publish game
Pages` dispatch on main. The only game destination is
https://jaychtw.github.io/the-butterfly-department/ . Possibility publication is
an independent, later operation under its own exact-SHA workflow.
