/**
 * terrain.js — Malla de elevación interactiva del hero.
 * Dibuja una grilla de "hachuras" (marcas de pendiente, técnica cartográfica
 * real) sobre un terreno generado con ondas superpuestas. Al mover el cursor,
 * el terreno se "levanta" alrededor del puntero, como si se estuviera
 * escaneando con una estación total, y un lector muestra coordenadas y
 * elevación simuladas en esa posición.
 */
(function () {
  const canvas = document.querySelector(".hero-terrain");
  const heroSection = document.querySelector(".hero");
  if (!canvas || !heroSection) return;

  const ctx = canvas.getContext("2d");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  const readout = document.querySelector(".terrain-readout");

  const SPACING = 30;
  const RADIUS = 170;

  let width = 0, height = 0, dpr = 1;
  let points = [];
  let t = 0;
  let rafId = null;
  let targetAlpha = 0;
  const mouse = { x: -9999, y: -9999, active: false };

  function buildGrid() {
    const cols = Math.ceil(width / SPACING) + 1;
    const rows = Math.ceil(height / SPACING) + 1;
    points = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        points.push({ x: i * SPACING, y: j * SPACING, boost: 0 });
      }
    }
  }

  function resize() {
    const rect = heroSection.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGrid();
  }

  function baseElevation(x, y, time) {
    const n =
      Math.sin(x * 0.006 + time * 0.12) * 0.5 +
      Math.cos(y * 0.008 - time * 0.09) * 0.5 +
      Math.sin((x + y) * 0.004 + time * 0.06) * 0.35 -
      Math.cos((x - y) * 0.005 - time * 0.05) * 0.25;
    return (n + 1.6) / 3.2; // ~0..1
  }

  /* Mira de punto de control: un pequeno retículo tipo "target" de
     estación total que sigue el cursor — sutil (lineas finas, alpha
     bajo), coherente con el gremio (topografía) en vez de un circulo
     decorativo generico. Se desvanece con un lerp propio, aparte de
     la transicion CSS del lector de coordenadas. */
  function drawTarget() {
    const goal = mouse.active ? 1 : 0;
    targetAlpha += (goal - targetAlpha) * 0.15;
    if (targetAlpha < 0.004) return;

    const x = mouse.x, y = mouse.y;
    const r = 15;
    const gap = 5;
    const tick = 7;
    const a = targetAlpha * 0.5;

    ctx.save();
    ctx.strokeStyle = `rgba(201,98,42,${a.toFixed(3)})`;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y - r - gap); ctx.lineTo(x, y - r - gap - tick);
    ctx.moveTo(x, y + r + gap); ctx.lineTo(x, y + r + gap + tick);
    ctx.moveTo(x - r - gap, y); ctx.lineTo(x - r - gap - tick, y);
    ctx.moveTo(x + r + gap, y); ctx.lineTo(x + r + gap + tick, y);
    ctx.stroke();

    ctx.fillStyle = `rgba(201,98,42,${(targetAlpha * 0.85).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let k = 0; k < points.length; k++) {
      const p = points[k];
      const base = baseElevation(p.x, p.y, t);

      let targetBoost = 0;
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RADIUS) {
          targetBoost = Math.pow(1 - dist / RADIUS, 2) * 0.95;
        }
      }
      p.boost += (targetBoost - p.boost) * 0.12;

      const elev = Math.min(1, base * 0.5 + p.boost);
      const len = 3 + elev * 14;
      const alpha = 0.1 + elev * 0.4;

      const mix = Math.min(1, elev * 1.3);
      const r = Math.round(43 + (201 - 43) * mix);
      const g = Math.round(93 + (98 - 93) * mix);
      const b = Math.round(63 + (42 - 63) * mix);

      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - len / 2);
      ctx.lineTo(p.x, p.y + len / 2);
      ctx.stroke();
    }

    drawTarget();
  }

  function loop() {
    t += 0.6;
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function updateReadout(x, y) {
    if (!readout) return;
    const lat = 7.8951 + (height / 2 - y) * 0.00006;
    const lon = -72.5044 + (x - width / 2) * 0.00006;
    const elevVal = Math.round(300 + baseElevation(x, y, t) * 45);

    readout.querySelector(".tr-coords").textContent = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    readout.querySelector(".tr-elev").textContent = `${elevVal} msnm`;

    const offsetX = Math.min(x + 20, width - 190);
    const offsetY = Math.min(y + 20, height - 60);
    readout.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }

  if (isFinePointer) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
      if (readout) readout.style.opacity = "1";
      updateReadout(mouse.x, mouse.y);
    });
    heroSection.addEventListener("mouseleave", () => {
      mouse.active = false;
      if (readout) readout.style.opacity = "0";
    });
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();

  if (prefersReduced) {
    draw(); // un solo frame estático, sin animación continua
  } else {
    loop();
  }
})();
