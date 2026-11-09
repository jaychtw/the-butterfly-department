import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
test("all supplied frozen files preserve exact size and SHA-256", () => {
  const manifest = JSON.parse(readFileSync("ARTIFACT-INTEGRITY.json"));
  for (const f of manifest.files) {
    const b = readFileSync(f.path);
    assert.equal(b.length, f.bytes, f.path);
    assert.equal(
      createHash("sha256").update(b).digest("hex"),
      f.sha256,
      f.path,
    );
  }
  const b = readFileSync("assets/approved/cover-master.png");
  assert.equal(b.readUInt32BE(16), 1672);
  assert.equal(b.readUInt32BE(20), 941);
});
