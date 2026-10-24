import React, { useState, useEffect } from 'react';
import type { Lesson } from '../../types';
import { db } from '../../db';
import { LESSONS_CATALOG } from '../../data/lessons';
import { BackupModal } from './BackupModal';
import { OfflineGuideModal } from './OfflineGuideModal';
import { LegalEthicsModal } from './LegalEthicsModal';
import { LevelBadge } from '../../components/common/Badge';

interface ProfileViewProps {
  onSelectLesson: (lesson: Lesson) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onSelectLesson }) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [horsesCount, setHorsesCount] = useState(0);
  const [quizAttemptsCount, setQuizAttemptsCount] = useState(0);
  const [quizSuccessRate, setQuizSuccessRate] = useState(0);
  const [favoritesList, setFavoritesList] = useState<Lesson[]>([]);

  // Modals state
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isOfflineGuideOpen, setIsOfflineGuideOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  const loadProfileData = async () => {
    // 1. Progress
    const allProgress = await db.userProgress.toArray();
    setCompletedCount(allProgress.filter((p) => p.status === 'termine').length);
    setInProgressCount(allProgress.filter((p) => p.status === 'en_cours').length);

    // 2. Sessions & horses
    const sCount = await db.ridingSessions.count();
    setSessionsCount(sCount);
    const hCount = await db.horses.count();
    setHorsesCount(hCount);

    // 3. Quiz attempts
    const attempts = await db.quizAttempts.toArray();
    setQuizAttemptsCount(attempts.length);
    if (attempts.length > 0) {
      const correct = attempts.filter((a) => a.isCorrect).length;
      setQuizSuccessRate(Math.round((correct / attempts.length) * 100));
    } else {
      setQuizSuccessRate(0);
    }

    // 4. Favorites
    const favs = await db.favorites.where('type').equals('lesson').toArray();
    const loadedLessons = favs
      .map((f) => LESSONS_CATALOG.find((l) => l.id === f.targetId))
      .filter((l): l is Lesson => !!l);
    setFavoritesList(loadedLessons);
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <div className="rounded-3xl bg-gradient-to-br from-[#162e24] via-[#1c382c] to-[#0f1d17] p-5 sm:p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 font-black text-2xl flex items-center justify-center shadow-md">
            🏇
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Mon Espace Cavalier
            </h2>
            <p className="text-xs text-emerald-200/80">
              Données locales chiffrées par votre navigateur • 0 compte cloud
            </p>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
            <span className="text-2xl font-black text-amber-300 block">{completedCount}</span>
            <span className="text-[11px] text-emerald-100/80">Fiches assimilées</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
            <span className="text-2xl font-black text-white block">{sessionsCount}</span>
            <span className="text-[11px] text-emerald-100/80">Séances au journal</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
            <span className="text-2xl font-black text-sky-300 block">{horsesCount}</span>
            <span className="text-[11px] text-emerald-100/80">Chevaux enregistrés</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
            <span className="text-2xl font-black text-emerald-300 block">
              {quizAttemptsCount > 0 ? `${quizSuccessRate}%` : '—'}
            </span>
            <span className="text-[11px] text-emerald-100/80">
              Succès aux quiz ({quizAttemptsCount})
            </span>
          </div>
        </div>
      </div>

      {/* Mes Favoris */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-1.5">
            <span>⭐</span>
            <span>Mes Fiches Favorites ({favoritesList.length})</span>
          </h3>
        </div>

        {favoritesList.length === 0 ? (
          <p className="text-xs text-stone-500 py-3 text-center">
            Vous n'avez pas encore ajouté de fiches à vos favoris. Touchez l'icône étoile ⭐ sur une fiche pour la retrouver ici instantanément.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {favoritesList.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className="text-left p-3 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 transition group"
              >
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                  <span className="font-bold text-amber-800">Chapitre {lesson.chapterNumber}</span>
                  <LevelBadge level={lesson.level} />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-emerald-900 transition">
                  {lesson.titleFr}
                </h4>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Settings & Tools menu */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
        <h3 className="font-bold text-base text-stone-900 flex items-center gap-1.5">
          <span>⚙️</span>
          <span>Outils, Sauvegarde &amp; Sécurité</span>
        </h3>

        <div className="space-y-2">
          {/* Backup trigger */}
          <button
            onClick={() => setIsBackupOpen(true)}
            className="w-full text-left p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💾</span>
              <div>
                <div className="font-bold text-xs sm:text-sm text-stone-900">
                  Sauvegarde &amp; Restauration JSON
                </div>
                <div className="text-[11px] text-stone-500">
                  Exportez ou importez vos données locales en un clic
                </div>
              </div>
            </div>
            <span className="text-stone-400 font-bold">→</span>
          </button>

          {/* PWA offline guide trigger */}
          <button
            onClick={() => setIsOfflineGuideOpen(true)}
            className="w-full text-left p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📲</span>
              <div>
                <div className="font-bold text-xs sm:text-sm text-stone-900">
                  Installation PWA &amp; Guide Hors Ligne
                </div>
                <div className="text-[11px] text-stone-500">
                  Comment utiliser l'application sans connexion à l'écurie
                </div>
              </div>
            </div>
            <span className="text-stone-400 font-bold">→</span>
          </button>

          {/* Déontologie et cadre légal */}
          <button
            onClick={() => setIsCreditsOpen(true)}
            className="w-full text-left p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📚</span>
              <div>
                <div className="font-bold text-xs sm:text-sm text-stone-900">
                  Origine Pédagogique &amp; Déontologie
                </div>
                <div className="text-[11px] text-stone-500">
                  Principes fondamentaux de l’équitation classique
                </div>
              </div>
            </div>
            <span className="text-stone-400 font-bold">→</span>
          </button>
        </div>
      </div>

      {/* Privacy guarantee badge */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-3">
        <span className="text-2xl">🔒</span>
        <div>
          <span className="font-bold block">100% Hors Ligne &amp; Respect de votre vie privée</span>
          <span className="text-stone-600">
            Aucun tracker, aucune publicité, aucune donnée envoyée à un serveur tiers. Vos données vous appartiennent.
          </span>
        </div>
      </div>

      {/* Modals */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataChanged={loadProfileData}
      />
      <OfflineGuideModal
        isOpen={isOfflineGuideOpen}
        onClose={() => setIsOfflineGuideOpen(false)}
      />
      <LegalEthicsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />
    </div>
  );
};
