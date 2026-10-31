import React, { useMemo } from 'react';
import { Database, Printer, Stethoscope, Target, UserRound } from 'lucide-react';
import type { AppSettings, DiagnosticResult, ExerciseAttempt, JournalEntry, LegacyQuizAttempt, LessonProgress, SkillProgress, UserProfile } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { getSettings, saveSettings } from '../../services/storage/repos';
import { learningStats, isoDay, weekStart } from '../../services/statistics/stats';
import { SKILLS } from '../../data/catalog';
import { DOMAINS, DOMAIN_BY_ID } from '../../data/skills';
import { MASTERY_LABELS } from '../../services/progression/mastery';
import { LEVEL_LABELS } from '../../data/catalog';
import { fmtMinutes } from '../../data/labels';
import { Link, PageHeader, ProgressBar, StatTile, btn, card, input, label } from '../../components/ui/kit';
import { ActivityGrid, Donut, HBars, LineChart } from '../../components/ui/charts';
import { safeWrite } from '../../services/feedback/toast';
import { navigate } from '../../app/router';
import { printProgress } from '../../services/export/print';

export const MASTERY_COLORS = {
  non_commence: '#d6d3d1',
  apprentissage: '#7dd3fc',
  a_reviser: '#f59e0b',
  consolidation: '#34d399',
  maitrise: '#047857',
} as const;

const SKILL_DOMAINS = Object.fromEntries(SKILLS.map((s) => [s.id, s.domain]));

export function useLearningData() {
  const lessons = useLive(() => db.lessonProgress.toArray(), [], [] as LessonProgress[]);
  const attempts = useLive(() => db.exerciseAttempts.toArray(), [], [] as ExerciseAttempt[]);
  const legacyQuiz = useLive(() => db.quizAttempts.toArray(), [], [] as LegacyQuizAttempt[]);
  const skills = useLive(() => db.skillProgress.toArray(), [], [] as SkillProgress[]);
  const stats = useMemo(
    () => learningStats({ lessons, attempts, legacyQuiz, skills, skillDomains: SKILL_DOMAINS, totalSkills: SKILLS.length }),
    [lessons, attempts, legacyQuiz, skills],
  );
  return { lessons, attempts, legacyQuiz, skills, stats };
}

/** Tableau de bord pédagogique : uniquement des données réellement enregistrées. */
export const ProgressionView: React.FC = () => {
  const profile = useLive(async () => (await db.profile.get('me')) ?? null, [], null as UserProfile | null);
  const diagnostic = useLive(async () => (await db.diagnostics.orderBy('completedAt').last()) ?? null, [], null as DiagnosticResult | null);
  const entries = useLive(() => db.ridingSessions.toArray(), [], [] as JournalEntry[]);
  const settings = useLive(() => getSettings(), [], null as AppSettings | null);
  const { lessons, attempts, legacyQuiz, skills, stats } = useLearningData();

  const activeDays = useMemo(() => {
    const s = new Set<string>();
    attempts.forEach((a) => s.add(isoDay(new Date(a.finishedAt))));
    lessons.forEach((l) => s.add(isoDay(new Date(l.lastViewedAt))));
    legacyQuiz.forEach((q) => s.add(isoDay(new Date(q.attemptedAt))));
    entries.forEach((e) => s.add(e.date));
    return s;
  }, [attempts, lessons, legacyQuiz, entries]);

  const thisWeek = weekStart(new Date());
  const sessionsThisWeek = entries.filter((e) => weekStart(new Date(e.date + 'T12:00:00')) === thisWeek).length;
  const today = isoDay(new Date());
  const revisionsToday = useLive(async () => (await db.revisionItems.toArray()).filter((i) => i.lastReviewedAt && isoDay(new Date(i.lastReviewedAt)) === today).length, [today], 0);

  const states = stats.skillsByState;
  return (
    <div className="space-y-5">
      <PageHeader
        title="Ma progression"
        icon="📈"
        subtitle="Calculée à partir de vos résultats réels"
        help="La maîtrise d’une compétence n’est déduite que des exercices, du diagnostic et des révisions : lire une fiche ne suffit pas."
        actions={
          <button className={btn('secondary')} onClick={() => printProgress({ profile: profile ?? undefined, skills, attempts, stats: { ...stats, sessions: entries.length } })} aria-label="Exporter le bilan en PDF">
            <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Bilan PDF</span>
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Link to="progression/profil" className={`${card} p-3 hover:border-emerald-500`}>
          <UserRound className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">Mon profil</p>
          <p className="text-[11px] text-stone-500">{profile ? `Niveau ${LEVEL_LABELS[profile.level].toLowerCase()}` : 'À renseigner'}</p>
        </Link>
        <Link to="progression/diagnostic" className={`${card} p-3 hover:border-emerald-500`}>
          <Stethoscope className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">Diagnostic</p>
          <p className="text-[11px] text-stone-500">{diagnostic ? `${Math.round(diagnostic.globalScore * 100)} % · ${new Date(diagnostic.completedAt).toLocaleDateString('fr-FR')}` : 'Non réalisé'}</p>
        </Link>
        <Link to="progression/competences" className={`${card} p-3 hover:border-emerald-500`}>
          <Target className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">Compétences</p>
          <p className="text-[11px] text-stone-500">{states.maitrise} / {SKILLS.length} maîtrisées</p>
        </Link>
        <Link to="progression/donnees" className={`${card} p-3 hover:border-emerald-500`}>
          <Database className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">Mes données</p>
          <p className="text-[11px] text-stone-500">Sauvegarde & PDF</p>
        </Link>
      </div>

      {!profile && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-4 space-y-2">
          <p className="font-bold text-emerald-900 dark:text-emerald-200">Personnalisez votre parcours</p>
          <p className="text-sm text-stone-700 dark:text-stone-300">Renseignez votre profil puis faites le diagnostic (≈ 5 min) : l’application vous proposera les compétences à travailler.</p>
          <button className={btn('primary')} onClick={() => navigate('progression/profil')}>Créer mon profil</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatTile icon="📖" value={stats.lessonsViewed} label="fiches consultées" />
        <StatTile icon="🧩" value={stats.exercisesDone} label="exercices réalisés" />
        <StatTile icon="🎯" value={`${stats.successRate} %`} label="taux de réussite" />
        <StatTile icon="⏱️" value={stats.learningMinutes === 0 && (stats.exercisesDone || stats.lessonsViewed) ? '< 1 min' : fmtMinutes(stats.learningMinutes)} label="temps d’apprentissage" />
        <StatTile icon="🔥" value={stats.streak} label="jour(s) d’affilée" />
        <StatTile icon="📅" value={stats.activeDays30} label="jours actifs (30 j)" />
        <StatTile icon="🐎" value={entries.length} label="séances au journal" />
        <StatTile icon="⚠️" value={states.a_reviser} label="compétences à réviser" />
      </div>

      <div className={`${card} p-4 space-y-3`}>
        <h2 className="font-black text-sm text-stone-900 dark:text-stone-100">Compétences</h2>
        <Donut
          title="Répartition des compétences par état"
          center={<span className="text-xs font-bold text-stone-700 dark:text-stone-200">{states.maitrise}<br />maîtrisées</span>}
          data={(Object.keys(MASTERY_COLORS) as (keyof typeof MASTERY_COLORS)[]).map((k) => ({ label: MASTERY_LABELS[k], value: states[k], color: MASTERY_COLORS[k] }))}
        />
      </div>

      <div className={`${card} p-4 space-y-3`}>
        <h2 className="font-black text-sm text-stone-900 dark:text-stone-100">Maîtrise par domaine</h2>
        {Object.keys(stats.byDomain).length === 0 ? (
          <p className="text-sm text-stone-500">Faites le diagnostic ou un exercice pour voir apparaître vos résultats par domaine.</p>
        ) : (
          <HBars
            title="Indice de maîtrise moyen par domaine"
            unit=" / 100"
            data={DOMAINS.filter((d) => stats.byDomain[d.id]).map((d) => ({ label: `${d.icon} ${d.label}`, value: stats.byDomain[d.id]!.mastery, max: 100 }))}
          />
        )}
      </div>

      {stats.scoreTrend.length > 1 && (
        <div className={`${card} p-4`}>
          <h2 className="font-black text-sm text-stone-900 dark:text-stone-100 mb-2">Évolution des scores d’exercices</h2>
          <LineChart title="Score des exercices dans le temps" min={0} max={100} unit=" %" points={stats.scoreTrend.slice(-20).map((p) => ({ label: p.date, value: p.score }))} />
        </div>
      )}

      <div className={`${card} p-4 space-y-3`}>
        <h2 className="font-black text-sm text-stone-900 dark:text-stone-100">Régularité (5 dernières semaines)</h2>
        <ActivityGrid title="Jours avec activité" activeDays={activeDays} />
      </div>

      {settings && (
        <div className={`${card} p-4 space-y-3`}>
          <h2 className="font-black text-sm text-stone-900 dark:text-stone-100">Mes objectifs</h2>
          <div>
            <div className="flex justify-between text-xs mb-1 text-stone-700 dark:text-stone-300">
              <span>Séances cette semaine</span>
              <span className="font-bold">{sessionsThisWeek} / {settings.weeklySessionGoal}</span>
            </div>
            <ProgressBar value={(sessionsThisWeek / Math.max(1, settings.weeklySessionGoal)) * 100} label="Objectif hebdomadaire de séances" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1 text-stone-700 dark:text-stone-300">
              <span>Révisions aujourd’hui</span>
              <span className="font-bold">{revisionsToday} / {settings.dailyRevisionGoal}</span>
            </div>
            <ProgressBar value={(revisionsToday / Math.max(1, settings.dailyRevisionGoal)) * 100} label="Objectif quotidien de révisions" tone="amber" />
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer font-semibold text-emerald-800 dark:text-emerald-300">Modifier mes objectifs</summary>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className={label} htmlFor="g-week">Séances / semaine</label>
                <input id="g-week" type="number" min={0} max={14} className={input} value={settings.weeklySessionGoal} onChange={(e) => void safeWrite(() => saveSettings({ weeklySessionGoal: Math.max(0, Math.min(14, Number(e.target.value))) }))} />
              </div>
              <div>
                <label className={label} htmlFor="g-rev">Révisions / jour</label>
                <input id="g-rev" type="number" min={0} max={200} className={input} value={settings.dailyRevisionGoal} onChange={(e) => void safeWrite(() => saveSettings({ dailyRevisionGoal: Math.max(0, Math.min(200, Number(e.target.value))) }))} />
              </div>
            </div>
          </details>
        </div>
      )}

      {diagnostic && (
        <div className={`${card} p-4 space-y-2`}>
          <h2 className="font-black text-sm text-stone-900 dark:text-stone-100">Comparaison : diagnostic → aujourd’hui</h2>
          <HBars
            title="Score du diagnostic par domaine"
            unit=" %"
            data={(Object.entries(diagnostic.domainScores) as [keyof typeof DOMAIN_BY_ID, number][]).map(([d, v]) => ({
              label: `${DOMAIN_BY_ID[d].icon} ${DOMAIN_BY_ID[d].label}`,
              value: Math.round(v * 100),
              max: 100,
              hint: stats.byDomain[d] ? `maîtrise actuelle ${stats.byDomain[d]!.mastery}` : undefined,
            }))}
          />
        </div>
      )}
    </div>
  );
};
