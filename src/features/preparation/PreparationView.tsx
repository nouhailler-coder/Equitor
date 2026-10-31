import React, { useEffect, useState } from 'react';
import { CheckCircle2, NotebookPen, Pencil, Plus, Printer, Trash2 } from 'lucide-react';
import type { Horse, SessionDebrief, SessionPlan } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db, nowIso } from '../../services/storage/db';
import { deletePlan, savePlan, type PlanDraft } from '../../services/storage/repos';
import { safeWrite } from '../../services/feedback/toast';
import { SESSION_TEMPLATES } from '../../data/sessionTemplates';
import { DISCIPLINES, SESSION_TYPES, SESSION_TYPE_LABEL, fmtDate, todayIso } from '../../data/labels';
import { EXERCISES, EXERCISE_BY_ID, LESSON_BY_ID, SKILLS, SKILL_BY_ID } from '../../data/catalog';
import { LESSONS_CATALOG } from '../../data/lessons';
import { Badge, ConfirmDialog, EmptyState, Link, PageHeader, btn, card, input, label } from '../../components/ui/kit';
import { goBack, navigate } from '../../app/router';
import { overlays } from '../../app/overlays';
import { printPlan } from '../../services/export/print';

const STATUS: Record<SessionPlan['status'], { label: string; tone: 'amber' | 'emerald' | 'stone' }> = {
  prevu: { label: 'Prévu', tone: 'amber' },
  realise: { label: 'Réalisé', tone: 'emerald' },
  annule: { label: 'Annulé', tone: 'stone' },
};

export const PreparationView: React.FC = () => {
  const plans = useLive(() => db.sessionPlans.orderBy('createdAt').reverse().toArray(), [], [] as SessionPlan[]);
  const upcoming = plans.filter((p) => p.status === 'prevu');
  const past = plans.filter((p) => p.status !== 'prevu');
  return (
    <div className="space-y-5">
      <PageHeader title="Préparer une séance" icon="🗓️" back="pratiquer" subtitle="Programmes de préparation théorique et bilans" help="Partez d’un modèle ou d’une page blanche : objectif, compétences visées, fiches à relire, exercices à réviser. Après la séance, faites le bilan : il alimente votre journal." />
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-xs text-amber-900 dark:text-amber-200">
        Ces programmes sont des supports de préparation théorique. Le contenu de la séance reste fixé et encadré par votre enseignant.
      </div>

      <section className="space-y-2">
        <h2 className="font-black text-base text-stone-900 dark:text-stone-100">Partir d’un modèle</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SESSION_TEMPLATES.map((t) => (
            <li key={t.id}>
              <Link to={`pratiquer/preparation/nouveau/${t.id}`} className={`${card} p-3 block h-full hover:border-emerald-500`}>
                <span className="text-2xl" aria-hidden="true">{t.icon}</span>
                <span className="block text-sm font-bold text-stone-900 dark:text-stone-100 mt-1 leading-tight">{t.title}</span>
                {t.advanced && <span className="block text-[10px] text-amber-700 dark:text-amber-300 mt-1">À valider avec l’enseignant</span>}
              </Link>
            </li>
          ))}
          <li>
            <Link to="pratiquer/preparation/nouveau" className={`${card} p-3 flex flex-col items-center justify-center h-full text-center hover:border-emerald-500`}>
              <Plus className="w-6 h-6 text-emerald-700" />
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">Page blanche</span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-black text-base text-stone-900 dark:text-stone-100">Mes programmes ({plans.length})</h2>
        {plans.length === 0 ? (
          <EmptyState icon="🗓️" title="Aucun programme" text="Choisissez un modèle ci-dessus pour préparer votre prochaine séance." />
        ) : (
          <ul className="space-y-2">
            {[...upcoming, ...past].map((p) => (
              <li key={p.id}>
                <Link to={`pratiquer/preparation/${p.id}`} className={`${card} p-3 flex items-center justify-between gap-2 hover:border-emerald-500`}>
                  <span className="min-w-0">
                    <span className="block font-bold text-sm text-stone-900 dark:text-stone-100 truncate">{p.title}</span>
                    <span className="block text-xs text-stone-500">{p.date ? fmtDate(p.date) : 'Sans date'} · {SESSION_TYPE_LABEL[p.sessionType]}</span>
                  </span>
                  <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

/** Liste de cases à cocher filtrable (compétences, fiches, exercices). */
function PickList({ title, items, selected, onChange }: { title: string; items: { id: string; label: string }[]; selected: string[]; onChange: (v: string[]) => void }) {
  const [q, setQ] = useState('');
  const shown = items.filter((i) => !q || i.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <details className={`${card} p-4`}>
      <summary className="font-bold text-sm text-stone-900 dark:text-stone-100 cursor-pointer">{title} ({selected.length})</summary>
      <input className={`${input} mt-3`} placeholder="Filtrer…" aria-label={`Filtrer : ${title}`} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-2 max-h-56 overflow-y-auto">
        {shown.map((i) => (
          <label key={i.id} className="flex items-start gap-2 py-1 text-sm text-stone-700 dark:text-stone-300">
            <input type="checkbox" className="mt-0.5 w-4 h-4 accent-emerald-700" checked={selected.includes(i.id)} onChange={(e) => onChange(e.target.checked ? [...selected, i.id] : selected.filter((x) => x !== i.id))} />
            {i.label}
          </label>
        ))}
      </div>
    </details>
  );
}

export const PlanForm: React.FC<{ id?: string; templateId?: string }> = ({ id, templateId }) => {
  const horses = useLive(() => db.horses.orderBy('name').toArray(), [], [] as Horse[]);
  const existing = useLive(async () => (id ? ((await db.sessionPlans.get(id)) ?? null) : null), [id], undefined as SessionPlan | null | undefined);
  const tpl = SESSION_TEMPLATES.find((t) => t.id === templateId);
  const [d, setD] = useState<PlanDraft>(() => ({
    templateId: tpl?.id,
    title: tpl?.title ?? '',
    objective: tpl?.objective ?? '',
    date: todayIso(),
    sessionType: tpl?.sessionType ?? 'travail_general',
    skillIds: tpl?.skillIds ?? [],
    lessonIds: tpl?.lessonIds ?? [],
    exerciseIds: tpl?.exerciseIds ?? [],
    notes: tpl?.notes ?? '',
    status: 'prevu',
  }));
  const [ready, setReady] = useState(!id);
  useEffect(() => {
    if (id && existing !== undefined && !ready) {
      if (existing) setD(existing);
      setReady(true);
    }
  }, [existing, id, ready]);
  const set = <K extends keyof PlanDraft>(k: K, v: PlanDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  if (!ready) return null;
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const saved = await safeWrite(() => savePlan({ ...d, id }), id ? 'Programme modifié' : 'Programme créé');
        if (saved) navigate(`pratiquer/preparation/${saved.id}`, { replace: true });
      }}
    >
      <PageHeader title={id ? 'Modifier le programme' : 'Nouveau programme'} icon={tpl?.icon ?? '🗓️'} back="pratiquer/preparation" subtitle={tpl ? `Modèle : ${tpl.title}` : undefined} />
      {tpl?.advanced && (
        <p className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 p-3 text-xs text-amber-900 dark:text-amber-200">⚠️ Programme avancé : à valider avec un enseignant qualifié avant toute pratique.</p>
      )}
      <div className={`${card} p-4 grid grid-cols-2 gap-3`}>
        <div className="col-span-2">
          <label className={label} htmlFor="p-title">Titre</label>
          <input id="p-title" className={input} value={d.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div className="col-span-2">
          <label className={label} htmlFor="p-obj">Objectif</label>
          <textarea id="p-obj" className={`${input} min-h-16`} value={d.objective} onChange={(e) => set('objective', e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="p-date">Date prévue</label>
          <input id="p-date" type="date" className={input} value={d.date ?? ''} onChange={(e) => set('date', e.target.value || undefined)} />
        </div>
        <div>
          <label className={label} htmlFor="p-type">Type de séance</label>
          <select id="p-type" className={input} value={d.sessionType} onChange={(e) => set('sessionType', e.target.value as PlanDraft['sessionType'])}>
            {SESSION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="p-horse">Cheval</label>
          <select id="p-horse" className={input} value={d.horseId ?? ''} onChange={(e) => set('horseId', e.target.value || undefined)}>
            <option value="">Non précisé</option>
            {horses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="p-disc">Discipline</label>
          <select id="p-disc" className={input} value={d.discipline ?? ''} onChange={(e) => set('discipline', (e.target.value || undefined) as PlanDraft['discipline'])}>
            <option value="">Non précisée</option>
            {DISCIPLINES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </div>
      </div>
      <PickList title="Compétences visées" items={SKILLS.map((s) => ({ id: s.id, label: s.name }))} selected={d.skillIds} onChange={(v) => set('skillIds', v)} />
      <PickList title="Fiches à consulter" items={LESSONS_CATALOG.map((l) => ({ id: l.id, label: l.titleFr }))} selected={d.lessonIds} onChange={(v) => set('lessonIds', v)} />
      <PickList title="Exercices théoriques à réviser" items={EXERCISES.filter((e) => !e.id.startsWith('ex-fiche-')).map((e) => ({ id: e.id, label: e.title }))} selected={d.exerciseIds} onChange={(v) => set('exerciseIds', v)} />
      <div className={`${card} p-4`}>
        <label className={label} htmlFor="p-notes">Notes personnelles</label>
        <textarea id="p-notes" className={`${input} min-h-20`} value={d.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={btn('secondary')} onClick={() => goBack('pratiquer/preparation')}>Annuler</button>
        <button type="submit" className={btn('primary')}>Enregistrer</button>
      </div>
    </form>
  );
};

export const PlanDetail: React.FC<{ id: string }> = ({ id }) => {
  const plan = useLive(async () => (await db.sessionPlans.get(id)) ?? null, [id], undefined as SessionPlan | null | undefined);
  const horses = useLive(() => db.horses.toArray(), [], [] as Horse[]);
  const [confirm, setConfirm] = useState(false);
  const [debrief, setDebrief] = useState<SessionDebrief | null>(null);
  if (plan === undefined) return null;
  if (plan === null) return <EmptyState icon="🔍" title="Programme introuvable" action={<button className={btn('primary')} onClick={() => navigate('pratiquer/preparation')}>Mes programmes</button>} />;
  const horse = horses.find((h) => h.id === plan.horseId);
  const tpl = SESSION_TEMPLATES.find((t) => t.id === plan.templateId);

  const saveDebrief = async () => {
    if (!debrief) return;
    await safeWrite(() => savePlan({ ...plan, debrief: { ...debrief, completedAt: nowIso() }, status: 'realise' }), 'Bilan enregistré');
    setDebrief(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader title={plan.title} subtitle={`${plan.date ? fmtDate(plan.date) : 'Sans date'} · ${SESSION_TYPE_LABEL[plan.sessionType]}${horse ? ` · 🐴 ${horse.name}` : ''}`} back="pratiquer/preparation" />
      {tpl?.advanced && <p className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 p-3 text-xs text-amber-900 dark:text-amber-200">⚠️ Programme avancé : à valider avec un enseignant qualifié.</p>}
      <div className={`${card} p-4 space-y-3 text-sm`}>
        <p className="text-stone-800 dark:text-stone-200"><strong>Objectif :</strong> {plan.objective || '—'}</p>
        {plan.skillIds.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase text-stone-500 mb-1">Compétences visées</p>
            <div className="flex flex-wrap gap-1.5">{plan.skillIds.map((s) => <Link key={s} to={`progression/competences/${s}`} className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 text-xs">{SKILL_BY_ID[s]?.name ?? s}</Link>)}</div>
          </div>
        )}
        {plan.lessonIds.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase text-stone-500 mb-1">Fiches à consulter</p>
            <ul className="space-y-1">{plan.lessonIds.map((l) => <li key={l}><button className="text-left text-emerald-800 dark:text-emerald-300 font-semibold underline underline-offset-2" onClick={() => overlays.openLesson(l)}>📖 {LESSON_BY_ID[l]?.titleFr ?? l}</button></li>)}</ul>
          </div>
        )}
        {plan.exerciseIds.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase text-stone-500 mb-1">Exercices à réviser</p>
            <ul className="space-y-1">{plan.exerciseIds.map((e) => <li key={e}><Link to={`pratiquer/exercice/${e}`} className="text-emerald-800 dark:text-emerald-300 font-semibold underline underline-offset-2">🧩 {EXERCISE_BY_ID[e]?.title ?? e}</Link></li>)}</ul>
          </div>
        )}
        {plan.notes && <p className="whitespace-pre-line text-stone-700 dark:text-stone-300"><strong>Notes :</strong> {plan.notes}</p>}
      </div>

      {plan.debrief && !debrief && (
        <div className={`${card} p-4 space-y-2 text-sm`}>
          <h2 className="font-black text-stone-900 dark:text-stone-100 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bilan après séance</h2>
          <p><strong>Objectifs atteints :</strong> {plan.debrief.objectivesReached || '—'}</p>
          <p><strong>Difficultés :</strong> {plan.debrief.difficulties || '—'}</p>
          <p><strong>Questions pour l’enseignant :</strong> {plan.debrief.questionsForTeacher || '—'}</p>
          <p><strong>Notions à revoir :</strong> {plan.debrief.notionsToReview || '—'}</p>
          <p><strong>Prochain objectif :</strong> {plan.debrief.nextObjective || '—'}</p>
        </div>
      )}

      {debrief && (
        <div className={`${card} p-4 space-y-3`}>
          <h2 className="font-black text-stone-900 dark:text-stone-100">Bilan après séance</h2>
          {([
            ['objectivesReached', 'Objectifs atteints'],
            ['difficulties', 'Difficultés'],
            ['questionsForTeacher', 'Questions à poser à l’enseignant'],
            ['notionsToReview', 'Notions à revoir'],
            ['nextObjective', 'Prochain objectif'],
          ] as const).map(([k, l]) => (
            <div key={k}>
              <label className={label} htmlFor={`db-${k}`}>{l}</label>
              <textarea id={`db-${k}`} className={`${input} min-h-14`} value={debrief[k]} onChange={(e) => setDebrief({ ...debrief, [k]: e.target.value })} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <button className={btn('secondary')} onClick={() => setDebrief(null)}>Annuler</button>
            <button className={btn('primary')} onClick={() => void saveDebrief()}>Enregistrer le bilan</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {!debrief && (
          <button className={btn('primary', 'col-span-2')} onClick={() => setDebrief(plan.debrief ?? { objectivesReached: '', difficulties: '', questionsForTeacher: '', notionsToReview: '', nextObjective: '', completedAt: '' })}>
            <CheckCircle2 className="w-4 h-4" /> {plan.debrief ? 'Modifier le bilan' : 'Faire le bilan de la séance'}
          </button>
        )}
        {plan.journalEntryId ? (
          <button className={btn('secondary', 'col-span-2')} onClick={() => navigate(`journal/seance/${plan.journalEntryId}`)}><NotebookPen className="w-4 h-4" /> Voir l’entrée du journal</button>
        ) : (
          <button className={btn('secondary', 'col-span-2')} onClick={() => navigate(`journal/nouveau/${plan.id}`)}><NotebookPen className="w-4 h-4" /> Créer l’entrée du journal</button>
        )}
        <button className={btn('secondary')} onClick={() => navigate(`pratiquer/preparation/modifier/${plan.id}`)}><Pencil className="w-4 h-4" /> Modifier</button>
        <button className={btn('secondary')} onClick={() => printPlan(plan, horse)}><Printer className="w-4 h-4" /> PDF</button>
        {plan.status === 'prevu' && (
          <button className={btn('ghost')} onClick={() => void safeWrite(() => savePlan({ ...plan, status: 'annule' }), 'Programme annulé')}>Marquer annulé</button>
        )}
        <button className={btn('ghost', 'text-red-700 dark:text-red-300')} onClick={() => setConfirm(true)}><Trash2 className="w-4 h-4" /> Supprimer</button>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Supprimer ce programme ?"
        message="Le programme et son bilan seront supprimés. L’entrée de journal éventuelle est conservée."
        confirmLabel="Supprimer"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          await safeWrite(() => deletePlan(plan.id), 'Programme supprimé');
          navigate('pratiquer/preparation', { replace: true });
        }}
      />
    </div>
  );
};
