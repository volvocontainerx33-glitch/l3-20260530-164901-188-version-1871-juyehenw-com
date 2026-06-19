(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var brokenImages = document.querySelectorAll(".poster-img, .hero-slide img, .rank-thumb img, .detail-poster img");
  brokenImages.forEach(function (image) {
    image.addEventListener("error", function () {
      image.style.opacity = "0";
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterRoot = document.querySelector("[data-filter-root]");

  if (filterRoot) {
    var input = filterRoot.querySelector("[data-search-input]");
    var yearSelect = filterRoot.querySelector("[data-year-select]");
    var typeSelect = filterRoot.querySelector("[data-type-select]");
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
    var empty = filterRoot.querySelector("[data-empty]");

    function matchCard(card) {
      var term = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-type") || "",
        card.getAttribute("data-genre") || ""
      ].join(" ").toLowerCase();

      if (term && haystack.indexOf(term) === -1) {
        return false;
      }

      if (year && String(card.getAttribute("data-year") || "") !== year) {
        return false;
      }

      if (type && String(card.getAttribute("data-type") || "") !== type) {
        return false;
      }

      return true;
    }

    function applyFilters() {
      var visibleCount = 0;

      cards.forEach(function (card) {
        var visible = matchCard(card);
        card.style.display = visible ? "" : "none";

        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.style.display = visibleCount ? "none" : "block";
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  }

  function attachPlayer(video) {
    var frame = video.closest(".player-frame");
    var button = frame ? frame.querySelector(".play-overlay") : null;
    var stream = video.getAttribute("data-stream");
    var hlsObject = null;
    var ready = false;

    function start() {
      if (!stream) {
        return;
      }

      if (button) {
        button.classList.add("is-hidden");
      }

      if (!ready) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          ready = true;
          video.play();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsObject = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsObject.loadSource(stream);
          hlsObject.attachMedia(video);
          hlsObject.on(window.Hls.Events.MANIFEST_PARSED, function () {
            ready = true;
            video.play();
          });
          return;
        }

        video.src = stream;
        ready = true;
      }

      video.play();
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", start);

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsObject) {
        hlsObject.destroy();
      }
    });
  }

  document.querySelectorAll("video[data-stream]").forEach(attachPlayer);
})();
