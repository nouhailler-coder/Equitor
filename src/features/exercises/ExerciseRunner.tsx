import React, { useMemo, useState } from 'react';
import { Clock, RotateCcw } from 'lucide-react';
import type { ExerciseAttempt, QuestionResult } from '../../types/models';
import { EXERCISE_BY_ID, LEVEL_LABELS } from '../../data/catalog';
import { DOMAIN_BY_ID } from '../../data/skills';
import { QuestionView } from './QuestionView';
import { recordExerciseAttempt } from '../../services/progression/progressService';
import { safeWrite } from '../../services/feedback/toast';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { EmptyState, FavoriteButton, PageHeader, ProgressBar, btn, card } from '../../components/ui/kit';
import { LineChart } from '../../components/ui/charts';
import { navigate } from '../../app/router';

const fmtDuration = (s: number) => (s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`);

export const ExerciseRunner: React.FC<{ exerciseId: string }> = ({ exerciseId }) => {
  const exercise = EXERCISE_BY_ID[exerciseId];
  const [run, setRun] = useState(0);
  const [started, setStarted] = useState(false);
  const [startedAt, setStartedAt] = useState('');
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState<ExerciseAttempt | null>(null);

  const history = useLive(
    () => db.exerciseAttempts.where('exerciseId').equals(exerciseId).sortBy('finishedAt'),
    [exerciseId, finished?.id],
    [] as ExerciseAttempt[],
  );

  const questions = useMemo(() => exercise?.questions ?? [], [exercise]);

  if (!exercise) {
    return <EmptyState icon="🔍" title="Exercice introuvable" action={<button className={btn('primary')} onClick={() => navigate('pratiquer')}>Voir les exercices</button>} />;
  }

  const start = () => {
    setRun((r) => r + 1);
    setStarted(true);
    setStartedAt(new Date().toISOString());
    setIndex(0);
    setResults([]);
    setAnswered(false);
    setFinished(null);
  };

  const next = async () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setAnswered(false);
      return;
    }
    const attempt = await safeWrite(() => recordExerciseAttempt({ exerciseId, startedAt, results }), 'Résultat enregistré');
    if (attempt) setFinished(attempt);
  };

  const domain = DOMAIN_BY_ID[exercise.domain];

  /* ───── Présentation ───── */
  if (!started) {
    const last = history.at(-1);
    return (
      <div className="space-y-4">
        <PageHeader title={exercise.title} subtitle={exercise.description} back="pratiquer" actions={<FavoriteButton type="exercise" targetId={exercise.id} label={exercise.title} />} />
        <div className={`${card} p-4 space-y-3 text-sm`}>
          <p className="text-stone-700 dark:text-stone-300"><strong>Objectif :</strong> {exercise.objective}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1">{domain.icon} {domain.label}</span>
            <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1">{LEVEL_LABELS[exercise.level]}</span>
            <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1">{'●'.repeat(exercise.difficulty)}{'○'.repeat(3 - exercise.difficulty)} difficulté</span>
            <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1">≈ {exercise.durationMin} min · {questions.length} questions</span>
          </div>
        </div>
        <button className={btn('primary', 'w-full text-base')} onClick={start}>{last ? 'Recommencer l’exercice' : 'Commencer'}</button>
        {history.length > 0 && <AttemptHistory attempts={history} />}
      </div>
    );
  }

  /* ───── Résultat ───── */
  if (finished) {
    const pct = Math.round(finished.score * 100);
    const errors = questions.filter((q) => finished.errors.includes(q.id));
    return (
      <div className="space-y-4">
        <PageHeader title="Résultat" subtitle={exercise.title} back="pratiquer" />
        <div className={`${card} p-5 text-center space-y-2`}>
          <div className="text-5xl font-black text-stone-900 dark:text-stone-50">{pct} %</div>
          <p className="text-sm text-stone-600 dark:text-stone-300">
            {pct >= 85 ? 'Excellent travail !' : pct >= 60 ? 'Bien, quelques points à consolider.' : 'À retravailler : les notions reviendront dans vos révisions.'}
          </p>
          <p className="text-xs text-stone-500 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {fmtDuration(finished.durationSec)} · tentative n° {finished.attemptNumber}
          </p>
          <ProgressBar value={pct} label="Score" />
        </div>
        {errors.length > 0 && (
          <div className={`${card} p-4 space-y-2`}>
            <h2 className="font-black text-sm text-stone-900 dark:text-stone-100">Questions à revoir ({errors.length})</h2>
            <ul className="text-sm text-stone-700 dark:text-stone-300 list-disc pl-5 space-y-1">
              {errors.map((q) => (
                <li key={q.id}>{q.prompt}</li>
              ))}
            </ul>
            <p className="text-xs text-stone-500">Elles ont été ajoutées à vos révisions du jour.</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button className={btn('secondary')} onClick={start}><RotateCcw className="w-4 h-4" /> Recommencer</button>
          <button className={btn('primary')} onClick={() => navigate('reviser')}>Mes révisions</button>
        </div>
        <AttemptHistory attempts={history} />
      </div>
    );
  }

  /* ───── Question en cours ───── */
  const q = questions[index];
  return (
    <div className="space-y-4" key={run}>
      <div className="flex items-center gap-3">
        <button className="text-sm font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200" onClick={() => setStarted(false)}>Quitter</button>
        <div className="flex-1">
          <ProgressBar value={((index + (answered ? 1 : 0)) / questions.length) * 100} label="Avancement" tone="amber" />
        </div>
        <span className="text-xs font-bold text-stone-600 dark:text-stone-300">{index + 1}/{questions.length}</span>
      </div>
      <div className={`${card} p-4 sm:p-5`}>
        <QuestionView
          key={`${run}-${q.id}`}
          question={q}
          answered={answered}
          onAnswered={(score, given) => {
            setAnswered(true);
            setResults((r) => [...r.filter((x) => x.questionId !== q.id), { questionId: q.id, score, given }]);
          }}
        />
      </div>
      {answered && (
        <button className={btn('primary', 'w-full text-base')} onClick={() => void next()} autoFocus>
          {index < questions.length - 1 ? 'Question suivante' : 'Voir mon résultat'}
        </button>
      )}
    </div>
  );
};

const AttemptHistory: React.FC<{ attempts: ExerciseAttempt[] }> = ({ attempts }) => (
  <div className={`${card} p-4 space-y-3`}>
    <h2 className="font-black text-sm text-stone-900 dark:text-stone-100">Mes résultats précédents</h2>
    {attempts.length > 1 && (
      <LineChart title="Évolution du score" min={0} max={100} unit=" %" points={attempts.map((a) => ({ label: new Date(a.finishedAt).toLocaleDateString('fr-FR'), value: Math.round(a.score * 100) }))} />
    )}
    <ul className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
      {[...attempts].reverse().slice(0, 8).map((a) => (
        <li key={a.id} className="py-2 flex justify-between gap-2 text-stone-700 dark:text-stone-300">
          <span>{new Date(a.finishedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
          <span className="text-stone-500">{fmtDuration(a.durationSec)} · {a.errors.length} erreur(s)</span>
          <span className="font-bold">{Math.round(a.score * 100)} %</span>
        </li>
      ))}
    </ul>
  </div>
);
