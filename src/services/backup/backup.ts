/**
 * Sauvegarde et restauration (format JSON v2, compatible avec les sauvegardes v1).
 * Détails : docs/SAUVEGARDE_RESTAURATION.md.
 */
import type { BackupMetadata } from '../../types/models';
import { db, USER_TABLES, type UserTable } from '../storage/db';
import { migrateFavorite, migrateHorse, migrateJournalEntry, migrateLessonProgress } from '../storage/migrations';

export const BACKUP_FORMAT = 'equiprogression-backup';
export const BACKUP_FORMAT_VERSION = 2;

export type BackupData = Record<UserTable, Record<string, unknown>[]>;

export interface BackupFile extends BackupMetadata {
  data: BackupData;
}

export interface BackupPreview {
  formatVersion: number;
  appVersion: string;
  exportedAt: string;
  counts: Partial<Record<UserTable, number>>;
  /** Enregistrements ignorés car invalides, par table. */
  rejected: Partial<Record<UserTable, number>>;
  integrity: 'verifiee' | 'absente' | 'invalide';
  warnings: string[];
}

export type ValidationResult =
  | { ok: true; preview: BackupPreview; data: BackupData }
  | { ok: false; error: string };

export const TABLE_LABELS: Record<UserTable, string> = {
  profile: 'Profil',
  lessonProgress: 'Progression des fiches',
  skillProgress: 'Compétences',
  diagnostics: 'Diagnostics',
  exerciseAttempts: 'Résultats d’exercices',
  quizAttempts: 'Réponses aux quiz (v1)',
  revisionItems: 'Révisions planifiées',
  ridingSessions: 'Journal (séances)',
  horses: 'Chevaux',
  favorites: 'Favoris',
  notes: 'Notes personnelles',
  sessionPlans: 'Programmes de séance',
  checklists: 'Checklists',
  settings: 'Paramètres',
  history: 'Historique de recherche',
};

/** Clé primaire de chaque table (pour la fusion). */
const PRIMARY_KEY: Record<UserTable, string> = {
  horses: 'id',
  ridingSessions: 'id',
  lessonProgress: 'lessonId',
  quizAttempts: 'id',
  favorites: 'id',
  notes: 'id',
  profile: 'id',
  diagnostics: 'id',
  skillProgress: 'skillId',
  exerciseAttempts: 'id',
  revisionItems: 'id',
  sessionPlans: 'id',
  checklists: 'id',
  settings: 'key',
  history: 'id',
};

/** Champs obligatoires et leur type, par table. */
const REQUIRED: Record<UserTable, Record<string, 'string' | 'number' | 'boolean' | 'object'>> = {
  horses: { id: 'string', name: 'string', sex: 'string', createdAt: 'string' },
  ridingSessions: { id: 'string', date: 'string', title: 'string', sessionType: 'string', durationMinutes: 'number' },
  lessonProgress: { lessonId: 'string', status: 'string', lastViewedAt: 'string' },
  quizAttempts: { id: 'string', questionId: 'string', isCorrect: 'boolean' },
  favorites: { id: 'string', type: 'string', targetId: 'string' },
  notes: { id: 'string', targetType: 'string', targetId: 'string', text: 'string' },
  profile: { id: 'string', level: 'string' },
  diagnostics: { id: 'string', completedAt: 'string', globalScore: 'number' },
  skillProgress: { skillId: 'string', state: 'string', mastery: 'number', evaluations: 'object' },
  exerciseAttempts: { id: 'string', exerciseId: 'string', score: 'number', finishedAt: 'string' },
  revisionItems: { id: 'string', refId: 'string', dueAt: 'string', step: 'number' },
  sessionPlans: { id: 'string', title: 'string', status: 'string' },
  checklists: { id: 'string', title: 'string', items: 'object' },
  settings: { key: 'string' },
  history: { id: 'string', kind: 'string', value: 'string' },
};

export function isValidRecord(table: UserTable, rec: unknown): rec is Record<string, unknown> {
  if (!rec || typeof rec !== 'object' || Array.isArray(rec)) return false;
  const r = rec as Record<string, unknown>;
  return Object.entries(REQUIRED[table]).every(([k, t]) => {
    const v = r[k];
    if (t === 'object') return v !== null && typeof v === 'object';
    if (t === 'string') return typeof v === 'string' && (k === 'text' || v.length > 0);
    return typeof v === t;
  });
}

const emptyData = (): BackupData =>
  Object.fromEntries(USER_TABLES.map((t) => [t, []])) as unknown as BackupData;

/** Empreinte SHA-256 hexadécimale d'une chaîne. */
export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Construit le fichier de sauvegarde à partir de données déjà lues (pur, testable). */
export async function buildBackupFile(data: BackupData, appVersion: string, now = new Date()): Promise<BackupFile> {
  const counts = Object.fromEntries(USER_TABLES.map((t) => [t, data[t].length]));
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion,
    exportedAt: now.toISOString(),
    counts,
    checksum: await sha256(JSON.stringify(data)),
    data,
  };
}

export async function readAllUserData(): Promise<BackupData> {
  const data = emptyData();
  for (const t of USER_TABLES) {
    data[t] = (await db.table(t).toArray()) as Record<string, unknown>[];
  }
  return data;
}

export async function exportBackup(appVersion: string): Promise<BackupFile> {
  return buildBackupFile(await readAllUserData(), appVersion);
}

/** Convertit une sauvegarde v1 (tableaux à la racine) au format de données v2. */
export function convertV1(parsed: Record<string, unknown>): BackupData {
  const data = emptyData();
  const list = (k: string) => (Array.isArray(parsed[k]) ? (parsed[k] as Record<string, unknown>[]) : []);
  data.horses = list('horses').map((h) => migrateHorse(h) as unknown as Record<string, unknown>);
  data.ridingSessions = list('sessions').map((s) => migrateJournalEntry(s) as unknown as Record<string, unknown>);
  for (const p of list('progress')) {
    const { progress, note } = migrateLessonProgress(p);
    data.lessonProgress.push(progress as unknown as Record<string, unknown>);
    if (note) data.notes.push(note as unknown as Record<string, unknown>);
  }
  data.quizAttempts = list('quizAttempts');
  data.favorites = list('favorites').map((f) => migrateFavorite(f) as unknown as Record<string, unknown>);
  return data;
}

/** Analyse le texte d'un fichier : structure, version, intégrité, données obligatoires. */
export async function validateBackup(text: string): Promise<ValidationResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Le fichier n’est pas un JSON valide (fichier corrompu ou tronqué).' };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Structure non reconnue : ce fichier n’est pas une sauvegarde Equitor.' };
  }
  const p = parsed as Record<string, unknown>;
  const warnings: string[] = [];
  let raw: BackupData;
  let formatVersion: number;
  let integrity: BackupPreview['integrity'] = 'absente';

  if (p.format === BACKUP_FORMAT) {
    formatVersion = Number(p.formatVersion);
    if (formatVersion > BACKUP_FORMAT_VERSION) {
      return {
        ok: false,
        error: `Sauvegarde créée par une version plus récente de l’application (format ${formatVersion}). Mettez l’application à jour avant de la restaurer.`,
      };
    }
    if (!p.data || typeof p.data !== 'object') return { ok: false, error: 'Bloc de données absent.' };
    raw = { ...emptyData(), ...(p.data as Partial<BackupData>) };
    if (typeof p.checksum === 'string') {
      integrity = (await sha256(JSON.stringify(p.data))) === p.checksum ? 'verifiee' : 'invalide';
      if (integrity === 'invalide') warnings.push('L’empreinte ne correspond pas : le fichier a été modifié après l’export.');
    }
  } else if (Array.isArray(p.horses) && Array.isArray(p.sessions)) {
    formatVersion = 1;
    raw = convertV1(p);
    warnings.push('Ancienne sauvegarde (v1) : elle sera convertie au nouveau format.');
  } else {
    return { ok: false, error: 'Structure non reconnue : ce fichier n’est pas une sauvegarde Equitor.' };
  }

  const data = emptyData();
  const counts: BackupPreview['counts'] = {};
  const rejected: BackupPreview['rejected'] = {};
  for (const t of USER_TABLES) {
    const rows = Array.isArray(raw[t]) ? raw[t] : [];
    const valid = rows.filter((r) => isValidRecord(t, r));
    data[t] = valid;
    if (valid.length) counts[t] = valid.length;
    if (rows.length !== valid.length) rejected[t] = rows.length - valid.length;
  }
  if (Object.keys(rejected).length) warnings.push('Certains enregistrements incomplets seront ignorés.');

  return {
    ok: true,
    data,
    preview: {
      formatVersion,
      appVersion: typeof p.appVersion === 'string' ? p.appVersion : formatVersion === 1 ? '1.x' : 'inconnue',
      exportedAt: typeof p.exportedAt === 'string' ? p.exportedAt : '',
      counts,
      rejected,
      integrity,
      warnings,
    },
  };
}

const stamp = (r: Record<string, unknown>) =>
  String(r.updatedAt ?? r.finishedAt ?? r.lastViewedAt ?? r.createdAt ?? r.at ?? '');

/**
 * Fusion pure : pour chaque clé, garde l'enregistrement le plus récent (updatedAt…) ;
 * les enregistrements présents d'un seul côté sont conservés.
 */
export function mergeRecords(
  table: UserTable,
  existing: Record<string, unknown>[],
  incoming: Record<string, unknown>[],
): Record<string, unknown>[] {
  const key = PRIMARY_KEY[table];
  const map = new Map(existing.map((r) => [String(r[key]), r]));
  for (const r of incoming) {
    const k = String(r[key]);
    const cur = map.get(k);
    if (!cur || stamp(r) > stamp(cur)) map.set(k, r);
  }
  return [...map.values()];
}

export type ImportMode = 'fusion' | 'remplacement';

export async function importBackup(data: BackupData, mode: ImportMode): Promise<void> {
  await db.transaction('rw', USER_TABLES.map((t) => db.table(t)), async () => {
    for (const t of USER_TABLES) {
      const table = db.table(t);
      if (mode === 'remplacement') {
        await table.clear();
        if (data[t].length) await table.bulkPut(data[t]);
      } else if (data[t].length) {
        const merged = mergeRecords(t, (await table.toArray()) as Record<string, unknown>[], data[t]);
        await table.bulkPut(merged);
      }
    }
  });
}

/** Efface toutes les données personnelles (les checklists par défaut sont réinstallées). */
export async function resetAllUserData(): Promise<void> {
  const { DEFAULT_CHECKLISTS } = await import('../../data/defaultChecklists');
  await db.transaction('rw', USER_TABLES.map((t) => db.table(t)), async () => {
    for (const t of USER_TABLES) await db.table(t).clear();
    await db.checklists.bulkPut(DEFAULT_CHECKLISTS);
  });
}

/** Déclenche le téléchargement d'un fichier de sauvegarde. */
export function downloadBackup(file: BackupFile, suffix = '') {
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `equiprogression_sauvegarde_${file.exportedAt.slice(0, 10)}${suffix}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
