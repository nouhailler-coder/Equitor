/**
 * Calcul de la maîtrise d'une compétence (fonctions pures).
 *
 * La maîtrise n'est déduite QUE des évaluations (diagnostic, exercices, révisions) :
 * lire une fiche fait au plus passer la compétence « en cours d'apprentissage ».
 *
 * - Indice 0–100 = moyenne pondérée des 6 dernières évaluations (les plus récentes comptent plus).
 * - « Maîtrisé » exige un indice ≥ 85, au moins 3 évaluations, réparties sur au moins 2 jours,
 *   et une dernière évaluation réussie (≥ 0,7).
 * - Une compétence maîtrisée non réévaluée depuis 60 jours repasse « à réviser ».
 */
import type { MasteryState, SkillEvaluation, SkillProgress } from '../../types/models';

const DAY = 86_400_000;
const WINDOW = 6;
export const MASTERY_THRESHOLD = 85;
export const CONSOLIDATION_THRESHOLD = 60;
export const STALE_DAYS = 60;

export function masteryIndex(evaluations: SkillEvaluation[]): number {
  if (evaluations.length === 0) return 0;
  const recent = [...evaluations].sort((a, b) => a.at.localeCompare(b.at)).slice(-WINDOW);
  let weighted = 0;
  let weights = 0;
  recent.forEach((e, i) => {
    const w = i + 1; // 1 pour la plus ancienne, 6 pour la plus récente
    weighted += clamp01(e.score) * w;
    weights += w;
  });
  return Math.round((weighted / weights) * 100);
}

export function masteryState(
  evaluations: SkillEvaluation[],
  opts: { lessonViewed?: boolean; now?: Date } = {},
): MasteryState {
  const now = opts.now ?? new Date();
  if (evaluations.length === 0) return opts.lessonViewed ? 'apprentissage' : 'non_commence';

  const sorted = [...evaluations].sort((a, b) => a.at.localeCompare(b.at));
  const last = sorted[sorted.length - 1];
  const index = masteryIndex(sorted);
  const distinctDays = new Set(sorted.map((e) => e.at.slice(0, 10))).size;
  const daysSinceLast = (now.getTime() - Date.parse(last.at)) / DAY;

  if (index >= MASTERY_THRESHOLD && sorted.length >= 3 && distinctDays >= 2 && last.score >= 0.7) {
    return daysSinceLast > STALE_DAYS ? 'a_reviser' : 'maitrise';
  }
  if (last.score < 0.5) return 'a_reviser';
  if (index >= CONSOLIDATION_THRESHOLD) return 'consolidation';
  return sorted.length === 1 && last.score >= 0.5 ? 'apprentissage' : 'a_reviser';
}

/** Ajoute une évaluation et recalcule l'état. Conserve au plus 30 évaluations par compétence. */
export function applyEvaluation(
  current: SkillProgress | undefined,
  skillId: string,
  evaluation: SkillEvaluation,
  opts: { lessonViewed?: boolean; now?: Date } = {},
): SkillProgress {
  const evaluations = [...(current?.evaluations ?? []), { ...evaluation, score: clamp01(evaluation.score) }].slice(-30);
  return {
    skillId,
    evaluations,
    mastery: masteryIndex(evaluations),
    state: masteryState(evaluations, opts),
    updatedAt: evaluation.at,
  };
}

export const MASTERY_LABELS: Record<MasteryState, string> = {
  non_commence: 'Non commencé',
  apprentissage: 'En cours d’apprentissage',
  a_reviser: 'À réviser',
  consolidation: 'En consolidation',
  maitrise: 'Maîtrisé',
};

export const MASTERY_ORDER: MasteryState[] = ['non_commence', 'apprentissage', 'a_reviser', 'consolidation', 'maitrise'];

function clamp01(v: number) {
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
}
