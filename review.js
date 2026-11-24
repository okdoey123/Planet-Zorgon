/* Planet Zorgon — review page. Builds one page per review from content.js. You don't need to edit this file. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const { S, DATA, CAT_LABEL, CAT_PLURAL, esc, paras, picture, score, sampleTag, reviewUrl, reduceMotion } = PZ;

  const PLANET_NAME = { comics: "the Comics Planet", movies: "the Movie Planet", games: "the Game Planet" };

  document.querySelectorAll("[data-site-name]").forEach((el) => (el.textContent = S.name));

  /* ---------- find the review from the address ---------- */
  const m = /^#(movies|games|comics)--(.+)$/.exec(decodeURIComponent(location.hash));
  const cat = m ? m[1] : null;
  const list = cat ? DATA[cat] || [] : [];
  const idx = m ? list.findIndex((x) => x._slug === m[2]) : -1;
  const it = list[idx];

  if (!it) {
    document.title = `Lost in space · ${S.name}`;
    $("#rv-title").textContent = "This review drifted out of orbit";
    $("#rv-meta").innerHTML = "";
    $("#rv-verdict").textContent = "The link might be old, or the review was renamed.";
    $("#rv-planet-svg").innerHTML = PZ.buildPlanet("comics");
    $("#rv-planet-cap").textContent = "";
    $("#rv-back").href = "index.html#like";
    $("#review").remove();
    $("#rv-more").remove();
  } else {
    document.title = `${it.title} · ${S.name}`;
    document.body.dataset.cat = cat;
    $("#rv-back").href = `index.html#like/${cat}`;
    $("#rv-back span").textContent = `All ${CAT_PLURAL[cat].toLowerCase()}`;
    $("#rv-title").textContent = it.title;
    $("#rv-meta").innerHTML = `${score(it.score)}<span>${CAT_LABEL[cat]}${it.year ? " · " + esc(it.year) : ""}</span>${sampleTag(it)}`;
    $("#rv-verdict").textContent = it.verdict || "";
    if (!it.verdict) $("#rv-verdict").remove();
    $("#rv-planet-svg").innerHTML = PZ.buildPlanet(cat);
    $("#rv-planet-cap").textContent = `You're orbiting ${PLANET_NAME[cat]}`;

    $("#rv-cover").innerHTML = picture(it.image, `${it.title} ${CAT_LABEL[cat].toLowerCase()} cover`, "Cover goes here");
    if (!it.image) $(".rv-cover__hint").remove();
    else $("#rv-cover").addEventListener("click", (e) => e.currentTarget.classList.toggle("is-real"));
    $("#rv-text").innerHTML = paras(it.review) || "<p>Review coming soon.</p>";
    if (Array.isArray(it.credits) && it.credits.length) {
      const dl = $("#rv-credits");
      dl.hidden = false;
      dl.innerHTML = it.credits.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
    }

    /* more from this category */
    const others = list.filter((_, i) => i !== idx).slice(0, 6);
    $("#rv-more-h").textContent = `More ${CAT_PLURAL[cat].toLowerCase()} I like`;
    $("#rv-more-list").innerHTML = others.length
      ? others.map((o, i) => `
        <article class="print" style="--r:${[-1.2, 0.8, -0.4, 1.1, -0.9, 0.5][i % 6]}deg">
          <a class="print__link" href="${reviewUrl(cat, o)}">
            <div class="ink ink--blue print__img">${picture(o.image, `${o.title} artwork`, "Cover goes here")}</div>
            <div class="print__text">
              ${sampleTag(o)}
              <h3 class="print__title">${esc(o.title)}${o.year ? ` <span class="print__year">${esc(o.year)}</span>` : ""}</h3>
              ${score(o.score)}
              <p class="print__verdict">${esc(o.verdict)}</p>
            </div>
          </a>
        </article>`).join("")
      : `<div class="empty"><svg aria-hidden="true"><use href="#i-planet"/></svg><p>That's the only ${CAT_LABEL[cat].toLowerCase()} on the planet so far. More soon.</p></div>`;
    $("#rv-more-list").className = `shelf shelf--${cat}`;
  }

  /* someone changes the #address on this page (e.g. clicks another review) → rebuild */
  window.addEventListener("hashchange", () => location.reload());

  const svg = $("#rv-planet-svg");
  if (reduceMotion) { svg.pauseAnimations && svg.pauseAnimations(); }
  else document.documentElement.classList.add("motion");
})();
