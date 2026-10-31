import React, { useEffect, useMemo, useState } from 'react';
import type { DomainId, Level, SkillProgress, UserProfile } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { saveProfile } from '../../services/storage/repos';
import { completeDiagnostic } from '../../services/progression/progressService';
import { recommendSkills, rankDomains } from '../../services/progression/recommend';
import { safeWrite } from '../../services/feedback/toast';
import { DIAGNOSTIC } from '../../data/diagnostic';
import { DOMAINS, DOMAIN_BY_ID } from '../../data/skills';
import { LEVEL_LABELS, SKILLS } from '../../data/catalog';
import { EXPERIENCES } from '../../data/labels';
import { QuestionView } from '../exercises/QuestionView';
import { Link, PageHeader, ProgressBar, btn, card, input, label } from '../../components/ui/kit';
import { HBars } from '../../components/ui/charts';
import { navigate } from '../../app/router';

const GOALS = ['Découvrir l’équitation', 'Gagner en confiance', 'Améliorer ma position', 'Préparer un examen fédéral', 'Débuter le saut d’obstacles', 'Progresser en dressage', 'Mieux comprendre mon cheval', 'Partir en randonnée'];

export const ProfileForm: React.FC = () => {
  const existing = useLive(async () => (await db.profile.get('me')) ?? null, [], undefined as UserProfile | null | undefined);
  const [p, setP] = useState<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>({ level: 'debutant', experience: 'aucune', goals: [], interests: [], theoryKnowledge: 2, skillsToImprove: '' });
  const [ready, setReady] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  useEffect(() => {
    if (existing !== undefined && !ready) {
      if (existing) setP(existing);
      setReady(true);
    }
  }, [existing, ready]);
  if (!ready) return null;
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const saved = await safeWrite(() => saveProfile({ ...p, goals: customGoal.trim() ? [...p.goals, customGoal.trim()] : p.goals }), 'Profil enregistré');
        if (saved) navigate(existing?.diagnosticCompletedAt ? 'progression' : 'progression/diagnostic', { replace: true });
      }}
    >
      <PageHeader title="Mon profil pédagogique" icon="🧑" back="progression" subtitle="Sert uniquement à personnaliser votre parcours, sur cet appareil" />
      <div className={`${card} p-4 space-y-4`}>
        <div>
          <label className={label} htmlFor="pf-name">Prénom (facultatif)</label>
          <input id="pf-name" className={input} autoComplete="given-name" value={p.firstName ?? ''} onChange={(e) => setP({ ...p, firstName: e.target.value })} />
        </div>
        <fieldset>
          <legend className={label}>Niveau général</legend>
          <div className="grid grid-cols-3 gap-2">
            {(['debutant', 'intermediaire', 'confirme'] as Level[]).map((l) => (
              <button type="button" key={l} aria-pressed={p.level === l} onClick={() => setP({ ...p, level: l })} className={`rounded-xl border-2 py-2.5 text-sm font-semibold ${p.level === l ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60' : 'border-stone-200 dark:border-stone-700'}`}>
                {LEVEL_LABELS[l]}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Auto-évaluation indicative : ce n’est pas une certification officielle.</p>
        </fieldset>
        <div>
          <label className={label} htmlFor="pf-exp">Expérience équestre</label>
          <select id="pf-exp" className={input} value={p.experience} onChange={(e) => setP({ ...p, experience: e.target.value as UserProfile['experience'] })}>
            {EXPERIENCES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="pf-theory">Mes connaissances théoriques : {p.theoryKnowledge}/5</label>
          <input id="pf-theory" type="range" min={1} max={5} className="w-full accent-emerald-700" value={p.theoryKnowledge} onChange={(e) => setP({ ...p, theoryKnowledge: Number(e.target.value) })} />
        </div>
        <fieldset>
          <legend className={label}>Objectifs personnels</legend>
          <div className="flex flex-wrap gap-1.5">
            {GOALS.map((g) => (
              <button type="button" key={g} aria-pressed={p.goals.includes(g)} onClick={() => setP({ ...p, goals: toggle(p.goals, g) })} className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${p.goals.includes(g) ? 'bg-brand-900 text-white border-brand-900' : 'border-stone-300 dark:border-stone-700'}`}>
                {g}
              </button>
            ))}
            {p.goals.filter((g) => !GOALS.includes(g)).map((g) => (
              <button type="button" key={g} onClick={() => setP({ ...p, goals: p.goals.filter((x) => x !== g) })} className="rounded-full px-3 py-1.5 text-xs font-semibold bg-brand-900 text-white" aria-label={`Retirer l’objectif ${g}`}>{g} ✕</button>
            ))}
          </div>
          <input className={`${input} mt-2`} placeholder="Autre objectif…" aria-label="Autre objectif" value={customGoal} onChange={(e) => setCustomGoal(e.target.value)} />
        </fieldset>
        <fieldset>
          <legend className={label}>Domaines d’intérêt</legend>
          <div className="flex flex-wrap gap-1.5">
            {DOMAINS.map((d) => (
              <button type="button" key={d.id} aria-pressed={p.interests.includes(d.id)} onClick={() => setP({ ...p, interests: toggle(p.interests, d.id) })} className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${p.interests.includes(d.id) ? 'bg-brand-900 text-white border-brand-900' : 'border-stone-300 dark:border-stone-700'}`}>
                {d.icon} {d.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label className={label} htmlFor="pf-improve">Compétences que je souhaite améliorer</label>
          <textarea id="pf-improve" className={`${input} min-h-16`} value={p.skillsToImprove} onChange={(e) => setP({ ...p, skillsToImprove: e.target.value })} />
        </div>
      </div>
      <button type="submit" className={btn('primary', 'w-full')}>{existing?.diagnosticCompletedAt ? 'Enregistrer' : 'Enregistrer et faire le diagnostic'}</button>
    </form>
  );
};

/** Diagnostic initial : 2 questions par domaine, puis résultats, lacunes et parcours proposé. */
export const DiagnosticView: React.FC = () => {
  const profile = useLive(async () => (await db.profile.get('me')) ?? null, [], null as UserProfile | null);
  const last = useLive(async () => (await db.diagnostics.orderBy('completedAt').last()) ?? null, [], null);
  const [step, setStep] = useState<'intro' | 'questions' | 'result'>('intro');
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<{ domain: DomainId; skillIds: string[]; score: number; questionId: string }[]>([]);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<{ domainScores: Partial<Record<DomainId, number>>; global: number; recos: string[] } | null>(null);

  const finish = async (all: typeof answers) => {
    const byDomain: Partial<Record<DomainId, number[]>> = {};
    all.forEach((a) => (byDomain[a.domain] = [...(byDomain[a.domain] ?? []), a.score]));
    const domainScores = Object.fromEntries(Object.entries(byDomain).map(([d, s]) => [d, s!.reduce((x, y) => x + y, 0) / s!.length])) as Partial<Record<DomainId, number>>;
    // Recommandations calculées après l'enregistrement des évaluations.
    const progressAfter: Record<string, SkillProgress | undefined> = {};
    const recos = recommendSkills({ skills: SKILLS, progress: progressAfter, level: profile?.level ?? 'debutant', interests: profile?.interests ?? [], domainScores }).map((s) => s.id);
    await safeWrite(() => completeDiagnostic({ answers: all, recommendedSkillIds: recos }), 'Diagnostic enregistré');
    setResult({ domainScores, global: all.reduce((s, a) => s + a.score, 0) / all.length, recos });
    setStep('result');
  };

  if (step === 'intro') {
    return (
      <div className="space-y-4">
        <PageHeader title="Diagnostic initial" icon="🩺" back="progression" subtitle={`${DIAGNOSTIC.length} questions · environ 5 minutes`} />
        <div className={`${card} p-5 space-y-3 text-sm text-stone-700 dark:text-stone-300`}>
          <p>Ce questionnaire évalue vos <strong>connaissances théoriques</strong> dans {DOMAINS.length} domaines : connaissance du cheval, anatomie, comportement, sécurité, matériel, équipement, allures, position, aides, travail à pied, dressage, obstacle et théorie.</p>
          <p>À la fin, vous verrez vos acquis, vos lacunes et un parcours pédagogique proposé. Vous pourrez le recommencer quand vous voudrez.</p>
          <p className="text-xs text-stone-500">Il ne s’agit ni d’un examen, ni d’une certification, ni d’une évaluation de votre pratique à cheval.</p>
          {last && <p className="text-xs">Dernier diagnostic : {new Date(last.completedAt).toLocaleDateString('fr-FR')} ({Math.round(last.globalScore * 100)} %).</p>}
        </div>
        {!profile && <p className="text-sm text-stone-600 dark:text-stone-400">Conseil : <Link to="progression/profil" className="font-semibold underline text-emerald-800 dark:text-emerald-300">renseignez d’abord votre profil</Link> pour un parcours plus adapté.</p>}
        <button className={btn('primary', 'w-full text-base')} onClick={() => { setStep('questions'); setI(0); setAnswers([]); setAnswered(false); }}>
          {last ? 'Recommencer le diagnostic' : 'Commencer'}
        </button>
      </div>
    );
  }

  if (step === 'questions') {
    const dq = DIAGNOSTIC[i];
    const dom = DOMAIN_BY_ID[dq.domain];
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button className="text-sm font-semibold text-stone-500" onClick={() => setStep('intro')}>Quitter</button>
          <div className="flex-1"><ProgressBar value={(i / DIAGNOSTIC.length) * 100} label="Avancement du diagnostic" tone="amber" /></div>
          <span className="text-xs font-bold">{i + 1}/{DIAGNOSTIC.length}</span>
        </div>
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{dom.icon} {dom.label}</p>
        <div className={`${card} p-4`}>
          <QuestionView
            key={dq.question.id}
            question={dq.question}
            answered={answered}
            onAnswered={(score) => {
              setAnswered(true);
              setAnswers((a) => [...a, { domain: dq.domain, skillIds: dq.skillIds, score, questionId: dq.question.id }]);
            }}
          />
        </div>
        {answered && (
          <button
            className={btn('primary', 'w-full')}
            onClick={() => {
              if (i < DIAGNOSTIC.length - 1) {
                setI(i + 1);
                setAnswered(false);
              } else void finish(answers);
            }}
          >
            {i < DIAGNOSTIC.length - 1 ? 'Question suivante' : 'Voir mes résultats'}
          </button>
        )}
      </div>
    );
  }

  return <DiagnosticResultView result={result!} onRestart={() => setStep('intro')} />;
};

const DiagnosticResultView: React.FC<{ result: { domainScores: Partial<Record<DomainId, number>>; global: number; recos: string[] }; onRestart: () => void }> = ({ result, onRestart }) => {
  const ranked = useMemo(() => rankDomains(result.domainScores), [result]);
  const acquired = ranked.filter(([, s]) => s >= 0.99);
  const gaps = ranked.filter(([, s]) => s < 0.5);
  return (
    <div className="space-y-4">
      <PageHeader title="Résultats du diagnostic" icon="🩺" back="progression" />
      <div className={`${card} p-5 text-center`}>
        <p className="text-4xl font-black text-stone-900 dark:text-stone-50">{Math.round(result.global * 100)} %</p>
        <p className="text-sm text-stone-600 dark:text-stone-300">de bonnes réponses</p>
      </div>
      <div className={`${card} p-4`}>
        <HBars title="Score par domaine" unit=" %" data={ranked.map(([d, s]) => ({ label: `${DOMAIN_BY_ID[d].icon} ${DOMAIN_BY_ID[d].label}`, value: Math.round(s * 100), max: 100 }))} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className={`${card} p-4`}>
          <h2 className="font-black text-sm text-emerald-800 dark:text-emerald-300 mb-1">✅ Connaissances acquises</h2>
          <p className="text-sm text-stone-700 dark:text-stone-300">{acquired.length ? acquired.map(([d]) => DOMAIN_BY_ID[d].label).join(', ') : 'Aucun domaine sans erreur pour l’instant.'}</p>
        </div>
        <div className={`${card} p-4`}>
          <h2 className="font-black text-sm text-amber-800 dark:text-amber-300 mb-1">📌 Lacunes à travailler</h2>
          <p className="text-sm text-stone-700 dark:text-stone-300">{gaps.length ? gaps.map(([d]) => DOMAIN_BY_ID[d].label).join(', ') : 'Pas de lacune majeure détectée.'}</p>
        </div>
      </div>
      <div className={`${card} p-4 space-y-2`}>
        <h2 className="font-black text-sm text-stone-900 dark:text-stone-100">🧭 Parcours proposé</h2>
        <ol className="space-y-1.5 list-decimal pl-5 text-sm">
          {result.recos.map((id) => {
            const s = SKILLS.find((x) => x.id === id)!;
            return (
              <li key={id}>
                <Link to={`progression/competences/${id}`} className="font-semibold text-emerald-800 dark:text-emerald-300 underline underline-offset-2">{s.name}</Link>
                <span className="text-stone-500"> · {DOMAIN_BY_ID[s.domain].label}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className={btn('secondary')} onClick={onRestart}>Recommencer</button>
        <button className={btn('primary')} onClick={() => navigate('apprendre/parcours')}>Mon parcours</button>
      </div>
    </div>
  );
};
