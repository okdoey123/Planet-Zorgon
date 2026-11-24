/* =====================================================================
   A SPECIAL SPACE FOR A SPECIAL SOMEONE — content file
   ---------------------------------------------------------------------
   Same rules as content.js:
   - Text goes between backticks `like this`.
   - Every { ... } block ends with a comma  },
   - Blank line = new paragraph.
   - Pictures go in the "images" folder.
   Delete  sample: true,  from anything you've written yourself.

   The password is NOT written here on purpose (the repo is public).
   To change it, ask Claude: "change my special page password to ___".
   ===================================================================== */

const SPECIAL = {
  title: `A special space for a special someone`,

  // Their name, or a nickname
  name: `Bubu`,

  // A photo of them, or of the two of you (tall pictures look best)
  photo: "",                       // e.g. "images/us.jpg"
  photoCaption: `My favourite person on any planet`,

  // A note to them. Write as much as you like.
  letter: `Hi you.

This little corner of Planet Zorgon is only for you. Nobody else gets the star and the password.

Below are movies and shows I think you'd love. Tick them off as you watch them, then come tell me what you thought.

(Sample text — replace this with your own words.)`,

  sign: `— Zorgon`,

  /* -------------------------------------------------------------------
     MOVIES & SHOWS THEY SHOULD WATCH
     type  = "movie" or "show"
     why   = why they'd love it (one or two lines)
     where = where to watch (optional), e.g. `Netflix`
     ------------------------------------------------------------------- */
  watchlist: [
    {
      sample: true,
      type: "movie",
      title: `Before Sunrise`,
      year: `1995`,
      image: "",
      why: `Two strangers, one night, endless talking. It reminded me of us.`,
      where: ``,
    },
    {
      sample: true,
      type: "movie",
      title: `About Time`,
      year: `2013`,
      image: "",
      why: `Bring tissues. Trust me on this one.`,
      where: ``,
    },
    {
      sample: true,
      type: "movie",
      title: `Paddington 2`,
      year: `2017`,
      image: "",
      why: `The kindest movie ever made. Watch it on a bad day.`,
      where: ``,
    },
    {
      sample: true,
      type: "show",
      title: `Fleabag`,
      year: `2016`,
      image: "",
      why: `Short, savage and secretly soft. Two seasons, gone in a weekend.`,
      where: ``,
    },
    {
      sample: true,
      type: "show",
      title: `Normal People`,
      year: `2020`,
      image: "",
      why: `For when you want to feel everything at once.`,
      where: ``,
    },
  ],
};
