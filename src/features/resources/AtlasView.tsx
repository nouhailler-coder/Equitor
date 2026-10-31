import React, { useState } from 'react';
import { ATLAS, ATLAS_VIEWS } from '../../data/atlas';
import { INTERACTIVE_VIEWS } from '../../data/interactiveViews';
import { DICTIONARY_BY_ID } from '../../data/dictionary';
import { LESSON_BY_ID } from '../../data/catalog';
import { InteractiveSvg } from '../../components/ui/InteractiveSvg';
import { Chips, FavoriteButton, Link, PageHeader, btn, card } from '../../components/ui/kit';
import { navigate } from '../../app/router';
import { overlays } from '../../app/overlays';

type ViewId = (typeof ATLAS_VIEWS)[number]['id'];

/** Vue où se trouve une région (pour les liens directs #/ressources/atlas/garrot). */
const viewOfRegion = (regionId: string): ViewId =>
  (ATLAS_VIEWS.find((v) => INTERACTIVE_VIEWS[v.id].regions.some((r) => r.id === regionId))?.id ?? 'anatomie-profil') as ViewId;

const QUIZ_FOR_VIEW: Partial<Record<ViewId, string>> = {
  'anatomie-profil': 'ex-anatomie-regions',
  'anatomie-membres': 'ex-anatomie-membres',
  'anatomie-tete': 'ex-anatomie-tete-pied',
};

export const AtlasView: React.FC<{ regionId?: string }> = ({ regionId }) => {
  const [view, setView] = useState<ViewId>(regionId ? viewOfRegion(regionId) : 'anatomie-profil');
  const [selected, setSelected] = useState<string | null>(regionId ?? null);
  const entry = selected ? ATLAS[selected] : null;
  const v = INTERACTIVE_VIEWS[view];
  const quiz = QUIZ_FOR_VIEW[view] ?? 'ex-anatomie-regions';
  return (
    <div className="space-y-4">
      <PageHeader title="Atlas anatomique" icon="🦴" back="ressources" subtitle="Touchez une région du schéma" help="Illustrations originales et simplifiées à visée pédagogique : ce ne sont pas des planches vétérinaires de référence." />
      <Chips label="Vue" value={view} onChange={(id) => { setView(id); setSelected(null); }} options={ATLAS_VIEWS.map((x) => ({ id: x.id, label: x.label }))} />
      <div className="grid lg:grid-cols-[1fr_20rem] gap-4 items-start">
        <div className={`${card} p-2`}>
          <InteractiveSvg view={v} selected={selected} showLabels onSelect={setSelected} />
          <p className="text-[11px] text-stone-500 text-center pb-1">Schéma pédagogique simplifié — {v.title}</p>
        </div>
        <div className="space-y-3">
          {entry ? (
            <div className={`${card} p-4 space-y-2`} aria-live="polite">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-black text-lg text-stone-900 dark:text-stone-50">{entry.name}</h2>
                <FavoriteButton type="anatomy" targetId={selected!} label={entry.name} />
              </div>
              <p className="text-sm text-stone-700 dark:text-stone-300">{entry.explanation}</p>
              <p className="text-sm"><strong className="text-stone-900 dark:text-stone-100">Fonction générale : </strong><span className="text-stone-700 dark:text-stone-300">{entry.fonction}</span></p>
              <div className="flex flex-wrap gap-2 pt-1">
                {entry.termId && DICTIONARY_BY_ID[entry.termId] && <Link to={`ressources/dictionnaire/${entry.termId}`} className="text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-2.5 py-1">📖 {DICTIONARY_BY_ID[entry.termId].term}</Link>}
                {entry.lessonIds?.map((l) => <button key={l} onClick={() => overlays.openLesson(l)} className="text-xs font-semibold rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1">📄 {LESSON_BY_ID[l]?.titleFr}</button>)}
              </div>
            </div>
          ) : (
            <div className={`${card} p-4 text-sm text-stone-500`}>Sélectionnez une région pour afficher son nom, une explication et sa fonction générale.</div>
          )}
          <ul className={`${card} p-3 grid grid-cols-2 gap-1`} aria-label="Liste des régions">
            {v.regions.map((r) => (
              <li key={r.id}>
                <button onClick={() => setSelected(r.id)} aria-pressed={selected === r.id} className={`w-full text-left text-xs rounded-lg px-2 py-1.5 ${selected === r.id ? 'bg-amber-100 dark:bg-amber-950 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`}>{r.label}</button>
              </li>
            ))}
          </ul>
          <button className={btn('primary', 'w-full')} onClick={() => navigate(`pratiquer/exercice/${quiz}`)}>🧩 Quiz d’identification</button>
        </div>
      </div>
    </div>
  );
};
