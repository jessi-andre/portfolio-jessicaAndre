// FORZAR SCROLL AL TOP AL CARGAR PÁGINA
// Deshabilitar scroll restoration del navegador
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Forzar scroll al top inmediatamente
if (!window.location.hash) {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

// También al cargar completamente la página
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, 0);
});

// NAV MOBILE
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

// Robustez: comprobar que ambos elementos existen antes de usar
if (navToggle && navList) {
  const closeNavMenu = () => {
    if (!navList.classList.contains('nav-open') && !navList.classList.contains('open')) return;
    navList.classList.remove('nav-open', 'open');
    navToggle.innerHTML = '☰';
    navToggle.setAttribute('aria-label', 'Abrir menú');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('nav-open');
    navList.classList.toggle('open', isOpen);
    // Cambiar ícono entre hamburguesa y cruz
    if (isOpen) {
      navToggle.innerHTML = '✕';
      navToggle.setAttribute('aria-label', 'Cerrar menú');
      navToggle.setAttribute('aria-expanded', 'true');
    } else {
      navToggle.innerHTML = '☰';
      navToggle.setAttribute('aria-label', 'Abrir menú');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNavMenu);
  });

  window.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) {
      closeNavMenu();
    }
  }, { passive: true });
}

// FOOTER YEAR
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// NETLIFY IDENTITY
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    if (!user) {
      window.netlifyIdentity.on("login", () => {
        document.location.href = "/admin/";
      });
    }
  });
}

// INTERACCIONES MODERNAS: CURSOR, PROGRESO Y REVEAL
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const cleanUrl = () => {
    if (history.replaceState) {
      history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  };

  const scrollToHashTarget = (hash) => {
    if (!hash) return;
    const target = document.querySelector(hash);
    if (!target) return;

    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });
    cleanUrl();
  };

  if (window.location.hash) {
    scrollToHashTarget(window.location.hash);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      cleanUrl();
    });
  });

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  const header = document.querySelector('.site-header');
  const updateScrollUi = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progressValue = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.transform = `scaleX(${Math.min(progressValue, 1)})`;
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  updateScrollUi();
  window.addEventListener('scroll', updateScrollUi, { passive: true });

  const revealTargets = document.querySelectorAll('section, .servicio-card, .experiencia-card, .content-block, .content-card, .webs-block');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    revealTargets.forEach((target) => target.classList.add('reveal-in'));
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
  }

  if (!reduceMotion && finePointer && window.innerWidth >= 900) {
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    document.body.classList.add('has-custom-cursor');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      document.body.classList.add('cursor-ready');
    }, { passive: true });

    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.querySelectorAll('a, button, input, textarea, select, .custom-select-trigger').forEach((item) => {
      item.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
      item.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });

    window.addEventListener('mouseleave', () => document.body.classList.remove('cursor-ready'));
    window.addEventListener('mouseenter', () => document.body.classList.add('cursor-ready'));
  }
});

// CARRUSEL EXPERIENCIA REAL
const experienciaCarousel = document.querySelector('.experiencia-carousel');
if (experienciaCarousel) {
  const track = experienciaCarousel.querySelector('.experiencia-track');
  const cards = Array.from(experienciaCarousel.querySelectorAll('.experiencia-card'));
  const prev = experienciaCarousel.querySelector('.experiencia-control--prev');
  const next = experienciaCarousel.querySelector('.experiencia-control--next');
  const dotsWrap = experienciaCarousel.querySelector('.experiencia-dots');
  let currentIndex = 0;

  const dots = cards.map((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'experiencia-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ver caso ${index + 1}`);
    dot.addEventListener('click', () => updateExperience(index));
    dotsWrap?.appendChild(dot);
    return dot;
  });

  const updateExperience = (index) => {
    if (!track || cards.length === 0) return;
    currentIndex = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    cards.forEach((card, cardIndex) => {
      card.classList.toggle('is-active', cardIndex === currentIndex);
      card.setAttribute('aria-hidden', String(cardIndex !== currentIndex));
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === currentIndex);
    });
  };

  prev?.addEventListener('click', () => updateExperience(currentIndex - 1));
  next?.addEventListener('click', () => updateExperience(currentIndex + 1));
  updateExperience(0);
}

// TABS seccion Proyectos
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.tabTarget);

    tabButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    tabPanels.forEach((panel) => panel.classList.remove('active'));

    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    if (target) {
      target.classList.add('active');
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
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
    trigger.setAttribute("aria-expanded", String(customSelect.classList.contains("open")));
  });

  // elegir opción
  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("selected"));
      item.classList.add("selected");

      label.textContent = item.textContent;
      hidden.value = item.dataset.value || "";
      trigger.classList.add("selected");

      customSelect.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    });
  });

  // cerrar al clickear afuera o presionar Escape/Tab
  document.addEventListener("click", (e) => {
    if (!customSelect.contains(e.target)) {
      customSelect.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!customSelect.classList.contains("open")) return;
    if (e.key === "Escape" || e.key === "Tab") {
      customSelect.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      if (e.key === "Escape") trigger.focus();
    }
  });

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

// FORM SUBMISSION FEEDBACK
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando…';
    submitBtn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        form.innerHTML = '<div class="form-success"><p>¡Mensaje enviado! Te contacto pronto.</p></div>';
      } else {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Hubo un error al enviar. Intentá de nuevo o escribime por WhatsApp.');
      }
    } catch {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      alert('Sin conexión. Intentá de nuevo.');
    }
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
    threshold: 0.1 // 10% del video debe estar visible para no pausar
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
