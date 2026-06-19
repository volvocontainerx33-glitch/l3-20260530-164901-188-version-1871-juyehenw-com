(function () {
  var body = document.body;
  var root = body ? body.getAttribute("data-root") || "./" : "./";
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = !mobileNav.hasAttribute("hidden");
      if (isOpen) {
        mobileNav.setAttribute("hidden", "");
        menuButton.setAttribute("aria-expanded", "false");
      } else {
        mobileNav.removeAttribute("hidden");
        menuButton.setAttribute("aria-expanded", "true");
      }
    });
  }

  function asPath(path) {
    return root + path;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderSearch(panel, items) {
    if (!items.length) {
      panel.innerHTML = '<div class="search-item"><span><strong>没有匹配内容</strong><em></em></span></div>';
      panel.removeAttribute("hidden");
      return;
    }

    panel.innerHTML = items.slice(0, 12).map(function (item) {
      return '<a class="search-item" href="' + asPath(item.path) + '">' +
        '<img src="' + asPath(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' +
        escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) +
        '</span></span></a>';
    }).join("");
    panel.removeAttribute("hidden");
  }

  document.querySelectorAll(".site-search").forEach(function (form) {
    var input = form.querySelector('input[type="search"]');
    var panel = form.querySelector(".search-panel");
    if (!input || !panel) {
      return;
    }

    function update() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        panel.setAttribute("hidden", "");
        panel.innerHTML = "";
        return;
      }
      var movies = window.SITE_MOVIES || [];
      var result = movies.filter(function (item) {
        return (item.title + " " + item.year + " " + item.region + " " + item.genre + " " + item.type).toLowerCase().indexOf(q) !== -1;
      });
      renderSearch(panel, result);
    }

    input.addEventListener("input", update);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      update();
    });
    document.addEventListener("click", function (event) {
      if (!form.contains(event.target)) {
        panel.setAttribute("hidden", "");
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var heroIndex = 0;
  var timer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === heroIndex);
    });
  }

  function queueHero() {
    if (timer) {
      clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showHero(i);
      queueHero();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      showHero(heroIndex - 1);
      queueHero();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showHero(heroIndex + 1);
      queueHero();
    });
  }

  showHero(0);
  queueHero();

  document.querySelectorAll(".filter-panel").forEach(function (panel) {
    var input = panel.querySelector(".filter-input");
    var buttons = Array.prototype.slice.call(panel.querySelectorAll(".filter-button"));
    var scope = document.querySelector(panel.getAttribute("data-target") || "");
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];
    var active = "all";

    function applyFilter() {
      var q = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var region = (card.getAttribute("data-region") || "").toLowerCase();
        var year = (card.getAttribute("data-year") || "").toLowerCase();
        var genre = (card.getAttribute("data-genre") || "").toLowerCase();
        var matchesText = !q || text.indexOf(q) !== -1;
        var matchesButton = active === "all" || region.indexOf(active) !== -1 || year.indexOf(active) !== -1 || genre.indexOf(active) !== -1;
        card.classList.toggle("hide-by-filter", !(matchesText && matchesButton));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        active = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });
  });
})();
