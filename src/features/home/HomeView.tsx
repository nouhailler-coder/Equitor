import React, { useMemo } from 'react';
import { BookOpen, CalendarCheck, NotebookPen, Play } from 'lucide-react';
import type { DiagnosticResult, DomainId, Favorite, JournalEntry, LessonProgress, SessionPlan, SkillProgress, UserProfile } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { recommendSkills } from '../../services/progression/recommend';
import { LESSON_BY_ID, SKILLS, EXERCISE_BY_ID } from '../../data/catalog';
import { DICTIONARY_BY_ID } from '../../data/dictionary';
import { EQUIPMENT } from '../../data/equipment';
import { ARENA_FIGURES } from '../../data/arenaFigures';
import { BEHAVIORS } from '../../data/behaviors';
import { ATLAS } from '../../data/atlas';
import { DOMAIN_BY_ID } from '../../data/skills';
import { SESSION_TYPE_LABEL, fmtDate } from '../../data/labels';
import { Link, StatTile, btn, card } from '../../components/ui/kit';
import { navigate } from '../../app/router';
import { overlays } from '../../app/overlays';
import { MasteryChip } from '../progression/SkillsView';

/** Libellé et destination d'un favori, quel que soit son type. */
export function favoriteTarget(f: Favorite): { label: string; icon: string; open: () => void } | null {
  switch (f.type) {
    case 'lesson':
      return LESSON_BY_ID[f.targetId] ? { label: LESSON_BY_ID[f.targetId].titleFr, icon: '📖', open: () => overlays.openLesson(f.targetId) } : null;
    case 'term':
      return DICTIONARY_BY_ID[f.targetId] ? { label: DICTIONARY_BY_ID[f.targetId].term, icon: '🔤', open: () => navigate(`ressources/dictionnaire/${f.targetId}`) } : null;
    case 'exercise':
      return EXERCISE_BY_ID[f.targetId] ? { label: EXERCISE_BY_ID[f.targetId].title, icon: '🧩', open: () => navigate(`pratiquer/exercice/${f.targetId}`) } : null;
    case 'journal':
      return { label: 'Séance du journal', icon: '📓', open: () => navigate(`journal/seance/${f.targetId}`) };
    case 'equipment': {
      const e = EQUIPMENT.find((x) => x.id === f.targetId);
      return e ? { label: e.name, icon: '🧰', open: () => navigate(`ressources/materiel/${e.id}`) } : null;
    }
    case 'figure': {
      const x = ARENA_FIGURES.find((y) => y.id === f.targetId);
      return x ? { label: x.name, icon: '🏟️', open: () => navigate(`ressources/manege/${x.id}`) } : null;
    }
    case 'behavior': {
      const b = BEHAVIORS.find((y) => y.id === f.targetId);
      return b ? { label: b.title, icon: '👂', open: () => navigate(`ressources/comportement/${b.id}`) } : null;
    }
    case 'anatomy':
      return ATLAS[f.targetId] ? { label: ATLAS[f.targetId].name, icon: '🦴', open: () => navigate(`ressources/atlas/${f.targetId}`) } : null;
  }
}

export const HomeView: React.FC = () => {
  const profile = useLive(async () => (await db.profile.get('me')) ?? null, [], null as UserProfile | null);
  const diagnostic = useLive(async () => (await db.diagnostics.orderBy('completedAt').last()) ?? null, [], null as DiagnosticResult | null);
  const skillList = useLive(() => db.skillProgress.toArray(), [], [] as SkillProgress[]);
  const lastLesson = useLive(async () => (await db.lessonProgress.orderBy('lastViewedAt').last()) ?? null, [], null as LessonProgress | null);
  const due = useLive(async () => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return db.revisionItems.where('dueAt').belowOrEqual(end.toISOString()).count();
  }, [], 0);
  const lastEntry = useLive(async () => (await db.ridingSessions.orderBy('date').last()) ?? null, [], null as JournalEntry | null);
  const nextPlan = useLive(async () => (await db.sessionPlans.where('status').equals('prevu').sortBy('date'))[0] ?? null, [], null as SessionPlan | null);
  const favorites = useLive(() => db.favorites.orderBy('createdAt').reverse().limit(8).toArray(), [], [] as Favorite[]);
  const counts = useLive(async () => ({ lessons: await db.lessonProgress.count(), sessions: await db.ridingSessions.count(), horses: await db.horses.count() }), [], { lessons: 0, sessions: 0, horses: 0 });

  const progress = useMemo(() => Object.fromEntries(skillList.map((s) => [s.skillId, s])), [skillList]);
  const recos = useMemo(
    () => recommendSkills({ skills: SKILLS, progress, level: profile?.level ?? 'debutant', interests: (profile?.interests ?? []) as DomainId[], domainScores: diagnostic?.domainScores }, 3),
    [progress, profile, diagnostic],
  );
  const mastered = skillList.filter((s) => s.state === 'maitrise').length;
  const resume = lastLesson ? LESSON_BY_ID[lastLesson.lessonId] : null;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-brand-900 via-[#1c382c] to-brand-950 p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-amber-400/10 pointer-events-none" />
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">{profile?.firstName ? `Bonjour ${profile.firstName} !` : 'Bienvenue sur ÉquiProgression'}</h1>
        <p className="text-sm text-emerald-100/80 mt-1 max-w-lg">Comprendre le cheval, apprendre la théorie, préparer vos séances et suivre votre progression — 100 % hors ligne.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <button className={btn('accent')} onClick={() => navigate(due ? 'reviser/session' : 'reviser')}>
            <Play className="w-4 h-4" /> {due ? `${due} révision(s) aujourd’hui` : 'Réviser'}
          </button>
          {!profile ? (
            <button className={btn('secondary', 'bg-white/10 border-white/30 text-white hover:bg-white/20')} onClick={() => navigate('progression/profil')}>Créer mon profil</button>
          ) : !diagnostic ? (
            <button className={btn('secondary', 'bg-white/10 border-white/30 text-white hover:bg-white/20')} onClick={() => navigate('progression/diagnostic')}>Faire le diagnostic</button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatTile value={`${mastered}/${SKILLS.length}`} label="compétences maîtrisées" onClick={() => navigate('progression/competences')} />
        <StatTile value={counts.lessons} label="fiches consultées" onClick={() => navigate('apprendre')} />
        <StatTile value={counts.sessions} label="séances au journal" onClick={() => navigate('journal')} />
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-base text-stone-900 dark:text-stone-100">🎯 Prochaine étape</h2>
          <Link to="apprendre/parcours" className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Mon parcours →</Link>
        </div>
        <ul className="space-y-2">
          {recos.map((s) => (
            <li key={s.id} className={`${card} p-3 flex items-center gap-3`}>
              <span className="text-xl" aria-hidden="true">{DOMAIN_BY_ID[s.domain].icon}</span>
              <Link to={`progression/competences/${s.id}`} className="flex-1 min-w-0 space-y-1">
                <span className="block text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">{s.name}</span>
                <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                  {DOMAIN_BY_ID[s.domain].label} <MasteryChip state={progress[s.id]?.state ?? 'non_commence'} />
                </span>
              </Link>
              {s.exerciseIds[0] && (
                <button className="rounded-lg bg-brand-900 text-white text-xs font-bold px-2.5 py-2" onClick={() => navigate(`pratiquer/exercice/${s.exerciseIds[0]}`)} aria-label={`S’exercer : ${s.name}`}>
                  S’exercer
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid sm:grid-cols-3 gap-3">
        <button className={`${card} p-4 text-left hover:border-emerald-500`} onClick={() => (resume ? overlays.openLesson(resume.id) : navigate('apprendre'))}>
          <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <p className="text-[11px] font-bold uppercase text-stone-500 mt-1">{resume ? 'Reprendre la lecture' : 'Commencer à apprendre'}</p>
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">{resume?.titleFr ?? 'Bibliothèque des fiches'}</p>
        </button>
        <button className={`${card} p-4 text-left hover:border-emerald-500`} onClick={() => navigate(nextPlan ? `pratiquer/preparation/${nextPlan.id}` : 'pratiquer/preparation')}>
          <CalendarCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <p className="text-[11px] font-bold uppercase text-stone-500 mt-1">{nextPlan ? 'Prochaine séance préparée' : 'Préparer une séance'}</p>
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">{nextPlan ? `${nextPlan.title}${nextPlan.date ? ` · ${fmtDate(nextPlan.date)}` : ''}` : 'Choisir un modèle'}</p>
        </button>
        <button className={`${card} p-4 text-left hover:border-emerald-500`} onClick={() => navigate(lastEntry ? 'journal' : 'journal/nouveau')}>
          <NotebookPen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <p className="text-[11px] font-bold uppercase text-stone-500 mt-1">Mon journal</p>
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">{lastEntry ? `Dernière : ${lastEntry.title} (${SESSION_TYPE_LABEL[lastEntry.sessionType]})` : 'Noter ma première séance'}</p>
        </button>
      </div>

      <section className="space-y-2">
        <h2 className="font-black text-base text-stone-900 dark:text-stone-100">⭐ Mes favoris</h2>
        {favorites.length === 0 ? (
          <p className="text-sm text-stone-500">Touchez l’étoile d’une fiche, d’un terme, d’un exercice ou d’une ressource pour la retrouver ici.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {favorites.map((f) => {
              const t = favoriteTarget(f);
              return t ? (
                <li key={f.id}>
                  <button className="rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-3 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:border-amber-400" onClick={t.open}>{t.icon} {t.label}</button>
                </li>
              ) : null;
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
