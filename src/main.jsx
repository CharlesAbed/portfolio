import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { animate, inView } from 'motion/react';
import AnimatedBackground from './AnimatedBackground.jsx';

const EASE = [0.22, 1, 0.36, 1];

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Une fois l'animation terminée, on rend la main au CSS
// (sinon le style en ligne bloquerait les effets de survol).
function clearInlineTransform(element) {
  element.style.removeProperty('transform');
}

function showImmediately(elements) {
  elements.forEach((element) => {
    element.style.opacity = '1';
  });
}

function HeroAnimation() {
  useEffect(() => {
    const elements = [...document.querySelectorAll('[data-hero]')];

    if (prefersReducedMotion()) {
      showImmediately(elements);
      return undefined;
    }

    const animations = elements.map((element, index) => {
      const animation = animate(
        element,
        { opacity: [0, 1], y: [14, 0] },
        { duration: 0.7, delay: 0.08 + index * 0.1, ease: EASE }
      );
      animation.then(() => clearInlineTransform(element));
      return animation;
    });

    return () => animations.forEach((animation) => animation.stop());
  }, []);

  return null;
}

function ScrollReveal() {
  useEffect(() => {
    const elements = [...document.querySelectorAll('[data-reveal]')];

    if (prefersReducedMotion()) {
      showImmediately(elements);
      return undefined;
    }

    const stopWatching = inView(
      elements,
      (element) => {
        // Léger décalage entre les éléments voisins d'une même grille
        const siblings = [...element.parentElement.children].filter((child) => child.hasAttribute('data-reveal'));
        const delay = Math.min(siblings.indexOf(element), 4) * 0.08;

        animate(
          element,
          { opacity: [0, 1], y: [18, 0] },
          { duration: 0.6, delay, ease: EASE }
        ).then(() => clearInlineTransform(element));
      },
      { amount: 0.15 }
    );

    return () => stopWatching();
  }, []);

  return null;
}

function App() {
  return (
    <>
      <AnimatedBackground />
      <HeroAnimation />
      <ScrollReveal />
    </>
  );
}

const rootElement = document.getElementById('react-root');

if (rootElement) {
  createRoot(rootElement).render(<App />);
}
