import test from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  inventory,
  choose,
  tick,
  nextDay,
  run,
  WITNESSES,
  IDS,
  NODES,
  EDGES,
  path,
  canonical,
  pack,
  unpack,
  counterfactual,
  compare,
  replayTo,
} from "../src/core.js";
test("all three ordinary engine witnesses win; all idle baselines fail", () => {
  for (let i = 0; i < 3; i++) {
    assert.equal(run(i, WITNESSES[i]).win, true, `win ${i}`);
    assert.equal(run(i, []).win, false, `fail ${i}`);
  }
});
test("gathering requires separate days and both announcements, with three actual attendees", () => {
  const s = run(2, WITNESSES[2]);
  assert.equal(s.attendance.length, 3);
  assert.equal(run(2, ["nothing", "gathering-park"]).win, false);
  assert.equal(run(2, ["gathering-hall"]).win, false);
  assert.ok(s.missed.some((x) => x.opportunity === "sister-flowers"));
});
test("deterministic replay, serialization, source DAG and physical travel", () => {
  for (let i = 0; i < 3; i++) {
    const s = run(i, WITNESSES[i]);
    assert.equal(canonical(s), canonical(run(i, WITNESSES[i])));
    for (const e of s.events) {
      for (const d of e.deps)
        assert.ok(Number(d.slice(1)) < Number(e.id.slice(1)));
      if (e.type === "depart")
        assert.ok(
          EDGES.some(
            ([a, b]) =>
              (a === e.data.from && b === e.data.to) ||
              (a === e.data.to && b === e.data.from),
          ),
        );
    }
    assert.equal(
      canonical(replayTo(i, s.choices, s.day, s.tick, s.phase)),
      canonical(s),
    );
    assert.deepEqual(
      unpack(
        pack({
          branches: [{ id: "a", name: "a", state: s }],
          current: "a",
          unlocked: [0],
        }),
      ).branches[0].state,
      s,
    );
  }
});
test("invalid imports rejected and morning choice cannot mutate during playback", () => {
  const s = initial();
  choose(s, "nothing");
  assert.throws(() => choose(s, "repair"));
  assert.throws(() => unpack("{}"));
  assert.throws(() =>
    unpack(
      pack({
        branches: [{ id: "x", name: "x", state: { ...s, oven: true } }],
        unlocked: [0],
      }),
    ),
  );
});
test("counterfactual recomputes and comparison detects real differences", () => {
  const s = run(0, ["repair"]);
  const b = counterfactual(s, 0);
  assert.equal(b.win, false);
  assert.notEqual(compare(s, b).first, -1);
  assert.equal(compare(s, structuredClone(s)).first, -1);
});
test("all intervention categories measurably alter events; illegal actions fail", () => {
  const b = run(3, []);
  for (const id of ["umbrella", "delay", "bench", "gathering-hall"])
    assert.notEqual(
      canonical(run(3, [id]).events.filter((e) => e.type !== "intervention")),
      canonical(b.events.filter((e) => e.type !== "intervention")),
    );
  assert.throws(() => choose(initial(2), "repair"));
});
test("actor bounds and occupancy through every tick", () => {
  for (let sc = 0; sc < 4; sc++) {
    const s = initial(sc);
    while (s.phase !== "end") {
      if (s.phase === "morning") choose(s, WITNESSES[sc]?.[s.day] || "nothing");
      else if (s.phase === "evening") nextDay(s);
      else tick(s);
      for (const a of Object.values(s.actors)) {
        assert.ok(
          (NODES.includes(a.node) && !a.edge) || (a.node === null && a.edge),
        );
        assert.ok(a.commitments.length <= 2);
        assert.ok(a.energy >= 0 && a.energy <= 3);
        for (const v of Object.values(a.trust)) assert.ok(v >= -2 && v <= 2);
      }
    }
  }
});
test("accepted repair displaces exhibit, losing reconciliation opportunity", () => {
  const s = run(1, ["exhibit", "repair"]);
  assert.ok(s.missed.some((x) => x.opportunity === "exhibit"));
  assert.equal(s.win, false);
  assert.equal(s.talks.length, 0);
});
test("Jun handles invitations sequentially and attendance needs an actual host", () => {
  const s = initial(2);
  let invitationTimes = [];
  while (s.phase !== "end") {
    if (s.phase === "morning") choose(s, WITNESSES[2][s.day] || "nothing");
    else if (s.phase === "evening") nextDay(s);
    else {
      const before = s.events.length;
      tick(s);
      for (const e of s.events.slice(before)) {
        if (e.type === "invitation") invitationTimes.push(e.day * 144 + e.tick);
        if (e.type === "attend") assert.equal(s.actors.Jun.node, "Hall");
      }
    }
  }
  for (let i = 1; i < invitationTimes.length; i++)
    assert.ok(invitationTimes[i] - invitationTimes[i - 1] >= 2);
});
test("at least three mechanically distinct legal morning actions throughout a rainy route", () => {
  const s = initial(3);
  while (s.phase !== "end") {
    if (s.phase === "morning") {
      assert.ok(
        inventory(s).filter((x) => x.legal && x.id !== "nothing").length >= 3,
      );
      choose(s, s.day === 0 ? "umbrella" : "nothing");
    } else if (s.phase === "evening") nextDay(s);
    else tick(s);
  }
});

test("import rejects executable attribute-shaped branch identifiers", () => {
  const d = {
    branches: [{ id: 'x\" onclick=\"alert(1)', name: "bad", state: initial() }],
    current: null,
    unlocked: [0],
  };
  assert.throws(() => unpack(pack(d)));
});

test("bus boarding is not appointment arrival: trip uses real edges and fixed deadline", () => {
  for (const [choice, success] of [
    ["nothing", true],
    ["umbrella", false],
    ["delay", false],
    ["early-bus", false],
  ]) {
    const s = run(0, [choice]);
    const day = s.events.filter((e) => e.day === 0);
    assert.equal(
      day.some((e) => e.type === "appointment"),
      success,
      choice,
    );
    if (success) {
      const ride = day.find((e) => e.type === "ride"),
        arrival = day.find((e) => e.type === "appointment");
      assert.ok(arrival.tick > ride.tick);
      assert.ok(
        day.some(
          (e) =>
            e.type === "arrive" &&
            e.actors.includes("Nora") &&
            e.data.node === "Hall" &&
            e.tick <= arrival.tick,
        ),
      );
    } else
      assert.ok(
        day.some(
          (e) => e.type === "missed" && e.data.opportunity === "appointment",
        ),
      );
  }
});
