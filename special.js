/* Special space engine. You don't need to edit this file. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const { esc, paras, picture, reduceMotion } = PZ;

  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };
  const keep = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  let SP = null;

  // The page's content is encrypted (AES-GCM, key made from the password with PBKDF2).
  // Getting the password right is the only way to turn it back into words.
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function unlock(password) {
    const L = window.SPECIAL_LOCKED;
    if (!L) throw new Error("missing");
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: unb64(L.salt), iterations: L.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    try {
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(L.iv) }, key, unb64(L.data));
      return JSON.parse(new TextDecoder().decode(plain));
    } catch (e) { return null; }
  }

  /* ---------- gate ---------- */
  const cameByStar = store.get("pz-star") === "1";
  if (!cameByStar) $("#gate-nostar").hidden = false;
  else {
    const f = $("#gate-form");
    f.hidden = false;
    $("#pw").focus();
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = $("#pw").value.trim().toLowerCase();
      const msg = $("#pw-msg");
      if (!v) { msg.textContent = "Type the password first."; return; }
      const btn = f.querySelector("button");
      btn.disabled = true; btn.textContent = "Unlocking…"; msg.textContent = "";
      let data = null;
      try { data = await unlock(v); } catch (err) { msg.textContent = "This browser can't unlock the page. Try opening the site with https://."; }
      btn.disabled = false; btn.textContent = "Unlock";
      if (data) { SP = data; reveal(); }
      else if (!msg.textContent) {
        msg.textContent = "Not quite. Try again.";
        f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake");
        $("#pw").select();
      }
    });
  }

  /* ---------- photos spread across the page, plus a tap-to-enlarge viewer ---------- */
  // Every photo arrives inside the decrypted content as a data: URL. Nothing is fetched from anywhere.
  const PHOTOS = [];
  const isPic = (u) => typeof u === "string" && /^data:image\//.test(u);
  function pola(src, cls, rot) {
    if (!isPic(src)) return "";
    const i = PHOTOS.push(src) - 1;
    return `<button type="button" class="pola ${cls}" data-pi="${i}" style="--r:${rot}deg" aria-label="Open photo ${i + 1}"><img src="${src}" alt="" decoding="async"></button>`;
  }
  const ROT = [-6, 4, -3, 7, -5, 2, -8, 5, -2, 6, -4, 3, -7];
  function placePhotos() {
    if (isPic(SP.photo)) PHOTOS.push(SP.photo);              // main photo by the note (index 0)
    const mainBox = $("#sp-photo");
    if (isPic(SP.photo)) { mainBox.dataset.pi = "0"; mainBox.setAttribute("role", "button"); mainBox.tabIndex = 0; mainBox.setAttribute("aria-label", "Open photo 1"); }
    $("#sp-sky").innerHTML = (SP.skyPhotos || []).map((u, i) => pola(u, `pola--sky pola--sky${i + 1}`, i ? 9 : -11)).join("");
    $("#sp-taped").innerHTML = (SP.letterPhotos || []).map((u, i) => pola(u, `pola--taped pola--taped${i + 1}`, i ? 6 : -5)).join("");
    const wall = (SP.wallPhotos || []).map((u, i) => pola(u, "pola--wall", ROT[i % ROT.length])).join("");
    if (wall) $("#sp-wall").innerHTML = wall; else $("#sp-wall-sec").remove();
    $("#sp-final").innerHTML = pola(SP.finalPhoto, "pola--final", -3);
  }
  const viewer = $("#viewer"), vCount = $("#viewer-count");
  const vImg = document.createElement("img");   // created here so the page never ships an empty <img>
  vImg.alt = "Photo of us";
  $("#viewer-fig").prepend(vImg);
  let vAt = 0, vFrom = null;
  function show(i) {
    vAt = (i + PHOTOS.length) % PHOTOS.length;
    vImg.src = PHOTOS[vAt];
    vCount.textContent = `${vAt + 1} / ${PHOTOS.length}`;
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-pi]");
    if (t && !viewer.open) { vFrom = t; show(+t.dataset.pi); viewer.showModal(); return; }
    const b = e.target.closest("[data-v]");
    if (b) { if (b.dataset.v === "close") viewer.close(); else show(vAt + (b.dataset.v === "next" ? 1 : -1)); return; }
    if (e.target === viewer) viewer.close();
  });
  document.addEventListener("keydown", (e) => {
    if (viewer.open && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { e.preventDefault(); show(vAt + (e.key === "ArrowRight" ? 1 : -1)); }
    const t = e.target.closest && e.target.closest('[data-pi][role="button"]');
    if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); t.click(); }
  });
  viewer.addEventListener("close", () => { vImg.removeAttribute("src"); if (vFrom) vFrom.focus({ preventScroll: true }); });
  let tx = null;
  viewer.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", (e) => { if (tx == null) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(vAt + (d < 0 ? 1 : -1)); tx = null; });

  /* ---------- the page itself ---------- */
  function reveal() {
    $("#gate").remove();
    const secret = $("#secret");
    secret.hidden = false;

    document.title = `${SP.title} · Planet Zorgon`;
    $("#sp-title").textContent = SP.title;
    $("#sp-name").textContent = SP.name || "you";
    $("#sp-planet").innerHTML = PZ.buildPlanet("special", { burst: false });
    $("#sp-photo").innerHTML = picture(SP.photo, SP.photoCaption || "Photo", "Their photo here");
    placePhotos();
    $("#sp-caption").textContent = SP.photoCaption || "";
    $("#sp-letter").innerHTML = paras(SP.letter);
    $("#sp-sign").textContent = SP.sign || "";

    const list = (SP.watchlist || []).map((w, i) => ({ ...w, _key: "pz-watched-" + PZ.slug(w.title) }));
    const ul = $("#sp-list");
    const render = (filter) => {
      const items = list.filter((w) => filter === "all" || w.type === filter);
      ul.innerHTML = items.length ? items.map((w, i) => {
        const done = keep.get(w._key) === "1";
        return `<li class="sp-item${done ? " is-done" : ""}" style="--r:${[-1.4, 1, -0.6, 1.3, -1][i % 5]}deg">
          <div class="ink ink--blue sp-item__img">${picture(w.image, `${w.title} poster`, w.type === "show" ? "Show poster" : "Movie poster")}</div>
          <div class="sp-item__text">
            ${w.sample ? `<span class="sample">Sample — replace me</span>` : ""}
            <p class="sp-item__type">${w.type === "show" ? "Show" : "Movie"}${w.year ? " · " + esc(w.year) : ""}${w.where ? " · " + esc(w.where) : ""}</p>
            <h3 class="sp-item__title">${esc(w.title)}</h3>
            <p class="sp-item__why">${esc(w.why)}</p>
            <button type="button" class="sp-tick" data-key="${w._key}" aria-pressed="${done}">
              <span class="sp-tick__box"><svg aria-hidden="true"><use href="#i-check"/></svg></span>
              <span>${done ? "Watched" : "Mark as watched"}</span>
            </button>
          </div>
        </li>`;
      }).join("") : `<li class="empty"><p>Nothing here yet.</p></li>`;
      const n = list.filter((w) => keep.get(w._key) === "1").length;
      $("#sp-progress").textContent = list.length ? `${n} of ${list.length} watched` : "";
    };
    let current = "all";
    render(current);
    document.querySelectorAll('.sp-watch [role="tab"]').forEach((t) => t.addEventListener("click", () => {
      current = t.dataset.f;
      document.querySelectorAll('.sp-watch [role="tab"]').forEach((x) => x.setAttribute("aria-selected", x === t));
      render(current);
    }));
    ul.addEventListener("click", (e) => {
      const b = e.target.closest(".sp-tick");
      if (!b) return;
      const on = b.getAttribute("aria-pressed") !== "true";
      keep.set(b.dataset.key, on ? "1" : "0");
      render(current);
      const again = ul.querySelector(`[data-key="${b.dataset.key}"]`);
      if (again) again.focus();
    });

    const svg = $("#sp-planet");
    if (reduceMotion) svg.pauseAnimations && svg.pauseAnimations();
    else document.documentElement.classList.add("motion");
  }
})();
