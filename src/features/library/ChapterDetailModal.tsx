import React from 'react';
import type { Chapter, Lesson } from '../../types';
import { LESSONS_CATALOG } from '../../data/lessons';
import { LevelBadge, RiskBadge } from '../../components/common/Badge';

interface ChapterDetailModalProps {
  chapter: Chapter | null;
  onClose: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onOpenQuizForChapter: (chapterNumber: number) => void;
}

export const ChapterDetailModal: React.FC<ChapterDetailModalProps> = ({
  chapter,
  onClose,
  onSelectLesson,
  onOpenQuizForChapter,
}) => {
  if (!chapter) return null;

  const associatedLessons = LESSONS_CATALOG.filter(
    (l) => l.chapterNumber === chapter.number || l.chapterId === chapter.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#162e24] text-white flex items-start justify-between gap-3 border-b border-emerald-950">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <span>Programme Pédagogique</span>
              <span>•</span>
              <span>Module {chapter.number}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {chapter.titleFr}
            </h2>
            <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
              {chapter.themePrincipal}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 text-stone-300 hover:text-white hover:bg-emerald-900 transition"
            title="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Sub-header status bar */}
        <div className="px-4 py-2 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
            <span>✓</span>
            <span>Module disponible</span>
          </span>
          <span className="text-stone-600 font-semibold text-[11px]">
            {chapter.referenceModule}
          </span>
        </div>

        {/* Scrollable content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-900">
          {/* Chapter Summary */}
          <div className="bg-stone-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
            <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
              Synthèse thématique de référence
            </h4>
            <p className="text-sm text-stone-800 leading-relaxed font-serif">
              {chapter.summaryFr}
            </p>
          </div>

          {/* Associated Original Fiches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>📖</span> Fiches pédagogiques disponibles ({associatedLessons.length})
              </h3>
            </div>

            {associatedLessons.length > 0 ? (
              <div className="space-y-2.5">
                {associatedLessons.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      onSelectLesson(l);
                      onClose();
                    }}
                    className="w-full text-left p-3.5 rounded-xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 hover:border-emerald-300 transition group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-stone-500">
                        Thème : {l.sectionThematique}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <LevelBadge level={l.level} />
                        <RiskBadge level={l.riskLevel} />
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-stone-900 group-hover:text-emerald-900 transition">
                      {l.titleFr}
                    </h4>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                      {l.summaryFr}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-stone-50 rounded-xl border border-dashed border-stone-300 text-xs text-stone-500 text-center">
                Les fiches d’application pour ce module seront ajoutées prochainement.
              </div>
            )}
          </div>

          {/* Subsections */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📑</span> Programme et sous-thèmes du module
            </h3>
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <ul className="space-y-1.5 text-xs text-stone-700">
                {chapter.subsections.map((sub, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{sub}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Vocabulary Tags */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🔤</span> Vocabulaire &amp; notions clés
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {chapter.vocabularyTags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-stone-100 text-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onOpenQuizForChapter(chapter.number);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition"
          >
            <span>Quiz du Module {chapter.number}</span>
            <span>→</span>
          </button>

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
