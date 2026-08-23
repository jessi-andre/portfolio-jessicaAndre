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
    const _hash = window.location.hash;
    window.addEventListener('load', () => {
      setTimeout(() => scrollToHashTarget(_hash), 200);
    });
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

  const revealTargets = document.querySelectorAll('section, .servicio-card, .experiencia-card, .testimonio-card, .content-block, .content-card, .webs-block');
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
  const viewport = experienciaCarousel.querySelector('.experiencia-viewport');
  let currentIndex = 0;
  let dots = [];
  let dragStartX = 0;
  let dragDeltaX = 0;
  let isDragging = false;

  const getExperienceStep = () => {
    if (!cards[0]) return 0;
    const trackStyles = window.getComputedStyle(track);
    return cards[0].offsetWidth + parseFloat(trackStyles.columnGap || trackStyles.gap || 0);
  };

  const getVisibleExperienceCards = () => {
    const step = getExperienceStep();
    const viewport = experienciaCarousel.querySelector('.experiencia-viewport');
    if (!viewport || step === 0) return 1;
    return Math.max(1, Math.round(viewport.offsetWidth / step));
  };

  const getMaxExperienceIndex = () => Math.max(cards.length - getVisibleExperienceCards(), 0);

  const setExperiencePosition = (offset = 0) => {
    if (!track) return;
    const distance = currentIndex * getExperienceStep() - offset;
    track.style.transform = `translateX(-${distance}px)`;
  };

  const renderExperienceDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    dots = Array.from({ length: getMaxExperienceIndex() + 1 }, (_, index) => {
      const dot = document.createElement('button');
      dot.className = 'experiencia-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ver grupo de casos ${index + 1}`);
      dot.addEventListener('click', () => updateExperience(index));
      dotsWrap.appendChild(dot);
      return dot;
    });
  };

  const updateExperience = (index) => {
    if (!track || cards.length === 0) return;
    const maxIndex = getMaxExperienceIndex();
    currentIndex = index < 0 ? maxIndex : index > maxIndex ? 0 : index;
    setExperiencePosition();
    cards.forEach((card, cardIndex) => {
      const isVisible = cardIndex >= currentIndex && cardIndex < currentIndex + getVisibleExperienceCards();
      card.classList.toggle('is-active', cardIndex === currentIndex);
      card.classList.toggle('is-near', isVisible && cardIndex !== currentIndex);
      card.setAttribute('aria-hidden', String(!isVisible));
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === currentIndex);
    });
  };

  const rebuildExperience = () => {
    renderExperienceDots();
    currentIndex = Math.min(currentIndex, getMaxExperienceIndex());
    updateExperience(currentIndex);
  };

  prev?.addEventListener('click', () => updateExperience(currentIndex - 1));
  next?.addEventListener('click', () => updateExperience(currentIndex + 1));
  window.addEventListener('resize', rebuildExperience);

  viewport?.addEventListener('pointerdown', (event) => {
    if (event.target.closest('a, button')) return;
    isDragging = true;
    dragStartX = event.clientX;
    dragDeltaX = 0;
    viewport.classList.add('is-dragging');
    track.style.transition = 'none';
    viewport.setPointerCapture?.(event.pointerId);
  });

  viewport?.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    dragDeltaX = event.clientX - dragStartX;
    setExperiencePosition(dragDeltaX);
  });

  const endExperienceDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    viewport?.releasePointerCapture?.(event.pointerId);
    viewport?.classList.remove('is-dragging');
    track.style.transition = '';
    const threshold = Math.min(110, Math.max(46, getExperienceStep() * 0.18));
    if (dragDeltaX < -threshold) updateExperience(currentIndex + 1);
    else if (dragDeltaX > threshold) updateExperience(currentIndex - 1);
    else updateExperience(currentIndex);
  };

  viewport?.addEventListener('pointerup', endExperienceDrag);
  viewport?.addEventListener('pointercancel', endExperienceDrag);
  viewport?.addEventListener('lostpointercapture', () => {
    if (!isDragging) return;
    isDragging = false;
    viewport?.classList.remove('is-dragging');
    track.style.transition = '';
    updateExperience(currentIndex);
  });

  experienciaCarousel.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('pointerdown', (event) => event.stopPropagation());
    link.addEventListener('click', (event) => {
      if (Math.abs(dragDeltaX) > 8) event.preventDefault();
    });
  });

  rebuildExperience();
}

// TABS seccion Proyectos
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

function updateTabIndicator(tabList, activeButton) {
  if (!tabList || !activeButton) return;
  tabList.style.setProperty('--tab-indicator-left', `${activeButton.offsetLeft}px`);
  tabList.style.setProperty('--tab-indicator-width', `${activeButton.offsetWidth}px`);
}

document.querySelectorAll('.tab-list').forEach((tabList) => {
  updateTabIndicator(tabList, tabList.querySelector('.tab-button.active'));
});

// MEDICIÓN DE CONVERSIONES Y NAVEGACIÓN CLAVE
document.addEventListener('DOMContentLoaded', () => {
  const trackEvent = (eventName, params = {}) => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params);
  };

  document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('click_whatsapp', { event_category: 'conversion', link_url: link.href });
    });
  });

  document.querySelectorAll('.experiencia-link[href]').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('click_proyecto', {
        event_category: 'engagement',
        project_name: link.closest('.experiencia-card')?.querySelector('.experiencia-nombre')?.textContent?.trim() || link.href,
        link_url: link.href
      });
    });
  });

  document.querySelectorAll('a[href*="instagram.com"]').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('click_instagram', { event_category: 'engagement', link_url: link.href });
    });
  });

  const contacto = document.querySelector('#contacto');
  if (contacto && 'IntersectionObserver' in window) {
    const contactoObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      trackEvent('view_contacto', { event_category: 'engagement' });
      contactoObserver.disconnect();
    }, { threshold: 0.35 });

    contactoObserver.observe(contacto);
  }
});

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.tabTarget);
    const tabList = button.closest('.tab-list');

    tabButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    tabPanels.forEach((panel) => panel.classList.remove('active'));

    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    if (tabList) {
      tabList.classList.remove('tab-list--portfolio', 'tab-list--landings', 'tab-list--corporativas');
      tabList.classList.add(`tab-list--${button.id.replace('tab-', '')}`);
      updateTabIndicator(tabList, button);
    }
    if (target) {
      target.classList.add('active');
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
});

window.addEventListener('resize', () => {
  document.querySelectorAll('.tab-list').forEach((tabList) => {
    updateTabIndicator(tabList, tabList.querySelector('.tab-button.active'));
  });
});

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

  const hubSpotEndpoint = 'https://api.hsforms.com/submissions/v3/integration/submit/51900546/b6131de4-0dbd-4dd1-92fe-e2ac951a6aa3';

  const getCookieValue = (name) => {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : '';
  };

  const submitToHubSpot = async (formData) => {
    const fields = [
      { name: 'firstname', value: (formData.get('nombre') || '').toString() },
      { name: 'email', value: (formData.get('email') || '').toString() },
      { name: 'mensaje_del_formulario', value: (formData.get('mensaje') || '').toString() }
    ].filter((field) => field.value.trim() !== '');

    const payload = {
      fields,
      context: {
        pageUri: window.location.href,
        pageName: document.title
      }
    };

    const hutk = getCookieValue('hubspotutk');
    if (hutk) {
      payload.context.hutk = hutk;
    }

    const response = await fetch(hubSpotEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HubSpot Forms API responded with ${response.status}`);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.dataset.submitting === 'true') return;
    form.dataset.submitting = 'true';

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    const formData = new FormData(form);
    submitBtn.textContent = 'Enviando…';
    submitBtn.disabled = true;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'submit_contacto', { event_category: 'conversion' });
    }

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'formulario_enviado', { event_category: 'conversion' });
        }
        submitToHubSpot(formData).catch((error) => {
          console.error('HubSpot form submission failed:', error);
        });
        form.innerHTML = '<div class="form-success"><p>¡Mensaje enviado! 🙌</p><small>Te escribo a la brevedad. Mientras tanto, podés escribirme por WhatsApp si necesitás respuesta urgente.</small></div>';
        form.querySelector('.form-success').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'formulario_error', { event_category: 'conversion' });
        }
        form.dataset.submitting = 'false';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Hubo un error al enviar. Intentá de nuevo o escribime por WhatsApp.');
      }
    } catch {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'formulario_error_conexion', { event_category: 'conversion' });
      }
      form.dataset.submitting = 'false';
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

// BOTON VOLVER ARRIBA
document.addEventListener('DOMContentLoaded', () => {
  const backToTop = document.querySelector('.back-to-top');
  if (!backToTop) return;

  const toggleBackToTop = () => {
    backToTop.classList.toggle('is-visible', window.scrollY > 420);
  };

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
});
