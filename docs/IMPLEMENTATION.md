# Implementation notes

`src/core.js` is a pure deterministic state machine. It uses fixed actor IDs,
a five-minute graph, breadth-first shortest paths with alphabetic tie-breaking,
and no randomness or locale/display input. `src/app.js` owns rendering, user
input, playback and storage; `src/i18n.js` owns bilingual creative text.
`src/map.js` is original project-authored editable SVG source, not cover crops.

## Delegated authored details

The default anchor windows remain as frozen. Outside them, actors stay at their
last reached node unless an explicit opportunity or commitment takes priority.
Elias visits Hall at noon; Theo returns to the Park at 16:00 for a sister's
flower outing. Monday at 11:10 both Theo and Elias may visit Workshop for an
unpromised clock consultation. A repair commitment overrides that opportunity,
which is explicitly missed; the no-repair route actually performs the consultation.

Mara's oven is broken initially in I, II and Open Desk, operational in III.
Bakery access for the hour-long repair begins at 11:00; arrival routes leave
just in time for the earliest available slot. This authored availability is
visible in inspectors. Tuesday repair takes precedence over the exhibit, and
missing the exhibit prevents the shared exhibit-memory follow-up conversation.
Ada and Elias start with mutual trust 0. Only a real Tuesday encounter followed
by a later ten-minute shared encounter earns the required two increments.
The later conversation records the first conversation among its dependencies.

Jun initially knows the Friday plan. Hall announcements reach Felix and Nora;
Park announcements reach Theo. Notices expire at the end of their posting day;
knowledge persists, but never transfers without a recorded discovery. Jun
invites one resident at a time over ten minutes of uninterrupted co-location.
Ada, Elias and Mara have authored Friday conflicts; Iris begins with no spare
energy. These states are visible. Accepted gathering commitments override
ordinary Friday routes: Jun hosts and guests travel before 16:00. Actual
attendance depends on arriving at Hall with Jun present. Guests miss real
alternative plans, whose no-gathering alternatives are separately recorded.

Monday and Wednesday rain at 07:45 is immutable. An umbrella interaction consumes
five minutes and can miss the fixed departure. The two explicitly permitted
bus interventions move departure 07:45 to 07:30 or 08:00; no private appointment
moves. The bench creates a five-minute rest affordance at 12:30 in Park or Hall,
changing energy/availability. No action directly changes a resident's motives.

## Truth and persistence

Events contain stable IDs, actor IDs, day/tick, structured rule outputs and
recorded enabling input IDs. Dependency links are acyclic and source-backed;
a missing cause is labeled honestly. Textual DAG adjacency is the approved DOM
archive fallback. Comparison examines actual simulations; replacing a selected
morning with Do Nothing replays the full scenario with other choices unchanged.
This is a finite fictional model, not open social AI or real psychological advice.

The save envelope includes version and an accidental-corruption checksum.
Imports additionally replay every branch from its immutable initial state and
reject any noncanonical state without mutating current progress. The checksum
is not an authentication claim. Active playback tips update; a branch parent
is sealed at fork. Exported tips preserve the full event log. No implicit tip
eviction occurs. Settings and progress live only in browser storage; denied
storage retains session play and manual export. Language and sound settings
are outside the canonical simulation; sound always starts muted.
