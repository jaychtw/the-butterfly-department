import { cp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
await rm("dist", { recursive: true, force: true });
await mkdir("dist/the-butterfly-department", { recursive: true });
for (const f of ["index.html", "src", "assets"])
  await cp(f, `dist/the-butterfly-department/${f}`, { recursive: true });
await writeFile(
  "dist/the-butterfly-department/build.json",
  JSON.stringify({
    commit: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    version: JSON.parse(await readFile("package.json", "utf8")).version,
  }),
);
console.log(
  "Built static app at dist/the-butterfly-department; no runtime remote dependencies.",
);
