import {
  initial,
  inventory,
  choose,
  tick,
  nextDay,
  run,
  clock,
  IDS,
  pack,
  unpack,
  replayTo,
  counterfactual,
  compare,
  DAYS,
} from "./core.js";
import { dictionaries } from "./i18n.js";
import { mapSVG, portrait, POS } from "./map.js";
const $ = (s) => document.querySelector(s),
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const KEY = "butterfly-v1";
let lang = navigator.language.startsWith("zh") ? "zh-TW" : "en";
try {
  lang = localStorage.getItem("butterfly-language") || lang;
} catch {}
let db = { branches: [], current: null, unlocked: [0] },
  error = "",
  damaged = null,
  title = true,
  modal = null,
  paused = true,
  speed = 1,
  focused = document.hasFocus(),
  sound = false,
  ctx = null,
  view = { x: 0, y: 0, zoom: 1 },
  follow = null,
  archiveTab = "chronology",
  filter = "",
  other = null,
  computed = null,
  last = 0;
try {
  const raw = localStorage.getItem(KEY);
  if (raw)
    try {
      db = unpack(raw);
    } catch {
      damaged = raw;
      error = "corrupt";
    }
} catch {
  error = "storageError";
}
const tr = () => dictionaries[lang] || dictionaries.en;
const current = () => db.branches.find((b) => b.id === db.current);
const state = () => current()?.state;
function save() {
  try {
    localStorage.setItem(KEY, pack(db));
  } catch {
    error = "storageError";
  }
}
function btn(label, action, extra = "") {
  return `<button data-action="${action}" ${extra}>${esc(label)}</button>`;
}
function metric(s) {
  const t = tr();
  return `<div class="metrics"><span>${t.oven}: <b>${s.oven ? t.yes : t.no}</b></span><span>${t.talks}: <b>${s.talks.length}</b> · ${t.trust}: ${s.trust}</span><span>${t.promises}: <b>${s.commitments.length}/3</b> · ${t.attendees}: ${s.attendance.length}/3</span></div>`;
}
function eventText(e) {
  const t = tr(),
    d = e.data;
  return `${e.actors.map((id) => t.names[id]).join(" & ")}${e.actors.length ? " · " : ""}${t.events[e.type] || e.type}${e.type === "intervention" ? ": " + t.actions[d.choice] : e.type === "read" ? ": " + t.factLabels[d.fact] : e.type === "depart" ? ` ${t.nodes[d.from]} → ${t.nodes[d.to]}` : e.type === "arrive" ? " " + t.nodes[d.node] : ["missed", "alternative"].includes(e.type) ? ": " + t.opportunities[d.opportunity] : ""}${e.type === "conversation" ? " " + t.dialogue[e.day === 1 ? "first" : "later"] : e.type === "repair-complete" ? " " + t.dialogue.repair : e.type === "invitation" ? " " + t.dialogue.invite : ""}`;
}
function stamp(e) {
  return `${tr().days[e.day]} ${clock(e.tick)}`;
}
function globals() {
  const t = tr();
  return `<div class="global-controls">${btn(t.language, "language", `aria-label="${lang === "en" ? "繁中 · Switch to Traditional Chinese" : "EN · 切換為英文"}"`)}${btn(t.fullscreen, "fullscreen")}${btn(sound ? t.sound : t.muted, "sound", `aria-pressed="${sound}"`)}</div>`;
}
function render() {
  const t = tr();
  document.documentElement.lang = lang;
  const s = state();
  $("#app").innerHTML =
    `${title ? `<main class="title-screen"><img class="title-art" src="./assets/approved/cover-master.png" alt="${lang === "en" ? "Approved illustration of Bellwether, with the title The Butterfly Department" : "鐘風鎮原創插畫，內含 The Butterfly Department 標題"}"><div class="start-plate"><p>${t.department}</p>${btn(t.start, "start", 'class="start"')}<span>${t.welcome}</span></div><div class="title-footer">${t.privacy}</div></main>` : s ? `<div class="game"><header><div><p class="eyebrow">${t.desk}</p><h1>${t.assignments[s.scenario]}</h1></div><div class="date"><b>${t.days[s.day]}</b> <time>${clock(s.tick)}</time><small>${t[s.phase === "observe" ? "observe" : s.phase]}</small></div>${btn("☰ " + t.settings, "menu")}</header><main class="workspace"><section class="map-panel" aria-label="${t.travel}"><div class="map-toolbar">${btn("−", "zoom-out", `aria-label="${t.zoom} −"`)}${btn("+", "zoom-in", `aria-label="${t.zoom} +"`)}${btn("←", "pan-left", `aria-label="${t.pan} ←"`)}${btn("→", "pan-right", `aria-label="${t.pan} →"`)}${btn("↑", "pan-up", `aria-label="${t.pan} ↑"`)}${btn("↓", "pan-down", `aria-label="${t.pan} ↓"`)}${btn("↺", "view", `aria-label="${t.resetView}"`)}</div><div class="map-frame">${mapSVG(t)}</div><div class="map-caption">${t.rain} · ${t.travel}</div><div class="resident-strip">${IDS.map((id) => `<button data-action="resident" data-id="${id}"><svg viewBox="-22 -45 44 65" aria-hidden="true">${portrait(id)}</svg><span>${t.names[id]}</span></button>`).join("")}</div></section><aside class="desk"><p class="eyebrow">${t.objective}</p><p class="goal">${t.goals[s.scenario]}</p>${metric(s)}<div id="phase"></div><div class="desk-tools">${btn(t.archive, "archive")}${btn(t.rewind, "rewind")}</div><div id="recent" aria-live="off"></div></aside></main><footer class="transport">${btn(paused ? t.play : t.pause, "play", s.phase !== "observe" || current().sealed ? "disabled" : "")}${btn("1×", "speed1", `aria-pressed="${speed === 1}"`)}${btn("4×", "speed4", `aria-pressed="${speed === 4}"`)}${btn(t.skip, "skip", s.phase !== "observe" || current().sealed ? "disabled" : "")}${btn(t.finishDay, "finish", s.phase !== "observe" || current().sealed ? "disabled" : "")}<span>${t.pauseNote}</span></footer></div>` : picker()}${globals()}${error ? `<div class="warning" role="alert">${esc(t[error])}${damaged ? btn(t.downloadRaw, "raw") + btn(t.reset, "reset") : ""}</div>` : ""}<div id="modal-root"></div>`;
  if (!title && s) {
    renderPhase();
    drawMap();
    recent();
  }
  if (modal) renderModal();
}
function picker() {
  const t = tr();
  return `<main class="picker"><p class="eyebrow">${t.department}</p><h1>${t.welcome}</h1><blockquote>${t.intro}</blockquote><p>${t.instructions}</p><div class="assignment-list">${t.assignments.map((a, i) => btn(`${a}${db.unlocked.includes(i) ? "" : " · " + t.locked}`, "assignment", `data-id="${i}" ${db.unlocked.includes(i) ? "" : "disabled"}`)).join("")}</div>${db.current ? btn(t.continue, "continue") : ""}${btn(t.import, "import")}${btn(t.home, "home")}<p class="small">${t.version}</p></main>`;
}
function renderPhase() {
  const s = state(),
    t = tr(),
    el = $("#phase");
  if (!el) return;
  if (current().sealed) {
    el.innerHTML = `<p>${t.sealed}</p>`;
    return;
  }
  el.innerHTML =
    s.phase === "morning"
      ? `<h2>${t.morning}</h2><p>${t.morningNote}</p><form id="intervention"><div class="options">${inventory(
          s,
        )
          .map(
            (o, i) =>
              `<label class="option ${!o.legal ? "disabled" : ""}"><input type="radio" name="choice" value="${o.id}" ${i === 0 ? "checked" : ""} ${o.legal ? "" : "disabled"}><span><small>${t.categories[o.category]}</small><strong>${t.actions[o.id]}</strong><span>${o.legal ? t.descriptions[o.id] : t.reasons[o.reason]}</span></span></label>`,
          )
          .join(
            "",
          )}</div><button type="submit" class="primary">${t.begin}</button></form><p class="small">${t.hint}</p>`
      : s.phase === "observe"
        ? `<h2>${t.observe}</h2><p>${t.noticeExpiry}</p>`
        : s.phase === "evening"
          ? `<h2>${t.evening}</h2>${btn(t.nextDay, "next", 'class="primary"')}<h3>${t.outcomes}</h3>${outcomes(s)}`
          : `<h2>${s.scenario === 3 ? t.open : s.win ? t.success : t.failure}</h2><h3>${t.outcomes}</h3>${outcomes(s)}${btn(t.replay, "replay")}${s.win && s.scenario < 3 ? btn(t.assignments[s.scenario + 1], "assignment", `data-id="${s.scenario + 1}" class="primary"`) : ""}`;
  $("#intervention")?.addEventListener("submit", (e) => {
    e.preventDefault();
    choose(s, new FormData(e.target).get("choice"));
    paused = true;
    save();
    render();
  });
}
function outcomes(s) {
  const t = tr();
  const ev = s.events.filter((e) =>
    [
      "missed",
      "repair-complete",
      "conversation",
      "attend",
      "ride",
      "bakery-closed",
      "bakery-open",
    ].includes(e.type),
  );
  return `<ul class="outcomes">${
    ev
      .slice(-8)
      .map((e) => `<li>${esc(eventText(e))}</li>`)
      .join("") || `<li>${t.empty}</li>`
  }</ul>`;
}
function recent() {
  const s = state();
  if (!$("#recent") || !s) return;
  $("#recent").innerHTML = `<h3>${tr().chronology}</h3>${s.events
    .slice(-5)
    .reverse()
    .map(
      (e) =>
        `<p class="event"><small>${stamp(e)}</small>${esc(eventText(e))}</p>`,
    )
    .join("")}`;
}
function position(a) {
  if (!a.edge) return POS[a.node];
  const p = POS[a.edge.from],
    q = POS[a.edge.to];
  return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
}
function drawMap() {
  const s = state();
  if (!$("#actors") || !s) return;
  const t = tr();
  IDS.forEach((id, i) => {
    const a = s.actors[id],
      p = position(a),
      x = p[0] + ((i % 3) - 1) * 17,
      y = p[1] + Math.floor(i / 3) * 12;
    const element = $("#actor-" + id);
    if (element) {
      element.setAttribute("transform", `translate(${x} ${y})`);
      element.setAttribute(
        "aria-label",
        `${t.names[id]} · ${a.node ? t.nodes[a.node] : t.move}`,
      );
      element.classList.toggle("walking", !!a.edge);
      element.style.transitionDuration = `${0.42 / speed}s`;
      return;
    }
    $("#actors").insertAdjacentHTML(
      "beforeend",
      `<g id="actor-${id}" class="actor ${a.edge ? "walking" : ""}" role="button" tabindex="0" data-action="resident" data-id="${id}" aria-label="${t.names[id]} · ${a.node ? t.nodes[a.node] : t.move}" transform="translate(${x} ${y})">${portrait(id)}<text y="33" text-anchor="middle" font-size="12" stroke="#fff6df" stroke-width="3" paint-order="stroke">${t.names[id].slice(0, 1)}</text></g>`,
    );
  });
  $("#props").innerHTML =
    s.notices
      .filter((n) => n.expires >= s.day)
      .map((n) => {
        const [x, y] = POS[n.node];
        return `<g transform="translate(${x + 76} ${y - 12})"><path d="M0 0v-30h-25v30Z" fill="#d6b983" stroke="#78654e"/><path d="M-21-26h17v20h-17" fill="#fff1c8"/><text x="-13" y="-11" text-anchor="middle" font-size="15">!</text></g>`;
      })
      .join("") +
    `<g transform="translate(${POS[s.bench][0] + 45} ${POS[s.bench][1] + 5})"><path d="M-18-10h36m-36 7h36m-30 0v8m24-8v8" stroke="#916d4c" stroke-width="5"/></g>` +
    (!s.umbrellaTaken
      ? `<g transform="translate(${POS[s.umbrella][0] - 55} ${POS[s.umbrella][1]})"><path d="M0 0v-24m-18 0q18-26 36 0Z" fill="#be7c70" stroke="#77614f" stroke-width="2"/></g>`
      : "");
  if (follow) {
    const p = position(s.actors[follow]);
    view.x = (480 - p[0]) * 0.6;
    view.y = (360 - p[1]) * 0.6;
  }
  $("#town").style.transform =
    `translate(${view.x}px,${view.y}px) scale(${view.zoom})`;
  $("#town").classList.toggle("evening-light", s.tick > 120);
}
function progress() {
  const s = state();
  if (!s) return;
  if (s.phase === "end" && s.win) {
    const n = Math.min(3, s.scenario + 1);
    if (!db.unlocked.includes(n)) db.unlocked.push(n);
  }
  if (s.phase !== "observe") paused = true;
  save();
}
function step(mode) {
  const s = state();
  if (!s || s.phase !== "observe" || current().sealed) return;
  let n = 0;
  do {
    const before = s.events.length;
    tick(s);
    n++;
    if (
      mode === "one" ||
      (mode === "event" &&
        s.events
          .slice(before)
          .some((e) => !["depart", "arrive"].includes(e.type)))
    )
      break;
  } while (s.phase === "observe" && n < 144);
  progress();
  if (s.phase !== "observe") render();
  else {
    const d = $("time");
    if (d) d.textContent = clock(s.tick);
    drawMap();
    recent();
  }
}
function newGame(sc) {
  if (db.branches.filter((b) => b.state.scenario === sc).length >= 12) {
    error = "cap";
    render();
    return;
  }
  const id = crypto.randomUUID();
  db.branches.push({
    id,
    name: `${tr().branch} ${db.branches.length + 1}`,
    state: initial(sc),
    parent: null,
    sealed: false,
  });
  db.current = id;
  title = false;
  modal = null;
  paused = true;
  save();
  render();
}
function openModal(kind) {
  paused = true;
  modal = kind;
  computed = null;
  renderModal();
}
function renderModal() {
  const t = tr(),
    s = state(),
    b = current();
  let content = "";
  if (modal === "picker") content = picker();
  if (modal === "menu")
    content = `<h2>${t.settings}</h2><p>${t.pauseNote}</p>${btn(t.continue, "close")}${btn(t.archive, "archive")}${btn(t.home, "home")}${btn(t.resetBranch, "reset-branch")}${btn(t.export, "export")}${btn(t.import, "import")}${btn(t.reset, "reset")}<h3>${t.branches}</h3>${db.branches.map((x) => `<div class="branch-row">${btn(`${x.name} · ${t.assignments[x.state.scenario]} · ${t.days[x.state.day]}`, "load", `data-id="${x.id}"`)}${btn("×", "delete", `data-id="${x.id}" aria-label="${t.remove}"`)}</div>`).join("")}<p>${t.privacy}</p><p>${t.responsibility}</p>`;
  if (modal === "rewind")
    content = `<h2>${t.rewind}</h2><p>${t.morningNote}</p><label>${t.branchDay}<select id="rewind-day">${Array.from({ length: s.day + 1 }, (_, i) => `<option value="${i}">${t.days[i]}</option>`).join("")}</select></label><label>${t.branchName}<input id="branch-name" maxlength="50" value="${t.branch} ${db.branches.length + 1}"></label>${btn(t.newBranch, "fork", 'class="primary"')}<p>${t.cap}</p>`;
  if (modal?.startsWith("resident:")) {
    const id = modal.split(":")[1],
      a = s.actors[id];
    const schedule = {
      Mara: "07:00–17:00 · Bakery / 17:00–18:00 · Park",
      Elias:
        "09:00–11:00 · Workshop / 11:00–12:00 · Park / 15:00–16:00 · Library",
      Ada: "09:00–17:00 · Library / 17:00–18:00 · Park",
      Nora: "07:30–08:00 · Bus / 12:00–13:00 · Hall",
      Theo: "08:00–12:00 · Park / 13:00–14:00 · Bakery",
      Iris: "08:00–09:00 · Bus / 16:00–17:00 · Library",
      Felix: "07:00–09:00, 16:00–18:00 · Bus / 12:00–13:00 · Hall",
      Jun: "08:00–09:00 · Library / 11:00–15:00 · Hall / 16:00–17:00 · Park",
    };
    const sched = schedule[id].replace(
      /Bakery|Workshop|Library|Park|Bus|Hall/g,
      (k) => t.nodes[k],
    );
    content = `<div class="person-heading"><svg viewBox="-25 -48 50 70" aria-hidden="true">${portrait(id)}</svg><h2>${t.names[id]}</h2></div><p>${t.motivations[id]}</p><p>${a.node ? t.nodes[a.node] : `${t.move}: ${t.nodes[a.edge.from]} → ${t.nodes[a.edge.to]}`}</p><h3>${t.schedule}</h3><p>${sched}</p><p>${t.energy}: ${a.energy}/3</p><p>${t.fridayConflict}: ${a.fridayConflict ? t.yes : t.no}</p><h3>${t.facts}</h3><ul>${
      Object.entries(a.facts)
        .map(([k, v]) => `<li>${t.factLabels[k]} · ${v}</li>`)
        .join("") || t.empty
    }</ul><h3>${t.commitments}</h3><ul>${a.commitments.map((c) => `<li>${t.factLabels[c.kind]} · ${c.source}</li>`).join("") || t.empty}</ul><h3>${t.trust}</h3><p>${Object.entries(
      a.trust,
    )
      .map(([k, v]) => `${t.names[k]}: ${v}`)
      .join(
        " · ",
      )}</p>${btn(follow === id ? t.unfollow : t.follow, "follow", `data-id="${id}"`)}`;
  }
  if (modal === "archive") {
    const events = s.events.filter((e) => !filter || e.actors.includes(filter));
    content = `<h2>${t.archive}</h2><nav class="tabs">${["chronology", "connections", "parallel"].map((k) => btn(t[k], "archive-tab", `data-id="${k}" aria-pressed="${archiveTab === k}"`)).join("")}</nav><label>${t.filter}<select id="actor-filter"><option value="">${t.all}</option>${IDS.map((id) => `<option value="${id}" ${filter === id ? "selected" : ""}>${t.names[id]}</option>`).join("")}</select></label>`;
    if (archiveTab !== "parallel")
      content += `${archiveTab === "connections" ? `<p>${t.causalNote}</p>` : ""}<ol class="event-log">${events.map((e) => `<li id="event-${e.id}"><small>${e.id} · ${stamp(e)}</small><p>${esc(eventText(e))}</p>${archiveTab === "connections" ? `<div class="deps">${e.deps.length ? `${t.deps}: ` + e.deps.map((id) => `<a href="#event-${id}">${id} → ${e.id}</a>`).join(" · ") : t.noCause}</div>` : ""}</li>`).join("")}</ol>`;
    else {
      const options = db.branches.filter(
        (x) => x.state.scenario === s.scenario && x.id !== b.id,
      );
      if (!options.some((x) => x.id === other)) other = options[0]?.id;
      content += `<p>${t.baseline}</p><select id="compare-branch">${options.map((x) => `<option value="${x.id}" ${x.id === other ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select>${btn(t.chooseCompare, "compare", options.length ? "" : "disabled")}<label>${t.branchDay}<select id="counterfactual-day">${s.choices.map((c, i) => `<option value="${i}">${t.days[i]} · ${t.actions[c]}</option>`).join("")}</select></label>${btn(t.counterfactual, "counterfactual", s.choices.length ? "" : "disabled")}<div id="comparison">${computed ? comparisonHTML(computed.left, computed.right, computed.label) : ""}</div>`;
    }
  }
  $("#modal-root").innerHTML =
    `<div class="modal-shade"><section class="modal" role="dialog" aria-modal="true" aria-label="${modal === "archive" ? t.archive : t.settings}" tabindex="-1"><div class="modal-top">${btn("× " + t.close, "close")}</div>${content}</section></div>`;
  $("#actor-filter")?.addEventListener("change", (e) => {
    filter = e.target.value;
    renderModal();
  });
  $("#compare-branch")?.addEventListener(
    "change",
    (e) => (other = e.target.value),
  );
  $(".modal")?.focus();
}
function comparisonHTML(a, b, label) {
  const t = tr(),
    diff = compare(a, b);
  return `<h3>${esc(label)}</h3><p>${t.first}: ${diff.first < 0 ? t.same : `e${diff.first}`}</p><p>${t.objective}: ${a.win === null ? "—" : a.win ? t.success : t.failure} ↔ ${b.win === null ? "—" : b.win ? t.success : t.failure}</p><div class="table-scroll"><table><thead><tr><th>${t.resident}</th><th>${t.state}</th><th>${t.lost}</th></tr></thead><tbody>${diff.residents
    .map(
      (r) =>
        `<tr><th>${t.names[r.id]}</th><td>${r.same ? t.same : t.different}<br>${t.facts}: ${Object.keys(
          r.left.facts,
        )
          .map((k) => t.factLabels[k])
          .join(", ")} ↔ ${Object.keys(r.right.facts)
          .map((k) => t.factLabels[k])
          .join(", ")}<br>${t.trust}: ${Object.entries(r.left.trust)
          .map(([k, v]) => t.names[k] + ": " + v)
          .join(", ")} ↔ ${Object.entries(r.right.trust)
          .map(([k, v]) => t.names[k] + ": " + v)
          .join(
            ", ",
          )}<br>${t.energy}: ${r.left.energy} ↔ ${r.right.energy}<br>${t.commitments}: ${r.left.commitments.length} ↔ ${r.right.commitments.length}</td><td>${a.missed
          .filter((x) => x.id === r.id)
          .map((x) => t.opportunities[x.opportunity])
          .join(", ")} ↔ ${b.missed
          .filter((x) => x.id === r.id)
          .map((x) => t.opportunities[x.opportunity])
          .join(", ")}</td></tr>`,
    )
    .join("")}</tbody></table></div><h3>${t.day}</h3>${Array.from(
    { length: DAYS[a.scenario] },
    (_, d) =>
      `<details><summary>${t.days[d]}</summary>${IDS.map((id) => {
        const l = a.events.filter((e) => e.day === d && e.actors.includes(id)),
          r = b.events.filter((e) => e.day === d && e.actors.includes(id));
        return `<p><b>${t.names[id]}</b> ${JSON.stringify(l) === JSON.stringify(r) ? t.same : t.different}<br>${l
          .filter((e) => !["depart", "arrive"].includes(e.type))
          .map(eventText)
          .map(esc)
          .join(" / ")}<br>↔ ${r
          .filter((e) => !["depart", "arrive"].includes(e.type))
          .map(eventText)
          .map(esc)
          .join(" / ")}</p>`;
      }).join("")}</details>`,
  ).join("")}`;
}
function download(text, name) {
  const u = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen?.();
  } catch {
    /* approved windowed fallback */
  }
}
function beep() {
  if (!sound) return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume().catch(() => {});
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 330;
    g.gain.setValueAtTime(0.025, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.3);
  } catch {
    sound = false;
  }
}
async function action(name, id) {
  const t = tr(),
    s = state();
  if (name === "language") {
    lang = lang === "en" ? "zh-TW" : "en";
    try {
      localStorage.setItem("butterfly-language", lang);
    } catch {}
    render();
    return;
  }
  if (name === "fullscreen") {
    fullscreen();
    return;
  }
  if (name === "sound") {
    sound = !sound;
    beep();
    render();
    return;
  }
  if (name === "start") {
    fullscreen();
    title = false;
    if (s) {
      modal = "picker";
      render();
    } else render();
    return;
  }
  if (name === "assignment") {
    if (!db.unlocked.includes(Number(id))) return;
    newGame(Number(id));
    return;
  }
  if (name === "continue") {
    title = false;
    modal = null;
    render();
    return;
  }
  if (name === "home") {
    title = true;
    modal = null;
    paused = true;
    save();
    render();
    return;
  }
  if (name === "close") {
    modal = null;
    render();
    return;
  }
  if (name === "menu" || name === "archive" || name === "rewind") {
    openModal(name);
    return;
  }
  if (name === "resident") {
    openModal("resident:" + id);
    return;
  }
  if (name === "follow") {
    follow = follow === id ? null : id;
    modal = null;
    render();
    return;
  }
  if (name === "play") {
    paused = !paused;
    last = performance.now();
    render();
    return;
  }
  if (name.startsWith("speed")) {
    speed = Number(name.slice(-1));
    render();
    return;
  }
  if (name === "skip" || name === "finish") {
    paused = true;
    step(name === "skip" ? "event" : "day");
    beep();
    return;
  }
  if (name === "next") {
    nextDay(s);
    save();
    render();
    return;
  }
  if (name === "reset-branch") {
    if (confirm(t.confirmBranch)) newGame(s.scenario);
    return;
  }
  if (name === "replay") {
    newGame(s.scenario);
    return;
  }
  if (name === "archive-tab") {
    archiveTab = id;
    computed = null;
    renderModal();
    return;
  }
  if (name === "counterfactual") {
    computed = {
      left: run(s.scenario, s.choices),
      right: counterfactual(s, Number($("#counterfactual-day").value)),
      label: t.computed,
    };
    renderModal();
    return;
  }
  if (name === "compare") {
    const r = db.branches.find((x) => x.id === other);
    if (r) {
      computed = {
        left: s,
        right: r.state,
        label: `${current().name} ↔ ${r.name}`,
      };
      renderModal();
    }
    return;
  }
  if (name === "fork") {
    if (
      db.branches.filter((x) => x.state.scenario === s.scenario).length >= 12
    ) {
      error = "cap";
      render();
      return;
    }
    const day = Number($("#rewind-day").value),
      name = $("#branch-name").value.slice(0, 50) || t.branch;
    current().sealed = true;
    const n = replayTo(s.scenario, s.choices.slice(0, day), day, 0, "morning"),
      bid = crypto.randomUUID();
    db.branches.push({
      id: bid,
      name,
      parent: db.current,
      sealed: false,
      state: n,
    });
    db.current = bid;
    modal = null;
    paused = true;
    save();
    render();
    return;
  }
  if (name === "load") {
    db.current = id;
    modal = null;
    title = false;
    paused = true;
    save();
    render();
    return;
  }
  if (name === "delete") {
    if (!confirm(t.confirmDelete)) return;
    db.branches = db.branches.filter((x) => x.id !== id);
    if (db.current === id) db.current = db.branches.at(-1)?.id || null;
    save();
    if (!state()) modal = null;
    render();
    return;
  }
  if (name === "export") {
    download(pack(db), "butterfly-save.json");
    return;
  }
  if (name === "raw") {
    download(damaged, "butterfly-recovery.json");
    return;
  }
  if (name === "import") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      try {
        const data = unpack(await input.files[0].text());
        if (!confirm(t.confirmImport)) return;
        db = data;
        error = "";
        damaged = null;
        save();
        modal = null;
        title = false;
        render();
      } catch {
        error = "importError";
        render();
      }
    };
    input.click();
    return;
  }
  if (name === "reset") {
    if (!confirm(t.confirmReset)) return;
    db = { branches: [], current: null, unlocked: [0] };
    damaged = null;
    error = "";
    modal = null;
    save();
    title = true;
    render();
    return;
  }
  if (name.startsWith("zoom"))
    view.zoom = Math.max(
      0.75,
      Math.min(2, view.zoom + (name === "zoom-in" ? 0.15 : -0.15)),
    );
  if (name.startsWith("pan")) {
    follow = null;
    view.x += name === "pan-left" ? 30 : name === "pan-right" ? -30 : 0;
    view.y += name === "pan-up" ? 30 : name === "pan-down" ? -30 : 0;
  }
  if (name === "view") {
    view = { x: 0, y: 0, zoom: 1 };
    follow = null;
  }
  drawMap();
}
$("#app").addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (b && !b.disabled) action(b.dataset.action, b.dataset.id);
});
document.addEventListener("keydown", (e) => {
  if (modal) {
    if (e.key === "Escape") {
      e.preventDefault();
      modal = null;
      render();
    }
    if (e.key === "Tab") {
      const els = [
        ...$(".modal").querySelectorAll(
          "button:not(:disabled),input,select,a[href]",
        ),
      ];
      if (!els.length) return;
      const first = els[0],
        end = els.at(-1);
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === $(".modal"))
      ) {
        e.preventDefault();
        end.focus();
      } else if (!e.shiftKey && document.activeElement === end) {
        e.preventDefault();
        first.focus();
      }
    }
    return;
  }
  if ((e.key === "Enter" || e.key === " ") && e.target.matches(".actor")) {
    e.preventDefault();
    action("resident", e.target.dataset.id);
  }
  if (e.key === " " && e.target === document.body && !title) {
    e.preventDefault();
    action("play");
  }
});
window.addEventListener("blur", () => {
  focused = false;
  last = performance.now();
});
window.addEventListener("focus", () => {
  focused = true;
  last = performance.now();
});
document.addEventListener("visibilitychange", () => {
  last = performance.now();
  if (document.hidden) save();
});
function frame(now) {
  if (!last) last = now;
  const gap = now - last;
  if (gap > 1000) last = now;
  if (
    !title &&
    !modal &&
    !paused &&
    focused &&
    document.hasFocus() &&
    !document.hidden &&
    state()?.phase === "observe" &&
    gap >= 500 / speed &&
    gap < 1000
  ) {
    last = now;
    step("one");
  }
  requestAnimationFrame(frame);
}
render();
requestAnimationFrame(frame);
