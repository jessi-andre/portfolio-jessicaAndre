// NAV MOBILE
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navList.classList.toggle('nav-open');
  });
}

// TABS seccion Trabajo
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
//  SUBMENÚ TRABAJO -> HOVER + CAMBIO DE TABS
// -------------------------

const hasSubmenu = document.querySelector('.has-submenu');
const submenuLinks = document.querySelectorAll('.nav-submenu-link');

if (hasSubmenu) {
  // Abrir al entrar con el mouse y cerrar al salir (desktop)
  hasSubmenu.addEventListener('mouseenter', () => {
    hasSubmenu.classList.add('submenu-open');
  });

  hasSubmenu.addEventListener('mouseleave', () => {
    hasSubmenu.classList.remove('submenu-open');
  });
}

// Cuando hago click en un item del submenú:
// - Salto a la sección Trabajo
// - Activo la tab correcta
// - Cierro el menú mobile si estaba abierto
submenuLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const targetSelector = link.dataset.tabTarget;

    if (targetSelector) {
      tabButtons.forEach((btn) => {
        if (btn.dataset.tabTarget === targetSelector) {
          btn.click(); // activa la tab correspondiente
        }
      });
    }

    if (hasSubmenu) {
      hasSubmenu.classList.remove('submenu-open');
    }
    if (navList) {
      navList.classList.remove('nav-open');
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
