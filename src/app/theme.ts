import type { ThemePreference } from '../types/models';

/**
 * Thème clair / sombre / automatique. La préférence est enregistrée dans les paramètres
 * (IndexedDB) et recopiée en localStorage pour être appliquée dès le chargement, sans flash.
 */
const LS_KEY = 'equi.theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

export function readThemePreference(): ThemePreference {
  try {
    const v = localStorage.getItem(LS_KEY);
    return v === 'clair' || v === 'sombre' || v === 'auto' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

export function applyTheme(pref: ThemePreference) {
  try {
    localStorage.setItem(LS_KEY, pref);
  } catch {
    // préférence non mémorisée en navigation privée
  }
  const dark = pref === 'sombre' || (pref === 'auto' && media().matches);
  document.documentElement.classList.toggle('dark', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0c1512' : '#1e3a2f');
}

export function initTheme() {
  applyTheme(readThemePreference());
  media().addEventListener('change', () => {
    if (readThemePreference() === 'auto') applyTheme('auto');
  });
}
