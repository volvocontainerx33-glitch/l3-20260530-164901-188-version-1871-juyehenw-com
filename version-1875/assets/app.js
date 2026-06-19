function setupNavigation() {
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-nav-menu]");
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener("click", function() {
    menu.classList.toggle("is-open");
  });
}

function setupHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) {
    return;
  }
  var index = 0;
  function activate(next) {
    index = next;
    slides.forEach(function(slide, itemIndex) {
      slide.classList.toggle("is-active", itemIndex === index);
    });
    dots.forEach(function(dot, itemIndex) {
      dot.classList.toggle("is-active", itemIndex === index);
    });
  }
  dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      activate(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });
  window.setInterval(function() {
    activate((index + 1) % slides.length);
  }, 5200);
}

function setupFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
  panels.forEach(function(panel) {
    var container = panel.parentElement || document;
    var input = panel.querySelector("[data-search-input]");
    var year = panel.querySelector("[data-year-filter]");
    var region = panel.querySelector("[data-region-filter]");
    var type = panel.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
    if (!cards.length) {
      cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    }
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      cards.forEach(function(card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (regionValue && cardRegion.indexOf(regionValue) === -1) {
          matched = false;
        }
        if (typeValue && cardType.indexOf(typeValue) === -1) {
          matched = false;
        }
        card.classList.toggle("is-filter-hidden", !matched);
      });
    }
    [input, year, region, type].forEach(function(control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });
}

function setupPlayer(sourceUrl) {
  var video = document.getElementById("movieVideo");
  var overlay = document.getElementById("playOverlay");
  var started = false;
  if (!video || !sourceUrl) {
    return;
  }
  function bindSource() {
    if (started) {
      return;
    }
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }
  function playVideo() {
    bindSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function() {});
    }
  }
  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }
  video.addEventListener("click", function() {
    if (!started) {
      playVideo();
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  setupNavigation();
  setupHero();
  setupFilters();
});
