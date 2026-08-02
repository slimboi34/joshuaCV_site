/* ============================================================================
 * hero-lite.js — the low-bandwidth hero.
 *
 * ~2 KB, no dependencies, canvas 2D. Stands in for the WebGL field on slow
 * connections, low-memory phones and no-WebGL browsers: a drifting constellation
 * with links drawn between near neighbours. Cheap enough to run anywhere.
 * ==========================================================================*/

export function initLiteHero() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0, pts = [];

  const COUNT = () => Math.min(90, Math.round((innerWidth * innerHeight) / 16000));
  const LINK = 132;

  function resize() {
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const n = COUNT();
    pts = [];
    for (let i = 0; i < n; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 0.7 + Math.random() * 1.7
      });
    }
  }
  resize();
  addEventListener("resize", resize);

  const mouse = { x: -9999, y: -9999 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; },
    { passive: true });
  addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

  function css(v) {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  }

  let visible = true;
  const hero = document.querySelector(".hero");
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 })
      .observe(hero);
  }

  (function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;

    ctx.clearRect(0, 0, W, H);
    const accent = css("--accent") || "#ffa63d";
    const mint = css("--mint") || "#6ee7d3";
    const fade = Math.max(0, 1 - scrollY / (innerHeight * 0.9));
    if (fade <= 0) return;

    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // gentle drift away from the cursor
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 16000 && d2 > 0.01) {
        const f = (1 - d2 / 16000) * 0.9;
        const d = Math.sqrt(d2);
        p.x += (dx / d) * f; p.y += (dy / d) * f;
      }
    }

    // links
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.hypot(dx, dy);
        if (d > LINK) continue;
        ctx.globalAlpha = (1 - d / LINK) * 0.2 * fade;
        ctx.strokeStyle = accent;
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.stroke();
      }
    }

    // nodes
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      ctx.globalAlpha = 0.75 * fade;
      ctx.fillStyle = i % 4 === 0 ? mint : accent;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  })();

  document.documentElement.classList.add("lite-hero-on");
}
