/**
 * contact-data.js — Datos de contacto del sitio (teléfonos, correo, dirección, mapa).
 * Generado por el panel de administración (admin/publish.php) — editar desde admin/contacto.php.
 * Lo consume js/common.js para rellenar cualquier elemento con [data-contact]/[data-contact-href].
 */
const GJL_CONTACT = {
  whatsapp_url: "https://wa.me/573163106564",
  tel1_href: "tel:+573163106564",
  tel1_e164: "+573163106564",
  tel1_display: "316 310 65 64",
  tel2_href: "tel:+573045685560",
  tel2_e164: "+573045685560",
  tel2_display: "304 568 55 60",
  email: "gjlconstrucciones@gmail.com",
  email_href: "mailto:gjlconstrucciones@gmail.com",
  address_street: "Av 5 # 4-109, Urb. Molinos del Norte",
  address_short: "Av 5 # 4-109, Urb. Molinos del Norte, Cúcuta",
  address_full: "Av 5 # 4-109, Urb. Molinos del Norte, Cúcuta, Norte de Santander",
  hours: "Lunes a viernes, 7:00 a.m. – 5:00 p.m.",
  coverage: "Cúcuta y municipios de Norte de Santander",
  map_lat: "7.8939",
  map_lon: "-72.5078",
  map_iframe_src: "https://www.openstreetmap.org/export/embed.html?bbox=-72.5578,7.8439,-72.4578,7.9439&layer=mapnik&marker=7.8939,-72.5078",
  map_caption: "Oficina principal · Molinos del Norte, Cúcuta",
};

if (typeof window !== "undefined") {
  window.GJL_CONTACT = GJL_CONTACT;
}
