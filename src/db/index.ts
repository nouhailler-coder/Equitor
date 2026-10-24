import Dexie, { type Table } from 'dexie';
import type {
  Horse,
  RidingSession,
  UserProgress,
  QuizAttempt,
  FavoriteItem,
  AppBackupData,
} from '../types';

export class EquiProgressionDatabase extends Dexie {
  horses!: Table<Horse, string>;
  ridingSessions!: Table<RidingSession, string>;
  userProgress!: Table<UserProgress, string>;
  quizAttempts!: Table<QuizAttempt, string>;
  favorites!: Table<FavoriteItem, string>;

  constructor() {
    super('EquiProgressionDB');
    this.version(1).stores({
      horses: 'id, name, isFavorite, createdAt',
      ridingSessions: 'id, horseId, date, theme, createdAt',
      userProgress: 'lessonId, status, lastViewedAt, completedAt',
      quizAttempts: 'id, questionId, attemptedAt, isCorrect',
      favorites: 'id, type, targetId, createdAt',
    });
  }
}

export const db = new EquiProgressionDatabase();

// Export all user data as a structured JSON object
export async function exportDatabaseBackup(): Promise<AppBackupData> {
  const horses = await db.horses.toArray();
  const sessions = await db.ridingSessions.orderBy('date').reverse().toArray();
  const progress = await db.userProgress.toArray();
  const quizAttempts = await db.quizAttempts.toArray();
  const favorites = await db.favorites.toArray();

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    horses,
    sessions,
    progress,
    quizAttempts,
    favorites,
  };
}

// Validation & Import preview
export interface ImportPreview {
  valid: boolean;
  version: string;
  horsesCount: number;
  sessionsCount: number;
  progressCount: number;
  quizCount: number;
  favoritesCount: number;
  error?: string;
}

export function validateBackupJson(jsonString: string): { preview: ImportPreview; data?: AppBackupData } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { preview: { valid: false, version: 'invalide', horsesCount: 0, sessionsCount: 0, progressCount: 0, quizCount: 0, favoritesCount: 0, error: 'Format JSON non reconnu' } };
    }
    const data = parsed as Partial<AppBackupData>;
    if (!Array.isArray(data.horses) || !Array.isArray(data.sessions)) {
      return { preview: { valid: false, version: data.version || 'inconnue', horsesCount: 0, sessionsCount: 0, progressCount: 0, quizCount: 0, favoritesCount: 0, error: 'Structure incomplète (chevaux ou séances manquants)' } };
    }

    return {
      preview: {
        valid: true,
        version: data.version || '1.0.0',
        horsesCount: data.horses.length,
        sessionsCount: data.sessions.length,
        progressCount: Array.isArray(data.progress) ? data.progress.length : 0,
        quizCount: Array.isArray(data.quizAttempts) ? data.quizAttempts.length : 0,
        favoritesCount: Array.isArray(data.favorites) ? data.favorites.length : 0,
      },
      data: {
        version: data.version || '1.0.0',
        exportedAt: data.exportedAt || new Date().toISOString(),
        horses: data.horses,
        sessions: data.sessions,
        progress: Array.isArray(data.progress) ? data.progress : [],
        quizAttempts: Array.isArray(data.quizAttempts) ? data.quizAttempts : [],
        favorites: Array.isArray(data.favorites) ? data.favorites : [],
      },
    };
  } catch (err) {
    return {
      preview: {
        valid: false,
        version: 'invalide',
        horsesCount: 0,
        sessionsCount: 0,
        progressCount: 0,
        quizCount: 0,
        favoritesCount: 0,
        error: 'Fichier corrompu ou JSON malformé',
      },
    };
  }
}

// Execute Import (merge or overwrite)
export async function importDatabaseBackup(data: AppBackupData, overwrite = false): Promise<void> {
  await db.transaction('rw', db.horses, db.ridingSessions, db.userProgress, db.quizAttempts, db.favorites, async () => {
    if (overwrite) {
      await db.horses.clear();
      await db.ridingSessions.clear();
      await db.userProgress.clear();
      await db.quizAttempts.clear();
      await db.favorites.clear();
    }

    if (data.horses.length > 0) {
      await db.horses.bulkPut(data.horses);
    }
    if (data.sessions.length > 0) {
      await db.ridingSessions.bulkPut(data.sessions);
    }
    if (data.progress.length > 0) {
      await db.userProgress.bulkPut(data.progress);
    }
    if (data.quizAttempts.length > 0) {
      await db.quizAttempts.bulkPut(data.quizAttempts);
    }
    if (data.favorites.length > 0) {
      await db.favorites.bulkPut(data.favorites);
    }
  });
}

// Reset all user data
export async function resetAllUserData(): Promise<void> {
  await db.transaction('rw', db.horses, db.ridingSessions, db.userProgress, db.quizAttempts, db.favorites, async () => {
    await db.horses.clear();
    await db.ridingSessions.clear();
    await db.userProgress.clear();
    await db.quizAttempts.clear();
    await db.favorites.clear();
  });
}
