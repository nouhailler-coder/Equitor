import React from 'react';
import type { BehaviorIllustration } from '../../data/behaviors';

/**
 * Illustration originale paramétrable d'une tête de cheval (profil, tête à gauche) :
 * port des oreilles, œil, port de tête, bouche et queue schématisés.
 */
export const BehaviorHead: React.FC<{ ill: BehaviorIllustration; title: string; className?: string }> = ({ ill, title, className = '' }) => {
  const rot = ill.head === 'haute' ? -14 : ill.head === 'basse' ? 18 : 0;
  // oreilles : angle par rapport à la verticale (négatif = vers l'avant/gauche)
  const ears: Record<BehaviorIllustration['ears'], [number, number]> = {
    avant: [-28, -18],
    une_arriere: [-25, 45],
    plaquees: [70, 78],
    relachees: [40, 55],
    mobiles: [-30, 50],
  };
  const [e1, e2] = ears[ill.ears];
  const ear = (angle: number, dx: number, dim = false) => (
    <path
      d="M0,0 C-6,-14 -5,-30 0,-38 C5,-30 7,-14 4,0 Z"
      transform={`translate(${126 + dx},58) rotate(${angle})`}
      className={dim ? 'fill-[#9c714a]' : 'fill-[#b5845a]'}
    />
  );
  return (
    <svg viewBox="0 0 220 170" className={`w-full h-auto ${className}`} role="img" aria-label={title}>
      <rect width="220" height="170" rx="16" className="fill-emerald-50 dark:fill-stone-800" />
      <g transform={`rotate(${rot} 140 110)`}>
        {/* encolure */}
        <path d="M118,62 C150,54 190,70 210,110 L210,170 L150,170 C150,140 140,118 118,102 Z" className="fill-[#b5845a]" />
        <path d="M128,56 C160,48 196,66 214,104 L206,108 C190,76 160,62 132,66 Z" className="fill-[#3b2a1f]" />
        {ear(e2, 8, true)}
        {/* tête */}
        <path d="M128,60 C112,58 92,70 70,92 L38,124 C30,132 32,146 44,150 C60,155 80,150 96,140 C112,132 130,128 142,118 C152,108 150,74 128,60 Z" className="fill-[#c49466]" />
        {ear(e1, 0)}
        {/* œil */}
        {ill.eye === 'mi_clos' ? (
          <path d="M104,86 Q112,92 120,86" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-stone-900" />
        ) : (
          <g>
            <ellipse cx="112" cy="86" rx="8" ry="6.5" className={ill.eye === 'blanc' ? 'fill-white' : 'fill-stone-900'} />
            {ill.eye === 'blanc' && <circle cx="114" cy="86" r="4" className="fill-stone-900" />}
          </g>
        )}
        {/* naseau */}
        <path d="M48,130 Q54,124 60,130" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-stone-800" />
        {/* bouche */}
        {ill.mouth === 'baille' ? (
          <path d="M40,146 L72,132 L70,154 Z" className="fill-rose-300 stroke-stone-800" strokeWidth="1.5" />
        ) : (
          <path
            d={ill.mouth === 'crispee' ? 'M44,146 L70,140' : ill.mouth === 'mache' ? 'M44,146 Q52,152 60,146 Q66,142 72,146' : 'M44,146 Q58,150 72,144'}
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-stone-800"
          />
        )}
      </g>
      {ill.tail && (
        <path
          d={ill.tail === 'haute' ? 'M200,40 C190,10 170,8 160,20' : ill.tail === 'fouette' ? 'M196,30 C176,16 186,2 168,4 M196,30 C206,14 214,22 210,6' : 'M200,30 C204,50 202,70 198,90'}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-[#3b2a1f]"
        />
      )}
      {ill.ears === 'mobiles' && (
        <g className="stroke-amber-500" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M108,18 Q118,10 128,18" />
          <path d="M140,16 Q150,8 160,16" />
        </g>
      )}
    </svg>
  );
};
