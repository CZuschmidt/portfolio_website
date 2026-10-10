// Image viewer for project pages.
// Without JavaScript, image links simply open the full-size file.
(function () {
  "use strict";

  var dialog = document.querySelector(".lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;

  var img = dialog.querySelector(".lightbox__img");
  var caption = dialog.querySelector(".lightbox__caption");
  var closeButton = dialog.querySelector(".lightbox__close");
  var opener = null;

  function open(link) {
    var source = link.querySelector("img");
    opener = link;
    caption.textContent = link.getAttribute("data-caption") || "";
    img.alt = source ? source.alt : "";

    dialog.classList.add("is-loading");
    img.onload = function () { dialog.classList.remove("is-loading"); };
    img.onerror = function () {
      dialog.classList.remove("is-loading");
      caption.textContent = "This image could not be loaded.";
    };
    img.src = link.getAttribute("href");
    if (img.complete && img.naturalWidth > 0) dialog.classList.remove("is-loading");

    dialog.showModal();
  }

  function close() {
    dialog.close();
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[data-zoom]");
    if (!link) return;
    // Let modifier-clicks (new tab, etc.) behave normally.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    open(link);
  });

  closeButton.addEventListener("click", close);

  // Clicking the dark area around the image closes the viewer.
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) close();
  });

  dialog.addEventListener("close", function () {
    img.removeAttribute("src");
    if (opener) opener.focus();
  });
})();

// Fade content up the first time it scrolls into view.
// Only elements that start below the fold are animated, so nothing visible
// on load ever flickers. Items that arrive together (e.g. a row of cards)
// appear one after another with a short delay.
(function () {
  "use strict";

  if (!("IntersectionObserver" in window)) return;

  var selector = [
    ".section__label",
    ".about",
    ".skills",
    ".card",
    ".entry",
    ".prose .figure",
    ".pager"
  ].join(",");

  var observer = new IntersectionObserver(function (entries) {
    var step = 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.style.transitionDelay = Math.min(step++, 3) * 80 + "ms";
      entry.target.classList.remove("is-pending");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -5% 0px" });

  document.querySelectorAll(selector).forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("reveal", "is-pending");
    observer.observe(el);
  });

  // Orange dash on each section divider draws in when the section arrives.
  var lineObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove("line-pending");
      lineObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -15% 0px" });

  document.querySelectorAll(".section.container").forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("line-pending");
    lineObserver.observe(el);
  });
})();

// Underline the nav link for the section currently in the middle of the screen.
(function () {
  "use strict";

  if (!("IntersectionObserver" in window)) return;

  var links = Array.prototype.filter.call(
    document.querySelectorAll(".site-nav a"),
    function (a) { return a.pathname === location.pathname && a.hash; }
  );
  var sections = links
    .map(function (a) { return document.getElementById(a.hash.slice(1)); })
    .filter(Boolean);
  if (!sections.length) return;

  var visible = new Set();

  function update() {
    var current = sections.filter(function (s) { return visible.has(s); })[0];
    links.forEach(function (a) {
      if (current && a.hash === "#" + current.id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    update();
  }, { rootMargin: "-45% 0px -50% 0px" });

  sections.forEach(function (s) { observer.observe(s); });
})();

// Sine wave behind the intro. Its frequency rises as the page scrolls; the
// compression is anchored on the right-hand side, where the wave is fully
// visible. It eases toward its target and only redraws while the hero is on
// screen and the wave is still changing.
(function () {
  "use strict";

  var wave = document.querySelector(".hero__wave");
  if (!wave) return;

  var trace = wave.querySelector(".hero__trace");

  var W = 1000, MID = 200, AMP = 120;  // viewBox units
  var ANCHOR = 0.75;                   // phase is pinned at 75% of the width
  var C_MIN = 2, C_MAX = 9;            // cycles across the width: top / scrolled
  var RANGE = 600;                     // px of scrolling from C_MIN to C_MAX
  var STEPS = 500;

  function target() {
    var k = Math.min(window.scrollY / RANGE, 1);
    return C_MIN + (C_MAX - C_MIN) * k;
  }

  function render(cycles) {
    var d = "";
    for (var i = 0; i <= STEPS; i++) {
      var u = i / STEPS;
      var y = MID - AMP * Math.sin(2 * Math.PI * cycles * (u - ANCHOR));
      d += (i ? "L" : "M") + (u * W).toFixed(1) + " " + y.toFixed(1);
    }
    trace.setAttribute("d", d);
  }

  var cycles = target();
  render(cycles);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var onScreen = true;
  var running = false;

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start();
    }).observe(wave);
  }

  function frame() {
    var goal = target();
    cycles += (goal - cycles) * 0.2;
    if (Math.abs(goal - cycles) < 0.001) cycles = goal;
    render(cycles);
    if (cycles === goal || !onScreen) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || !onScreen) return;
    running = true;
    requestAnimationFrame(frame);
  }

  window.addEventListener("scroll", start, { passive: true });
})();
