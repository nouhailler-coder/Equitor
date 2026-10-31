import React, { useEffect, useMemo, useState } from 'react';
import { Layers, Play, Printer } from 'lucide-react';
import type { DomainId, RevisionGrade, RevisionItem } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { classifyRevision } from '../../services/revision/spacedRepetition';
import { recordRevision } from '../../services/progression/progressService';
import { safeWrite } from '../../services/feedback/toast';
import { FLASHCARDS, type Flashcard } from '../../data/flashcards';
import { FLASHCARD_BY_ID, QUESTION_INDEX, EXERCISE_BY_ID } from '../../data/catalog';
import { DOMAINS, DOMAIN_BY_ID } from '../../data/skills';
import { QuestionView } from '../exercises/QuestionView';
import { Chips, EmptyState, Link, PageHeader, ProgressBar, StatTile, btn, card } from '../../components/ui/kit';
import { navigate } from '../../app/router';
import { printFlashcards } from '../../services/export/print';

const GRADES: { id: RevisionGrade; label: string; tone: string }[] = [
  { id: 'oublie', label: 'Oublié', tone: 'bg-red-600 hover:bg-red-500 text-white' },
  { id: 'difficile', label: 'Difficile', tone: 'bg-amber-500 hover:bg-amber-400 text-stone-950' },
  { id: 'bien', label: 'Bien', tone: 'bg-emerald-700 hover:bg-emerald-600 text-white' },
  { id: 'facile', label: 'Facile', tone: 'bg-sky-700 hover:bg-sky-600 text-white' },
];

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};

const itemTitle = (it: RevisionItem) =>
  it.kind === 'flashcard' ? (FLASHCARD_BY_ID[it.refId]?.front ?? it.refId) : (QUESTION_INDEX[it.refId]?.question.prompt ?? it.refId);

/** Tableau de révision. */
export const RevisionView: React.FC = () => {
  const items = useLive(() => db.revisionItems.toArray(), [], [] as RevisionItem[]);
  const now = new Date();
  const buckets = useMemo(() => {
    const b = { en_retard: [] as RevisionItem[], du_jour: [] as RevisionItem[], maitrisee: [] as RevisionItem[], fragile: [] as RevisionItem[], a_venir: [] as RevisionItem[] };
    items.forEach((i) => b[classifyRevision(i, now)].push(i));
    return b;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
  const knownCards = new Set(items.filter((i) => i.kind === 'flashcard').map((i) => i.refId));
  const toDiscover = FLASHCARDS.filter((f) => !knownCards.has(f.id));
  const due = buckets.en_retard.length + buckets.du_jour.length;

  return (
    <div className="space-y-5">
      <PageHeader title="Réviser" icon="💡" subtitle="Répétition espacée : chaque notion revient au bon moment" help="Intervalles indicatifs de 1, 3, 7, 14 puis 30 jours, raccourcis si une notion est difficile ou oubliée, allongés si elle est facile." />

      <div className={`${card} p-5 text-center space-y-3`}>
        <p className="text-4xl font-black text-stone-900 dark:text-stone-50">{due}</p>
        <p className="text-sm text-stone-600 dark:text-stone-300">révision(s) à faire aujourd’hui{buckets.en_retard.length ? `, dont ${buckets.en_retard.length} en retard` : ''}</p>
        <button className={btn('primary', 'w-full text-base')} disabled={due === 0} onClick={() => navigate('reviser/session')}>
          <Play className="w-4 h-4" /> {due ? 'Commencer mes révisions' : 'Rien à réviser pour l’instant'}
        </button>
        {due === 0 && toDiscover.length > 0 && (
          <button className={btn('secondary', 'w-full')} onClick={() => navigate('reviser/session/decouverte')}>Découvrir 5 nouvelles notions</button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <StatTile icon="📅" value={buckets.du_jour.length} label="du jour" />
        <StatTile icon="⏰" value={buckets.en_retard.length} label="en retard" />
        <StatTile icon="🏅" value={buckets.maitrisee.length} label="maîtrisées" />
        <StatTile icon="⚠️" value={buckets.fragile.length} label="fragiles" />
        <StatTile icon="🌱" value={toDiscover.length} label="à découvrir" onClick={() => navigate('reviser/cartes')} />
      </div>

      <Link to="reviser/cartes" className={`${card} p-4 flex items-center gap-3 hover:border-emerald-500`}>
        <Layers className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
        <span className="flex-1">
          <span className="block font-bold text-sm text-stone-900 dark:text-stone-100">Cartes mémoire ({FLASHCARDS.length})</span>
          <span className="block text-xs text-stone-500">Parcourir, retourner, noter et consulter l’historique</span>
        </span>
      </Link>

      {buckets.fragile.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-black text-base text-stone-900 dark:text-stone-100">⚠️ Notions fragiles</h2>
          <ul className="space-y-1.5">
            {buckets.fragile.slice(0, 8).map((i) => (
              <li key={i.id} className={`${card} px-3 py-2 text-sm text-stone-800 dark:text-stone-200 flex justify-between gap-2`}>
                <span className="truncate">{itemTitle(i)}</span>
                <span className="text-xs text-stone-500 shrink-0">{i.lapses} oubli(s)</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {items.length === 0 && (
        <EmptyState icon="🌱" title="Aucune révision planifiée" text="Faites un exercice ou découvrez des cartes mémoire : les notions entreront automatiquement dans vos révisions." action={<button className={btn('primary')} onClick={() => navigate('reviser/session/decouverte')}>Découvrir des notions</button>} />
      )}
    </div>
  );
};

/** Session de révision : notions dues (ou découverte de nouvelles cartes). */
export const RevisionSession: React.FC<{ discover?: boolean }> = ({ discover }) => {
  const [queue, setQueue] = useState<{ kind: RevisionItem['kind']; refId: string }[] | null>(null);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState<number | null>(null);
  const [done, setDone] = useState(0);

  // La file est figée au démarrage pour ne pas bouger pendant la session.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let next: { kind: RevisionItem['kind']; refId: string }[];
      if (discover) {
        const known = new Set((await db.revisionItems.where('kind').equals('flashcard').toArray()).map((i) => i.refId));
        next = FLASHCARDS.filter((f) => !known.has(f.id)).slice(0, 5).map((f) => ({ kind: 'flashcard' as const, refId: f.id }));
      } else {
        const dueItems = await db.revisionItems.where('dueAt').belowOrEqual(endOfToday()).sortBy('dueAt');
        next = dueItems.filter((i) => (i.kind === 'flashcard' ? FLASHCARD_BY_ID[i.refId] : QUESTION_INDEX[i.refId])).map((i) => ({ kind: i.kind, refId: i.refId }));
      }
      if (!cancelled) setQueue(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [discover]);

  if (!queue) return null;
  if (queue.length === 0 || pos >= queue.length) {
    return (
      <div className="space-y-4">
        <PageHeader title="Révisions" back="reviser" />
        <EmptyState icon="🎉" title={done ? `Bravo, ${done} notion(s) révisée(s) !` : 'Rien à réviser'} text="Les prochaines révisions sont planifiées automatiquement." action={<button className={btn('primary')} onClick={() => navigate('reviser', { replace: true })}>Retour au tableau</button>} />
      </div>
    );
  }

  const cur = queue[pos];
  const grade = async (g: RevisionGrade) => {
    await safeWrite(() => recordRevision(cur.kind, cur.refId, g));
    setDone((d) => d + 1);
    // Une notion oubliée revient en fin de session.
    if (g === 'oublie') setQueue((q) => (q ? [...q, cur] : q));
    setPos((p) => p + 1);
    setFlipped(false);
    setAnswered(null);
  };

  const card_ = cur.kind === 'flashcard' ? FLASHCARD_BY_ID[cur.refId] : null;
  const q = cur.kind === 'question' ? QUESTION_INDEX[cur.refId] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="text-sm font-semibold text-stone-500" onClick={() => navigate('reviser', { replace: true })}>Terminer</button>
        <div className="flex-1"><ProgressBar value={(pos / queue.length) * 100} label="Avancement des révisions" tone="amber" /></div>
        <span className="text-xs font-bold text-stone-600 dark:text-stone-300">{pos + 1}/{queue.length}</span>
      </div>

      {card_ && (
        <>
          <FlipCard card={card_} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
          {flipped ? <GradeButtons onGrade={grade} /> : <button className={btn('primary', 'w-full')} onClick={() => setFlipped(true)}>Retourner la carte</button>}
        </>
      )}

      {q && (
        <div className={`${card} p-4`}>
          <p className="text-[11px] text-stone-500 mb-2">{EXERCISE_BY_ID[q.exerciseId]?.title}</p>
          <QuestionView key={cur.refId + pos} question={q.question} answered={answered !== null} onAnswered={(s) => setAnswered(s)} />
          {answered !== null && (
            <div className="mt-4 space-y-2">
              {answered >= 0.99 ? (
                <>
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Comment l’avez-vous ressentie ?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {GRADES.slice(1).map((g) => (
                      <button key={g.id} className={`rounded-xl py-3 text-sm font-bold ${g.tone}`} onClick={() => void grade(g.id)}>{g.label}</button>
                    ))}
                  </div>
                </>
              ) : (
                <button className={btn('primary', 'w-full')} onClick={() => void grade(answered >= 0.5 ? 'difficile' : 'oublie')}>Continuer</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FlipCard: React.FC<{ card: Flashcard; flipped: boolean; onFlip: () => void }> = ({ card: c, flipped, onFlip }) => {
  const d = DOMAIN_BY_ID[c.domain];
  return (
    <button
      onClick={onFlip}
      className="w-full min-h-56 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white dark:from-stone-900 dark:to-stone-900 p-6 text-left shadow-sm"
      aria-label={flipped ? `Verso : ${c.back}` : `Recto : ${c.front}. Touchez pour retourner.`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">{d.icon} {d.label} · {flipped ? 'Verso' : 'Recto'}</p>
      <p className={`mt-3 ${flipped ? 'text-base' : 'text-xl font-black'} text-stone-900 dark:text-stone-50 leading-relaxed`}>{flipped ? c.back : c.front}</p>
      {!flipped && <p className="mt-6 text-xs text-stone-500">Touchez pour retourner</p>}
    </button>
  );
};

const GradeButtons: React.FC<{ onGrade: (g: RevisionGrade) => void }> = ({ onGrade }) => (
  <div className="space-y-1.5">
    <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 text-center">Votre niveau de maîtrise ?</p>
    <div className="grid grid-cols-4 gap-1.5">
      {GRADES.map((g) => (
        <button key={g.id} className={`rounded-xl py-3 text-sm font-bold ${g.tone}`} onClick={() => onGrade(g.id)}>{g.label}</button>
      ))}
    </div>
  </div>
);

/** Parcours libre des cartes mémoire, avec historique par carte. */
export const FlashcardsView: React.FC = () => {
  const [domain, setDomain] = useState<DomainId | 'tous'>('tous');
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const items = useLive(() => db.revisionItems.where('kind').equals('flashcard').toArray(), [], [] as RevisionItem[]);
  const deck = FLASHCARDS.filter((f) => domain === 'tous' || f.domain === domain);
  const c = deck[Math.min(pos, deck.length - 1)];
  const hist = items.find((i) => i.refId === c?.id);
  const domainsInDeck = DOMAINS.filter((d) => FLASHCARDS.some((f) => f.domain === d.id));
  const go = (p: number) => {
    setPos((p + deck.length) % deck.length);
    setFlipped(false);
  };
  return (
    <div className="space-y-4">
      <PageHeader
        title="Cartes mémoire"
        icon="🃏"
        back="reviser"
        subtitle={`${deck.length} carte(s)`}
        actions={<button className={btn('secondary')} onClick={() => printFlashcards(deck, 'Fiche de révision — cartes mémoire')} aria-label="Exporter en PDF"><Printer className="w-4 h-4" /></button>}
      />
      <Chips label="Domaine" value={domain} onChange={(v) => { setDomain(v); setPos(0); setFlipped(false); }} options={[{ id: 'tous', label: 'Toutes' }, ...domainsInDeck.map((d) => ({ id: d.id, label: `${d.icon} ${d.label}` }))]} />
      {c && (
        <>
          <FlipCard card={c} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
          {flipped && <GradeButtons onGrade={async (g) => { await safeWrite(() => recordRevision('flashcard', c.id, g), 'Révision enregistrée'); go(pos + 1); }} />}
          <div className="grid grid-cols-3 gap-2">
            <button className={btn('secondary')} onClick={() => go(pos - 1)}>Précédente</button>
            <button className={btn('secondary')} onClick={() => { setPos(0); setFlipped(false); }}>Recommencer</button>
            <button className={btn('secondary')} onClick={() => go(pos + 1)}>Suivante</button>
          </div>
          <div className={`${card} p-3 text-xs text-stone-600 dark:text-stone-300`}>
            <p className="font-bold text-stone-800 dark:text-stone-100 mb-1">Historique de cette carte</p>
            {hist ? (
              <p>
                {hist.reviews} révision(s) · dernière : {hist.lastReviewedAt ? new Date(hist.lastReviewedAt).toLocaleDateString('fr-FR') : '—'} ({GRADES.find((g) => g.id === hist.lastGrade)?.label ?? '—'}) · prochaine : {new Date(hist.dueAt).toLocaleDateString('fr-FR')} · {hist.lapses} oubli(s)
              </p>
            ) : (
              <p>Jamais révisée.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
