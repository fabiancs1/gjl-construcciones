/**
 * proyectos.js — Render del listado de proyectos a partir de data.js.
 */
(function () {
  const grid = document.getElementById("proy-grid");
  if (!grid || typeof GJL_PROJECTS === "undefined") return;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function cardTemplate(p) {
    const badgeClass = p.estado === "entregado" ? "badge-done" : "badge-progress";
    const portada = p.fotos[0];
    const dataRows = [
      p.cliente ? `<div>Cliente<strong>${escapeHtml(p.cliente)}</strong></div>` : `<div>Tipo<strong>${escapeHtml(p.tipo)}</strong></div>`,
      p.fecha ? `<div>Fecha<strong>${escapeHtml(p.fecha)}</strong></div>` : `<div>Ubicación<strong>${escapeHtml(p.ubicacion)}</strong></div>`,
      `<div>Alcance<strong>Mano de obra</strong></div>`
    ].join("");

    return `
      <div class="proy-card reveal" data-id="${p.id}">
        <div class="proy-map">
          <img src="${portada.src}" alt="${escapeHtml(portada.alt)}" loading="lazy">
        </div>
        <div class="proy-body">
          <div class="proy-top">
            <h3>${escapeHtml(p.nombre)}</h3>
            <span class="badge ${badgeClass}">${p.estadoLabel}</span>
          </div>
          <p class="proy-loc">${escapeHtml(p.ubicacion)} · ${escapeHtml(p.tipo)}</p>
          <p style="color:var(--ink-soft); font-size:0.88rem; margin-bottom:16px;">${escapeHtml(p.alcance)}</p>
          <div class="proy-data">${dataRows}</div>
        </div>
      </div>`;
  }

  function render() {
    grid.innerHTML = GJL_PROJECTS.map(cardTemplate).join("");
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
  }

  render();
})();
