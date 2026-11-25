/* =====================================================================
   PLANET ZORGON — YOUR CONTENT FILE
   ---------------------------------------------------------------------
   This is the ONLY file you need to edit to update your website.

   RULES THAT KEEP THINGS WORKING:
   1. Text goes between backticks `like this`. Apostrophes are fine inside.
   2. Every { ... } block ends with a comma  },  before the next one.
   3. Leave a blank line inside a review to start a new paragraph.
      Wrap words in double stars to make them bold: **like this**
   4. Pictures: put the file in the "images" folder, then write
      image: "images/your-file.jpg"
      No picture yet? Leave it as  image: ""  — a placeholder shows up.
   5. Delete the line  sample: true,  once you've written your own entry.
   6. Newest stuff goes at the TOP of each list.
   ===================================================================== */

const SITE = {
  name: `Planet Zorgon`,
  tagline: `Population: one. Reviews of shit I like, plus a daily log of my miseries, broadcast to whoever's listening.`,
};

/* ---------------------------------------------------------------------
   ABOUT ME
   --------------------------------------------------------------------- */
const ABOUT = {
  photo: "images/me.jpg",          // a portrait, face clearly visible
  heading: `About Me`,
  bio: `People love to form unnecessary opinions on things, but modern society does not let you let them out. This is a place for me to let it out, not you guys. You guys can see me let it out.

I realize this is the most 2010 thing I can do, and that is fine. **To catch up with time, you have to run behind it first** (this line is trademarked; for making it a T-shirt, contact me).

So sit back and enjoy Planet Zorgon in all its glory and infamy. And if, for God's sake, I keep this shit running for even a week, I will consider it a success.`,

  // The little "alien passport" card. Change the right-hand side of each line.
  passport: [
    ["Name",            `Leader of Zorgon`],
    ["Species",         `Human (allegedly)`],
    ["Inhabitant since",`2026`],
    ["Runs on",         `Daily affirmations by Salman Khan`],
    ["Weakness",        `Shirtless Amitabh`],
  ],

  // Extra photos of you (up to 3 look best). Leave the list empty [] for none.
  morePhotos: [
    { image: "", caption: `Me, on a good day` },
    { image: "", caption: `Me, on a normal day` },
    { image: "", caption: `Evidence` },
  ],
};

/* ---------------------------------------------------------------------
   SHIT I LIKE — MOVIES
   score = 1 to 5 (how many planets it gets)
   Each item gets its own review page automatically.
   Add  date: "YYYY-MM-DD",  (the day you post it) so email subscribers get it in order.
   Optional: add  credits: [["Director", `Name`]],  for extra facts.
   --------------------------------------------------------------------- */
const MOVIES = [
  {
    sample: true,
    title: `Mad Max: Fury Road`,
    year: `2015`,
    image: "",                     // a poster works best (tall picture)
    score: 5,
    verdict: `Two hours of screaming in the best possible way.`,
    review: `This is a sample review. Write what you actually felt, not what a critic would say.

What stuck with you after the credits? Which scene would you show a friend first? Who should skip it?

A good review here is three short paragraphs. Nobody's grading you.`,
  },
  {
    sample: true,
    title: `Spirited Away`,
    year: `2001`,
    image: "",
    score: 4,
    verdict: `Comfort food that is also slightly terrifying.`,
    review: `Another sample review. Swap in your own movie, year, picture and score.

Tip: start with the one sentence you'd text a friend about it. That's your verdict line.`,
  },
];

/* ---------------------------------------------------------------------
   SHIT I LIKE — GAMES
   --------------------------------------------------------------------- */
const GAMES = [
  {
    sample: true,
    title: `Hollow Knight`,
    year: `2017`,
    image: "",                     // a screenshot or cover art
    score: 5,
    verdict: `I died 400 times and said thank you every time.`,
    review: `Sample game review. How many hours did it eat? What was the moment you got hooked?

Was it worth the money (or the sleep)?`,
  },
  {
    sample: true,
    title: `Red Dead Redemption 2`,
    year: `2018`,
    image: "",
    score: 4,
    verdict: `A cowboy simulator that made me feel things about a horse.`,
    review: `Sample game review. Replace me.`,
  },
];

/* ---------------------------------------------------------------------
   SHIT I LIKE — COMICS
   --------------------------------------------------------------------- */
const COMICS = [
  {
    title: `Batman: Arkham Asylum — A Serious House on Serious Earth`,
    year: `1989`,
    date: "2026-11-25",                  // the day you posted it (YYYY-MM-DD), used for email updates
    image: "images/arkham-asylum.jpg",   // save the cover with exactly this name in the images folder
    score: 4,
    verdict: `Loved it when Joker said "Why so serious" and made out with Batman`,
    // Optional extra facts shown on the review page. Delete any line you don't want.
    credits: [
      ["Writer",    `Grant Morrison`],
      ["Artist",    `Dave McKean`],
      ["Publisher", `DC Comics`],
    ],
    review: `It is good for now.`,
  },
];

/* ---------------------------------------------------------------------
   DAILY MISERIES
   date   = "YYYY-MM-DD"  (year-month-day, e.g. "2026-11-25")
   misery = 1 to 5  (1 = mildly cursed ... 5 = total eclipse)
   Copy the whole { ... }, block, paste it at the TOP, and edit it.
   --------------------------------------------------------------------- */
const MISERIES = [
  {
    date: "2026-11-25",
    title: `Day 1: What a fuckall start`,
    misery: 4,
    image: "",
    text: `I made this website at 2:30 am and at 8:37 my fucking sink fell.

Are these events correlated? Abso-fucking-lutely yes. This is a sign from God.

Or maybe the sign is that I should brush my teeth regularly.`,
  },
];
