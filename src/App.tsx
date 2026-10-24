import React, { useState } from 'react';
import type { Lesson, Chapter } from './types';
import { Header } from './components/layout/Header';
import { Navigation, type TabType } from './components/layout/Navigation';
import { OfflineBanner } from './components/layout/OfflineBanner';
import { SearchModal } from './components/common/SearchModal';
import { LessonViewModal } from './features/library/LessonViewModal';
import { ChapterDetailModal } from './features/library/ChapterDetailModal';
import { HomeView } from './features/home/HomeView';
import { LibraryView } from './features/library/LibraryView';
import { PracticeView } from './features/practice/PracticeView';
import { QuizView } from './features/quiz/QuizView';
import { ProfileView } from './features/profile/ProfileView';
import { NewSessionModal } from './features/practice/NewSessionModal';
import { OfflineGuideModal } from './features/profile/OfflineGuideModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('accueil');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Search & Global Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isOfflineGuideOpen, setIsOfflineGuideOpen] = useState(false);

  // Quiz filters from lesson or chapter
  const [quizLessonFilter, setQuizLessonFilter] = useState<string | null>(null);
  const [quizChapterFilter, setQuizChapterFilter] = useState<number | null>(null);

  const handleOpenQuizForLesson = (lessonId: string) => {
    setQuizLessonFilter(lessonId);
    setQuizChapterFilter(null);
    setCurrentTab('reviser');
  };

  const handleOpenQuizForChapter = (chapterNum: number) => {
    setQuizChapterFilter(chapterNum);
    setQuizLessonFilter(null);
    setCurrentTab('reviser');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Discreet Offline Connectivity Banner */}
      <OfflineBanner />

      {/* Main Persistent Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenOfflineGuide={() => setIsOfflineGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {currentTab === 'accueil' && (
          <HomeView
            onSelectLesson={setSelectedLesson}
            onSelectChapter={setSelectedChapter}
            onNavigateTab={setCurrentTab}
            onOpenNewSession={() => setIsNewSessionOpen(true)}
          />
        )}

        {currentTab === 'apprendre' && (
          <LibraryView
            onSelectLesson={setSelectedLesson}
            onSelectChapter={setSelectedChapter}
          />
        )}

        {currentTab === 'pratiquer' && <PracticeView />}

        {currentTab === 'reviser' && (
          <QuizView
            initialLessonFilter={quizLessonFilter}
            initialChapterFilter={quizChapterFilter}
          />
        )}

        {currentTab === 'suivi' && (
          <ProfileView onSelectLesson={setSelectedLesson} />
        )}
      </main>

      {/* Bottom Persistent Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          // Clear targeted quiz filters when switching to quiz directly from bottom bar
          if (tab === 'reviser') {
            setQuizLessonFilter(null);
            setQuizChapterFilter(null);
          }
          setCurrentTab(tab);
        }}
      />

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLesson={setSelectedLesson}
        onSelectChapter={setSelectedChapter}
      />

      <LessonViewModal
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
        onOpenQuizForLesson={handleOpenQuizForLesson}
      />

      <ChapterDetailModal
        chapter={selectedChapter}
        onClose={() => setSelectedChapter(null)}
        onSelectLesson={setSelectedLesson}
        onOpenQuizForChapter={handleOpenQuizForChapter}
      />

      <NewSessionModal
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
      />

      <OfflineGuideModal
        isOpen={isOfflineGuideOpen}
        onClose={() => setIsOfflineGuideOpen(false)}
      />
    </div>
  );
}
