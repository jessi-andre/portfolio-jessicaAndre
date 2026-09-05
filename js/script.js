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

// INTERACCIONES MODERNAS: PROGRESO Y REVEAL
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const header = document.querySelector('.site-header');
  const updateScrollUi = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  updateScrollUi();
  window.addEventListener('scroll', updateScrollUi, { passive: true });
});

// ====================================================================
// REVEAL ON SCROLL — animación de una sola vez (blur+scale+translate → normal).
// Sin librerías. Idempotente. No deja NINGÚN estado permanente en el DOM.
//
// Ajustes rápidos:
//   DURATION_MS  -> duración de la transición (debe coincidir con la
//                   variable --reveal-duration en css/style.css)
//   STAGGER_MS   -> demora entre elementos hermanos (mismo padre)
// El blur inicial y el easing se definen en CSS (--reveal-blur /
// --reveal-easing), no acá, para que el único "source of truth" del
// look sea el CSS.
// ====================================================================
(function initReveal() {
  // Idempotente: si ya se inicializó (ej. se vuelve a incluir el script),
  // no se crean observers duplicados.
  if (window.__revealInitialized) return;
  window.__revealInitialized = true;

  const DURATION_MS = 700; // ajustar junto con --reveal-duration en CSS
  const STAGGER_MS = 80;   // demora entre hermanos del mismo contenedor

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Con reduced-motion, o sin soporte de IntersectionObserver, no se toca
  // el DOM: [data-reveal] nunca recibe la clase que lo oculta, así que el
  // contenido queda visible tal cual está escrito en el HTML.
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const run = () => {
    const targets = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!targets.length) return;

    // El filter/transform de la animación crea un containing block nuevo;
    // si un elemento contiene (o es) position:fixed/sticky, esos hijos se
    // romperían mientras dura la animación. Se excluyen por completo.
    const hasFixedOrSticky = (el) => {
      const isFixedOrSticky = (node) => {
        const pos = getComputedStyle(node).position;
        return pos === 'fixed' || pos === 'sticky';
      };
      if (isFixedOrSticky(el)) return true;
      return Array.from(el.querySelectorAll('*')).some(isFixedOrSticky);
    };

    const eligible = targets.filter((el) => !hasFixedOrSticky(el));

    // Stagger por grupos de hermanos (mismo parentElement), no global,
    // para que cada grilla/sección tenga su propio ritmo de entrada.
    const siblingIndex = new Map();
    eligible.forEach((el) => {
      const parent = el.parentElement;
      const index = siblingIndex.get(parent) || 0;
      siblingIndex.set(parent, index + 1);
      el.style.setProperty('--reveal-delay', `${index * STAGGER_MS}ms`);
    });

    // Estado inicial: se agrega vía JS, nunca vive en CSS puro. Si este
    // script no llega a correr, [data-reveal] no tiene ningún estilo
    // asociado y el contenido se ve normal desde el primer render.
    eligible.forEach((el) => el.classList.add('is-revealable'));

    const cleanup = (el) => {
      el.classList.remove('is-revealable', 'is-animating');
      // Requisito no negociable: nada de blur/transform/opacity/will-change
      // inline debe sobrevivir a la animación.
      el.style.removeProperty('--reveal-delay');
      el.style.removeProperty('opacity');
      el.style.removeProperty('filter');
      el.style.removeProperty('transform');
      el.style.removeProperty('will-change');
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        obs.unobserve(el); // no se re-dispara al volver a scrollear

        requestAnimationFrame(() => {
          el.classList.add('is-animating');

          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            clearTimeout(fallbackTimer);
            el.removeEventListener('transitionend', onTransitionEnd);
            cleanup(el);
          };
          const onTransitionEnd = (event) => {
            // Ignorar transiciones de hijos (bubbling) y quedarse con una
            // sola propiedad como disparador, ya que las tres terminan juntas.
            if (event.target !== el || event.propertyName !== 'opacity') return;
            finish();
          };
          el.addEventListener('transitionend', onTransitionEnd);

          // Red de seguridad: si por lo que sea transitionend no llega a
          // disparar (elemento removido del DOM, tab en background, etc.),
          // igual se limpia el estado para no dejar nada permanente.
          const delay = parseFloat(el.style.getPropertyValue('--reveal-delay')) || 0;
          const fallbackTimer = setTimeout(finish, DURATION_MS + delay + 150);
        });
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    eligible.forEach((el) => observer.observe(el));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

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

  document.querySelectorAll('.portfolio-card[href]').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('click_proyecto', {
        event_category: 'engagement',
        project_name: link.querySelector('h3')?.textContent?.trim() || link.href,
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

        const isReserva = form.id === 'reservaForm';

        if (isReserva) {
          // A partir de acá el mensaje de éxito hace de único título:
          // se oculta el encabezado de arriba para no repetir el "listo".
          const reservaHeader = document.getElementById('reservaHeader');
          if (reservaHeader) reservaHeader.hidden = true;
        }

        const escapeHtml = (str) => str.replace(/[&<>"']/g, (c) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
        const primerNombre = (formData.get('nombre') || '').toString().trim().split(/\s+/)[0];
        const saludoNombre = primerNombre ? `, ${escapeHtml(primerNombre)}` : '';

        form.innerHTML = isReserva
          ? `<div class="form-success"><p>Listo, recibí tus datos 🙌</p><small>Nos vemos en la llamada${saludoNombre}.</small></div>`
          : '<div class="form-success"><p>¡Mensaje enviado! 🙌</p><small>Te escribo a la brevedad. Mientras tanto, puedes escribirme por WhatsApp si necesitas respuesta urgente.</small></div>';
        form.querySelector('.form-success').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'formulario_error', { event_category: 'conversion' });
        }
        form.dataset.submitting = 'false';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Hubo un error al enviar. Intenta de nuevo o escríbeme por WhatsApp.');
      }
    } catch {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'formulario_error_conexion', { event_category: 'conversion' });
      }
      form.dataset.submitting = 'false';
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      alert('Sin conexión. Intenta de nuevo.');
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

// CTA STICKY (home): aparece al pasar el hero, se oculta arriba del todo
// o cuando el CTA final / calendario ya está a la vista, para no duplicar.
document.addEventListener('DOMContentLoaded', () => {
  const stickyCta = document.querySelector('.sticky-cta');
  const heroEl = document.querySelector('.hero');
  if (!stickyCta || !heroEl) return;

  // Cualquier sección que ya muestre su propio "Agendar una llamada"
  // (el aside del FAQ y el CTA final) oculta la barra para no duplicar.
  const duplicateZones = Array.from(
    document.querySelectorAll('.faq-home-aside, .cta-final')
  );

  const isInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };

  const updateStickyCta = () => {
    const pastHero = heroEl.getBoundingClientRect().bottom <= 0;
    const nearDuplicate = duplicateZones.some(isInViewport);
    stickyCta.classList.toggle('is-visible', pastHero && !nearDuplicate);
  };

  updateStickyCta();
  window.addEventListener('scroll', updateStickyCta, { passive: true });
  window.addEventListener('resize', updateStickyCta);
});

// DETECCIÓN TECLADO vs MOUSE — el foco violeta (ver css/index.css) solo
// se muestra con .using-keyboard en <html>, para que nunca aparezca al
// hacer click con el mouse (Chrome sí marca foco en <a> al clickear).
(function () {
  const enableKeyboardFocus = (event) => {
    if (event.key === 'Tab') {
      document.documentElement.classList.add('using-keyboard');
    }
  };
  const disableKeyboardFocus = () => {
    document.documentElement.classList.remove('using-keyboard');
  };
  window.addEventListener('keydown', enableKeyboardFocus);
  window.addEventListener('mousedown', disableKeyboardFocus);
  window.addEventListener('touchstart', disableKeyboardFocus, { passive: true });
})();

// ====================================================================
// COOKIES — Google Analytics y HubSpot solo cargan si la persona acepta.
// Cada página trae sus propios data-ga / data-hubspot-id en <body> para
// indicar qué scripts corresponde ofrecer (no todas las páginas usan
// los dos). El consentimiento se guarda en localStorage y se puede
// revocar/reabrir desde el link "Cookies" del footer.
// ====================================================================
(function () {
  const STORAGE_KEY = 'ff_cookie_consent'; // 'accepted' | 'rejected'
  const GA_ID = document.body.dataset.ga;
  const HUBSPOT_ID = document.body.dataset.hubspot;

  const loadGoogleAnalytics = () => {
    if (!GA_ID || window.__gaLoaded) return;
    window.__gaLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  };

  const loadHubSpot = () => {
    if (!HUBSPOT_ID || window.__hsLoaded) return;
    window.__hsLoaded = true;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'hs-script-loader';
    script.async = true;
    script.defer = true;
    script.src = `//js.hs-scripts.com/${HUBSPOT_ID}.js`;
    document.body.appendChild(script);
  };

  const loadAnalytics = () => {
    loadGoogleAnalytics();
    loadHubSpot();
  };

  const getConsent = () => {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  };
  const setConsent = (value) => {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* modo privado, etc. */ }
  };

  let banner = null;

  const hideBanner = () => {
    if (!banner) return;
    banner.classList.remove('is-visible');
    const toRemove = banner;
    setTimeout(() => toRemove.remove(), 250);
    banner = null;
  };

  const buildBanner = () => {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML =
      '<p>Uso cookies de análisis (Google Analytics, HubSpot) para entender cómo se usa el sitio. Podés aceptarlas o rechazarlas.</p>' +
      '<div class="cookie-banner-actions">' +
        '<button type="button" class="cookie-btn cookie-btn--reject">Rechazar</button>' +
        '<button type="button" class="cookie-btn cookie-btn--accept">Aceptar</button>' +
      '</div>';
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('is-visible'));

    banner.querySelector('.cookie-btn--accept').addEventListener('click', () => {
      setConsent('accepted');
      loadAnalytics();
      hideBanner();
    });
    banner.querySelector('.cookie-btn--reject').addEventListener('click', () => {
      setConsent('rejected');
      hideBanner();
    });
  };

  const consent = getConsent();
  if (consent === 'accepted') {
    loadAnalytics();
  } else if (consent !== 'rejected') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildBanner);
    } else {
      buildBanner();
    }
  }

  document.querySelectorAll('[data-cookie-preferences]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      buildBanner();
    });
  });
})();
