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
// on load ever flickers. Skipped entirely when the visitor prefers reduced motion.
(function () {
  "use strict";

  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove("is-pending");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });

  document.querySelectorAll(selector).forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("reveal", "is-pending");
    observer.observe(el);
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
