import React from 'react';
import type { InteractiveView, ViewShape } from '../../data/interactiveViews';

const TONE_CLASS: Record<ViewShape['tone'], string> = {
  robe: 'fill-[#c49466] dark:fill-[#9c714a]',
  ombre: 'fill-[#8a6240] dark:fill-[#6e4e33]',
  crins: 'fill-[#3b2a1f] dark:fill-[#1f1611]',
  sabot: 'fill-stone-800',
  cuir: 'fill-[#8a5230] dark:fill-[#6d3f24]',
  metal: 'fill-stone-400',
  tissu: 'fill-stone-200',
  sol: 'fill-stone-300 dark:fill-stone-700',
  ligne: 'fill-none stroke-white/80',
  piste: 'fill-[#e8d5a9] dark:fill-[#5b4b2c]',
};

/**
 * Affiche une vue interactive. Les régions sont des boutons accessibles (clavier + lecteur d'écran).
 * `feedback` colore une région en vert (bonne réponse) ou rouge (erreur).
 */
export const InteractiveSvg: React.FC<{
  view: InteractiveView;
  selected?: string | null;
  onSelect?: (regionId: string) => void;
  showLabels?: boolean;
  feedback?: { correct?: string; wrong?: string };
  overlay?: React.ReactNode;
  className?: string;
}> = ({ view, selected, onSelect, showLabels = false, feedback, overlay, className = '' }) => (
  <svg viewBox={view.viewBox} className={`w-full h-auto select-none ${className}`} role="group" aria-label={`Schéma interactif : ${view.title}`}>
    {view.shapes.map((s, i) => (
      <path key={i} d={s.d} className={TONE_CLASS[s.tone]} strokeWidth={s.tone === 'ligne' ? 1.5 : 0} strokeDasharray={s.tone === 'ligne' ? '4 4' : undefined} />
    ))}
    {view.regions.map((r, index) => {
      const isSel = selected === r.id;
      const isOk = feedback?.correct === r.id;
      const isKo = feedback?.wrong === r.id;
      const fill = isOk ? 'fill-emerald-500/60' : isKo ? 'fill-red-500/60' : isSel ? 'fill-amber-400/60' : 'fill-white/0 hover:fill-amber-300/35 focus:fill-amber-300/45';
      return (
        <path
          key={r.id}
          d={r.d}
          className={`${fill} stroke-stone-900/25 dark:stroke-white/25 cursor-pointer outline-none transition-colors`}
          strokeWidth={isSel || isOk || isKo ? 2 : 0.8}
          tabIndex={onSelect ? 0 : -1}
          role={onSelect ? 'button' : undefined}
          // En mode quiz (sans étiquettes), le nom de la zone ne doit pas être annoncé : il donnerait la réponse.
          aria-label={onSelect ? (showLabels ? r.label : `Zone ${index + 1}`) : undefined}
          aria-pressed={onSelect ? isSel : undefined}
          onClick={() => onSelect?.(r.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect?.(r.id);
            }
          }}
        >
          <title>{showLabels ? r.label : 'Zone sélectionnable'}</title>
        </path>
      );
    })}
    {view.labels?.map((l, i) => (
      <text key={i} x={l.x} y={l.y} textAnchor="middle" className="fill-stone-900 dark:fill-stone-100 text-[11px] font-bold pointer-events-none">
        {l.text}
      </text>
    ))}
    {showLabels &&
      view.regions
        .filter((r) => r.id === selected || r.id === feedback?.correct)
        .map((r) => (
          <g key={r.id} className="pointer-events-none">
            <rect x={r.lx - r.label.length * 3.2 - 6} y={r.ly - 11} width={r.label.length * 6.4 + 12} height={18} rx={6} className="fill-stone-900/85" />
            <text x={r.lx} y={r.ly + 2} textAnchor="middle" className="fill-white text-[11px] font-bold">{r.label}</text>
          </g>
        ))}
    {overlay}
  </svg>
);
