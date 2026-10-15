import { useEffect, useRef } from 'react';

// Fond animé : halos vert (santé) et bleu (numérique) qui dérivent lentement,
// et un réseau de points reliés qui réagit à la souris et au défilement.

const GREEN = [21, 128, 61];
const BLUE = [3, 105, 161];

const LINK_DISTANCE = 140;
const POINTER_DISTANCE = 190;
const PARALLAX = 0.12;

const HALOS = [
  { color: GREEN, x: 0.82, y: 0.18, radius: 0.55, speed: 0.00011, phase: 0, alpha: 0.13 },
  { color: BLUE, x: 0.12, y: 0.7, radius: 0.5, speed: 0.00009, phase: 2, alpha: 0.11 },
  { color: GREEN, x: 0.3, y: 0.1, radius: 0.35, speed: 0.00014, phase: 4, alpha: 0.07 },
  { color: BLUE, x: 0.9, y: 0.85, radius: 0.4, speed: 0.00012, phase: 1, alpha: 0.09 },
];

function rgba([r, g, b], alpha) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createNodes(width, height) {
  // Densité adaptée à la taille d'écran, plafonnée pour rester fluide
  const count = Math.min(90, Math.round((width * height) / 16000));

  return Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    radius: 1.2 + Math.random() * 1.6,
    color: index % 3 === 0 ? BLUE : GREEN,
  }));
}

function wrap(value, max) {
  return ((value % max) + max) % max;
}

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let width = 0;
    let height = 0;
    let nodes = [];
    let frameId = 0;
    const pointer = { x: -9999, y: -9999 };

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const widthChanged = window.innerWidth !== width;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Sur mobile, la barre d'adresse change seulement la hauteur : on garde les points
      if (widthChanged) nodes = createNodes(width, height);
    }

    function drawHalos(time) {
      const size = Math.max(width, height);

      HALOS.forEach((halo) => {
        const angle = time * halo.speed + halo.phase;
        const x = (halo.x + Math.cos(angle) * 0.08) * width;
        const y = (halo.y + Math.sin(angle * 1.3) * 0.08) * height;
        const radius = halo.radius * size;
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, rgba(halo.color, halo.alpha));
        gradient.addColorStop(1, rgba(halo.color, 0));
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      });
    }

    function drawNetwork(animated) {
      const offset = window.scrollY * PARALLAX;
      const positions = nodes.map((node) => {
        if (animated) {
          node.x = wrap(node.x + node.vx, width);
          node.y = wrap(node.y + node.vy, height);
        }
        return { node, x: node.x, y: wrap(node.y - offset, height) };
      });

      context.lineWidth = 1;

      for (let i = 0; i < positions.length; i += 1) {
        const a = positions[i];

        for (let j = i + 1; j < positions.length; j += 1) {
          const b = positions[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);

          if (distance < LINK_DISTANCE) {
            context.strokeStyle = rgba(a.node.color, (1 - distance / LINK_DISTANCE) * 0.22);
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }

        const pointerDistance = Math.hypot(a.x - pointer.x, a.y - pointer.y);

        if (pointerDistance < POINTER_DISTANCE) {
          context.strokeStyle = rgba(BLUE, (1 - pointerDistance / POINTER_DISTANCE) * 0.4);
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(pointer.x, pointer.y);
          context.stroke();
        }
      }

      positions.forEach(({ node, x, y }) => {
        context.fillStyle = rgba(node.color, 0.55);
        context.beginPath();
        context.arc(x, y, node.radius, 0, Math.PI * 2);
        context.fill();
      });
    }

    function render(time, animated) {
      context.clearRect(0, 0, width, height);
      drawHalos(time);
      drawNetwork(animated);
    }

    function loop(time) {
      render(time, true);
      frameId = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(frameId);
      if (reducedMotion.matches) {
        // Image fixe, redessinée seulement au défilement
        render(0, false);
      } else if (!document.hidden) {
        frameId = requestAnimationFrame(loop);
      }
    }

    function handleResize() {
      resize();
      start();
    }

    function handleScroll() {
      if (reducedMotion.matches) render(0, false);
    }

    function handlePointerMove(event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }

    function handlePointerLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }

    function handleVisibility() {
      if (document.hidden) cancelAnimationFrame(frameId);
      else start();
    }

    resize();
    start();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotion.addEventListener('change', start);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotion.removeEventListener('change', start);
    };
  }, []);

  return <canvas ref={canvasRef} className="ambient-background" aria-hidden="true" />;
}
