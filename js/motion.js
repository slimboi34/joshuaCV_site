/* ============================================================================
 * motion.js — GSAP scroll choreography, 3D card tilt, magnetic buttons and
 * stat counters.
 *
 * Everything here is enhancement. Three independent guarantees keep content
 * from ever being stranded invisible:
 *   1. CSS hides elements only under `html.js-motion`, which the head script
 *      sets and withdraws if this file never reports ready.
 *   2. The whole setup runs inside try/catch — a throw mid-file rolls back
 *      every inline style GSAP applied and re-shows the page.
 *   3. The splash screen clears itself via CSS animation, not JS.
 * ==========================================================================*/
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------------------------------------------- helpers */
  function killSplash(cb) {
    var pre = document.getElementById("preloader");
    if (!pre) return cb && cb();
    if (!window.gsap) { pre.remove(); return cb && cb(); }
    window.gsap.to(pre, {
      opacity: 0, duration: 0.55, ease: "power2.inOut",
      onComplete: function () { pre.remove(); cb && cb(); }
    });
  }

  // Last line of defence: undo everything and hand the user a static page.
  function recover(err) {
    if (window.console) console.warn("[motion] disabled after error:", err);
    try { window.gsap && window.gsap.globalTimeline.clear(); } catch (e) {}
    document.querySelectorAll("[style]").forEach(function (el) {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
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

  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var started = false;

  function startIntro(tl) {
    return function () {
      if (started) return;
      started = true;
      killSplash(function () { tl.play(); });
    };
  }

  try {
    gsap.registerPlugin(ST, window.SplitText);

    /* ------------------------------------------------------------- intro */
    var introTl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

    var nameEl = document.getElementById("hero-name");
    var chars = null;
    if (nameEl && window.SplitText) {
      try { chars = new window.SplitText(nameEl, { type: "chars" }).chars; }
      catch (e) { chars = null; }
    }

    if (chars && chars.length) {
      gsap.set(chars, { yPercent: 118, opacity: 0, rotateX: -78 });
      introTl.to(chars, {
        yPercent: 0, opacity: 1, rotateX: 0,
        duration: 1.05, stagger: 0.035, ease: "back.out(1.6)"
      }, 0);
    } else if (nameEl) {
      introTl.from(nameEl, { y: 40, opacity: 0, duration: 0.9 }, 0);
    }

    introTl
      .from(".hero__eyebrow", { y: 18, opacity: 0, duration: 0.7 }, 0.15)
      .from(".hero__role",    { y: 22, opacity: 0, duration: 0.7 }, 0.5)
      .from(".hero__loc",     { y: 18, opacity: 0, duration: 0.6 }, 0.62)
      .from(".hero__summary p", { y: 22, opacity: 0, duration: 0.7, stagger: 0.12 }, 0.7)
      .from(".hero__tagline", { x: -18, opacity: 0, duration: 0.6 }, 0.9)
      .from(".hero__links .btn", {
        y: 24, opacity: 0, scale: 0.92, duration: 0.6, stagger: 0.07, ease: "back.out(2)"
      }, 1.0)
      .from(".formations .formation", { y: 14, opacity: 0, duration: 0.5, stagger: 0.06 }, 1.15);

    var go = startIntro(introTl);
    if (document.readyState === "complete") go();
    else addEventListener("load", go);
    setTimeout(go, 1800);                        // failsafe

    /* --------------------------------------------------- section reveals */
    function reveal(selector, vars) {
      gsap.utils.toArray(selector).forEach(function (el) {
        el.dataset.animated = "1";
        gsap.fromTo(el, vars.from, Object.assign({}, vars.to, {
          scrollTrigger: { trigger: el, start: "top 86%", once: true }
        }));
      });
    }

    reveal(".section__head", {
      from: { y: 42, opacity: 0 },
      to:   { y: 0, opacity: 1, duration: 0.85, ease: "power3.out" }
    });
    reveal(".stats", {
      from: { y: 40, opacity: 0, scale: 0.97 },
      to:   { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
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
      from: { opacity: 0, scale: 0.9 },
      to:   { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
    });
    reveal(".contact .wrap", {
      from: { y: 44, opacity: 0 },
      to:   { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }
    });

    gsap.utils.toArray(".exp-card").forEach(function (card, i) {
      gsap.fromTo(card,
        { y: 54, opacity: 0, rotateY: 22, transformPerspective: 900 },
        { y: 0, opacity: 1, rotateY: 0, duration: 0.85, ease: "power3.out",
          delay: (i % 3) * 0.09,
          scrollTrigger: { trigger: card, start: "top 88%", once: true } });
    });

    gsap.utils.toArray(".proj").forEach(function (card, i) {
      gsap.fromTo(card,
        { y: 60, opacity: 0, scale: 0.94, rotateX: 10, transformPerspective: 1000 },
        { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.8, ease: "power3.out",
          delay: (i % 3) * 0.07,
          scrollTrigger: { trigger: card, start: "top 90%", once: true } });
    });

    gsap.utils.toArray(".job").forEach(function (job) {
      var trig = { trigger: job, start: "top 88%", once: true };
      gsap.fromTo(job, { x: -34, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.75, ease: "power3.out", scrollTrigger: trig });
      var dot = job.querySelector(".job__dot");
      if (dot) {
        gsap.fromTo(dot, { scale: 0 },
          { scale: 1, duration: 0.5, ease: "back.out(3)", delay: 0.15, scrollTrigger: trig });
      }
    });

    // any remaining .reveal nothing above claimed
    gsap.utils.toArray(".reveal").forEach(function (el) {
      if (el.dataset.animated) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true } });
    });

    /* ----------------------------------------------------- timeline draw */
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

    /* ------------------------------------------------------ hero parallax */
    gsap.to(".hero__grid", {
      y: 90, opacity: 0.15, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.5 }
    });

    /* ------------------------------------------------------ stat counters */
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

    /* ------------------------------------------------ tilt + magnetic btns */
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
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

    /* ------------------------------------- re-stagger cards after filtering */
    document.querySelectorAll(".filter").forEach(function (b) {
      b.addEventListener("click", function () {
        gsap.fromTo(".proj:not(.is-hidden)",
          { opacity: 0, y: 22, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.035, ease: "power3.out",
            onComplete: function () { ST.refresh(); } });
      });
    });

    addEventListener("load", function () { ST.refresh(); });

    window.__motionReady = true;                 // only once everything is wired
  } catch (err) {
    recover(err);
  }
})();
