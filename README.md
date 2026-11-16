# GJL Construcciones — Sitio corporativo

Sitio estático multipágina para GJL Construcciones S.A.S. (construcción de obra civil y topografía, Cúcuta). Sin dependencias de build (HTML/CSS/JS puro), listo para desplegar en cualquier hosting estático (Netlify, Vercel, GitHub Pages, S3, etc.) o servir desde un backend.

## Estructura del proyecto

```
/
├── index.html          Inicio
├── servicios.html       Catálogo de servicios (6 fichas detalladas)
├── proyectos.html        Proyectos ejecutados (render dinámico desde js/data.js) + galería + videos
├── nosotros.html          Quiénes somos, misión, visión, valores corporativos
├── contacto.html           Formulario validado + mapa + FAQ (acordeón)
├── 404.html                 Página de error personalizada
├── css/
│   └── styles.css       Design system: variables, componentes, utilidades
├── js/
│   ├── data.js           Fuente única de datos de proyectos (editar aquí para agregar/quitar proyectos)
│   ├── proyectos.js       Render dinámico del listado de proyectos
│   ├── contacto.js         Validación de formulario + envío simulado
│   └── common.js           Comportamiento compartido (reveal, header, contadores, toasts, etc.)
├── img/
│   ├── campo/             Fotos reales de topografía en terreno (GNSS-RTK, estación total)
│   ├── obra/               Fotos reales de obra (cimentación, estructura, urbanismo)
│   └── clientes/            Logos reales de clientes (Moresa, Inurco)
└── video/                  Videos reales de obra (mp4)
```

## Cómo agregar un nuevo proyecto

Editar únicamente `js/data.js` y agregar un objeto al arreglo `GJL_PROJECTS` (incluyendo su arreglo `fotos`). La tarjeta se genera automáticamente en `proyectos.html` — no es necesario tocar el HTML.

## Cómo conectar el formulario a un backend real

`js/contacto.js` ya valida los campos en el cliente (nombre, correo, mensaje) e incluye un campo honeypot anti-spam (`website`). El bloque `setTimeout` que simula el envío debe reemplazarse por un `fetch()` real hacia el endpoint/API que reciba el formulario (por ejemplo un servicio de formularios, un backend propio, o una función serverless).

## Funcionalidades incluidas

- Diseño responsive, con sistema de variables CSS centralizado en `css/styles.css`.
- Navegación multipágina consistente (header/footer compartidos).
- Animaciones de scroll-reveal suaves (blur + escala + stagger automático).
- Contadores animados en cifras clave.
- Galería de fotos reales y videos de obra (`proyectos.html`, sección "Galería" del inicio).
- Mapa real embebido (OpenStreetMap) en la página de contacto.
- Formulario con validación en tiempo real, honeypot anti-spam y notificaciones tipo toast.
- FAQ en formato acordeón accesible (`aria-expanded`).
- Botón "volver arriba", copiar al portapapeles (correo/teléfono).
- Accesibilidad: skip-link, `:focus-visible`, `aria-live`, soporte `prefers-reduced-motion`.
- Favicon, meta Open Graph y `theme-color` para compartir en redes/navegadores.

## Datos de contacto reales

Correo `gjlconstrucciones@gmail.com` · Tel. 316 310 65 64 / 304 568 55 60 · Av 5 # 4-109, Urb. Molinos del Norte, Cúcuta, Norte de Santander. Fuente: portafolio de servicios entregado por el cliente.
