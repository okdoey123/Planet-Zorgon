// Builds feed.xml (an RSS feed of new posts) from content.js.
// Netlify runs this automatically on every deploy (see netlify.toml), so the feed is always fresh.
// Email services (e.g. follow.it) watch this feed and email subscribers when something new appears.
import fs from "node:fs";
import vm from "node:vm";

const SITE = "https://planet-zorgon.pages.dev";
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync("content.js", "utf8") + "\n;this.__C = { SITE, MOVIES, GAMES, COMICS, MISERIES };", ctx);
const C = ctx.__C;

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
const slug = (t) => String(t ?? "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60).replace(/-$/, "") || "item";
const day = (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || "")); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 6)) : null; };
const LABEL = { movies: "Movie", games: "Game", comics: "Comic" };

const items = [];
(C.MISERIES || []).filter((m) => !m.sample).forEach((m) => items.push({
  title: `Daily Misery: ${m.title}`, link: `${SITE}/#miseries/${m.date}`, date: day(m.date),
  text: String(m.text || "").trim(),
}));
["movies", "games", "comics"].forEach((cat) => {
  const used = {};
  (C[cat.toUpperCase()] || []).forEach((it) => {
    let s = slug(it.title); if (used[s]) s += "-" + ++used[s]; else used[s] = 1;
    if (it.sample) return;
    items.push({
      title: `${LABEL[cat]} review: ${it.title}`, link: `${SITE}/review.html#${cat}--${s}`, date: day(it.date),
      text: [it.verdict, it.review].filter(Boolean).join("\n\n"),
    });
  });
});
items.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(C.SITE.name)}</title>
  <link>${SITE}/</link>
  <description>${esc(C.SITE.tagline)}</description>
  <language>en</language>
  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
${items.slice(0, 30).map((i) => `  <item>
    <title>${esc(i.title)}</title>
    <link>${esc(i.link)}</link>
    <guid isPermaLink="true">${esc(i.link)}</guid>
${i.date ? `    <pubDate>${i.date.toUTCString()}</pubDate>\n` : ""}    <description>${esc(i.text.length > 600 ? i.text.slice(0, 600) + "…" : i.text)}</description>
  </item>`).join("\n")}
</channel>
</rss>
`;
fs.writeFileSync("feed.xml", xml);
console.log(`feed.xml: ${items.length} item(s)`);
