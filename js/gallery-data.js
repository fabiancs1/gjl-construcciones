/**
 * gallery-data.js — Galería ampliada y videos de obra de proyectos.html.
 * Generado por el panel de administración (admin/publish.php) — editar desde admin/galeria.php.
 */
const GJL_GALLERY = {
  fotos: [
  { src: "img/obra/estructura-02-losa.jpg", alt: "Losa de cimentación con malla de refuerzo", cap: "Estructura de concreto", tall: true },
  { src: "img/obra/muro-contencion.jpg", alt: "Muro de contención en ladera", cap: "Muro de contención", tall: false },
  { src: "img/obra/urbanismo-anden.jpg", alt: "Andén en construcción junto a zona deportiva", cap: "Urbanismo · Andenes", tall: false },
  { src: "img/campo/campo-04.jpg", alt: "Equipo GNSS-RTK en escenario deportivo", cap: "Topografía urbana", tall: true },
  { src: "img/campo/campo-07.jpg", alt: "Equipo GNSS-RTK en zona rural con ganado", cap: "Topografía rural", tall: false },
  { src: "img/obra/topografia-estacion-total.jpg", alt: "Estación total en campo abierto", cap: "Estación total", tall: false },
  { src: "img/campo/campo-06.jpg", alt: "Topógrafa trabajando en terreno de Chinácota", cap: "Equipo en campo · Chinácota", tall: true },
  { src: "img/campo/campo-08.jpg", alt: "Equipo GNSS-RTK junto a líneas de alta tensión", cap: "Levantamiento topográfico", tall: false }
  ],
  videos: [
  { src: "video/obra-01.mp4", poster: "img/obra/bonaire-01-viviendas.jpg", cap: "Registro de obra 1" },
  { src: "video/obra-02.mp4", poster: "img/obra/estructura-02-losa.jpg", cap: "Registro de obra 2" },
  { src: "video/obra-03.mp4", poster: "img/obra/obra-movimiento-tierras.jpg", cap: "Registro de obra 3" },
  { src: "video/obra-04.mp4", poster: "img/campo/campo-09.jpg", cap: "Registro de campo 4" }
  ]
};

if (typeof window !== "undefined") {
  window.GJL_GALLERY = GJL_GALLERY;
}
