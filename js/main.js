/* ============================================================================
 * main.js — renders the site from window.CV (js/data.js)
 * Vanilla JS, no dependencies, no build step.
 * ==========================================================================*/
(function () {
  "use strict";

  var D = window.CV;
  var $ = function (s) { return document.querySelector(s); };
  var el = function (tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  };
  var icon = function (name, cls) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (cls) svg.setAttribute("class", cls);
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#i-" + name);
    svg.appendChild(use);
    return svg;
  };

  /* ------------------------------------------------------------------ theme */
  // Initial theme is applied by the inline head script to avoid a flash.
  var root = document.documentElement;

  $("#theme-btn").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("jh-theme", next); } catch (e) {}
  });

  $("#print-btn").addEventListener("click", function () { window.print(); });

  /* ------------------------------------------------------------------- hero */
  var p = D.profile;
  var current = (D.experience || []).find(function (j) { return j.current; });

  $("#hero-status").textContent = current
    ? current.role + " @ " + current.company
    : "Available for work";
  $("#hero-name").textContent = p.name;
  $("#hero-role").textContent = p.role;
  $("#hero-loc").textContent = p.location;
  $("#hero-tagline").textContent = p.tagline;

  var sum = $("#hero-summary");
  p.summary.forEach(function (t) {
    var para = el("p");
    para.textContent = t;
    sum.appendChild(para);
  });

  function linkButton(l, primary) {
    var a = el("a", "btn" + (primary ? " btn--primary" : ""));
    a.href = l.href;
    if (l.href.indexOf("http") === 0) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    a.appendChild(icon(l.icon || "link"));
    a.appendChild(document.createTextNode(l.label));
    return a;
  }

  var heroLinks = $("#hero-links");
  var contactLinks = $("#contact-links");
  p.links.forEach(function (l, i) {
    heroLinks.appendChild(linkButton(l, i === 0));
    contactLinks.appendChild(linkButton(l, l.icon === "mail"));
  });

  /* --------------------------------------------------------------- portrait */
  var portrait = $("#portrait");
  var mono = el("span", "portrait__mono");
  mono.textContent = p.initials;
  portrait.appendChild(mono);

  if (p.photo) {
    var img = new Image();
    img.alt = p.name;
    img.onload = function () { portrait.replaceChild(img, mono); };
    img.src = p.photo;                       // silently keeps the monogram if missing
  }

  /* ------------------------------------------------------------------ stats */
  var stats = $("#stats");
  D.stats.forEach(function (s) {
    var c = el("div", "stat");
    var v = el("div", "stat__v"); v.textContent = s.value;
    var l = el("div", "stat__l"); l.textContent = s.label;
    c.appendChild(v); c.appendChild(l);
    stats.appendChild(c);
  });

  /* -------------------------------------------------------------- expertise */
  var eg = $("#expertise-grid");
  D.expertise.forEach(function (x) {
    var c = el("article", "exp-card reveal");
    var h = el("h3", "exp-card__title"); h.textContent = x.title;
    var b = el("p", "exp-card__blurb");  b.textContent = x.blurb;
    var ul = el("ul", "exp-card__list");
    x.items.forEach(function (it) {
      var li = el("li"); li.textContent = it; ul.appendChild(li);
    });
    c.appendChild(h); c.appendChild(b); c.appendChild(ul);
    eg.appendChild(c);
  });

  /* --------------------------------------------------------------- projects */
  var grid = $("#proj-grid");

  function projectCard(pr) {
    var card = el("article", "proj reveal" +
      (pr.featured ? " proj--featured" : pr.wide ? " proj--wide" : ""));
    card.dataset.cat = (pr.tags || []).join("|");

    var top = el("div", "proj__top");
    var titleBox = el("div");
    var name = el("h3", "proj__name"); name.textContent = pr.name;
    titleBox.appendChild(name);
    if (pr.repo && pr.repo !== pr.name) {
      var repo = el("p", "proj__repo"); repo.textContent = pr.repo;
      titleBox.appendChild(repo);
    }
    top.appendChild(titleBox);

    var badge = el("span", "badge " + (pr.private ? "" : "badge--public"));
    badge.textContent = pr.private ? "Private" : "Open Source";
    top.appendChild(badge);
    card.appendChild(top);

    var blurb = el("p", "proj__blurb"); blurb.textContent = pr.blurb;
    card.appendChild(blurb);

    if (pr.highlights && pr.highlights.length) {
      var ul = el("ul", "proj__hl");
      pr.highlights.forEach(function (h) {
        var li = el("li"); li.textContent = h; ul.appendChild(li);
      });
      card.appendChild(ul);
    }

    if (pr.install) {
      var inst = el("code", "install"); inst.textContent = pr.install;
      card.appendChild(inst);
    }

    if (pr.viz === "montecarlo") {
      var viz = el("div", "viz");
      var vh = el("div", "viz__head");
      vh.innerHTML = "<span>Live Monte Carlo — aggregate annual loss</span>" +
                     "<span class='viz__tag'>running now</span>";
      var cv = el("canvas"); cv.id = "mc-canvas";
      var ro = el("div", "viz__readout"); ro.id = "mc-readout";
      viz.appendChild(vh); viz.appendChild(cv); viz.appendChild(ro);
      card.appendChild(viz);
    }

    if (pr.tech && pr.tech.length) {
      var tags = el("div", "tags");
      pr.tech.forEach(function (t) {
        var s = el("span", "tag"); s.textContent = t; tags.appendChild(s);
      });
      card.appendChild(tags);
    }

    var foot = el("div", "proj__foot");
    if (pr.links && pr.links.length) {
      pr.links.forEach(function (l) {
        var a = el("a", "proj__link");
        a.href = l.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.appendChild(icon(l.label === "GitHub" ? "github" : l.label === "PyPI" ? "package" : "link"));
        a.appendChild(document.createTextNode(l.label));
        foot.appendChild(a);
      });
    } else {
      var note = el("span", "proj__note");
      note.appendChild(icon("lock"));
      note.appendChild(document.createTextNode("Private repository — happy to walk through it"));
      foot.appendChild(note);
    }
    card.appendChild(foot);
    return card;
  }

  D.projects.forEach(function (pr) { grid.appendChild(projectCard(pr)); });

  /* ---------------------------------------------------------------- filters */
  var cats = ["All"];
  D.projects.forEach(function (pr) {
    (pr.tags || []).forEach(function (t) {
      if (cats.indexOf(t) === -1) cats.push(t);
    });
  });

  var filterBar = $("#filters");
  cats.forEach(function (c, i) {
    var b = el("button", "filter" + (i === 0 ? " is-active" : ""));
    b.type = "button";
    b.textContent = c;
    b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    b.addEventListener("click", function () {
      filterBar.querySelectorAll(".filter").forEach(function (o) {
        o.classList.remove("is-active");
        o.setAttribute("aria-pressed", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-pressed", "true");
      grid.querySelectorAll(".proj").forEach(function (card) {
        var show = c === "All" || card.dataset.cat.split("|").indexOf(c) !== -1;
        card.classList.toggle("is-hidden", !show);
      });
    });
    filterBar.appendChild(b);
  });

  /* -------------------------------------------------------------- timeline */
  var tl = $("#timeline");
  D.experience.forEach(function (j) {
    var art = el("article", "job reveal" + (j.current ? " job--current" : "") + (j.muted ? " job--muted" : ""));
    art.appendChild(el("span", "job__dot"));

    var head = el("div", "job__head");
    var role = el("h3", "job__role"); role.textContent = j.role;
    var co = el("span", "job__co");   co.textContent = j.company;
    head.appendChild(role); head.appendChild(co);
    art.appendChild(head);

    var meta = el("p", "job__meta");
    [j.start + " — " + j.end, j.duration, j.type, j.location]
      .filter(Boolean)
      .forEach(function (bit, i, arr) {
        var s = el("span");
        s.textContent = bit + (i < arr.length - 1 ? "  ·" : "");
        meta.appendChild(s);
      });
    art.appendChild(meta);

    if (j.points && j.points.length) {
      var ul = el("ul", "job__pts");
      j.points.forEach(function (pt) {
        var li = el("li"); li.textContent = pt; ul.appendChild(li);
      });
      art.appendChild(ul);
    }

    if (j.skills && j.skills.length) {
      var tags = el("div", "tags");
      j.skills.forEach(function (s) {
        var t = el("span", "tag"); t.textContent = s; tags.appendChild(t);
      });
      art.appendChild(tags);
    }
    tl.appendChild(art);
  });

  /* ----------------------------------------------------- honors / languages */
  var hon = $("#honors");
  D.honors.forEach(function (h) {
    var c = el("article", "honor");
    var t = el("h3", "honor__t"); t.textContent = h.title;
    var m = el("p", "honor__m");  m.textContent = h.meta;
    var b = el("p", "honor__b");  b.textContent = h.body;
    c.appendChild(t); c.appendChild(m); c.appendChild(b);
    hon.appendChild(c);
  });

  var langs = $("#languages");
  D.languages.forEach(function (l) {
    var row = el("div", "lang");
    var n = el("span", "lang__n"); n.textContent = l.name;
    var v = el("span", "lang__l"); v.textContent = l.level;
    row.appendChild(n); row.appendChild(v);
    langs.appendChild(row);
  });

  /* ----------------------------------------------------------------- footer */
  $("#footer-left").textContent = "© " + D.meta.year + " " + p.name;
  $("#footer-right").textContent = D.meta.footerNote;

  /* ------------------------------------------------------------ nav effects */
  var nav = $("#nav");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function onScroll() {
    nav.classList.toggle("is-stuck", window.scrollY > 8);

    var y = window.scrollY + 140;
    var active = null;
    sections.forEach(function (s) { if (s.offsetTop <= y) active = s.id; });
    navLinks.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + active);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------------------------
   * Scroll reveals are owned by js/motion.js (GSAP). If that layer never boots,
   * the inline head script drops `js-motion` and CSS leaves everything visible.
   * ------------------------------------------------------------------------*/
})();
