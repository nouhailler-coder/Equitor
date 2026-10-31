/**
 * Modèles de données d'ÉquiProgression (schéma IndexedDB v2).
 * Règles : identifiants stables (chaînes), dates au format ISO 8601, aucune donnée redondante.
 * Description détaillée : docs/SCHEMA_DONNEES.md.
 */

/** Date-heure ISO 8601 complète, ex. 2026-10-30T21:15:00.000Z */
export type ISODateTime = string;
/** Date calendaire ISO 8601, ex. 2026-10-30 */
export type ISODate = string;

/* ───────────────────────── Référentiel pédagogique ───────────────────────── */

export type Level = 'debutant' | 'intermediaire' | 'confirme';

export type DomainId =
  | 'connaissance_cheval'
  | 'anatomie'
  | 'comportement'
  | 'securite'
  | 'materiel'
  | 'equipement'
  | 'allures'
  | 'position'
  | 'aides'
  | 'travail_a_pied'
  | 'dressage'
  | 'obstacle'
  | 'theorie';

export interface Domain {
  id: DomainId;
  label: string;
  icon: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  domain: DomainId;
  level: Level;
  prerequisites: string[];
  lessonIds: string[];
  exerciseIds: string[];
}

/** États de maîtrise : la consultation seule ne mène jamais au-delà de « apprentissage ». */
export type MasteryState = 'non_commence' | 'apprentissage' | 'a_reviser' | 'consolidation' | 'maitrise';

export interface SkillEvaluation {
  at: ISODateTime;
  source: 'diagnostic' | 'exercice' | 'revision';
  refId: string;
  /** Score entre 0 et 1. */
  score: number;
}

export interface SkillProgress {
  skillId: string;
  state: MasteryState;
  /** Indice de maîtrise 0–100, calculé à partir des évaluations. */
  mastery: number;
  evaluations: SkillEvaluation[];
  updatedAt: ISODateTime;
}

/* ───────────────────────── Profil ───────────────────────── */

export type Experience = 'aucune' | 'moins_1_an' | '1_3_ans' | 'plus_3_ans';

export interface UserProfile {
  id: 'me';
  firstName?: string;
  level: Level;
  experience: Experience;
  goals: string[];
  interests: DomainId[];
  /** Auto-évaluation des connaissances théoriques, 1 à 5. */
  theoryKnowledge: number;
  skillsToImprove: string;
  diagnosticCompletedAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface DiagnosticResult {
  id: string;
  completedAt: ISODateTime;
  /** Score 0–1 par domaine évalué. */
  domainScores: Partial<Record<DomainId, number>>;
  globalScore: number;
  recommendedSkillIds: string[];
}

/* ───────────────────────── Exercices ───────────────────────── */

export type QuestionType =
  | 'qcm'
  | 'vrai_faux'
  | 'association'
  | 'classement'
  | 'image'
  | 'texte_a_completer'
  | 'ouverte'
  | 'notion'
  | 'situation'
  | 'flashcard';

interface QuestionBase {
  id: string;
  type: QuestionType;
  prompt: string;
  explanation: string;
  commonMistakes?: string;
  /** Ressource complémentaire proposée après la réponse. */
  resource?: ResourceLink;
}

export interface ResourceLink {
  kind: 'fiche' | 'terme' | 'atlas' | 'materiel' | 'manege' | 'comportement';
  id: string;
  label: string;
}

export interface QcmQuestion extends QuestionBase {
  type: 'qcm' | 'notion' | 'situation';
  /** Mise en situation (type « situation ») ou définition à reconnaître (type « notion »). */
  context?: string;
  options: string[];
  correct: number[];
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'vrai_faux';
  answer: boolean;
}

export interface MatchingQuestion extends QuestionBase {
  type: 'association';
  pairs: { left: string; right: string }[];
}

export interface OrderingQuestion extends QuestionBase {
  type: 'classement';
  /** Éléments dans l'ordre correct. */
  items: string[];
}

export interface ImageQuestion extends QuestionBase {
  type: 'image';
  /** Identifiant d'une vue interactive (atlas, matériel, manège). */
  viewId: string;
  /** Région à désigner sur l'illustration. */
  targetId: string;
}

export interface ClozeQuestion extends QuestionBase {
  type: 'texte_a_completer';
  /** Texte où chaque trou est noté {{0}}, {{1}}… */
  text: string;
  /** Réponses acceptées par trou (comparaison insensible à la casse et aux accents). */
  blanks: string[][];
  wordBank?: string[];
}

export interface OpenQuestion extends QuestionBase {
  type: 'ouverte';
  modelAnswer: string;
  keyPoints: string[];
}

export interface FlashcardQuestion extends QuestionBase {
  type: 'flashcard';
  front: string;
  back: string;
}

export type ExerciseQuestion =
  | QcmQuestion
  | TrueFalseQuestion
  | MatchingQuestion
  | OrderingQuestion
  | ImageQuestion
  | ClozeQuestion
  | OpenQuestion
  | FlashcardQuestion;

export interface Exercise {
  id: string;
  title: string;
  description: string;
  domain: DomainId;
  level: Level;
  objective: string;
  /** 1 facile, 2 moyen, 3 exigeant. */
  difficulty: 1 | 2 | 3;
  durationMin: number;
  skillIds: string[];
  questions: ExerciseQuestion[];
}

export interface QuestionResult {
  questionId: string;
  /** Score 0–1 de la question (crédit partiel possible). */
  score: number;
  given: unknown;
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  startedAt: ISODateTime;
  finishedAt: ISODateTime;
  durationSec: number;
  /** Score global 0–1. */
  score: number;
  results: QuestionResult[];
  /** Identifiants des questions ratées (score < 0,5). */
  errors: string[];
  attemptNumber: number;
}

/* ───────────────────────── Révisions ───────────────────────── */

export type RevisionGrade = 'oublie' | 'difficile' | 'bien' | 'facile';

export interface RevisionItem {
  /** `${kind}:${refId}` */
  id: string;
  kind: 'flashcard' | 'question';
  refId: string;
  /** Étape dans la suite d'intervalles (0 = jamais réussie). */
  step: number;
  intervalDays: number;
  ease: number;
  dueAt: ISODateTime;
  lastReviewedAt?: ISODateTime;
  lastGrade?: RevisionGrade;
  reviews: number;
  lapses: number;
}

/* ───────────────────────── Journal & chevaux ───────────────────────── */

export type SessionType =
  | 'dressage'
  | 'obstacle'
  | 'travail_a_pied'
  | 'exterieur'
  | 'mise_en_confiance'
  | 'theorie'
  | 'travail_general';

export type Discipline =
  | 'dressage'
  | 'saut_obstacles'
  | 'cross'
  | 'equitation_exterieur'
  | 'equitation_ethologique'
  | 'voltige'
  | 'loisir_polyvalent';

export interface JournalEntry {
  id: string;
  date: ISODate;
  durationMinutes: number;
  sessionType: SessionType;
  discipline?: Discipline;
  horseId?: string;
  /** Nom saisi librement si le cheval n'est pas enregistré. */
  horseName?: string;
  title: string;
  objectives: string[];
  exercises: string[];
  difficulties: string;
  positives: string;
  improvements: string;
  /** Ressenti global du cavalier, 1 à 5. */
  feeling: number;
  /** Décontraction observée du cheval, 1 à 5 (observation personnelle, pas un diagnostic). */
  horseRelaxation?: number;
  horseObservations?: string;
  comments: string;
  personalNotes: string;
  skillIds: string[];
  planId?: string;
  isFavorite: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type HorseSex = 'jument' | 'hongre' | 'etalon' | 'non_precise';

export interface Horse {
  id: string;
  name: string;
  nickname?: string;
  /** Photo réduite (data URL JPEG), facultative. */
  photo?: string;
  description?: string;
  coat?: string;
  breed?: string;
  sex: HorseSex;
  birthYear?: number;
  particularities?: string;
  notes?: string;
  isFavorite: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/* ───────────────────────── Préparation des séances ───────────────────────── */

export type PlanStatus = 'prevu' | 'realise' | 'annule';

export interface SessionDebrief {
  objectivesReached: string;
  difficulties: string;
  questionsForTeacher: string;
  notionsToReview: string;
  nextObjective: string;
  completedAt: ISODateTime;
}

export interface SessionPlan {
  id: string;
  templateId?: string;
  title: string;
  objective: string;
  date?: ISODate;
  horseId?: string;
  discipline?: Discipline;
  sessionType: SessionType;
  skillIds: string[];
  lessonIds: string[];
  exerciseIds: string[];
  notes: string;
  status: PlanStatus;
  debrief?: SessionDebrief;
  journalEntryId?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/* ───────────────────────── Favoris, notes, checklists ───────────────────────── */

export type FavoriteType = 'lesson' | 'term' | 'exercise' | 'journal' | 'figure' | 'equipment' | 'behavior' | 'anatomy';

export interface Favorite {
  /** `${type}_${targetId}` */
  id: string;
  type: FavoriteType;
  targetId: string;
  createdAt: ISODateTime;
}

export interface PersonalNote {
  /** `${targetType}_${targetId}` : une note par élément. */
  id: string;
  targetType: FavoriteType;
  targetId: string;
  text: string;
  updatedAt: ISODateTime;
}

export interface ChecklistItemState {
  id: string;
  label: string;
  critical: boolean;
  checked: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: ChecklistItemState[];
  isDefault: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/* ───────────────────────── Fiches, paramètres, historique ───────────────────────── */

export type LessonStatus = 'non_commence' | 'en_cours' | 'termine';

export interface LessonProgress {
  lessonId: string;
  status: LessonStatus;
  firstViewedAt: ISODateTime;
  lastViewedAt: ISODateTime;
  completedAt?: ISODateTime;
  viewCount: number;
  /** Temps de lecture cumulé, en secondes. */
  readingSeconds: number;
}

export type ThemePreference = 'clair' | 'sombre' | 'auto';

export interface AppSettings {
  key: 'app';
  theme: ThemePreference;
  dailyRevisionGoal: number;
  weeklySessionGoal: number;
  updatedAt: ISODateTime;
}

export interface HistoryEntry {
  id: string;
  kind: 'recherche' | 'terme';
  value: string;
  at: ISODateTime;
}

/** Ancien format de tentative de quiz (v1), conservé pour l'historique. */
export interface LegacyQuizAttempt {
  id: string;
  questionId: string;
  selectedOptionIndexes: number[];
  isCorrect: boolean;
  attemptedAt: number;
}

export interface BackupMetadata {
  format: 'equiprogression-backup';
  formatVersion: 2;
  appVersion: string;
  exportedAt: ISODateTime;
  counts: Record<string, number>;
  /** Empreinte SHA-256 du bloc `data` sérialisé. */
  checksum: string;
}

/* ───────────────────────── Ressources pédagogiques ───────────────────────── */

export type DictionaryCategory =
  | 'anatomie'
  | 'comportement'
  | 'materiel'
  | 'harnachement'
  | 'equipement'
  | 'allures'
  | 'dressage'
  | 'obstacle'
  | 'travail_a_pied'
  | 'theorie'
  | 'securite'
  | 'soins'
  | 'vocabulaire';

export interface IllustrationRef {
  kind: 'atlas' | 'materiel' | 'manege' | 'comportement';
  id: string;
}

export interface DictionaryEntry {
  id: string;
  term: string;
  /** Définition courte (une phrase). */
  short: string;
  /** Explication pédagogique. */
  explanation: string;
  example: string;
  category: DictionaryCategory;
  level: Level;
  related: string[];
  lessonIds: string[];
  illustration?: IllustrationRef;
  /** Variantes reconnues dans les fiches pour les liens cliquables. */
  aliases?: string[];
}
