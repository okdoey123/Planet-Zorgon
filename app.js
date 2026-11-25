/* Planet Zorgon — site engine. You don't need to edit this file. */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const { S, DATA, MIS, CAT_LABEL, esc, paras, clamp, icon, parseDate, fmt, picture, score, misery, sampleTag, reviewUrl, reduceMotion } = PZ;
  const ABOUT_ = PZ.ABOUT;

  /* ---------- site name + hero ---------- */
  $$("[data-site-name]").forEach((el) => (el.textContent = S.name));
  const words = String(S.name).trim().split(/\s+/);
  const h1 = $("[data-site-name-split]");
  h1.innerHTML = words.length > 1
    ? `<span>${esc(words.slice(0, -1).join(" "))}</span><span>${esc(words[words.length - 1])}</span>`
    : `<span>${esc(S.name)}</span>`;
  $("[data-site-tagline]").textContent = S.tagline || "";
  document.title = S.name;

  if (MIS[0]) {
    const l = $("#latest");
    l.hidden = false;
    l.href = `#miseries/${MIS[0].date}`;
    $(".hero__latest-text", l).innerHTML = `<b>${esc(fmt(parseDate(MIS[0].date), { day: "numeric", month: "short" }))}</b> ${esc(MIS[0].title)}`;
  }

  /* ---------- about ---------- */
  $("#about-h").textContent = ABOUT_.heading || "About Me";
  $("#about-bio").innerHTML = paras(ABOUT_.bio);
  $('[data-slot="about-photo"]').innerHTML = picture(ABOUT_.photo, `Photo of ${S.name}'s inhabitant`, "Your face here");
  $(".passport__fields").innerHTML = (ABOUT_.passport || [])
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  const ev = (ABOUT_.morePhotos || []).slice(0, 6);
  const evEl = $("#evidence");
  if (ev.length) {
    evEl.innerHTML = ev.map((p, i) => `<li class="evidence__item" style="--r:${[-3, 2, -1.5, 3, -2, 1][i]}deg">
        <figure><div class="ink ink--blue">${picture(p.image, p.caption || "Photo", "Photo here")}</div>
        ${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ""}</figure></li>`).join("");
  } else evEl.remove();

  /* ---------- shit I like ---------- */
  Object.keys(DATA).forEach((cat) => {
    const list = DATA[cat] || [];
    $(`#tab-${cat} .tabs__n`).textContent = list.length;
    const panel = $(`#panel-${cat}`);
    if (!list.length) {
      panel.innerHTML = `<div class="empty">${icon("i-planet")}<p>Nothing here yet. Add your first ${CAT_LABEL[cat].toLowerCase()} in <code>content.js</code>.</p></div>`;
      return;
    }
    panel.innerHTML = list.map((it, i) => `
      <article class="print${i === 0 ? " print--lead" : ""}" style="--r:${[-1.2, 0.8, -0.4, 1.1, -0.9, 0.5][i % 6]}deg">
        <a class="print__link" href="${reviewUrl(cat, it)}">
          <div class="ink ink--blue print__img">${picture(it.image, `${it.title} ${CAT_LABEL[cat].toLowerCase()} artwork`, "Cover goes here")}</div>
          <div class="print__text">
            ${sampleTag(it)}
            <h3 class="print__title">${esc(it.title)}${it.year ? ` <span class="print__year">${esc(it.year)}</span>` : ""}</h3>
            ${score(it.score)}
            <p class="print__verdict">${esc(it.verdict)}</p>
            <span class="print__more">Read the review ${icon("i-arrow")}</span>
          </div>
        </a>
      </article>`).join("");
  });

  const tabs = $$('.tabs [role="tab"]');
  function selectTab(cat, focus) {
    tabs.forEach((t) => {
      const on = t.dataset.cat === cat;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
      if (on && focus) t.focus();
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => { selectTab(t.dataset.cat); history.replaceState(null, "", `#like/${t.dataset.cat}`); });
    t.addEventListener("keydown", (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const n = tabs[(i + d + tabs.length) % tabs.length];
      selectTab(n.dataset.cat, true);
      history.replaceState(null, "", `#like/${n.dataset.cat}`);
    });
  });
  selectTab("movies");

  /* ---------- daily miseries ---------- */
  const cal = $("#calendar");
  const sheet = $("#sheet");
  if (!MIS.length) {
    cal.remove();
    sheet.innerHTML = `<div class="empty empty--sheet">${icon("i-cloud")}<p>No miseries yet. Suspiciously good week. Add an entry in <code>content.js</code>.</p></div>`;
  } else {
    cal.innerHTML = MIS.map((m, i) => {
      const d = parseDate(m.date);
      return `<button role="tab" class="day" id="day-${esc(m.date)}-${i}" data-i="${i}" aria-controls="sheet" style="--lvl:${clamp(m.misery, 1, 5)}">
        <span class="day__num">${d ? d.getDate() : "?"}</span>
        <span class="day__mon">${esc(fmt(d, { month: "short" }))}</span>
        <span class="day__lvl" aria-hidden="true"></span>
        <span class="visually-hidden">${esc(m.title)}</span>
      </button>`;
    }).join("");
  }
  const days = $$(".day", cal);
  function showMisery(i, focus) {
    const m = MIS[i];
    if (!m) return;
    days.forEach((b, j) => { b.setAttribute("aria-selected", j === i); b.tabIndex = j === i ? 0 : -1; });
    sheet.setAttribute("aria-labelledby", days[i].id);
    const d = parseDate(m.date);
    sheet.innerHTML = `
      <header class="sheet__head">
        <p class="sheet__date">${esc(fmt(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) || m.date)}</p>
        ${sampleTag(m)}
        <h3 class="sheet__title">${esc(m.title)}</h3>
        ${misery(m.misery)}
      </header>
      ${m.image ? `<div class="ink ink--pink sheet__img">${picture(m.image, m.title, "Picture")}</div>` : ""}
      <div class="prose">${paras(m.text)}</div>
      <nav class="sheet__nav" aria-label="Older and newer entries">
        ${MIS[i + 1] ? `<button type="button" data-go="${i + 1}">${icon("i-arrow", "flip")} Older</button>` : "<span></span>"}
        ${MIS[i - 1] ? `<button type="button" data-go="${i - 1}">Newer ${icon("i-arrow")}</button>` : ""}
      </nav>`;
    if (!reduceMotion) { sheet.classList.remove("is-new"); void sheet.offsetWidth; sheet.classList.add("is-new"); }
    if (focus) days[i].focus();
    // keep the chosen date visible inside the calendar strip only (never scroll the page)
    const b = days[i], c = cal;
    if (c.scrollWidth > c.clientWidth) c.scrollTo({ left: b.offsetLeft - c.clientWidth / 2 + b.offsetWidth / 2, behavior: "smooth" });
    else if (c.scrollHeight > c.clientHeight) c.scrollTo({ top: b.offsetTop - c.clientHeight / 2 + b.offsetHeight / 2, behavior: "smooth" });
  }
  days.forEach((b, i) => {
    b.addEventListener("click", () => { showMisery(i); history.replaceState(null, "", `#miseries/${MIS[i].date}`); });
    b.addEventListener("keydown", (e) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const n = clamp(i + d, 0, days.length - 1);
      showMisery(n, true);
      history.replaceState(null, "", `#miseries/${MIS[n].date}`);
    });
  });
  sheet.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (!b) return;
    const n = +b.dataset.go;
    showMisery(n, true);
    history.replaceState(null, "", `#miseries/${MIS[n].date}`);
  });
  if (MIS.length) showMisery(0);

  /* ---------- router: makes every review & entry shareable by link ---------- */
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    let m;
    if ((m = /^(movies|games|comics)\/(.+)$/.exec(h))) { location.replace(`review.html#${m[1]}--${m[2]}`); return; }
    if ((m = /^like\/(movies|games|comics)$/.exec(h))) {
      selectTab(m[1]);
      $("#like").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    } else if ((m = /^miseries\/(.+)$/.exec(h))) {
      const i = MIS.findIndex((x) => x.date === m[1]);
      if (i > -1) showMisery(i);
      $("#miseries").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  }
  window.addEventListener("hashchange", route);
  route();

  /* ---------- nav highlight ---------- */
  const navLinks = $$("[data-nav]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) navLinks.forEach((a) => a.toggleAttribute("aria-current", a.dataset.nav === en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["about", "like", "miseries"].forEach((id) => io.observe(document.getElementById(id)));
  const bar = $("#bar");
  const onScroll = () => bar.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- three stars: only the one on the right leads somewhere; the others do nothing ---------- */
  document.querySelectorAll(".wish__star").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.star !== "3") return;
    try { sessionStorage.setItem("pz-star", "1"); } catch (e) {}
    location.href = "special.html";
  }));

  /* ---------- the one big moment: the planet prints itself into register ---------- */
  const planet = $("#planet");
  planet.innerHTML = PZ.buildPlanet("mix", { burst: false });
  if (reduceMotion) { planet.pauseAnimations && planet.pauseAnimations(); }
  else document.documentElement.classList.add("motion");
  requestAnimationFrame(() => document.documentElement.classList.add("ready"));
})();
