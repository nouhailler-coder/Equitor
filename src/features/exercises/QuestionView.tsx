import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, X } from 'lucide-react';
import type { ExerciseQuestion, ResourceLink } from '../../types/models';
import { normalizeAnswer, scoreQuestion, seededShuffle, type Answer } from '../../services/exercises/scoring';
import { INTERACTIVE_VIEWS } from '../../data/interactiveViews';
import { InteractiveSvg } from '../../components/ui/InteractiveSvg';
import { btn, input } from '../../components/ui/kit';
import { navigate } from '../../app/router';
import { overlays } from '../../app/overlays';

const TYPE_LABEL: Record<ExerciseQuestion['type'], string> = {
  qcm: 'QCM',
  vrai_faux: 'Vrai ou faux',
  association: 'Associations',
  classement: 'Classement',
  image: 'Identification sur image',
  texte_a_completer: 'Texte à compléter',
  ouverte: 'Question ouverte',
  notion: 'Reconnaître la notion',
  situation: 'Situation pédagogique',
  flashcard: 'Carte mémoire',
};

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

export function openResource(r: ResourceLink) {
  switch (r.kind) {
    case 'fiche':
      overlays.openLesson(r.id);
      break;
    case 'terme':
      navigate(`ressources/dictionnaire/${r.id}`);
      break;
    case 'atlas':
      navigate(`ressources/atlas/${r.id}`);
      break;
    case 'materiel':
      navigate(`ressources/materiel/${r.id}`);
      break;
    case 'manege':
      navigate(`ressources/manege/${r.id}`);
      break;
    case 'comportement':
      navigate(`ressources/comportement/${r.id}`);
      break;
  }
}

const Option: React.FC<{ selected: boolean; state?: 'ok' | 'ko' | 'missed'; onClick: () => void; children: React.ReactNode; multi?: boolean; disabled?: boolean }> = ({
  selected,
  state,
  onClick,
  children,
  multi,
  disabled,
}) => {
  const tone =
    state === 'ok'
      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
      : state === 'ko'
        ? 'border-red-500 bg-red-50 dark:bg-red-950/50'
        : state === 'missed'
          ? 'border-emerald-600 border-dashed'
          : selected
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40'
            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-400';
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 px-3.5 py-3 text-sm font-medium text-stone-800 dark:text-stone-100 transition flex items-start gap-2.5 ${tone}`}
    >
      <span className={`mt-0.5 w-4 h-4 shrink-0 border-2 ${multi ? 'rounded' : 'rounded-full'} ${selected ? 'bg-amber-500 border-amber-500' : 'border-stone-400'}`} aria-hidden="true" />
      <span className="flex-1">{children}</span>
      {state === 'ok' && <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-label="Bonne réponse" />}
      {state === 'ko' && <X className="w-4 h-4 text-red-600 shrink-0" aria-label="Mauvaise réponse" />}
    </button>
  );
};

/**
 * Affiche une question, recueille la réponse et la corrige.
 * `onAnswered(score, given)` est appelé une fois la réponse validée.
 */
export const QuestionView: React.FC<{
  question: ExerciseQuestion;
  onAnswered: (score: number, given: Answer) => void;
  answered: boolean;
}> = ({ question: q, onAnswered, answered }) => {
  const seed = hash(q.id);
  const [selected, setSelected] = useState<number[]>([]);
  const [tf, setTf] = useState<boolean | null>(null);
  const rightOrder = useMemo(() => (q.type === 'association' ? seededShuffle(q.pairs.map((_, i) => i), seed) : []), [q, seed]);
  const [mapping, setMapping] = useState<Record<number, number>>({});
  const [order, setOrder] = useState<string[]>(() => (q.type === 'classement' ? seededShuffle(q.items, seed + 3) : []));
  const [region, setRegion] = useState<string | null>(null);
  const [blanks, setBlanks] = useState<string[]>(() => (q.type === 'texte_a_completer' ? q.blanks.map(() => '') : []));
  const [focusBlank, setFocusBlank] = useState(0);
  const [openText, setOpenText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [points, setPoints] = useState<boolean[]>(() => (q.type === 'ouverte' ? q.keyPoints.map(() => false) : []));
  const [flipped, setFlipped] = useState(false);
  const [given, setGiven] = useState<Answer | null>(null);

  const submit = (a: Answer) => {
    setGiven(a);
    onAnswered(scoreQuestion(q, a), a);
  };

  const body = (() => {
    switch (q.type) {
      case 'qcm':
      case 'notion':
      case 'situation': {
        const multi = q.correct.length > 1;
        return (
          <div className="space-y-3">
            {q.context && (
              <div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 p-3 text-sm text-stone-800 dark:text-stone-200">
                {q.type === 'situation' ? '📍 ' : '🔎 '}
                {q.context}
              </div>
            )}
            {multi && <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Plusieurs réponses possibles.</p>}
            <div className="space-y-2" role={multi ? 'group' : 'radiogroup'} aria-label="Propositions">
              {q.options.map((o, i) => (
                <Option
                  key={i}
                  multi={multi}
                  disabled={answered}
                  selected={selected.includes(i)}
                  state={answered ? (q.correct.includes(i) ? (selected.includes(i) ? 'ok' : 'missed') : selected.includes(i) ? 'ko' : undefined) : undefined}
                  onClick={() => setSelected((s) => (multi ? (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]) : [i]))}
                >
                  {o}
                </Option>
              ))}
            </div>
            {!answered && (
              <button className={btn('primary', 'w-full')} disabled={selected.length === 0} onClick={() => submit({ type: 'choix', selected })}>
                Valider
              </button>
            )}
          </div>
        );
      }
      case 'vrai_faux':
        return (
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Vrai ou faux">
            {[true, false].map((v) => (
              <Option
                key={String(v)}
                disabled={answered}
                selected={tf === v}
                state={answered ? (q.answer === v ? (tf === v ? 'ok' : 'missed') : tf === v ? 'ko' : undefined) : undefined}
                onClick={() => {
                  setTf(v);
                  submit({ type: 'vrai_faux', value: v });
                }}
              >
                {v ? 'Vrai' : 'Faux'}
              </Option>
            ))}
          </div>
        );
      case 'association':
        return (
          <div className="space-y-2.5">
            {q.pairs.map((p, i) => {
              const ok = answered ? mapping[i] === i : undefined;
              return (
                <div key={i} className={`rounded-xl border-2 p-2.5 ${answered ? (ok ? 'border-emerald-600' : 'border-red-500') : 'border-stone-200 dark:border-stone-700'}`}>
                  <label htmlFor={`${q.id}-a-${i}`} className="block text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">{p.left}</label>
                  <select
                    id={`${q.id}-a-${i}`}
                    className={input}
                    disabled={answered}
                    value={mapping[i] ?? ''}
                    onChange={(e) => setMapping((m) => ({ ...m, [i]: Number(e.target.value) }))}
                  >
                    <option value="" disabled>Choisir…</option>
                    {rightOrder.map((ri) => (
                      <option key={ri} value={ri}>{q.pairs[ri].right}</option>
                    ))}
                  </select>
                  {answered && !ok && <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">✓ {p.right}</p>}
                </div>
              );
            })}
            {!answered && (
              <button className={btn('primary', 'w-full')} disabled={Object.keys(mapping).length < q.pairs.length} onClick={() => submit({ type: 'association', mapping })}>
                Valider
              </button>
            )}
          </div>
        );
      case 'classement':
        return (
          <div className="space-y-2">
            <ol className="space-y-1.5">
              {order.map((item, i) => {
                const ok = answered ? q.items[i] === item : undefined;
                const move = (d: -1 | 1) =>
                  setOrder((o) => {
                    const n = [...o];
                    [n[i], n[i + d]] = [n[i + d], n[i]];
                    return n;
                  });
                return (
                  <li key={item} className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 bg-white dark:bg-stone-900 ${answered ? (ok ? 'border-emerald-600' : 'border-red-500') : 'border-stone-200 dark:border-stone-700'}`}>
                    <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-stone-800 dark:text-stone-100">{item}</span>
                    {!answered && (
                      <>
                        <button className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30" disabled={i === 0} onClick={() => move(-1)} aria-label={`Monter « ${item} »`}>
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30" disabled={i === order.length - 1} onClick={() => move(1)} aria-label={`Descendre « ${item} »`}>
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
            {answered && <p className="text-xs text-emerald-700 dark:text-emerald-300">Ordre attendu : {q.items.join(' → ')}</p>}
            {!answered && (
              <button className={btn('primary', 'w-full')} onClick={() => submit({ type: 'classement', order })}>
                Valider l’ordre
              </button>
            )}
          </div>
        );
      case 'image': {
        const view = INTERACTIVE_VIEWS[q.viewId];
        return (
          <div className="space-y-2">
            <div className="rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2">
              <InteractiveSvg
                view={view}
                selected={region}
                showLabels={answered}
                onSelect={answered ? undefined : (id) => setRegion(id)}
                feedback={answered ? { correct: q.targetId, wrong: region !== q.targetId ? (region ?? undefined) : undefined } : undefined}
              />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
              {region && !answered ? 'Zone sélectionnée. Validez ou touchez une autre zone.' : 'Touchez la zone sur le schéma (schéma pédagogique simplifié).'}
            </p>
            {!answered && (
              <button className={btn('primary', 'w-full')} disabled={!region} onClick={() => region && submit({ type: 'image', regionId: region })}>
                Valider
              </button>
            )}
          </div>
        );
      }
      case 'texte_a_completer': {
        const parts = q.text.split(/(\{\{\d+\}\})/);
        return (
          <div className="space-y-3">
            <p className="text-base leading-loose text-stone-800 dark:text-stone-100">
              {parts.map((part, i) => {
                const m = part.match(/\{\{(\d+)\}\}/);
                if (!m) return <span key={i}>{part}</span>;
                const idx = Number(m[1]);
                const ok = answered ? q.blanks[idx].some((acc) => normalizeAnswer(acc) === normalizeAnswer(blanks[idx])) : undefined;
                return (
                  <input
                    key={i}
                    aria-label={`Trou ${idx + 1}`}
                    value={blanks[idx]}
                    disabled={answered}
                    onFocus={() => setFocusBlank(idx)}
                    onChange={(e) => setBlanks((b) => b.map((v, k) => (k === idx ? e.target.value : v)))}
                    className={`inline-block w-32 mx-1 px-2 py-1 rounded-lg border-2 text-sm bg-white dark:bg-stone-950 ${answered ? (ok ? 'border-emerald-600' : 'border-red-500') : 'border-amber-400'}`}
                  />
                );
              })}
            </p>
            {q.wordBank && !answered && (
              <div className="flex flex-wrap gap-1.5" aria-label="Banque de mots">
                {q.wordBank.map((w) => (
                  <button key={w} type="button" className="rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs font-semibold" onClick={() => setBlanks((b) => b.map((v, k) => (k === focusBlank ? w : v)))}>
                    {w}
                  </button>
                ))}
              </div>
            )}
            {answered && <p className="text-xs text-emerald-700 dark:text-emerald-300">Réponses attendues : {q.blanks.map((b) => b[0]).join(' · ')}</p>}
            {!answered && (
              <button className={btn('primary', 'w-full')} disabled={blanks.some((b) => !b.trim())} onClick={() => submit({ type: 'texte', values: blanks })}>
                Valider
              </button>
            )}
          </div>
        );
      }
      case 'ouverte':
        return (
          <div className="space-y-3">
            <textarea className={`${input} min-h-28`} placeholder="Rédigez votre réponse avec vos mots…" value={openText} onChange={(e) => setOpenText(e.target.value)} disabled={revealed} aria-label="Votre réponse" />
            {!revealed ? (
              <button className={btn('primary', 'w-full')} onClick={() => setRevealed(true)}>Voir la correction indicative</button>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 p-3 text-sm">
                  <p className="font-bold text-emerald-900 dark:text-emerald-200 mb-1">Correction indicative</p>
                  <p className="text-stone-700 dark:text-stone-300">{q.modelAnswer}</p>
                </div>
                <fieldset disabled={answered}>
                  <legend className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">Cochez les points clés présents dans votre réponse :</legend>
                  {q.keyPoints.map((kp, i) => (
                    <label key={i} className="flex items-start gap-2 py-1.5 text-sm text-stone-700 dark:text-stone-300">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-emerald-700" checked={points[i]} onChange={(e) => setPoints((p) => p.map((v, k) => (k === i ? e.target.checked : v)))} />
                      {kp}
                    </label>
                  ))}
                </fieldset>
                {!answered && (
                  <button className={btn('primary', 'w-full')} onClick={() => submit({ type: 'auto_evaluation', points })}>Valider mon auto-évaluation</button>
                )}
              </div>
            )}
          </div>
        );
      case 'flashcard':
        return (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="w-full min-h-40 rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-5 text-left"
              aria-label={flipped ? 'Carte retournée : verso' : 'Retourner la carte'}
            >
              <p className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-300 mb-2">{flipped ? 'Verso' : 'Recto — touchez pour retourner'}</p>
              <p className="text-base font-semibold text-stone-900 dark:text-stone-100">{flipped ? q.back : q.front}</p>
            </button>
            {flipped && !answered && (
              <div className="grid grid-cols-2 gap-2">
                <button className={btn('secondary')} onClick={() => submit({ type: 'flashcard', knew: false })}>Je ne savais pas</button>
                <button className={btn('primary')} onClick={() => submit({ type: 'flashcard', knew: true })}>Je savais</button>
              </div>
            )}
          </div>
        );
    }
  })();

  const score = given ? scoreQuestion(q, given) : 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{TYPE_LABEL[q.type]}</p>
        <h2 className="text-lg font-black text-stone-900 dark:text-stone-50 leading-snug mt-1">{q.prompt}</h2>
      </div>
      {body}
      {answered && given && (
        <div
          className={`rounded-2xl p-4 space-y-2 text-sm border ${
            score >= 0.99 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900' : score > 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900' : 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900'
          }`}
          role="status"
        >
          <p className="font-black text-stone-900 dark:text-stone-50">
            {score >= 0.99 ? '✅ Bonne réponse' : score > 0 ? `🟠 Réponse partielle (${Math.round(score * 100)} %)` : '❌ Ce n’est pas la bonne réponse'}
          </p>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{q.explanation}</p>
          {q.commonMistakes && (
            <p className="text-stone-600 dark:text-stone-400">
              <strong>Erreur fréquente :</strong> {q.commonMistakes}
            </p>
          )}
          {q.resource && (
            <button className="text-emerald-800 dark:text-emerald-300 font-semibold underline underline-offset-2" onClick={() => openResource(q.resource!)}>
              📎 {q.resource.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
