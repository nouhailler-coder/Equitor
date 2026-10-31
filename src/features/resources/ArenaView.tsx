import React, { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { ARENA_FIGURES } from '../../data/arenaFigures';
import { VIEW_ARENA } from '../../data/interactiveViews';
import { DICTIONARY_BY_ID } from '../../data/dictionary';
import { LEVEL_LABELS } from '../../data/catalog';
import { InteractiveSvg } from '../../components/ui/InteractiveSvg';
import { FavoriteButton, Link, PageHeader, btn, card } from '../../components/ui/kit';
import { navigate } from '../../app/router';

const LETTER_INFO: Record<string, string> = {
  A: 'Lettre d’entrée, au milieu du petit côté. On y entre et on y commence souvent les figures (cercle en A).',
  C: 'Milieu du petit côté opposé à A : place du juge en reprise de dressage.',
  E: 'Milieu du grand côté gauche (vu depuis A). Repère des voltes et des doublers dans la largeur.',
  B: 'Milieu du grand côté droit (vu depuis A), face à E.',
  K: 'Lettre de coin, à 6 m du petit côté A. Point de départ fréquent des diagonales.',
  F: 'Lettre de coin, à 6 m du petit côté A, en face de K.',
  H: 'Lettre de coin, à 6 m du petit côté C.',
  M: 'Lettre de coin, à 6 m du petit côté C, en face de H.',
  X: 'Centre de la carrière, sur la ligne du milieu, entre E et B (non matérialisé).',
};

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const ArenaView: React.FC<{ figureId?: string }> = ({ figureId }) => {
  const [figId, setFigId] = useState<string | null>(ARENA_FIGURES.some((f) => f.id === figureId) ? figureId! : 'cercle');
  const [letter, setLetter] = useState<string | null>(null);
  const [playing, setPlaying] = useState(!reducedMotion());
  const fig = ARENA_FIGURES.find((f) => f.id === figId) ?? null;

  const overlay = fig && (
    <g className="pointer-events-none">
      <path d={fig.path} fill="none" className="stroke-amber-500" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {playing && (
        <circle r={6} className="fill-brand-900 stroke-white" strokeWidth={2}>
          <animateMotion dur={`${fig.duration}s`} repeatCount="indefinite" path={fig.path} rotate="auto" />
        </circle>
      )}
    </g>
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Manège interactif" icon="🏟️" back="ressources" subtitle="Carrière de 20 × 40 m vue du dessus" help="Les figures et animations sont des supports de compréhension, pas des instructions de conduite à suivre seul. Touchez une lettre pour la découvrir." />
      <div className="grid lg:grid-cols-[minmax(0,22rem)_1fr] gap-4 items-start">
        <div className={`${card} p-3`}>
          <InteractiveSvg
            view={VIEW_ARENA}
            selected={letter ? `lettre-${letter}` : null}
            onSelect={(id) => setLetter(id.replace('lettre-', ''))}
            overlay={overlay}
            className="max-h-[60vh] mx-auto"
          />
          <div className="flex justify-center gap-4 text-[11px] text-stone-500 mt-1">
            <span>— — ligne du milieu / lignes du quart</span>
          </div>
          {fig && (
            <button className={btn('secondary', 'w-full mt-2 text-xs')} onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
              {playing ? <><Pause className="w-4 h-4" /> Mettre en pause</> : <><Play className="w-4 h-4" /> Animer la trajectoire</>}
            </button>
          )}
        </div>
        <div className="space-y-3">
          {letter && (
            <div className={`${card} p-4 text-sm`} aria-live="polite">
              <p className="font-black text-stone-900 dark:text-stone-100">Lettre {letter}</p>
              <p className="text-stone-700 dark:text-stone-300">{LETTER_INFO[letter]}</p>
            </div>
          )}
          <div role="radiogroup" aria-label="Figures" className="grid grid-cols-2 gap-1.5">
            {ARENA_FIGURES.map((f) => (
              <button key={f.id} role="radio" aria-checked={figId === f.id} onClick={() => { setFigId(f.id); navigate(`ressources/manege/${f.id}`, { replace: true }); }} className={`rounded-xl border-2 px-3 py-2 text-left text-xs font-semibold ${figId === f.id ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900'}`}>
                {f.name}
              </button>
            ))}
          </div>
          {fig && (
            <div className={`${card} p-4 space-y-2 text-sm`}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-black text-lg text-stone-900 dark:text-stone-50">{fig.name}</h2>
                <FavoriteButton type="figure" targetId={fig.id} label={fig.name} />
              </div>
              <p className="text-xs text-stone-500">Niveau indicatif : {LEVEL_LABELS[fig.level]}</p>
              <p className="text-stone-700 dark:text-stone-300">{fig.description}</p>
              <p><strong className="text-stone-900 dark:text-stone-100">Objectif pédagogique : </strong><span className="text-stone-700 dark:text-stone-300">{fig.objective}</span></p>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100">Notions associées</p>
                <ul className="list-disc pl-5 text-stone-700 dark:text-stone-300">{fig.notions.map((n) => <li key={n}>{n}</li>)}</ul>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {fig.termIds.map((t) => <Link key={t} to={`ressources/dictionnaire/${t}`} className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 text-xs font-semibold">📖 {DICTIONARY_BY_ID[t]?.term}</Link>)}
              </div>
            </div>
          )}
          <button className={btn('primary', 'w-full')} onClick={() => navigate('pratiquer/exercice/ex-figures-manege')}>🧩 Exercice : lettres et figures</button>
        </div>
      </div>
    </div>
  );
};
