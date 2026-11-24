/* Planet Zorgon — shared helpers used by every page. You don't need to edit this file. */
window.PZ = (function () {
  "use strict";

  function need(name, fallback) {
    try { return eval(name); } catch (e) { return fallback; }
  }
  const site = need("SITE", null);
  function showOops() {
    const o = document.getElementById("oops");
    if (!o) return;
    o.hidden = false;
    o.innerHTML = "<strong>content.js didn't load.</strong> Usually that's a missing comma <code>},</code> or a missing backtick <code>`</code> near the last thing you edited. Undo your last change and try again.";
  }
  if (!site) document.addEventListener("DOMContentLoaded", showOops), showOops();

  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const paras = (t) => String(t ?? "").trim().split(/\n\s*\n/).map((p) => `<p>${esc(p.trim()).replace(/\n/g, "<br>")}</p>`).join("");
  const slug = (t) => String(t ?? "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60).replace(/-$/, "") || "item";
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0));
  const icon = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

  const DATA = { movies: need("MOVIES", []), games: need("GAMES", []), comics: need("COMICS", []) };
  Object.keys(DATA).forEach((cat) => {
    const used = {};
    (DATA[cat] || []).forEach((it) => {
      let s = slug(it.title);
      if (used[s]) s += "-" + ++used[s]; else used[s] = 1;
      it._slug = s;
    });
  });
  const reviewUrl = (cat, it) => `review.html#${cat}--${it._slug}`;

  function parseDate(d) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ""));
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  const fmt = (d, o) => (d ? d.toLocaleDateString("en-GB", o) : "");

  function picture(src, alt, hint) {
    const ph = `<span class="ph" ${src ? "hidden" : ""}>
        <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="22" fill="currentColor"/><ellipse cx="50" cy="50" rx="40" ry="11" fill="none" stroke="currentColor" stroke-width="4" transform="rotate(-18 50 50)"/></svg>
        <span>${esc(hint || "Picture goes here")}</span></span>`;
    if (!src) return ph;
    return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false">${ph}`;
  }

  function score(n, label = "Zorgon score") {
    n = clamp(n, 0, 5);
    let s = "";
    for (let i = 1; i <= 5; i++) s += icon("i-planet", i <= n ? "on" : "off");
    return `<span class="score" role="img" aria-label="${label}: ${n} out of 5">${s}</span>`;
  }

  const MISERY_NAMES = ["", "Mildly cursed", "Meh", "Grim", "Doomed", "Total eclipse"];
  function misery(n) {
    n = clamp(n, 1, 5);
    let s = "";
    for (let i = 1; i <= 5; i++) s += icon("i-cloud", i <= n ? "on" : "off");
    return `<span class="misery" role="img" aria-label="Misery level ${n} out of 5, ${MISERY_NAMES[n]}">${s}<span class="misery__name" aria-hidden="true">${MISERY_NAMES[n]}</span></span>`;
  }

  /* ---------- planets (home = "mix", review pages = one per category) ---------- */
  const C = { pink: "#ff4fa3", pinkLite: "#ff9fcd", blue: "#2846b8", yellow: "#ffd23f", paper: "#f3f0f7", ink: "#17184a" };
  /* ---------- tiny deterministic random so each planet looks the same every visit ---------- */
  function rng(seed) { let x = seed || 7; return () => ((x = (x * 16807) % 2147483647) / 2147483647); }

  /* ---------- planet surfaces: one per category ---------- */
  // The surface is drawn in a 380×380 tile (x 110–490, y 110–490) and repeated once to the right,
  // then slid left forever, which reads as the planet spinning.
  function comicsSurface(rows = [[95, [.4, .26, .34]], [92, [.56, .44]], [103, [.24, .42, .34]], [90, [.62, .38]]], y = 110, withBg = true) {
    const fills = [C.pink, C.yellow, C.paper, C.blue, C.pinkLite, C.yellow, C.pink, C.paper, C.blue, C.pink];
    const g = 7; let k = 0, out = withBg ? `<rect x="110" y="110" width="380" height="380" fill="${C.ink}"/>` : "";
    rows.forEach(([h, cols]) => {
      let x = 110;
      cols.forEach((f) => {
        const w = 380 * f, fill = fills[k % fills.length];
        const px = x + g / 2, py = y + g / 2, pw = w - g, ph = h - g;
        out += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${fill}"/>`;
        if (k % 3 === 0) out += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="url(#bd)" opacity=".55"/>`;
        if (k % 4 === 1) { // a little speech bubble
          const cx = px + pw * .5, cy = py + ph * .42;
          out += `<ellipse cx="${cx}" cy="${cy}" rx="${Math.min(pw * .32, 34)}" ry="${Math.min(ph * .22, 18)}" fill="${C.paper}" stroke="${C.ink}" stroke-width="3"/>
                  <path d="M${cx - 6} ${cy + Math.min(ph * .2, 16)} l-8 14 l16 -12z" fill="${C.paper}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`;
        }
        if (k % 4 === 3) out += burst(px + pw / 2, py + ph / 2, Math.min(pw, ph) * .34, 10, k % 2 ? C.yellow : C.pink);
        x += w; k++;
      });
      y += h;
    });
    return out;
  }
  function moviesSurface(ys = [140, 270, 400], withBg = true) {
    let out = withBg ? `<rect x="110" y="110" width="380" height="380" fill="${C.pink}"/>` : "";
    const fills = [C.yellow, C.paper, C.pinkLite, C.blue, C.yellow, C.paper];
    ys.forEach((y, r) => {
      out += `<rect x="110" y="${y - 6}" width="380" height="88" fill="${C.ink}"/>`;
      for (let x = 112; x < 490; x += 16) out += `<rect x="${x}" y="${y}" width="8" height="7" rx="2" fill="${C.paper}"/><rect x="${x}" y="${y + 69}" width="8" height="7" rx="2" fill="${C.paper}"/>`;
      for (let i = 0; i < 4; i++) out += `<rect x="${114 + i * 95 + (r * 30) % 95}" y="${y + 13}" width="85" height="50" fill="${fills[(i + r) % fills.length]}"/>`;
    });
    return out;
  }
  function gamesSurface(y0 = 110) {
    const r = rng(42); let out = "";
    const pal = [C.pink, C.pink, C.pink, C.pinkLite, C.yellow, C.blue, C.paper];
    for (let y = y0; y < 490; y += 19) for (let x = 110; x < 490; x += 19) out += `<rect x="${x}" y="${y}" width="19.5" height="19.5" fill="${pal[Math.floor(r() * pal.length)]}"/>`;
    return out;
  }
  // Home planet: all three worlds stacked as bands, comics on top, film in the middle, pixels below
  function mixSurface() {
    return `<rect x="110" y="110" width="380" height="380" fill="${C.ink}"/>`
      + comicsSurface([[66, [.4, .26, .34]], [70, [.56, .44]]], 110, false)
      + moviesSurface([253], false)
      + gamesSurface(345);
  }
  // Special planet: soft pink with rows of little hearts
  function specialSurface() {
    let out = `<rect x="110" y="110" width="380" height="380" fill="${C.pink}"/>`;
    const heart = (x, y, sz, fill) => `<path transform="translate(${x} ${y}) scale(${sz})" d="M0 -3c-1.6-4-8-4-8 1 0 4 5 7 8 10 3-3 8-6 8-10 0-5-6.4-5-8-1z" fill="${fill}"/>`;
    const fills = [C.pinkLite, C.paper, C.yellow, C.pinkLite];
    let k = 0;
    for (let y = 130; y < 490; y += 38) for (let x = 120 + ((y / 38) % 2) * 19; x < 490; x += 38) out += heart(x, y, 1.15, fills[k++ % fills.length]);
    return out;
  }
  function burst(cx, cy, R, n, fill) {
    let p = "";
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI * i) / n, rr = i % 2 ? R * .55 : R;
      p += `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)} `;
    }
    return `<polygon points="${p}" fill="${fill}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`;
  }

  // The whole ring sits BEHIND the ball: it only shows where it pokes out at the sides.
  function ring(cat) {
    const d = "M40 300a260 70 0 1 1 520 0a260 70 0 1 1-520 0";
    const dash = { comics: "58 7", movies: "", games: "16 5", mix: "58 7", special: "" }[cat];
    let s = `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="34"/>
             <path d="${d}" fill="none" stroke="${C.yellow}" stroke-width="24" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
    if (cat === "movies" || cat === "mix") s += `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="6" stroke-dasharray="7 9"/>`;
    return `<g class="planet__ring" transform="rotate(-18)">${s}</g>`;
  }

  function moons(cat) {
    const orbit = "M20 300a280 110 0 1 0 560 0a280 110 0 1 0-560 0";
    const bubble = (txt, fill) => `<g><path d="M-44 -26h88a14 14 0 0 1 14 14v26a14 14 0 0 1-14 14h-52l-18 18 4-18h-22a14 14 0 0 1-14-14v-26a14 14 0 0 1 14-14z" fill="${fill}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>
        <text x="0" y="12" text-anchor="middle" font-family="Shrikhand, Georgia, serif" font-size="30" fill="${C.ink}">${txt}</text></g>`;
    const ball = (r, fill) => `<circle r="${r}" fill="${fill}" stroke="${C.ink}" stroke-width="4"/>`;
    const a = cat === "comics" ? bubble("?!", C.paper) : ball(20, C.paper);
    const b = cat === "comics" ? bubble("!!", C.yellow) : ball(13, C.yellow);
    const reel = `<g><circle r="24" fill="${C.paper}" stroke="${C.ink}" stroke-width="4"/>${[0, 72, 144, 216, 288].map((d) => `<circle r="5.5" cx="${(Math.cos(d * Math.PI / 180) * 12).toFixed(1)}" cy="${(Math.sin(d * Math.PI / 180) * 12).toFixed(1)}" fill="${C.ink}"/>`).join("")}<circle r="3" fill="${C.ink}"/></g>`;
    const heart = `<g transform="translate(-21 -18)">${["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"].map((row, y) => [...row].map((c, x) => c === "1" ? `<rect x="${x * 6}" y="${y * 6}" width="6.4" height="6.4" fill="${C.pink}"/>` : "").join("")).join("")}</g>`;
    const ride = (shape, dur, begin) => `<g>${shape}<animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${orbit}"/></g>`;
    if (cat === "mix") return `<g transform="rotate(-18 300 300)">${ride(bubble("?!", C.paper), 30, 0)}${ride(reel, 30, -10)}${ride(`<g><rect x="-30" y="-27" width="60" height="50" rx="10" fill="${C.yellow}" stroke="${C.ink}" stroke-width="4"/>${heart.replace('translate(-21 -18)', 'translate(-21 -20)')}</g>`, 30, -20)}</g>`;
    return `<g transform="rotate(-18 300 300)">${ride(a, 26, 0)}${ride(b, 26, -13)}</g>`;
  }

  function buildPlanet(cat, opts = {}) {
    const surface = { comics: comicsSurface, movies: moviesSurface, games: gamesSurface, mix: mixSurface, special: specialSurface }[cat]();
    return `
      <defs>
        <pattern id="bd" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="2" fill="${C.ink}"/></pattern>
        <clipPath id="rvclip"><circle cx="300" cy="300" r="190"/></clipPath>
        <radialGradient id="rvlimb" cx="40%" cy="36%" r="66%">
          <stop offset=".55" stop-color="${C.ink}" stop-opacity="0"/>
          <stop offset="1" stop-color="${C.ink}" stop-opacity=".5"/>
        </radialGradient>
        <radialGradient id="rvshine" cx="34%" cy="28%" r="30%">
          <stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      ${opts.burst === false ? "" : `<g class="rv-burst">${burst(300, 300, 292, 16, C.pink).replace(`stroke="${C.ink}" stroke-width="3"`, 'stroke="none"')}</g>`}
      ${ring(cat)}
      <g class="planet__ball">
        <g clip-path="url(#rvclip)">
          <g transform="rotate(-18 300 300)">
            <g class="planet__surface"><g id="rvsurf">${surface}</g><use href="#rvsurf" x="380"/></g>
          </g>
          <circle cx="300" cy="300" r="190" fill="url(#rvlimb)"/>
          <circle cx="300" cy="300" r="190" fill="url(#rvshine)"/>
        </g>
        <circle cx="300" cy="300" r="190" fill="none" stroke="${C.ink}" stroke-width="7"/>
      </g>
      ${moons(cat)}`;
  }


  const sampleTag = (it) => (it && it.sample ? `<span class="sample">Sample — replace me</span>` : "");

  return {
    S: site || { name: "Planet Zorgon", tagline: "" },
    ABOUT: need("ABOUT", { bio: "", passport: [], morePhotos: [] }),
    DATA,
    MIS: need("MISERIES", []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date))),
    CAT_LABEL: { movies: "Movie", games: "Game", comics: "Comic" },
    CAT_PLURAL: { movies: "Movies", games: "Games", comics: "Comics" },
    buildPlanet, esc, paras, slug, clamp, icon, parseDate, fmt, picture, score, misery, sampleTag, reviewUrl,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
})();
