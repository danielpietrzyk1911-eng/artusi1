/* L'Artusi — interactions (vanilla JS, no dependencies) */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header state ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("main-nav");

  function closeNav() {
    nav.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }
  function openNav() {
    nav.classList.add("open");
    toggle.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      if (nav.classList.contains("open")) closeNav();
      else openNav();
    });
    // Close when a link is clicked
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) closeNav();
    });
  }

  /* ---------- Menu tabs (sliding gold indicator + keyboard nav) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".menu-tab"));
  var panels = document.querySelectorAll(".menu-panel");
  var tabBar = document.querySelector(".menu-tabs__bar");
  if (tabs.length) {
    var moveBar = function () {
      var active = document.querySelector(".menu-tab.is-active") || tabs[0];
      if (tabBar && active) {
        tabBar.style.left = active.offsetLeft + "px";
        tabBar.style.width = active.offsetWidth + "px";
      }
    };
    var activateTab = function (tab, focusIt) {
      var target = tab.getAttribute("data-tab");
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (panel) {
        var match = panel.getAttribute("data-panel") === target;
        panel.classList.toggle("is-active", match);
        if (match) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
      moveBar();
      if (focusIt) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activateTab(tab); });
      tab.addEventListener("keydown", function (e) {
        var ni;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") ni = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") ni = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") ni = 0;
        else if (e.key === "End") ni = tabs.length - 1;
        else return;
        e.preventDefault();
        activateTab(tabs[ni], true);
      });
    });
    moveBar();
    window.addEventListener("resize", moveBar, { passive: true });
    window.addEventListener("load", moveBar);
    setTimeout(moveBar, 350);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // Stagger items that share a direct parent
        var siblings = Array.prototype.slice.call(el.parentElement.children)
          .filter(function (c) { return c.classList.contains("reveal"); });
        var idx = siblings.indexOf(el);
        var delay = Math.min(idx, 6) * 80;
        el.style.transitionDelay = delay + "ms";
        el.classList.add("in-view");
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Animated counters (rating / review count) ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var fmtNum = function (v, dec) {
      return v.toLocaleString("fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    };
    var setVal = function (el, v) {
      el.textContent = fmtNum(v, parseInt(el.dataset.decimals || "0", 10)) + (el.dataset.suffix || "");
    };
    var runCount = function (el) {
      var target = parseFloat(el.dataset.count);
      if (reduceMotion) { setVal(el, target); return; }
      var dur = 1600, t0 = null;
      var step = function (now) {
        if (t0 === null) t0 = now;
        var p = Math.min((now - t0) / dur, 1);
        setVal(el, target * (1 - Math.pow(1 - p, 3))); // ease-out cubic
        if (p < 1) requestAnimationFrame(step);
        else setVal(el, target);
      };
      requestAnimationFrame(step);
    };
    if (!reduceMotion) { counters.forEach(function (c) { setVal(c, 0); }); }
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(runCount);
    } else {
      var cObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(e.target); cObs.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { cObs.observe(c); });
    }
  }

  /* ---------- Hero scroll reveal (clip-path + zoom) ---------- */
  var heroBg = document.getElementById("hero-bg");
  if (heroBg) {
    if (reduceMotion) {
      heroBg.style.clipPath = "none";
      heroBg.style.transform = "none";
    } else {
      var readHeroScroll = function () {
        return parseInt(getComputedStyle(document.documentElement).getPropertyValue("--hero-scroll"), 10) || 720;
      };
      var heroScroll = readHeroScroll();
      var heroTicking = false;
      var updateHero = function () {
        var y = window.scrollY;
        var p = Math.min(Math.max(y / heroScroll, 0), 1);
        var cs = 25 * (1 - p);        // clip start: 25% -> 0%
        var ce = 75 + 25 * p;         // clip end:   75% -> 100%
        var sp = Math.min(Math.max(y / (heroScroll + 500), 0), 1);
        var scale = 1.18 - 0.18 * sp; // GPU-accelerated zoom 1.18 -> 1 (smooth on mobile)
        heroBg.style.clipPath =
          "polygon(" + cs + "% " + cs + "%, " + ce + "% " + cs + "%, " +
          ce + "% " + ce + "%, " + cs + "% " + ce + "%)";
        heroBg.style.transform = "scale(" + scale + ")";
        heroTicking = false;
      };
      var onHeroScroll = function () {
        if (!heroTicking) { requestAnimationFrame(updateHero); heroTicking = true; }
      };
      updateHero();
      window.addEventListener("scroll", onHeroScroll, { passive: true });
      window.addEventListener("resize", function () { heroScroll = readHeroScroll(); updateHero(); }, { passive: true });
    }
  }
})();
