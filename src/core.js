// Pure deterministic simulation. Creative strings are rights reserved.
export const VERSION = 2;
export const NODES = ["Bakery", "Bus", "Hall", "Library", "Park", "Workshop"];
export const EDGES = [
  ["Bakery", "Bus"],
  ["Bakery", "Park"],
  ["Bus", "Workshop"],
  ["Bus", "Park"],
  ["Workshop", "Hall"],
  ["Park", "Library"],
  ["Park", "Hall"],
  ["Library", "Hall"],
];
export const IDS = [
  "Ada",
  "Elias",
  "Felix",
  "Iris",
  "Jun",
  "Mara",
  "Nora",
  "Theo",
];
export const DAYS = [3, 4, 5, 5];
export const minute = (t) => 420 + t * 5;
export const clock = (t) =>
  `${String(Math.floor(minute(t) / 60)).padStart(2, "0")}:${String(minute(t) % 60).padStart(2, "0")}`;
const at = (h, m = 0) => (h * 60 + m - 420) / 5;
export function path(from, to) {
  const q = [[from]],
    seen = new Set([from]);
  while (q.length) {
    const p = q.shift(),
      n = p.at(-1);
    if (n === to) return p.slice(1);
    for (const k of EDGES.flatMap(([a, b]) =>
      a === n ? [b] : b === n ? [a] : [],
    ).sort())
      if (!seen.has(k)) {
        seen.add(k);
        q.push([...p, k]);
      }
  }
  throw Error("Unknown node");
}
const emit = (s, type, actors = [], data = {}, deps = []) => {
  const e = {
    id: `e${s.events.length}`,
    day: s.day,
    tick: s.tick,
    type,
    actors,
    data,
    deps: [...new Set(deps.filter(Boolean))],
  };
  s.events.push(e);
  return e.id;
};
export function initial(scenario = 0) {
  if (!Number.isInteger(scenario) || scenario < 0 || scenario > 3)
    throw Error("scenario");
  const start = {
    Ada: "Library",
    Elias: "Workshop",
    Felix: "Bus",
    Iris: "Bus",
    Jun: "Library",
    Mara: "Bakery",
    Nora: "Park",
    Theo: "Park",
  };
  const s = {
    version: VERSION,
    scenario,
    day: 0,
    tick: 0,
    phase: "morning",
    choices: [],
    events: [],
    actors: {},
    notices: [],
    oven: scenario === 2,
    repair: null,
    exhibit: false,
    exhibitSource: null,
    bench: "Park",
    umbrella: "Park",
    umbrellaTaken: false,
    busDelay: 0,
    busDelaySource: null,
    trust: 0,
    talks: [],
    commitments: [],
    attendance: [],
    missed: [],
    win: null,
  };
  for (const id of IDS)
    s.actors[id] = {
      id,
      node: start[id],
      edge: null,
      route: [],
      facts: {},
      energy: id === "Iris" ? 0 : 3,
      trust: Object.fromEntries(IDS.filter((x) => x !== id).map((x) => [x, 0])),
      commitments: [],
      busy: 0,
      task: null,
      lastArrival: null,
      overlap: {},
      fridayConflict: ["Ada", "Elias", "Iris", "Mara"].includes(id),
    };
  s.actors.Jun.facts.gathering = emit(s, "known", ["Jun"], {
    fact: "gathering",
  });
  emit(s, "initial", [], { oven: s.oven, rain: [0, 2], seed: VERSION });
  return s;
}
export function inventory(s) {
  const repair = !s.oven;
  return [
    { id: "nothing", category: "nothing", node: null, legal: true },
    {
      id: "repair",
      category: "inform",
      node: "Workshop",
      legal: repair,
      reason: "oven",
    },
    {
      id: "exhibit",
      category: "inform",
      node: "Library",
      legal: s.day <= 1 && !s.exhibit,
      reason: "exhibit",
    },
    {
      id: "gathering-hall",
      category: "inform",
      node: "Hall",
      legal: s.day <= 4,
      reason: "deadline",
    },
    {
      id: "gathering-park",
      category: "inform",
      node: "Park",
      legal: s.day <= 4,
      reason: "deadline",
    },
    {
      id: "umbrella",
      category: "relocate",
      node: s.umbrella === "Park" ? "Bus" : "Park",
      legal: !s.umbrellaTaken,
      reason: "taken",
    },
    { id: "delay", category: "delay", node: "Bus", legal: true },
    { id: "early-bus", category: "delay", node: "Bus", legal: true },
    {
      id: "bench",
      category: "arrange",
      node: s.bench === "Park" ? "Hall" : "Park",
      legal: true,
    },
  ];
}
export function choose(s, id) {
  if (s.phase !== "morning") throw Error("Morning only");
  const o = inventory(s).find((x) => x.id === id);
  if (!o?.legal) throw Error("Illegal action");
  s.choices.push(id);
  const source = emit(s, "intervention", [], {
    choice: id,
    category: o.category,
    node: o.node,
  });
  if (o.category === "inform") {
    const fact =
      id === "repair" ? "repair" : id === "exhibit" ? "exhibit" : "gathering";
    s.notices.push({ fact, node: o.node, source, day: s.day, expires: s.day });
    if (fact === "exhibit") {
      s.exhibit = true;
      s.exhibitSource = source;
    }
  }
  if (id === "umbrella") s.umbrella = o.node;
  if (id === "delay") s.busDelay = 3;
  if (id === "early-bus") s.busDelay = -3;
  if (o.category === "delay") s.busDelaySource = source;
  if (id === "bench") {
    s.bench = o.node;
    s.benchSource = source;
  }
  s.phase = "observe";
  return s;
}
function routine(id, t, day) {
  const m = minute(t);
  const slots = {
    Mara: [
      [420, 1020, "Bakery"],
      [1020, 1080, "Park"],
    ],
    Elias: [
      [540, 660, "Workshop"],
      [660, 720, "Park"],
      [720, 780, "Hall"],
      [900, 960, "Library"],
    ],
    Nora: [
      [450, 480, "Bus"],
      [720, 780, "Hall"],
    ],
    Theo: [
      [480, 720, "Park"],
      [780, 840, "Bakery"],
      [960, 1020, "Park"],
    ],
    Iris: [
      [480, 540, "Bus"],
      [960, 1020, "Library"],
    ],
    Felix: [
      [420, 540, "Bus"],
      [720, 780, "Hall"],
      [960, 1080, "Bus"],
    ],
    Ada: [
      [540, 1020, "Library"],
      [1020, 1080, "Park"],
    ],
    Jun: [
      [480, 540, "Library"],
      [660, 900, "Hall"],
      [960, 1020, "Park"],
    ],
  };
  return slots[id].find(([a, b]) => m >= a && m < b)?.[2] || null;
}
function move(s, a, target, cause) {
  if (a.edge || a.node === target) return;
  a.route = path(a.node, target);
  const next = a.route.shift();
  const e = emit(
    s,
    "depart",
    [a.id],
    { from: a.node, to: next, destination: target },
    [cause, a.lastArrival],
  );
  a.edge = { from: a.node, to: next, start: s.tick, source: e, target, cause };
  a.node = null;
}
function missed(s, id, opportunity, deps = []) {
  const key = `${s.day}:${id}:${opportunity}`;
  if (s.missed.some((x) => x.key === key)) return;
  const source = emit(s, "missed", [id], { opportunity }, deps);
  s.missed.push({ key, id, day: s.day, opportunity, source });
}
function fact(s, a, n) {
  if (a.facts[n.fact] || a.busy > s.tick || !a.node) return;
  if (n.fact === "repair" && a.id !== "Elias") return;
  a.busy = s.tick + 1;
  a.facts[n.fact] = emit(s, "read", [a.id], { fact: n.fact, node: a.node }, [
    n.source,
    a.lastArrival,
  ]);
}
export function tick(s) {
  if (s.phase !== "observe") return s;
  s.tick++;
  for (const id of IDS) {
    const a = s.actors[id];
    if (a.edge && s.tick > a.edge.start) {
      const e = a.edge;
      a.node = e.to;
      a.edge = null;
      a.lastArrival = emit(s, "arrive", [id], { node: a.node }, [e.source]);
      if (a.node !== e.target) move(s, a, e.target, e.cause);
    }
  }
  for (const id of IDS) {
    const a = s.actors[id];
    if (a.edge) continue;
    if (a.task?.kind === "repair" && a.node === "Bakery" && !a.task.finish) {
      a.task.finish = s.tick + 12;
      a.task.start = emit(s, "repair-start", [id, "Mara"], { node: "Bakery" }, [
        a.task.source,
        a.lastArrival,
      ]);
      a.busy = a.task.finish;
    }
    if (a.task?.finish === s.tick) {
      s.oven = true;
      s.repair = emit(s, "repair-complete", [id, "Mara"], { oven: true }, [
        a.task.start,
      ]);
      a.task = null;
      a.commitments = [];
    }
    if (a.busy > s.tick) continue;
    if (a.busTrip) {
      if (a.node !== "Hall") {
        move(s, a, "Hall", a.busTrip);
        continue;
      }
      a.busTrip = null;
      if (id === "Nora") {
        a.busy = at(8, 15);
        continue;
      }
    }
    const notice = s.notices.find(
      (n) => n.node === a.node && n.expires >= s.day && !a.facts[n.fact],
    );
    if (notice) fact(s, a, notice);
    if (a.busy > s.tick) continue;
    if (
      !s.oven &&
      a.id === "Elias" &&
      a.facts.repair &&
      !a.task &&
      s.day <= 2 &&
      !(s.day === 2 && s.tick > at(12, 30))
    ) {
      const source = emit(s, "repair-accepted", [id], { duration: 60 }, [
        a.facts.repair,
      ]);
      a.task = { kind: "repair", source, slot: at(11) };
      a.commitments = [{ kind: "repair", source }];
    }
    if (a.task) {
      if (s.tick >= a.task.slot - path(a.node, "Bakery").length)
        move(s, a, "Bakery", a.task.source);
      continue;
    }
    // Accepted Friday gathering commitments precede personal opportunities.
    if (
      id === "Jun" &&
      s.day === 4 &&
      s.tick >= at(15, 40) &&
      s.tick < at(17)
    ) {
      move(s, a, "Hall", a.facts.gathering);
      continue;
    }
    if (
      s.day === 4 &&
      a.commitments.some((c) => c.kind === "gathering") &&
      s.tick >= at(15, 40) &&
      s.tick < at(17)
    ) {
      const c = a.commitments.find((c) => c.kind === "gathering");
      move(s, a, "Hall", c.source);
      continue;
    }
    if (
      s.day === 1 &&
      s.exhibit &&
      id === "Elias" &&
      a.facts.exhibit &&
      s.tick >= at(10, 40) &&
      s.tick < at(12)
    ) {
      move(s, a, "Library", a.facts.exhibit);
      continue;
    }
    // Rain and a shared object occupy a real five-minute slot before the fixed bus.
    if (
      [0, 2].includes(s.day) &&
      id === "Nora" &&
      s.tick === at(7, 45) &&
      a.node === s.umbrella &&
      !s.umbrellaTaken
    ) {
      s.umbrellaTaken = true;
      a.busy = s.tick + 1;
      a.umbrella = emit(
        s,
        "umbrella-use",
        [id],
        { node: a.node, duration: 5 },
        [
          s.events.findLast(
            (e) => e.type === "intervention" && e.data.choice === "umbrella",
          )?.id,
          a.lastArrival,
        ],
      );
      continue;
    }
    if (
      ["Theo", "Elias"].includes(id) &&
      s.day === 0 &&
      s.tick >= at(11, 10) &&
      s.tick < at(11, 45)
    ) {
      move(s, a, "Workshop");
      continue;
    }
    const target = routine(id, s.tick, s.day);
    if (target) move(s, a, target);
  }
  // A shifted authorised bus departure is visible and changes the punctuality result.
  if (s.tick === at(7, 45) + s.busDelay) {
    const n = s.actors.Nora;
    const ride = emit(
      s,
      "bus-depart",
      ["Felix"],
      {
        node: "Bus",
        departure: clock(s.tick),
      },
      [s.busDelaySource],
    );
    s.busDeparture = ride;
    s.actors.Felix.busTrip = ride;
    move(s, s.actors.Felix, "Hall", ride);
    if (n.node === "Bus" && n.busy <= s.tick) {
      n.facts.ride = emit(s, "ride", ["Nora"], { destination: "Hall" }, [
        ride,
        n.lastArrival,
      ]);
      n.busTrip = n.facts.ride;
      move(s, n, "Hall", n.facts.ride);
    }
  }
  // A private 08:05 appointment never shifts with the public departure.
  if (s.tick === at(8, 5)) {
    const n = s.actors.Nora;
    if (
      n.node === "Hall" &&
      n.facts.ride &&
      s.events.find((e) => e.id === n.facts.ride)?.day === s.day
    ) {
      n.facts.appointment = emit(
        s,
        "appointment",
        ["Nora"],
        { node: "Hall", deadline: "08:05" },
        [n.facts.ride, n.lastArrival],
      );
    } else missed(s, "Nora", "appointment", [s.busDeparture, n.umbrella]);
  }

  // The public bench adds a five-minute reading/rest affordance, not a teleport.
  if (s.tick === at(12, 30)) {
    for (const id of IDS) {
      const a = s.actors[id];
      if (a.node === s.bench && !a.edge && a.busy <= s.tick) {
        a.energy = Math.min(3, a.energy + 1);
        emit(
          s,
          "rest",
          [id],
          { node: s.bench, energy: a.energy, duration: 5 },
          [s.benchSource, a.lastArrival],
        );
        a.busy = s.tick + 1;
      }
    }
  }
  const e = s.actors.Elias,
    a = s.actors.Ada;
  const talkWindow =
    (s.day === 1 && s.tick >= at(11) && s.tick <= at(12)) ||
    (s.day >= 2 &&
      s.talks.some((t) => t.day === 1) &&
      s.tick >= at(15) &&
      s.tick <= at(16));
  if (
    s.exhibit &&
    talkWindow &&
    e.node === "Library" &&
    a.node === "Library" &&
    !e.task &&
    e.busy <= s.tick &&
    a.busy <= s.tick &&
    e.facts.exhibit &&
    a.facts.exhibit &&
    !s.talks.some((t) => t.day === s.day)
  ) {
    e.overlap.Ada = (e.overlap.Ada || 0) + 1;
    if (e.overlap.Ada >= 3) {
      const source = emit(
        s,
        "conversation",
        ["Ada", "Elias"],
        { topic: "memory", trust: Math.min(2, s.trust + 1) },
        [
          e.facts.exhibit,
          a.facts.exhibit,
          s.exhibitSource,
          e.lastArrival,
          a.lastArrival,
          s.day >= 2 ? s.talks.find((t) => t.day === 1)?.source : null,
        ],
      );
      s.trust = Math.min(2, s.trust + 1);
      a.trust.Elias = e.trust.Ada = s.trust;
      s.talks.push({ day: s.day, source });
    }
  } else e.overlap.Ada = 0;
  const j = s.actors.Jun;
  for (const id of IDS.filter((x) => x !== "Jun")) {
    const r = s.actors[id];
    if (
      j.node &&
      j.node === r.node &&
      j.busy <= s.tick &&
      r.busy <= s.tick &&
      r.facts.gathering &&
      (s.day < 4 || (s.day === 4 && s.tick <= at(14))) &&
      !r.fridayConflict &&
      r.energy >= 1 &&
      !s.commitments.some((c) => c.id === id) &&
      r.commitments.length < 2
    ) {
      r.overlap.Jun = (r.overlap.Jun || 0) + 1;
      if (r.overlap.Jun >= 3) {
        const source = emit(
          s,
          "invitation",
          ["Jun", id],
          { node: r.node, event: "Friday 16:00" },
          [j.facts.gathering, r.facts.gathering, j.lastArrival, r.lastArrival],
        );
        r.commitments.push({ kind: "gathering", source });
        s.commitments.push({ id, source });
        j.busy = s.tick + 1;
        r.busy = s.tick + 1;
      }
      break;
    } else r.overlap.Jun = 0;
  }
  if (s.day === 0 && s.tick === at(11, 30)) {
    if (s.actors.Elias.task)
      missed(s, "Theo", "clock-consultation", [
        s.actors.Elias.task.source,
        s.actors.Theo.lastArrival,
      ]);
    else if (
      s.actors.Theo.node === "Workshop" &&
      s.actors.Elias.node === "Workshop"
    )
      emit(s, "consultation", ["Theo", "Elias"], { node: "Workshop" }, [
        s.actors.Theo.lastArrival,
        s.actors.Elias.lastArrival,
      ]);
  }
  if (s.day === 1 && s.tick === at(11) && s.actors.Elias.task)
    missed(s, "Elias", "exhibit", [
      s.actors.Elias.task.source,
      s.exhibitSource,
    ]);
  if (s.day === 4 && s.tick === at(16))
    for (const c of s.commitments) {
      const r = s.actors[c.id];
      if (r.node === "Hall" && s.actors.Jun.node === "Hall") {
        const source = emit(s, "attend", [c.id, "Jun"], { node: "Hall" }, [
          c.source,
          r.lastArrival,
          s.actors.Jun.lastArrival,
        ]);
        s.attendance.push({ id: c.id, source });
        missed(
          s,
          c.id,
          c.id === "Theo"
            ? "sister-flowers"
            : c.id === "Felix"
              ? "afternoon-route"
              : "quiet-afternoon",
          [source],
        );
      } else missed(s, c.id, "gathering", [c.source]);
    }
  if (s.day === 4 && s.tick === at(16)) {
    for (const [id, node, opportunity] of [
      ["Theo", "Park", "sister-flowers"],
      ["Felix", "Bus", "afternoon-route"],
      ["Nora", "Hall", "quiet-afternoon"],
    ]) {
      if (!s.attendance.some((a) => a.id === id) && s.actors[id].node === node)
        emit(s, "alternative", [id], { opportunity }, [
          s.actors[id].lastArrival,
        ]);
    }
  }
  if (s.day === 2 && s.tick === at(18))
    emit(
      s,
      s.oven ? "bakery-open" : "bakery-closed",
      ["Mara"],
      { oven: s.oven },
      [s.repair],
    );
  if (s.tick === 144) {
    s.phase = s.day === DAYS[s.scenario] - 1 ? "end" : "evening";
    if (s.phase === "end") {
      s.win =
        s.scenario === 0
          ? !!s.repair &&
            s.events.find((e) => e.id === s.repair).day <= 2 &&
            (s.events.find((e) => e.id === s.repair).day < 2 ||
              s.events.find((e) => e.id === s.repair).tick <= at(14))
          : s.scenario === 1
            ? s.talks.length >= 2 && s.trust >= 2
            : s.scenario === 2
              ? s.commitments.length >= 3 && s.attendance.length >= 3
              : null;
      emit(
        s,
        "result",
        [],
        { win: s.win },
        s.win
          ? s.scenario === 0
            ? [s.repair]
            : s.scenario === 1
              ? s.talks.map((t) => t.source)
              : s.attendance.map((t) => t.source)
          : [],
      );
    }
  }
  return s;
}
export function nextDay(s) {
  if (s.phase !== "evening") throw Error("Evening only");
  s.day++;
  s.tick = 0;
  s.phase = "morning";
  s.busDelay = 0;
  s.busDelaySource = null;
  for (const a of Object.values(s.actors)) {
    a.busy = 0;
    a.overlap = {};
  }
  return s;
}
export function run(scenario, choices) {
  const s = initial(scenario);
  while (s.phase !== "end") {
    if (s.phase === "morning") choose(s, choices[s.day] || "nothing");
    else if (s.phase === "evening") nextDay(s);
    else tick(s);
  }
  return s;
}
export const WITNESSES = [
  ["repair"],
  ["exhibit"],
  ["gathering-hall", "gathering-park"],
];
export function replayTo(scenario, choices, day, t, phase) {
  const s = initial(scenario);
  while (s.day < day) {
    choose(s, choices[s.day] || "nothing");
    while (s.phase === "observe") tick(s);
    nextDay(s);
  }
  if (phase !== "morning") {
    choose(s, choices[day] || "nothing");
    while (s.phase === "observe" && s.tick < t) tick(s);
  }
  return s;
}
export function counterfactual(s, day) {
  const choices = [...s.choices];
  choices[day] = "nothing";
  return run(s.scenario, choices);
}
export function compare(a, b) {
  if (a.scenario !== b.scenario || a.version !== b.version)
    throw Error("Different initial conditions");
  const first = a.events.findIndex(
    (e, i) => JSON.stringify(e) !== JSON.stringify(b.events[i]),
  );
  return {
    first:
      first === -1 && a.events.length !== b.events.length
        ? Math.min(a.events.length, b.events.length)
        : first,
    residents: IDS.map((id) => ({
      id,
      same: JSON.stringify(a.actors[id]) === JSON.stringify(b.actors[id]),
      left: a.actors[id],
      right: b.actors[id],
    })),
    outcomes: [a.win, b.win],
    missed: [a.missed, b.missed],
  };
}
export function canonical(s) {
  return JSON.stringify(s);
}
export function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
export function pack(data) {
  const payload = JSON.stringify(data);
  return JSON.stringify({ version: VERSION, payload, checksum: hash(payload) });
}
export function unpack(text) {
  if (typeof text !== "string" || text.length > 25_000_000)
    throw Error("Invalid save");
  const e = JSON.parse(text);
  if (
    e.version !== VERSION ||
    typeof e.payload !== "string" ||
    hash(e.payload) !== e.checksum
  )
    throw Error("Invalid checksum");
  const d = JSON.parse(e.payload);
  if (
    !d ||
    !Array.isArray(d.branches) ||
    d.branches.length > 48 ||
    !Array.isArray(d.unlocked) ||
    d.unlocked.some((x) => !Number.isInteger(x) || x < 0 || x > 3)
  )
    throw Error("Invalid structure");
  const counts = {};
  const keys = new Set();
  for (const b of d.branches) {
    if (
      typeof b.id !== "string" ||
      !/^[A-Za-z0-9-]{1,64}$/.test(b.id) ||
      keys.has(b.id) ||
      typeof b.name !== "string" ||
      b.name.length > 100 ||
      !b.state ||
      !Number.isInteger(b.state.scenario) ||
      b.state.scenario < 0 ||
      b.state.scenario > 3
    )
      throw Error("Invalid branch");
    keys.add(b.id);
    const s = b.state;
    counts[s.scenario] = (counts[s.scenario] || 0) + 1;
    if (
      counts[s.scenario] > 12 ||
      !Array.isArray(s.choices) ||
      s.choices.length > DAYS[s.scenario] ||
      !Number.isInteger(s.day) ||
      s.day < 0 ||
      s.day >= DAYS[s.scenario] ||
      !Number.isInteger(s.tick) ||
      s.tick < 0 ||
      s.tick > 144 ||
      !["morning", "observe", "evening", "end"].includes(s.phase)
    )
      throw Error("Invalid state");
    const rebuilt = replayTo(s.scenario, s.choices, s.day, s.tick, s.phase);
    if (canonical(rebuilt) !== canonical(s))
      throw Error("State does not match deterministic replay");
  }
  if (d.current && !keys.has(d.current)) throw Error("Missing branch");
  return d;
}
