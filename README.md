# joshuaCV_site

Personal CV / portfolio site for **Joshua Harty** — Software Engineer & Agentic Systems Engineer.

No build step, no bundler, no CDN. Plain HTML/CSS/JS with Three.js and GSAP vendored locally.

```
index.html            page shell, icon sprite, pre-paint theme/motion script
css/styles.css        themes, layout, 3D tilt, print stylesheet
js/data.js            ← ALL CONTENT LIVES HERE
js/main.js            renders the page from data.js
js/hero3d.js          WebGL hero — 42k morphing particles (module)
js/constellation.js   3D rotating tech sphere (module)
js/viz.js             live Monte Carlo aggregate-loss simulation
js/motion.js          GSAP scroll choreography, tilt, counters
vendor/               three.js + gsap builds (committed on purpose)
assets/               drop portrait.jpg here for a profile photo
```

## Run locally

```bash
npm install
npm run dev          # http://localhost:4173
```

Or just open `index.html` — everything except the ES-module WebGL scenes works
straight off the filesystem.

## The 3D bits

**Hero particle field** (`js/hero3d.js`) — 42,000 GPU particles in a custom
shader, morphing between four formations that each mean something:

| Formation | What it is |
|---|---|
| Globe | Fibonacci sphere baseline |
| Monte Carlo | particles fill a lognormal severity density — the distribution RiskPY simulates |
| Agent Mesh | orchestrator hub + 8 agent clusters joined by edges |
| Pipeline | double helix data stream |

Auto-cycles every 6s until you click a formation button, then it's yours.
The cursor pushes particles aside in view space.

**Tech constellation** (`js/constellation.js`) — drag to spin; labels fade by
depth so it reads as a sphere. Repaints its label textures when the theme flips.

**Live Monte Carlo** (`js/viz.js`) — a real simulation, not a decoration.
Frequency ~ Poisson(λ=6), severity ~ Lognormal(μ=11, σ=1); the histogram is the
aggregate annual loss distribution with VaR₉₅ and TVaR₉₅ read off it live.
Converges to E[Agg] = 6·exp(11.5) ≈ £592k, which is what it prints.

## Editing content

Everything is in `js/data.js`. No HTML edits required.

```js
{
  name: "Project Name",
  repo: "actual-repo-name",     // optional, shown under the title
  featured: true,               // 2×2 tile — only for content that fills it
  wide: true,                   // 2×1 tile
  private: true,                // true → "Private" badge, no link
  tags: ["Agentic"],            // drives the filter buttons
  tech: ["Python", "C++"],
  blurb: "One or two sentences.",
  highlights: ["bullet", "bullet"],
  install: "pip install thing",
  viz: "montecarlo",            // renders the live simulation panel
  links: [{ label: "GitHub", href: "https://..." }]
}
```

**Profile photo:** save a square image to `assets/portrait.jpg`. If it's absent
the site falls back to a "JH" monogram — nothing breaks.

## Graceful degradation

The animation layer can never strand the page. Three independent guarantees:

1. CSS hides elements only under `html.js-motion`, a class the inline head
   script sets and **withdraws** if `motion.js` never reports ready.
2. `motion.js` runs inside `try/catch`; a throw rolls back every inline style
   GSAP applied and re-shows the page.
3. The splash clears itself via CSS animation, not JS — and is never shown at
   all if the tab loads in the background (where rAF is frozen).

No WebGL, or `prefers-reduced-motion`? The canvases bow out and the CSS
background stands in. Reduced motion also drops the particle count and renders
the Monte Carlo result statically.

## Print / PDF

The print button (or `Cmd+P`) renders a clean, ink-friendly CV: canvases and
controls hidden, filters expanded, URLs printed inline, all tweens forced visible.

## Deploy

Running on Railway via `npm start` (`serve` on `$PORT`). Also works as-is on
GitHub Pages, Netlify, Vercel or Cloudflare Pages — no build command, publish
directory is the repo root.

## Notes

- Descriptions for private repositories were inferred from repo names and
  languages. Worth correcting in `js/data.js`.
- Excluded from the listing by default: `dating_hook_up_site`,
  `my_CV_tool_just_for_josh`, `PolyMarket_trading_tool_tbd-`.
