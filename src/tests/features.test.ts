/** Tests unitaires : statistiques, recherche, recommandations. */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { journalStats, learningStats, weekStart } from '../services/statistics/stats.ts';
import { buildIndex, editDistance, normalize, search, suggest } from '../services/search/search.ts';
import { prerequisitesMet, recommendSkills } from '../services/progression/recommend.ts';
import { SKILLS } from '../data/catalog.ts';
import type { ExerciseAttempt, JournalEntry, SkillProgress } from '../types/models.ts';

const entry = (date: string, extra: Partial<JournalEntry> = {}): JournalEntry => ({
  id: date, date, durationMinutes: 45, sessionType: 'dressage', title: 'T', objectives: [], exercises: [], difficulties: '', positives: '',
  improvements: '', feeling: 4, comments: '', personalNotes: '', skillIds: [], isFavorite: false, createdAt: date, updatedAt: date, ...extra,
});

describe('Statistiques', () => {
  const now = new Date('2026-03-18T10:00:00'); // mercredi

  it('semaine commençant le lundi', () => {
    assert.equal(weekStart(now), '2026-03-16');
  });

  it('journal : totaux, répartition, fréquence hebdomadaire', () => {
    const s = journalStats([
      entry('2026-03-16', { durationMinutes: 60, discipline: 'dressage', skillIds: ['po-position'] }),
      entry('2026-03-17', { sessionType: 'obstacle', durationMinutes: 30, discipline: 'saut_obstacles' }),
      entry('2026-03-02'),
      entry('2025-01-01'), // hors de la fenêtre de 12 semaines
    ], now);
    assert.equal(s.count, 4);
    assert.equal(s.totalMinutes, 180);
    assert.equal(s.averageMinutes, 45);
    assert.deepEqual(s.byType, { dressage: 3, obstacle: 1 });
    assert.equal(s.byDiscipline.saut_obstacles, 1);
    assert.equal(s.perWeek.at(-1)?.count, 2);
    assert.equal(s.perWeek.at(-1)?.minutes, 90);
    assert.equal(s.perWeek.length, 12);
    assert.equal(s.skillsWorked['po-position'], 1);
  });

  it('journal vide : tout vaut zéro (aucune statistique artificielle)', () => {
    const s = journalStats([], now);
    assert.equal(s.count, 0);
    assert.equal(s.averageMinutes, 0);
    assert.equal(s.averagePerWeek, 0);
  });

  it('apprentissage : taux de réussite, compétences, régularité', () => {
    const attempt = (d: string, score: number): ExerciseAttempt => ({ id: d + score, exerciseId: 'e' + score, startedAt: d, finishedAt: `${d}T10:00:00`, durationSec: 120, score, results: [], errors: [], attemptNumber: 1 });
    const skills: SkillProgress[] = [
      { skillId: 'a', state: 'maitrise', mastery: 90, evaluations: [], updatedAt: '' },
      { skillId: 'b', state: 'a_reviser', mastery: 40, evaluations: [], updatedAt: '' },
    ];
    const s = learningStats({
      lessons: [{ lessonId: 'f', status: 'termine', firstViewedAt: '2026-03-17T09:00:00', lastViewedAt: '2026-03-17T09:00:00', viewCount: 1, readingSeconds: 600 }],
      attempts: [attempt('2026-03-18', 1), attempt('2026-03-17', 0.5)],
      legacyQuiz: [{ id: 'l', questionId: 'q', selectedOptionIndexes: [], isCorrect: false, attemptedAt: Date.parse('2026-03-10T10:00:00') }],
      skills,
      skillDomains: { a: 'allures', b: 'allures' },
      totalSkills: 10,
      now,
    });
    assert.equal(s.successRate, 50); // (1 + 0.5 + 0) / 3
    assert.equal(s.skillsByState.maitrise, 1);
    assert.equal(s.skillsByState.non_commence, 8);
    assert.equal(s.learningMinutes, 14); // 600 s + 240 s
    assert.equal(s.streak, 2);
    assert.equal(s.activeDays30, 3);
    assert.equal(s.byDomain.allures?.mastery, 65);
  });
});

describe('Recherche', () => {
  const index = buildIndex([
    { id: '1', category: 'terme', title: 'Épaule en dedans', body: 'mouvement latéral trois pistes' },
    { id: '2', category: 'terme', title: 'Impulsion', body: 'énergie arrière-main' },
    { id: '3', category: 'fiche', title: 'Les figures de manège', body: 'volte cercle serpentine' },
    { id: '4', category: 'journal', title: 'Séance du 3 mars', body: 'travail sur les transitions et l’impulsion' },
  ]);

  it('insensible aux accents et à la casse', () => {
    assert.equal(normalize('Épaule  EN Dedans'), 'epaule en dedans');
    assert.equal(search(index, 'epaule')[0].id, '1');
    assert.equal(search(index, 'MANEGE')[0].id, '3');
  });

  it('classe le titre avant le corps du texte', () => {
    const hits = search(index, 'impulsion');
    assert.deepEqual(hits.map((h) => h.id), ['2', '4']);
  });

  it('tolère une petite faute de frappe', () => {
    assert.equal(editDistance('impultion', 'impulsion'), 1);
    assert.equal(search(index, 'impultion')[0]?.id, '2');
    assert.equal(search(index, 'serpantine')[0]?.id, '3');
  });

  it('filtre par catégorie, exige tous les mots, propose des suggestions', () => {
    assert.deepEqual(search(index, 'impulsion', { categories: ['journal'] }).map((h) => h.id), ['4']);
    assert.equal(search(index, 'impulsion volte').length, 0);
    assert.deepEqual(suggest(index, 'imp'), ['Impulsion']);
    assert.equal(search(index, '   ').length, 0);
  });
});

describe('Parcours personnalisé', () => {
  it('ne propose que des compétences dont les prérequis sont acquis', () => {
    const recos = recommendSkills({ skills: SKILLS, progress: {}, level: 'debutant', interests: [] }, 50);
    assert.ok(recos.length > 0);
    for (const s of recos) assert.equal(s.prerequisites.length, 0, `${s.id} a des prérequis non acquis`);
  });

  it('priorise les lacunes du diagnostic et les intérêts', () => {
    const recos = recommendSkills({ skills: SKILLS, progress: {}, level: 'debutant', interests: ['securite'], domainScores: { securite: 0 } }, 2);
    assert.ok(recos.every((s) => s.domain === 'securite'));
  });

  it('exclut les compétences maîtrisées et ouvre la suite quand le prérequis est acquis', () => {
    const progress: Record<string, SkillProgress> = {
      'se-approche': { skillId: 'se-approche', state: 'maitrise', mastery: 95, evaluations: [], updatedAt: '' },
    };
    const zones = SKILLS.find((s) => s.id === 'se-zones')!;
    assert.ok(prerequisitesMet(zones, progress));
    const recos = recommendSkills({ skills: SKILLS, progress, level: 'debutant', interests: ['securite'] }, 50);
    assert.ok(!recos.some((s) => s.id === 'se-approche'));
    assert.ok(recos.some((s) => s.id === 'se-zones'));
  });
});
