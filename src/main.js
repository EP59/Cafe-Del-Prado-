import '@google/model-viewer';
import Lenis from 'lenis';
import { setupParallax } from './js/parallax.js';
import { initCarousel } from './js/carousel.js';

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  smoothTouch: false,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Once DOM is loaded, setup our specific interactions
document.addEventListener('DOMContentLoaded', () => {
  setupParallax();
  
  // Hydration asíncrona: No bloquea el hilo principal durante inicialización
  import('./js/data.js').then((module) => {
    initCarousel(module.products);
  }).catch(err => console.error("Error loading products:", err));

  // Menu Overlay Logic
  const menuBtn = document.getElementById('menu-toggle-btn');
  const menuOverlay = document.getElementById('menu-overlay');
  const iconHamburger = document.querySelector('.icon-hamburger');
  const iconClose = document.querySelector('.icon-close');

  if (menuBtn && menuOverlay) {
    menuBtn.addEventListener('click', () => {
      menuOverlay.classList.toggle('active');
      const isActive = menuOverlay.classList.contains('active');
      
      if (isActive) {
        iconHamburger.style.display = 'none';
        iconClose.style.display = 'block';
      } else {
        iconHamburger.style.display = 'block';
        iconClose.style.display = 'none';
      }
    });
  }
});
