// Cargar servicios desde archivos JSON del CMS
async function loadServicios() {
  try {
    // Cargar los tres servicios
    const [portfolio, landing, corporativa] = await Promise.all([
      fetch('/content/servicios/portfolio.json').then(r => r.json()),
      fetch('/content/servicios/landing.json').then(r => r.json()),
      fetch('/content/servicios/corporativa.json').then(r => r.json())
    ]);

    const servicios = [portfolio, landing, corporativa];
    const websBlock = document.querySelector('.webs-block');
    
    if (!websBlock) return;

    // Limpiar contenido existente
    websBlock.innerHTML = '';

    // Generar HTML para cada servicio
    servicios.forEach(servicio => {
      const article = document.createElement('article');
      article.className = 'web-item';
      
      article.innerHTML = `
        <div class="web-item-header">
          <h3 class="web-item-title">${servicio.titulo}</h3>
          <p class="web-item-description">${servicio.descripcion}</p>
          <ul class="web-item-features">
            ${servicio.caracteristicas.map(item => `<li>${item}</li>`).join('')}
          </ul>
          <div class="web-item-meta">
            <span class="web-meta-item">
              <strong>Inversión:</strong> 
              <span class="price-original">$${servicio.precio_original} USD</span> 
              <span class="price-promo">$${servicio.precio_promo} USD</span> 
              <em>(sin dominio ni hosting)</em>
            </span>
            <span class="web-meta-item"><strong>Entrega:</strong> ${servicio.entrega}</span>
            <span class="web-meta-item"><strong>Ejemplo:</strong> <a href="${servicio.ejemplo_url}" target="_blank" rel="noopener">${servicio.ejemplo_usuario}</a></span>
          </div>
        </div>
        <div class="content-card">
          <div class="content-card-image">
            <video class="content-card-video" src="${servicio.video}" controls playsinline preload="metadata"></video>
          </div>
        </div>
        <div class="web-item-cta">
          <a href="index.html#contacto" class="btn btn-primary btn-web">${servicio.cta_texto}</a>
        </div>
      `;
      
      websBlock.appendChild(article);
    });
  } catch (error) {
    console.error('Error cargando servicios:', error);
  }
}

// Cargar FAQ desde archivo JSON del CMS
async function loadFAQ() {
  try {
    const faqData = await fetch('/content/faq.json').then(r => r.json());
    const faqSection = document.querySelector('.faq-section');
    
    if (!faqSection || !faqData.preguntas) return;

    // Mantener el título, limpiar el resto
    faqSection.innerHTML = '<h3 class="faq-title">Preguntas frecuentes</h3>';

    // Generar HTML para cada pregunta
    faqData.preguntas.forEach(item => {
      const details = document.createElement('details');
      details.className = 'faq-item';
      
      details.innerHTML = `
        <summary class="faq-question">${item.pregunta}</summary>
        <p class="faq-answer">${item.respuesta}</p>
      `;
      
      faqSection.appendChild(details);
    });
  } catch (error) {
    console.error('Error cargando FAQ:', error);
  }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadServicios();
    loadFAQ();
  });
} else {
  loadServicios();
  loadFAQ();
}
