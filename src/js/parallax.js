import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stickerUrls } from './data.js';

gsap.registerPlugin(ScrollTrigger);

// Matriz generada artesanalmente para replicar EXACTAMENTE la densidad de la imagen origen.
// 32 SVGs encimándose (solapamiento), dejando "grietas" blancas.
// t = top (%), l = left (%), w = width (px), r = rotación inicial (deg), s = speed (0.4x - 2.5x)
const layout = [
  { t: 0, l: 3, w: 140, r: -15, s: 0.5 },
  { t: -2, l: 20, w: 150, r: 8, s: 0.8 },
  { t: 5, l: 40, w: 110, r: -5, s: 1.2 },
  { t: 1, l: 60, w: 165, r: 12, s: 0.6 },
  { t: 6, l: 80, w: 90, r: -18, s: 1.5 },

  { t: 15, l: 10, w: 160, r: -5, s: 2.1 },
  { t: 20, l: 30, w: 130, r: 15, s: 1.1 },
  { t: 13, l: 50, w: 150, r: -12, s: 2.4 }, // Focal superpuesto
  { t: 18, l: 70, w: 110, r: 8, s: 0.9 },
  { t: 22, l: 88, w: 100, r: -20, s: 1.6 },

  { t: 35, l: -2, w: 115, r: 20, s: 0.7 },
  { t: 38, l: 18, w: 140, r: -8, s: 1.8 },
  { t: 36, l: 40, w: 170, r: 15, s: 2.5 }, // Central muy frontal
  { t: 32, l: 65, w: 125, r: -15, s: 1.0 },
  { t: 40, l: 85, w: 95, r: 10, s: 1.3 },

  { t: 55, l: 5, w: 70, r: -12, s: 2.2 },
  { t: 58, l: 28, w: 115, r: 5, s: 0.8 },
  { t: 50, l: 50, w: 140, r: -18, s: 1.5 },
  { t: 55, l: 70, w: 150, r: 20, s: 2.0 },
  { t: 52, l: 90, w: 110, r: -5, s: 0.6 },

  { t: 75, l: 2, w: 125, r: 15, s: 1.4 },
  { t: 78, l: 22, w: 165, r: -20, s: 2.3 },
  { t: 70, l: 45, w: 115, r: 8, s: 0.9 },
  { t: 74, l: 65, w: 140, r: -12, s: 1.7 },
  { t: 68, l: 85, w: 125, r: 18, s: 1.1 },

  { t: 90, l: 10, w: 150, r: -5, s: 0.5 },
  { t: 88, l: 35, w: 100, r: 12, s: 1.3 },
  { t: 92, l: 58, w: 165, r: -15, s: 2.1 },
  { t: 85, l: 78, w: 115, r: 10, s: 0.8 },

  // Fillers estratégicos para rellenar grietas de los intermedios
  { t: 25, l: 35, w: 10, r: 20, s: 0.4 },
  { t: 45, l: 12, w: 115, r: -20, s: 1.9 },
  { t: 65, l: 75, w: 105, r: 5, s: 1.2 }
];

export function setupParallax() {
  // Lógica del logo interactivo
  const logo = document.getElementById('interactive-logo');
  if (logo) {
    // Rotación base infinita constante (1 vuelta cada 3.5 segundos)
    const logoAnim = gsap.to(logo, {
      rotationY: "+=360",
      ease: "none",
      duration: 3.5,
      repeat: -1
    });

    let scrollTimeout;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        // Multiplicador basado en la velocidad de scroll
        const vel = Math.abs(self.getVelocity());
        const targetScale = 1 + vel / 300;

        // Acelerar la animación reactivamente, limitando el máximo a 8x para evitar mareos
        gsap.to(logoAnim, {
          timeScale: Math.min(targetScale, 8),
          duration: 0.1,
          overwrite: true
        });

        // Retornar suavemente a la velocidad base si el usuario deja de hacer scroll
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          gsap.to(logoAnim, { timeScale: 1, duration: 0.5 });
        }, 100);
      }
    });
  }

  const container = document.getElementById('stickers-container');
  if (!container) return;

  const toUse = [...stickerUrls];

  toUse.forEach((url, i) => {
    // Seguridad para no exceder los 32
    if (i >= layout.length) return;

    const item = layout[i];

    const img = document.createElement('img');
    img.src = url;
    img.classList.add('sticker');

    // Optimizaciones V8 (Offload main thread) & Intelligent fold loading
    img.loading = item.t > 80 ? "lazy" : "eager";
    img.decoding = "async";
    img.style.contentVisibility = "auto";

    // Inyección pura mediante transform3D en gpu (Cero reflows). Anclamos en (0,0)
    img.style.top = "0";
    img.style.left = "0";
    img.style.width = `${item.w}px`;

    // Transformaciones directas previniendo FOUC visual y repaints
    img.style.transform = `translate3d(${item.l}vw, ${item.t}vh, 0) rotate(${item.r}deg) scale(1)`;

    // Profundidad 3D real: mayor velocidad = mayor índice Z obligatoriamente
    img.dataset.speed = item.s;
    img.style.zIndex = Math.floor(item.s * 20);

    container.appendChild(img);

    // Ecuación Paralaje Agresiva
    // Desplazamiento Y drástico en función de su multiplicador
    const yTravel = -250 * item.s;

    // Balanceo visual sutil atado al scrub para sensación flotante
    const flotacionFinal = item.r + (Math.random() > 0.5 ? 12 : -12);

    // Física e Inercia con scrub 1 en GPU Estricta
    gsap.to(img, {
      y: yTravel,
      rotation: flotacionFinal,
      force3D: true, // Forzar aceleración de hardware
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: 1 // Inercia suave y reactiva
      }
    });

  });
}
