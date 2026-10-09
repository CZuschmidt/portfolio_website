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
      entry.target.style.transitionDelay = Math.min(step++, 3) * 120 + "ms";
      entry.target.classList.remove("is-pending");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });

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

// Oscilloscope next to the name: a 3:2 Lissajous figure whose phase follows
// the scroll position. The trace eases toward its target, and three faint
// copies lag behind it like phosphor afterglow, so fast scrolling leaves a
// visible trail that settles when scrolling stops. Nothing moves at rest.
(function () {
  "use strict";

  var scope = document.querySelector(".scope");
  if (!scope) return;

  var trace = scope.querySelector(".scope__trace");
  var trails = Array.prototype.slice.call(scope.querySelectorAll(".scope__trail"));
  var dot = scope.querySelector(".scope__dot");
  var readout = scope.querySelector(".scope__phase");

  var A = 3, B = 2;          // frequency ratio X:Y
  var C = 200, R = 150;      // centre and amplitude in SVG units
  var STEPS = 240;
  var START = Math.PI / 2;   // phase at the top of the page
  var RANGE = 700;           // px of scrolling for one full 360° turn
  var TAU = Math.PI * 2;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function target() {
    return START + (window.scrollY / RANGE) * TAU;
  }

  function point(t, phase) {
    return [C + R * Math.sin(A * t + phase), C + R * Math.sin(B * t)];
  }

  function pathFor(phase) {
    var d = "";
    for (var i = 0; i <= STEPS; i++) {
      var p = point((i / STEPS) * TAU, phase);
      d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1);
    }
    return d;
  }

  var phase = target();
  var lag = trails.map(function () { return phase; });

  function render() {
    trace.setAttribute("d", pathFor(phase));
    trails.forEach(function (el, i) {
      el.setAttribute("d", pathFor(lag[i]));
    });
    // the dot rides the trace, its position also set by scroll
    var p = point(phase * 0.5, phase);
    dot.setAttribute("cx", p[0].toFixed(1));
    dot.setAttribute("cy", p[1].toFixed(1));
    var deg = Math.round((((phase * 180) / Math.PI) % 360 + 360) % 360);
    readout.textContent = ("00" + deg).slice(-3);
  }

  render();
  if (reduceMotion) return;

  var running = false;

  function frame() {
    var goal = target();
    phase += (goal - phase) * 0.12;
    // each afterglow copy follows the one in front of it
    var lead = phase;
    for (var i = trails.length - 1; i >= 0; i--) {
      lag[i] += (lead - lag[i]) * 0.18;
      lead = lag[i];
    }
    render();

    var settled = Math.abs(goal - phase) < 0.0005 &&
      lag.every(function (v) { return Math.abs(v - phase) < 0.0005; });
    if (settled) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("scroll", function () {
    // only animate while the scope is on screen
    if (scope.getBoundingClientRect().bottom < 0) return;
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }, { passive: true });
})();
