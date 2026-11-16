// ---------- GJL Construcciones · common.js ----------
document.addEventListener('DOMContentLoaded', () => {

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Video de fondo del hero: solo se carga y reproduce en pantallas grandes
     y si el usuario no pidió reducir el movimiento (preload="none" en el
     HTML evita que se descargue de entrada; aquí decidimos si vale la pena). */
  const heroVideo = document.querySelector('.hero-video');
  const canAutoplayVideo = window.matchMedia('(min-width: 861px)').matches;
  if(heroVideo && !prefersReduced && canAutoplayVideo){
    const heroVideoIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){ heroVideo.play().catch(() => {}); }
        else { heroVideo.pause(); }
      });
    }, { threshold: 0.1 });
    heroVideoIo.observe(heroVideo);
  }

  /* Barra fina de progreso de lectura, fija arriba de todo — un toque
     mas de animacion ligada al scroll general de la pagina, sin ser
     invasiva (solo un ancho que crece, acento de marca). */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progressBar);
  const updateScrollProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) * 100 : 0;
    progressBar.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);
  updateScrollProgress();

  /* Header shadow on scroll */
  const header = document.querySelector('header');
  if(header){
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });
  }

  /* Menu movil (hamburguesa): en el breakpoint de 860px .navlinks y
     .nav-right pasan a ocultarse por CSS hasta que header tiene
     .menu-open — este boton es el unico que la agrega/quita. */
  const menuToggle = document.querySelector('.menu-toggle');
  if(header && menuToggle){
    const closeMenu = () => {
      header.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    };
    menuToggle.addEventListener('click', () => {
      const open = header.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    header.querySelectorAll('.navlinks a, .nav-right a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if(window.innerWidth > 860) closeMenu();
    });
  }

  /* Reveal on scroll, with stagger per container */
  const seen = new Map();
  document.querySelectorAll('.reveal').forEach(el => {
    const parent = el.parentElement;
    const key = parent ? parent : document.body;
    const idx = seen.get(key) || 0;
    seen.set(key, idx + 1);
    if(!prefersReduced){
      el.style.transitionDelay = Math.min(idx * 70, 350) + 'ms';
    }
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('in');
        const icon = e.target.querySelector('.serv-icon');
        if(icon) icon.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  document.querySelectorAll('.serv-icon').forEach(icon => icon.classList.add('draw'));

  /* Animated counters for stats */
  function animateCounter(el){
    const raw = el.textContent.trim();
    const match = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if(!match){ return; }
    const [, prefix, numStr, suffix] = match;
    const cleanNum = numStr.replace(/\./g, '').replace(',', '.');
    const target = parseFloat(cleanNum);
    if(isNaN(target)){ return; }
    const hasThousandDot = numStr.includes('.') && !numStr.includes(',');
    const duration = 1100;
    const start = performance.now();

    function format(value){
      let intVal = Math.round(value);
      if(hasThousandDot){
        return intVal.toLocaleString('es-CO');
      }
      return String(intVal);
    }

    function frame(now){
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + format(target * eased) + suffix;
      if(t < 1){ requestAnimationFrame(frame); }
      else { el.textContent = prefix + format(target) + suffix; }
    }
    if(prefersReduced){
      el.textContent = raw;
    } else {
      requestAnimationFrame(frame);
    }
  }

  const statIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        animateCounter(e.target);
        statIo.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat .num').forEach(el => statIo.observe(el));

  /* Copy to clipboard buttons */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      try{
        await navigator.clipboard.writeText(value);
        const original = btn.textContent;
        btn.textContent = 'Copiado';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1600);
      }catch(err){
        btn.textContent = value;
      }
    });
  });

  /* Timeline progress line synced to scroll */
  const timeline = document.querySelector('.timeline');
  if(timeline){
    const progress = document.createElement('div');
    progress.className = 'tl-progress';
    timeline.appendChild(progress);
    const updateProgress = () => {
      const rect = timeline.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const visible = Math.min(Math.max(viewportH - rect.top, 0), rect.height);
      const pct = Math.min((visible / rect.height) * 100, 100);
      progress.style.height = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  /* Paso a paso de "Proceso" (riel + marcador), sincronizado con el
     scroll en ambas direcciones — se recalcula en cada evento de
     scroll, asi que sube y baja solo con la posicion real, sin pasos
     "de una sola vez" que no se puedan revertir. */
  const stages = document.querySelector('.stages');
  if(stages){
    const rail = stages.querySelector('.stages-rail');
    const fill = stages.querySelector('.stages-fill');
    const marker = stages.querySelector('.stages-marker');
    const items = Array.from(stages.querySelectorAll('.stage-item'));
    const isHorizontal = stages.classList.contains('stages-h');
    const list = stages.querySelector('.stages-list');

    if(prefersReduced){
      if(isHorizontal){ fill.style.width = '100%'; marker.style.left = '100%'; }
      else { fill.style.height = '100%'; marker.style.top = '100%'; }
      items.forEach(item => item.classList.add('active'));
    } else if(isHorizontal && list){
      /* La rueda vertical del mouse no mueve un overflow-x horizontal
         por si sola (no es comportamiento nativo del navegador) — hay
         que convertir el deltaY en scrollLeft a mano. Solo se intercepta
         mientras quede recorrido horizontal en esa direccion; al llegar
         a cualquiera de los extremos el scroll vuelve a pasar de largo
         hacia la pagina, para no "atrapar" al usuario dentro del riel. */
      list.addEventListener('wheel', (e) => {
        const maxScroll = list.scrollWidth - list.clientWidth;
        if(maxScroll <= 0) return;
        const atStart = list.scrollLeft <= 0;
        const atEnd = list.scrollLeft >= maxScroll - 1;
        if((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
        e.preventDefault();
        list.scrollLeft += e.deltaY;
      }, { passive: false });

      /* Arrastrar con el mouse (clic + mover), para que la interaccion
         sea obvia sin depender de que alguien adivine lo de la rueda. */
      let isDragging = false, dragStartX = 0, dragStartScroll = 0, dragMoved = false;
      list.addEventListener('mousedown', (e) => {
        isDragging = true; dragMoved = false;
        dragStartX = e.clientX;
        dragStartScroll = list.scrollLeft;
        list.classList.add('dragging');
      });
      window.addEventListener('mousemove', (e) => {
        if(!isDragging) return;
        const delta = e.clientX - dragStartX;
        if(Math.abs(delta) > 4) dragMoved = true;
        list.scrollLeft = dragStartScroll - delta;
      });
      window.addEventListener('mouseup', () => {
        if(!isDragging) return;
        isDragging = false;
        list.classList.remove('dragging');
      });
      /* Si hubo arrastre real, cancelar el click del enlace debajo
         (evita navegar a servicios.html por accidente al soltar). */
      list.addEventListener('click', (e) => {
        if(dragMoved){ e.preventDefault(); e.stopPropagation(); dragMoved = false; }
      }, true);

      /* Botones de flecha — avanzan/retroceden una fase (un ancho de
         tarjeta) con scroll suave; visible y obvio, sin depender de que
         alguien descubra el arrastre o la rueda por su cuenta. */
      const navBtns = stages.querySelectorAll('.stages-nav-btn');
      const stepWidth = () => (items[0] ? items[0].getBoundingClientRect().width + 1 : 440);
      navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const dir = parseInt(btn.dataset.dir, 10) || 1;
          list.scrollBy({ left: dir * stepWidth(), behavior: prefersReduced ? 'auto' : 'smooth' });
        });
      });

      /* Progreso atado al scrollLeft del propio contenedor (no a la
         posicion de la pagina) — se mueve al desplazar la rueda del
         mouse con el cursor encima, igual que el viejo carrusel. */
      const updateStagesH = () => {
        const maxScroll = list.scrollWidth - list.clientWidth;
        const pct = maxScroll > 0 ? Math.min(Math.max(list.scrollLeft / maxScroll, 0), 1) * 100 : 0;
        fill.style.width = pct + '%';
        marker.style.left = pct + '%';

        navBtns.forEach(btn => {
          const dir = parseInt(btn.dataset.dir, 10) || 1;
          btn.disabled = dir < 0 ? list.scrollLeft <= 0 : list.scrollLeft >= maxScroll - 1;
        });

        const listRect = list.getBoundingClientRect();
        const activationLine = listRect.left + listRect.width * 0.3;
        items.forEach(item => {
          const itemRect = item.getBoundingClientRect();
          item.classList.toggle('active', itemRect.left < activationLine);
        });
      };
      list.addEventListener('scroll', updateStagesH, { passive: true });
      window.addEventListener('resize', updateStagesH);
      updateStagesH();
    } else {
      const updateStages = () => {
        const railRect = rail.getBoundingClientRect();
        const activationLine = window.innerHeight * 0.6;
        let progress = railRect.height > 0 ? (activationLine - railRect.top) / railRect.height : 0;
        progress = Math.min(Math.max(progress, 0), 1);
        const pct = progress * 100;
        fill.style.height = pct + '%';
        marker.style.top = pct + '%';

        items.forEach(item => {
          const itemRect = item.getBoundingClientRect();
          const itemLine = itemRect.top + itemRect.height * 0.25;
          item.classList.toggle('active', itemLine < activationLine);
        });
      };
      window.addEventListener('scroll', updateStages, { passive: true });
      window.addEventListener('resize', updateStages);
      updateStages();
    }
  }

  /* Carrusel de servicios (home) — arrastre con el mouse + cursor
     circular + barra de progreso, igual funcionamiento que la galeria
     "Interiors" de thenest.pl/en. Nada se mueve solo: todo lo controla
     quien visita, arrastrando con el mouse (el scroll táctil nativo ya
     funciona solo en celular, no hace falta JS para eso). */
  const servCarousel = document.querySelector('.serv-carousel');
  const servTrack = document.querySelector('.serv-track');
  if(servCarousel && servTrack){
    const progressFill = document.querySelector('.serv-progress-fill');
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    const oneSetWidth = () => servTrack.scrollWidth / 2;

    const updateServProgress = () => {
      const w = oneSetWidth();
      if(!progressFill || w <= 0) return;
      const pct = (((servCarousel.scrollLeft % w) + w) % w) / w * 100;
      progressFill.style.width = pct + '%';
    };

    /* Loop infinito: al cruzar el ancho de una copia, se reacomoda el
       scroll en silencio (sin animación) para que arrastrar en cualquier
       dirección nunca llegue a un borde real. */
    servCarousel.addEventListener('scroll', () => {
      const w = oneSetWidth();
      if(w > 0){
        if(servCarousel.scrollLeft >= w){ servCarousel.scrollLeft -= w; }
        else if(servCarousel.scrollLeft <= 0){ servCarousel.scrollLeft += w; }
      }
      updateServProgress();
    }, { passive: true });

    // Arranca a mitad del primer tramo para poder arrastrar hacia los dos lados desde el inicio.
    requestAnimationFrame(() => {
      servCarousel.scrollLeft = 1;
      updateServProgress();
    });

    // Cursor circular que reemplaza la flecha normal mientras hay mouse fino.
    let cursorEl = null;
    if(isFinePointer){
      cursorEl = document.createElement('div');
      cursorEl.className = 'carousel-cursor';
      cursorEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cursorEl);
      servCarousel.classList.add('has-custom-cursor');
      servCarousel.addEventListener('mouseenter', () => cursorEl.classList.add('visible'));
      servCarousel.addEventListener('mouseleave', () => cursorEl.classList.remove('visible'));
      servCarousel.addEventListener('mousemove', (e) => {
        cursorEl.style.left = e.clientX + 'px';
        cursorEl.style.top = e.clientY + 'px';
      });
    }

    let isDraggingServ = false, servStartX = 0, servStartScroll = 0, servMoved = false;
    servCarousel.addEventListener('mousedown', (e) => {
      isDraggingServ = true; servMoved = false;
      servStartX = e.clientX;
      servStartScroll = servCarousel.scrollLeft;
      servCarousel.classList.add('dragging');
      if(cursorEl) cursorEl.classList.add('dragging');
    });
    window.addEventListener('mousemove', (e) => {
      if(isDraggingServ){
        const delta = e.clientX - servStartX;
        if(Math.abs(delta) > 4) servMoved = true;
        servCarousel.scrollLeft = servStartScroll - delta;
      }
    });
    window.addEventListener('mouseup', () => {
      if(!isDraggingServ) return;
      isDraggingServ = false;
      servCarousel.classList.remove('dragging');
      if(cursorEl) cursorEl.classList.remove('dragging');
    });
    /* Si hubo arrastre real, cancelar el click de la tarjeta debajo
       (evita navegar a servicios.html por accidente al soltar). */
    servCarousel.addEventListener('click', (e) => {
      if(servMoved){ e.preventDefault(); e.stopPropagation(); servMoved = false; }
    }, true);

    updateServProgress();
    window.addEventListener('resize', updateServProgress);
  }

  /* Back-to-top button */
  const topBtn = document.createElement('button');
  topBtn.className = 'back-to-top';
  topBtn.setAttribute('aria-label', 'Volver arriba');
  topBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13V3M8 3L3 8M8 3L13 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(topBtn);
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
  window.addEventListener('scroll', () => {
    topBtn.classList.toggle('visible', window.scrollY > 480);
  }, { passive: true });

  /* Botón "Ver fotos" de cada servicio (servicios.html) — arranca solo
     con texto, igual que la sección "In the building" de thenest.pl, y
     la foto aparece al pulsar (eso sí, no estaba en la referencia). */
  document.querySelectorAll('.serv-visual.photo-duo .sv-expand').forEach(btn => {
    const visual = btn.closest('.serv-visual');
    const label = btn.querySelector('.sv-expand-label');
    btn.addEventListener('click', () => {
      const isOpen = visual.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', String(isOpen));
      if(label) label.textContent = isOpen ? 'Ocultar fotos' : 'Ver fotos';
    });
  });

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if(!question || !answer) return;
    question.setAttribute('aria-expanded', 'false');
    question.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      question.setAttribute('aria-expanded', String(isOpen));
      answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : null;
    });
  });

});

/* Toast notifications — disponible globalmente como window.showToast */
window.showToast = function(message, type){
  let container = document.querySelector('.toast-container');
  if(!container){
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast' + (type === 'error' ? ' toast-error' : '');
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('in'));
  setTimeout(() => {
    toast.classList.remove('in');
    setTimeout(() => toast.remove(), 300);
  }, 3800);
};
