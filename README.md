# Planet Zorgon: how to run your website

You don't need to know how to code. You'll only ever touch **two things**:

- `content.js`: all your words (About Me, reviews, Daily Miseries)
- `images/`: all your pictures

Leave `index.html`, `review.html`, `styles.css`, `app.js`, `shared.js`, `review.js` and `fonts/` alone.

---

## 1. Look at it on your computer

Unzip the folder and double-click `index.html`. It opens in your browser.
After you edit `content.js`, save it and refresh the browser page.

**To edit `content.js`:** open it with any plain text editor. Notepad works.
**VS Code** (free, code.visualstudio.com) is nicer: it colours the text, so mistakes are easy to spot.
Don't use Word.

---

## 2. Put it on the internet for free (GitHub Pages)

1. Make a free account at **github.com**.
2. Click **+** (top right) → **New repository**. Name it `yourusername.github.io`
   (use your real GitHub username). Set it to **Public**. Click **Create repository**.
3. On the next page, click **uploading an existing file**. Drag in **everything inside** the
   planet-zorgon folder (index.html, styles.css, app.js, content.js, README.md, and the
   `fonts` and `images` folders). Click **Commit changes**.
4. Go to **Settings → Pages**. Under "Build and deployment", pick **Deploy from a branch**,
   choose branch **main** and folder **/(root)**, then click **Save**.
5. Wait a minute or two. Your site is now live at `https://yourusername.github.io` for anyone to see.

**Posting from now on (works from your phone too):** open your repository on github.com, click
`content.js`, click the ✏️ pencil icon, make your edit, then click **Commit changes**.
The site updates about a minute later.

**Adding a picture:** open the `images` folder on github.com → **Add file → Upload files**.
Then type its name into `content.js`, like `image: "images/dune.jpg"`.

*Another option:* **Netlify** (netlify.com, free) lets you drag the whole folder onto their site
to publish it. GitHub is better for daily posting because you can edit straight in the browser.

---

## 3. Writing a new Daily Misery

Copy this, paste it **right under** `const MISERIES = [`, and change the words:

```js
  {
    date: "2026-11-26",
    title: `Your title here`,
    misery: 3,
    image: "",
    text: `What happened today.

A blank line starts a new paragraph.`,
  },
```

`misery` goes from 1 to 5: 1 Mildly cursed · 2 Meh · 3 Grim · 4 Doomed · 5 Total eclipse.

## 4. Adding a movie, game or comic

Paste this under `const MOVIES = [` (or `GAMES` or `COMICS`):

```js
  {
    title: `Dune: Part Two`,
    year: `2024`,
    image: "images/dune.jpg",
    score: 4,
    verdict: `One sentence you'd text a friend.`,
    review: `Your full review.

As many paragraphs as you like.`,
  },
```

Every movie, game and comic automatically gets **its own review page** (`review.html`),
with its own planet: comics get the Comics Planet, movies the Movie Planet, games the Game Planet.
Your `verdict` line shows up as a big speech bubble at the top. You don't create pages by hand,
you just add the block to `content.js` and the page exists.

Optional: add credits to show extra facts on the review page:

```js
    credits: [
      ["Director", `Name`],
      ["Studio",   `Name`],
    ],
```

The first item in each list gets the big featured spot, so put your favourite (or newest) at the top.

## 5. If the site suddenly looks empty

You've almost certainly hit one of these:
- a missing comma after `}` (every block must end with `},`)
- a missing backtick `` ` `` at the end of some text
- a `"` where a `` ` `` should be

The site shows a yellow warning box when this happens. Undo your last edit and try again.
On GitHub, the **History** button on `content.js` shows every older version.

---

## Getting pictures to look good

The site prints every picture in one ink colour, like a risograph zine. Hover over a picture
(or open a review) to see its real colours. That's why nearly any photo will fit in. A few tips:

- **Photos of you:** bright light, plain background, your face filling most of the frame.
  The ink effect loves strong light and dark areas. Dim, blurry photos turn into mush.
  The passport photo is a tall portrait (3:4). The three "evidence" photos are square.
- **Movie posters & comic covers:** tall pictures. **Game pictures:** wide screenshots.
  Grab official ones from the game's Steam page, the publisher's site, or a screenshot you took yourself.
- **Keep files small:** under about 500 KB each, so the site loads fast on phones.
  **squoosh.app** (free, works in the browser) shrinks them. Save as `.jpg`, about 1200 px on the long side.
- **File names:** lowercase, no spaces: `hollow-knight.jpg` ✅, `Hollow Knight FINAL (2).JPG` ❌.
  On GitHub, capital letters matter: `Me.jpg` and `me.jpg` count as different files.
- **No picture yet?** Leave `image: ""`. A designed placeholder shows instead, so the site
  never looks broken.

## Writing tips

- **Verdict lines sell the review.** Make them short and specific, and make them sound like you.
- A Daily Misery can be a single line. Posting often beats posting perfect.
- When you're done with the samples, delete every `sample: true,` line, or swap in your own
  entries. Those lines are what make the "Sample — replace me" stickers appear.

## Changing the look (optional)

At the top of `styles.css` there's a list of colours (`--pink`, `--blue`, `--yellow`).
Change those hex codes and the whole site updates. Keep three colours that are clearly
different from each other.

---

## The secret page: "A special space for a special someone"

- **How to get in:** scroll to the very bottom of the home page. There are three twinkling stars
  above "End of transmission." Only the **right** star (the one on the right) works.
  The other two just wiggle. Then type the password.
- **What to edit:** `special-content.js`: their name, a photo, your note, and the
  movies & shows they should watch. Visitors can tick off what they've watched (it's remembered on their device).
- **Changing the password:** the password isn't written anywhere in the files (only a scrambled
  fingerprint of it is). Ask Claude to change it.
- **Honest warning:** this is a cute lock, not a bank vault. The site has no server, so someone
  who knows how to read website code (or looks in your public GitHub repo) could still read the
  words in `special-content.js`. Don't put anything truly private there.
