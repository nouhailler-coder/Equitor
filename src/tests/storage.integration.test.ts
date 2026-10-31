/**
 * Tests d'intégration du stockage : migration réelle d'une base v1 vers v2,
 * export / validation / import (fusion et remplacement) d'une sauvegarde.
 * IndexedDB est fourni par fake-indexeddb.
 */
import 'fake-indexeddb/auto';
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Dexie from 'dexie';
import { EquiProgressionDatabase, db } from '../services/storage/db.ts';
import {
  buildBackupFile,
  importBackup,
  mergeRecords,
  readAllUserData,
  validateBackup,
} from '../services/backup/backup.ts';

describe('Migration IndexedDB v1 → v2', () => {
  const NAME = 'MigrationTestDB';

  it('conserve et convertit toutes les données v1', async () => {
    const v1 = new Dexie(NAME);
    v1.version(1).stores({
      horses: 'id, name, isFavorite, createdAt',
      ridingSessions: 'id, horseId, date, theme, createdAt',
      userProgress: 'lessonId, status, lastViewedAt, completedAt',
      quizAttempts: 'id, questionId, attemptedAt, isCorrect',
      favorites: 'id, type, targetId, createdAt',
    });
    await v1.open();
    await v1.table('horses').put({ id: 'h1', name: 'Fleur', temperament: 'Vive', createdAt: 1, updatedAt: 1 });
    await v1.table('ridingSessions').put({
      id: 's1', horseId: 'h1', date: '2026-01-05', durationMinutes: 40, theme: 'Plat', objectives: [], exercises: [],
      observations: 'obs', successes: 'ok', difficulties: 'dur', nextGoals: 'next', riderFeelScore: 4, horseRelaxationScore: 3, createdAt: 2, updatedAt: 2,
    });
    await v1.table('userProgress').put({ lessonId: 'f1', status: 'en_cours', lastViewedAt: 3, reviewCount: 2, personalNotes: 'Ma note' });
    await v1.table('quizAttempts').put({ id: 'q1', questionId: 'quiz-01', selectedOptionIndexes: [1], isCorrect: true, attemptedAt: 4 });
    await v1.table('favorites').put({ id: 'lesson_f1', type: 'lesson', targetId: 'f1', createdAt: 5 });
    v1.close();

    const v2 = new EquiProgressionDatabase(NAME);
    await v2.open();
    assert.equal(v2.verno, 2);

    const horse = await v2.horses.get('h1');
    assert.equal(horse?.particularities, 'Vive');
    assert.equal(horse?.sex, 'non_precise');

    const entry = await v2.ridingSessions.get('s1');
    assert.equal(entry?.title, 'Plat');
    assert.equal(entry?.positives, 'ok');
    assert.equal((entry as unknown as Record<string, unknown>).theme, 'Plat', 'les champs v1 sont conservés');

    const progress = await v2.lessonProgress.get('f1');
    assert.equal(progress?.status, 'en_cours');
    assert.equal((await v2.notes.get('lesson_f1'))?.text, 'Ma note');
    assert.equal(await v2.userProgress.count(), 1, 'la table v1 reste en filet de sécurité');
    assert.equal(await v2.quizAttempts.count(), 1);
    assert.equal(typeof (await v2.favorites.get('lesson_f1'))?.createdAt, 'string');
    assert.equal(await v2.checklists.count(), 3, 'checklists par défaut installées');
    v2.close();
  });

  it('une base neuve reçoit les checklists par défaut', async () => {
    const fresh = new EquiProgressionDatabase('FreshTestDB');
    await fresh.open();
    assert.equal(await fresh.checklists.count(), 3);
    fresh.close();
  });
});

describe('Sauvegarde et restauration', () => {
  after(() => db.close());

  it('exporte, valide (intégrité) puis restaure en remplacement', async () => {
    await db.open();
    await db.horses.put({ id: 'h1', name: 'Fleur', sex: 'jument', isFavorite: false, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
    await db.ridingSessions.put({
      id: 'j1', date: '2026-01-02', durationMinutes: 30, sessionType: 'dressage', title: 'Plat', objectives: [], exercises: [],
      difficulties: '', positives: '', improvements: '', feeling: 4, comments: '', personalNotes: '', skillIds: [], isFavorite: false,
      createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z',
    });
    const file = await buildBackupFile(await readAllUserData(), '2.0.0');
    const text = JSON.stringify(file);

    const res = await validateBackup(text);
    assert.ok(res.ok);
    if (!res.ok) return;
    assert.equal(res.preview.integrity, 'verifiee');
    assert.equal(res.preview.counts.horses, 1);

    await db.horses.clear();
    await db.ridingSessions.put({ ...(await db.ridingSessions.get('j1'))!, id: 'j2' });
    await importBackup(res.data, 'remplacement');
    assert.equal(await db.horses.count(), 1);
    assert.equal(await db.ridingSessions.get('j2'), undefined, 'le remplacement retire les données absentes de la sauvegarde');
  });

  it('la fusion garde la version la plus récente et les enregistrements locaux', async () => {
    const merged = mergeRecords(
      'horses',
      [{ id: 'a', name: 'Local', updatedAt: '2026-02-01' }, { id: 'b', name: 'Seul local', updatedAt: '2026-01-01' }],
      [{ id: 'a', name: 'Ancien', updatedAt: '2026-01-01' }, { id: 'c', name: 'Nouveau', updatedAt: '2026-01-01' }],
    );
    const byId = Object.fromEntries(merged.map((r) => [r.id, r.name]));
    assert.deepEqual(byId, { a: 'Local', b: 'Seul local', c: 'Nouveau' });
  });

  it('import en fusion depuis une sauvegarde v1', async () => {
    const v1 = JSON.stringify({
      version: '1.0.0', exportedAt: '2026-01-01', horses: [{ id: 'h9', name: 'Ancien', createdAt: 1, updatedAt: 1 }],
      sessions: [{ id: 's9', date: '2026-01-03', durationMinutes: 20, theme: 'Balade', createdAt: 1, updatedAt: 1 }],
      progress: [], quizAttempts: [], favorites: [],
    });
    const res = await validateBackup(v1);
    assert.ok(res.ok);
    if (!res.ok) return;
    assert.equal(res.preview.formatVersion, 1);
    await importBackup(res.data, 'fusion');
    assert.equal((await db.ridingSessions.get('s9'))?.sessionType, 'exterieur');
    assert.equal(await db.horses.count(), 2);
  });

  it('refuse les fichiers invalides ou trop récents et signale une altération', async () => {
    assert.equal((await validateBackup('{oops')).ok, false);
    assert.equal((await validateBackup('[]')).ok, false);
    assert.equal((await validateBackup(JSON.stringify({ format: 'equiprogression-backup', formatVersion: 99, data: {} }))).ok, false);

    const file = await buildBackupFile(await readAllUserData(), '2.0.0');
    (file.data.horses[0] as Record<string, unknown>).name = 'Modifié';
    const res = await validateBackup(JSON.stringify(file));
    assert.ok(res.ok && res.preview.integrity === 'invalide');
  });

  it('ignore les enregistrements incomplets', async () => {
    const file = await buildBackupFile(await readAllUserData(), '2.0.0');
    file.data.horses.push({ id: 'x' });
    file.checksum = '';
    const res = await validateBackup(JSON.stringify(file));
    assert.ok(res.ok);
    if (res.ok) assert.equal(res.preview.rejected.horses, 1);
  });
});
