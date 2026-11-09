import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { run } from "../src/core.js";
const data = JSON.parse(
  readFileSync(new URL("../scenarios.json", import.meta.url)),
);
test("frozen machine-readable ordinary-play witnesses", () => {
  for (const w of [...data.witnesses, ...data.counterExamples]) {
    const s = run(w.scenario, w.choices);
    assert.equal(s.win, w.expectedWin);
    if (w.expectedTrust) assert.equal(s.trust, w.expectedTrust);
    if (w.attendees)
      assert.deepEqual(
        s.attendance.map((a) => a.id).sort(),
        w.attendees.slice().sort(),
      );
    if (w.chain)
      for (const type of w.chain)
        assert.ok(s.events.some((e) => e.type === type));
  }
});
