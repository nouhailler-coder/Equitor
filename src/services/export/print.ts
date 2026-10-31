/**
 * Export PDF par impression : un document HTML mis en page est imprimé via une iframe
 * cachée ; l'utilisateur choisit « Enregistrer au format PDF » dans la boîte d'impression.
 * Fonctionne hors ligne, sans dépendance ni serveur. Tout texte est échappé (pas d'injection HTML).
 */
import type { Lesson } from '../../types';
import type { ExerciseAttempt, Horse, JournalEntry, SessionPlan, SkillProgress, UserProfile } from '../../types/models';
import { DISCIPLINE_LABEL, SESSION_TYPE_LABEL, fmtDate, fmtMinutes } from '../../data/labels';
import { EXERCISE_BY_ID, LESSON_BY_ID, LEVEL_LABELS, SKILL_BY_ID, SKILLS } from '../../data/catalog';
import { DOMAINS } from '../../data/skills';
import { MASTERY_LABELS } from '../progression/mastery';
import type { Flashcard } from '../../data/flashcards';

export const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const multiline = (s: string) => esc(s).replace(/\n/g, '<br>');

const STYLE = `
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1c1917; font-size: 11pt; line-height: 1.45; margin: 0; }
  header { display: flex; align-items: center; gap: 10px; border-bottom: 2px solid #1e3a2f; padding-bottom: 8px; margin-bottom: 14px; }
  header img { width: 34px; height: 34px; }
  header .brand { font-weight: 800; color: #1e3a2f; }
  header .meta { margin-left: auto; font-size: 9pt; color: #78716c; text-align: right; }
  h1 { font-size: 18pt; margin: 0 0 4px; }
  h2 { font-size: 13pt; color: #1e3a2f; margin: 18px 0 6px; border-bottom: 1px solid #e7e5e4; padding-bottom: 3px; }
  h3 { font-size: 11pt; margin: 12px 0 4px; }
  .muted { color: #78716c; font-size: 9.5pt; }
  .box { border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px 12px; margin: 8px 0; break-inside: avoid; }
  .warn { background: #fff7ed; border-color: #fdba74; }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  th, td { text-align: left; padding: 5px 6px; border-bottom: 1px solid #e7e5e4; vertical-align: top; }
  th { background: #f5f5f4; }
  ul { margin: 4px 0; padding-left: 18px; }
  .entry { break-inside: avoid; }
  footer { margin-top: 24px; font-size: 8.5pt; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 6px; }
`;

function printDocument(title: string, bodyHtml: string) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${STYLE}</style></head><body>
  <header><img src="${location.origin}/logo.svg" alt=""><span class="brand">Equitor</span>
  <span class="meta">${esc(title)}<br>Édité le ${esc(new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' }))}</span></header>
  ${bodyHtml}
  <footer>Document généré localement par Equitor. Contenus fournis à titre informatif : ils ne remplacent pas l’enseignement d’un professionnel qualifié.</footer>
  </body></html>`;
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();
  const go = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 60_000);
  };
  // Laisser le temps au logo de se charger (il est en cache hors ligne).
  if (doc.readyState === 'complete') setTimeout(go, 250);
  else iframe.onload = () => setTimeout(go, 250);
}

/** Fiche pédagogique. */
export function printLesson(lesson: Lesson, note?: string) {
  const body = `
    <h1>${esc(lesson.titleFr)}</h1>
    <p class="muted">Chapitre ${esc(lesson.chapterNumber)} · ${esc(lesson.sectionThematique)}</p>
    <p>${esc(lesson.summaryFr)}</p>
    ${lesson.safetyNotice ? `<div class="box warn"><strong>Sécurité :</strong> ${esc(lesson.safetyNotice)}</div>` : ''}
    <h2>Objectifs</h2><ul>${lesson.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
    ${lesson.sections.map((s) => `<h2>${esc(s.heading)}</h2><p>${multiline(s.content)}</p>${s.bulletPoints?.length ? `<ul>${s.bulletPoints.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}${s.callout ? `<div class="box">${esc(s.callout.text)}</div>` : ''}`).join('')}
    ${lesson.commonMistakes.length ? `<h2>Erreurs fréquentes</h2><ul>${lesson.commonMistakes.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
    ${lesson.vocabulary.length ? `<h2>Vocabulaire</h2><p>${lesson.vocabulary.map(esc).join(' · ')}</p>` : ''}
    ${note ? `<h2>Ma note personnelle</h2><div class="box">${multiline(note)}</div>` : ''}`;
  printDocument(`Fiche — ${lesson.titleFr}`, body);
}

/** Historique des séances. */
export function printJournal(entries: JournalEntry[], horses: Horse[]) {
  const name = (e: JournalEntry) => horses.find((h) => h.id === e.horseId)?.name ?? e.horseName ?? '—';
  const total = entries.reduce((s, e) => s + e.durationMinutes, 0);
  const body = `
    <h1>Historique des séances</h1>
    <p class="muted">${entries.length} séance(s) · ${esc(fmtMinutes(total))} au total</p>
    ${entries
      .map(
        (e) => `<div class="box entry">
          <h3>${esc(fmtDate(e.date))} — ${esc(e.title)}</h3>
          <p class="muted">${esc(SESSION_TYPE_LABEL[e.sessionType])}${e.discipline ? ' · ' + esc(DISCIPLINE_LABEL[e.discipline]) : ''} · ${esc(fmtMinutes(e.durationMinutes))} · Cheval : ${esc(name(e))} · Ressenti ${e.feeling}/5</p>
          ${e.objectives.length ? `<p><strong>Objectifs :</strong> ${e.objectives.map(esc).join(' ; ')}</p>` : ''}
          ${e.exercises.length ? `<p><strong>Exercices :</strong> ${e.exercises.map(esc).join(' ; ')}</p>` : ''}
          ${e.positives ? `<p><strong>Points positifs :</strong> ${multiline(e.positives)}</p>` : ''}
          ${e.difficulties ? `<p><strong>Difficultés :</strong> ${multiline(e.difficulties)}</p>` : ''}
          ${e.improvements ? `<p><strong>À améliorer :</strong> ${multiline(e.improvements)}</p>` : ''}
          ${e.comments ? `<p><strong>Commentaires :</strong> ${multiline(e.comments)}</p>` : ''}
        </div>`,
      )
      .join('')}`;
  printDocument('Historique des séances', body);
}

/** Programme de préparation (et son bilan). */
export function printPlan(plan: SessionPlan, horse?: Horse) {
  const d = plan.debrief;
  const body = `
    <h1>${esc(plan.title)}</h1>
    <p class="muted">${plan.date ? esc(fmtDate(plan.date)) + ' · ' : ''}${esc(SESSION_TYPE_LABEL[plan.sessionType])}${horse ? ' · Cheval : ' + esc(horse.name) : ''}</p>
    <div class="box"><strong>Objectif :</strong> ${multiline(plan.objective)}</div>
    ${plan.skillIds.length ? `<h2>Compétences visées</h2><ul>${plan.skillIds.map((s) => `<li>${esc(SKILL_BY_ID[s]?.name ?? s)}</li>`).join('')}</ul>` : ''}
    ${plan.lessonIds.length ? `<h2>Fiches à consulter</h2><ul>${plan.lessonIds.map((l) => `<li>${esc(LESSON_BY_ID[l]?.titleFr ?? l)}</li>`).join('')}</ul>` : ''}
    ${plan.exerciseIds.length ? `<h2>Exercices théoriques à réviser</h2><ul>${plan.exerciseIds.map((e) => `<li>${esc(EXERCISE_BY_ID[e]?.title ?? e)}</li>`).join('')}</ul>` : ''}
    ${plan.notes ? `<h2>Notes</h2><p>${multiline(plan.notes)}</p>` : ''}
    ${d ? `<h2>Bilan après séance</h2>
      <p><strong>Objectifs atteints :</strong> ${multiline(d.objectivesReached)}</p>
      <p><strong>Difficultés :</strong> ${multiline(d.difficulties)}</p>
      <p><strong>Questions pour l’enseignant :</strong> ${multiline(d.questionsForTeacher)}</p>
      <p><strong>Notions à revoir :</strong> ${multiline(d.notionsToReview)}</p>
      <p><strong>Prochain objectif :</strong> ${multiline(d.nextObjective)}</p>` : ''}
    <div class="box warn">Support de préparation théorique : le contenu de la séance est fixé et encadré par votre enseignant.</div>`;
  printDocument(`Programme — ${plan.title}`, body);
}

/** Bilan de progression. */
export function printProgress(params: {
  profile?: UserProfile;
  skills: SkillProgress[];
  attempts: ExerciseAttempt[];
  stats: { lessonsViewed: number; exercisesDone: number; successRate: number; learningMinutes: number; sessions: number };
}) {
  const bySkill = Object.fromEntries(params.skills.map((s) => [s.skillId, s]));
  const body = `
    <h1>Bilan de progression</h1>
    ${params.profile ? `<p class="muted">Niveau déclaré : ${esc(LEVEL_LABELS[params.profile.level])} (auto-évaluation, non certifiante)</p>` : ''}
    <table><tbody>
      <tr><th>Fiches consultées</th><td>${params.stats.lessonsViewed}</td><th>Exercices réalisés</th><td>${params.stats.exercisesDone}</td></tr>
      <tr><th>Taux de réussite</th><td>${params.stats.successRate} %</td><th>Temps d’apprentissage</th><td>${esc(fmtMinutes(params.stats.learningMinutes))}</td></tr>
      <tr><th>Séances au journal</th><td>${params.stats.sessions}</td><th>Compétences maîtrisées</th><td>${params.skills.filter((s) => s.state === 'maitrise').length} / ${SKILLS.length}</td></tr>
    </tbody></table>
    ${DOMAINS.map((d) => {
      const skills = SKILLS.filter((s) => s.domain === d.id);
      return `<h2>${esc(d.label)}</h2><table><thead><tr><th>Compétence</th><th>État</th><th>Indice</th></tr></thead><tbody>${skills
        .map((s) => `<tr><td>${esc(s.name)}</td><td>${esc(MASTERY_LABELS[bySkill[s.id]?.state ?? 'non_commence'])}</td><td>${bySkill[s.id]?.mastery ?? 0}</td></tr>`)
        .join('')}</tbody></table>`;
    }).join('')}`;
  printDocument('Bilan de progression', body);
}

/** Fiche de révision (cartes mémoire). */
export function printFlashcards(cards: Flashcard[], title = 'Fiche de révision') {
  const body = `<h1>${esc(title)}</h1><p class="muted">${cards.length} notion(s)</p>
    <table><thead><tr><th style="width:38%">Question</th><th>Réponse</th></tr></thead><tbody>
    ${cards.map((c) => `<tr><td><strong>${esc(c.front)}</strong></td><td>${esc(c.back)}</td></tr>`).join('')}
    </tbody></table>`;
  printDocument(title, body);
}
