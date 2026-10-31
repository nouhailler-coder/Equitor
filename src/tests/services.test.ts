/** Tests unitaires des services purs : révisions, maîtrise, correction, migrations, sauvegarde. */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_INTERVALS,
  classifyRevision,
  createRevisionItem,
  gradeFromScore,
  scheduleReview,
} from '../services/revision/spacedRepetition.ts';
import { applyEvaluation, masteryIndex, masteryState } from '../services/progression/mastery.ts';
import { normalizeAnswer, scoreQuestion, scoreSeries, seededShuffle } from '../services/exercises/scoring.ts';
import { guessSessionType, migrateHorse, migrateJournalEntry, migrateLessonProgress } from '../services/storage/migrations.ts';
import type { ExerciseQuestion, SkillEvaluation } from '../types/models.ts';

const DAY = 86_400_000;
const at = (d: Date, days: number) => new Date(d.getTime() + days * DAY);

describe('Répétition espacée', () => {
  const t0 = new Date('2026-01-01T09:00:00Z');

  it('suit la suite 1, 3, 7, 14, 30 jours sur des réussites successives', () => {
    let item = createRevisionItem('flashcard', 'impulsion', t0);
    let now = t0;
    const intervals: number[] = [];
    for (let i = 0; i < 5; i++) {
      item = scheduleReview(item, 'bien', now);
      intervals.push(item.intervalDays);
      now = new Date(item.dueAt);
    }
    assert.deepEqual(intervals, [...BASE_INTERVALS]);
  });

  it('au-delà de la suite, multiplie l’intervalle par la facilité', () => {
    let item = { ...createRevisionItem('flashcard', 'x', t0), step: 5, intervalDays: 30 };
    item = scheduleReview(item, 'bien', t0);
    assert.equal(item.intervalDays, Math.round(30 * 2.5));
  });

  it('un oubli renvoie à l’étape 0, à revoir le jour même, et baisse la facilité', () => {
    let item = scheduleReview(createRevisionItem('flashcard', 'x', t0), 'bien', t0);
    item = scheduleReview(item, 'bien', new Date(item.dueAt));
    const forgotten = scheduleReview(item, 'oublie', new Date(item.dueAt));
    assert.equal(forgotten.step, 0);
    assert.equal(forgotten.intervalDays, 0);
    assert.equal(forgotten.lapses, 1);
    assert.ok(forgotten.ease < item.ease);
  });

  it('« difficile » raccourcit l’intervalle sans faire avancer', () => {
    let item = scheduleReview(createRevisionItem('flashcard', 'x', t0), 'bien', t0); // étape 1
    item = scheduleReview(item, 'bien', new Date(item.dueAt)); // étape 2 (3 j)
    const hard = scheduleReview(item, 'difficile', new Date(item.dueAt));
    assert.equal(hard.step, 2);
    assert.ok(hard.intervalDays < 3 && hard.intervalDays >= 1);
  });

  it('« facile » saute une étape', () => {
    const easy = scheduleReview(createRevisionItem('flashcard', 'x', t0), 'facile', t0);
    assert.equal(easy.step, 2);
    assert.ok(easy.intervalDays >= 3);
  });

  it('crédite partiellement une révision tardive réussie', () => {
    let item = scheduleReview(createRevisionItem('flashcard', 'x', t0), 'bien', t0); // dû à J+1
    const onTime = scheduleReview(item, 'bien', new Date(item.dueAt));
    const late = scheduleReview(item, 'bien', at(new Date(item.dueAt), 4));
    assert.ok(late.intervalDays > onTime.intervalDays);
  });

  it('classe les révisions (retard, jour, fragile, maîtrisée)', () => {
    const now = new Date('2026-03-10T12:00:00Z');
    const base = createRevisionItem('flashcard', 'x', now);
    assert.equal(classifyRevision({ ...base, reviews: 1, dueAt: at(now, -3).toISOString() }, now), 'en_retard');
    assert.equal(classifyRevision({ ...base, dueAt: now.toISOString() }, now), 'du_jour');
    assert.equal(classifyRevision({ ...base, reviews: 3, lapses: 2, dueAt: at(now, 5).toISOString() }, now), 'fragile');
    assert.equal(classifyRevision({ ...base, reviews: 4, step: 4, dueAt: at(now, 20).toISOString() }, now), 'maitrisee');
  });

  it('convertit un score en appréciation', () => {
    assert.equal(gradeFromScore(1), 'facile');
    assert.equal(gradeFromScore(0.8), 'bien');
    assert.equal(gradeFromScore(0.5), 'difficile');
    assert.equal(gradeFromScore(0.1), 'oublie');
  });
});

describe('Moteur de progression', () => {
  const ev = (day: string, score: number): SkillEvaluation => ({ at: `${day}T10:00:00.000Z`, source: 'exercice', refId: 'e', score });
  const now = new Date('2026-02-10T10:00:00Z');

  it('la consultation seule ne donne jamais la maîtrise', () => {
    assert.equal(masteryState([], { lessonViewed: true }), 'apprentissage');
    assert.equal(masteryState([]), 'non_commence');
  });

  it('pondère davantage les évaluations récentes', () => {
    assert.ok(masteryIndex([ev('2026-01-01', 0), ev('2026-01-02', 1)]) > 50);
  });

  it('exige 3 évaluations sur 2 jours pour « maîtrisé »', () => {
    assert.equal(masteryState([ev('2026-02-01', 1), ev('2026-02-01', 1)], { now }), 'consolidation');
    assert.equal(masteryState([ev('2026-02-01', 1), ev('2026-02-01', 1), ev('2026-02-01', 1)], { now }), 'consolidation');
    assert.equal(masteryState([ev('2026-02-01', 1), ev('2026-02-02', 1), ev('2026-02-03', 1)], { now }), 'maitrise');
  });

  it('un échec récent fait passer « à réviser »', () => {
    assert.equal(masteryState([ev('2026-02-01', 1), ev('2026-02-02', 1), ev('2026-02-03', 0.2)], { now }), 'a_reviser');
  });

  it('une maîtrise ancienne (> 60 j) repasse « à réviser »', () => {
    const old = [ev('2025-10-01', 1), ev('2025-10-02', 1), ev('2025-10-03', 1)];
    assert.equal(masteryState(old, { now }), 'a_reviser');
  });

  it('applyEvaluation borne le score et conserve 30 évaluations', () => {
    let p = applyEvaluation(undefined, 's', { ...ev('2026-01-01', 7) });
    assert.equal(p.evaluations[0].score, 1);
    for (let i = 0; i < 40; i++) p = applyEvaluation(p, 's', ev('2026-01-02', 0.5));
    assert.equal(p.evaluations.length, 30);
  });
});

describe('Correction des exercices', () => {
  const base = { id: 'q', prompt: 'p', explanation: 'e' };

  it('QCM simple et multiple (crédit partiel, pénalité des mauvaises cases)', () => {
    const single = { ...base, type: 'qcm', options: ['a', 'b'], correct: [1] } as ExerciseQuestion;
    assert.equal(scoreQuestion(single, { type: 'choix', selected: [1] }), 1);
    assert.equal(scoreQuestion(single, { type: 'choix', selected: [0] }), 0);
    const multi = { ...base, type: 'qcm', options: ['a', 'b', 'c', 'd'], correct: [0, 2] } as ExerciseQuestion;
    assert.equal(scoreQuestion(multi, { type: 'choix', selected: [0, 2] }), 1);
    assert.equal(scoreQuestion(multi, { type: 'choix', selected: [0] }), 0.5);
    assert.equal(scoreQuestion(multi, { type: 'choix', selected: [0, 1] }), 0);
  });

  it('vrai/faux, image, flashcard', () => {
    assert.equal(scoreQuestion({ ...base, type: 'vrai_faux', answer: false }, { type: 'vrai_faux', value: false }), 1);
    assert.equal(scoreQuestion({ ...base, type: 'image', viewId: 'v', targetId: 'garrot' }, { type: 'image', regionId: 'dos' }), 0);
    assert.equal(scoreQuestion({ ...base, type: 'flashcard', front: 'f', back: 'b' }, { type: 'flashcard', knew: true }), 1);
  });

  it('association et classement donnent un crédit partiel', () => {
    const assoc = { ...base, type: 'association', pairs: [{ left: 'a', right: '1' }, { left: 'b', right: '2' }] } as ExerciseQuestion;
    assert.equal(scoreQuestion(assoc, { type: 'association', mapping: { 0: 0, 1: 0 } }), 0.5);
    const order = { ...base, type: 'classement', items: ['pas', 'trot', 'galop'] } as ExerciseQuestion;
    assert.equal(scoreQuestion(order, { type: 'classement', order: ['pas', 'trot', 'galop'] }), 1);
    assert.equal(scoreQuestion(order, { type: 'classement', order: ['trot', 'pas', 'galop'] }), 1 / 3);
  });

  it('texte à compléter : tolère casse et accents', () => {
    const cloze = { ...base, type: 'texte_a_completer', text: 'Le {{0}} a {{1}} temps', blanks: [['pas'], ['quatre', '4']] } as ExerciseQuestion;
    assert.equal(scoreQuestion(cloze, { type: 'texte', values: ['PAS', '4'] }), 1);
    assert.equal(normalizeAnswer('  Épaule  en dedans '), 'epaule en dedans');
  });

  it('question ouverte : auto-évaluation sur les points clés', () => {
    const open = { ...base, type: 'ouverte', modelAnswer: 'm', keyPoints: ['a', 'b', 'c', 'd'] } as ExerciseQuestion;
    assert.equal(scoreQuestion(open, { type: 'auto_evaluation', points: [true, true, false, false] }), 0.5);
  });

  it('score de série et mélange déterministe', () => {
    assert.equal(scoreSeries([1, 0, 0.5, 0.5]), 0.5);
    assert.equal(scoreSeries([]), 0);
    assert.deepEqual(seededShuffle([1, 2, 3, 4], 7), seededShuffle([1, 2, 3, 4], 7));
    assert.deepEqual([...seededShuffle([1, 2, 3, 4], 7)].sort(), [1, 2, 3, 4]);
    // Non-régression : une graine négative (hash d'identifiant) ne doit jamais perdre d'élément.
    for (const seed of [-1, -123456789, 0, 2 ** 31 - 1, -(2 ** 31)]) {
      assert.deepEqual([...seededShuffle([0, 1, 2, 3, 4, 5], seed)].sort(), [0, 1, 2, 3, 4, 5], `graine ${seed}`);
    }
  });
});

describe('Migrations v1 → v2', () => {
  it('convertit un cheval v1 sans perdre le tempérament ni les notes', () => {
    const h = migrateHorse({ id: 'h1', name: 'Fleur', temperament: 'Vive', specialNotes: 'Sensible au sanglage', createdAt: 1700000000000, updatedAt: 1700000000000 });
    assert.equal(h.particularities, 'Vive');
    assert.equal(h.notes, 'Sensible au sanglage');
    assert.equal(h.sex, 'non_precise');
    assert.equal(h.createdAt, new Date(1700000000000).toISOString());
  });

  it('convertit une séance v1 en entrée de journal', () => {
    const e = migrateJournalEntry({
      id: 's1', date: '2026-01-05', durationMinutes: 45, theme: 'Saut : cavaletti', objectives: ['Rythme'], exercises: [],
      observations: 'RAS', successes: 'Calme', difficulties: 'Abords', nextGoals: 'Ligne droite', riderFeelScore: 4, horseRelaxationScore: 5,
      createdAt: 1700000000000, updatedAt: 1700000000000,
    });
    assert.equal(e.sessionType, 'obstacle');
    assert.equal(e.title, 'Saut : cavaletti');
    assert.equal(e.positives, 'Calme');
    assert.equal(e.improvements, 'Ligne droite');
    assert.equal(e.comments, 'RAS');
    assert.equal(e.feeling, 4);
    assert.equal(e.horseRelaxation, 5);
  });

  it('est idempotente sur des données déjà en v2', () => {
    const e = migrateJournalEntry({ id: 's', date: '2026-01-01', title: 'T', sessionType: 'dressage' });
    assert.equal(e.sessionType, 'dressage');
  });

  it('extrait la note personnelle de la progression v1', () => {
    const { progress, note } = migrateLessonProgress({ lessonId: 'f1', status: 'termine', lastViewedAt: 1700000000000, reviewCount: 3, personalNotes: 'À revoir' });
    assert.equal(progress.status, 'termine');
    assert.equal(progress.viewCount, 3);
    assert.equal(note?.text, 'À revoir');
    assert.equal(note?.id, 'lesson_f1');
  });

  it('devine le type de séance depuis le thème', () => {
    assert.equal(guessSessionType('Balade en forêt'), 'exterieur');
    assert.equal(guessSessionType('Travail à pied en liberté'), 'travail_a_pied');
    assert.equal(guessSessionType('Épaule en dedans'), 'dressage');
    assert.equal(guessSessionType('Séance'), 'travail_general');
  });
});
