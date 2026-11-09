export const POS = {
  Bakery: [225, 240],
  Bus: [475, 190],
  Workshop: [730, 190],
  Park: [405, 455],
  Library: [180, 590],
  Hall: [730, 510],
};
const colors = {
  Ada: "#796a9b",
  Elias: "#486e83",
  Felix: "#b8754c",
  Iris: "#51917e",
  Jun: "#cf855d",
  Mara: "#bf6571",
  Nora: "#5d779b",
  Theo: "#8b985c",
};
export function portrait(id, x = 0, y = 0, scale = 1) {
  const hats = {
    Mara: '<path d="M-10-25 Q-16-37-6-37 Q0-47 6-37 Q17-39 11-25" fill="#fff7e2"/>',
    Elias: '<path d="M-11-26q11-10 22 0v5h-22" fill="#d5d1b5"/>',
    Felix: '<path d="M-12-27h24v5h-24M-8-32h16v5H-8" fill="#253c55"/>',
    Theo: '<path d="M-14-24h28M-9-26q9-16 18 0" fill="#c9a76b"/>',
    Ada: '<circle cx="9" cy="-30" r="6" fill="#5b4455"/>',
    Nora: '<path d="M-11-18q-7-20 11-17q17 0 11 20" fill="#493d40"/>',
    Iris: '<path d="M-10-26q11-16 20 0" fill="#563f35"/>',
    Jun: '<path d="M-11-27q6-14 20-2l-1 6" fill="#373c46"/>',
  };
  return `<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cy="13" rx="16" ry="5" fill="#333" opacity=".16"/><path d="M-7 5v9m14-9v9" stroke="#4a4140" stroke-width="4"/><path d="M-13 5q0-28 13-28T13 5Z" fill="${colors[id]}" stroke="#413f3d" stroke-width="1.2"/><circle cy="-23" r="10" fill="#e7b58b"/>${hats[id]}<path d="M-4-23h1m6 0h1" stroke="#443d3b" stroke-width="2"/><path d="M-11-9l-5 11M11-9l5 10" stroke="#e2ad86" stroke-width="4"/></g>`;
}
function house(x, y, w, h, color, roof, kind) {
  let windows = "";
  for (let i = 0; i < 3; i++)
    windows += `<g class="window"><rect x="${-w / 2 + 18 + (i * (w - 36)) / 3}" y="${-h + 30}" width="22" height="31" rx="6" fill="#f6d990" stroke="#665c50" stroke-width="2"/><path d="M${-w / 2 + 29 + (i * (w - 36)) / 3} ${-h + 30}v31" stroke="#85745d"/></g>`;
  return `<g transform="translate(${x} ${y})"><ellipse cy="8" rx="${w * 0.68}" ry="16" fill="#6f7554" opacity=".19"/><path d="M${-w / 2} 0v-${h}h${w}v${h}Z" fill="${color}" stroke="#6f6051" stroke-width="2"/><path d="M${-w / 2 - 14} ${-h}l${w / 2 + 14} -39l${w / 2 + 14} 39Z" fill="${roof}" stroke="#66574c" stroke-width="2"/><path d="M${-w / 2 + 8} ${-h - 6}l${w / 2 - 8}-22l${w / 2 - 8}22" fill="none" stroke="#f9e5b5" opacity=".5"/>${windows}<path d="M-14 0v-44q14-16 28 0V0" fill="#6b7b70" stroke="#665b50" stroke-width="2"/><circle cx="8" cy="-16" r="2" fill="#efd5a0"/>${kind === "bakery" ? `<path d="M${-w / 2 - 4}-40h${w + 8}l-5 16H${-w / 2 + 1}Z" fill="#f4d2a2"/><path d="M${-w / 2 + 8}-40v16m22-16v16m22-16v16m22-16v16m22-16v16" stroke="#b85950" stroke-width="12"/>` : ""}${kind === "hall" ? '<path d="M-65 0v-51M65 0v-51" stroke="#f7e3bd" stroke-width="10"/>' : ""}<path d="M-24 3h48m-28 5h56" stroke="#bcae87" stroke-width="4"/></g>`;
}
export function mapSVG(t) {
  let trees = "";
  for (const [x, y, r] of [
    [80, 135, 35],
    [360, 100, 28],
    [860, 120, 38],
    [850, 350, 45],
    [90, 420, 36],
    [530, 600, 35],
    [560, 330, 28],
    [70, 650, 24],
    [340, 620, 28],
    [850, 640, 30],
  ])
    trees += `<g class="tree"><path d="M${x} ${y}v45" stroke="#80765a" stroke-width="7"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r + 9}" fill="#8ca477"/><ellipse cx="${x - 12}" cy="${y - 12}" rx="${r * 0.7}" ry="${r * 0.7}" fill="#abb885" opacity=".8"/></g>`;
  return `<svg id="town" viewBox="0 0 960 720" role="group" aria-label="${t.travel}"><defs><pattern id="paper" width="11" height="13" patternUnits="userSpaceOnUse"><circle cx="2" cy="4" r=".6" fill="#867759" opacity=".13"/></pattern><radialGradient id="grass"><stop stop-color="#e9e5b8"/><stop offset="1" stop-color="#d1d4a4"/></radialGradient></defs><rect width="960" height="720" fill="url(#grass)"/><path d="M0 320q170-60 260 20t270-5t430 40" stroke="#abbba4" stroke-width="35" fill="none"/><path d="M0 320q170-60 260 20t270-5t430 40" stroke="#d2ddc4" stroke-width="22" fill="none"/>
<g fill="none" stroke-linecap="round"><path d="M225 240L475 190L730 190L730 510L180 590L405 455L225 240M475 190L405 455L730 510" stroke="#b4ab86" stroke-width="32"/><path d="M225 240L475 190L730 190L730 510L180 590L405 455L225 240M475 190L405 455L730 510" stroke="#f6ecd0" stroke-width="26"/></g>
<ellipse cx="400" cy="414" rx="115" ry="72" fill="#aabb85"/><path d="M330 416q65-60 140 0" stroke="#ebe3bb" stroke-width="15" fill="none"/><ellipse cx="400" cy="412" rx="30" ry="11" fill="#b9c4bb"/><ellipse cx="400" cy="408" rx="24" ry="8" fill="#8aafa7"/><path d="M400 405v-21" stroke="#bad1c5" stroke-width="5"/>
${trees}${house(200, 220, 134, 95, "#efcf9d", "#ba7865", "bakery")}${house(750, 167, 137, 90, "#c6d0bc", "#6d8a82", "workshop")}${house(165, 567, 155, 111, "#e1bca4", "#857882", "library")}${house(752, 485, 166, 105, "#eacda2", "#a66f58", "hall")}
<g transform="translate(483 162)"><path d="M-57 0v-51h114V0" fill="#d4c3a0" stroke="#6d7868" stroke-width="3"/><path d="M-65-51h130l-9-12h-112Z" fill="#687f72"/><path d="M-40 0v-36h80V0" fill="#bdd0c1"/><path d="M-55 0h110" stroke="#a07555" stroke-width="8"/><g class="bus"><rect x="-35" y="-29" width="68" height="33" rx="7" fill="#c5995f" stroke="#685849"/><path d="M-26-23h50v12h-50" fill="#e4e8ce"/><circle cx="-21" cy="4" r="6" fill="#4d514b"/><circle cx="20" cy="4" r="6" fill="#4d514b"/></g></g>
<g transform="translate(323 467)"><path d="M-23 0v-42h46V0" fill="#dabd8f"/><path d="M-32-42h64l-5-19h-54Z" fill="#ca8d86"/><path d="M-26-42v8m13-8v8m13-8v8m13-8v8m13-8v8" stroke="#f3d4b1" stroke-width="7"/><circle cx="-12" cy="-13" r="7" fill="#b66d7b"/><circle cx="5" cy="-13" r="7" fill="#e2c66a"/><circle cx="18" cy="-13" r="7" fill="#909d70"/></g>
<rect width="960" height="720" fill="url(#paper)" pointer-events="none"/><g id="props"></g><g id="actors"></g>${Object.entries(
    POS,
  )
    .map(
      ([n, [x, y]]) =>
        `<g class="place-label" transform="translate(${x} ${y + 64})"><rect x="-82" y="-14" width="164" height="27" rx="12" fill="#faf1d8" stroke="#a99a79"/><text text-anchor="middle" y="5" fill="#4b4d40" font-size="14">${t.nodes[n]}</text></g>`,
    )
    .join("")}</svg>`;
}
