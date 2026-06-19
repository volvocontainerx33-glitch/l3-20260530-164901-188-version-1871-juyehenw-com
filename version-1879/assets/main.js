(() => {
  const toggle = document.querySelector(".mobile-toggle");
  const panel = document.querySelector(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll("[data-hero]").forEach((hero) => {
    const slides = [...hero.querySelectorAll(".hero-slide")];
    const dots = [...hero.querySelectorAll("[data-hero-dot]")];
    const next = hero.querySelector("[data-hero-next]");
    const prev = hero.querySelector("[data-hero-prev]");
    let index = 0;
    let timer = null;

    const show = (target) => {
      if (!slides.length) return;
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };

    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        show(i);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        start();
      });
    }

    show(0);
    start();
  });

  document.querySelectorAll(".filter-input").forEach((input) => {
    const scope = input.closest("section") || document;
    const items = [...scope.querySelectorAll(".filter-item")];

    input.addEventListener("input", () => {
      const value = input.value.trim().toLowerCase();
      items.forEach((item) => {
        const text = (item.dataset.filter || item.textContent || "").toLowerCase();
        item.classList.toggle("is-hidden", value && !text.includes(value));
      });
    });
  });

  const searchInput = document.getElementById("site-search-input");
  const searchResults = document.getElementById("search-results");
  const defaultGrid = document.querySelector(".search-default");

  if (searchInput && searchResults && Array.isArray(window.SITE_MOVIES)) {
    const params = new URLSearchParams(location.search);
    const initial = params.get("q") || "";
    searchInput.value = initial;

    const render = () => {
      const keyword = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = "";

      if (!keyword) {
        if (defaultGrid) defaultGrid.hidden = false;
        return;
      }

      if (defaultGrid) defaultGrid.hidden = true;

      const results = window.SITE_MOVIES.filter((movie) => {
        const text = [movie.title, movie.year, movie.region, movie.genre, ...(movie.tags || [])].join(" ").toLowerCase();
        return text.includes(keyword);
      }).slice(0, 80);

      searchResults.innerHTML = results.map((movie) => `
        <a class="search-result-card" href="${movie.url}">
          <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
          <span>
            <h3>${escapeHtml(movie.title)}</h3>
            <p>${escapeHtml(movie.line || "")}</p>
            <span>${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.genre)}</span>
          </span>
        </a>
      `).join("");
    };

    searchInput.addEventListener("input", render);
    render();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      "\"": "&quot;"
    }[char]));
  }
})();
