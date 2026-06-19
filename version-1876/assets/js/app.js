
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function setupNav() {
    const btn = qs('[data-nav-toggle]');
    const nav = qs('[data-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroSearch() {
    const form = qs('[data-hero-search]');
    if (!form) return;
    const input = qs('input[name="q"]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const q = (input && input.value ? input.value.trim() : '');
      const url = '/search.html' + (q ? ('?q=' + encodeURIComponent(q)) : '');
      window.location.href = url;
    });
  }

  function initPlayer() {
    qsa('[data-player]').forEach(function (wrap) {
      const video = qs('video', wrap);
      const btn = qs('[data-play-btn]', wrap);
      if (!video || !btn) return;
      const src = wrap.getAttribute('data-src') || '';
      const poster = wrap.getAttribute('data-poster') || '';
      if (poster) video.setAttribute('poster', poster);
      if (src) {
        if (/\.m3u8($|\?)/i.test(src) && window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }
      function hideOverlay() {
        wrap.classList.add('is-playing');
      }
      btn.addEventListener('click', function () {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
        hideOverlay();
      });
      video.addEventListener('play', hideOverlay);
      video.addEventListener('click', function () {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
        hideOverlay();
      });
    });
  }

  function movieCardTemplate(movie) {
    const tags = (movie.tags || []).slice(0, 3).join(' / ');
    return '<a class="movie-card" href="' + movie.href + '" style="--hue:' + (movie.hue || 160) + '">' +
      '<div class="movie-card__poster"><span class="movie-card__poster-badge">' + movie.year + '</span><span class="movie-card__poster-text">' + movie.posterText + '</span></div>' +
      '<div class="movie-card__body"><div class="movie-card__meta">' + movie.region + ' · ' + movie.type + ' · ' + movie.year + '</div>' +
      '<h3 class="movie-card__title">' + movie.title + '</h3>' +
      '<p class="movie-card__excerpt">' + movie.oneLine + '</p>' +
      '<div class="movie-card__tags">' + tags + '</div></div></a>';
  }

  function listCardTemplate(movie, rank) {
    return '<a class="list-card" href="' + movie.href + '">' +
      '<div class="list-card__rank">' + rank + '</div>' +
      '<div><h3 class="list-card__title">' + movie.title + '</h3>' +
      '<div class="list-card__meta">' + movie.region + ' · ' + movie.type + ' · ' + movie.year + '</div>' +
      '<p class="list-card__excerpt">' + movie.oneLine + '</p></div></a>';
  }

  function scoreForQuery(movie, query) {
    if (!query) return 0;
    let score = 0;
    const q = query.toLowerCase();
    const fields = [movie.title, movie.region, movie.type, movie.genre, (movie.tags || []).join(' '), movie.oneLine];
    fields.forEach(function (f) {
      if (!f) return;
      const v = String(f).toLowerCase();
      if (v.indexOf(q) !== -1) score += 30;
    });
    if (String(movie.title).toLowerCase().indexOf(q) === 0) score += 50;
    return score;
  }

  function initFinderPage(kind) {
    const data = window.MOVIES_DATA;
    const root = qs('[data-finder]');
    if (!root || !Array.isArray(data)) return;

    const grid = qs('[data-results]', root);
    const count = qs('[data-count]', root);
    const search = qs('[data-query]', root);
    const region = qs('[data-region]', root);
    const type = qs('[data-type]', root);
    const year = qs('[data-year]', root);
    const sort = qs('[data-sort]', root);
    const prev = qs('[data-prev]', root);
    const next = qs('[data-next]', root);
    const pageInfo = qs('[data-page-info]', root);

    const url = new URL(window.location.href);
    if (search && url.searchParams.get('q')) search.value = url.searchParams.get('q');
    if (region && url.searchParams.get('region')) region.value = url.searchParams.get('region');
    if (type && url.searchParams.get('type')) type.value = url.searchParams.get('type');
    if (year && url.searchParams.get('year')) year.value = url.searchParams.get('year');
    if (sort && url.searchParams.get('sort')) sort.value = url.searchParams.get('sort');

    const pageSize = kind === 'ranking' ? 48 : 36;
    let currentPage = 1;

    function filtered() {
      const q = (search && search.value ? search.value.trim().toLowerCase() : '');
      const regionVal = region ? region.value : 'all';
      const typeVal = type ? type.value : 'all';
      const yearVal = year ? year.value : 'all';
      const sortVal = sort ? sort.value : (kind === 'ranking' ? 'score' : 'relevance');
      let list = data.filter(function (m) {
        if (regionVal !== 'all' && m.region !== regionVal) return false;
        if (typeVal !== 'all' && m.type !== typeVal) return false;
        if (yearVal !== 'all' && String(m.year) !== String(yearVal)) return false;
        if (!q) return true;
        const hay = [m.title, m.region, m.type, m.genre, (m.tags || []).join(' '), m.oneLine].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      if (sortVal === 'year') list = list.sort(function (a, b) { return b.year - a.year || b.score - a.score; });
      else if (sortVal === 'title') list = list.sort(function (a, b) { return a.title.localeCompare(b.title, 'zh-Hans-CN'); });
      else if (sortVal === 'score') list = list.sort(function (a, b) { return b.score - a.score; });
      else if (q) list = list.sort(function (a, b) { return scoreForQuery(b, q) - scoreForQuery(a, q) || b.score - a.score; });
      return list;
    }

    function render() {
      const list = filtered();
      const total = list.length;
      const pageCount = Math.max(1, Math.ceil(total / pageSize));
      if (currentPage > pageCount) currentPage = pageCount;
      if (currentPage < 1) currentPage = 1;
      const start = (currentPage - 1) * pageSize;
      const slice = list.slice(start, start + pageSize);
      if (count) count.textContent = total + ' 部';
      if (pageInfo) pageInfo.textContent = currentPage + ' / ' + pageCount;
      if (grid) {
        grid.innerHTML = slice.map(function (m, i) {
          return kind === 'ranking' ? listCardTemplate(m, start + i + 1) : movieCardTemplate(m);
        }).join('') || '<div class="empty-state">没有找到匹配的内容，请调整筛选条件。</div>';
      }
      if (prev) prev.disabled = currentPage <= 1;
      if (next) next.disabled = currentPage >= pageCount;
    }

    [search, region, type, year, sort].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () { currentPage = 1; render(); });
      el.addEventListener('change', function () { currentPage = 1; render(); });
    });
    if (prev) prev.addEventListener('click', function () { currentPage -= 1; render(); });
    if (next) next.addEventListener('click', function () { currentPage += 1; render(); });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNav();
    initHeroSearch();
    initPlayer();
    initFinderPage(document.body.getAttribute('data-page'));
  });
})();
