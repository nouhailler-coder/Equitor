/**
 * Conversions pures du schéma v1 vers le schéma v2.
 * Utilisées à la fois par la migration IndexedDB (Dexie `upgrade`) et par l'import
 * d'une ancienne sauvegarde JSON : un seul code, testé une fois.
 * Règle : aucune information saisie par l'utilisateur n'est perdue ; un champ v1 sans
 * équivalent direct est reporté dans un champ texte libre.
 */
import type {
  Checklist,
  Horse,
  HorseSex,
  JournalEntry,
  LessonProgress,
  PersonalNote,
  SessionType,
} from '../../types/models';

const toIso = (value: unknown, fallback = new Date().toISOString()): string => {
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value).toISOString();
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return new Date(value).toISOString();
  return fallback;
};

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : [];

/** Un enregistrement est-il déjà au format v2 ? (permet de rejouer la conversion sans effet) */
const isV2Horse = (h: Record<string, unknown>) => typeof h.sex === 'string' && typeof h.createdAt === 'string';
const isV2Entry = (e: Record<string, unknown>) => typeof e.sessionType === 'string' && typeof e.title === 'string';

export function migrateHorse(raw: Record<string, unknown>): Horse {
  if (isV2Horse(raw)) return raw as unknown as Horse;
  const now = new Date().toISOString();
  const createdAt = toIso(raw.createdAt, now);
  const sex = ((): HorseSex => {
    const s = str(raw.sex);
    return s === 'jument' || s === 'hongre' || s === 'etalon' ? s : 'non_precise';
  })();
  return {
    id: str(raw.id) || `horse_${crypto.randomUUID()}`,
    name: str(raw.name) || 'Cheval sans nom',
    nickname: str(raw.nickname) || undefined,
    breed: str(raw.breed) || undefined,
    coat: str(raw.coat) || undefined,
    sex,
    birthYear: typeof raw.birthYear === 'number' ? raw.birthYear : undefined,
    // v1 « tempérament » → particularités observées ; v1 « notes spéciales » → notes personnelles
    particularities: str(raw.particularities) || str(raw.temperament) || undefined,
    notes: str(raw.notes) || str(raw.specialNotes) || undefined,
    description: str(raw.description) || undefined,
    photo: str(raw.photo) || undefined,
    isFavorite: raw.isFavorite === true,
    createdAt,
    updatedAt: toIso(raw.updatedAt, createdAt),
  };
}

/** Devine le type de séance à partir du thème libre saisi en v1. */
export function guessSessionType(theme: string): SessionType {
  const t = theme
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  if (/obstacle|saut|cso|barre|cavaletti/.test(t)) return 'obstacle';
  if (/a pied|longe|main|liberte/.test(t)) return 'travail_a_pied';
  if (/exterieur|balade|randonnee|foret/.test(t)) return 'exterieur';
  if (/confiance|desensibilis/.test(t)) return 'mise_en_confiance';
  if (/theorie|cours theorique/.test(t)) return 'theorie';
  if (/dressage|plat|reprise|epaule|appuyer/.test(t)) return 'dressage';
  return 'travail_general';
}

export function migrateJournalEntry(raw: Record<string, unknown>): JournalEntry {
  if (isV2Entry(raw)) return raw as unknown as JournalEntry;
  const now = new Date().toISOString();
  const createdAt = toIso(raw.createdAt, now);
  const theme = str(raw.theme) || 'Séance';
  const feeling = Number(raw.riderFeelScore ?? raw.feeling);
  const relax = Number(raw.horseRelaxationScore ?? raw.horseRelaxation);
  const date = str(raw.date);
  return {
    id: str(raw.id) || `journal_${crypto.randomUUID()}`,
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : createdAt.slice(0, 10),
    durationMinutes: Math.max(0, Math.round(Number(raw.durationMinutes) || 0)),
    sessionType: guessSessionType(theme),
    horseId: str(raw.horseId) || undefined,
    horseName: str(raw.horseName) || undefined,
    title: theme,
    objectives: arr(raw.objectives),
    exercises: arr(raw.exercises),
    difficulties: str(raw.difficulties),
    positives: str(raw.successes),
    improvements: str(raw.nextGoals),
    feeling: feeling >= 1 && feeling <= 5 ? Math.round(feeling) : 3,
    horseRelaxation: relax >= 1 && relax <= 5 ? Math.round(relax) : undefined,
    horseObservations: str(raw.horseWelfareNotes) || undefined,
    comments: str(raw.observations),
    personalNotes: '',
    skillIds: [],
    isFavorite: false,
    createdAt,
    updatedAt: toIso(raw.updatedAt, createdAt),
  };
}

/** v1 `userProgress` → v2 `lessonProgress` (+ éventuelle note personnelle extraite). */
export function migrateLessonProgress(raw: Record<string, unknown>): {
  progress: LessonProgress;
  note?: PersonalNote;
} {
  if (typeof raw.firstViewedAt === 'string') return { progress: raw as unknown as LessonProgress };
  const lastViewedAt = toIso(raw.lastViewedAt);
  const status = raw.status === 'termine' || raw.status === 'en_cours' ? raw.status : 'non_commence';
  const lessonId = str(raw.lessonId);
  const progress: LessonProgress = {
    lessonId,
    status,
    firstViewedAt: lastViewedAt,
    lastViewedAt,
    completedAt: raw.completedAt ? toIso(raw.completedAt) : undefined,
    viewCount: Math.max(1, Number(raw.reviewCount) || 1),
    readingSeconds: 0,
  };
  const text = str(raw.personalNotes).trim();
  const note: PersonalNote | undefined = text
    ? { id: `lesson_${lessonId}`, targetType: 'lesson', targetId: lessonId, text, updatedAt: lastViewedAt }
    : undefined;
  return { progress, note };
}

/** v1 favoris (createdAt numérique) → v2 (ISO). */
export function migrateFavorite(raw: Record<string, unknown>) {
  const type = str(raw.type) || 'lesson';
  const targetId = str(raw.targetId);
  return {
    id: str(raw.id) || `${type}_${targetId}`,
    type: type as import('../../types/models').FavoriteType,
    targetId,
    createdAt: toIso(raw.createdAt),
  };
}

/** Reporte l'état coché des checklists v1 (localStorage) sur les modèles par défaut. */
export function applyLegacyChecklistState(lists: Checklist[], checked: Record<string, boolean>): Checklist[] {
  return lists.map((l) => ({
    ...l,
    items: l.items.map((i) => ({ ...i, checked: checked[i.id] === true || i.checked })),
  }));
}
