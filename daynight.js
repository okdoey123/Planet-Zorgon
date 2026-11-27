/* Planet Zorgon: day / night cycle. You don't need to edit this file.
   Uses the visitor's own clock:
     dawn  5:30–7:00   colours warming up, low sun
     day   7:00–17:00  the bright look, sun arcs across the sky
     dusk  17:00–19:30 colours dimming, low sun
     night 19:30–5:30  dark blues, softer inks, stars, a crescent moon arcs across
   Preview any phase by adding ?sky=night (or day / dusk / dawn) to the address. */
(function () {
  "use strict";
  const root = document.documentElement;
  const forced = (location.search.match(/[?&]sky=(day|dusk|night|dawn)/) || [])[1];

  function hourNow() { const d = new Date(); return d.getHours() + d.getMinutes() / 60; }
  function phase(h) {
    if (h >= 5.5 && h < 7) return "dawn";
    if (h >= 7 && h < 17) return "day";
    if (h >= 17 && h < 19.5) return "dusk";
    return "night";
  }
  const THEME = { day: "#2846b8", dawn: "#22389c", dusk: "#22389c", night: "#142463" };

  function apply() {
    const h = hourNow();
    const p = forced || phase(h);
    if (root.dataset.sky !== p) {
      root.dataset.sky = p;
      const m = document.querySelector('meta[name="theme-color"]');
      if (m && !document.body?.classList.contains("is-special")) m.setAttribute("content", THEME[p]);
    }
    placeBody(h, p);
  }
  // set the phase immediately (this file loads in <head>), so the page never flashes the wrong colours
  apply();

  /* ---------- the sun / moon travelling across the top section ---------- */
  const SUN = `<svg viewBox="0 0 100 100" aria-hidden="true"><g class="sky-body__rays">${Array.from({ length: 12 }, (_, i) =>
    `<rect x="47" y="2" width="6" height="16" rx="3" fill="#ffd23f" transform="rotate(${i * 30} 50 50)"/>`).join("")}</g>
    <circle cx="50" cy="50" r="26" fill="#ffd23f"/><circle cx="50" cy="50" r="26" fill="url(#sky-dots)" opacity=".5"/>
    <defs><pattern id="sky-dots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.3" fill="#ff4fa3"/></pattern></defs></svg>`;
  const MOON = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><mask id="sky-crescent"><rect width="100" height="100" fill="#fff"/><circle cx="64" cy="40" r="30" fill="#000"/></mask></defs>
    <g mask="url(#sky-crescent)"><circle cx="50" cy="50" r="32" fill="#f3f0f7"/><circle cx="36" cy="58" r="5" fill="#d8d2e6"/><circle cx="30" cy="40" r="3.5" fill="#d8d2e6"/><circle cx="44" cy="74" r="3" fill="#d8d2e6"/></g></svg>`;

  function placeBody(h, p) {
    const sky = document.querySelector(".hero, .rv-hero");
    if (!sky) return;
    let el = sky.querySelector(".sky-body");
    const isMoon = p === "night";
    if (!el || el.dataset.kind !== (isMoon ? "moon" : "sun")) {
      if (el) el.remove();
      el = document.createElement("div");
      el.className = "sky-body sky-body--" + (isMoon ? "moon" : "sun");
      el.dataset.kind = isMoon ? "moon" : "sun";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = isMoon ? MOON : SUN;
      sky.prepend(el);
    }
    // 0 → 1 across its half of the day: sun 6am→6pm, moon 6pm→6am (forced previews sit mid-sky)
    let t = isMoon ? ((h - 18 + 24) % 24) / 12 : (h - 6) / 12;
    if (forced) t = { dawn: 0.08, day: 0.5, dusk: 0.92, night: 0.5 }[p];
    t = Math.min(1, Math.max(0, t));
    el.style.setProperty("--x", (6 + t * 82).toFixed(2) + "%");
    el.style.setProperty("--y", (58 - Math.sin(Math.PI * t) * 46).toFixed(2) + "%"); // a gentle arc
  }

  document.addEventListener("DOMContentLoaded", apply);
  setInterval(apply, 60 * 1000); // keep up with the clock while the page is open
})();
