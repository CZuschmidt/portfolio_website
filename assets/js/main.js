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
