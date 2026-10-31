import React, { useMemo } from 'react';
import type { JournalEntry } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { journalStats } from '../../services/statistics/stats';
import { DISCIPLINE_LABEL, SESSION_TYPE_LABEL, fmtMinutes } from '../../data/labels';
import { SKILL_BY_ID } from '../../data/catalog';
import { EmptyState, PageHeader, StatTile, btn, card } from '../../components/ui/kit';
import { BarChart, HBars, LineChart } from '../../components/ui/charts';
import { navigate } from '../../app/router';

export const JournalAnalysis: React.FC = () => {
  const entries = useLive(() => db.ridingSessions.toArray(), [], [] as JournalEntry[]);
  const s = useMemo(() => journalStats(entries), [entries]);
  if (entries.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader title="Analyse des séances" icon="📊" back="journal" />
        <EmptyState icon="📊" title="Pas encore de données" text="Les statistiques apparaîtront dès que vous aurez enregistré des séances." action={<button className={btn('primary')} onClick={() => navigate('journal/nouveau')}>Ajouter une séance</button>} />
      </div>
    );
  }
  const objectiveTrend = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-8);
  return (
    <div className="space-y-4">
      <PageHeader title="Analyse des séances" icon="📊" back="journal" subtitle="Calculée à partir de votre journal" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatTile value={s.count} label="séances" />
        <StatTile value={fmtMinutes(s.totalMinutes)} label="durée totale" />
        <StatTile value={fmtMinutes(s.averageMinutes)} label="durée moyenne" />
        <StatTile value={s.averagePerWeek} label="séances / semaine (12 sem.)" />
      </div>
      <div className={`${card} p-4`}>
        <h2 className="font-black text-sm text-stone-900 dark:text-stone-100 mb-2">Fréquence (12 dernières semaines)</h2>
        <BarChart title="Séances par semaine" data={s.perWeek.map((w) => ({ label: w.week.slice(8, 10) + '/' + w.week.slice(5, 7), value: w.count }))} />
      </div>
      <div className={`${card} p-4`}>
        <h2 className="font-black text-sm text-stone-900 dark:text-stone-100 mb-2">Répartition par type de séance</h2>
        <HBars title="Séances par type" data={Object.entries(s.byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: SESSION_TYPE_LABEL[k as keyof typeof SESSION_TYPE_LABEL], value: v }))} />
      </div>
      {Object.keys(s.byDiscipline).length > 0 && (
        <div className={`${card} p-4`}>
          <h2 className="font-black text-sm text-stone-900 dark:text-stone-100 mb-2">Répartition par discipline</h2>
          <HBars title="Séances par discipline" data={Object.entries(s.byDiscipline).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: DISCIPLINE_LABEL[k as keyof typeof DISCIPLINE_LABEL], value: v }))} />
        </div>
      )}
      {s.feelingTrend.length > 1 && (
        <div className={`${card} p-4`}>
          <h2 className="font-black text-sm text-stone-900 dark:text-stone-100 mb-2">Progression du ressenti</h2>
          <LineChart title="Ressenti au fil des séances" min={1} max={5} points={s.feelingTrend.map((f) => ({ label: f.date, value: f.feeling }))} />
        </div>
      )}
      {Object.keys(s.skillsWorked).length > 0 && (
        <div className={`${card} p-4`}>
          <h2 className="font-black text-sm text-stone-900 dark:text-stone-100 mb-2">Compétences travaillées</h2>
          <HBars title="Compétences travaillées" data={Object.entries(s.skillsWorked).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => ({ label: SKILL_BY_ID[k]?.name ?? k, value: v }))} unit=" séance(s)" />
        </div>
      )}
      <div className={`${card} p-4`}>
        <h2 className="font-black text-sm text-stone-900 dark:text-stone-100 mb-2">Évolution des objectifs (dernières séances)</h2>
        <ol className="space-y-2 text-sm">
          {objectiveTrend.map((e) => (
            <li key={e.id} className="border-l-2 border-emerald-600 pl-3">
              <span className="text-xs text-stone-500">{e.date}</span>
              <p className="text-stone-800 dark:text-stone-200">{e.objectives.length ? e.objectives.join(' · ') : <em className="text-stone-400">Aucun objectif noté</em>}</p>
              {e.improvements && <p className="text-xs text-stone-500">➜ {e.improvements}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
