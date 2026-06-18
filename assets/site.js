/* ===========================================================================
   Studio Soffer — shared site behavior
   1. Lenis smooth scroll (vendored)
   2. Project menu built from a single PROJECTS manifest, rendered twice:
        · as a full-screen overlay opened by the hamburger button
        · as the last section of the page (footer index)
      Big names on the right; hovering one swaps the cover image on the left.
   Drop these two lines before </body> on every case study:
     <link rel="stylesheet" href="assets/site.css">
     <script src="assets/site.js"></script>
   =========================================================================== */
(function () {
  "use strict";

  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/[^/]*$/, "") : "assets/";
  })();

  /* ---- 1. Lenis ---------------------------------------------------------- */
  function initLenis() {
    if (typeof Lenis === "undefined") { return setTimeout(initLenis, 40); }
    var lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6,
    });
    window.lenis = lenis;
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })();
  }
  function loadLenis() {
    if (typeof Lenis !== "undefined") { return initLenis(); }
    var css = document.createElement("link");
    css.rel = "stylesheet"; css.href = BASE + "vendor/lenis.css"; document.head.appendChild(css);
    var s = document.createElement("script");
    s.src = BASE + "vendor/lenis.min.js"; s.onload = initLenis;
    s.onerror = function () { console.warn("[site] Lenis failed to load — native scroll."); };
    document.head.appendChild(s);
  }
  loadLenis();

  /* ---- 2. Manifest (single source of truth) ------------------------------ */
  var PROJECTS = [
    { key: "home",        title: "Home",                 file: "index.html",               cover: "covers/home.jpg"            },
    { key: "faireez",     title: "Faireez × Flow",       file: "faireez.html",             cover: "covers/faireez-small.png"   },
    { key: "faireez-mkt", title: "Faireez · Marketplace", file: "faireez-marketplace.html", cover: "covers/faireez-small.png"   },
    { key: "trendmind",   title: "TrendMind.ai",         file: "trendmind.html",           cover: "covers/trendmind-small.png" },
    { key: "icx-focus", title: "ICX Focus",      file: "icx-focus.html", cover: "covers/icx-focus-small.png" },
  ];
  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var current = PROJECTS.filter(function (p) { return p.file.toLowerCase() === here; })[0] || PROJECTS[0];
  var currentKey = current.key;
  if (here === "index.html") { document.documentElement.classList.add("ss-home"); }  // entrance/home page

  /* ---- 3. Build one project nav (cover + list) with hover image swap ----- */
  function setCover(cover, key) {
    var imgs = cover.querySelectorAll(".ss-cover-img");
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].classList.toggle("is-active", imgs[i].getAttribute("data-key") === key);
    }
  }
  function buildNav() {
    var nav = document.createElement("div");
    nav.className = "ss-nav";

    var cover = document.createElement("div");
    cover.className = "ss-nav-cover";
    PROJECTS.forEach(function (p) {
      var img = document.createElement("img");
      img.className = "ss-cover-img" + (p.key === currentKey ? " is-active" : "");
      img.src = BASE + p.cover; img.alt = p.title;
      img.loading = (p.key === currentKey) ? "eager" : "lazy";
      img.setAttribute("data-key", p.key);
      cover.appendChild(img);
    });

    var list = document.createElement("nav");
    list.className = "ss-nav-list";
    PROJECTS.forEach(function (p) {
      var row = document.createElement("a");
      row.className = "ss-row" + (p.file.toLowerCase() === here ? " is-current" : "");
      row.href = p.file; row.setAttribute("data-key", p.key);
      row.innerHTML = '<span class="ss-row-title">' + p.title + "</span>" +
                      '<span class="ss-row-plus" aria-hidden="true">+</span>';
      row.addEventListener("mouseenter", function () { setCover(cover, p.key); });
      list.appendChild(row);
    });
    list.addEventListener("mouseleave", function () { setCover(cover, currentKey); });

    nav.appendChild(cover);
    nav.appendChild(list);
    return nav;
  }

  /* ---- 4. Hamburger + overlay -------------------------------------------- */
  var burger = document.createElement("button");
  burger.className = "ss-burger";
  burger.setAttribute("aria-label", "Open menu");
  burger.setAttribute("aria-expanded", "false");
  burger.innerHTML =
    '<svg class="ss-ic-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="8 7 17 7 17 16"></polyline></svg>' +
    '<svg class="ss-ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg>';

  var menu = document.createElement("div");
  menu.className = "ss-menu";
  menu.setAttribute("role", "dialog"); menu.setAttribute("aria-modal", "true"); menu.setAttribute("aria-label", "Projects");
  var head = document.createElement("div");
  head.className = "ss-menu-head";
  head.innerHTML = '<span class="ss-wordmark">Studio Soffer &amp; Co</span>';
  menu.appendChild(head);
  menu.appendChild(buildNav());

  /* ---- 5. Footer section (last section of the page) ---------------------- */
  var foot = document.createElement("section");
  foot.className = "ss-foot-nav";
  foot.appendChild(buildNav());

  function mount() {
    if (here !== "index.html") { document.body.appendChild(foot); }  // entrance/home has no footer nav
    document.body.appendChild(burger);
    document.body.appendChild(menu);
  }
  if (document.body) { mount(); } else { document.addEventListener("DOMContentLoaded", mount); }

  /* case-study wordmark (top-left) links back to the entrance/home */
  var topB = document.querySelector(".topbar .b");
  if (topB) { topB.addEventListener("click", function () { location.href = "index.html"; }); }

  /* ---- 6. Open / close --------------------------------------------------- */
  var isOpen = false;
  function setOpen(v) {
    isOpen = v;
    menu.classList.toggle("ss-open", v);
    document.documentElement.classList.toggle("ss-nav-open", v);
    burger.setAttribute("aria-expanded", v ? "true" : "false");
    if (window.lenis) { v ? window.lenis.stop() : window.lenis.start(); }
    document.documentElement.style.overflow = v ? "hidden" : "";
  }
  burger.addEventListener("click", function () { setOpen(!isOpen); });
  menu.addEventListener("click", function (e) {
    if (e.target.classList.contains("ss-close")) { return setOpen(false); }
    if (e.target.closest && e.target.closest("a.ss-row")) { setOpen(false); } // let navigation proceed
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Escape" || e.key === "Esc") && isOpen) { setOpen(false); }
  });
})();
