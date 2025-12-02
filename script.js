// FORZAR SCROLL AL TOP AL CARGAR PÁGINA
// Deshabilitar scroll restoration del navegador
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Forzar scroll al top inmediatamente
window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

// También al cargar completamente la página
window.addEventListener('load', () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 0);
});

// NAV MOBILE
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

// Robustez: comprobar que ambos elementos existen antes de usar
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    navList.classList.toggle('nav-open');
    // Cambiar ícono entre hamburguesa y cruz
    if (navList.classList.contains('nav-open')) {
      navToggle.innerHTML = '✕';
      navToggle.setAttribute('aria-label', 'Cerrar menú');
    } else {
      navToggle.innerHTML = '☰';
      navToggle.setAttribute('aria-label', 'Abrir menú');
    }
  });
}

// TABS seccion Proyectos
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.tabTarget);

    tabButtons.forEach((btn) => btn.classList.remove('active'));
    tabPanels.forEach((panel) => panel.classList.remove('active'));

    button.classList.add('active');
    if (target) target.classList.add('active');
  });
});

// -------------------------
// CUSTOM SELECT CONTACTO
// -------------------------

const customSelect = document.querySelector(".custom-select");

if (customSelect) {
  const trigger = customSelect.querySelector(".custom-select-trigger");
  const label   = customSelect.querySelector(".custom-select-label");
  const menu    = customSelect.querySelector(".custom-select-menu");
  const items   = menu.querySelectorAll("li");
  const hidden  = customSelect.querySelector("input[type='hidden']");

  // abrir / cerrar al hacer clic en el "pill"
  trigger.addEventListener("click", () => {
    customSelect.classList.toggle("open");
  });

  // elegir opción
  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("selected"));
      item.classList.add("selected");

      label.textContent = item.textContent;
      hidden.value = item.dataset.value || "";

      customSelect.classList.remove("open");
    });
  });

  // cerrar al clickear afuera
  document.addEventListener("click", (e) => {
    if (!customSelect.contains(e.target)) {
      customSelect.classList.remove("open");
    }
  });

  // cerrar cuando el mouse sale del menú (comportamiento tipo submenú nav)
  menu.addEventListener("mouseleave", () => {
    customSelect.classList.remove("open");
  });
}



// -------------------------
// AÑO FOOTER
// -------------------------

const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Simple carousel para `.content-card-image` que contengan múltiples `<img>`
document.addEventListener('DOMContentLoaded', () => {
  const galleries = document.querySelectorAll('.content-gallery .content-card-image');

  galleries.forEach((container) => {
    // ignorar si tiene video
    if (container.querySelector('video')) return;

    const imgs = Array.from(container.querySelectorAll('img'));
    if (imgs.length <= 1) return; // nada que hacer

    // convertir cada imagen en un slide
    const slides = imgs.map((img, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide' + (i === 0 ? ' active' : '');
      // mover la imagen dentro del slide
      slide.appendChild(img);
      return slide;
    });

    // limpiar contenedor y añadir slides
    container.innerHTML = '';
    slides.forEach((s) => container.appendChild(s));

    // controles
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'carousel-prev';
    prev.setAttribute('aria-label', 'Anterior');
    prev.textContent = '‹';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'carousel-next';
    next.setAttribute('aria-label', 'Siguiente');
    next.textContent = '›';

    container.appendChild(prev);
    container.appendChild(next);

    // dots
    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    slides.forEach((_, idx) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
      d.dataset.index = idx;
      d.addEventListener('click', () => show(idx));
      dots.appendChild(d);
    });
    container.appendChild(dots);

    let current = 0;
    function show(index) {
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
      const dotButtons = dots.querySelectorAll('.carousel-dot');
      dotButtons.forEach((b, i) => b.classList.toggle('active', i === index));
      current = index;
    }

    prev.addEventListener('click', () => show((current - 1 + slides.length) % slides.length));
    next.addEventListener('click', () => show((current + 1) % slides.length));

    // volver a la primera imagen cuando el cursor sale del carrusel
    container.addEventListener('mouseleave', () => {
      if (current !== 0) {
        show(0);
      }
    });

    // opción: autoplay lento (desactivado por defecto)
    // let autoplay = setInterval(() => next.click(), 5000);
    // container.addEventListener('mouseenter', () => clearInterval(autoplay));
  });

  // -------------------------
  // BOTÓN VER MÁS EN MÓVIL
  // -------------------------
  
  function setupVerMas() {
    // Solo en móvil (< 680px)
    if (window.innerWidth > 680) return;

    // Obtener todas las galerías y photo-grids
    const galleries = document.querySelectorAll('.content-gallery');
    const photoGrids = document.querySelectorAll('.photo-grid');

    galleries.forEach((gallery) => {
      // Solo si tiene más de 1 item
      const items = gallery.querySelectorAll('.content-card');
      if (items.length > 1) {
        const btn = document.createElement('button');
        btn.className = 'btn-ver-mas';
        btn.textContent = 'Ver más';
        btn.style.display = 'flex';
        
        // Insertar después de la galería
        gallery.parentNode.insertBefore(btn, gallery.nextSibling);

        btn.addEventListener('click', () => {
          gallery.classList.toggle('show-all');
          btn.textContent = gallery.classList.contains('show-all') ? 'Ver menos' : 'Ver más';
        });
      }
    });

    photoGrids.forEach((grid) => {
      const images = grid.querySelectorAll('img');
      if (images.length > 1) {
        const btn = document.createElement('button');
        btn.className = 'btn-ver-mas';
        btn.textContent = 'Ver más';
        btn.style.display = 'flex';
        
        grid.parentNode.insertBefore(btn, grid.nextSibling);

        btn.addEventListener('click', () => {
          grid.classList.toggle('show-all');
          btn.textContent = grid.classList.contains('show-all') ? 'Ver menos' : 'Ver más';
        });
      }
    });
  }

  // Ejecutar al cargar
  setupVerMas();

  // Ejecutar al cambiar tamaño de ventana
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Remover botones existentes
      document.querySelectorAll('.btn-ver-mas').forEach(btn => btn.remove());
      // Remover clases show-all
      document.querySelectorAll('.show-all').forEach(el => el.classList.remove('show-all'));
      // Recrear si es necesario
      setupVerMas();
    }, 250);
  });
});

// PHOTO GRID EXPAND
document.addEventListener('DOMContentLoaded', () => {
  const btnExpand = document.querySelector('.btn-photo-expand');
  const gridWrapper = document.querySelector('.photo-grid-wrapper');
  const grid = document.querySelector('.photo-grid');
  const photoSection = gridWrapper?.closest('.content-block');
  
  if (btnExpand && gridWrapper && grid) {
    btnExpand.addEventListener('click', () => {
      gridWrapper.classList.add('expanded');
      grid.classList.add('expanded');
    });

    // Detectar scroll fuera de la sección
    if (photoSection) {
      let lastScrollY = window.scrollY;
      
      window.addEventListener('scroll', () => {
        const sectionRect = photoSection.getBoundingClientRect();
        const isInView = sectionRect.top < window.innerHeight && sectionRect.bottom > 0;
        
        // Si la sección ya no está visible y estaba expandida
        if (!isInView && gridWrapper.classList.contains('expanded')) {
          gridWrapper.classList.remove('expanded');
          grid.classList.remove('expanded');
        }
      });
    }
  }
});

// -------------------------
// AUTO-PAUSAR VIDEOS AL HACER SCROLL
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
  const videos = document.querySelectorAll('video');
  
  if (videos.length === 0) return;

  // Configurar el Intersection Observer
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.5 // 50% del video debe estar visible
  };

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      
      if (!entry.isIntersecting) {
        // El video ya no está visible, pausarlo
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }, observerOptions);

  // Observar todos los videos
  videos.forEach(video => {
    videoObserver.observe(video);
  });
});
