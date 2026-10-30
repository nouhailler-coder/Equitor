import React, { useEffect, useRef } from 'react';
import type { TabType } from '../components/layout/Navigation';
import { SCREEN_GUIDES } from './screenGuides';
import { useFocusTrap } from '../hooks/useFocusTrap';

const SEEN_KEY = 'equi.guide.seen';

const readSeen = (): TabType[] => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as TabType[];
  } catch {
    return [];
  }
};

export const hasSeenScreenGuide = (tab: TabType) => readSeen().includes(tab);

export const markScreenGuideSeen = (tab: TabType) => {
  try {
    const seen = readSeen();
    if (!seen.includes(tab)) localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, tab]));
  } catch {
    // ignore
  }
};

export const resetScreenGuides = () => {
  try {
    localStorage.removeItem(SEEN_KEY);
  } catch {
    // ignore
  }
};

interface ScreenGuideSheetProps {
  tab: TabType | null;
  onClose: () => void;
}

/** Panneau d'aide contextuelle d'un écran (bas d'écran sur mobile, centré sur grand écran). */
export const ScreenGuideSheet: React.FC<ScreenGuideSheetProps> = ({ tab, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, tab !== null, tab);

  useEffect(() => {
    if (!tab) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tab, onClose]);

  if (!tab) return null;
  const guide = SCREEN_GUIDES[tab];

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="screen-guide-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85dvh] flex flex-col"
      >
        <div className="px-5 pt-5 pb-3 flex items-start gap-3">
          <span className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl shrink-0" aria-hidden="true">
            {guide.icon}
          </span>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Comment ça marche</p>
            <h2 id="screen-guide-title" className="text-lg font-black text-stone-900 leading-tight">
              {guide.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">{guide.intro}</p>
          </div>
        </div>
        <ul className="px-5 space-y-2 overflow-y-auto">
          {guide.tips.map((t, i) => (
            <li key={i} className="flex gap-3 items-start text-sm text-stone-700 bg-stone-50 rounded-xl p-2.5">
              <span aria-hidden="true">{t.icon}</span>
              <span>{t.text}</span>
            </li>
          ))}
        </ul>
        <div className="p-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onClose}
            data-autofocus
            className="w-full py-3 rounded-xl bg-[#162e24] hover:bg-emerald-900 text-white font-bold transition active:scale-95"
          >
            Compris
          </button>
          <p className="text-[11px] text-stone-400 text-center mt-2">
            Revoir cette aide à tout moment avec le bouton <strong>?</strong> en haut de l’écran.
          </p>
        </div>
      </div>
    </div>
  );
};
