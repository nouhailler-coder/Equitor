/**
 * Intégrité des contenus pédagogiques : identifiants uniques, réponses valides,
 * et AUCUN lien interne cassé entre compétences, exercices, fiches, dictionnaire,
 * atlas, matériel, manège, comportement, modèles de séance et diagnostic.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISES, EXERCISE_BY_ID, LESSON_BY_ID, SKILLS, SKILL_BY_ID } from '../data/catalog.ts';
import { DOMAINS } from '../data/skills.ts';
import { DICTIONARY, DICTIONARY_BY_ID } from '../data/dictionary.ts';
import { FLASHCARDS } from '../data/flashcards.ts';
import { INTERACTIVE_VIEWS } from '../data/interactiveViews.ts';
import { ATLAS } from '../data/atlas.ts';
import { EQUIPMENT } from '../data/equipment.ts';
import { BEHAVIORS } from '../data/behaviors.ts';
import { ARENA_FIGURES } from '../data/arenaFigures.ts';
import { SESSION_TEMPLATES } from '../data/sessionTemplates.ts';
import { DIAGNOSTIC } from '../data/diagnostic.ts';
import { DEFAULT_CHECKLISTS } from '../data/defaultChecklists.ts';

const unique = (ids: string[], label: string) => {
  const seen = new Set<string>();
  for (const id of ids) {
    assert.ok(!seen.has(id), `${label} : identifiant dupliqué « ${id} »`);
    seen.add(id);
  }
};

describe('Référentiel de compétences', () => {
  it('identifiants uniques, domaines et prérequis valides, sans cycle', () => {
    unique(SKILLS.map((s) => s.id), 'Compétences');
    const domainIds = new Set(DOMAINS.map((d) => d.id));
    for (const s of SKILLS) {
      assert.ok(domainIds.has(s.domain), `${s.id} : domaine inconnu`);
      for (const p of s.prerequisites) assert.ok(SKILL_BY_ID[p], `${s.id} : prérequis inconnu ${p}`);
      for (const l of s.lessonIds) assert.ok(LESSON_BY_ID[l], `${s.id} : fiche inconnue ${l}`);
    }
    const visiting = new Set<string>();
    const done = new Set<string>();
    const visit = (id: string) => {
      if (done.has(id)) return;
      assert.ok(!visiting.has(id), `Cycle de prérequis autour de ${id}`);
      visiting.add(id);
      SKILL_BY_ID[id].prerequisites.forEach(visit);
      visiting.delete(id);
      done.add(id);
    };
    SKILLS.forEach((s) => visit(s.id));
  });

  it('chaque domaine a au moins une compétence et chaque compétence au moins un exercice', () => {
    for (const d of DOMAINS) assert.ok(SKILLS.some((s) => s.domain === d.id), `Domaine sans compétence : ${d.id}`);
    for (const s of SKILLS) assert.ok(s.exerciseIds.length > 0, `Compétence sans exercice : ${s.id}`);
  });
});

describe('Exercices', () => {
  it('identifiants uniques (exercices et questions) et champs obligatoires', () => {
    unique(EXERCISES.map((e) => e.id), 'Exercices');
    unique(EXERCISES.flatMap((e) => e.questions.map((q) => q.id)), 'Questions');
    for (const e of EXERCISES) {
      assert.ok(e.title && e.description && e.objective, `${e.id} : champs descriptifs manquants`);
      assert.ok(e.questions.length > 0, `${e.id} : aucune question`);
      for (const sid of e.skillIds) assert.ok(SKILL_BY_ID[sid], `${e.id} : compétence inconnue ${sid}`);
    }
  });

  it('réponses cohérentes et explications présentes', () => {
    for (const e of EXERCISES) {
      for (const q of e.questions) {
        assert.ok(q.explanation.length > 10, `${q.id} : explication manquante`);
        switch (q.type) {
          case 'qcm':
          case 'notion':
          case 'situation':
            assert.ok(q.options.length >= 2 && q.correct.length >= 1, `${q.id} : options`);
            q.correct.forEach((i) => assert.ok(i >= 0 && i < q.options.length, `${q.id} : index hors limites`));
            break;
          case 'association':
            assert.ok(q.pairs.length >= 2, `${q.id} : au moins 2 paires`);
            unique(q.pairs.map((p) => p.right), `${q.id} droite`);
            break;
          case 'classement':
            assert.ok(q.items.length >= 2, `${q.id} : au moins 2 éléments`);
            unique(q.items, `${q.id} éléments`);
            break;
          case 'texte_a_completer': {
            const holes = q.text.match(/\{\{\d+\}\}/g) ?? [];
            assert.equal(holes.length, q.blanks.length, `${q.id} : nombre de trous`);
            break;
          }
          case 'ouverte':
            assert.ok(q.keyPoints.length >= 2 && q.modelAnswer.length > 10, `${q.id} : correction indicative`);
            break;
          case 'image': {
            const view = INTERACTIVE_VIEWS[q.viewId];
            assert.ok(view, `${q.id} : vue inconnue ${q.viewId}`);
            assert.ok(view.regions.some((r) => r.id === q.targetId), `${q.id} : région inconnue ${q.targetId}`);
            break;
          }
          default:
            break;
        }
      }
    }
  });

  it('les ressources proposées après une réponse existent', () => {
    const equipmentIds = new Set(EQUIPMENT.map((e) => e.id));
    const behaviorIds = new Set(BEHAVIORS.map((b) => b.id));
    const figureIds = new Set([...ARENA_FIGURES.map((f) => f.id), 'lettres']);
    for (const e of EXERCISES) {
      for (const q of e.questions) {
        const r = q.resource;
        if (!r) continue;
        const ok =
          (r.kind === 'fiche' && LESSON_BY_ID[r.id]) ||
          (r.kind === 'terme' && DICTIONARY_BY_ID[r.id]) ||
          (r.kind === 'atlas' && ATLAS[r.id]) ||
          (r.kind === 'materiel' && equipmentIds.has(r.id)) ||
          (r.kind === 'manege' && figureIds.has(r.id)) ||
          (r.kind === 'comportement' && behaviorIds.has(r.id));
        assert.ok(ok, `${q.id} : ressource introuvable ${r.kind}/${r.id}`);
      }
    }
  });
});

describe('Dictionnaire, cartes et ressources', () => {
  it('dictionnaire : termes uniques, renvois et fiches valides', () => {
    unique(DICTIONARY.map((d) => d.id), 'Dictionnaire');
    unique(DICTIONARY.map((d) => d.term.toLowerCase()), 'Termes');
    for (const d of DICTIONARY) {
      for (const r of d.related) assert.ok(DICTIONARY_BY_ID[r], `${d.id} : renvoi inconnu ${r}`);
      for (const l of d.lessonIds) assert.ok(LESSON_BY_ID[l], `${d.id} : fiche inconnue ${l}`);
      if (d.illustration?.kind === 'atlas') assert.ok(ATLAS[d.illustration.id], `${d.id} : atlas ${d.illustration.id}`);
    }
    assert.ok(DICTIONARY.length >= 80);
  });

  it('cartes mémoire : compétences et termes valides', () => {
    unique(FLASHCARDS.map((f) => f.id), 'Cartes');
    for (const f of FLASHCARDS) {
      f.skillIds.forEach((s) => assert.ok(SKILL_BY_ID[s], `${f.id} : compétence ${s}`));
      if (f.termId) assert.ok(DICTIONARY_BY_ID[f.termId], `${f.id} : terme ${f.termId}`);
    }
  });

  it('atlas : chaque région des vues anatomiques a une fiche', () => {
    for (const v of Object.values(INTERACTIVE_VIEWS).filter((v) => v.id.startsWith('anatomie-'))) {
      for (const r of v.regions) assert.ok(ATLAS[r.id], `Atlas : région sans contenu ${v.id}/${r.id}`);
    }
    for (const a of Object.values(ATLAS)) if (a.termId) assert.ok(DICTIONARY_BY_ID[a.termId], `Atlas : terme ${a.termId}`);
  });

  it('matériel, comportement, manège : références valides', () => {
    for (const e of EQUIPMENT) {
      if (e.viewId) assert.ok(INTERACTIVE_VIEWS[e.viewId]);
      if (e.exerciseId) assert.ok(EXERCISE_BY_ID[e.exerciseId], `${e.id} : exercice ${e.exerciseId}`);
      e.termIds.forEach((t) => assert.ok(DICTIONARY_BY_ID[t], `${e.id} : terme ${t}`));
      e.lessonIds.forEach((l) => assert.ok(LESSON_BY_ID[l], `${e.id} : fiche ${l}`));
      assert.ok(e.safetyChecks.length && e.maintenance.length && e.commonMistakes.length);
    }
    unique(BEHAVIORS.map((b) => b.id), 'Comportements');
    for (const b of BEHAVIORS) assert.ok(b.interpretations.length >= 1 && b.vigilance && b.precautions);
    unique(ARENA_FIGURES.map((f) => f.id), 'Figures');
    for (const f of ARENA_FIGURES) f.termIds.forEach((t) => assert.ok(DICTIONARY_BY_ID[t], `${f.id} : terme ${t}`));
  });

  it('modèles de séance, diagnostic et checklists : références valides', () => {
    for (const t of SESSION_TEMPLATES) {
      t.skillIds.forEach((s) => assert.ok(SKILL_BY_ID[s], `${t.id} : compétence ${s}`));
      t.lessonIds.forEach((l) => assert.ok(LESSON_BY_ID[l], `${t.id} : fiche ${l}`));
      t.exerciseIds.forEach((e) => assert.ok(EXERCISE_BY_ID[e], `${t.id} : exercice ${e}`));
    }
    assert.equal(SESSION_TEMPLATES.length, 8);
    const domains = new Set(DIAGNOSTIC.map((d) => d.domain));
    assert.equal(domains.size, DOMAINS.length, 'le diagnostic couvre tous les domaines');
    for (const d of DIAGNOSTIC) d.skillIds.forEach((s) => assert.ok(SKILL_BY_ID[s], `${d.question.id} : compétence ${s}`));
    unique(DIAGNOSTIC.map((d) => d.question.id), 'Diagnostic');
    unique(DEFAULT_CHECKLISTS.flatMap((c) => c.items.map((i) => i.id)), 'Items de checklist');
  });
});
