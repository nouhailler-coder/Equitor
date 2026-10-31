/**
 * Couche d'accès aux données (dépôts) : toutes les écritures passent par ici.
 * Chaque fonction met à jour `updatedAt` et utilise des transactions quand plusieurs
 * tables sont touchées.
 */
import type {
  AppSettings,
  Checklist,
  Favorite,
  FavoriteType,
  HistoryEntry,
  Horse,
  JournalEntry,
  PersonalNote,
  SessionPlan,
  UserProfile,
} from '../../types/models';
import { db, newId, nowIso } from './db';

/* ───────── Profil ───────── */
export const getProfile = () => db.profile.get('me');
export async function saveProfile(p: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> & Partial<UserProfile>) {
  const existing = await db.profile.get('me');
  const now = nowIso();
  const profile: UserProfile = { ...existing, ...p, id: 'me', createdAt: existing?.createdAt ?? now, updatedAt: now } as UserProfile;
  await db.profile.put(profile);
  return profile;
}

/* ───────── Paramètres ───────── */
export const DEFAULT_SETTINGS: AppSettings = { key: 'app', theme: 'auto', dailyRevisionGoal: 10, weeklySessionGoal: 2, updatedAt: '' };
export async function getSettings(): Promise<AppSettings> {
  return (await db.settings.get('app')) ?? DEFAULT_SETTINGS;
}
export async function saveSettings(patch: Partial<AppSettings>) {
  const s = { ...(await getSettings()), ...patch, key: 'app' as const, updatedAt: nowIso() };
  await db.settings.put(s);
  return s;
}

/* ───────── Journal ───────── */
export type JournalDraft = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export async function saveJournalEntry(draft: JournalDraft): Promise<JournalEntry> {
  const now = nowIso();
  const existing = draft.id ? await db.ridingSessions.get(draft.id) : undefined;
  const entry: JournalEntry = {
    ...draft,
    title: draft.title.trim() || 'Séance',
    id: draft.id ?? newId('journal'),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await db.transaction('rw', db.ridingSessions, db.sessionPlans, async () => {
    await db.ridingSessions.put(entry);
    if (entry.planId) {
      const plan = await db.sessionPlans.get(entry.planId);
      if (plan) await db.sessionPlans.put({ ...plan, journalEntryId: entry.id, status: 'realise', updatedAt: now });
    }
  });
  return entry;
}

export async function deleteJournalEntry(id: string) {
  await db.transaction('rw', db.ridingSessions, db.favorites, db.sessionPlans, async () => {
    await db.ridingSessions.delete(id);
    await db.favorites.delete(`journal_${id}`);
    await db.sessionPlans.where('status').equals('realise').modify((p) => {
      if (p.journalEntryId === id) delete p.journalEntryId;
    });
  });
}

/* ───────── Chevaux ───────── */
export type HorseDraft = Omit<Horse, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export async function saveHorse(draft: HorseDraft): Promise<Horse> {
  const now = nowIso();
  const existing = draft.id ? await db.horses.get(draft.id) : undefined;
  const horse: Horse = { ...draft, name: draft.name.trim(), id: draft.id ?? newId('horse'), createdAt: existing?.createdAt ?? now, updatedAt: now };
  await db.horses.put(horse);
  return horse;
}

/** Supprime le cheval ; les séances gardent son nom en texte libre. */
export async function deleteHorse(id: string) {
  await db.transaction('rw', db.horses, db.ridingSessions, db.sessionPlans, async () => {
    const horse = await db.horses.get(id);
    await db.ridingSessions.where('horseId').equals(id).modify((e) => {
      e.horseName = horse?.name ?? e.horseName;
      delete e.horseId;
    });
    await db.sessionPlans.where('horseId').equals(id).modify((p) => {
      delete p.horseId;
    });
    await db.horses.delete(id);
  });
}

/* ───────── Programmes de séance ───────── */
export type PlanDraft = Omit<SessionPlan, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export async function savePlan(draft: PlanDraft): Promise<SessionPlan> {
  const now = nowIso();
  const existing = draft.id ? await db.sessionPlans.get(draft.id) : undefined;
  const plan: SessionPlan = { ...draft, title: draft.title.trim() || 'Programme', id: draft.id ?? newId('plan'), createdAt: existing?.createdAt ?? now, updatedAt: now };
  await db.sessionPlans.put(plan);
  return plan;
}
export async function deletePlan(id: string) {
  await db.transaction('rw', db.sessionPlans, db.ridingSessions, async () => {
    await db.sessionPlans.delete(id);
    await db.ridingSessions.where('planId').equals(id).modify((e) => {
      delete e.planId;
    });
  });
}

/* ───────── Favoris ───────── */
export const favoriteId = (type: FavoriteType, targetId: string) => `${type}_${targetId}`;

export async function toggleFavorite(type: FavoriteType, targetId: string): Promise<boolean> {
  const id = favoriteId(type, targetId);
  return db.transaction('rw', db.favorites, db.ridingSessions, async () => {
    const exists = await db.favorites.get(id);
    if (exists) await db.favorites.delete(id);
    else await db.favorites.put({ id, type, targetId, createdAt: nowIso() } satisfies Favorite);
    if (type === 'journal') await db.ridingSessions.update(targetId, { isFavorite: !exists });
    return !exists;
  });
}

/* ───────── Notes personnelles ───────── */
export const noteId = (type: FavoriteType, targetId: string) => `${type}_${targetId}`;

export async function saveNote(type: FavoriteType, targetId: string, text: string) {
  const id = noteId(type, targetId);
  if (!text.trim()) {
    await db.notes.delete(id);
    return;
  }
  await db.notes.put({ id, targetType: type, targetId, text, updatedAt: nowIso() } satisfies PersonalNote);
}

/* ───────── Checklists ───────── */
export async function saveChecklist(list: Checklist) {
  await db.checklists.put({ ...list, updatedAt: nowIso() });
}
export async function createChecklist(title: string): Promise<Checklist> {
  const now = nowIso();
  const list: Checklist = { id: newId('checklist'), title: title.trim() || 'Nouvelle checklist', icon: '📝', description: '', items: [], isDefault: false, createdAt: now, updatedAt: now };
  await db.checklists.put(list);
  return list;
}
export const deleteChecklist = (id: string) => db.checklists.delete(id);

/* ───────── Historique (recherche, termes consultés) ───────── */
const HISTORY_LIMIT = 30;
export async function addHistory(kind: HistoryEntry['kind'], value: string) {
  const v = value.trim();
  if (!v) return;
  await db.transaction('rw', db.history, async () => {
    // Une seule occurrence par valeur : la plus récente.
    await db.history.filter((h) => h.kind === kind && h.value === v).delete();
    await db.history.put({ id: newId('h'), kind, value: v, at: nowIso() });
    const all = await db.history.where('kind').equals(kind).sortBy('at');
    if (all.length > HISTORY_LIMIT) await db.history.bulkDelete(all.slice(0, all.length - HISTORY_LIMIT).map((h) => h.id));
  });
}
export const clearHistory = (kind: HistoryEntry['kind']) => db.history.where('kind').equals(kind).delete();
