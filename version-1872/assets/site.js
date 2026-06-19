
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const navToggle = $('.nav-toggle');
  const navLinks = $('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('is-open'));
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && e.target !== navToggle) navLinks.classList.remove('is-open');
    });
  }

  // Simple filter/search for any page that has cards with data-title attributes.
  const searchInputs = $$('[data-search-input]');
  searchInputs.forEach((input) => {
    const page = input.closest('.filterable-page, main') || document;
    const cards = $$('.movie-card', page);
    const title = input.value.trim();
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach((card) => {
        const hay = [card.dataset.title, card.dataset.year, card.dataset.type, card.dataset.genre, card.dataset.keywords].join(' ').toLowerCase();
        const ok = !q || hay.includes(q);
        card.classList.toggle('hidden', !ok);
        if (ok) shown += 1;
      });
      let empty = $('.search-empty', page);
      if (shown === 0) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'search-empty';
          empty.textContent = '没有找到匹配内容，请尝试更换关键词。';
          page.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    };
    input.addEventListener('input', apply);
    const goBtn = input.parentElement && input.parentElement.querySelector('[data-search-go]');
    if (goBtn) goBtn.addEventListener('click', apply);
  });

  // Hero slider and dots
  const slider = $('[data-hero-slider]');
  if (slider) {
    const slides = $$('[data-slide]', slider);
    const dots = $$('[data-dot]', slider);
    let idx = 0;
    const setActive = (i) => {
      idx = i % slides.length;
      slides.forEach((el, n) => el.classList.toggle('is-active', n === idx));
      dots.forEach((el, n) => el.classList.toggle('is-active', n === idx));
    };
    dots.forEach((dot) => dot.addEventListener('click', () => setActive(Number(dot.dataset.dot || 0))));
    setInterval(() => setActive(idx + 1), 4500);
  }

  // Detail player with HLS.js or native HLS.
  const shell = $('[data-player-shell]');
  if (shell) {
    const video = $('.detail-video', shell);
    const playBtn = $('[data-play-btn]', shell);
    const chips = $$('.source-chip');
    let hls;

    const loadSource = (src) => {
      if (!video || !src) return;
      shell.dataset.src = src;
      chips.forEach((chip) => chip.classList.toggle('is-active', chip.dataset.src === src));
      if (hls) {
        try { hls.destroy(); } catch (e) {}
        hls = null;
      }
      const canNative = video.canPlayType('application/vnd.apple.mpegurl');
      if (window.Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            try { hls.destroy(); } catch (e) {}
            hls = null;
          }
        });
      } else if (canNative) {
        video.src = src;
        video.addEventListener('loadedmetadata', function onload() {
          video.removeEventListener('loadedmetadata', onload);
          video.play().catch(() => {});
        });
      } else {
        video.src = src;
        video.play().catch(() => {});
      }
    };

    const initial = shell.dataset.src;
    if (initial) loadSource(initial);

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        playBtn.style.display = 'none';
        if (!video.src && shell.dataset.src) loadSource(shell.dataset.src);
        video.play().catch(() => {});
      });
    }

    video.addEventListener('click', () => {
      if (playBtn) playBtn.style.display = 'none';
      video.play().catch(() => {});
    });

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const src = chip.dataset.src;
        if (src) {
          if (playBtn) playBtn.style.display = 'none';
          loadSource(src);
        }
      });
    });
  }
})();
