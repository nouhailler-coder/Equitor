import { useSyncExternalStore } from 'react';

/**
 * Fenêtres globales ouvrables depuis n'importe quel écran (fiche, chapitre, recherche…).
 * Petit magasin d'état sans dépendance.
 */
export type OverlayName =
  | 'menu'
  | 'search'
  | 'offlineGuide'
  | 'ethics'
  | 'legalNotice'
  | 'install'
  | 'systemSettings'
  | 'onboarding';

interface OverlayState {
  lessonId: string | null;
  chapterId: string | null;
  open: Partial<Record<OverlayName, boolean>>;
  /** Écran dont l'aide contextuelle est affichée. */
  guide: string | null;
}

let state: OverlayState = { lessonId: null, chapterId: null, open: {}, guide: null };
const listeners = new Set<() => void>();
const set = (patch: Partial<OverlayState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const overlays = {
  openLesson: (id: string) => set({ lessonId: id }),
  closeLesson: () => set({ lessonId: null }),
  openChapter: (id: string) => set({ chapterId: id }),
  closeChapter: () => set({ chapterId: null }),
  show: (name: OverlayName) => set({ open: { ...state.open, [name]: true } }),
  hide: (name: OverlayName) => set({ open: { ...state.open, [name]: false } }),
  showGuide: (tab: string) => set({ guide: tab }),
  hideGuide: () => set({ guide: null }),
};

export function useOverlays(): OverlayState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => state,
    () => state,
  );
}
