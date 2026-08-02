/* ============================================================================
 * motion.js — GSAP choreography. Loaded by js/boot.js only on tiers that
 * earned it, and only after GSAP itself is on the page.
 *
 * Three guarantees keep content from ever being stranded invisible:
 *   1. CSS hides elements only under `html.js-motion`, which the head script
 *      sets and withdraws if this file never reports ready.
 *   2. Everything runs inside try/catch — a throw rolls back every inline
 *      style GSAP applied and re-shows the page.
 *   3. The splash clears itself via CSS animation, not JS.
 * ==========================================================================*/
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tier = root.dataset.tier || "full";
  var rich = tier === "full";                    // desktop-only garnish

  function killSplash(cb) {
    var pre = document.getElementById("preloader");
    if (!pre) return cb && cb();
    // No GSAP, or nobody watching: remove it outright. Animating it away in a
    // hidden tab would never complete — rAF is frozen — and it would still be
    // sitting there when the user switched back.
    if (!window.gsap || document.hidden) { pre.remove(); return cb && cb(); }
    window.gsap.to(pre, {
      opacity: 0, duration: 0.5, ease: "power2.inOut",
      onComplete: function () { pre.remove(); cb && cb(); }
    });
  }

  function recover(err) {
    if (window.console) console.warn("[motion] disabled after error:", err);
    try { window.gsap && window.gsap.globalTimeline.clear(); } catch (e) {}
    document.querySelectorAll("[style]").forEach(function (el) {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("clip-path");
      el.style.removeProperty("visibility");
    });
    root.classList.remove("js-motion");
    var pre = document.getElementById("preloader");
    if (pre) pre.remove();
    window.__motionReady = true;
  }

  if (!window.gsap || reduce) {
    root.classList.remove("js-motion");
    window.__motionReady = true;
    killSplash();
    return;
  }

  /* --------------------------------------------------------------------------
   * Background tabs freeze rAF, which freezes GSAP. If we built the timelines
   * now, every `.from()` would pin its element at opacity 0 with no ticker to
   * animate it — the user would switch to the tab and find a blank page.
   * So: show the page immediately, and wire the animation layer up only once
   * someone is actually looking at it.
   * ------------------------------------------------------------------------*/
  if (document.hidden) {
    root.classList.remove("js-motion");
    window.__motionReady = true;
    killSplash();
    document.addEventListener("visibilitychange", function onVis() {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onVis);
      build();                       // tweens animate from hidden → visible
    });
    return;
  }

  build();

  function build() {
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var started = false;

  try {
    gsap.registerPlugin(ST);
    if (window.ScrollToPlugin) gsap.registerPlugin(window.ScrollToPlugin);

    /* ================================================================ intro */
    // Gradient headings wipe in; splitting them per-character would break
    // background-clip:text, so the clip-path does the work instead.
    document.querySelectorAll(".hero__name").forEach(function (el) {
      el.classList.add("wipe");
    });

    var introTl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
    introTl
      .from(".hero__eyebrow", { y: 18, opacity: 0, duration: 0.7 }, 0)
      .to(".hero__name", {
        clipPath: "inset(0 0% 0 0)", duration: 1.25, ease: "expo.out"
      }, 0.1)
      .from(".hero__name", { y: 26, duration: 1.0, ease: "expo.out" }, 0.1)
      .from(".hero__role",  { y: 22, opacity: 0, duration: 0.7 }, 0.5)
      .from(".hero__loc",   { y: 18, opacity: 0, duration: 0.6 }, 0.62)
      .from(".hero__summary p", { y: 22, opacity: 0, duration: 0.7, stagger: 0.12 }, 0.7)
      .from(".hero__tagline", { x: -18, opacity: 0, duration: 0.6 }, 0.9)
      .from(".hero__links .btn", {
        y: 26, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.07, ease: "back.out(2)"
      }, 1.0)
      .from(".formations-wrap", { y: 16, opacity: 0, duration: 0.6 }, 1.2);

    function startIntro() {
      if (started) return;
      started = true;
      killSplash(function () { introTl.play(); });
    }
    if (document.readyState === "complete") startIntro();
    else addEventListener("load", startIntro);
    setTimeout(startIntro, 1800);

    /* ====================================================== section reveals */
    function reveal(selector, vars) {
      gsap.utils.toArray(selector).forEach(function (el) {
        el.dataset.animated = "1";
        gsap.fromTo(el, vars.from, Object.assign({}, vars.to, {
          scrollTrigger: { trigger: el, start: "top 86%", once: true }
        }));
      });
    }

    // headings: wipe the gradient in, then let it drift
    gsap.utils.toArray(".section__head").forEach(function (head) {
      head.dataset.animated = "1";
      var title = head.querySelector(".section__title");
      var tl = gsap.timeline({
        scrollTrigger: { trigger: head, start: "top 86%", once: true }
      });
      tl.fromTo(head, { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
      if (title) {
        title.classList.add("wipe");
        tl.to(title, { clipPath: "inset(0 0% 0 0)", duration: 1.0, ease: "expo.out" }, 0.12);
      }
      var kicker = head.querySelector(".section__kicker");
      if (kicker) tl.from(kicker, { x: -14, opacity: 0, duration: 0.5 }, 0);
    });

    reveal(".stats", {
      from: { y: 40, opacity: 0, scale: 0.97 },
      to:   { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
    });
    reveal(".edu-item", {
      from: { y: 26, opacity: 0 },
      to:   { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
    });
    reveal(".honor", {
      from: { x: -28, opacity: 0 },
      to:   { x: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
    });
    reveal(".lang", {
      from: { y: 18, opacity: 0 },
      to:   { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    });
    reveal(".stack", {
      from: { opacity: 0, scale: 0.93 },
      to:   { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
    });
    reveal(".contact .wrap", {
      from: { y: 44, opacity: 0 },
      to:   { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }
    });

    gsap.utils.toArray(".exp-card").forEach(function (card, i) {
      gsap.fromTo(card,
        { y: 54, opacity: 0, rotateY: rich ? 22 : 0, transformPerspective: 900 },
        { y: 0, opacity: 1, rotateY: 0, duration: 0.85, ease: "power3.out",
          delay: (i % 3) * 0.09,
          scrollTrigger: { trigger: card, start: "top 88%", once: true } });
    });

    gsap.utils.toArray(".proj").forEach(function (card, i) {
      gsap.fromTo(card,
        { y: 56, opacity: 0, scale: 0.95, rotateX: rich ? 10 : 0, transformPerspective: 1000 },
        { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.8, ease: "power3.out",
          delay: (i % 3) * 0.07,
          scrollTrigger: { trigger: card, start: "top 90%", once: true } });
    });

    gsap.utils.toArray(".job").forEach(function (job) {
      var trig = { trigger: job, start: "top 88%", once: true };
      gsap.fromTo(job, { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.75, ease: "power3.out", scrollTrigger: trig });
      var dot = job.querySelector(".job__dot");
      if (dot) {
        gsap.fromTo(dot, { scale: 0 },
          { scale: 1, duration: 0.5, ease: "back.out(3)", delay: 0.15, scrollTrigger: trig });
      }
    });

    gsap.utils.toArray(".stack-pill").forEach(function (pill, i) {
      gsap.fromTo(pill,
        { y: 14, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)",
          delay: Math.min(i * 0.018, 0.7),
          scrollTrigger: { trigger: ".stack", start: "top 84%", once: true } });
    });

    gsap.utils.toArray(".reveal").forEach(function (el) {
      if (el.dataset.animated) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true } });
    });

    /* ========================================================= timeline draw */
    var timeline = document.querySelector(".timeline");
    if (timeline) {
      var prog = document.createElement("span");
      prog.className = "timeline__progress";
      timeline.appendChild(prog);
      gsap.fromTo(prog, { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: timeline, start: "top 72%", end: "bottom 78%", scrub: 0.6 }
      });
    }

    /* ========================================================= hero parallax */
    gsap.to(".hero__grid", {
      y: 80, opacity: 0.12, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.5 }
    });

    /* ========================================================= stat counters */
    gsap.utils.toArray(".stat__v").forEach(function (el) {
      var raw = el.textContent.trim();
      var m = raw.match(/^(\d[\d,]*)(.*)$/);
      if (!m) return;
      var target = parseInt(m[1].replace(/,/g, ""), 10);
      var suffix = m[2] || "";
      var obj = { n: 0 };
      gsap.to(obj, {
        n: target, duration: 1.8, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: function () { el.textContent = Math.round(obj.n).toLocaleString() + suffix; },
        onComplete: function () { el.textContent = raw; }
      });
    });

    /* ====================================================== sliding nav pill */
    var pill = document.querySelector(".nav__pill");
    var links = gsap.utils.toArray(".nav__link");

    function movePill(to) {
      if (!pill || !to || getComputedStyle(pill).display === "none") return;
      pill.style.width = to.offsetWidth + "px";
      pill.style.transform = "translateX(" + to.offsetLeft + "px)";
      pill.style.opacity = "1";
    }
    function activePill() {
      movePill(document.querySelector(".nav__link.is-active"));
    }
    links.forEach(function (a) {
      a.addEventListener("pointerenter", function () { movePill(a); });
    });
    var navBar = document.querySelector(".nav__links");
    if (navBar) navBar.addEventListener("pointerleave", activePill);
    addEventListener("scroll", activePill, { passive: true });
    addEventListener("resize", activePill);
    setTimeout(activePill, 100);

    /* ======================================================= smooth anchors */
    if (window.ScrollToPlugin) {
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        var id = a.getAttribute("href");
        if (id.length < 2 || !document.querySelector(id)) return;
        a.addEventListener("click", function (e) {
          e.preventDefault();
          gsap.to(window, {
            duration: 1.05, ease: "power3.inOut",
            scrollTo: { y: id, offsetY: 70, autoKill: true }
          });
          history.replaceState(null, "", id);
        });
      });
    }

    /* ================================================ tilt + magnetic buttons */
    if (rich && matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll(".proj, .exp-card, .honor").forEach(function (card) {
        var raf = null;
        card.addEventListener("pointermove", function (e) {
          if (raf) return;
          raf = requestAnimationFrame(function () {
            raf = null;
            var r = card.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width;
            var py = (e.clientY - r.top) / r.height;
            card.style.setProperty("--rx", ((0.5 - py) * 9).toFixed(2) + "deg");
            card.style.setProperty("--ry", ((px - 0.5) * 11).toFixed(2) + "deg");
            card.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
            card.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
            card.classList.add("is-tilting");
          });
        });
        card.addEventListener("pointerleave", function () {
          card.classList.remove("is-tilting");
          card.style.setProperty("--rx", "0deg");
          card.style.setProperty("--ry", "0deg");
        });
      });

      document.querySelectorAll(".btn, .icon-btn").forEach(function (btn) {
        btn.addEventListener("pointermove", function (e) {
          var r = btn.getBoundingClientRect();
          gsap.to(btn, {
            x: (e.clientX - (r.left + r.width / 2)) * 0.28,
            y: (e.clientY - (r.top + r.height / 2)) * 0.34,
            duration: 0.4, ease: "power3.out"
          });
        });
        btn.addEventListener("pointerleave", function () {
          gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.4)" });
        });
      });
    }

    /* ============================================== filter re-stagger + flash */
    document.querySelectorAll(".filter").forEach(function (b) {
      b.addEventListener("click", function () {
        gsap.fromTo(".proj:not(.is-hidden)",
          { opacity: 0, y: 24, scale: 0.95, rotateX: rich ? 8 : 0 },
          { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.5,
            stagger: 0.035, ease: "power3.out",
            onComplete: function () { ST.refresh(); } });
        gsap.fromTo(b, { scale: 0.9 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
      });
    });

    /* ===================================== recolour chrome with the formation */
    // The particle field announces its palette; the accent follows it so the
    // whole page shifts mood with the visualisation.
    document.addEventListener("formationchange", function (e) {
      if (!rich) return;
      gsap.to(root, {
        duration: 1.2, ease: "power2.inOut",
        "--accent": e.detail.a,
        "--mint": e.detail.b
      });
    });

    addEventListener("load", function () { ST.refresh(); });
    window.__motionReady = true;
  } catch (err) {
    recover(err);
  }
  }
})();
