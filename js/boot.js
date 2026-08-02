/* ============================================================================
 * boot.js — capability + bandwidth gate.
 *
 * Nothing heavy is in the initial payload. This module measures the device and
 * the connection, picks a tier, and only then fetches what that tier earns.
 *
 *   full    ~330 KB extra   desktop, fast link      three.js + all GSAP plugins
 *   mobile  ~250 KB extra   phone on wifi/4g        three.js + GSAP core/ScrollTrigger
 *   lite     ~50 KB extra   small screen / 3G       GSAP core only, canvas-2D hero
 *   static        0 KB      save-data / 2G / RM     CSS only
 *
 * Save-Data is honoured absolutely: if the user asked their browser to save
 * bytes, we send none beyond the base page.
 * ==========================================================================*/

const nav = navigator;
const conn = nav.connection || nav.mozConnection || nav.webkitConnection || null;

const saveData = !!(conn && conn.saveData);
const effType  = (conn && conn.effectiveType) || "4g";
const downlink = conn && typeof conn.downlink === "number" ? conn.downlink : 10;
const verySlow = /^(slow-2g|2g)$/.test(effType);
const slow     = /^(slow-2g|2g|3g)$/.test(effType);
const mem      = nav.deviceMemory || 4;
const cores    = nav.hardwareConcurrency || 4;
const reduce   = matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse   = matchMedia("(pointer: coarse)").matches;
const narrow   = innerWidth < 760;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) { return false; }
}

let tier;
if (reduce || saveData || verySlow || !hasWebGL()) {
  tier = reduce || saveData || verySlow ? "static" : "lite";
} else if (slow) {
  tier = "lite";
} else if (narrow || coarse) {
  // three.js is ~190 KB gzipped. That is a real cost on a phone, so it is only
  // spent when the device can render it AND the link can carry it quickly.
  // Everything else gets the 3 KB canvas hero, which still animates.
  const capable = mem >= 4 && cores >= 4;
  const fastLink = downlink >= 4;
  tier = capable && fastLink ? "mobile" : "lite";
} else {
  tier = mem >= 4 ? "full" : "mobile";
}

document.documentElement.dataset.tier = tier;

/* ------------------------------------------------------------------ loader */
function script(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;                       // preserve execution order
    s.onload = resolve;
    s.onerror = () => reject(new Error("failed to load " + src));
    document.head.appendChild(s);
  });
}

// Particle budget per tier — the single biggest lever on GPU cost.
const PARTICLES = { full: 120000, mobile: 26000, lite: 0, static: 0 };

async function start() {
  if (tier === "static") {
    document.documentElement.classList.remove("js-motion");
    window.__motionReady = true;
    const pre = document.getElementById("preloader");
    if (pre) pre.remove();
    return;
  }

  /* -- animation layer ---------------------------------------------------- */
  try {
    await script("vendor/gsap.min.js");
    await script("vendor/ScrollTrigger.min.js");
    // Smooth anchor scrolling is desktop-only garnish.
    if (tier === "full") await script("vendor/ScrollToPlugin.min.js");
    await script("js/motion.js");
  } catch (e) {
    // No GSAP: the head script's failsafe drops `js-motion` and the page
    // renders static. Nothing further to do.
    document.documentElement.classList.remove("js-motion");
    window.__motionReady = true;
  }

  /* -- the live Monte Carlo panel (tiny, always worth it) ----------------- */
  script("js/viz.js").catch(() => {});

  /* -- WebGL scenes -------------------------------------------------------- */
  if (tier === "lite") {
    import("./hero-lite.js").then((m) => m.initLiteHero()).catch(() => {});
    return;
  }

  // Hold the three.js fetch until the browser is idle, so it never competes
  // with rendering the text people actually came to read.
  idle(async () => {
    try {
      const { initHero } = await import("./hero3d.js");
      initHero({ count: PARTICLES[tier], compact: tier === "mobile" });
    } catch (e) {
      import("./hero-lite.js").then((m) => m.initLiteHero()).catch(() => {});
      return;
    }
    // A second WebGL context is desktop-only. Phones get the readable tag grid,
    // which is the better mobile design regardless of bandwidth.
    if (tier === "full") {
      import("./constellation.js").then((m) => m.initConstellation()).catch(() => {});
    }
  });
}

function idle(fn) {
  if ("requestIdleCallback" in window) requestIdleCallback(fn, { timeout: 2200 });
  else setTimeout(fn, 220);
}

start();
