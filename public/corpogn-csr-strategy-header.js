(function () {
  var header = document.getElementById("header");
  if (!header) return;

  var threshold = 48;

  function updateHeader() {
    if (window.scrollY > threshold) {
      header.classList.add("header-scrolled");
    } else {
      header.classList.remove("header-scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
})();
