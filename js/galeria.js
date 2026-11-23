/**
 * galeria.js — Render de la galería ampliada y los videos de obra de
 * proyectos.html, a partir de gallery-data.js. Mismo patrón que proyectos.js.
 */
(function () {
  if (typeof GJL_GALLERY === "undefined") return;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  const fotoGrid = document.getElementById("foto-grid");
  if (fotoGrid) {
    fotoGrid.innerHTML = GJL_GALLERY.fotos.map(f => `
      <div class="foto-item${f.tall ? " tall" : ""} reveal">
        <img src="${escapeHtml(f.src)}" alt="${escapeHtml(f.alt)}" loading="lazy">
        <span class="foto-cap">${escapeHtml(f.cap)}</span>
      </div>`).join("");
  }

  const videoGrid = document.getElementById("video-grid");
  if (videoGrid) {
    videoGrid.innerHTML = GJL_GALLERY.videos.map(v => `
      <div class="video-card reveal">
        <video controls preload="none" poster="${escapeHtml(v.poster)}">
          <source src="${escapeHtml(v.src)}" type="video/mp4">
        </video>
        <div class="video-cap"><span>${escapeHtml(v.cap)}</span></div>
      </div>`).join("");
  }

  [fotoGrid, videoGrid].forEach(grid => {
    if (!grid) return;
    grid.querySelectorAll(".reveal").forEach((el, idx) => {
      el.style.transitionDelay = Math.min(idx * 70, 350) + "ms";
      requestAnimationFrame(() => {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
          });
        }, { threshold: 0.12 });
        io.observe(el);
      });
    });
  });
})();
