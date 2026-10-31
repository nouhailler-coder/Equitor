/**
 * Enregistrement des résultats et mise à jour de la progression (IndexedDB).
 * Un résultat d'exercice met à jour, dans une seule transaction :
 * la tentative, les compétences associées et la planification des révisions.
 */
import type {
  DiagnosticResult,
  DomainId,
  ExerciseAttempt,
  QuestionResult,
  RevisionGrade,
  RevisionItem,
  SkillProgress,
} from '../../types/models';
import { db, newId, nowIso } from '../storage/db';
import { applyEvaluation } from './mastery';
import { createRevisionItem, gradeFromScore, scheduleReview } from '../revision/spacedRepetition';
import { EXERCISE_BY_ID, SKILLS } from '../../data/catalog';
import { FLASHCARD_BY_ID } from '../../data/catalog';

async function lessonViewedForSkill(skillId: string): Promise<boolean> {
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill || skill.lessonIds.length === 0) return false;
  return (await db.lessonProgress.where('lessonId').anyOf(skill.lessonIds).count()) > 0;
}

async function evaluateSkill(skillId: string, score: number, source: 'diagnostic' | 'exercice' | 'revision', refId: string, at: string) {
  const current = await db.skillProgress.get(skillId);
  const next = applyEvaluation(current, skillId, { at, source, refId, score }, { lessonViewed: await lessonViewedForSkill(skillId) });
  await db.skillProgress.put(next);
}

export async function recordExerciseAttempt(params: {
  exerciseId: string;
  startedAt: string;
  results: QuestionResult[];
}): Promise<ExerciseAttempt> {
  const exercise = EXERCISE_BY_ID[params.exerciseId];
  if (!exercise) throw new Error(`Exercice inconnu : ${params.exerciseId}`);
  const finishedAt = nowIso();
  const score = params.results.length ? params.results.reduce((s, r) => s + r.score, 0) / params.results.length : 0;

  return db.transaction('rw', [db.exerciseAttempts, db.skillProgress, db.revisionItems, db.lessonProgress], async () => {
    const previous = await db.exerciseAttempts.where('exerciseId').equals(exercise.id).count();
    const attempt: ExerciseAttempt = {
      id: newId('attempt'),
      exerciseId: exercise.id,
      startedAt: params.startedAt,
      finishedAt,
      durationSec: Math.max(0, Math.round((Date.parse(finishedAt) - Date.parse(params.startedAt)) / 1000)),
      score,
      results: params.results,
      errors: params.results.filter((r) => r.score < 0.5).map((r) => r.questionId),
      attemptNumber: previous + 1,
    };
    await db.exerciseAttempts.put(attempt);

    for (const skillId of exercise.skillIds) await evaluateSkill(skillId, score, 'exercice', exercise.id, finishedAt);

    // Chaque question répondue entre dans la répétition espacée (les flashcards ont leur propre suivi).
    for (const r of params.results) {
      const id = `question:${r.questionId}`;
      const item = (await db.revisionItems.get(id)) ?? createRevisionItem('question', r.questionId);
      await db.revisionItems.put(scheduleReview(item, gradeFromScore(r.score)));
    }
    return attempt;
  });
}

/** Révision d'une carte mémoire ou d'une question depuis le tableau de révision. */
export async function recordRevision(kind: RevisionItem['kind'], refId: string, grade: RevisionGrade): Promise<RevisionItem> {
  const now = nowIso();
  return db.transaction('rw', [db.revisionItems, db.skillProgress, db.lessonProgress], async () => {
    const id = `${kind}:${refId}`;
    const item = (await db.revisionItems.get(id)) ?? createRevisionItem(kind, refId);
    const next = scheduleReview(item, grade);
    await db.revisionItems.put(next);
    const score = grade === 'facile' ? 1 : grade === 'bien' ? 0.8 : grade === 'difficile' ? 0.5 : 0;
    const skillIds = kind === 'flashcard' ? (FLASHCARD_BY_ID[refId]?.skillIds ?? []) : skillsForQuestion(refId);
    for (const s of skillIds) await evaluateSkill(s, score, 'revision', refId, now);
    return next;
  });
}

function skillsForQuestion(questionId: string): string[] {
  for (const e of Object.values(EXERCISE_BY_ID)) {
    if (e.questions.some((q) => q.id === questionId)) return e.skillIds;
  }
  return [];
}

/** Enregistre l'ouverture d'une fiche (n'implique jamais la maîtrise). */
export async function recordLessonView(lessonId: string) {
  const now = nowIso();
  await db.transaction('rw', db.lessonProgress, db.skillProgress, async () => {
    const p = await db.lessonProgress.get(lessonId);
    await db.lessonProgress.put(
      p
        ? { ...p, lastViewedAt: now, viewCount: p.viewCount + 1, status: p.status === 'non_commence' ? 'en_cours' : p.status }
        : { lessonId, status: 'en_cours', firstViewedAt: now, lastViewedAt: now, viewCount: 1, readingSeconds: 0 },
    );
    // Les compétences liées passent « en cours d'apprentissage » si elles n'ont aucune évaluation.
    for (const s of SKILLS.filter((sk) => sk.lessonIds.includes(lessonId))) {
      const sp = await db.skillProgress.get(s.id);
      if (!sp) {
        await db.skillProgress.put({ skillId: s.id, state: 'apprentissage', mastery: 0, evaluations: [], updatedAt: now } satisfies SkillProgress);
      }
    }
  });
}

/** Ajoute le temps de lecture (plafonné à 30 min par ouverture pour éviter les onglets oubliés). */
export async function addReadingTime(lessonId: string, seconds: number) {
  const s = Math.min(Math.max(0, Math.round(seconds)), 1800);
  if (s < 3) return;
  await db.lessonProgress.where('lessonId').equals(lessonId).modify((p) => {
    p.readingSeconds += s;
  });
}

export async function setLessonStatus(lessonId: string, status: 'non_commence' | 'en_cours' | 'termine') {
  const now = nowIso();
  const p = await db.lessonProgress.get(lessonId);
  await db.lessonProgress.put({
    lessonId,
    firstViewedAt: p?.firstViewedAt ?? now,
    viewCount: p?.viewCount ?? 1,
    readingSeconds: p?.readingSeconds ?? 0,
    lastViewedAt: now,
    status,
    completedAt: status === 'termine' ? now : undefined,
  });
}

/** Enregistre un diagnostic : chaque compétence évaluée reçoit une évaluation « diagnostic ». */
export async function completeDiagnostic(params: {
  answers: { domain: DomainId; skillIds: string[]; score: number; questionId: string }[];
  recommendedSkillIds: string[];
}): Promise<DiagnosticResult> {
  const now = nowIso();
  const byDomain = new Map<DomainId, number[]>();
  for (const a of params.answers) byDomain.set(a.domain, [...(byDomain.get(a.domain) ?? []), a.score]);
  const domainScores = Object.fromEntries([...byDomain].map(([d, s]) => [d, s.reduce((x, y) => x + y, 0) / s.length]));
  const globalScore = params.answers.length ? params.answers.reduce((s, a) => s + a.score, 0) / params.answers.length : 0;
  const result: DiagnosticResult = { id: newId('diagnostic'), completedAt: now, domainScores, globalScore, recommendedSkillIds: params.recommendedSkillIds };

  await db.transaction('rw', [db.diagnostics, db.skillProgress, db.profile, db.lessonProgress], async () => {
    await db.diagnostics.put(result);
    for (const a of params.answers) for (const s of a.skillIds) await evaluateSkill(s, a.score, 'diagnostic', a.questionId, now);
    const profile = await db.profile.get('me');
    if (profile) await db.profile.put({ ...profile, diagnosticCompletedAt: now, updatedAt: now });
  });
  return result;
}
