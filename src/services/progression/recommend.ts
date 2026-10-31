/**
 * Parcours personnalisé (fonctions pures) : propose les compétences à travailler ensuite.
 * Critères : prérequis acquis (consolidation ou maîtrise), niveau compatible avec le profil,
 * domaines d'intérêt et lacunes du diagnostic en priorité, compétences fragiles d'abord.
 */
import type { DomainId, Level, MasteryState, Skill, SkillProgress } from '../../types/models';

const LEVEL_RANK: Record<Level, number> = { debutant: 0, intermediaire: 1, confirme: 2 };
const ACQUIRED: MasteryState[] = ['consolidation', 'maitrise'];

export interface RecommendationInput {
  skills: Skill[];
  progress: Record<string, SkillProgress | undefined>;
  level: Level;
  interests: DomainId[];
  domainScores?: Partial<Record<DomainId, number>>;
}

export function prerequisitesMet(skill: Skill, progress: RecommendationInput['progress']): boolean {
  return skill.prerequisites.every((p) => ACQUIRED.includes(progress[p]?.state ?? 'non_commence'));
}

export function recommendSkills(input: RecommendationInput, limit = 6): Skill[] {
  const maxLevel = LEVEL_RANK[input.level] + 1; // on autorise un niveau au-dessus du profil
  const scored = input.skills
    .filter((s) => input.progress[s.id]?.state !== 'maitrise')
    .filter((s) => LEVEL_RANK[s.level] <= maxLevel)
    .filter((s) => prerequisitesMet(s, input.progress))
    .map((s) => {
      const p = input.progress[s.id];
      let score = 0;
      if (p?.state === 'a_reviser') score += 40;
      if (p?.state === 'apprentissage') score += 25;
      if (input.interests.includes(s.domain)) score += 20;
      const d = input.domainScores?.[s.domain];
      if (d !== undefined) score += Math.round((1 - d) * 30); // lacunes du diagnostic
      score += (2 - Math.abs(LEVEL_RANK[s.level] - LEVEL_RANK[input.level])) * 5;
      score -= (p?.mastery ?? 0) / 10;
      return { s, score };
    })
    .sort((a, b) => b.score - a.score || a.s.id.localeCompare(b.s.id));
  return scored.slice(0, limit).map((x) => x.s);
}

/** Domaines classés du plus fragile au plus solide, d'après un diagnostic. */
export function rankDomains(domainScores: Partial<Record<DomainId, number>>) {
  return (Object.entries(domainScores) as [DomainId, number][]).sort((a, b) => a[1] - b[1]);
}
