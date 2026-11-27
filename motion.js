/* Planet Zorgon: scroll motion. You don't need to edit this file.
   - Planets drift, turn and shrink a little as you scroll past them (parallax).
   - Headings slide in with their pink "misprint" layer snapping into place.
   - Cards, photos and calendar days float up into view one after another.
   Visitors who ask their device for reduced motion get the still version. */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const root = document.documentElement;
  root.classList.add("motion");

  /* ---------- 1. things that slide into view ---------- */
  const TARGETS = [
    // headings: the misregistered riso title snaps into register
    [".about .display, .like .display, .miseries .display, .rv-more .display, .sp-wall .display, .sp-watch .display, .rv-sheet__h, .sp-h, .signal__h, .foot__end", "rv-head"],
    // cards and blocks float up, a little after each other
    [".passport, .about__text .prose, .evidence__item, .tabs, .print, .day, .sheet, .rv-cover, .rv-credits, .signal__inner > *, .sp-item, .sp-photo, .sp-progress, .miseries__sub, .sp-wall__sub", "rv-up"],
    // polaroids drop in like they're being taped up
    [".pola--wall, .pola--taped, .pola--final", "rv-drop"],
    // the footer planet rises like a sunrise
    [".foot__planet", "rv-rise"],
  ];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  function scan(scope) {
    TARGETS.forEach(([sel, cls]) => {
      (scope || document).querySelectorAll(sel).forEach((el) => {
        if (el.dataset.rv) return;
        el.dataset.rv = "1";
        el.classList.add(cls);
        // stagger siblings: each one starts a beat after the previous (capped)
        const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains(cls)) : [];
        el.style.setProperty("--d", Math.min(sibs.indexOf(el), 7) * 70 + "ms");
        io.observe(el);
      });
    });
  }
  scan();
  // content that appears later (review cards, the unlocked secret page, a new tab) gets picked up too
  let pending = 0;
  new MutationObserver(() => { cancelAnimationFrame(pending); pending = requestAnimationFrame(() => scan()); })
    .observe(document.body, { childList: true, subtree: true });

  /* ---------- 2. planets that react to scrolling ---------- */
  const scenes = [
    { box: ".hero", planet: ".hero__planet .planet", copy: ".hero__copy", far: ".hero__sparks" },
    { box: ".rv-hero", planet: ".rv-planet .planet", copy: ".rv-hero__copy" },
    { box: ".sp-hero", planet: ".sp-planet .planet", copy: ".sp-hero__copy", near: ".sp-sky" },
  ].map((s) => ({
    box: document.querySelector(s.box),
    planet: document.querySelector(s.planet),
    copy: s.copy && document.querySelector(s.copy),
    far: s.far && document.querySelector(s.far),
    near: s.near && document.querySelector(s.near),
  })).filter((s) => s.box && s.planet);

  const logo = document.querySelector(".bar__logo");
  let ticking = false;
  function frame() {
    ticking = false;
    const vh = window.innerHeight || 1;
    scenes.forEach((s) => {
      const r = s.box.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh) return;                 // off screen: skip the work
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));   // 0 at top … 1 when scrolled past
      s.planet.style.transform = `translate3d(0, ${p * 90}px, 0) rotate(${p * -24}deg) scale(${1 - p * 0.18})`;
      if (s.copy) { s.copy.style.transform = `translate3d(0, ${p * -50}px, 0)`; s.copy.style.opacity = String(1 - p * 0.7); }
      if (s.far) s.far.style.transform = `translate3d(0, ${p * 140}px, 0)`;   // stars drift slowest: depth
      if (s.near) s.near.style.transform = `translate3d(0, ${p * 30}px, 0)`;  // taped photos trail the planet a little
    });
    // the little planet in the top bar spins as you travel down the page
    if (logo) logo.style.transform = `rotate(${(window.scrollY || 0) * 0.25}deg)`;
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  frame();
})();
