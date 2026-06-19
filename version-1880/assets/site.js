
import { H as Hls } from './hls-vendor-dru42stk.js';

const qs = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));

function setActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  qsa('[data-nav-link]').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });
}

function bindMobileMenu() {
  const btn = qs('[data-menu-btn]');
  const nav = qs('[data-nav]');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
}

function normalize(str) {
  return (str || '').toLowerCase().replace(/\s+/g, '');
}

function bindLocalSearch() {
  qsa('[data-filter-input]').forEach(input => {
    const scope = document.querySelector(input.dataset.filterScope);
    if (!scope) return;
    const items = qsa('[data-card]', scope);
    const count = qs('[data-count]', input.closest('.toolbar') || document);
    const renderCount = () => {
      const visible = items.filter(el => !el.classList.contains('hidden')).length;
      if (count) count.textContent = visible;
    };
    input.addEventListener('input', () => {
      const q = normalize(input.value);
      items.forEach(el => {
        const hay = normalize([el.dataset.title, el.dataset.tags, el.dataset.meta, el.textContent].join(' '));
        el.classList.toggle('hidden', q && !hay.includes(q));
      });
      renderCount();
    });
    renderCount();
  });
}

async function bindPlayer() {
  const video = qs('[data-hls-player]');
  if (!video) return;
  const streams = (video.dataset.streams || '').split('|').filter(Boolean);
  const buttons = qsa('[data-stream-btn]');
  if (!streams.length) return;
  let hls = null;
  let current = 0;

  const selectBtn = (idx) => {
    buttons.forEach((btn, i) => btn.classList.toggle('active', i === idx));
  };

  const load = async (idx) => {
    current = idx;
    const src = streams[idx];
    selectBtn(idx);
    if (hls) {
      try { hls.destroy(); } catch (e) {}
      hls = null;
    }
    video.pause();
    video.removeAttribute('src');
    video.load();
    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_ev, data) => {
        if (data.fatal) {
          try { hls.destroy(); } catch (e) {}
          hls = null;
        }
      });
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => video.play().catch(() => {}), { once: true });
    }
  };

  buttons.forEach((btn, idx) => btn.addEventListener('click', () => load(idx)));
  await load(0);
}

async function bindGlobalSearch() {
  const box = qs('[data-global-search]');
  if (!box) return;
  const list = qs('[data-global-results]');
  const hint = qs('[data-global-hint]');
  const meta = qs('[data-global-meta]');
  let movies = [];
  try {
    const res = await fetch('./movies-index.json', { cache: 'no-store' });
    movies = await res.json();
  } catch (e) {
    if (hint) hint.textContent = '搜索索引加载失败。';
    return;
  }

  const render = (rows) => {
    if (!list) return;
    meta.textContent = `${rows.length} 条结果`;
    list.innerHTML = rows.slice(0, 60).map(m => `
      <a class="movie-card" href="${m.url}" data-card data-title="${escapeHtml(m.title)}" data-tags="${escapeHtml((m.tags||[]).join(' '))}" data-meta="${escapeHtml([m.year,m.region,m.type,m.genre].join(' '))}">
        <div class="poster"><img src="${m.cover}" alt="${escapeHtml(m.title)}"><span class="chip">${escapeHtml(m.year || '')}</span></div>
        <div class="content"><h3>${escapeHtml(m.title)}</h3><div class="meta-row"><span>${escapeHtml(m.region || '')}</span><span>·</span><span>${escapeHtml(m.type || '')}</span></div><p class="excerpt">${escapeHtml(m.one_line || '')}</p></div>
      </a>
    `).join('');
  };

  const apply = () => {
    const q = normalize(box.value);
    const rows = !q ? movies : movies.filter(m => normalize([m.title,m.region,m.type,m.genre,(m.tags||[]).join(' '),m.one_line].join(' ')).includes(q));
    render(rows);
    if (hint) hint.textContent = q ? `匹配：${box.value}` : '输入标题、地区、类型、标签即可检索全站影片。';
  };
  box.addEventListener('input', apply);
  apply();
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

window.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  bindMobileMenu();
  bindLocalSearch();
  bindPlayer();
  bindGlobalSearch();
});
