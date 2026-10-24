import React, { useState, useMemo } from 'react';
import { CHAPTERS_CATALOG } from '../../data/chapters';
import { LESSONS_CATALOG } from '../../data/lessons';
import { GLOSSARY_CATALOG } from '../../data/glossary';
import type { Lesson, Chapter } from '../../types';
import { RiskBadge, LevelBadge } from './Badge';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onSelectChapter: (chapter: Chapter) => void;
}

// Remove French accents for robust search
function normalizeSearchText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLesson,
  onSelectChapter,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'lessons' | 'chapters' | 'glossary'>('all');

  const normalizedQuery = useMemo(() => normalizeSearchText(query.trim()), [query]);

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return {
        lessons: LESSONS_CATALOG.slice(0, 4),
        chapters: CHAPTERS_CATALOG.slice(0, 3),
        terms: GLOSSARY_CATALOG.slice(0, 4),
        isDefault: true,
      };
    }

    const matchedLessons = LESSONS_CATALOG.filter((lesson) => {
      const matchTitle = normalizeSearchText(lesson.titleFr).includes(normalizedQuery);
      const matchSummary = normalizeSearchText(lesson.summaryFr).includes(normalizedQuery);
      const matchVocab = lesson.vocabulary.some((v) => normalizeSearchText(v).includes(normalizedQuery));
      const matchSection = normalizeSearchText(lesson.sectionThematique).includes(normalizedQuery);
      return matchTitle || matchSummary || matchVocab || matchSection;
    });

    const matchedChapters = CHAPTERS_CATALOG.filter((chap) => {
      const matchTitle = normalizeSearchText(chap.titleFr).includes(normalizedQuery);
      const matchTheme = normalizeSearchText(chap.themePrincipal).includes(normalizedQuery);
      const matchSummary = normalizeSearchText(chap.summaryFr).includes(normalizedQuery);
      const matchVocab = chap.vocabularyTags.some((v) => normalizeSearchText(v).includes(normalizedQuery));
      return matchTitle || matchTheme || matchSummary || matchVocab;
    });

    const matchedTerms = GLOSSARY_CATALOG.filter((term) => {
      const matchFr = normalizeSearchText(term.termFr).includes(normalizedQuery);
      const matchSyn = normalizeSearchText(term.synonymeOuVariante).includes(normalizedQuery);
      const matchDef = normalizeSearchText(term.definitionFr).includes(normalizedQuery);
      return matchFr || matchSyn || matchDef;
    });

    return {
      lessons: matchedLessons,
      chapters: matchedChapters,
      terms: matchedTerms,
      isDefault: false,
    };
  }, [normalizedQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 sm:pt-20">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-stone-200">
        {/* Search Input bar */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center gap-3">
          <svg className="w-5 h-5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (ex: demi-arrêt, trot, assiette, échelles, cross...)"
            className="flex-1 bg-transparent text-sm sm:text-base outline-none text-stone-900 placeholder:text-stone-400"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-600 text-xs px-2 py-1 rounded bg-stone-200"
            >
              Effacer
            </button>
          )}
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-stone-100/70 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full font-medium transition ${
              activeFilter === 'all'
                ? 'bg-[#162e24] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tous les résultats
          </button>
          <button
            onClick={() => setActiveFilter('lessons')}
            className={`px-3 py-1 rounded-full font-medium transition ${
              activeFilter === 'lessons'
                ? 'bg-[#162e24] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-200'
            }`}
          >
            Fiches ({results.lessons.length})
          </button>
          <button
            onClick={() => setActiveFilter('chapters')}
            className={`px-3 py-1 rounded-full font-medium transition ${
              activeFilter === 'chapters'
                ? 'bg-[#162e24] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-200'
            }`}
          >
            Modules ({results.chapters.length})
          </button>
          <button
            onClick={() => setActiveFilter('glossary')}
            className={`px-3 py-1 rounded-full font-medium transition ${
              activeFilter === 'glossary'
                ? 'bg-[#162e24] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-200'
            }`}
          >
            Glossaire ({results.terms.length})
          </button>
        </div>

        {/* Results scroll area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {results.isDefault && (
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">
              Suggestions &amp; thèmes fréquents
            </p>
          )}

          {/* Lessons */}
          {(activeFilter === 'all' || activeFilter === 'lessons') && results.lessons.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📖</span> Fiches Pédagogiques ({results.lessons.length})
              </h4>
              <div className="space-y-2">
                {results.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      onSelectLesson(lesson);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 transition group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold text-emerald-800">
                        Module {lesson.chapterNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <LevelBadge level={lesson.level} />
                        <RiskBadge level={lesson.riskLevel} />
                      </div>
                    </div>
                    <h5 className="font-bold text-sm text-stone-900 group-hover:text-emerald-900 transition">
                      {lesson.titleFr}
                    </h5>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                      {lesson.summaryFr}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chapters */}
          {(activeFilter === 'all' || activeFilter === 'chapters') && results.chapters.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📚</span> Modules d’apprentissage ({results.chapters.length})
              </h4>
              <div className="space-y-2">
                {results.chapters.map((chap) => (
                  <button
                    key={chap.id}
                    onClick={() => {
                      onSelectChapter(chap);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/80 transition group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-amber-900">
                        Module {chap.number}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {chap.themePrincipal}
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-stone-900 group-hover:text-amber-950 transition">
                      {chap.titleFr}
                    </h5>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                      {chap.summaryFr}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Glossary Terms */}
          {(activeFilter === 'all' || activeFilter === 'glossary') && results.terms.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🔤</span> Termes du Glossaire ({results.terms.length})
              </h4>
              <div className="space-y-2">
                {results.terms.map((term) => (
                  <div
                    key={term.id}
                    className="p-3 rounded-xl bg-sky-50/60 border border-sky-200/80 text-left"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-sky-950">
                        {term.termFr}
                      </span>
                      <span className="text-xs text-sky-800 bg-sky-100 px-2 py-0.5 rounded font-medium">
                        {term.synonymeOuVariante}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed mb-1">
                      {term.definitionFr}
                    </p>
                    <p className="text-[11px] text-stone-500 italic">
                      Exemple : « {term.exampleFr} »
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {results.lessons.length === 0 &&
            results.chapters.length === 0 &&
            results.terms.length === 0 && (
              <div className="text-center py-10 text-stone-500">
                <span className="text-3xl">🔍</span>
                <p className="mt-2 text-sm font-semibold text-stone-800">
                  Aucun résultat pour « {query} »
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Essayez un autre mot-clé ou vérifiez l’orthographe (ex: assiette, galop, demi-arrêt).
                </p>
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-500">
          Recherche 100 % locale instantanée • Aucune donnée transmise en ligne
        </div>
      </div>
    </div>
  );
};
