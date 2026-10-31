import React, { useMemo, useState } from 'react';
import type { DiagnosticResult, DomainId, MasteryState, SkillProgress, UserProfile } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { SKILLS, SKILL_BY_ID, EXERCISE_BY_ID, LESSON_BY_ID, LEVEL_LABELS } from '../../data/catalog';
import { DOMAINS, DOMAIN_BY_ID } from '../../data/skills';
import { PATHWAYS_CATALOG } from '../../data/pathways';
import { MASTERY_LABELS, MASTERY_ORDER } from '../../services/progression/mastery';
import { prerequisitesMet, recommendSkills } from '../../services/progression/recommend';
import { Chips, EmptyState, Link, PageHeader, ProgressBar, btn, card } from '../../components/ui/kit';
import { MASTERY_COLORS } from './ProgressionView';
import { overlays } from '../../app/overlays';
import { navigate } from '../../app/router';

export const MasteryChip: React.FC<{ state: MasteryState }> = ({ state }) => (
  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200">
    <span className="w-2 h-2 rounded-full" style={{ background: MASTERY_COLORS[state] }} aria-hidden="true" />
    {MASTERY_LABELS[state]}
  </span>
);

function useSkillProgress() {
  const list = useLive(() => db.skillProgress.toArray(), [], [] as SkillProgress[]);
  return useMemo(() => Object.fromEntries(list.map((s) => [s.skillId, s])) as Record<string, SkillProgress | undefined>, [list]);
}

/** Référentiel hiérarchique : domaines → compétences, avec état de maîtrise. */
export const SkillsView: React.FC = () => {
  const progress = useSkillProgress();
  const [state, setState] = useState<MasteryState | 'tous'>('tous');
  return (
    <div className="space-y-4">
      <PageHeader title="Référentiel de compétences" icon="🎯" back="progression" subtitle={`${SKILLS.length} compétences dans ${DOMAINS.length} domaines`} help="L’état d’une compétence évolue avec vos résultats aux exercices, au diagnostic et aux révisions. « Maîtrisé » demande au moins 3 évaluations réussies sur 2 jours différents." />
      <Chips label="Filtrer par état" value={state} onChange={setState} options={[{ id: 'tous', label: 'Toutes' }, ...MASTERY_ORDER.map((m) => ({ id: m, label: MASTERY_LABELS[m] }))]} />
      {DOMAINS.map((d) => {
        const skills = SKILLS.filter((s) => s.domain === d.id && (state === 'tous' || (progress[s.id]?.state ?? 'non_commence') === state));
        if (!skills.length) return null;
        const avg = Math.round(skills.reduce((s, x) => s + (progress[x.id]?.mastery ?? 0), 0) / skills.length);
        return (
          <section key={d.id} className={`${card} p-4 space-y-3`} aria-labelledby={`dom-${d.id}`}>
            <div className="flex items-center justify-between gap-2">
              <h2 id={`dom-${d.id}`} className="font-black text-stone-900 dark:text-stone-100">{d.icon} {d.label}</h2>
              <span className="text-xs text-stone-500">{avg} / 100</span>
            </div>
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {skills.map((s) => {
                const p = progress[s.id];
                return (
                  <li key={s.id}>
                    <Link to={`progression/competences/${s.id}`} className="flex items-center gap-3 py-2.5">
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">{s.name}</span>
                        <span className="block text-[11px] text-stone-500">{LEVEL_LABELS[s.level]}</span>
                      </span>
                      <MasteryChip state={p?.state ?? 'non_commence'} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

export const SkillDetail: React.FC<{ id: string }> = ({ id }) => {
  const skill = SKILL_BY_ID[id];
  const progress = useSkillProgress();
  if (!skill) return <EmptyState icon="🔍" title="Compétence introuvable" />;
  const p = progress[id];
  const d = DOMAIN_BY_ID[skill.domain];
  const ready = prerequisitesMet(skill, progress);
  return (
    <div className="space-y-4">
      <PageHeader title={skill.name} subtitle={`${d.icon} ${d.label} · ${LEVEL_LABELS[skill.level]}`} back="progression/competences" />
      <div className={`${card} p-4 space-y-3`}>
        <p className="text-sm text-stone-700 dark:text-stone-300">{skill.description}</p>
        <div className="flex items-center gap-3">
          <MasteryChip state={p?.state ?? 'non_commence'} />
          <div className="flex-1"><ProgressBar value={p?.mastery ?? 0} label="Indice de maîtrise" /></div>
          <span className="text-xs font-bold">{p?.mastery ?? 0}/100</span>
        </div>
      </div>
      {skill.prerequisites.length > 0 && (
        <div className={`${card} p-4`}>
          <h2 className="text-xs font-bold uppercase text-stone-500 mb-2">Prérequis {ready ? '✅' : '(à consolider d’abord)'}</h2>
          <ul className="space-y-1.5">
            {skill.prerequisites.map((pr) => (
              <li key={pr} className="flex items-center justify-between gap-2">
                <Link to={`progression/competences/${pr}`} className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 underline underline-offset-2">{SKILL_BY_ID[pr].name}</Link>
                <MasteryChip state={progress[pr]?.state ?? 'non_commence'} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {skill.lessonIds.length > 0 && (
        <div className={`${card} p-4`}>
          <h2 className="text-xs font-bold uppercase text-stone-500 mb-2">Fiches associées</h2>
          <ul className="space-y-1">{skill.lessonIds.map((l) => <li key={l}><button className="text-left text-sm font-semibold text-emerald-800 dark:text-emerald-300 underline underline-offset-2" onClick={() => overlays.openLesson(l)}>📖 {LESSON_BY_ID[l]?.titleFr}</button></li>)}</ul>
        </div>
      )}
      <div className={`${card} p-4`}>
        <h2 className="text-xs font-bold uppercase text-stone-500 mb-2">Exercices associés</h2>
        <ul className="space-y-1">{skill.exerciseIds.map((e) => <li key={e}><Link to={`pratiquer/exercice/${e}`} className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 underline underline-offset-2">🧩 {EXERCISE_BY_ID[e]?.title}</Link></li>)}</ul>
      </div>
      <div className={`${card} p-4`}>
        <h2 className="text-xs font-bold uppercase text-stone-500 mb-2">Historique des évaluations</h2>
        {p?.evaluations.length ? (
          <ul className="text-sm divide-y divide-stone-100 dark:divide-stone-800">
            {[...p.evaluations].reverse().map((ev, i) => (
              <li key={i} className="py-1.5 flex justify-between gap-2 text-stone-700 dark:text-stone-300">
                <span>{new Date(ev.at).toLocaleDateString('fr-FR')} · {ev.source === 'diagnostic' ? 'Diagnostic' : ev.source === 'exercice' ? EXERCISE_BY_ID[ev.refId]?.title ?? 'Exercice' : 'Révision'}</span>
                <span className="font-bold">{Math.round(ev.score * 100)} %</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone-500">Pas encore d’évaluation : faites un exercice associé.</p>
        )}
      </div>
      {skill.exerciseIds[0] && <button className={btn('primary', 'w-full')} onClick={() => navigate(`pratiquer/exercice/${skill.exerciseIds[0]}`)}>S’entraîner sur cette compétence</button>}
    </div>
  );
};

/** Parcours personnalisé (Apprendre → Mon parcours). */
export const ParcoursView: React.FC = () => {
  const progress = useSkillProgress();
  const profile = useLive(async () => (await db.profile.get('me')) ?? null, [], null as UserProfile | null);
  const diagnostic = useLive(async () => (await db.diagnostics.orderBy('completedAt').last()) ?? null, [], null as DiagnosticResult | null);
  const recos = useMemo(
    () => recommendSkills({ skills: SKILLS, progress, level: profile?.level ?? 'debutant', interests: (profile?.interests ?? []) as DomainId[], domainScores: diagnostic?.domainScores }),
    [progress, profile, diagnostic],
  );
  const counts = MASTERY_ORDER.map((m) => SKILLS.filter((s) => (progress[s.id]?.state ?? 'non_commence') === m).length);
  return (
    <div className="space-y-5">
      <PageHeader title="Mon parcours" icon="🧭" back="apprendre" subtitle="Compétences recommandées selon votre profil et vos résultats" />
      {!diagnostic && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-4 space-y-2">
          <p className="text-sm text-stone-700 dark:text-stone-300">Pour un parcours vraiment personnalisé, faites le diagnostic initial (≈ 5 min).</p>
          <button className={btn('primary')} onClick={() => navigate(profile ? 'progression/diagnostic' : 'progression/profil')}>{profile ? 'Faire le diagnostic' : 'Créer mon profil'}</button>
        </div>
      )}
      <div className={`${card} p-4`}>
        <div className="flex h-3 rounded-full overflow-hidden" role="img" aria-label="Répartition des compétences par état">
          {MASTERY_ORDER.map((m, i) => counts[i] > 0 && <span key={m} style={{ width: `${(counts[i] / SKILLS.length) * 100}%`, background: MASTERY_COLORS[m] }} title={`${MASTERY_LABELS[m]} : ${counts[i]}`} />)}
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-stone-600 dark:text-stone-300">
          {MASTERY_ORDER.map((m, i) => <li key={m} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: MASTERY_COLORS[m] }} />{MASTERY_LABELS[m]} : {counts[i]}</li>)}
        </ul>
      </div>
      <section className="space-y-2">
        <h2 className="font-black text-base text-stone-900 dark:text-stone-100">Prochaines étapes</h2>
        {recos.length === 0 ? (
          <EmptyState icon="🏆" title="Toutes les compétences accessibles sont maîtrisées" text="Bravo ! Pensez à réviser régulièrement." />
        ) : (
          <ol className="space-y-2">
            {recos.map((s, i) => {
              const p = progress[s.id];
              return (
                <li key={s.id} className={`${card} p-4 space-y-2`}>
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-black text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link to={`progression/competences/${s.id}`} className="font-bold text-stone-900 dark:text-stone-100">{s.name}</Link>
                      <p className="text-xs text-stone-500">{DOMAIN_BY_ID[s.domain].icon} {DOMAIN_BY_ID[s.domain].label} · {LEVEL_LABELS[s.level]}</p>
                    </div>
                    <MasteryChip state={p?.state ?? 'non_commence'} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {s.lessonIds[0] && <button className={btn('secondary', 'text-xs min-h-9 py-1.5')} onClick={() => overlays.openLesson(s.lessonIds[0])}>📖 Lire la fiche</button>}
                    {s.exerciseIds[0] && <button className={btn('primary', 'text-xs min-h-9 py-1.5')} onClick={() => navigate(`pratiquer/exercice/${s.exerciseIds[0]}`)}>🧩 S’exercer</button>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
      <section className="space-y-2">
        <h2 className="font-black text-base text-stone-900 dark:text-stone-100">Parcours thématiques</h2>
        <ul className="grid sm:grid-cols-3 gap-2">
          {PATHWAYS_CATALOG.map((p) => (
            <li key={p.id} className={`${card} p-3 space-y-1.5`}>
              <p className="text-xs font-black text-amber-700 dark:text-amber-300">Parcours {p.code}</p>
              <p className="font-bold text-sm text-stone-900 dark:text-stone-100">{p.titleFr}</p>
              <ol className="text-xs space-y-0.5 list-decimal pl-4">
                {p.lessonIds.map((l) => <li key={l}><button className="text-left text-emerald-800 dark:text-emerald-300 hover:underline" onClick={() => overlays.openLesson(l)}>{LESSON_BY_ID[l]?.titleFr ?? l}</button></li>)}
              </ol>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
