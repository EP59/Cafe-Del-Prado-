import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

export function initCarousel(data) {
  const catBtns = document.querySelectorAll('.filter-btn');
  const nameEl = document.getElementById('product-name');
  const priceEl = document.getElementById('product-price');
  const descEl = document.getElementById('product-description');
  const arBtn = document.getElementById('ar-view-btn');
  const arOverlay = document.getElementById('ar-container');


  let currentCategory = 'platillos';
  let currentItems = data[currentCategory];
  let swiperInstance = null;

  function renderCards(skipFade = false) {
    const stack = document.getElementById('cards-stack');
    const swiperContainer = document.querySelector('.product-swiper');
    if (!stack || !swiperContainer) return;
    
    // Transición de fade suave al actualizar el set de datos
    if (!skipFade) swiperContainer.style.opacity = '0';

    setTimeout(() => {
      stack.innerHTML = '';
      
      currentItems.forEach((item) => {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide', 'product-slide');
        
        const img = document.createElement('img');
        img.src = item.image;
        img.loading = "lazy"; // Lazy load selectivo administrado inteligentemente por el navegador
        
        slide.appendChild(img);
        
        // Elemento nativo de carga de Swiper
        const preloader = document.createElement('div');
        preloader.classList.add('swiper-lazy-preloader');
        slide.appendChild(preloader);
        
        stack.appendChild(slide);
      });

      if (swiperInstance) {
        swiperInstance.destroy(true, true);
      }

      // Inicialización de Swiper con EffectCreative (Estilo Stack Dinámico de Cartas)
      swiperInstance = new Swiper('.product-swiper', {
        loop: true, // Loop Infinito Real (bidireccional, matemática de anillo nativa)
        centeredSlides: true,
        slidesPerView: 'auto',
        effect: 'creative',
        creativeEffect: {
          limitProgress: 2, // Limitar renderizado para performance
          prev: {
            translate: ['-75%', 0, -100], // Desplazamiento lateral + atrás en Z
            scale: 0.85,
            opacity: 0.7
          },
          next: {
            translate: ['75%', 0, -100], 
            scale: 0.85,
            opacity: 0.7
          },
          active: {
            translate: [0, 0, 0], // Foco central
            scale: 1.1,           // Escala aumentada pedida
            opacity: 1
          }
        },
        keyboard: {
          enabled: true, // Soporte para flechas de teclado
        },
        mousewheel: {
          forceToAxis: true, // Scroll con la rueda del ratón de PC
        },
        slideToClickedSlide: true, // Clic en cartas laterales repiola a la vista central
        grabCursor: true, // Interacción Multidispositivo (inercia móvil + drag PC)
        on: {
          slideChange: updateProductInfo,
          init: () => {
             // Asegura fade back de la nueva instancia inicializada
             if (!skipFade) swiperContainer.style.opacity = '1'; 
          }
        }
      });

      updateProductInfo();
      swiperContainer.style.transition = 'opacity 0.4s ease'; // Aplica la métrica de transición limpia
      
    }, skipFade ? 0 : 300); // 300ms permite que el anterior se disuelva
  }

  function updateProductInfo() {
    if (!swiperInstance || swiperInstance.destroyed) return;
    
    const realIndex = swiperInstance.realIndex;
    if (realIndex === undefined || realIndex < 0) return;
    
    const item = currentItems[realIndex];
    if (!item) return;
    
    const infoContainer = document.getElementById('product-info');
    infoContainer.style.opacity = 0;
    
    setTimeout(() => {
        nameEl.textContent = item.name;
        descEl.textContent = item.description || 'Delicada base de pan artesanal con aguacate hass, pizca de sal marina y semillas de sésamo.';
        priceEl.textContent = item.price;
        infoContainer.style.opacity = 1;
    }, 150);
  }

  function setCategory(cat) {
    if (cat === currentCategory) return;
    currentCategory = cat;
    currentItems = data[cat];
    
    catBtns.forEach(b => {
      if (b.dataset.category === cat) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    renderCards();
  }

  catBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      setCategory(e.currentTarget.dataset.category);
    });
  });

  arBtn.addEventListener('click', () => {
    if (!swiperInstance) return;
    const item = currentItems[swiperInstance.realIndex];
    if (!item) return;
    
    // Construcción Destructiva Dinámica: Inyecta el componente WebXR al click, forzando limpieza de RAM al cerrarse
    arOverlay.innerHTML = `
      <model-viewer id="product-model" src="${item.arModel}" ios-src="${item.arModelIos || ""}" ar-scale="fixed" ar-placement="floor" scale="1 1 1" ar ar-modes="webxr scene-viewer quick-look" camera-controls exposure="1" shadow-intensity="1" touch-action="pan-y" alt="Modelo 3D de ${item.name}" poster="${item.image}">
        
        <button class="close-ar pill-btn" id="close-ar-btn">
          <span class="close-x">✕</span>
          <span class="close-text">Volver al Menú</span>
        </button>
        
        <div slot="progress-bar" class="custom-progress-bar">
          <div class="progress-spinner">
            <img src="./src/png/Cafe del prado logo.png" alt="Cargando">
          </div>
        </div>
        
        <div slot="poster" class="model-poster" id="model-poster-div">Cargando modelo...</div>
        
        <div slot="ar-prompt" class="custom-ar-prompt">
          <div class="reticle-box"></div>
          <div class="prompt-text">
            Buscando superficie...
          </div>
        </div>
      </model-viewer>
    `;

    // Attaching listener dinámico
    document.getElementById('close-ar-btn').addEventListener('click', () => {
      closeArView();
      if (window.history.state && window.history.state.arOverlayOpen) {
        window.history.back();
      }
    });

    // Elements
    const onboarding = document.getElementById('ar-onboarding');
    const step1 = document.getElementById('onboarding-step-1');
    const step2 = document.getElementById('onboarding-step-2');

    // Start Onboarding Layer
    onboarding.classList.remove('hidden');
    step1.classList.remove('hidden');
    step2.classList.add('hidden');

    // Canceling existing timeouts if user is clicking very fast
    clearTimeout(window.arOnboardingTimeout);
    clearTimeout(window.arOnboardingTimeout2);

    window.arOnboardingTimeout = setTimeout(() => {
       step1.classList.add('hidden');
       step2.classList.remove('hidden');
       
       window.arOnboardingTimeout2 = setTimeout(() => {
           onboarding.classList.add('hidden');
           arOverlay.classList.remove('hidden');
       }, 2000); // Step 2 duracion: 2 segundos
    }, 2000); // Step 1 duracion: 2 segundos

    // Manejo de historial para "Retroceso Nativo"
    window.history.pushState({ arOverlayOpen: true }, '');
  });

  function closeArView() {
    clearTimeout(window.arOnboardingTimeout);
    clearTimeout(window.arOnboardingTimeout2);
    
    const onboarding = document.getElementById('ar-onboarding');
    if (onboarding) onboarding.classList.add('hidden');
    
    arOverlay.classList.add('hidden');
    
    // Destrucción total del elemento en el DOM para forzar al Garbage Collector a limpiar VideoRAM y WebXR context
    setTimeout(() => {
        arOverlay.innerHTML = '';
    }, 400); // Dar padding de tiempo a la transición CSS de hide si existe
  }

  // Escuchar el evento de gesto de retroceso del navegador (back gesture nativo)
  window.addEventListener('popstate', (e) => {
    if (!arOverlay.classList.contains('hidden')) {
      closeArView();
    }
  });

  renderCards(true); // Inicio inmediato sin fade
}
