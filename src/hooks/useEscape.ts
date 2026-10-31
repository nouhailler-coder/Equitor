import { useEffect, useRef } from 'react';

/**
 * Touche Échap pour les fenêtres empilées : seule la fenêtre ouverte en dernier se ferme
 * (une définition ouverte depuis une fiche se ferme sans fermer la fiche).
 */
const stack: { current: () => void }[] = [];
let listening = false;

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || stack.length === 0) return;
  e.preventDefault();
  stack[stack.length - 1].current();
}

export function useEscape(active: boolean, onClose: () => void) {
  const ref = useRef(onClose);
  ref.current = onClose;
  useEffect(() => {
    if (!active) return;
    const entry = ref;
    stack.push(entry);
    if (!listening) {
      window.addEventListener('keydown', onKey);
      listening = true;
    }
    return () => {
      const i = stack.lastIndexOf(entry);
      if (i >= 0) stack.splice(i, 1);
    };
  }, [active]);
}
