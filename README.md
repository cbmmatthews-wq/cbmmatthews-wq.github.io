# cbmatthe — Course Notes Site

A static HTML site for class notes. Built to be hosted on GitHub Pages.

## Structure

```
site/
├── index.html              ← homepage
├── intro.html              ← (to be built)
├── unit-1-imc.html         ← (to be built)
├── assets/
│   ├── styles.css          ← shared design system — every page links this
│   ├── nav.js              ← top nav, defined once
│   └── scrollspy.js        ← sticky secondary nav + progress bar
└── README.md
```

## The "lock-in" approach

Every page does just three things to inherit the design and nav:

1. `<link rel="stylesheet" href="assets/styles.css">` in the `<head>`
2. `<div id="topnav"></div>` near the top of the `<body>`
3. `<script src="assets/nav.js"></script>` near the bottom of the `<body>`

For unit pages, also include a `<div class="subnav">…</div>` with section anchors, and add `<script src="assets/scrollspy.js"></script>` to drive the sticky-nav-with-progress-bar behavior.

Edit `styles.css` once → every page updates. Edit `nav.js` once → the menu updates everywhere.

## To add a new note page

1. Copy an existing unit page (e.g. `unit-1-imc.html`) to a new filename.
2. Replace the content inside `<main>`.
3. Open `assets/nav.js` and add one line to the `M544 Notes` dropdown:
   ```js
   { label: 'Unit 2 — Branding', href: 'unit-2-branding.html' }
   ```
4. Commit and push. The new page shows up in the menu on every page automatically.

## Deploying to GitHub Pages

The cleanest setup for your situation is a **user site** (one repo, clean URL).

1. Create a new GitHub repo named exactly: `cbmmatthews-wq.github.io`
2. Clone it locally, or upload these files via the GitHub web UI.
3. Put the contents of this `site/` folder in the **root** of that repo (not inside a subfolder).
4. Go to repo Settings → Pages → set Source to "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
5. Wait ~1 minute. Your site is live at: **https://cbmmatthews-wq.github.io/**

After it's live, the pages will be at:
- Homepage: `https://cbmmatthews-wq.github.io/`
- Intro: `https://cbmmatthews-wq.github.io/intro.html`
- Unit 1: `https://cbmmatthews-wq.github.io/unit-1-imc.html`

## Design tokens (in `styles.css`)

If you want to adjust the look:

```css
:root {
  --ink: #1c1917;        /* near-black for text and headings */
  --paper: #f5f0e8;      /* main background — warm cream */
  --cream: #ede8e0;      /* secondary cream for accents */
  --cream-deep: #e0d9cc; /* ghost numbers and deeper accents */
  --rust: #c8401e;       /* the orange accent */
  --muted: #7a7068;      /* secondary text and metadata */
  --rule: #d6cfc4;       /* horizontal dividers */
}
```

Change one of those values → it propagates across every page on the site.
