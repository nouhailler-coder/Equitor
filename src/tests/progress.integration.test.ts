/**
 * Tests d'intégration (IndexedDB simulée) : profil, séance, cheval, exercice,
 * progression, planification des révisions, favoris, journal, programmes.
 */
import 'fake-indexeddb/auto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../services/storage/db.ts';
import {
  addHistory,
  deleteHorse,
  deleteJournalEntry,
  saveHorse,
  saveJournalEntry,
  savePlan,
  saveProfile,
  toggleFavorite,
} from '../services/storage/repos.ts';
import { completeDiagnostic, recordExerciseAttempt, recordLessonView, recordRevision } from '../services/progression/progressService.ts';
import { EXERCISE_BY_ID } from '../data/catalog.ts';

before(async () => {
  await db.delete();
  await db.open();
});
after(() => db.close());

const baseEntry = {
  date: '2026-03-01', durationMinutes: 40, sessionType: 'dressage' as const, title: 'Plat', objectives: ['Rythme'], exercises: [],
  difficulties: '', positives: '', improvements: '', feeling: 4, comments: '', personalNotes: '', skillIds: [], isFavorite: false,
};

describe('Profil et diagnostic', () => {
  it('crée un profil puis enregistre un diagnostic qui évalue les compétences', async () => {
    const p = await saveProfile({ level: 'debutant', experience: 'moins_1_an', goals: ['Galoper'], interests: ['securite'], theoryKnowledge: 2, skillsToImprove: '' });
    assert.equal(p.id, 'me');
    await completeDiagnostic({
      answers: [
        { domain: 'securite', skillIds: ['se-approche'], score: 1, questionId: 'dg-se-1' },
        { domain: 'allures', skillIds: ['al-identifier'], score: 0, questionId: 'dg-al-1' },
      ],
      recommendedSkillIds: ['al-identifier'],
    });
    assert.ok((await db.profile.get('me'))?.diagnosticCompletedAt);
    assert.equal((await db.skillProgress.get('al-identifier'))?.state, 'a_reviser');
    const diag = await db.diagnostics.toArray();
    assert.equal(diag[0].domainScores.securite, 1);
    assert.equal(diag[0].globalScore, 0.5);
  });
});

describe('Exercices, progression et révisions', () => {
  it('consulter une fiche ne donne pas la maîtrise', async () => {
    await recordLessonView('fiche-14-figures-de-manege');
    const sp = await db.skillProgress.get('dr-lettres');
    assert.equal(sp?.state, 'apprentissage');
    assert.equal(sp?.mastery, 0);
    await recordLessonView('fiche-14-figures-de-manege');
    assert.equal((await db.lessonProgress.get('fiche-14-figures-de-manege'))?.viewCount, 2);
  });

  it('un exercice enregistre la tentative, met à jour les compétences et planifie les révisions', async () => {
    const ex = EXERCISE_BY_ID['ex-allures-bases'];
    const startedAt = new Date(Date.now() - 60_000).toISOString();
    const results = ex.questions.map((q, i) => ({ questionId: q.id, score: i === 0 ? 0 : 1, given: null }));
    const attempt = await recordExerciseAttempt({ exerciseId: ex.id, startedAt, results });
    assert.equal(attempt.attemptNumber, 1);
    assert.equal(attempt.errors.length, 1);
    assert.ok(attempt.durationSec >= 59);
    assert.equal(Math.round(attempt.score * 100), 80);

    const sp = await db.skillProgress.get('al-identifier');
    assert.equal(sp?.evaluations.length, 2, 'diagnostic + exercice');

    const failed = await db.revisionItems.get(`question:${ex.questions[0].id}`);
    assert.equal(failed?.intervalDays, 0, 'question ratée : à revoir aujourd’hui');
    const ok = await db.revisionItems.get(`question:${ex.questions[1].id}`);
    assert.equal(ok?.intervalDays, 4, 'question réussie sans faute (« facile ») : étape 2, 3 j × 1,3');

    const again = await recordExerciseAttempt({ exerciseId: ex.id, startedAt, results });
    assert.equal(again.attemptNumber, 2);
  });

  it('une révision de carte mémoire est planifiée et évalue les compétences', async () => {
    const item = await recordRevision('flashcard', 'fc-trot', 'bien');
    assert.equal(item.intervalDays, 1);
    assert.equal(item.reviews, 1);
    const sp = await db.skillProgress.get('al-identifier');
    assert.equal(sp?.evaluations.at(-1)?.source, 'revision');
  });
});

describe('Journal, chevaux, favoris, programmes', () => {
  it('crée, modifie et supprime une séance', async () => {
    const e = await saveJournalEntry(baseEntry);
    const edited = await saveJournalEntry({ ...e, title: 'Plat modifié' });
    assert.equal(edited.createdAt, e.createdAt);
    assert.equal((await db.ridingSessions.get(e.id))?.title, 'Plat modifié');
    await toggleFavorite('journal', e.id);
    assert.equal((await db.ridingSessions.get(e.id))?.isFavorite, true);
    await deleteJournalEntry(e.id);
    assert.equal(await db.ridingSessions.get(e.id), undefined);
    assert.equal(await db.favorites.get(`journal_${e.id}`), undefined, 'le favori est supprimé avec la séance');
  });

  it('supprimer un cheval conserve son nom dans les séances', async () => {
    const h = await saveHorse({ name: 'Fleur', sex: 'jument', isFavorite: false });
    const e = await saveJournalEntry({ ...baseEntry, horseId: h.id });
    await deleteHorse(h.id);
    const after = await db.ridingSessions.get(e.id);
    assert.equal(after?.horseId, undefined);
    assert.equal(after?.horseName, 'Fleur');
  });

  it('les favoris se basculent et la séance liée à un programme le marque réalisé', async () => {
    assert.equal(await toggleFavorite('term', 'term-impulsion'), true);
    assert.equal(await toggleFavorite('term', 'term-impulsion'), false);
    const plan = await savePlan({ title: 'Transitions', objective: 'Fluidité', sessionType: 'dressage', skillIds: [], lessonIds: [], exerciseIds: [], notes: '', status: 'prevu' });
    const e = await saveJournalEntry({ ...baseEntry, planId: plan.id });
    const p = await db.sessionPlans.get(plan.id);
    assert.equal(p?.status, 'realise');
    assert.equal(p?.journalEntryId, e.id);
  });

  it('l’historique de recherche dédoublonne et reste borné', async () => {
    for (let i = 0; i < 35; i++) await addHistory('recherche', `terme ${i}`);
    await addHistory('recherche', 'terme 34');
    const all = await db.history.where('kind').equals('recherche').toArray();
    assert.equal(all.length, 30);
    assert.equal(all.filter((h) => h.value === 'terme 34').length, 1);
  });
});
