# The Butterfly Department — FINAL Game Design & Delivery Contract v1.0

**Status:** FINAL — explicitly approved Design Freeze, 2026-11-09 (Asia/Taipei).  
**Owner:** Creative director. **Design partner:** ChatGPT. **Implementation:** Codex.  
**Authority:** This document specifies the approved experience and delivery boundaries; it does not claim code or release already exists.  
**Repository:** `https://github.com/jaychtw/the-butterfly-department` (public), protected `main`; new work through a branch and PR.  
**Adopted standards:** AICP **2.1.1**, UGDS **2.0.0**, immutable `jaychtw/game-development-standards@61c24205f437826f1fc901f1741c49b677502f66`.  
**Mode:** **Release**; no substitution of an experiment or technical demo for the complete v1.0 game.  
**Authorization evidence:** Creative director's 2026-11-09 explicit message: “Design Freeze approved for The Butterfly Department v1.0. I approve the complete design direction, the previously agreed licensing and publication permissions, and the approved illustrated cover as the exact catalog and title-screen artwork. Produce the FINAL GDD and complete one-shot Codex instruction, preserve the artwork with the handoff, and authorize Codex to execute within the frozen requirements and $0 constraints.” The owner separately approved MIT for original code, rights reserved for original art/narrative, exact GitHub Pages project publication, and an independently authorized Possibility Games entry.

## 1. Vision, boundaries and non-goals

**Pitch:** The player is Employee 17 at an obscure Department of Coincidences. In Bellwether, eight residents pursue ordinary goals independently for five days. At most one small, lawful environmental intervention per day changes what they encounter. The player observes second-order consequences, analyzes what actually caused them, and compares counterfactual timelines. The player influences circumstances **but never commands a resident's motives, dialogue, relationships or decisions**. A seemingly beneficial intervention may impose a meaningful opportunity cost on someone else. Curiosity, wonder, doubt and reflection—not moral scoring—are the emotional arc.

**Required player experience:** From a beautiful title illustration, press START and enter an inspectable living town; see independently moving residents; make a small intervention or none; watch a plausible chain of actions; examine an evidence-backed Causality Archive; rewind and branch; complete three distinct objectives; unlock an objective-free Open Desk. The opening supervisor line, localized: “Do not mistake an intention for a consequence. And do not mistake a consequence for a mistake.”

**Audience:** Curious teens and adults; approachable to younger readers with optional hints. Warm, witty, lightly wistful, no death, violence or catastrophes. No claim to model real human psychology or to provide real-world causal advice.

**Non-goals:** Sims-like open-ended artificial intelligence, large free-roaming 3D city, conversational LLM/NPC APIs, player-directed NPC commands, unlimited procedural narratives, multiplayer, accounts, online leaderboards, telemetry, advertising, external runtime services, paid dependencies, simulation of real people, or misleading omniscient moral grading. Other features remain out of scope unless explicitly frozen here.

## 2. Core game contract

### 2.1 Scenarios and advancement

- **Assignment I — The Last Loaf:** 3 days (Monday through Wednesday). Mara's oven has failed. Win when oven repaired by **Wednesday 14:00** and bakery still open at Wednesday 18:00. The bakery otherwise closes at Wednesday 18:00. Show its cost to other residents. The required validated winning witness is an early, truthful public repair notice at the workshop, enabling Elias to take the repair job; no-intervention must fail.
- **Assignment II — Two Empty Chairs:** 4 days (Monday through Thursday). Estranged friends Elias and Ada must **both voluntarily participate in two distinct positive conversations** by Thursday 18:00, with end-of-run mutual relationship score at least **2**. A public library-history exhibit notice can prompt Elias to attend Ada's event; on at least one timeline the opportunity competes with a scheduled repair obligation. No-intervention must fail.
- **Assignment III — A Town Worth Keeping:** 5 days (Monday through Friday). Jun must collect **three distinct residents' accepted commitments** to Friday's community gathering by Friday 14:00, and at least **three distinct residents actually attend** at 16:00. At least one successful path must involve an indirect multi-day chain; no-intervention fails. Show who gave up an alternative engagement. A successful gathering isn't described as morally optimal.
- Each assignment starts from a **fixed independent initial scenario snapshot** of the same neighborhood and eight actors. Outcomes in Assignment I/II **do not transfer** to the next assignment, preventing forced canon, while unlocked assignment status persists. Unlock II after completing I; unlock III after completing II. Any assignment may be replayed after unlock. Distinguish completed objective from all residents' welfare.
- Completing all three unlocks **Open Desk**, with a five-day fixed-start sandbox; no win/loss or score, all legal interventions from that scenario and unlimited replays/branches. Open Desk retains finite authored schedules, events and intervention types: do not promise infinite content.
- At the end of each scenario, display objective success/failure and at least two other meaningful resident outcomes; offer archive, replay and next assignment if unlocked. Avoid fabricated narrative conclusions.

### 2.2 Time and interaction phases

- Simulation time is Monday–Friday **07:00–19:00**, in **5-minute discrete ticks** (144 intervals per day). A scenario may finish after its stated day. Scheduled event times and travel durations must align to ticks. At 19:00 the day ends and next day's 07:00 resumes. No overnight user input. Time/date and resident state are explicit.
- **Morning intervention phase** at **07:00**: select exactly one legal action from the day's surfaced inventory, or **Do Nothing**. Once the day starts, that choice is immutable on this branch; branch from a pre-intervention checkpoint to change it. Interventions cannot be made during playback. The selected daily intervention applies once and incurs no hidden second effects.
- **Observation phase:** pause, 1×, 4× and skip-to-next-meaningful-event; human-readable event list and resident inspector; residents visibly traverse the actual location graph. Simulation cannot proceed while paused, at title, in a modal, while hidden/unfocused, or during archive review. Any `requestAnimationFrame` gaps and tab return cannot add simulated time; don't fast-forward automatically after suspension.
- **Evening review:** objective meter, visible major events, relationship/commitment changes, failed opportunities and link to archive; continue to next morning or branch. Show final outcome on completion.
- Start/restart/resume: START from title opens assignment picker/continue; first-time users receive the supervisor introduction and guided I. Pause menu supports resume, archive, return to title, and reset current branch (confirmation); normal browser Back/reload must not duplicate simulation effects.

### 2.3 Six locations and travel

One readable illustrated continuous neighborhood: **Bakery, Bus Stop, Workshop, Library, Park, Community Hall**. A flower stall is integrated into the Park edge, not a seventh simulation node. At least two interiors are indicated via lighting/window animation, but internal floor plans are not required. All nodes have visible names in both languages.

Use an undirected weighted graph with **5-minute travel edges**: Bakery–Bus Stop, Bakery–Park, Bus Stop–Workshop, Bus Stop–Park, Workshop–Community Hall, Park–Library, Park–Community Hall, Library–Community Hall. A movement route uses shortest travel time; equal-cost paths resolve via fixed alphabetical node IDs, not randomness. Arriving and departing events must use actual route edges. Residents visibly traverse segments at a pace tied to simulation time; fast-forward changes rendering speed only, not decisions.

### 2.4 The eight residents

Each resident must have a recognizable original portrait/silhouette, accessible name and two-line motivation. They are autonomous state machines; occupation is not a restriction on lawful visits. Exactly these characters exist in the released simulation:

| Resident | Default anchors | Motivations and conflicts |
|---|---|---|
| Mara, baker | Bakery 07:00–17:00; Park 17:00–18:00 | Maintain the bakery; values independence; may reluctantly ask for repair. |
| Elias, retired engineer | Workshop 09:00–11:00; Park 11:00–12:00; Library 15:00–16:00 | Wants to feel useful; friendship with Ada is strained; already promises time to others. |
| Nora, commuter | Bus Stop 07:30–08:00; Community Hall 12:00–13:00 | Employment appointment; prefers punctuality and dislikes uncertain detours. |
| Theo, florist | Park stall 08:00–12:00; Bakery 13:00–14:00 | Reconnect with sister; flowers/errands provide useful opportunities. |
| Iris, nurse | Bus Stop 08:00–09:00; Library 16:00–17:00 | Values rest and personal boundaries; accepts some invitations but not all. |
| Felix, bus driver | Bus Stop 07:00–09:00 and 16:00–18:00; Hall 12:00–13:00 | Maintains scheduled departures; one delay creates real costs. |
| Ada, librarian | Library 09:00–17:00; Park 17:00–18:00 | Preserves neighborhood memory; wishes to reconcile with Elias, without chasing him. |
| Jun, student | Library 08:00–09:00; Hall 11:00–15:00; Park 16:00–17:00 | Wants neighbors at gathering; hesitant to ask directly. |

These are **default availability windows**, not rigid teleportation scripts. A day's task or event can occupy part of a window; path travel consumes ticks, and a missed opportunity remains missed. The GDD delegates the exact unoccupied minutes and reaction dialogue to Codex **within** the deterministic rules and acceptance witnesses. The employment appointment and gathering are fictional community events, not external data.

### 2.5 Character state and deterministic action selection

Each resident holds: current node/edge and route, agenda/time windows, up to **two active commitments**, observed fact flags, integer trust toward other residents from **-2 to +2** (symmetric for friendship outcome; private preferences can be asymmetric), energy **0–3**, and optional bounded task status. Initial values are fixed per assignment; no stochastic decisions. `observedFacts` changes only from visibly reachable notices, encounters or interactions. Fact knowledge never teleports among residents. If an event has multiple eligible actors, resolve by fixed actor IDs; if one actor has competing actions, resolve in order: **safety/no impossible overlapping travel → already accepted commitment → urgent work/medical duty → triggered personal opportunity → ordinary routine → idle**. A resident can never be in two locations at once, commit to simultaneous incompatible plans or have trust outside range.

Rules, shared across scenarios (no assignment-specific invisible character puppetry):

1. **Notice discovery:** at arrival at a notice-bearing location, a resident reads one visible notice if they have a 5-minute free slot and a matching interest; record fact/source/time. Notices have authored truth conditions, expiration and location; no false notices.
2. **Repair request:** if Mara's oven is broken and Elias learns via a truthful public notice or on-location conversation, he may accept one 60-minute repair task on the earliest available slot before Wednesday 14:00, provided it doesn't displace an accepted commitment. Travel to Bakery is required; repair completion sets `ovenOperational=true` and can avert closure.
3. **Encounter:** two residents at one node with an available 10-minute overlap and a shared relevant fact may converse; trust improves by one only on a permitted positive topic and with neither resident under an overriding obligation. A conversational pair can receive at most one trust increment per day. Source records contain the topic and factual prerequisite.
4. **Exhibit:** Ada hosts a library memory exhibit Tuesday 11:00–12:00, if the public event has been announced. Elias with corresponding observed fact may attend if travel/commitments allow. A second eligible conversation requires another distinct encounter on a later day, not replaying the same event.
5. **Gathering invitation:** Jun speaks to residents at a shared node when both have a free 10-minute slot. Residents commit if informed of the Friday event, have no Friday 16:00 conflict, their energy is at least 1, and priority/trust rules permit. One commitment per person; attendance requires location and travel, not merely a promise.
6. **Delay:** moving a public activity within a listed ±15-minute slot changes its actual event start, and any dependent travel/waiting, but never changes fixed bus departure times unless the specific authorized intervention explicitly targets that departure. Missed rides must cause a real time conflict.
7. **Physical object:** an umbrella at Park or Bus Stop is available to the first eligible resident during authored rain; using it causes an explicitly modeled 5-minute interaction and possibly a missed departure. This must be recorded, not imposed directly as a story outcome. Unavailable objects cannot be picked up twice.
8. **Opportunity cost:** if a resident fulfills one commitment, any mutually exclusive opportunity is recorded as **missed**, and affected people receive their own truthful event summaries; no hidden global happiness score.

Use static fictional rain windows by scenario/day; weather is **external immutable input**, not rerolled on branching. Schedule, trust and fact values are visible or discoverable in residents' inspectors. Private unobserved motivations may be introduced through a discoverable diary/character card, never contradicted later. Contextual micro-dialogue is authored and localized; no fabricated AI improvisation.

### 2.6 Player interventions and legal bounds

Exactly **one** intervention selection per day, from at least **three visibly different legal options** appropriate to that scenario/day, or **Do Nothing**. The full inventory contains these four categories, all usable in the released experience:

| Category | Legal example | Constraints |
|---|---|---|
| Relocate | Move one unowned communal umbrella between Park and Bus Stop | Only allowed public fixture, valid destination and not in another person's possession; move at 07:00. |
| Inform | Post a truthful repair / exhibit / gathering announcement at an allowed public noticeboard | Facts must already be true for scenario; one announcement per action; locations Workshop, Library, Park or Hall. |
| Delay | Shift one permitted public activity start by -15, -10, -5, +5, +10 or +15 minutes | Cannot move fixed private appointments or extend beyond opening; explicitly display old/new time. |
| Arrange | Move one free communal bench/display between two designated public spots within Park/Hall | Alters encounter/readability/route availability through defined 5-minute affordances; no residents teleport. |

Inventory must be **authored and feasible**: every option's actual preconditions and effect are recorded, with readable description. Multiple syntactically different options that are mechanically inert must not be passed off as strategy. At least one intervention from **each category** must cause a measurable event difference in an assignment or Open Desk. Illegal actions disabled with specific reason. Do Nothing is valid, consistent and observable; no hidden punishment.

### 2.7 Required assignment content and outcome witnesses

Create authored initial condition snapshots and a short machine-readable witness specification for each scenario. Codex must demonstrate **one real engine-played win and one fail** per assignment, without test-only state teleportation; the no-intervention baseline must fail each objective. In at least one winning route, the player must take **two causally necessary interventions on different days** and at least **three residents** must have state-relevant events; not all positive outcomes may be solely scripted by a single intervention. Assignment I's notice→read→accept→travel→repair chain and Assignment II's notice→attendance→first conversation→second encounter chain must appear in real event dependencies. Assignment III needs announcement/encounter/commitment/actual travel to gathering; fulfilling an invitation must preclude at least one documented alternative opportunity on one valid route.

If the initial schedules and rules cannot yield these witnesses, Codex may adjust **non-identity idle slots, initial fact distribution, authored option selection and objective timing within stated windows** to produce coherent play while preserving causal rules, five-day limit, named participants, and meaningful trade-offs. It may **not** substitute a hidden win switch, fake causal archive, shrink the assignment count, change objective definitions, or introduce unapproved supernatural powers. If no credible solution is feasible within these bounds, treat as material-design blocker per AICP §6.

### 2.8 Save, replay and branch semantics

- Save after morning selection, every evening, successful assignment and branch creation; store the full deterministic snapshot plus version, scenario ID, all prior intervention choices, current tick, observed event log and immutable initial seed; include checksum/structural validation. Invalid data displays recovery choice; never execute untrusted saved expressions. No personal data beyond local settings/state.
- On selecting **Rewind**, player chooses any previous day-start checkpoint on the current branch, chooses an alternative intervention and creates a **new immutable branch**. Parent history remains available. Creating a branch never rewrites old events. Maximum **12 saved branch tips** per scenario; on overflow, prompt to archive/export or delete a selected tip; never silently evict. The current branch can be selected independently. Support export/import JSON with structural validation and no account/network.
- **Compare:** select any two saved branches in the same scenario and initial-conditions version. Show diverging earliest state/event and day-by-day comparison for all eight residents, missed opportunities, commitments and objective outcome. Comparing identical timelines shows no differences. A baseline counterfactual is the simulation of identical initial state, external conditions and prior choices, replacing only the chosen intervention with Do Nothing; explicit label that it is a **computed counterfactual**, not another person's memory.
- Pause, fast-forward, rewind and language/display changes cannot alter event ordering. A branch's serialized state and replay of its interventions must yield exactly the same normalized event log and final state; compare stable IDs and structured values rather than localized prose.

### 2.9 Causality Archive, truthfulness and epistemic constraints

Three views accessible from observation/evening/results:

1. **Chronology:** actual time-ordered events, including travel, discoveries, encounters, fulfilled/missed commitments and closures.
2. **Causal Connections:** a directed acyclic graph of **recorded input dependencies** (e.g. repair notice → Elias reads fact → schedules repair → arrives → oven fixed). Include reason/source identifiers and time. Do not draw arrows because two events merely followed each other. For a causal edge `A→B`, B's evaluated rule must declare A or the state change A produced among its necessary enabling conditions. Explanations must withstand replay.
3. **Parallel Lives:** differences in named resident state, appointments, trust, observed facts, missed opportunities and objective status between two timelines.

Distinguish **recorded enabling causes**, **observed correlation**, and **counterfactual difference**. A dependency arrow is not proof that the cause was unique or sufficient. If several prerequisites combine, show all. If a change cannot be precisely attributed from the engine, show **“Cause not established”** rather than invent a causal chain. Every highlighted counterfactual difference must be computed from actual runs, not generated by a canned branch-name table. Archive filtering, node inspection and keyboard-accessible textual alternatives are essential.

## 3. Visual, sound, title and usability

### 3.1 Approved artwork — exact source custody

**Owner-approved, authoritative original**: `assets/approved/cover-master.png`, **1672×941**, SHA-256 **`52959c6c95ed6051791a42b746b1d71de58bce39e2cda138ce1097334c108411`**. This is the exact illustrated editorial-magazine-inspired Bellwether cover with integrated cream serif title **“The Butterfly Department”**. Do not redraw, re-generate or alter the master. Companion `assets/approved/possibility-cover.webp` is the image derivative for the portfolio, SHA-256 **`d06a8435202b49657c834cad058df488bf297efafb3fa64f15d62fd352052c95`**. Display-only 1920×1080 `assets/approved/title-1920x1080.png` letterboxes with a softened extension; it contains the original master unchanged at native dimensions and is **not** a new higher-detail image. Preserve provenance in `assets/approved/ARTWORK-MANIFEST.json`.

AIF/PSD/editable layers **do not exist**; do not claim the raster master is editable layered source. Original cover imagery is approved for game title and Possibility; it is **promotional artwork, not evidence of actual running gameplay**. Gameplay art must be original and stylistically compatible, not simply crop cover characters into sprites of inconsistent identity. Reuse the already approved cover exactly for catalog and title. If bytes are unavailable, STOP that affected image/publication step rather than substituting an approximation.

### 3.2 Title screen and fullscreen

- Title page uses the approved cover as a landscape 16:9 background in an immersive FHD-capable adaptive layout. Keep **all embedded title lettering visible**; do not overlay another duplicate heading on top. **START** is prominent, placed near the visual center but on a deliberately legible scrim/plate; do not obscure the artwork's existing large title. Minimal visible controls: **EN / 繁中**, fullscreen enter/exit, optional sound toggle; keyboard focus and touch targets maintained.
- Pressing START (direct user gesture) **requests fullscreen** where supported, and starts/continues gameplay whether request succeeds or is denied. Support a regular window at all times; manual minimize/exit and Escape never lose state. Never automatically re-enter fullscreen after an explicit exit, reload or returning from a hidden tab. On mobile, use responsive edge-to-edge layout if fullscreen API is denied.
- The gameplay shell is full-screen-capable with a fixed visible map area and collapsible nonessential panels; archive and character inspector may use overlays/side sheets while preserving spatial orientation. Desktop pointer and keyboard and touch phone interactions must be discoverable. Landscape view offers richest town overview; portrait rearranges panels without blocking play (no forced device rotation).

### 3.3 Runtime aesthetic and audio

- Original 2D hand-illustrated/storybook neighborhood with warm light, pastel masonry, green spaces and readable architecture. Reference editorial illustration sensibility, **not** The New Yorker logo, masthead or a specific copyrighted cover. Fixed overview with pan/zoom and resident-follow; actual route movement visible, at least six distinct location facades and eight visually distinguishable characters/portraits. Small but meaningful ambient animation (tree/lamplight/door/bus) and stateful changes (notices, activity, evening). At card/phone scale, no essential text is painted only into the background.
- Avoid generic icons on an empty grid, static background falsely claiming travel, mismatched placeholder sprites or impossible geometric positions. Visual quality checks must include title, intervention selection, mid-day map, meaningful encounter, two-timeline archive, evening and ending, desktop and phone.
- Optional synthesized or locally bundled soft ambient music and event feedback, default **muted** until explicit player activation. Separate mute accessible everywhere. Essential cues also appear as text/icons. Respect OS reduced-motion; suppress nonessential flourish without removing meaningful movement/path and causality information. No flashing effects.
- English and Traditional Chinese everywhere: title controls, intro, residents, goals, interventions, tooltips, event cards, hints, archive, results, errors, alt text/accessibility labels. Centralized dictionaries and parity checks; instant language switch retains exact gameplay state. Default browser language if supported, fallback English; persist preference locally. Character names consistent across translations.

## 4. Technical boundaries, privacy, performance, fallbacks

- **Web-only** responsive desktop/mobile, keyboard, mouse, touch. Modern Chromium primary; check one alternative browser engine where runner is available, otherwise explicitly Not Verified. No required physical-device test unless available; do not claim performed. Accessible focus, tab order, native/control labels, contrast, non-color signals, 44px practical touch targets, no essential hover-only input; a fully nonvisual visual-map equivalent is not promised, but event/causal information needs semantic textual access.
- Static deployment via GitHub Pages at exact URL below. A local-first dependency-light TypeScript/JavaScript implementation (Canvas/SVG/DOM/Vite as Codex chooses) with no backend, API keys, subscriptions, telemetry, CDNs or remotely fetched images/fonts. UI/data/storage separated from pure deterministic simulation. Gameplay requires no network requests after app assets load. Browser-local progress plus manual export/import; cloud synchronization not required.
- Fixed small agent population and one scenario instance active. Target smooth input and event response on ordinary laptops and contemporary phone browser emulation; if decorative effects degrade responsiveness, disable optional animation before degrading mechanics. Bound event log size and graph layout work; maintain complete logical records for saved branches.
- **Fallback order:** fix to frozen spec → approved nonessential rendering reduction (pose-based sprites, less ambient detail, simplified shadows, DOM archive rather than canvas graphs) → technically equivalent implementation preserving player-visible simulation, causal truth, localization and visual floor → isolate genuine blocker. Never cut residents, locations, assignments, branching, original approved cover, objective rules or real causal dependencies. If fullscreen denied, use windowed. If audio blocked, silent. If storage blocked, session-only play and offer export. If imported file invalid, reject with no mutation. If hosting unavailable, deliver verified branch/PR and record deployment blocked; no alternate public URL without permission.
- **License:** MIT only for newly authored source code and any dependencies under compatible confirmed licenses. Owner-approved original cover, characters, game text, and narrative **are not licensed under MIT**; include explicit asset/content rights-reserved notice and ensure any whole-repository license does not imply otherwise. Third-party fonts/libraries carry separate valid notices. No use of copyrighted magazine covers or logos as game assets; supplied magazine images are stylistic references only.

## 5. Acceptance criteria — release-critical

Codex must create and execute reproducible checks, without a predetermined test-count target:

1. **Start/fullscreen:** title uses exact original art (hash/provenance), integrated heading visible at 16:9 and narrow widths; START launches on keyboard/touch, requests fullscreen on real click, denial fallback works; Esc/minimize never resets. Fullscreen isn't claimed supported on every mobile browser.
2. **Autonomy/rules:** eight agents and six real locations; time/paths/occupancy and conflicting commitments never contradict rules. Residents act without player intervention, their factual knowledge is acquired only through events, and interventions cannot directly rewrite their motivations.
3. **Scenarios:** play each of three assignments to a real success and to real failure from ordinary controls/engine calls, no special win toggles. Each no-intervention run fails; multi-day effects and at least one genuine second-order chain exist. Open Desk unlocks only after all three completed and permits objective-free experiments.
4. **Causality:** archive contains actual source-backed dependencies; ambiguous attribution labeled honestly; identical intervention sequences replay byte/stable-ID equivalent canonical states and event logs; two diverging branches show accurate first difference and distinct resident outcomes; baseline replacement recomputes rather than faking.
5. **Persistence:** save/reload midway, immutable branch tips, 12-tip limit with non-destructive handling, JSON export/import and invalid/blocked-storage recovery; language, pause, fast-forward, focus loss and resizing never change canonical simulation output.
6. **Quality:** actual running original 2D map with clearly differentiated residents, readable locations, travel, environment changes, title, assignment, day, archive and outcome screens; inspect actual images/recordings rather than tests alone. At minimum test 1440×900 desktop and 390×844 portrait and representative landscape touch. Check EN and zh-TW whole flows, keyboard focus, reduced motion, sound denial, desktop pointer, touch, targeted accessibility audit, production build and deployed-site interaction. Record PASS / FAIL / NOT VERIFIED / N/A honestly and preserve relevant evidence.
7. **Publication:** exact protected-branch PR/merge only if all release-critical applicable checks pass and permissions allow; verify built commit and deployed `https://jaychtw.github.io/the-butterfly-department/` with real START + one meaningful action. Then separately publish Possibility Games entry using exact approved `possibility-cover.webp`, and verify card, Play link and portfolio live build. No fabricated release date/version or verification records.

**Definition of finished:** All mandatory Release features above present and validated; source/assets pushed and recoverable; game live and verified at exact authorized destination; independent Possibility entry published and verified where permitted. If a permission, host, license or material required capability prevents any of this, mark precisely **Partial/Blocked**, leave safe work durable, and raise only a narrow exception. No extra human intermediate review or post-build ceremonial acceptance.

## 6. Explicit authorization matrix and hard stops

| Operation | Authorized | Exact scope/conditions |
|---|---|---|
| Full implementation and safe branch pushes | **YES** | `jaychtw/the-butterfly-department`; dedicated feature branch, checkpoint significant stages; never force push or rewrite protected history. |
| PR and merge to `main` | **YES** | Through existing active `Protect main` ruleset: PR required, zero approving reviews, no bypass; checks must pass. If GitHub rejects merge, report rather than alter rules. |
| Game public deployment | **YES** | GitHub Pages **only** `https://jaychtw.github.io/the-butterfly-department/`, source GitHub Actions as configured by owner; verify actual live build and gameplay. No alternate host. |
| Possibility catalog edit/publication | **YES, independently** | `jaychtw/jaychtw.github.io`, Games entry `the-butterfly-department`, approved exact cover at `public/assets/covers/games/the-butterfly-department.webp`; follow portal manual exact-SHA publication gate, card metadata/current catalog order, repo protections and build checks; verify live card/play URL. No unrelated portal changes. |
| Spending/external services | **NO** | **$0** incremental spend and paid overages; no credentials, paid AI/API, external analytics, accounts, telemetry or unapproved data transfer. Normal no-cost GitHub and installed local build tools allowed. |
| Repository visibility | **Public approved** | Do not alter visibility, default branch protections, Pages privacy or settings to circumvent access. |
| License application | **YES within terms** | MIT original code only; original artwork/content rights reserved; include valid dependency/font attribution. |
| Publication of source artwork | **YES for this project/portfolio** | Approved exact cover only, original generated source plus necessary derivatives and hash provenance. No uploaded magazine reference images. |

**Hard-stop escalation only:** unapproved cost or provider/terms, actual license ambiguity, privacy/security exposure, unrecoverable authorized assets, impossible frozen mechanic/visual floor after fallbacks, GitHub permission/ruleset/CI deployment blocker, or need to alter public URL/scope. Continue independently on unaffected authorized portions, keep checkpoint, ask one specific decision with a safe recommendation. Human silence is never consent to change permissions.

## 7. Portfolio metadata contract

Possibility project entry uses `id: the-butterfly-department`, `category: games`, `title: The Butterfly Department`, concise English/zh-TW summaries, correct game source URL and verified GitHub Pages Play URL, languages `[en, zh-TW]`, accurate controls/limitations, `status: draft` until game verified, then `published` with factual observed publication date; `maturity: released` only when full Release contract passes; source commit/version from actual evidence. Use existing portfolio sorting (newest published first) and no arbitrary forced pin unless its policy requires one. Cover alt describes original promotional illustration, not game screenshot. Approved original master stays in game repo; portfolio gets approved WebP derivative. Publication after game verification through Possibility's separate manual/authorized exact-SHA workflow; do not infer a push equals publication.

## 8. What Codex owns

Codex chooses renderer, precise minute-by-minute nonconflicting idle schedules, authored localized event text, sound implementation, storage schema, component structure, algorithmic tie-break implementation, balance **inside the numbered bounded rules**, production tests, technical visuals and internal visual iterations. It must inspect and repair actual rendered results autonomously. It cannot change intended game mechanics, objective outcomes, editorial cover identity, scope, publication rights or $0 cap. All acceptance scenarios above are fixed before implementation.

**Freeze complete: no further routine design questionnaire.** This document plus companion `docs/CODEX-ONE-SHOT.md`, the exact approved asset files, and immutable pinned standards form the handoff.
