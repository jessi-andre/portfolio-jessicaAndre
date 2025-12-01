// NAV MOBILE
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

// Robustez: comprobar que ambos elementos existen antes de usar
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    navList.classList.toggle('nav-open');
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

    // opción: autoplay lento (desactivado por defecto)
    // let autoplay = setInterval(() => next.click(), 5000);
    // container.addEventListener('mouseenter', () => clearInterval(autoplay));
  });
});
