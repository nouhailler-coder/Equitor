import React, { createContext, useContext, useMemo, useState } from 'react';
import { DICTIONARY, DICTIONARY_BY_ID } from '../../data/dictionary';
import { normalize, search, buildIndex } from '../../services/search/search';
import { addHistory } from '../../services/storage/repos';
import { navigate } from '../../app/router';
import { Modal, btn, input } from './kit';

/**
 * Navigation contextuelle du dictionnaire : les termes présents dans un texte deviennent
 * cliquables et ouvrent une définition rapide, sans quitter la page.
 */
type Ctx = { open: (termId: string) => void };
const TermCtx = createContext<Ctx>({ open: () => {} });

/** Formes reconnues : terme, alias et terme sans article entre parenthèses. */
const MATCHERS = DICTIONARY.flatMap((d) =>
  [d.term.replace(/\s*\(.*\)\s*/, ''), ...(d.aliases ?? [])]
    .filter((f) => f.length >= 4)
    .map((form) => ({ id: d.id, form: normalize(form) })),
).sort((a, b) => b.form.length - a.form.length);

/** Repère les termes du dictionnaire dans un texte (au plus une fois chacun). Pur, testable. */
export function findTerms(text: string): { start: number; end: number; id: string }[] {
  // Normalisation caractère par caractère pour conserver les positions d'origine.
  // Un caractère normalisé par caractère d'origine : les positions restent alignées.
  const norm = [...text].map((c) => normalize(c)[0] ?? ' ').join('');
  const isWord = (ch?: string) => !!ch && /[a-z0-9]/.test(ch);
  const used = new Set<string>();
  const taken: boolean[] = new Array(norm.length).fill(false);
  const found: { start: number; end: number; id: string }[] = [];
  for (const m of MATCHERS) {
    if (used.has(m.id)) continue;
    for (let i = norm.indexOf(m.form); i >= 0; i = norm.indexOf(m.form, i + 1)) {
      let end = i + m.form.length;
      if (isWord(norm[i - 1])) continue;
      if (isWord(norm[end])) {
        // pluriel simple accepté : « barres », « tendons », « chevaux » (x)
        if (/[sx]/.test(norm[end]) && !isWord(norm[end + 1])) end += 1;
        else continue;
      }
      if (taken.slice(i, end).some(Boolean)) continue;
      for (let k = i; k < end; k++) taken[k] = true;
      found.push({ start: i, end, id: m.id });
      used.add(m.id);
      break;
    }
  }
  return found.sort((a, b) => a.start - b.start);
}

export const TermText: React.FC<{ text: string }> = ({ text }) => {
  const { open } = useContext(TermCtx);
  const parts = useMemo(() => {
    const chars = [...text];
    const out: React.ReactNode[] = [];
    let pos = 0;
    for (const f of findTerms(text)) {
      if (f.start > pos) out.push(chars.slice(pos, f.start).join(''));
      out.push(
        <button
          key={f.start}
          type="button"
          onClick={() => open(f.id)}
          className="underline decoration-dotted decoration-emerald-600 underline-offset-2 text-inherit font-medium hover:text-emerald-700 dark:hover:text-emerald-300"
          aria-label={`Définition : ${DICTIONARY_BY_ID[f.id].term}`}
        >
          {chars.slice(f.start, f.end).join('')}
        </button>,
      );
      pos = f.end;
    }
    if (pos < chars.length) out.push(chars.slice(pos).join(''));
    return out;
  }, [text, open]);
  return <>{parts}</>;
};

const quickIndex = buildIndex(DICTIONARY.map((d) => ({ id: d.id, category: 'terme' as const, title: d.term, body: d.short, keywords: d.aliases })));

/** Fournit la fiche de définition rapide (avec recherche intégrée) aux TermText enfants. */
export const TermProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [termId, setTermId] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const ctx = useMemo<Ctx>(() => ({ open: (id) => {
    setTermId(id);
    setQ('');
    void addHistory('terme', id);
  } }), []);
  const term = termId ? DICTIONARY_BY_ID[termId] : null;
  const results = q.trim() ? search(quickIndex, q, { limit: 6 }) : [];
  return (
    <TermCtx.Provider value={ctx}>
      {children}
      <Modal
        open={!!term}
        onClose={() => setTermId(null)}
        title={term?.term ?? ''}
        size="sm"
        footer={
          term && (
            <button
              className={btn('primary', 'w-full')}
              onClick={() => {
                setTermId(null);
                navigate(`ressources/dictionnaire/${term.id}`);
              }}
            >
              Voir la fiche complète
            </button>
          )
        }
      >
        {term && (
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-stone-900 dark:text-stone-100">{term.short}</p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">{term.explanation}</p>
            {term.related.length > 0 && (
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Notions associées</p>
                <div className="flex flex-wrap gap-1.5">
                  {term.related.map((r) => (
                    <button key={r} onClick={() => ctx.open(r)} className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 text-xs font-semibold">
                      {DICTIONARY_BY_ID[r]?.term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <label className="text-xs font-bold text-stone-500" htmlFor="term-quick-search">Chercher un autre terme</label>
              <input id="term-quick-search" className={`${input} mt-1`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ex. impulsion, garrot…" />
              <ul className="mt-1">
                {results.map((r) => (
                  <li key={r.id}>
                    <button className="w-full text-left py-1.5 text-sm text-emerald-800 dark:text-emerald-300 font-semibold" onClick={() => ctx.open(r.id)}>
                      {r.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </TermCtx.Provider>
  );
};

export const useTermPopover = () => useContext(TermCtx);
