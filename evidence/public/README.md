# Independent public verification

The game receipt matches all 11 published files to the clean production build
at commit 86eee1a8689bf87c678ec4081d55810033b90c44. The portal receipt matches
all 152 public files to portal source 85842e6f962c4682c1d8dd16ca9603246f99904f.
Both actual browser runs kept TLS verification enabled and used the inherited
Cloud proxy with Chromium's existing NSS trust store (ordinary browser access
outside the filesystem command sandbox was needed for its database).

The two Python scripts are the actual executed workspace-specific verifiers,
preserved without replacing their logic with mock claims. They use the checked
out game/portal paths under /workspace and system Chromium/Playwright. The game
verifier expects dist built from the deployed game commit, not a later receipt
commit. To rerun, copy the verifier to scratch before checking out the release
commit in the existing isolated checkout, run npm run build, then set
GAME_COMMIT=86eee1a8689bf87c678ec4081d55810033b90c44 and run the copied script.
Return to the prior branch afterwards; do not create a worktree unless requested.
The portal browser verifier needs
PORTAL_COMMIT=85842e6f962c4682c1d8dd16ca9603246f99904f. The original portal
scripts/verify-published.py produced portal-integrity.json from its clean build.
No certificate-verification bypass was used.

The card crops and fact sheet are genuine public browser captures. The approved
promotional artwork is not presented as gameplay. Public repair/archive/delay
captures show the actual released game. See docs/DELIVERY.md for scope and limits.
