import React, { useEffect, useMemo, useState } from 'react';
import { useEscape } from '../../hooks/useEscape';
import { Search, X } from 'lucide-react';
import type { Favorite, HistoryEntry, Horse, JournalEntry, SessionPlan } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { addHistory, clearHistory } from '../../services/storage/repos';
import { buildIndex, search, suggest, type SearchCategory, type SearchDoc } from '../../services/search/search';
import { LESSONS_CATALOG } from '../../data/lessons';
import { CHAPTERS_CATALOG } from '../../data/chapters';
import { DICTIONARY } from '../../data/dictionary';
import { EXERCISES, SKILLS } from '../../data/catalog';
import { EQUIPMENT } from '../../data/equipment';
import { BEHAVIORS } from '../../data/behaviors';
import { ARENA_FIGURES } from '../../data/arenaFigures';
import { ATLAS } from '../../data/atlas';
import { SESSION_TYPE_LABEL } from '../../data/labels';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { navigate } from '../../app/router';
import { overlays } from '../../app/overlays';
import { Chips } from '../ui/kit';

/** Contenus statiques indexés une seule fois. */
const STATIC_DOCS: SearchDoc[] = [
  ...LESSONS_CATALOG.map((l) => ({ id: `fiche:${l.id}`, category: 'fiche' as const, title: l.titleFr, subtitle: l.sectionThematique, body: `${l.summaryFr} ${l.vocabulary.join(' ')}` })),
  ...CHAPTERS_CATALOG.map((c) => ({ id: `chapitre:${c.id}`, category: 'fiche' as const, title: `Module ${c.number} — ${c.titleFr}`, subtitle: c.themePrincipal, body: c.summaryFr })),
  ...DICTIONARY.map((d) => ({ id: `terme:${d.id}`, category: 'terme' as const, title: d.term, subtitle: d.short, body: d.explanation, keywords: d.aliases })),
  ...EXERCISES.filter((e) => !e.id.startsWith('ex-fiche-')).map((e) => ({ id: `exercice:${e.id}`, category: 'exercice' as const, title: e.title, subtitle: e.description, body: e.objective })),
  ...SKILLS.map((s) => ({ id: `competence:${s.id}`, category: 'competence' as const, title: s.name, subtitle: s.description })),
  ...EQUIPMENT.map((e) => ({ id: `materiel:${e.id}`, category: 'ressource' as const, title: e.name, subtitle: 'Atelier du matériel', body: `${e.description} ${e.parts.map((p) => p.name).join(' ')}` })),
  ...BEHAVIORS.map((b) => ({ id: `comportement:${b.id}`, category: 'ressource' as const, title: b.title, subtitle: 'Comportement du cheval', body: b.description })),
  ...ARENA_FIGURES.map((f) => ({ id: `manege:${f.id}`, category: 'ressource' as const, title: f.name, subtitle: 'Manège interactif', body: f.description })),
  ...Object.entries(ATLAS).map(([id, a]) => ({ id: `atlas:${id}`, category: 'ressource' as const, title: a.name, subtitle: 'Atlas anatomique', body: a.explanation })),
];

const CATEGORIES: { id: SearchCategory | 'tout'; label: string }[] = [
  { id: 'tout', label: 'Tout' },
  { id: 'fiche', label: '📖 Fiches' },
  { id: 'terme', label: '🔤 Dictionnaire' },
  { id: 'exercice', label: '🧩 Exercices' },
  { id: 'competence', label: '🎯 Compétences' },
  { id: 'ressource', label: '🗂️ Ressources' },
  { id: 'journal', label: '📓 Journal' },
  { id: 'cheval', label: '🐴 Chevaux' },
  { id: 'programme', label: '🗓️ Programmes' },
];

function openDoc(id: string) {
  const [kind, ref] = [id.slice(0, id.indexOf(':')), id.slice(id.indexOf(':') + 1)];
  const routes: Record<string, string> = {
    terme: `ressources/dictionnaire/${ref}`,
    exercice: `pratiquer/exercice/${ref}`,
    competence: `progression/competences/${ref}`,
    materiel: `ressources/materiel/${ref}`,
    comportement: `ressources/comportement/${ref}`,
    manege: `ressources/manege/${ref}`,
    atlas: `ressources/atlas/${ref}`,
    journal: `journal/seance/${ref}`,
    cheval: `journal/chevaux/${ref}`,
    programme: `pratiquer/preparation/${ref}`,
  };
  if (kind === 'fiche') overlays.openLesson(ref);
  else if (kind === 'chapitre') overlays.openChapter(ref);
  else if (routes[kind]) navigate(routes[kind]);
}

export const SearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<SearchCategory | 'tout'>('tout');
  const ref = React.useRef<HTMLDivElement>(null);
  useFocusTrap(ref, isOpen);

  const horses = useLive(() => db.horses.toArray(), [], [] as Horse[]);
  const entries = useLive(() => db.ridingSessions.toArray(), [], [] as JournalEntry[]);
  const plans = useLive(() => db.sessionPlans.toArray(), [], [] as SessionPlan[]);
  const favorites = useLive(() => db.favorites.toArray(), [], [] as Favorite[]);
  const history = useLive(async () => (await db.history.where('kind').equals('recherche').sortBy('at')).reverse().slice(0, 6), [], [] as HistoryEntry[]);

  const index = useMemo(() => {
    const fav = new Set(favorites.map((f) => `${f.type}:${f.targetId}`));
    const boost = (type: string, id: string) => (fav.has(`${type}:${id}`) ? 25 : 0);
    const dynamic: SearchDoc[] = [
      ...horses.map((h) => ({ id: `cheval:${h.id}`, category: 'cheval' as const, title: h.name, subtitle: [h.breed, h.coat].filter(Boolean).join(' · '), body: `${h.nickname ?? ''} ${h.particularities ?? ''} ${h.notes ?? ''}` })),
      ...entries.map((e) => ({ id: `journal:${e.id}`, category: 'journal' as const, title: e.title, subtitle: `${e.date} · ${SESSION_TYPE_LABEL[e.sessionType]}`, body: [e.objectives.join(' '), e.exercises.join(' '), e.positives, e.difficulties, e.comments, e.personalNotes].join(' '), boost: boost('journal', e.id) })),
      ...plans.map((p) => ({ id: `programme:${p.id}`, category: 'programme' as const, title: p.title, subtitle: 'Programme de préparation', body: `${p.objective} ${p.notes}` })),
    ];
    const statics = STATIC_DOCS.map((d) => {
      const [k, r] = [d.id.split(':')[0], d.id.slice(d.id.indexOf(':') + 1)];
      const type = k === 'fiche' ? 'lesson' : k === 'terme' ? 'term' : k === 'exercice' ? 'exercise' : k;
      return { ...d, boost: boost(type, r) };
    });
    return buildIndex([...statics, ...dynamic]);
  }, [horses, entries, plans, favorites]);

  const results = useMemo(() => (query.trim() ? search(index, query, { categories: cat === 'tout' ? undefined : [cat], limit: 40 }) : []), [index, query, cat]);
  const suggestions = useMemo(() => (query.trim().length >= 2 && results.length === 0 ? [] : suggest(index, query, 4)), [index, query, results.length]);

  useEscape(!!isOpen, onClose);

  if (!isOpen) return null;

  const choose = (id: string) => {
    void addHistory('recherche', query);
    onClose();
    openDoc(id);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center sm:p-4" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Recherche globale" onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-white dark:bg-stone-900 sm:rounded-3xl shadow-2xl flex flex-col max-h-[100dvh] sm:max-h-[85dvh]">
        <div className="p-3 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2">
          <Search className="w-5 h-5 text-stone-400 shrink-0" aria-hidden="true" />
          <input
            autoFocus
            data-autofocus
            type="search"
            className="flex-1 bg-transparent text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none py-2"
            placeholder="Fiches, termes, exercices, journal, chevaux…"
            aria-label="Rechercher dans toute l’application"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && results[0] && choose(results[0].id)}
          />
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800" aria-label="Fermer la recherche"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-3 pt-2"><Chips label="Catégorie de résultats" value={cat} onChange={setCat} options={CATEGORIES} /></div>
        <div className="overflow-y-auto p-3 flex-1">
          {!query.trim() ? (
            <div className="space-y-3 text-sm">
              {history.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold uppercase text-stone-500">Recherches récentes</p>
                    <button className="text-xs text-stone-500 underline" onClick={() => void clearHistory('recherche')}>Effacer</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">{history.map((h) => <button key={h.id} className="rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs font-semibold" onClick={() => setQuery(h.value)}>{h.value}</button>)}</div>
                </div>
              )}
              <p className="text-stone-500">La recherche fonctionne hors ligne, sans tenir compte des accents ni des petites fautes de frappe.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-sm text-stone-500 space-y-2">
              <p>Aucun résultat pour « {query} ».</p>
              {suggestions.length > 0 && <p>Suggestions : {suggestions.map((s) => <button key={s} className="underline font-semibold mr-2" onClick={() => setQuery(s)}>{s}</button>)}</p>}
            </div>
          ) : (
            <ul className="space-y-1" aria-live="polite">
              {results.map((r) => (
                <li key={r.id}>
                  <button onClick={() => choose(r.id)} className="w-full text-left rounded-xl px-3 py-2.5 hover:bg-stone-100 dark:hover:bg-stone-800">
                    <span className="block text-sm font-bold text-stone-900 dark:text-stone-100">{r.boost ? '⭐ ' : ''}{r.title}</span>
                    <span className="block text-xs text-stone-500 truncate">{CATEGORIES.find((c) => c.id === r.category)?.label} · {r.subtitle}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
