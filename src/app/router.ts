import { useSyncExternalStore } from 'react';

/**
 * Routeur minimal par fragment d'URL (#/journal/abc).
 * Compatible hébergement statique (Cloudflare Pages) et hors ligne ; le bouton retour
 * du navigateur ou d'Android ramène à l'écran précédent.
 */
const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};
const getHash = () => window.location.hash;

export function parseHash(hash: string): string[] {
  return hash
    .replace(/^#\/?/, '')
    .split('?')[0]
    .split('/')
    .filter(Boolean)
    .map((s) => decodeURIComponent(s));
}

export function useRoute(): string[] {
  const hash = useSyncExternalStore(subscribe, getHash, () => '');
  const segs = parseHash(hash);
  return segs.length ? segs : ['accueil'];
}

/** Nombre d'écrans empilés par l'application (pour savoir si « retour » reste dans l'app). */
let depth = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    depth = Math.max(0, depth - 1);
  });
}

export function navigate(path: string, opts: { replace?: boolean } = {}) {
  const target = `#/${path.replace(/^[#/]+/, '')}`;
  if (target === window.location.hash) return;
  if (opts.replace) window.history.replaceState(null, '', target);
  else {
    window.history.pushState(null, '', target);
    depth++;
  }
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  window.scrollTo({ top: 0 });
}

/** Retour à l'écran précédent de l'application, ou à défaut vers `fallback`. */
export function goBack(fallback: string) {
  if (depth > 0) window.history.back();
  else navigate(fallback, { replace: true });
}

export const href = (path: string) => `#/${path.replace(/^[#/]+/, '')}`;
