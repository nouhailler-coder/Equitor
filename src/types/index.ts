export type RiskLevel = 'faible' | 'modéré' | 'élevé' | 'à_vérifier';

export type SkillLevel = 'debutant' | 'intermediaire' | 'avance' | 'tous_niveaux';

export type LessonCategory =
  | 'position'
  | 'aides'
  | 'allures'
  | 'longe'
  | 'plat_dressage'
  | 'obstacle'
  | 'cross'
  | 'jeune_cheval'
  | 'securite_ecurie';

export interface Chapter {
  id: string;
  number: number;
  titleFr: string;
  themePrincipal: string;
  referenceModule: string;
  summaryFr: string;
  subsections: string[];
  vocabularyTags: string[];
  recommendedFiches: string[];
}

export interface LessonSection {
  heading: string;
  content: string;
  bulletPoints?: string[];
  callout?: {
    type: 'info' | 'warning' | 'tip';
    text: string;
  };
}

export interface Lesson {
  id: string;
  chapterId: string;
  chapterNumber: number;
  titleFr: string;
  sectionThematique: string;
  level: SkillLevel;
  category: LessonCategory;
  summaryFr: string;
  objectives: string[];
  prerequisites: string[];
  sections: LessonSection[];
  vocabulary: string[];
  observations: string[];
  commonMistakes: string[];
  safetyNotice?: string;
  riskLevel: RiskLevel;
  supervisionRequired: boolean;
  advancedPractice: boolean;
  diagramType?: 'seat_profile' | 'scales_pyramid' | 'arena_geometry' | 'gait_timeline' | 'jumping_phases' | 'rein_contact' | 'lateral_angle';
  version: number;
}

export interface GlossaryTerm {
  id: string;
  termFr: string;
  synonymeOuVariante: string;
  category: string;
  definitionFr: string;
  exampleFr: string;
  associatedLessonIds?: string[];
  domaineTechnique: string;
}

export type QuizQuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'scenario';

export interface QuizQuestion {
  id: string;
  lessonId?: string;
  chapterNumber: number;
  questionFr: string;
  type: QuizQuestionType;
  options: string[];
  correctOptionIndexes: number[]; // index of correct options
  explanationFr: string;
  level: SkillLevel;
}

export interface Pathway {
  id: string;
  code: 'A' | 'B' | 'C';
  titleFr: string;
  subtitleFr: string;
  descriptionFr: string;
  targetAudience: string;
  lessonIds: string[];
}

export interface Horse {
  id: string;
  name: string;
  nickname?: string;
  breed?: string;
  birthYear?: number;
  temperament?: string;
  specialNotes?: string;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface RidingSession {
  id: string;
  horseId?: string;
  horseName?: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  theme: string;
  objectives: string[];
  exercises: string[];
  observations: string;
  horseWelfareNotes?: string;
  riderFeelScore: number; // 1 to 5
  horseRelaxationScore: number; // 1 to 5
  successes: string;
  difficulties: string;
  nextGoals: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserProgress {
  lessonId: string;
  status: 'non_commence' | 'en_cours' | 'termine';
  lastViewedAt: number;
  completedAt?: number;
  reviewCount: number;
  personalNotes?: string;
}

export interface QuizAttempt {
  id: string;
  questionId: string;
  selectedOptionIndexes: number[];
  isCorrect: boolean;
  attemptedAt: number;
}

export interface FavoriteItem {
  id: string; // usually 'lesson_' + lessonId
  type: 'lesson' | 'term' | 'exercise';
  targetId: string;
  createdAt: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'cavalier' | 'cheval_materiel' | 'manege_securite' | 'recuperation';
  critical: boolean;
}

export interface AppBackupData {
  version: string;
  exportedAt: string;
  horses: Horse[];
  sessions: RidingSession[];
  progress: UserProgress[];
  quizAttempts: QuizAttempt[];
  favorites: FavoriteItem[];
}
