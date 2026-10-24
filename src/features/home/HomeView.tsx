import React, { useState, useEffect } from 'react';
import type { Lesson, Chapter, RidingSession, UserProgress } from '../../types';
import { CHAPTERS_CATALOG } from '../../data/chapters';
import { LESSONS_CATALOG } from '../../data/lessons';
import { PATHWAYS_CATALOG } from '../../data/pathways';
import { db } from '../../db';
import { LevelBadge, RiskBadge } from '../../components/common/Badge';

interface HomeViewProps {
  onSelectLesson: (lesson: Lesson) => void;
  onSelectChapter: (chapter: Chapter) => void;
  onNavigateTab: (tab: 'accueil' | 'apprendre' | 'pratiquer' | 'reviser' | 'suivi') => void;
  onOpenNewSession: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectLesson,
  onSelectChapter,
  onNavigateTab,
  onOpenNewSession,
}) => {
  const [lastLesson, setLastLesson] = useState<Lesson | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [recentSessions, setRecentSessions] = useState<RidingSession[]>([]);
  const [favoriteLessons, setFavoriteLessons] = useState<Lesson[]>([]);
  const [horsesCount, setHorsesCount] = useState(0);

  useEffect(() => {
    const loadHomeData = async () => {
      // 1. User Progress
      const allProgress = await db.userProgress.toArray();
      const completed = allProgress.filter((p) => p.status === 'termine').length;
      setCompletedCount(completed);

      // 2. Last viewed lesson
      const sortedByView = [...allProgress].sort((a, b) => b.lastViewedAt - a.lastViewedAt);
      if (sortedByView.length > 0) {
        const found = LESSONS_CATALOG.find((l) => l.id === sortedByView[0].lessonId);
        if (found) setLastLesson(found);
      } else {
        // Default to first lesson if none viewed
        setLastLesson(LESSONS_CATALOG[0]);
      }

      // 3. Recent Riding Sessions
      const sessions = await db.ridingSessions.orderBy('date').reverse().limit(3).toArray();
      setRecentSessions(sessions);

      // 4. Favorites
      const favs = await db.favorites.where('type').equals('lesson').toArray();
      const favLessonList = favs
        .map((f) => LESSONS_CATALOG.find((l) => l.id === f.targetId))
        .filter((l): l is Lesson => !!l);
      setFavoriteLessons(favLessonList.slice(0, 4));

      // 5. Horses count
      const hCount = await db.horses.count();
      setHorsesCount(hCount);
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Welcome banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#162e24] via-[#1c382c] to-[#0f1d17] p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-amber-400/10 pointer-events-none" />

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-400/30">
            <span>📚</span>
            <span>Doctrine équestre classique</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Bienvenue dans votre carnet d’apprentissage équestre
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Comprenez les principes de l’équitation classique, préparez vos séances d’écurie et suivez votre progression en toute sécurité, 100 % hors ligne.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenNewSession}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2"
            >
              <span>🏇</span>
              <span>Préparer une séance</span>
            </button>
            <button
              onClick={() => onNavigateTab('apprendre')}
              className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 font-semibold text-xs sm:text-sm transition active:scale-95"
            >
              Explorer les 18 chapitres
            </button>
          </div>
        </div>
      </div>

      {/* Real Statistics Quick Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs text-center">
          <div className="text-xl sm:text-2xl font-black text-emerald-800">
            {completedCount}
            <span className="text-xs text-stone-400 font-normal"> / {LESSONS_CATALOG.length}</span>
          </div>
          <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5">
            Fiches assimilées
          </p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs text-center">
          <div className="text-xl sm:text-2xl font-black text-amber-700">
            {recentSessions.length > 0 ? recentSessions.length : '0'}
          </div>
          <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5">
            Séances journal
          </p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs text-center">
          <div className="text-xl sm:text-2xl font-black text-sky-800">
            {horsesCount}
          </div>
          <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5">
            Chevaux enregistrés
          </p>
        </div>
      </div>

      {/* Reprendre le dernier apprentissage */}
      {lastLesson && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>▶</span> Reprendre l’apprentissage
            </span>
            <span className="text-xs text-stone-400 font-medium">
              Chapitre {lastLesson.chapterNumber}
            </span>
          </div>

          <h3 className="font-bold text-base sm:text-lg text-stone-900 leading-snug">
            {lastLesson.titleFr}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 mt-1 leading-relaxed">
            {lastLesson.summaryFr}
          </p>

          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <LevelBadge level={lastLesson.level} />
              <RiskBadge level={lastLesson.riskLevel} />
            </div>

            <button
              onClick={() => onSelectLesson(lastLesson)}
              className="px-3.5 py-1.5 rounded-xl bg-[#162e24] hover:bg-[#1e3d30] text-white font-semibold text-xs transition flex items-center gap-1"
            >
              <span>Lire la fiche</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Parcours Pédagogiques (A, B, C) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-base sm:text-lg text-stone-900 tracking-tight flex items-center gap-2">
            <span>🗺️</span>
            <span>Parcours Pédagogiques Recommandés</span>
          </h3>
          <button
            onClick={() => onNavigateTab('apprendre')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-700"
          >
            Voir tout
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PATHWAYS_CATALOG.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center">
                    {p.code}
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    {p.lessonIds.length} fiches
                  </span>
                </div>
                <h4 className="font-bold text-sm text-stone-900">{p.titleFr}</h4>
                <p className="text-[11px] font-medium text-amber-800 mb-1.5">{p.subtitleFr}</p>
                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {p.descriptionFr}
                </p>
              </div>

              <button
                onClick={() => {
                  const firstLesson = LESSONS_CATALOG.find((l) => l.id === p.lessonIds[0]);
                  if (firstLesson) onSelectLesson(firstLesson);
                }}
                className="mt-4 w-full py-2 rounded-xl bg-stone-100 hover:bg-emerald-50 text-emerald-900 font-semibold text-xs text-center border border-stone-200 transition"
              >
                Commencer le parcours {p.code}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Favoris récents */}
      {favoriteLessons.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-base text-stone-900 tracking-tight flex items-center gap-1.5">
              <span>⭐</span>
              <span>Vos Fiches Favorites</span>
            </h3>
            <button
              onClick={() => onNavigateTab('suivi')}
              className="text-xs font-semibold text-emerald-800"
            >
              Toutes les favorites
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {favoriteLessons.map((l) => (
              <button
                key={l.id}
                onClick={() => onSelectLesson(l)}
                className="text-left p-3 rounded-xl bg-white border border-stone-200 hover:border-amber-300 transition shadow-xs group"
              >
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                  <span>Chapitre {l.chapterNumber}</span>
                  <LevelBadge level={l.level} />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-amber-900 transition">
                  {l.titleFr}
                </h4>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Raccourci vers Réviser */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <span>💡</span>
            <span>Moteur de Quiz &amp; Révisions</span>
          </div>
          <p className="text-xs text-stone-700 max-w-sm">
            Testez vos connaissances sur les allures, l’assiette, les échelles et la sécurité en carrière.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('reviser')}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shrink-0 shadow-sm transition active:scale-95"
        >
          Lancer un quiz
        </button>
      </div>
    </div>
  );
};
