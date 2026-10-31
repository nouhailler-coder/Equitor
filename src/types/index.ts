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

/** Modèles des données personnelles (schéma IndexedDB v2) : voir ./models.ts. */

/** Modèles des données personnelles (schéma IndexedDB v2) : voir ./models.ts. */
