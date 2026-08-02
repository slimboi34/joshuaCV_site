# joshuaCV_site

Personal CV / portfolio site for **Joshua Harty** — Software Engineer & Agentic Systems Engineer.

No build step, no bundler, no CDN. Plain HTML/CSS/JS with Three.js and GSAP vendored locally.

```
index.html            page shell, icon sprite, pre-paint theme/motion script
css/styles.css        themes, layout, 3D tilt, print stylesheet
js/data.js            ← ALL CONTENT LIVES HERE
js/main.js            renders the page from data.js
js/boot.js            capability + bandwidth gate — decides what gets loaded
js/hero3d.js          WebGL hero — 120k morphing particles (module)
js/hero-lite.js       3 KB canvas-2D hero for low-bandwidth clients (module)
js/constellation.js   3D rotating tech sphere (module)
js/viz.js             live Monte Carlo aggregate-loss simulation
js/motion.js          GSAP scroll choreography, tilt, counters
vendor/               three.js + gsap builds (committed on purpose)
```

## Run locally

```bash
npm install
npm run dev          # http://localhost:4173
```

Or just open `index.html` — everything except the ES-module WebGL scenes works
straight off the filesystem.

## The 3D bits

**Hero particle field** (`js/hero3d.js`) — up to 120,000 GPU particles driven by
curl-of-simplex-noise flow in the vertex shader, morphing between eight
formations. Each carries its own palette, turbulence and spin:

| Formation | What it is |
|---|---|
| Globe | Fibonacci sphere baseline |
| Monte Carlo | particles fill a lognormal severity density — the distribution RiskPY simulates |
| Agent Mesh | orchestrator hub + 9 agent clusters joined by edges |
| Pipeline | double helix data stream |
| Galaxy | four-arm barred spiral with a bulge |
| Torus Knot | (3,7) knot swept into a tube |
| Wave Field | radial interference grid |
| Lattice | cubic crystal lattice |

Auto-cycles every 5.2s until you click a formation, then it's yours. The cursor
repels *and* swirls particles in view space; clicking the hero fires a vortex.
Formation changes broadcast their palette, and the page accent follows.

**Adaptive quality** — the draw range is trimmed live if the frame budget slips,
so the field degrades in density rather than stuttering.

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

## Bandwidth tiers

Nothing heavy is in the initial payload. `js/boot.js` measures the device and
the connection, then fetches only what that tier earns:

| Tier | Trigger | Extra payload (gzipped) | Hero |
|---|---|---|---|
| `full` | desktop, ≥4 GB RAM | ~150 KB | 120k WebGL particles + tag sphere |
| `mobile` | phone, ≥4 GB, ≥4 cores, downlink ≥4 Mbps | ~240 KB | 26k WebGL particles |
| `lite` | 3G, low-memory phone, or no WebGL | ~50 KB | canvas-2D constellation |
| `static` | Save-Data, 2G, or `prefers-reduced-motion` | **0 KB** | CSS only |

The critical path is ~19 KB gzipped (HTML + CSS + content + gate) on every tier.
three.js is ~190 KB gzipped, so it is only spent when the device can render it
*and* the link can carry it — and even then it is fetched on
`requestIdleCallback`, never competing with first paint. Save-Data is absolute:
if the user asked their browser to save bytes, we send none beyond the base page.

The tag sphere is a second WebGL context, so it is desktop-only; phones get a
readable weighted tag grid, which is the better mobile design regardless.

## Mobile

Laid out mobile-first from 320px up. The nav and the formation switcher become
horizontally scrollable rails rather than wrapping or disappearing, touch
targets are ≥38px, tilt and magnetic buttons are pointer-only, and there is a
landscape-phone breakpoint so the hero doesn't eat the screen.

## Graceful degradation

The animation layer can never strand the page. Three independent guarantees:

1. CSS hides elements only under `html.js-motion`, a class the inline head
   script sets and **withdraws** if `motion.js` never reports ready.
2. `motion.js` runs inside `try/catch`; a throw rolls back every inline style
   GSAP applied and re-shows the page.
3. The splash clears itself via CSS animation, not JS — and is never shown at
   all if the tab loads in the background (where rAF is frozen).

Tabs that load in the background skip the animation layer entirely and render
static, wiring it up on `visibilitychange` instead. Building timelines while rAF
is frozen would pin every element at opacity 0 with no ticker to animate it.

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
