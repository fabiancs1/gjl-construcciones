/**
 * data.js — Fuente única de datos de proyectos del sitio GJL Construcciones.
 * Mantener el contenido aquí permite escalar (agregar/editar proyectos)
 * sin tocar el HTML ni la lógica de render.
 */
const GJL_PROJECTS = [
  {
    id: "bonaire-tenerife",
    nombre: "16 viviendas · Urbanización Tenerife",
    cliente: "Urbanizadora Bonaire S.A.S.",
    ubicacion: "Norte de Santander",
    fecha: "Agosto de 2022",
    tipo: "Construcción de vivienda",
    alcance: "Mano de obra para la construcción de 16 viviendas residenciales.",
    estado: "entregado",
    estadoLabel: "Entregado",
    fotos: [
      { src: "img/obra/bonaire-01-viviendas.jpg", alt: "Viviendas en construcción, urbanización Tenerife" },
      { src: "img/obra/bonaire-02-cimentacion.jpg", alt: "Cimentación de una de las viviendas" },
      { src: "img/obra/bonaire-03-via-interna.jpg", alt: "Vía interna pavimentada entre viviendas" }
    ]
  },
  {
    id: "bellagro-tramontti",
    nombre: "Cajas sanitarias · Proyecto Tramontti",
    cliente: "Constructora Bellagro",
    ubicacion: "Norte de Santander",
    fecha: "Octubre de 2022",
    tipo: "Redes sanitarias",
    alcance: "Mano de obra para la construcción de cajas sanitarias.",
    estado: "entregado",
    estadoLabel: "Entregado",
    fotos: [
      { src: "img/obra/bellagro-01-caja-sanitaria.jpg", alt: "Caja sanitaria en excavación, proyecto Tramontti" }
    ]
  },
  {
    id: "alamos-chinacota",
    nombre: "Redes de acueducto · Los Álamos",
    cliente: null,
    ubicacion: "Chinácota, Norte de Santander",
    fecha: null,
    tipo: "Redes de acueducto",
    alcance: "Mano de obra para la construcción de redes de acueducto.",
    estado: "entregado",
    estadoLabel: "Entregado",
    fotos: [
      { src: "img/obra/alamos-01-red-acueducto.jpg", alt: "Instalación de tubería de acueducto" },
      { src: "img/obra/alamos-02-red-acueducto.jpg", alt: "Trabajadores instalando red de acueducto" },
      { src: "img/obra/alamos-03-excavacion.jpg", alt: "Excavación manual para red de acueducto" }
    ]
  }
];

// Exponer en window para consumo por otros scripts (proyectos.js)
if (typeof window !== "undefined") {
  window.GJL_PROJECTS = GJL_PROJECTS;
}
