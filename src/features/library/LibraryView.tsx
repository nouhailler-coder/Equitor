import React, { useState, useMemo } from 'react';
import type { Lesson, Chapter, SkillLevel, LessonCategory } from '../../types';
import { CHAPTERS_CATALOG } from '../../data/chapters';
import { LESSONS_CATALOG } from '../../data/lessons';
import { GLOSSARY_CATALOG } from '../../data/glossary';
import { LevelBadge, RiskBadge } from '../../components/common/Badge';

interface LibraryViewProps {
  onSelectLesson: (lesson: Lesson) => void;
  onSelectChapter: (chapter: Chapter) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onSelectLesson,
  onSelectChapter,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'fiches' | 'chapitres' | 'glossaire'>('fiches');
  const [searchFilter, setSearchFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<SkillLevel | 'tous'>('tous');
  const [categoryFilter, setCategoryFilter] = useState<LessonCategory | 'tous'>('tous');
  const [glossaryCategory, setGlossaryCategory] = useState<string>('tous');

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return LESSONS_CATALOG.filter((l) => {
      const matchSearch =
        !searchFilter ||
        l.titleFr.toLowerCase().includes(searchFilter.toLowerCase()) ||
        l.summaryFr.toLowerCase().includes(searchFilter.toLowerCase()) ||
        l.vocabulary.some((v) => v.toLowerCase().includes(searchFilter.toLowerCase()));

      const matchLevel = levelFilter === 'tous' || l.level === levelFilter;
      const matchCategory = categoryFilter === 'tous' || l.category === categoryFilter;

      return matchSearch && matchLevel && matchCategory;
    });
  }, [searchFilter, levelFilter, categoryFilter]);

  // Filter chapters
  const filteredChapters = useMemo(() => {
    if (!searchFilter) return CHAPTERS_CATALOG;
    const q = searchFilter.toLowerCase();
    return CHAPTERS_CATALOG.filter(
      (c) =>
        c.titleFr.toLowerCase().includes(q) ||
        c.themePrincipal.toLowerCase().includes(q) ||
        c.summaryFr.toLowerCase().includes(q) ||
        c.vocabularyTags.some((t) => t.toLowerCase().includes(q))
    );
  }, [searchFilter]);

  // Filter glossary
  const glossaryCategories = useMemo(() => {
    const set = new Set(GLOSSARY_CATALOG.map((g) => g.category));
    return ['tous', ...Array.from(set)];
  }, []);

  const filteredGlossary = useMemo(() => {
    return GLOSSARY_CATALOG.filter((term) => {
      const matchCategory =
        glossaryCategory === 'tous' || term.category === glossaryCategory;
      const matchSearch =
        !searchFilter ||
        term.termFr.toLowerCase().includes(searchFilter.toLowerCase()) ||
        term.synonymeOuVariante.toLowerCase().includes(searchFilter.toLowerCase()) ||
        term.definitionFr.toLowerCase().includes(searchFilter.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [glossaryCategory, searchFilter]);

  return (
    <div className="space-y-5 pb-24">
      {/* Title & Top switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Bibliothèque Pédagogique Équestre
          </h2>
          <p className="text-xs text-stone-500">
            18 modules d’apprentissage, fiches techniques illustrées &amp; glossaire thématique
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="bg-stone-200/80 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('fiches')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'fiches'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Fiches ({LESSONS_CATALOG.length})
          </button>
          <button
            onClick={() => setActiveSubTab('chapitres')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'chapitres'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            18 Modules
          </button>
          <button
            onClick={() => setActiveSubTab('glossaire')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'glossaire'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Glossaire ({GLOSSARY_CATALOG.length})
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-xl text-xs sm:text-sm">
          <span>🔍</span>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={
              activeSubTab === 'fiches'
                ? 'Filtrer les fiches (titre, mot-clé, résumé...)'
                : activeSubTab === 'chapitres'
                ? 'Filtrer les modules par numéro ou sujet...'
                : 'Chercher une notion ou un terme équestre...'
            }
            className="flex-1 bg-transparent outline-none text-stone-900 placeholder:text-stone-400"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="text-stone-400 hover:text-stone-600 text-xs"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Category / Level Filters for Fiches */}
        {activeSubTab === 'fiches' && (
          <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
            {/* Level selector */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as SkillLevel | 'tous')}
              className="bg-stone-100 text-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-200 font-medium outline-none shrink-0"
            >
              <option value="tous">Tous les niveaux</option>
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>

            {/* Category selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as LessonCategory | 'tous')}
              className="bg-stone-100 text-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-200 font-medium outline-none shrink-0"
            >
              <option value="tous">Toutes les thématiques</option>
              <option value="position">Position &amp; Assiette</option>
              <option value="aides">Aides naturelles &amp; artificielles</option>
              <option value="allures">Allures &amp; Mécanique</option>
              <option value="plat_dressage">Dressage &amp; Plat</option>
              <option value="obstacle">Saut d'obstacles</option>
              <option value="cross">Cross &amp; Extérieur</option>
              <option value="longe">Travail à la longe</option>
              <option value="jeune_cheval">Jeune cheval &amp; Débourrage</option>
              <option value="securite_ecurie">Sécurité &amp; Écurie</option>
            </select>
          </div>
        )}

        {/* Category filters for Glossary */}
        {activeSubTab === 'glossaire' && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            {glossaryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setGlossaryCategory(cat)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition font-medium ${
                  glossaryCategory === cat
                    ? 'bg-[#162e24] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat === 'tous' ? 'Toutes les catégories' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW 1: FICHES PÉDAGOGIQUES */}
      {activeSubTab === 'fiches' && (
        <div className="space-y-3">
          <div className="text-xs text-stone-500 font-medium">
            Affichage de {filteredLessons.length} fiche(s)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <span className="font-bold text-amber-800">
                      Module {lesson.chapterNumber}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <LevelBadge level={lesson.level} />
                      <RiskBadge level={lesson.riskLevel} />
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-900 transition leading-snug">
                    {lesson.titleFr}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 mt-2 leading-relaxed">
                    {lesson.summaryFr}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500 truncate max-w-[190px]">
                    {lesson.sectionThematique}
                  </span>
                  <span className="text-emerald-800 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                    <span>Consulter</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: 18 MODULES DU PROGRAMME */}
      {activeSubTab === 'chapitres' && (
        <div className="space-y-3">
          <div className="text-xs text-stone-500 font-medium">
            Affichage de {filteredChapters.length} module(s)
          </div>

          <div className="space-y-3">
            {filteredChapters.map((chap) => {
              const lessonCount = LESSONS_CATALOG.filter((l) => l.chapterNumber === chap.number).length;
              return (
                <div
                  key={chap.id}
                  onClick={() => onSelectChapter(chap)}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-950 font-black text-sm flex items-center justify-center shrink-0 border border-amber-300">
                        {chap.number}
                      </span>
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-stone-900 group-hover:text-amber-950 transition">
                          {chap.titleFr}
                        </h3>
                        <p className="text-xs text-stone-500 font-medium">
                          {chap.themePrincipal}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        {lessonCount} fiche(s)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 mt-3 leading-relaxed">
                    {chap.summaryFr}
                  </p>

                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="text-[11px] text-stone-500 font-medium">
                      {chap.subsections.length} sous-thèmes détaillés
                    </span>
                    <span className="text-amber-800 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                      <span>Explorer le module</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: GLOSSAIRE THÉMATIQUE */}
      {activeSubTab === 'glossaire' && (
        <div className="space-y-3">
          <div className="text-xs text-stone-500 font-medium">
            Affichage de {filteredGlossary.length} terme(s)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredGlossary.map((term) => (
              <div
                key={term.id}
                className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-base text-stone-900">
                      {term.termFr}
                    </h3>
                    <span className="text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                      {term.synonymeOuVariante}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-2">
                    {term.category}
                  </span>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {term.definitionFr}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-100 text-[11px] text-stone-500">
                  <div className="italic text-stone-600">
                    « {term.exampleFr} »
                  </div>
                  <div className="mt-1 text-[10px] text-stone-400">
                    Domaine : {term.domaineTechnique}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
