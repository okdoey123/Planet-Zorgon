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
