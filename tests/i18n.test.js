import test from "node:test";
import assert from "node:assert/strict";
import { en, zh } from "../src/i18n.js";
function keys(o, p = "") {
  return Object.entries(o)
    .flatMap(([k, v]) =>
      v && typeof v === "object" ? keys(v, `${p}${k}.`) : [p + k],
    )
    .sort();
}
test("English and Traditional Chinese dictionary parity", () =>
  assert.deepEqual(keys(en), keys(zh)));
