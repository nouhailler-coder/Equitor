import React, { useEffect, useMemo, useState } from 'react';
import type { Horse, JournalEntry, SessionPlan } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { saveJournalEntry, type JournalDraft } from '../../services/storage/repos';
import { safeWrite } from '../../services/feedback/toast';
import { DISCIPLINES, FEELINGS, SESSION_TYPES, todayIso } from '../../data/labels';
import { DOMAINS } from '../../data/skills';
import { SKILLS } from '../../data/catalog';
import { PageHeader, btn, card, input, label } from '../../components/ui/kit';
import { goBack, navigate } from '../../app/router';

const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);

const empty = (): JournalDraft => ({
  date: todayIso(),
  durationMinutes: 45,
  sessionType: 'travail_general',
  title: '',
  objectives: [],
  exercises: [],
  difficulties: '',
  positives: '',
  improvements: '',
  feeling: 3,
  comments: '',
  personalNotes: '',
  skillIds: [],
  isFavorite: false,
});

const Stars: React.FC<{ value: number; onChange: (v: number) => void; label: string; optional?: boolean }> = ({ value, onChange, label: l, optional }) => (
  <fieldset>
    <legend className={label}>{l}</legend>
    <div className="flex items-center gap-1" role="radiogroup" aria-label={l}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} sur 5${optional ? '' : ` — ${FEELINGS[n]}`}`} onClick={() => onChange(optional && value === n ? 0 : n)} className={`text-2xl p-1 ${n <= value ? 'text-amber-500' : 'text-stone-300 dark:text-stone-600'}`}>
          ★
        </button>
      ))}
      {!optional && value > 0 && <span className="text-xs text-stone-500 ml-1">{FEELINGS[value]}</span>}
    </div>
  </fieldset>
);

/** Création / modification d'une entrée de journal. `planId` relie la séance à une préparation. */
export const JournalForm: React.FC<{ entryId?: string; planId?: string }> = ({ entryId, planId }) => {
  const horses = useLive(() => db.horses.orderBy('name').toArray(), [], [] as Horse[]);
  const existing = useLive(async () => (entryId ? ((await db.ridingSessions.get(entryId)) ?? null) : null), [entryId], undefined as JournalEntry | null | undefined);
  const plan = useLive(async () => (planId ? ((await db.sessionPlans.get(planId)) ?? null) : null), [planId], undefined as SessionPlan | null | undefined);
  const [d, setD] = useState<JournalDraft>(empty);
  const [loaded, setLoaded] = useState(!entryId && !planId);
  const [objectives, setObjectives] = useState('');
  const [exercises, setExercises] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Séance ou programme introuvable : on repart d'un formulaire vierge plutôt que de bloquer.
  useEffect(() => {
    if (!loaded && ((entryId && existing === null) || (!entryId && planId && plan === null))) setLoaded(true);
  }, [existing, plan, entryId, planId, loaded]);

  useEffect(() => {
    if (existing && !loaded) {
      setD(existing);
      setObjectives(existing.objectives.join('\n'));
      setExercises(existing.exercises.join('\n'));
      setLoaded(true);
    }
  }, [existing, loaded]);

  // Pré-remplissage à partir d'un programme de préparation (et de son bilan).
  useEffect(() => {
    if (plan && !entryId && !loaded) {
      setD({
        ...empty(),
        date: plan.date ?? todayIso(),
        title: plan.title,
        sessionType: plan.sessionType,
        discipline: plan.discipline,
        horseId: plan.horseId,
        skillIds: plan.skillIds,
        planId: plan.id,
        difficulties: plan.debrief?.difficulties ?? '',
        positives: plan.debrief?.objectivesReached ?? '',
        improvements: plan.debrief?.nextObjective ?? '',
        personalNotes: [plan.debrief?.questionsForTeacher && `Questions pour l’enseignant : ${plan.debrief.questionsForTeacher}`, plan.debrief?.notionsToReview && `Notions à revoir : ${plan.debrief.notionsToReview}`].filter(Boolean).join('\n'),
      });
      setObjectives(plan.objective);
      setLoaded(true);
    }
  }, [plan, entryId, loaded]);

  const set = <K extends keyof JournalDraft>(k: K, v: JournalDraft[K]) => setD((x) => ({ ...x, [k]: v }));

  const skillOptions = useMemo(() => {
    const q = skillFilter.toLowerCase();
    return SKILLS.filter((s) => !q || s.name.toLowerCase().includes(q));
  }, [skillFilter]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!d.date) errs.push('La date est obligatoire.');
    if (!(d.durationMinutes >= 0 && d.durationMinutes <= 600)) errs.push('La durée doit être comprise entre 0 et 600 minutes.');
    setErrors(errs);
    if (errs.length) return;
    const saved = await safeWrite(
      () => saveJournalEntry({ ...d, objectives: lines(objectives), exercises: lines(exercises), id: entryId }),
      entryId ? 'Séance modifiée' : 'Séance enregistrée',
    );
    if (saved) navigate(`journal/seance/${saved.id}`, { replace: true });
  };

  if (!loaded) return <p className="text-sm text-stone-500">Chargement…</p>;

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <PageHeader title={entryId ? 'Modifier la séance' : 'Nouvelle séance'} icon="📝" back="journal" subtitle={plan ? `Liée au programme « ${plan.title} »` : 'Votre carnet personnel, enregistré sur cet appareil'} />
      {errors.length > 0 && (
        <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 p-3 text-sm text-red-800 dark:text-red-200">
          {errors.map((er) => <p key={er}>{er}</p>)}
        </div>
      )}

      <div className={`${card} p-4 grid grid-cols-2 gap-3`}>
        <div>
          <label className={label} htmlFor="j-date">Date *</label>
          <input id="j-date" type="date" className={input} value={d.date} max={todayIso()} onChange={(e) => set('date', e.target.value)} required />
        </div>
        <div>
          <label className={label} htmlFor="j-duree">Durée (min)</label>
          <input id="j-duree" type="number" inputMode="numeric" min={0} max={600} step={5} className={input} value={d.durationMinutes} onChange={(e) => set('durationMinutes', Number(e.target.value))} />
        </div>
        <div className="col-span-2">
          <label className={label} htmlFor="j-titre">Titre</label>
          <input id="j-titre" className={input} placeholder="ex. Transitions et cercles" value={d.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="j-type">Type de séance</label>
          <select id="j-type" className={input} value={d.sessionType} onChange={(e) => set('sessionType', e.target.value as JournalDraft['sessionType'])}>
            {SESSION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="j-disc">Discipline</label>
          <select id="j-disc" className={input} value={d.discipline ?? ''} onChange={(e) => set('discipline', (e.target.value || undefined) as JournalDraft['discipline'])}>
            <option value="">Non précisée</option>
            {DISCIPLINES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={label} htmlFor="j-cheval">Cheval</label>
          <select id="j-cheval" className={input} value={d.horseId ?? ''} onChange={(e) => set('horseId', e.target.value || undefined)}>
            <option value="">Autre / non enregistré</option>
            {horses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          {!d.horseId && (
            <input className={`${input} mt-2`} placeholder="Nom du cheval (facultatif)" aria-label="Nom du cheval" value={d.horseName ?? ''} onChange={(e) => set('horseName', e.target.value)} />
          )}
        </div>
      </div>

      <div className={`${card} p-4 space-y-3`}>
        <div>
          <label className={label} htmlFor="j-obj">Objectifs (un par ligne)</label>
          <textarea id="j-obj" className={`${input} min-h-20`} value={objectives} onChange={(e) => setObjectives(e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="j-ex">Exercices abordés (un par ligne)</label>
          <textarea id="j-ex" className={`${input} min-h-20`} value={exercises} onChange={(e) => setExercises(e.target.value)} />
        </div>
      </div>

      <div className={`${card} p-4 space-y-3`}>
        <Stars label="Ressenti général" value={d.feeling} onChange={(v) => set('feeling', v || 3)} />
        <div>
          <label className={label} htmlFor="j-pos">Points positifs</label>
          <textarea id="j-pos" className={`${input} min-h-16`} value={d.positives} onChange={(e) => set('positives', e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="j-dif">Difficultés rencontrées</label>
          <textarea id="j-dif" className={`${input} min-h-16`} value={d.difficulties} onChange={(e) => set('difficulties', e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="j-amel">Points à améliorer / prochain objectif</label>
          <textarea id="j-amel" className={`${input} min-h-16`} value={d.improvements} onChange={(e) => set('improvements', e.target.value)} />
        </div>
      </div>

      <div className={`${card} p-4 space-y-3`}>
        <Stars label="Décontraction observée du cheval (facultatif)" optional value={d.horseRelaxation ?? 0} onChange={(v) => set('horseRelaxation', v || undefined)} />
        <div>
          <label className={label} htmlFor="j-obsch">Observations sur le cheval</label>
          <textarea id="j-obsch" className={`${input} min-h-16`} placeholder="Ce que vous avez remarqué (comportement, énergie…)" value={d.horseObservations ?? ''} onChange={(e) => set('horseObservations', e.target.value)} />
          <p className="text-[11px] text-stone-500 mt-1">Observation personnelle : elle ne constitue pas un diagnostic. Tout doute sur la santé du cheval se signale à un professionnel.</p>
        </div>
        <div>
          <label className={label} htmlFor="j-com">Commentaires libres</label>
          <textarea id="j-com" className={`${input} min-h-16`} value={d.comments} onChange={(e) => set('comments', e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="j-notes">Notes personnelles</label>
          <textarea id="j-notes" className={`${input} min-h-16`} value={d.personalNotes} onChange={(e) => set('personalNotes', e.target.value)} />
        </div>
      </div>

      <details className={`${card} p-4`}>
        <summary className="font-bold text-sm text-stone-900 dark:text-stone-100 cursor-pointer">Compétences travaillées ({d.skillIds.length})</summary>
        <input className={`${input} mt-3`} placeholder="Filtrer les compétences" aria-label="Filtrer les compétences" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} />
        <div className="mt-2 max-h-64 overflow-y-auto space-y-3">
          {DOMAINS.map((dom) => {
            const items = skillOptions.filter((s) => s.domain === dom.id);
            if (!items.length) return null;
            return (
              <fieldset key={dom.id}>
                <legend className="text-xs font-bold text-stone-500 mb-1">{dom.icon} {dom.label}</legend>
                {items.map((s) => (
                  <label key={s.id} className="flex items-start gap-2 py-1 text-sm text-stone-700 dark:text-stone-300">
                    <input type="checkbox" className="mt-0.5 w-4 h-4 accent-emerald-700" checked={d.skillIds.includes(s.id)} onChange={(e) => set('skillIds', e.target.checked ? [...d.skillIds, s.id] : d.skillIds.filter((x) => x !== s.id))} />
                    {s.name}
                  </label>
                ))}
              </fieldset>
            );
          })}
        </div>
      </details>

      <div className="grid grid-cols-2 gap-2 sticky bottom-20 lg:bottom-4">
        <button type="button" className={btn('secondary')} onClick={() => goBack('journal')}>Annuler</button>
        <button type="submit" className={btn('primary')}>Enregistrer</button>
      </div>
    </form>
  );
};
