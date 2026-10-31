/**
 * Correction des questions (fonctions pures). Chaque type renvoie un score 0–1 ;
 * les types à plusieurs éléments (association, classement, texte à trous, question ouverte)
 * donnent un crédit partiel.
 */
import type { ExerciseQuestion } from '../../types/models';

export const normalizeAnswer = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Réponses attendues par type. */
export type Answer =
  | { type: 'choix'; selected: number[] }
  | { type: 'vrai_faux'; value: boolean }
  | { type: 'association'; mapping: Record<number, number> } // index gauche → index droite
  | { type: 'classement'; order: string[] }
  | { type: 'image'; regionId: string }
  | { type: 'texte'; values: string[] }
  | { type: 'auto_evaluation'; points: boolean[] } // question ouverte : points clés couverts
  | { type: 'flashcard'; knew: boolean };

export function scoreQuestion(q: ExerciseQuestion, a: Answer): number {
  switch (q.type) {
    case 'qcm':
    case 'notion':
    case 'situation': {
      if (a.type !== 'choix') return 0;
      const sel = new Set(a.selected);
      const correct = new Set(q.correct);
      if (correct.size === 1) return sel.size === 1 && correct.has([...sel][0]) ? 1 : 0;
      // Choix multiples : bonnes cases cochées moins mauvaises, ramené à 0–1.
      let good = 0;
      let bad = 0;
      sel.forEach((i) => (correct.has(i) ? good++ : bad++));
      return Math.max(0, (good - bad) / correct.size);
    }
    case 'vrai_faux':
      return a.type === 'vrai_faux' && a.value === q.answer ? 1 : 0;
    case 'association': {
      if (a.type !== 'association') return 0;
      const ok = q.pairs.filter((_, i) => a.mapping[i] === i).length;
      return ok / q.pairs.length;
    }
    case 'classement': {
      if (a.type !== 'classement' || a.order.length !== q.items.length) return 0;
      const ok = q.items.filter((item, i) => a.order[i] === item).length;
      return ok / q.items.length;
    }
    case 'image':
      return a.type === 'image' && a.regionId === q.targetId ? 1 : 0;
    case 'texte_a_completer': {
      if (a.type !== 'texte') return 0;
      const ok = q.blanks.filter((accepted, i) =>
        accepted.some((acc) => normalizeAnswer(acc) === normalizeAnswer(a.values[i] ?? '')),
      ).length;
      return ok / q.blanks.length;
    }
    case 'ouverte': {
      if (a.type !== 'auto_evaluation' || q.keyPoints.length === 0) return 0;
      return a.points.filter(Boolean).length / q.keyPoints.length;
    }
    case 'flashcard':
      return a.type === 'flashcard' && a.knew ? 1 : 0;
  }
}

/** Score global d'une série : moyenne des scores de questions. */
export function scoreSeries(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((s, v) => s + v, 0) / scores.length;
}

/** Mélange déterministe (graine) : utile pour les tests et pour l'ordre des propositions. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  // Graine ramenée dans [1, 233279] : une graine négative produirait des indices hors limites.
  let s = Math.abs(Math.trunc(seed)) % 233280 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
