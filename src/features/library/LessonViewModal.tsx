import React, { useState, useEffect } from 'react';
import type { Lesson } from '../../types';
import { db } from '../../db';
import { RiskBadge, LevelBadge } from '../../components/common/Badge';
import { RiskWarning } from '../../components/common/RiskWarning';
import { SvgDiagram } from '../../components/common/SvgDiagrams';

interface LessonViewModalProps {
  lesson: Lesson | null;
  onClose: () => void;
  onOpenQuizForLesson?: (lessonId: string) => void;
}

export const LessonViewModal: React.FC<LessonViewModalProps> = ({
  lesson,
  onClose,
  onOpenQuizForLesson,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState<'non_commence' | 'en_cours' | 'termine'>('non_commence');
  const [personalNotes, setPersonalNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (!lesson) return;

    // Load progress and favorite state from IndexedDB
    const loadProgress = async () => {
      const fav = await db.favorites.get(`lesson_${lesson.id}`);
      setIsFavorite(!!fav);

      const prog = await db.userProgress.get(lesson.id);
      if (prog) {
        setStatus(prog.status);
        setPersonalNotes(prog.personalNotes || '');
      } else {
        // Record as viewed / in_progress
        await db.userProgress.put({
          lessonId: lesson.id,
          status: 'en_cours',
          lastViewedAt: Date.now(),
          reviewCount: 1,
        });
        setStatus('en_cours');
      }
    };

    loadProgress();
  }, [lesson]);

  if (!lesson) return null;

  const toggleFavorite = async () => {
    const favId = `lesson_${lesson.id}`;
    if (isFavorite) {
      await db.favorites.delete(favId);
      setIsFavorite(false);
    } else {
      await db.favorites.put({
        id: favId,
        type: 'lesson',
        targetId: lesson.id,
        createdAt: Date.now(),
      });
      setIsFavorite(true);
    }
  };

  const handleStatusChange = async (newStatus: 'non_commence' | 'en_cours' | 'termine') => {
    setStatus(newStatus);
    await db.userProgress.put({
      lessonId: lesson.id,
      status: newStatus,
      lastViewedAt: Date.now(),
      completedAt: newStatus === 'termine' ? Date.now() : undefined,
      reviewCount: 1,
      personalNotes,
    });
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    const existing = await db.userProgress.get(lesson.id);
    await db.userProgress.put({
      lessonId: lesson.id,
      status: existing ? existing.status : 'en_cours',
      lastViewedAt: Date.now(),
      reviewCount: (existing?.reviewCount || 0) + 1,
      personalNotes,
    });
    setTimeout(() => setIsSavingNotes(false), 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-stone-200">
        {/* Header bar */}
        <div className="p-4 sm:p-5 bg-[#162e24] text-white flex items-start justify-between gap-3 border-b border-emerald-950">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1 text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wide">
                Chapitre {lesson.chapterNumber}
              </span>
              <span className="text-emerald-300">•</span>
              <span className="text-emerald-200/80">{lesson.sectionThematique}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {lesson.titleFr}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Favorite button */}
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-xl transition ${
                isFavorite
                  ? 'bg-amber-400 text-stone-900 shadow-md'
                  : 'bg-emerald-950/70 text-emerald-200 hover:bg-emerald-900'
              }`}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-emerald-950/70 text-stone-300 hover:text-white hover:bg-emerald-900 transition"
              title="Fermer la fiche"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Action sub-bar: Badges & status toggles */}
        <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <LevelBadge level={lesson.level} />
            <RiskBadge level={lesson.riskLevel} />
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-stone-300">
            <button
              onClick={() => handleStatusChange('en_cours')}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${
                status === 'en_cours'
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              En cours
            </button>
            <button
              onClick={() => handleStatusChange('termine')}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${
                status === 'termine'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ✓ Assimilé
            </button>
          </div>
        </div>

        {/* Content Body scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-900">
          {/* Mandatory Safety Notice */}
          <RiskWarning
            riskLevel={lesson.riskLevel}
            supervisionRequired={lesson.supervisionRequired}
            advancedPractice={lesson.advancedPractice}
            customNotice={lesson.safetyNotice}
          />

          {/* Summary Box */}
          <div className="bg-stone-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
              Résumé synthétique original
            </h4>
            <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-serif">
              {lesson.summaryFr}
            </p>
          </div>

          {/* Learning Objectives */}
          <div>
            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🎯</span> Objectifs pédagogiques
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-stone-700">
              {lesson.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Vector Diagram if applicable */}
          {lesson.diagramType && (
            <div className="my-4">
              <SvgDiagram type={lesson.diagramType} />
            </div>
          )}

          {/* Pedagogical Sections */}
          <div className="space-y-5">
            {lesson.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-base font-bold text-[#162e24] border-b pb-1 border-stone-200">
                  {sec.heading}
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>

                {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                  <ul className="space-y-1 pl-4 text-xs sm:text-sm text-stone-600 list-disc">
                    {sec.bulletPoints.map((bp, bidx) => (
                      <li key={bidx}>{bp}</li>
                    ))}
                  </ul>
                )}

                {sec.callout && (
                  <div
                    className={`p-3 rounded-xl text-xs sm:text-sm ${
                      sec.callout.type === 'warning'
                        ? 'bg-rose-50 border border-rose-300 text-rose-950 font-medium'
                        : sec.callout.type === 'tip'
                        ? 'bg-amber-50 border border-amber-300 text-amber-950'
                        : 'bg-sky-50 border border-sky-300 text-sky-950'
                    }`}
                  >
                    <span className="font-bold mr-1">
                      {sec.callout.type === 'warning' ? '⚠️ Attention :' : '💡 Conseil du moniteur :'}
                    </span>
                    {sec.callout.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Observations & Mistakes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Observation points */}
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>👁️</span> Points à observer
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-900">
                {lesson.observations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common mistakes */}
            <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200">
              <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🚫</span> Erreurs fréquentes à éviter
              </h4>
              <ul className="space-y-1.5 text-xs text-rose-900">
                {lesson.commonMistakes.map((mis, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-700 font-bold">✕</span>
                    <span>{mis}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Vocabulary Tags */}
          {lesson.vocabulary && lesson.vocabulary.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Notions de vocabulaire associées
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {lesson.vocabulary.map((v, i) => (
                  <span
                    key={i}
                    className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-300 font-medium"
                  >
                    #{v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Personal Notes Section */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                <span>📝</span> Mes notes personnelles (100% privées)
              </h4>
              {isSavingNotes && (
                <span className="text-[11px] text-emerald-700 font-semibold animate-pulse">
                  Enregistré !
                </span>
              )}
            </div>
            <textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Notez vos sensations avec votre cheval, les conseils de votre instructeur, vos exercices à retravailler..."
              className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition min-h-[75px]"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition"
              >
                Enregistrer ma note
              </button>
            </div>
          </div>

          {/* Référence & Version */}
          <div className="text-[11px] text-stone-500 border-t pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 leading-normal">
            <div>
              <strong>Module d’apprentissage :</strong> Module {lesson.chapterNumber} — « {lesson.sectionThematique} »
            </div>
            <div>
              <strong>Origine pédagogique :</strong> Synthèse originale • Version {lesson.version}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-2">
          {onOpenQuizForLesson ? (
            <button
              onClick={() => {
                onOpenQuizForLesson(lesson.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-sm"
            >
              <span>Tester mes connaissances</span>
              <span>→</span>
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-medium text-xs sm:text-sm transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
