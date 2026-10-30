import React, { useState, useEffect, useMemo } from 'react';
import { InfoTip } from '../../components/common/InfoTip';
import type { QuizQuestion, QuizAttempt, SkillLevel } from '../../types';
import { QUIZZES_CATALOG } from '../../data/quizzes';
import { GLOSSARY_CATALOG } from '../../data/glossary';
import { db } from '../../db';
import { LevelBadge } from '../../components/common/Badge';

interface QuizViewProps {
  initialLessonFilter?: string | null;
  initialChapterFilter?: number | null;
}

export const QuizView: React.FC<QuizViewProps> = ({
  initialLessonFilter,
  initialChapterFilter,
}) => {
  const [activeMode, setActiveMode] = useState<'quiz' | 'flashcards'>('quiz');
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<number | 'tous'>(
    initialChapterFilter || 'tous'
  );
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<SkillLevel | 'tous'>('tous');

  // Quiz active session state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Load past attempts
    const loadAttempts = async () => {
      const past = await db.quizAttempts.toArray();
      setAttempts(past);
    };
    loadAttempts();
  }, []);

  // Filter questions
  const activeQuestions = useMemo(() => {
    return QUIZZES_CATALOG.filter((q) => {
      if (initialLessonFilter && q.lessonId !== initialLessonFilter) return false;
      if (selectedChapterFilter !== 'tous' && q.chapterNumber !== selectedChapterFilter) return false;
      if (selectedLevelFilter !== 'tous' && q.level !== selectedLevelFilter) return false;
      return true;
    });
  }, [initialLessonFilter, selectedChapterFilter, selectedLevelFilter]);

  const currentQuestion = activeQuestions[currentQuestionIndex] || null;

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;

    if (!currentQuestion) return;

    if (currentQuestion.type === 'multiple_choice') {
      setSelectedIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setSelectedIndexes([index]);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || selectedIndexes.length === 0 || isAnswerSubmitted) return;

    // Check if correct
    const isCorrect =
      selectedIndexes.length === currentQuestion.correctOptionIndexes.length &&
      selectedIndexes.every((idx) => currentQuestion.correctOptionIndexes.includes(idx));

    if (isCorrect) {
      setScoreCount((prev) => prev + 1);
    }

    setIsAnswerSubmitted(true);

    // Save attempt in IndexedDB
    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      questionId: currentQuestion.id,
      selectedOptionIndexes: selectedIndexes,
      isCorrect,
      attemptedAt: Date.now(),
    };

    await db.quizAttempts.put(attempt);
    setAttempts((prev) => [...prev, attempt]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedIndexes([]);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedIndexes([]);
    setIsAnswerSubmitted(false);
    setScoreCount(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Révisions &amp; Moteur de Quiz{' '}
            <InfoTip label="Quiz" text="Choisissez un mode (quiz ou flashcards) et un périmètre (tout, un chapitre ou une fiche). Après chaque réponse, une explication vous aide à comprendre. Vos résultats restent sur l’appareil." />
          </h2>
          <p className="text-xs text-stone-500">
            Évaluation formative 100% locale avec explications pédagogiques détaillées
          </p>
        </div>

        {/* Mode switch */}
        <div className="bg-stone-200/80 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveMode('quiz')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeMode === 'quiz' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Quiz QCM ({QUIZZES_CATALOG.length})
          </button>
          <button
            onClick={() => setActiveMode('flashcards')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeMode === 'flashcards' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Cartes Mémo Flashcards ({GLOSSARY_CATALOG.length})
          </button>
        </div>
      </div>

      {/* MODE 1: QUIZ QCM */}
      {activeMode === 'quiz' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          {!quizFinished && (
            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-medium">Chapitre :</span>
                <select
                  value={selectedChapterFilter}
                  onChange={(e) => {
                    const val = e.target.value === 'tous' ? 'tous' : Number(e.target.value);
                    setSelectedChapterFilter(val);
                    restartQuiz();
                  }}
                  className="bg-stone-100 border border-stone-300 rounded-lg px-2.5 py-1 text-stone-900 font-semibold outline-none"
                >
                  <option value="tous">Tous les chapitres</option>
                  {[1, 2, 3, 7, 8, 11, 15, 17, 18].map((num) => (
                    <option key={num} value={num}>
                      Chapitre {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-medium">Niveau :</span>
                <select
                  value={selectedLevelFilter}
                  onChange={(e) => {
                    setSelectedLevelFilter(e.target.value as SkillLevel | 'tous');
                    restartQuiz();
                  }}
                  className="bg-stone-100 border border-stone-300 rounded-lg px-2.5 py-1 text-stone-900 font-semibold outline-none"
                >
                  <option value="tous">Tous niveaux</option>
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="avance">Avancé</option>
                </select>
              </div>

              <div className="text-stone-500 font-medium">
                Questions disponibles : {activeQuestions.length}
              </div>
            </div>
          )}

          {activeQuestions.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500">
              <p className="text-sm font-semibold text-stone-800">
                Aucune question pour ce filtre précis.
              </p>
              <button
                onClick={() => {
                  setSelectedChapterFilter('tous');
                  setSelectedLevelFilter('tous');
                  restartQuiz();
                }}
                className="mt-3 px-4 py-2 bg-stone-900 text-white text-xs rounded-xl"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : quizFinished ? (
            /* Quiz Completed screen */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 text-center shadow-lg space-y-4">
              <span className="text-5xl block animate-bounce">🏆</span>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                Quiz terminé !
              </h3>
              <div className="inline-block px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <span className="text-3xl font-black text-emerald-800">
                  {scoreCount}
                </span>
                <span className="text-sm font-semibold text-stone-500">
                  {' '}/ {activeQuestions.length} bonnes réponses
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {scoreCount === activeQuestions.length
                  ? 'Remarquable ! Vous maîtrisez les principes théoriques fondamentaux de ces chapitres.'
                  : scoreCount >= activeQuestions.length / 2
                  ? 'Bon résultat ! Relisez les fiches associées pour consolider les notions techniques encore hésitantes.'
                  : 'Prenez le temps de revoir les fiches pédagogiques pour parfaire votre compréhension.'}
              </p>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={restartQuiz}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-sm transition"
                >
                  Recommencer ce quiz
                </button>
              </div>
            </div>
          ) : (
            /* Active Question card */
            currentQuestion && (
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-md space-y-5">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-1.5">
                    <span>
                      Question {currentQuestionIndex + 1} sur {activeQuestions.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-800 font-bold">
                        Score actuel : {scoreCount}
                      </span>
                      <LevelBadge level={currentQuestion.level} />
                    </div>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Question title */}
                <div>
                  <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                    Chapitre {currentQuestion.chapterNumber}
                    {currentQuestion.type === 'multiple_choice' && ' • Choix multiples (plusieurs réponses)'}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    {currentQuestion.questionFr}
                  </h3>
                </div>

                {/* Options list */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedIndexes.includes(idx);
                    const isCorrect = currentQuestion.correctOptionIndexes.includes(idx);

                    let itemStyle = 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-400';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        itemStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                      } else if (isSelected && !isCorrect) {
                        itemStyle = 'bg-rose-50 border-rose-400 text-rose-950 line-through';
                      } else {
                        itemStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
                      }
                    } else if (isSelected) {
                      itemStyle = 'bg-amber-50 border-amber-500 text-amber-950 font-semibold ring-1 ring-amber-500';
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 text-xs sm:text-sm select-none ${itemStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAnswerSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : isSelected
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-stone-200 text-stone-600'
                                : isSelected
                                ? 'bg-amber-500 text-stone-950'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </div>

                        {isAnswerSubmitted && isCorrect && (
                          <span className="text-emerald-700 font-bold shrink-0">✓ Bonne réponse</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Rationale explanation after submit */}
                {isAnswerSubmitted && (
                  <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-4 text-xs sm:text-sm text-emerald-950 space-y-1.5 animate-fadeIn">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <span>💡</span>
                      <span>Explication pédagogique originale :</span>
                    </div>
                    <p className="leading-relaxed font-serif text-stone-800">
                      {currentQuestion.explanationFr}
                    </p>
                  </div>
                )}

                {/* Action button */}
                <div className="pt-2 flex justify-end">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedIndexes.length === 0}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition ${
                        selectedIndexes.length > 0
                          ? 'bg-[#162e24] hover:bg-[#1e3f31] text-white active:scale-95'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      Valider ma réponse
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5"
                    >
                      <span>
                        {currentQuestionIndex < activeQuestions.length - 1
                          ? 'Question suivante'
                          : 'Voir mon bilan final'}
                      </span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* MODE 2: FLASHCARDS MÉMOIRE */}
      {activeMode === 'flashcards' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between text-xs text-stone-600 font-semibold">
            <span>
              Carte {flashcardIndex + 1} / {GLOSSARY_CATALOG.length}
            </span>
            <span>Touchez la carte pour la retourner</span>
          </div>

          {/* Flashcard container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[260px] bg-white rounded-3xl border-2 border-stone-200 shadow-lg p-6 sm:p-8 cursor-pointer flex flex-col justify-between transition-all hover:border-amber-400 text-center relative overflow-hidden select-none"
          >
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              {isFlipped ? 'Définition & Contexte' : 'Terme à mémoriser'}
            </div>

            <div className="my-auto py-4">
              {!isFlipped ? (
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
                    {GLOSSARY_CATALOG[flashcardIndex].termFr}
                  </h3>
                  {GLOSSARY_CATALOG[flashcardIndex].synonymeOuVariante && (
                    <p className="text-xs font-medium text-stone-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200 inline-block mt-3">
                      Synonyme / Variante : {GLOSSARY_CATALOG[flashcardIndex].synonymeOuVariante}
                    </p>
                  )}
                  <p className="text-xs text-amber-800 font-medium mt-2">
                    Catégorie : {GLOSSARY_CATALOG[flashcardIndex].category}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-serif font-medium">
                    {GLOSSARY_CATALOG[flashcardIndex].definitionFr}
                  </p>
                  <p className="text-xs text-stone-500 italic bg-stone-50 p-3 rounded-xl border border-stone-200">
                    Exemple : « {GLOSSARY_CATALOG[flashcardIndex].exampleFr} »
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-stone-400 font-medium">
              {isFlipped ? 'Touchez pour revoir le terme' : 'Touchez pour vérifier la réponse'}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : GLOSSARY_CATALOG.length - 1));
                setIsFlipped(false);
              }}
              className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition"
            >
              ← Précédent
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition"
            >
              {isFlipped ? 'Masquer' : 'Afficher la réponse'}
            </button>

            <button
              onClick={() => {
                setFlashcardIndex((prev) => (prev < GLOSSARY_CATALOG.length - 1 ? prev + 1 : 0));
                setIsFlipped(false);
              }}
              className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
