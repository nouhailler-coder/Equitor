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
import { HamburgerMenu, type MenuAction } from './components/layout/HamburgerMenu';
import { ChecklistsModal } from './features/practice/ChecklistsModal';
import { HorseManagerModal } from './features/practice/HorseManagerModal';
import { BackupModal } from './features/profile/BackupModal';
import { LegalEthicsModal } from './features/profile/LegalEthicsModal';
import { SystemSettingsModal } from './features/settings/SystemSettingsModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('accueil');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Search & Global Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isOfflineGuideOpen, setIsOfflineGuideOpen] = useState(false);

  // Hamburger menu & modals reachable from it
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChecklistsOpen, setIsChecklistsOpen] = useState(false);
  const [isHorsesOpen, setIsHorsesOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);
  // Bumped when data changes from a global modal so the current view reloads it
  const [dataVersion, setDataVersion] = useState(0);
  const refreshData = () => setDataVersion((v) => v + 1);

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

  const selectTab = (tab: TabType) => {
    // Clear targeted quiz filters when switching to quiz directly
    if (tab === 'reviser') {
      setQuizLessonFilter(null);
      setQuizChapterFilter(null);
    }
    setCurrentTab(tab);
  };

  const handleMenuAction = (action: MenuAction) => {
    setIsMenuOpen(false);
    if (action.type === 'tab') {
      selectTab(action.tab);
      return;
    }
    const openers = {
      search: setIsSearchOpen,
      newSession: setIsNewSessionOpen,
      checklists: setIsChecklistsOpen,
      horses: setIsHorsesOpen,
      backup: setIsBackupOpen,
      offlineGuide: setIsOfflineGuideOpen,
      legal: setIsLegalOpen,
      systemSettings: setIsSystemSettingsOpen,
    };
    openers[action.modal](true);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Discreet Offline Connectivity Banner */}
      <OfflineBanner />

      {/* Main Persistent Header */}
      <Header
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenOfflineGuide={() => setIsOfflineGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main key={dataVersion} className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
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
        onSelectTab={selectTab}
      />

      <HamburgerMenu
        isOpen={isMenuOpen}
        currentTab={currentTab}
        onClose={() => setIsMenuOpen(false)}
        onAction={handleMenuAction}
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
        onSessionSaved={refreshData}
      />

      <OfflineGuideModal
        isOpen={isOfflineGuideOpen}
        onClose={() => setIsOfflineGuideOpen(false)}
      />

      <ChecklistsModal
        isOpen={isChecklistsOpen}
        onClose={() => setIsChecklistsOpen(false)}
      />

      <HorseManagerModal
        isOpen={isHorsesOpen}
        onClose={() => setIsHorsesOpen(false)}
        onHorsesUpdated={refreshData}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataChanged={refreshData}
      />

      <LegalEthicsModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
      />

      <SystemSettingsModal
        isOpen={isSystemSettingsOpen}
        onClose={() => setIsSystemSettingsOpen(false)}
      />
    </div>
  );
}
