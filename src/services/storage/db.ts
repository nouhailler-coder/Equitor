import Dexie, { type Table } from 'dexie';
import type {
  AppSettings,
  Checklist,
  DiagnosticResult,
  ExerciseAttempt,
  Favorite,
  HistoryEntry,
  Horse,
  JournalEntry,
  LegacyQuizAttempt,
  LessonProgress,
  PersonalNote,
  RevisionItem,
  SessionPlan,
  SkillProgress,
  UserProfile,
} from '../../types/models';
import { DEFAULT_CHECKLISTS } from '../../data/defaultChecklists';
import {
  applyLegacyChecklistState,
  migrateFavorite,
  migrateHorse,
  migrateJournalEntry,
  migrateLessonProgress,
} from './migrations';

export const DB_NAME = 'EquiProgressionDB';
export const SCHEMA_VERSION = 2;

/**
 * Base IndexedDB. Historique du schéma :
 * - v1 (1.0.0) : horses, ridingSessions, userProgress, quizAttempts, favorites.
 * - v2 (2.0.0) : journal enrichi (table ridingSessions conservée), chevaux enrichis,
 *   lessonProgress, notes, profil, compétences, exercices, révisions, programmes,
 *   checklists, paramètres, historique. Migration conservatrice (voir migrations.ts).
 */
export class EquiProgressionDatabase extends Dexie {
  horses!: Table<Horse, string>;
  /** Journal du cavalier (nom de table v1 conservé pour éviter tout déplacement de données). */
  ridingSessions!: Table<JournalEntry, string>;
  /** Table v1 conservée en lecture seule après migration (filet de sécurité). */
  userProgress!: Table<Record<string, unknown>, string>;
  lessonProgress!: Table<LessonProgress, string>;
  quizAttempts!: Table<LegacyQuizAttempt, string>;
  favorites!: Table<Favorite, string>;
  notes!: Table<PersonalNote, string>;
  profile!: Table<UserProfile, string>;
  diagnostics!: Table<DiagnosticResult, string>;
  skillProgress!: Table<SkillProgress, string>;
  exerciseAttempts!: Table<ExerciseAttempt, string>;
  revisionItems!: Table<RevisionItem, string>;
  sessionPlans!: Table<SessionPlan, string>;
  checklists!: Table<Checklist, string>;
  settings!: Table<AppSettings, string>;
  history!: Table<HistoryEntry, string>;

  constructor(name = DB_NAME) {
    super(name);

    this.version(1).stores({
      horses: 'id, name, isFavorite, createdAt',
      ridingSessions: 'id, horseId, date, theme, createdAt',
      userProgress: 'lessonId, status, lastViewedAt, completedAt',
      quizAttempts: 'id, questionId, attemptedAt, isCorrect',
      favorites: 'id, type, targetId, createdAt',
    });

    this.version(2)
      .stores({
        horses: 'id, name, createdAt',
        ridingSessions: 'id, date, horseId, sessionType, discipline, planId, createdAt',
        userProgress: 'lessonId',
        lessonProgress: 'lessonId, status, lastViewedAt',
        quizAttempts: 'id, questionId, attemptedAt',
        favorites: 'id, type, targetId, createdAt',
        notes: 'id, [targetType+targetId], updatedAt',
        profile: 'id',
        diagnostics: 'id, completedAt',
        skillProgress: 'skillId, state, updatedAt',
        exerciseAttempts: 'id, exerciseId, finishedAt',
        revisionItems: 'id, kind, dueAt',
        sessionPlans: 'id, date, status, horseId, createdAt',
        checklists: 'id, updatedAt',
        settings: 'key',
        history: 'id, kind, at',
      })
      .upgrade(async (tx) => {
        await tx.table('horses').toCollection().modify((h: Record<string, unknown>) => {
          Object.assign(h, migrateHorse(h));
        });
        await tx.table('ridingSessions').toCollection().modify((s: Record<string, unknown>) => {
          const migrated = migrateJournalEntry(s);
          // On garde les champs v1 à côté des champs v2 (aucune suppression).
          Object.assign(s, migrated);
        });
        await tx.table('favorites').toCollection().modify((f: Record<string, unknown>) => {
          Object.assign(f, migrateFavorite(f));
        });
        const oldProgress = (await tx.table('userProgress').toArray()) as Record<string, unknown>[];
        for (const p of oldProgress) {
          const { progress, note } = migrateLessonProgress(p);
          if (progress.lessonId) await tx.table('lessonProgress').put(progress);
          if (note) await tx.table('notes').put(note);
        }
        await tx.table('checklists').bulkPut(applyLegacyChecklistState(DEFAULT_CHECKLISTS, readLegacyChecklistState()));
      });

    // Nouvelle base (aucune donnée v1) : on installe les checklists par défaut.
    this.on('populate', (tx) => {
      void tx.table('checklists').bulkAdd(DEFAULT_CHECKLISTS);
    });
  }
}

function readLegacyChecklistState(): Record<string, boolean> {
  try {
    return JSON.parse(globalThis.localStorage?.getItem('equi_checklist_state') ?? '{}');
  } catch {
    return {};
  }
}

export const db = new EquiProgressionDatabase();

/** Toutes les tables contenant des données personnelles (export, import, effacement). */
export const USER_TABLES = [
  'horses',
  'ridingSessions',
  'lessonProgress',
  'quizAttempts',
  'favorites',
  'notes',
  'profile',
  'diagnostics',
  'skillProgress',
  'exerciseAttempts',
  'revisionItems',
  'sessionPlans',
  'checklists',
  'settings',
  'history',
] as const;

export type UserTable = (typeof USER_TABLES)[number];

/** Identifiant stable et unique. */
export const newId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
export const nowIso = () => new Date().toISOString();

/**
 * Demande au navigateur de ne pas purger les données sous pression d'espace.
 * Retourne l'état obtenu (le navigateur peut refuser silencieusement).
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
