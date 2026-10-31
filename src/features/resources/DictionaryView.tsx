import React, { useEffect, useMemo, useState } from 'react';
import type { DictionaryCategory, Favorite, HistoryEntry, Level } from '../../types/models';
import { DICTIONARY, DICTIONARY_BY_ID, DICTIONARY_CATEGORIES } from '../../data/dictionary';
import { LEVEL_LABELS, LESSON_BY_ID } from '../../data/catalog';
import { buildIndex, search, suggest } from '../../services/search/search';
import { addHistory, clearHistory } from '../../services/storage/repos';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { Chips, EmptyState, FavoriteButton, Link, NoteEditor, PageHeader, btn, card, input } from '../../components/ui/kit';
import { overlays } from '../../app/overlays';
import { navigate } from '../../app/router';

const index = buildIndex(
  DICTIONARY.map((d) => ({ id: d.id, category: 'terme' as const, title: d.term, subtitle: d.short, body: d.explanation, keywords: d.aliases })),
);
const CAT_LABEL = Object.fromEntries(DICTIONARY_CATEGORIES.map((c) => [c.id, `${c.icon} ${c.label}`])) as Record<DictionaryCategory, string>;

export const DictionaryView: React.FC = () => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<DictionaryCategory | 'toutes'>('toutes');
  const [level, setLevel] = useState<Level | 'tous'>('tous');
  const [favOnly, setFavOnly] = useState(false);
  const favs = useLive(() => db.favorites.where('type').equals('term').toArray(), [], [] as Favorite[]);
  const history = useLive(async () => (await db.history.where('kind').equals('terme').sortBy('at')).reverse().slice(0, 8), [], [] as HistoryEntry[]);
  const favSet = new Set(favs.map((f) => f.targetId));

  const list = useMemo(() => {
    const base = q.trim() ? search(index, q).map((h) => DICTIONARY_BY_ID[h.id]) : [...DICTIONARY].sort((a, b) => a.term.localeCompare(b.term, 'fr'));
    return base.filter((d) => (cat === 'toutes' || d.category === cat) && (level === 'tous' || d.level === level) && (!favOnly || favSet.has(d.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat, level, favOnly, favs]);
  const suggestions = q.trim().length >= 2 ? suggest(index, q) : [];

  // Regroupement alphabétique (hors recherche).
  const groups = useMemo(() => {
    if (q.trim()) return [['', list]] as [string, typeof list][];
    const m = new Map<string, typeof list>();
    for (const d of list) {
      const letter = d.term.normalize('NFD').replace(/[̀-ͯ]/g, '')[0].toUpperCase();
      m.set(letter, [...(m.get(letter) ?? []), d]);
    }
    return [...m];
  }, [list, q]);

  return (
    <div className="space-y-4">
      <PageHeader title="Dictionnaire équestre" icon="📖" back="ressources" subtitle={`${DICTIONARY.length} termes`} help="Recherche instantanée, insensible aux accents. Dans les fiches, les mots soulignés ouvrent directement leur définition." />
      <div className="relative">
        <input className={input} type="search" placeholder="Rechercher un terme (ex. garrot, impulsion)…" aria-label="Rechercher un terme" value={q} onChange={(e) => setQ(e.target.value)} list="dict-suggestions" />
        <datalist id="dict-suggestions">{suggestions.map((s) => <option key={s} value={s} />)}</datalist>
      </div>
      <Chips label="Catégorie" value={cat} onChange={setCat} options={[{ id: 'toutes', label: 'Toutes' }, ...DICTIONARY_CATEGORIES.map((c) => ({ id: c.id, label: `${c.icon} ${c.label}` }))]} />
      <div className="flex flex-wrap items-center gap-2">
        <Chips label="Niveau" value={level} onChange={setLevel} options={[{ id: 'tous', label: 'Tous niveaux' }, ...(['debutant', 'intermediaire', 'confirme'] as Level[]).map((l) => ({ id: l, label: LEVEL_LABELS[l] }))]} />
        <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
          <input type="checkbox" className="w-4 h-4 accent-emerald-700" checked={favOnly} onChange={(e) => setFavOnly(e.target.checked)} /> ⭐ Favoris ({favs.length})
        </label>
      </div>

      {!q && history.length > 0 && (
        <div className="text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-stone-500 uppercase tracking-wide">Consultés récemment</span>
            <button className="text-stone-500 underline" onClick={() => void clearHistory('terme')}>Effacer</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {history.map((h) => DICTIONARY_BY_ID[h.value] && (
              <Link key={h.id} to={`ressources/dictionnaire/${h.value}`} className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1 font-semibold text-stone-700 dark:text-stone-200">{DICTIONARY_BY_ID[h.value].term}</Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-stone-500" aria-live="polite">{list.length} terme(s)</p>
      {list.length === 0 ? (
        <EmptyState icon="🔍" title="Aucun terme trouvé" text="Essayez un autre mot ou retirez les filtres." />
      ) : (
        groups.map(([letter, items]) => (
          <section key={letter || 'res'} aria-label={letter ? `Lettre ${letter}` : 'Résultats'}>
            {letter && <h2 className="sticky top-14 z-10 bg-stone-100/90 dark:bg-stone-950/90 backdrop-blur py-1 text-sm font-black text-emerald-800 dark:text-emerald-300">{letter}</h2>}
            <ul className="space-y-1.5 mt-1">
              {items.map((d) => (
                <li key={d.id}>
                  <Link to={`ressources/dictionnaire/${d.id}`} className={`${card} px-3 py-2.5 block hover:border-emerald-500`}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-bold text-stone-900 dark:text-stone-100">{favSet.has(d.id) && '⭐ '}{d.term}</span>
                      <span className="text-[10px] text-stone-500 shrink-0">{CAT_LABEL[d.category]}</span>
                    </span>
                    <span className="block text-xs text-stone-600 dark:text-stone-400 mt-0.5">{d.short}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
};

export const TermDetail: React.FC<{ id: string }> = ({ id }) => {
  const d = DICTIONARY_BY_ID[id];
  useEffect(() => {
    if (d) void addHistory('terme', d.id);
  }, [d]);
  if (!d) return <EmptyState icon="🔍" title="Terme introuvable" action={<button className={btn('primary')} onClick={() => navigate('ressources/dictionnaire')}>Dictionnaire</button>} />;
  const ill = d.illustration;
  const illTo = ill && (ill.kind === 'atlas' ? `ressources/atlas/${ill.id}` : ill.kind === 'materiel' ? `ressources/materiel/${ill.id}` : ill.kind === 'manege' ? `ressources/manege/${ill.id}` : `ressources/comportement/${ill.id}`);
  return (
    <div className="space-y-4">
      <PageHeader title={d.term} subtitle={`${CAT_LABEL[d.category]} · ${LEVEL_LABELS[d.level]}`} back="ressources/dictionnaire" actions={<FavoriteButton type="term" targetId={d.id} label={d.term} />} />
      <div className={`${card} p-4 space-y-3`}>
        <p className="font-semibold text-stone-900 dark:text-stone-100">{d.short}</p>
        <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{d.explanation}</p>
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-sm">
          <span className="font-bold text-amber-900 dark:text-amber-200">Exemple : </span>
          <span className="text-stone-700 dark:text-stone-300 italic">« {d.example} »</span>
        </div>
        {illTo && <Link to={illTo} className="inline-block text-sm font-semibold text-emerald-800 dark:text-emerald-300 underline underline-offset-2">🖼️ Voir l’illustration</Link>}
      </div>
      {d.related.length > 0 && (
        <div className={`${card} p-4`}>
          <h2 className="text-xs font-bold uppercase text-stone-500 mb-2">Termes associés</h2>
          <div className="flex flex-wrap gap-1.5">
            {d.related.map((r) => <Link key={r} to={`ressources/dictionnaire/${r}`} className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 text-xs font-semibold">{DICTIONARY_BY_ID[r]?.term}</Link>)}
          </div>
        </div>
      )}
      {d.lessonIds.length > 0 && (
        <div className={`${card} p-4`}>
          <h2 className="text-xs font-bold uppercase text-stone-500 mb-2">Fiches liées</h2>
          <ul className="space-y-1">{d.lessonIds.map((l) => <li key={l}><button className="text-left text-sm font-semibold text-emerald-800 dark:text-emerald-300 underline underline-offset-2" onClick={() => overlays.openLesson(l)}>📖 {LESSON_BY_ID[l]?.titleFr}</button></li>)}</ul>
        </div>
      )}
      <div className={`${card} p-4`}><NoteEditor type="term" targetId={d.id} /></div>
    </div>
  );
};
