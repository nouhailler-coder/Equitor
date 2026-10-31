/**
 * Statistiques calculées UNIQUEMENT à partir des données enregistrées (fonctions pures).
 * Aucune valeur n'est estimée ni inventée : sans données, les indicateurs valent zéro.
 */
import type {
  DomainId,
  ExerciseAttempt,
  JournalEntry,
  LegacyQuizAttempt,
  LessonProgress,
  MasteryState,
  SkillProgress,
} from '../../types/models';

const DAY = 86_400_000;

export const isoDay = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Lundi de la semaine d'une date (ISO). */
export function weekStart(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift);
  return isoDay(d);
}

export interface JournalStats {
  count: number;
  totalMinutes: number;
  averageMinutes: number;
  byType: Record<string, number>;
  byDiscipline: Record<string, number>;
  /** Nombre de séances par semaine sur les `weeks` dernières semaines (la plus ancienne d'abord). */
  perWeek: { week: string; count: number; minutes: number }[];
  averagePerWeek: number;
  feelingTrend: { date: string; feeling: number }[];
  skillsWorked: Record<string, number>;
}

export function journalStats(entries: JournalEntry[], now = new Date(), weeks = 12): JournalStats {
  const totalMinutes = entries.reduce((s, e) => s + (e.durationMinutes || 0), 0);
  const byType: Record<string, number> = {};
  const byDiscipline: Record<string, number> = {};
  const skillsWorked: Record<string, number> = {};
  for (const e of entries) {
    byType[e.sessionType] = (byType[e.sessionType] ?? 0) + 1;
    if (e.discipline) byDiscipline[e.discipline] = (byDiscipline[e.discipline] ?? 0) + 1;
    for (const s of e.skillIds ?? []) skillsWorked[s] = (skillsWorked[s] ?? 0) + 1;
  }
  const buckets: { week: string; count: number; minutes: number }[] = [];
  const thisWeek = new Date(weekStart(now) + 'T00:00:00');
  for (let i = weeks - 1; i >= 0; i--) {
    buckets.push({ week: isoDay(new Date(thisWeek.getTime() - i * 7 * DAY)), count: 0, minutes: 0 });
  }
  for (const e of entries) {
    const w = weekStart(new Date(e.date + 'T12:00:00'));
    const b = buckets.find((x) => x.week === w);
    if (b) {
      b.count += 1;
      b.minutes += e.durationMinutes || 0;
    }
  }
  return {
    count: entries.length,
    totalMinutes,
    averageMinutes: entries.length ? Math.round(totalMinutes / entries.length) : 0,
    byType,
    byDiscipline,
    perWeek: buckets,
    averagePerWeek: Math.round((buckets.reduce((s, b) => s + b.count, 0) / weeks) * 10) / 10,
    feelingTrend: [...entries].sort((a, b) => a.date.localeCompare(b.date)).map((e) => ({ date: e.date, feeling: e.feeling })),
    skillsWorked,
  };
}

export interface LearningStats {
  lessonsViewed: number;
  lessonsCompleted: number;
  exercisesDone: number;
  distinctExercises: number;
  successRate: number;
  skillsByState: Record<MasteryState, number>;
  /** Temps d'apprentissage en minutes (lecture + exercices). */
  learningMinutes: number;
  /** Nombre de jours d'activité sur les 30 derniers jours. */
  activeDays30: number;
  /** Série actuelle de jours consécutifs avec activité. */
  streak: number;
  scoreTrend: { date: string; score: number }[];
  byDomain: Partial<Record<DomainId, { mastery: number; skills: number }>>;
}

export function learningStats(params: {
  lessons: LessonProgress[];
  attempts: ExerciseAttempt[];
  legacyQuiz: LegacyQuizAttempt[];
  skills: SkillProgress[];
  skillDomains: Record<string, DomainId>;
  totalSkills: number;
  now?: Date;
}): LearningStats {
  const now = params.now ?? new Date();
  const skillsByState: Record<MasteryState, number> = { non_commence: 0, apprentissage: 0, a_reviser: 0, consolidation: 0, maitrise: 0 };
  for (const s of params.skills) skillsByState[s.state] += 1;
  skillsByState.non_commence += Math.max(0, params.totalSkills - params.skills.length);

  const legacyCorrect = params.legacyQuiz.filter((q) => q.isCorrect).length;
  const scoreSum = params.attempts.reduce((s, a) => s + a.score, 0) + legacyCorrect;
  const scoreCount = params.attempts.length + params.legacyQuiz.length;

  const activity = new Set<string>();
  params.attempts.forEach((a) => activity.add(isoDay(new Date(a.finishedAt))));
  params.lessons.forEach((l) => activity.add(isoDay(new Date(l.lastViewedAt))));
  params.legacyQuiz.forEach((q) => activity.add(isoDay(new Date(q.attemptedAt))));
  const since = now.getTime() - 30 * DAY;
  const activeDays30 = [...activity].filter((d) => new Date(d + 'T12:00:00').getTime() >= since).length;

  // Aujourd'hui sans activité : la série qui s'est arrêtée hier compte encore.
  let streak = 0;
  let i = activity.has(isoDay(now)) ? 0 : 1;
  while (activity.has(isoDay(new Date(now.getTime() - i * DAY)))) {
    streak++;
    i++;
  }

  const byDomainAcc: Record<string, { sum: number; n: number }> = {};
  for (const s of params.skills) {
    const d = params.skillDomains[s.skillId];
    if (!d) continue;
    byDomainAcc[d] = byDomainAcc[d] ?? { sum: 0, n: 0 };
    byDomainAcc[d].sum += s.mastery;
    byDomainAcc[d].n += 1;
  }

  return {
    lessonsViewed: params.lessons.length,
    lessonsCompleted: params.lessons.filter((l) => l.status === 'termine').length,
    exercisesDone: params.attempts.length,
    distinctExercises: new Set(params.attempts.map((a) => a.exerciseId)).size,
    successRate: scoreCount ? Math.round((scoreSum / scoreCount) * 100) : 0,
    skillsByState,
    learningMinutes: Math.round(
      (params.lessons.reduce((s, l) => s + l.readingSeconds, 0) + params.attempts.reduce((s, a) => s + a.durationSec, 0)) / 60,
    ),
    activeDays30,
    streak,
    scoreTrend: [...params.attempts]
      .sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))
      .map((a) => ({ date: a.finishedAt.slice(0, 10), score: Math.round(a.score * 100) })),
    byDomain: Object.fromEntries(
      Object.entries(byDomainAcc).map(([d, v]) => [d, { mastery: Math.round(v.sum / v.n), skills: v.n }]),
    ) as LearningStats['byDomain'],
  };
}
