/**
 * Répétition espacée (fonctions pures, testées dans src/tests/revision.test.ts).
 *
 * Suite d'intervalles indicative : 1, 3, 7, 14, 30 jours, puis intervalle × facilité.
 * - « Oublié » : retour à l'étape 0 et nouvelle présentation le jour même ; la facilité baisse.
 * - « Difficile » : on reste à la même étape avec un intervalle réduit de moitié.
 * - « Bien » : étape suivante.
 * - « Facile » : on saute une étape, intervalle majoré.
 * Une révision faite en retard et réussie est créditée d'une partie du retard (la notion a tenu).
 * Plusieurs échecs (lapses) abaissent durablement la facilité : la notion revient plus souvent.
 */
import type { RevisionGrade, RevisionItem } from '../../types/models';

export const BASE_INTERVALS = [1, 3, 7, 14, 30] as const;
const DAY = 86_400_000;
const MIN_EASE = 1.3;
const MAX_EASE = 3;

export function createRevisionItem(kind: RevisionItem['kind'], refId: string, now = new Date()): RevisionItem {
  return {
    id: `${kind}:${refId}`,
    kind,
    refId,
    step: 0,
    intervalDays: 0,
    ease: 2.5,
    dueAt: now.toISOString(),
    reviews: 0,
    lapses: 0,
  };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function scheduleReview(item: RevisionItem, grade: RevisionGrade, now = new Date()): RevisionItem {
  const lastDue = Date.parse(item.dueAt);
  const overdueDays = Number.isFinite(lastDue) ? Math.max(0, (now.getTime() - lastDue) / DAY) : 0;

  let step = item.step;
  let ease = item.ease;
  let interval: number;
  let lapses = item.lapses;

  switch (grade) {
    case 'oublie':
      step = 0;
      lapses += 1;
      ease = clamp(ease - 0.2, MIN_EASE, MAX_EASE);
      interval = 0; // à revoir aujourd'hui
      break;
    case 'difficile':
      ease = clamp(ease - 0.15, MIN_EASE, MAX_EASE);
      interval = Math.max(1, Math.round(intervalForStep(Math.max(step, 1), item.intervalDays, ease) * 0.5));
      break;
    case 'bien':
      step += 1;
      interval = intervalForStep(step, item.intervalDays, ease);
      break;
    case 'facile':
      step += 2;
      ease = clamp(ease + 0.15, MIN_EASE, MAX_EASE);
      interval = Math.round(intervalForStep(step, item.intervalDays, ease) * 1.3);
      break;
  }

  // Révision tardive réussie : on crédite la moitié du retard (plafonnée à l'intervalle).
  if ((grade === 'bien' || grade === 'facile') && overdueDays >= 1) {
    interval += Math.min(Math.floor(overdueDays / 2), interval);
  }
  // Une notion souvent oubliée ne s'éloigne pas trop vite.
  if (lapses >= 3 && grade !== 'oublie') interval = Math.max(1, Math.round(interval * 0.8));

  return {
    ...item,
    step,
    ease: Math.round(ease * 100) / 100,
    intervalDays: interval,
    lapses,
    reviews: item.reviews + 1,
    lastGrade: grade,
    lastReviewedAt: now.toISOString(),
    dueAt: new Date(now.getTime() + interval * DAY).toISOString(),
  };
}

/** Intervalle de l'étape `step` (1 = première révision). Au-delà de la suite : intervalle × facilité. */
function intervalForStep(step: number, previousInterval: number, ease: number): number {
  if (step <= 0) return 0;
  if (step <= BASE_INTERVALS.length) return BASE_INTERVALS[step - 1];
  return Math.round(Math.max(previousInterval, BASE_INTERVALS[BASE_INTERVALS.length - 1]) * ease);
}

/** Convertit un score d'exercice (0–1) en appréciation de révision. */
export function gradeFromScore(score: number): RevisionGrade {
  if (score >= 0.95) return 'facile';
  if (score >= 0.7) return 'bien';
  if (score >= 0.4) return 'difficile';
  return 'oublie';
}

export type RevisionBucket = 'en_retard' | 'du_jour' | 'a_venir' | 'maitrisee' | 'fragile';

/** Classement pour le tableau de révision. */
export function classifyRevision(item: RevisionItem, now = new Date()): RevisionBucket {
  const due = Date.parse(item.dueAt);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = startOfToday.getTime() + DAY;
  if (due < startOfToday.getTime() && item.reviews > 0) return 'en_retard';
  if (due < endOfToday) return 'du_jour';
  if (item.lapses >= 2 || item.lastGrade === 'difficile') return 'fragile';
  if (item.step >= 4) return 'maitrisee';
  return 'a_venir';
}
