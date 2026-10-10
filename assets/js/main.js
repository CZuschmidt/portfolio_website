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

// Sine wave behind the intro, plotted on faint scope-style axes. The screen
// spans 5 ms; scrolling raises the frequency from 400 Hz to 1.8 kHz. The SVG
// is drawn in real pixels (re-laid out on resize) so labels never stretch.
// The wave eases toward its target and only redraws while the hero is on
// screen and the wave is still changing.
(function () {
  "use strict";

  var svg = document.querySelector(".hero__wave");
  if (!svg) return;

  var NS = "http://www.w3.org/2000/svg";
  var grid = svg.querySelector(".hero__grid");
  var labels = svg.querySelector(".hero__labels");
  var trace = svg.querySelector(".hero__trace");
  var readout = svg.querySelector(".hero__readout");
  var text = document.querySelector(".hero__text");

  var SPAN_MS = 5;                 // time across the full width
  var F_MIN = 400, F_MAX = 1800;   // Hz: top of page / fully scrolled
  var RANGE = 600;                 // px of scrolling from F_MIN to F_MAX
  var ANCHOR = 0.75;               // phase is pinned at 75% of the width

  var w = 0, h = 0, mid = 0, amp = 0, right = 0;

  function el(name, attrs, content) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (content) node.textContent = content;
    return node;
  }

  function layout() {
    var box = svg.getBoundingClientRect();
    w = box.width;
    h = box.height;
    if (!w || !h) return;
    mid = Math.round(h * 0.5) + 0.5;
    amp = Math.round(h * 0.3);
    // right-hand labels line up with the right edge of the page content
    var pad = parseFloat(getComputedStyle(text).paddingRight) || 0;
    right = Math.min(w - 16, text.getBoundingClientRect().right - pad - box.left);
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);

    while (grid.firstChild) grid.removeChild(grid.firstChild);
    while (labels.firstChild) labels.removeChild(labels.firstChild);

    var msPx = w / SPAN_MS;
    for (var i = 1; i < SPAN_MS * 2; i++) {
      var x = Math.round((i * msPx) / 2) + 0.5;
      var major = i % 2 === 0;
      if (major) {
        grid.appendChild(el("path", { "class": "hero__gridline", d: "M" + x + " 0V" + h }));
        labels.appendChild(el("text", { "class": "hero__label", x: x + 6, y: mid + 18 }, i / 2 + " ms"));
      }
      var len = major ? 6 : 3;
      grid.appendChild(el("path", { "class": "hero__tick", d: "M" + x + " " + (mid - len) + "V" + (mid + len) }));
    }

    [[-1, "+1 V"], [1, "\u22121 V"]].forEach(function (ref) {
      var y = Math.round(mid + ref[0] * amp) + 0.5;
      grid.appendChild(el("path", { "class": "hero__gridline", d: "M0 " + y + "H" + w }));
      labels.appendChild(el("text", { "class": "hero__label", x: right, y: y - 6, "text-anchor": "end" }, ref[1]));
    });
    grid.appendChild(el("path", { "class": "hero__axisline", d: "M0 " + mid + "H" + w }));
    labels.appendChild(el("text", { "class": "hero__label", x: right, y: mid - 6, "text-anchor": "end" }, "0 V"));

    readout.setAttribute("x", right);
    readout.setAttribute("y", Math.max(16, mid - amp - 24));

    render(freq);
  }

  function target() {
    var k = Math.min(window.scrollY / RANGE, 1);
    return F_MIN + (F_MAX - F_MIN) * k;
  }

  function render(f) {
    if (!w) return;
    var cycles = (f * SPAN_MS) / 1000;
    var steps = Math.ceil(w / 3);
    var d = "";
    for (var i = 0; i <= steps; i++) {
      var u = i / steps;
      var y = mid - amp * Math.sin(2 * Math.PI * cycles * (u - ANCHOR));
      d += (i ? "L" : "M") + (u * w).toFixed(1) + " " + y.toFixed(1);
    }
    trace.setAttribute("d", d);
    var hz = f < 1000 ? Math.round(f) + " Hz" : (f / 1000).toFixed(2) + " kHz";
    readout.textContent = "f " + hz + "  \u00b7  T " + (1000 / f).toFixed(2) + " ms";
  }

  var freq = target();
  layout();
  if ("ResizeObserver" in window) new ResizeObserver(layout).observe(svg);
  else window.addEventListener("resize", layout);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var onScreen = true;
  var running = false;

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start();
    }).observe(svg);
  }

  function frame() {
    var goal = target();
    freq += (goal - freq) * 0.2;
    if (Math.abs(goal - freq) < 0.5) freq = goal;
    render(freq);
    if (freq === goal || !onScreen) {
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
