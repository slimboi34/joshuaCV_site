/* ============================================================================
 * viz.js — a real Monte Carlo aggregate-loss simulation, streaming live inside
 * the RiskPY card. Frequency ~ Poisson(λ), severity ~ Lognormal(μ, σ); the
 * histogram is the aggregate annual loss distribution, with VaR/TVaR read off
 * it as samples accumulate. Same model RiskPY runs natively in C++.
 * ==========================================================================*/
(function () {
  "use strict";

  var canvas = document.getElementById("mc-canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var readout = document.getElementById("mc-readout");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------- the model */
  var LAMBDA = 6;          // expected claims per year
  var MU = 11.0;           // lognormal severity, log-scale mean
  var SIGMA = 1.0;
  var BINS = 64;
  var XMAX = 2.4e6;

  var counts = new Uint32Array(BINS);
  var samples = [];        // kept for the quantile estimates
  var total = 0, sum = 0, peak = 1;

  var spare = null;
  function gauss() {                              // Box–Muller, cached pair
    if (spare !== null) { var s = spare; spare = null; return s; }
    var u, v, r;
    do { u = Math.random() * 2 - 1; v = Math.random() * 2 - 1; r = u * u + v * v; }
    while (r === 0 || r >= 1);
    var f = Math.sqrt(-2 * Math.log(r) / r);
    spare = v * f;
    return u * f;
  }
  function lognormal() { return Math.exp(MU + SIGMA * gauss()); }
  function poisson(l) {                           // Knuth — fine for small λ
    var L = Math.exp(-l), k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  }

  function drawSample() {
    var n = poisson(LAMBDA), agg = 0;
    for (var i = 0; i < n; i++) agg += lognormal();
    total++;
    sum += agg;
    var bin = Math.min(BINS - 1, Math.floor((agg / XMAX) * BINS));
    counts[bin]++;
    if (counts[bin] > peak) peak = counts[bin];
    if (samples.length < 60000) samples.push(agg);
    return agg;
  }

  function quantile(sorted, q) {
    if (!sorted.length) return 0;
    return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  }

  var cachedSorted = [], cacheAt = -1;
  function stats() {
    if (total - cacheAt > 250) {                  // re-sort sparingly
      cachedSorted = samples.slice().sort(function (a, b) { return a - b; });
      cacheAt = total;
    }
    var s = cachedSorted;
    var var95 = quantile(s, 0.95);
    var tail = s.slice(Math.floor(0.95 * s.length));
    var tvar = tail.length
      ? tail.reduce(function (a, b) { return a + b; }, 0) / tail.length
      : 0;
    return { mean: total ? sum / total : 0, var95: var95, tvar: tvar };
  }

  function money(v) {
    if (v >= 1e6) return "£" + (v / 1e6).toFixed(2) + "m";
    if (v >= 1e3) return "£" + Math.round(v / 1e3) + "k";
    return "£" + Math.round(v);
  }

  /* -------------------------------------------------------------- painting */
  var dpr = Math.min(devicePixelRatio || 1, 2);
  function resize() {
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener("resize", resize);

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function paint() {
    var r = canvas.getBoundingClientRect();
    var W = r.width, H = r.height;
    if (!W || !H) return;

    ctx.clearRect(0, 0, W, H);

    var padB = 18, padT = 6;
    var plotH = H - padB - padT;
    var bw = W / BINS;
    var accent = css("--accent") || "#ffa63d";
    var mint = css("--mint") || "#6ee7d3";

    // baseline
    ctx.strokeStyle = css("--border") || "#242931";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H - padB + 0.5);
    ctx.lineTo(W, H - padB + 0.5);
    ctx.stroke();

    // bars
    var grad = ctx.createLinearGradient(0, padT, 0, H - padB);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, mint);
    ctx.fillStyle = grad;
    for (var i = 0; i < BINS; i++) {
      if (!counts[i]) continue;
      var bh = (counts[i] / peak) * plotH;
      ctx.globalAlpha = 0.35 + 0.65 * (counts[i] / peak);
      ctx.fillRect(i * bw + 0.6, H - padB - bh, Math.max(1, bw - 1.2), bh);
    }
    ctx.globalAlpha = 1;

    var st = stats();

    // VaR 95 marker
    var vx = (st.var95 / XMAX) * W;
    if (vx > 0 && vx < W) {
      ctx.strokeStyle = accent;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(vx, padT);
      ctx.lineTo(vx, H - padB);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = accent;
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = vx > W - 60 ? "right" : "left";
      ctx.fillText("VaR₉₅", vx + (vx > W - 60 ? -4 : 4), padT + 9);
    }

    // x axis ticks
    ctx.fillStyle = css("--text-faint") || "#6b7482";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("£0", 1, H - 5);
    ctx.textAlign = "right";
    ctx.fillText(money(XMAX), W - 1, H - 5);

    if (readout) {
      readout.innerHTML =
        '<span><b>' + total.toLocaleString() + '</b> sims</span>' +
        '<span>mean <b>' + money(st.mean) + '</b></span>' +
        '<span>VaR₉₅ <b>' + money(st.var95) + '</b></span>' +
        '<span>TVaR₉₅ <b>' + money(st.tvar) + '</b></span>';
    }
  }

  /* ------------------------------------------------------------------ loop */
  var running = false;
  new IntersectionObserver(function (e) { running = e[0].isIntersecting; }, { threshold: 0 })
    .observe(canvas);

  if (reduce) {                                   // no animation: one static result
    for (var i = 0; i < 20000; i++) drawSample();
    paint();
    return;
  }

  (function tick() {
    requestAnimationFrame(tick);
    if (!running || document.hidden) return;
    if (total < 250000) for (var i = 0; i < 90; i++) drawSample();
    paint();
  })();
})();
