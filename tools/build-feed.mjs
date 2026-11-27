// Planet Zorgon build step. Cloudflare Pages runs this on every deploy:
//   1. content/*.json  (edited in Pages CMS)  ->  content.js  (what the pages read)
//   2. content.js data                         ->  feed.xml    (email updates via follow.it)
import fs from "node:fs";

const SITE_URL = "https://planet-zorgon.pages.dev";
const read = (f, fallback) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.warn(`! ${f}: ${e.message}`); return fallback; } };

// Pages CMS saves pictures as "/images/x.jpg"; the site uses "images/x.jpg". Accept both.
const pic = (p) => String(p || "").trim().replace(/^\/+/, "");
const num = (n, lo, hi, d) => { const v = parseInt(n, 10); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; };
const half = (n) => { const v = parseFloat(n); return Number.isFinite(v) ? Math.max(0, Math.min(5, Math.round(v * 2) / 2)) : 0; }; // 0, 0.5 … 5
const pairs = (arr) => (Array.isArray(arr) ? arr : []).filter((x) => x && (x.label || x.value)).map((x) => [String(x.label || ""), String(x.value || "")]);
const byDateDesc = (a, b) => String(b.date || "").localeCompare(String(a.date || ""));

/* ---------- 1. content.js ---------- */
const site = read("content/site.json", { name: "Planet Zorgon", tagline: "", about: {} });
const about = site.about || {};
const review = (it) => ({
  ...(it.sample ? { sample: true } : {}),
  title: String(it.title || "Untitled"),
  year: String(it.year || ""),
  date: String(it.date || ""),
  image: pic(it.image),
  score: half(it.score),
  verdict: String(it.verdict || ""),
  review: String(it.review || ""),
  credits: pairs(it.credits),
});
const list = (f) => (read(f, []) || []).filter(Boolean).map(review).sort(byDateDesc); // newest first = featured spot

const SITE = { name: String(site.name || "Planet Zorgon"), tagline: String(site.tagline || "") };
const ABOUT = {
  photo: pic(about.photo),
  heading: String(about.heading || "About Me"),
  bio: String(about.bio || ""),
  passport: pairs(about.passport),
  morePhotos: (Array.isArray(about.morePhotos) ? about.morePhotos : []).map((p) => ({ image: pic(p && p.image), caption: String((p && p.caption) || "") })),
};
const MOVIES = list("content/movies.json");
const GAMES = list("content/games.json");
const COMICS = list("content/comics.json");
const MISERIES = (read("content/miseries.json", []) || []).filter(Boolean).map((m) => ({
  ...(m.sample ? { sample: true } : {}),
  date: String(m.date || "").slice(0, 10),
  title: String(m.title || "Untitled"),
  misery: num(m.misery, 1, 5, 3),
  image: pic(m.image),
  text: String(m.text || ""),
})).sort(byDateDesc);

const J = (v) => JSON.stringify(v, null, 2);
fs.writeFileSync("content.js", `/* =====================================================================
   GENERATED FILE: do not edit by hand.
   Edit your content in Pages CMS (app.pagescms.org), or in the content/ folder.
   This file is rebuilt from content/*.json every time the site publishes.
   ===================================================================== */
const SITE = ${J(SITE)};
const ABOUT = ${J(ABOUT)};
const MOVIES = ${J(MOVIES)};
const GAMES = ${J(GAMES)};
const COMICS = ${J(COMICS)};
const MISERIES = ${J(MISERIES)};
`);
console.log(`content.js: ${MOVIES.length} movies, ${GAMES.length} games, ${COMICS.length} comics, ${MISERIES.length} miseries`);

/* ---------- 2. feed.xml ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
const slug = (t) => String(t ?? "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60).replace(/-$/, "") || "item";
const day = (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || "")); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 6)) : null; };
const LABEL = { movies: "Movie", games: "Game", comics: "Comic" };
const plain = (t) => String(t || "").replace(/\*\*(.+?)\*\*/g, "$1").trim();

const items = [];
MISERIES.filter((m) => !m.sample).forEach((m) => items.push({ title: `Daily Misery: ${m.title}`, link: `${SITE_URL}/#miseries/${m.date}`, date: day(m.date), text: plain(m.text) }));
for (const [cat, arr] of [["movies", MOVIES], ["games", GAMES], ["comics", COMICS]]) {
  const used = {};
  arr.forEach((it) => {
    let s = slug(it.title); if (used[s]) s += "-" + ++used[s]; else used[s] = 1; // same rule as the site
    if (it.sample) return;
    items.push({ title: `${LABEL[cat]} review: ${it.title}`, link: `${SITE_URL}/review.html#${cat}--${s}`, date: day(it.date), text: plain([it.verdict, it.review].filter(Boolean).join("\n\n")) });
  });
}
items.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

fs.writeFileSync("feed.xml", `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(SITE.name)}</title>
  <link>${SITE_URL}/</link>
  <description>${esc(SITE.tagline)}</description>
  <language>en</language>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items.slice(0, 30).map((i) => `  <item>
    <title>${esc(i.title)}</title>
    <link>${esc(i.link)}</link>
    <guid isPermaLink="true">${esc(i.link)}</guid>
${i.date ? `    <pubDate>${i.date.toUTCString()}</pubDate>\n` : ""}    <description>${esc(i.text.length > 600 ? i.text.slice(0, 600) + "…" : i.text)}</description>
  </item>`).join("\n")}
</channel>
</rss>
`);
console.log(`feed.xml: ${items.length} item(s)`);
