(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobile = document.querySelector('[data-mobile-menu]');

  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === index);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === index);
    });
  }

  function playSlides() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        playSlides();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        playSlides();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        playSlides();
      });
    }

    showSlide(0);
    playSlides();
  }

  var filterForm = document.querySelector('[data-filter-form]');

  if (filterForm) {
    var input = filterForm.querySelector('[data-filter-input]');
    var region = filterForm.querySelector('[data-filter-region]');
    var year = filterForm.querySelector('[data-filter-year]');
    var type = filterForm.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function includesText(value, needle) {
      return String(value || '').toLowerCase().indexOf(needle) !== -1;
    }

    function applyFilter() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var selectedRegion = region ? region.value : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        var matched = true;

        if (q && !includesText(text, q)) {
          matched = false;
        }
        if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
          matched = false;
        }
        if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
          matched = false;
        }
        if (selectedType && card.getAttribute('data-type') !== selectedType) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play]');
    var jsonNode = document.querySelector('.stream-json');
    var stream = '';
    var hls = null;
    var ready = false;

    try {
      stream = JSON.parse(jsonNode.textContent).stream;
    } catch (error) {
      stream = '';
    }

    function prepareVideo() {
      if (ready || !video || !stream) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function startVideo() {
      prepareVideo();
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          startVideo();
        }
      });
      video.addEventListener('play', function () {
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
