import React, { useMemo, useState } from 'react';
import { CalendarCheck, ClipboardCheck } from 'lucide-react';
import type { DomainId, ExerciseAttempt, Level } from '../../types/models';
import { EXERCISES, LEVEL_LABELS } from '../../data/catalog';
import { DOMAINS, DOMAIN_BY_ID } from '../../data/skills';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { Chips, Link, PageHeader, card } from '../../components/ui/kit';

export const PracticeHub: React.FC = () => {
  const [domain, setDomain] = useState<DomainId | 'tous'>('tous');
  const [level, setLevel] = useState<Level | 'tous'>('tous');
  const [showLessonQuizzes, setShowLessonQuizzes] = useState(false);
  const attempts = useLive(() => db.exerciseAttempts.toArray(), [], [] as ExerciseAttempt[]);
  const best = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of attempts) m[a.exerciseId] = Math.max(m[a.exerciseId] ?? 0, a.score);
    return m;
  }, [attempts]);

  const list = EXERCISES.filter(
    (e) =>
      (domain === 'tous' || e.domain === domain) &&
      (level === 'tous' || e.level === level) &&
      (showLessonQuizzes || !e.id.startsWith('ex-fiche-')),
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Pratiquer" icon="🏋️" subtitle="Exercices interactifs, préparation de séance et checklists" help="Choisissez un exercice : après chaque réponse, une explication et une ressource vous aident à progresser. Vos résultats alimentent votre progression et vos révisions." />

      <div className="grid grid-cols-2 gap-3">
        <Link to="pratiquer/preparation" className={`${card} p-4 flex items-center gap-3 hover:border-emerald-500`}>
          <CalendarCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
          <span>
            <span className="block font-bold text-sm text-stone-900 dark:text-stone-100">Préparer une séance</span>
            <span className="block text-xs text-stone-500">Programmes & bilans</span>
          </span>
        </Link>
        <Link to="pratiquer/checklists" className={`${card} p-4 flex items-center gap-3 hover:border-emerald-500`}>
          <ClipboardCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
          <span>
            <span className="block font-bold text-sm text-stone-900 dark:text-stone-100">Checklists</span>
            <span className="block text-xs text-stone-500">Avant / après la séance</span>
          </span>
        </Link>
      </div>

      <div className="space-y-2">
        <Chips label="Filtrer par domaine" value={domain} onChange={setDomain} options={[{ id: 'tous', label: 'Tous les domaines' }, ...DOMAINS.map((d) => ({ id: d.id, label: `${d.icon} ${d.label}` }))]} />
        <Chips label="Filtrer par niveau" value={level} onChange={setLevel} options={[{ id: 'tous', label: 'Tous niveaux' }, ...(['debutant', 'intermediaire', 'confirme'] as Level[]).map((l) => ({ id: l, label: LEVEL_LABELS[l] }))]} />
        <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
          <input type="checkbox" className="w-4 h-4 accent-emerald-700" checked={showLessonQuizzes} onChange={(e) => setShowLessonQuizzes(e.target.checked)} />
          Afficher aussi les quiz rattachés aux fiches
        </label>
      </div>

      <p className="text-xs text-stone-500" aria-live="polite">{list.length} exercice(s)</p>
      <ul className="grid sm:grid-cols-2 gap-3">
        {list.map((e) => {
          const d = DOMAIN_BY_ID[e.domain];
          const b = best[e.id];
          return (
            <li key={e.id}>
              <Link to={`pratiquer/exercice/${e.id}`} className={`${card} p-4 block h-full hover:border-emerald-500 transition`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">{d.icon} {d.label}</span>
                  {b !== undefined && (
                    <span className={`text-[11px] font-black rounded-full px-2 py-0.5 ${b >= 0.85 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'}`}>
                      Meilleur : {Math.round(b * 100)} %
                    </span>
                  )}
                </div>
                <p className="font-bold text-stone-900 dark:text-stone-100 mt-1 leading-snug">{e.title}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{LEVEL_LABELS[e.level]} · {e.questions.length} questions · ≈ {e.durationMin} min</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
