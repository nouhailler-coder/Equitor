import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CHAPTERS_CATALOG } from '../data/chapters.ts';
import { LESSONS_CATALOG } from '../data/lessons.ts';
import { QUIZZES_CATALOG } from '../data/quizzes.ts';
import { GLOSSARY_CATALOG } from '../data/glossary.ts';
import { validateBackupJson } from '../db/index.ts';

describe('ÉquiProgression — Tests de validation métier', () => {
  it('contient exactement les 18 chapitres du référentiel classique', () => {
    assert.strictEqual(CHAPTERS_CATALOG.length, 18, 'Doit contenir 18 chapitres');
    for (let i = 1; i <= 18; i++) {
      const found = CHAPTERS_CATALOG.find((c) => c.number === i);
      assert.ok(found, `Le chapitre ${i} doit exister`);
      assert.ok(found.titleFr.length > 0, `Le titre français du chapitre ${i} doit être défini`);
      assert.ok(found.themePrincipal.length > 0, `Le thème principal du chapitre ${i} doit être défini`);
      assert.ok(found.subsections.length > 0, `Le chapitre ${i} doit comporter des sous-sections`);
    }
  });

  it('valide l’intégrité des fiches pédagogiques originales', () => {
    assert.ok(LESSONS_CATALOG.length >= 20, 'Doit contenir un jeu complet de fiches originales');
    const ids = new Set<string>();

    for (const lesson of LESSONS_CATALOG) {
      assert.ok(!ids.has(lesson.id), `Identifiant de fiche dupliqué : ${lesson.id}`);
      ids.add(lesson.id);

      assert.ok(lesson.titleFr.length > 0, 'La fiche doit avoir un titre');
      assert.ok(lesson.summaryFr.length > 0, 'La fiche doit avoir un résumé');
      assert.ok(lesson.objectives.length > 0, 'La fiche doit comporter des objectifs');
      assert.ok(lesson.sections.length > 0, 'La fiche doit comporter des sections explicatives');
      assert.ok(['faible', 'modéré', 'élevé', 'à_vérifier'].includes(lesson.riskLevel), 'Niveau de risque valide');

      // Safety check: High risk or advanced practice MUST have safety notice
      if (lesson.riskLevel === 'élevé' || lesson.advancedPractice) {
        assert.ok(
          lesson.safetyNotice && lesson.safetyNotice.length > 10,
          `La fiche avancée ${lesson.id} doit comporter un avertissement de sécurité explicite`
        );
      }
    }
  });

  it('valide le catalogue de quiz et les explications pédagogiques', () => {
    assert.ok(QUIZZES_CATALOG.length >= 10, 'Doit contenir des questions de quiz');
    for (const q of QUIZZES_CATALOG) {
      assert.ok(q.questionFr.length > 5, 'Énoncé de question valide');
      assert.ok(q.options.length >= 2, 'Au moins 2 options');
      assert.ok(q.correctOptionIndexes.length >= 1, 'Au moins 1 bonne réponse indexée');
      assert.ok(q.explanationFr.length > 10, 'Explication pédagogique indispensable');
      for (const idx of q.correctOptionIndexes) {
        assert.ok(idx >= 0 && idx < q.options.length, 'Index de bonne réponse valide dans les options');
      }
    }
  });

  it('valide le glossaire technique de l’équitation classique', () => {
    assert.ok(GLOSSARY_CATALOG.length >= 10, 'Doit contenir des termes de glossaire');
    for (const term of GLOSSARY_CATALOG) {
      assert.ok(term.termFr.length > 0, 'Terme FR');
      assert.ok(term.synonymeOuVariante.length > 0, 'Synonyme ou variante');
      assert.ok(term.definitionFr.length > 10, 'Définition FR');
      assert.ok(term.exampleFr.length > 0, 'Exemple d’application');
      assert.ok(term.domaineTechnique.length > 0, 'Domaine technique');
    }
  });

  it('teste la validation des sauvegardes JSON', () => {
    // 1. JSON corrompu
    const invalidRes = validateBackupJson('{ malformed json');
    assert.strictEqual(invalidRes.preview.valid, false);

    // 2. JSON valide
    const sampleBackup = JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      horses: [{ id: 'h1', name: 'Tornado', createdAt: 1000, updatedAt: 1000 }],
      sessions: [{
        id: 's1',
        horseName: 'Tornado',
        date: '2026-10-24',
        durationMinutes: 45,
        theme: 'Plat',
        objectives: [],
        exercises: [],
        observations: '',
        riderFeelScore: 4,
        horseRelaxationScore: 4,
        successes: '',
        difficulties: '',
        nextGoals: '',
        createdAt: 1000,
        updatedAt: 1000,
      }],
      progress: [],
      quizAttempts: [],
      favorites: [],
    });

    const validRes = validateBackupJson(sampleBackup);
    assert.strictEqual(validRes.preview.valid, true);
    assert.strictEqual(validRes.preview.horsesCount, 1);
    assert.strictEqual(validRes.preview.sessionsCount, 1);
  });
});
