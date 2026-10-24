# Portfolio

Minimal single-page portfolio for a data analyst / BI specialist. Plain HTML, CSS and JavaScript — no build step, no dependencies to install.

## Structure

```
my-portfolio/
├── index.html          # Semantic markup for the whole page
├── css/
│   ├── base.css        # Design tokens, reset, typography, a11y defaults
│   ├── layout.css      # Page scaffolding: header, sections, grids, footer, responsive
│   └── components.css  # Reusable pieces: buttons, cards, pills, forms, socials
├── js/
│   ├── bg-particles.js  # Canvas constellation background (no dependencies)
│   ├── nav.js          # Mobile menu + scroll-spy active link
│   ├── reveal.js       # Fade-in on scroll (respects prefers-reduced-motion)
│   ├── contact-form.js # Inline form validation
│   └── main.js         # Sticky header state + footer year
└── assets/
    └── favicon.svg
```

## Run

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
```

## Conventions

- CSS is ordered tokens → layout → components; stylesheets are loaded in that order.
- Design values (colors, spacing, radii, motion) live as custom properties in `css/base.css`.
- Each script is self-contained and exposes no globals; all initialise on `DOMContentLoaded`.
- Icons are inline SVG (no icon font, no emoji), decorative SVGs are `aria-hidden`.
- Background particles are drawn on a plain `<canvas id="bg-canvas">` — no CDN, no library, ~3KB of JS.

## Customize

| What | Where |
| --- | --- |
| Colors, spacing, fonts, motion | `:root` in `css/base.css` |
| Content copy, projects, certificates | `index.html` |
| Social/profile links | `index.html` (footer + contact section) |
| About text and focus strip | `index.html` (`#about` section) |
| Portrait image | `assets/profile.svg` — replace with `assets/profile.jpg` and update the `<img src>` |
| Particle density, colors, hover distance | `CONFIG` in `js/bg-particles.js` |
