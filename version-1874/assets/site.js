function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function bindMenu() {
  var button = document.querySelector("[data-menu-button]");
  var nav = document.querySelector("[data-mobile-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function bindHero() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
  if (!slides.length) {
    return;
  }
  var active = 0;
  var timer = null;

  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle("is-active", current === active);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle("is-active", current === active);
    });
  }

  function start() {
    timer = window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      window.clearInterval(timer);
      show(index);
      start();
    });
  });

  show(0);
  start();
}

function bindFilters() {
  var toolbars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-toolbar]"));
  toolbars.forEach(function (toolbar) {
    var scope = document.querySelector(toolbar.getAttribute("data-filter-toolbar")) || document;
    var input = toolbar.querySelector("[data-search-input]");
    var genre = toolbar.querySelector("[data-genre-select]");
    var year = toolbar.querySelector("[data-year-select]");
    var region = toolbar.querySelector("[data-region-select]");
    var reset = toolbar.querySelector("[data-reset-filter]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
    var empty = document.querySelector("[data-no-results]");

    function value(node) {
      return node ? node.value.trim().toLowerCase() : "";
    }

    function text(node, name) {
      return (node.getAttribute(name) || "").toLowerCase();
    }

    function apply() {
      var q = value(input);
      var g = value(genre);
      var y = value(year);
      var r = value(region);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          text(card, "data-title"),
          text(card, "data-genre"),
          text(card, "data-year"),
          text(card, "data-region"),
          text(card, "data-tags")
        ].join(" ");
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (g && text(card, "data-genre") !== g) {
          ok = false;
        }
        if (y && text(card, "data-year") !== y) {
          ok = false;
        }
        if (r && text(card, "data-region") !== r) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, genre, year, region].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) input.value = "";
        if (genre) genre.value = "";
        if (year) year.value = "";
        if (region) region.value = "";
        apply();
      });
    }
  });
}

function bindMoviePlayer(mediaUrl) {
  ready(function () {
    var shell = document.querySelector(".player-shell");
    var video = document.querySelector(".movie-player");
    var overlay = document.querySelector(".player-overlay");
    if (!shell || !video || !overlay || !mediaUrl) {
      return;
    }
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
    }

    function play() {
      attach();
      overlay.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

ready(function () {
  bindMenu();
  bindHero();
  bindFilters();
});
