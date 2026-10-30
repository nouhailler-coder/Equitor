import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

interface InfoTipProps {
  /** Texte de l'infobulle. */
  text: string;
  /** Nom court lu par les lecteurs d'écran (« Aide : … »). */
  label?: string;
  /** Icône claire sur fond sombre. */
  light?: boolean;
}

const WIDTH = 256;
const MARGIN = 12;

/**
 * Infobulle « ⓘ » : s'ouvre au toucher / clic (mobile) ou au survol (ordinateur).
 * Positionnée en `fixed` et bornée à la largeur de l'écran pour ne jamais créer de défilement horizontal.
 */
export const InfoTip: React.FC<InfoTipProps> = ({ text, label = 'Plus d’informations', light = false }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean }>({ top: 0, left: 0, above: false });
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const pointerType = useRef<string>('');
  const id = useId();

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const width = Math.min(WIDTH, window.innerWidth - MARGIN * 2);
    const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, MARGIN), window.innerWidth - width - MARGIN);
    const tipH = tipRef.current?.offsetHeight ?? 80;
    const above = r.bottom + 8 + tipH > window.innerHeight - 72; // garder clair de la barre du bas
    setPos({ top: above ? r.top - 8 - tipH : r.bottom + 8, left, above });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (btnRef.current?.contains(e.target as Node) || tipRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onScroll = () => setOpen(false);
    document.addEventListener('pointerdown', close);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  return (
    <span className="inline-flex align-middle">
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          // À la souris, le survol a déjà ouvert l'infobulle : le clic ne doit pas la refermer.
          setOpen((o) => (pointerType.current === 'mouse' ? true : !o));
        }}
        onPointerDown={(e) => (pointerType.current = e.pointerType)}
        onPointerEnter={(e) => {
          pointerType.current = e.pointerType;
          if (e.pointerType === 'mouse') setOpen(true);
        }}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
        onKeyDown={() => (pointerType.current = 'keyboard')}
        aria-label={`Aide : ${label}`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          light
            ? 'bg-white/15 text-amber-200 hover:bg-white/25'
            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
        }`}
      >
        i
      </button>
      {open && (
        <div
          ref={tipRef}
          id={id}
          role="tooltip"
          style={{ top: pos.top, left: pos.left, width: Math.min(WIDTH, window.innerWidth - MARGIN * 2) }}
          className="fixed z-[65] rounded-xl bg-stone-900 text-stone-100 text-xs font-normal normal-case tracking-normal leading-relaxed p-3 shadow-xl text-left"
        >
          {text}
        </div>
      )}
    </span>
  );
};
