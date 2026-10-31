/**
 * Index dérivés des contenus pédagogiques (calculés une fois au chargement du module).
 * - Les exercices associés à une compétence sont déduits des exercices qui la déclarent.
 * - Les quiz historiques des fiches (v1) sont convertis en exercices « Quiz de la fiche ».
 */
import type { DomainId, Exercise, ExerciseQuestion, Level, Skill } from '../types/models';
import type { Lesson, LessonCategory, QuizQuestion, SkillLevel } from '../types';
import { EXERCISES as BASE_EXERCISES } from './exercises';
import { SKILL_DEFS } from './skills';
import { LESSONS_CATALOG } from './lessons';
import { QUIZZES_CATALOG } from './quizzes';
import { FLASHCARDS } from './flashcards';

const CATEGORY_DOMAIN: Record<LessonCategory, DomainId> = {
  position: 'position',
  aides: 'aides',
  allures: 'allures',
  longe: 'travail_a_pied',
  plat_dressage: 'dressage',
  obstacle: 'obstacle',
  cross: 'obstacle',
  jeune_cheval: 'travail_a_pied',
  securite_ecurie: 'securite',
};

export const lessonLevel = (l: SkillLevel): Level =>
  l === 'avance' ? 'confirme' : l === 'intermediaire' ? 'intermediaire' : 'debutant';

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(LESSONS_CATALOG.map((l) => [l.id, l]));

function convertQuiz(q: QuizQuestion): ExerciseQuestion {
  if (q.type === 'true_false') {
    return { id: q.id, type: 'vrai_faux', prompt: q.questionFr, answer: q.correctOptionIndexes[0] === 0, explanation: q.explanationFr };
  }
  return {
    id: q.id,
    type: q.type === 'scenario' ? 'situation' : 'qcm',
    prompt: q.questionFr,
    options: q.options,
    correct: q.correctOptionIndexes,
    explanation: q.explanationFr,
  };
}

const lessonQuizExercises: Exercise[] = LESSONS_CATALOG.flatMap((lesson) => {
  const questions = QUIZZES_CATALOG.filter((q) => q.lessonId === lesson.id).map(convertQuiz);
  if (questions.length === 0) return [];
  const skillIds = SKILL_DEFS.filter((s) => s.lessonIds.includes(lesson.id)).map((s) => s.id);
  return [{
    id: `ex-fiche-${lesson.id}`,
    title: `Quiz de la fiche : ${lesson.titleFr}`,
    description: 'Vérifiez votre compréhension de la fiche.',
    domain: CATEGORY_DOMAIN[lesson.category],
    level: lessonLevel(lesson.level),
    objective: lesson.objectives[0] ?? lesson.summaryFr,
    difficulty: lesson.level === 'avance' ? 3 : lesson.level === 'intermediaire' ? 2 : 1,
    durationMin: 2,
    skillIds,
    questions: questions.map((q) => ({ ...q, resource: { kind: 'fiche' as const, id: lesson.id, label: `Relire : ${lesson.titleFr}` } })),
  }];
});

/** Exercice « cartes mémoire » construit à partir du paquet de révision (type flashcard). */
const FLASHCARD_EXERCISE_CARDS = FLASHCARDS.filter((f) => f.domain === 'dressage' || f.domain === 'aides');
const flashcardExercise: Exercise = {
  id: 'ex-cartes-notions-cles',
  title: 'Cartes mémoire : notions clés du dressage et des aides',
  description: 'Retournez chaque carte et dites honnêtement si vous saviez.',
  domain: 'dressage',
  level: 'intermediaire',
  objective: 'Mémoriser les définitions qui reviennent dans toutes les séances.',
  difficulty: 2,
  durationMin: 4,
  skillIds: [...new Set(FLASHCARD_EXERCISE_CARDS.flatMap((f) => f.skillIds))],
  questions: FLASHCARD_EXERCISE_CARDS.map((f) => ({
    id: `q-${f.id}`,
    type: 'flashcard' as const,
    prompt: 'Que savez-vous de cette notion ?',
    front: f.front,
    back: f.back,
    explanation: f.back,
    resource: f.termId ? { kind: 'terme' as const, id: f.termId, label: 'Voir la définition complète' } : undefined,
  })),
};

export const EXERCISES: Exercise[] = [...BASE_EXERCISES, flashcardExercise, ...lessonQuizExercises];
export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export const SKILLS: Skill[] = SKILL_DEFS.map((s) => ({
  ...s,
  exerciseIds: EXERCISES.filter((e) => e.skillIds.includes(s.id)).map((e) => e.id),
}));
export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

/** Toutes les questions (hors flashcards de révision), indexées pour la répétition espacée. */
export const QUESTION_INDEX: Record<string, { exerciseId: string; question: ExerciseQuestion }> = Object.fromEntries(
  EXERCISES.flatMap((e) => e.questions.map((q) => [q.id, { exerciseId: e.id, question: q }])),
);

export const FLASHCARD_BY_ID = Object.fromEntries(FLASHCARDS.map((f) => [f.id, f]));

/** Exercice associé à une fiche (pour le bouton « Quiz de la fiche »). */
export const exerciseForLesson = (lessonId: string) => EXERCISE_BY_ID[`ex-fiche-${lessonId}`];

export const LEVEL_LABELS: Record<Level, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  confirme: 'Confirmé',
};
