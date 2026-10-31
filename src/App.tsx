import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav, SideNav, isTab, type TabType } from './components/layout/Navigation';
import { OfflineBanner } from './components/layout/OfflineBanner';
import { HamburgerMenu, type MenuAction } from './components/layout/HamburgerMenu';
import { SearchModal } from './components/common/SearchModal';
import { InstallGuideModal } from './components/common/InstallGuideModal';
import { Toaster } from './components/ui/kit';
import { TermProvider } from './components/ui/TermText';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LessonViewModal } from './features/library/LessonViewModal';
import { ChapterDetailModal } from './features/library/ChapterDetailModal';
import { OfflineGuideModal } from './features/profile/OfflineGuideModal';
import { LegalEthicsModal } from './features/profile/LegalEthicsModal';
import { SystemSettingsModal } from './features/settings/SystemSettingsModal';
import { OnboardingModal } from './onboarding/OnboardingModal';
import { ScreenGuideSheet, hasSeenScreenGuide, markScreenGuideSeen } from './onboarding/ScreenGuideSheet';
import { LegalNoticeModal } from './legal/LegalNoticeModal';
import { isLegalNoticeAcknowledged } from './legal/legalStorage';
import { useRoute, navigate } from './app/router';
import { overlays, useOverlays } from './app/overlays';
import { CHAPTERS_CATALOG } from './data/chapters';
import { LESSONS_CATALOG } from './data/lessons';
import { exerciseForLesson } from './data/catalog';
import { HomeView } from './features/home/HomeView';

// Écrans chargés à la demande (code découpé : démarrage plus rapide sur mobile modeste).
const LibraryView = lazy(() => import('./features/library/LibraryView').then((m) => ({ default: m.LibraryView })));
const ParcoursView = lazy(() => import('./features/progression/SkillsView').then((m) => ({ default: m.ParcoursView })));
const SkillsView = lazy(() => import('./features/progression/SkillsView').then((m) => ({ default: m.SkillsView })));
const SkillDetail = lazy(() => import('./features/progression/SkillsView').then((m) => ({ default: m.SkillDetail })));
const ProgressionView = lazy(() => import('./features/progression/ProgressionView').then((m) => ({ default: m.ProgressionView })));
const ProfileForm = lazy(() => import('./features/progression/ProfileAndDiagnostic').then((m) => ({ default: m.ProfileForm })));
const DiagnosticView = lazy(() => import('./features/progression/ProfileAndDiagnostic').then((m) => ({ default: m.DiagnosticView })));
const DataView = lazy(() => import('./features/progression/DataView').then((m) => ({ default: m.DataView })));
const PracticeHub = lazy(() => import('./features/exercises/PracticeHub').then((m) => ({ default: m.PracticeHub })));
const ExerciseRunner = lazy(() => import('./features/exercises/ExerciseRunner').then((m) => ({ default: m.ExerciseRunner })));
const ChecklistsView = lazy(() => import('./features/checklists/ChecklistsView').then((m) => ({ default: m.ChecklistsView })));
const PreparationView = lazy(() => import('./features/preparation/PreparationView').then((m) => ({ default: m.PreparationView })));
const PlanForm = lazy(() => import('./features/preparation/PreparationView').then((m) => ({ default: m.PlanForm })));
const PlanDetail = lazy(() => import('./features/preparation/PreparationView').then((m) => ({ default: m.PlanDetail })));
const RevisionView = lazy(() => import('./features/revision/RevisionView').then((m) => ({ default: m.RevisionView })));
const RevisionSession = lazy(() => import('./features/revision/RevisionView').then((m) => ({ default: m.RevisionSession })));
const FlashcardsView = lazy(() => import('./features/revision/RevisionView').then((m) => ({ default: m.FlashcardsView })));
const JournalView = lazy(() => import('./features/journal/JournalView').then((m) => ({ default: m.JournalView })));
const JournalDetail = lazy(() => import('./features/journal/JournalView').then((m) => ({ default: m.JournalDetail })));
const JournalForm = lazy(() => import('./features/journal/JournalForm').then((m) => ({ default: m.JournalForm })));
const JournalAnalysis = lazy(() => import('./features/journal/JournalAnalysis').then((m) => ({ default: m.JournalAnalysis })));
const HorsesView = lazy(() => import('./features/journal/HorsesView').then((m) => ({ default: m.HorsesView })));
const HorseForm = lazy(() => import('./features/journal/HorsesView').then((m) => ({ default: m.HorseForm })));
const HorseDetail = lazy(() => import('./features/journal/HorsesView').then((m) => ({ default: m.HorseDetail })));
const ResourcesHub = lazy(() => import('./features/resources/ResourcesHub').then((m) => ({ default: m.ResourcesHub })));
const DictionaryView = lazy(() => import('./features/resources/DictionaryView').then((m) => ({ default: m.DictionaryView })));
const TermDetail = lazy(() => import('./features/resources/DictionaryView').then((m) => ({ default: m.TermDetail })));
const AtlasView = lazy(() => import('./features/resources/AtlasView').then((m) => ({ default: m.AtlasView })));
const EquipmentView = lazy(() => import('./features/resources/EquipmentView').then((m) => ({ default: m.EquipmentView })));
const EquipmentDetail = lazy(() => import('./features/resources/EquipmentView').then((m) => ({ default: m.EquipmentDetail })));
const ArenaView = lazy(() => import('./features/resources/ArenaView').then((m) => ({ default: m.ArenaView })));
const BehaviorView = lazy(() => import('./features/resources/BehaviorView').then((m) => ({ default: m.BehaviorView })));
const BehaviorDetail = lazy(() => import('./features/resources/BehaviorView').then((m) => ({ default: m.BehaviorDetail })));

/** Associe une route (#/segment/…) à son écran. Une route inconnue ramène à l'accueil. */
function Screen({ route }: { route: string[] }) {
  const [a, b, c, d] = route;
  switch (a) {
    case 'accueil':
      return <HomeView />;
    case 'apprendre':
      if (b === 'parcours') return <ParcoursView />;
      return <LibraryView onSelectLesson={(l) => overlays.openLesson(l.id)} onSelectChapter={(ch) => overlays.openChapter(ch.id)} />;
    case 'ressources':
      if (b === 'dictionnaire') return c ? <TermDetail id={c} /> : <DictionaryView />;
      if (b === 'atlas') return <AtlasView key={c ?? ''} regionId={c} />;
      if (b === 'materiel') return c ? <EquipmentDetail id={c} /> : <EquipmentView />;
      if (b === 'manege') return <ArenaView figureId={c} />;
      if (b === 'comportement') return c ? <BehaviorDetail id={c} /> : <BehaviorView />;
      return <ResourcesHub />;
    case 'pratiquer':
      if (b === 'exercice' && c) return <ExerciseRunner key={c} exerciseId={c} />;
      if (b === 'checklists') return <ChecklistsView />;
      if (b === 'preparation') {
        if (c === 'nouveau') return <PlanForm key={d ?? 'blank'} templateId={d} />;
        if (c === 'modifier' && d) return <PlanForm key={d} id={d} />;
        if (c) return <PlanDetail id={c} />;
        return <PreparationView />;
      }
      return <PracticeHub />;
    case 'reviser':
      if (b === 'session') return <RevisionSession key={c ?? 'due'} discover={c === 'decouverte'} />;
      if (b === 'cartes') return <FlashcardsView />;
      return <RevisionView />;
    case 'progression':
      if (b === 'profil') return <ProfileForm />;
      if (b === 'diagnostic') return <DiagnosticView />;
      if (b === 'competences') return c ? <SkillDetail id={c} /> : <SkillsView />;
      if (b === 'donnees') return <DataView />;
      return <ProgressionView />;
    case 'journal':
      if (b === 'nouveau') return <JournalForm key={c ?? 'new'} planId={c} />;
      if (b === 'modifier' && c) return <JournalForm key={c} entryId={c} />;
      if (b === 'seance' && c) return <JournalDetail id={c} />;
      if (b === 'analyse') return <JournalAnalysis />;
      if (b === 'chevaux') {
        if (c === 'nouveau') return <HorseForm />;
        if (c === 'modifier' && d) return <HorseForm key={d} id={d} />;
        if (c) return <HorseDetail id={c} />;
        return <HorsesView />;
      }
      return <JournalView />;
    default:
      return <HomeView />;
  }
}

export default function App() {
  const route = useRoute();
  const tab: TabType = isTab(route[0]) ? route[0] : 'accueil';
  const o = useOverlays();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [onboarding, setOnboarding] = useState(() => !isLegalNoticeAcknowledged());

  // Route inconnue : on la remplace par l'accueil (pas d'écran vide).
  useEffect(() => {
    if (!isTab(route[0])) navigate('accueil', { replace: true });
  }, [route]);

  // Aide contextuelle à la première visite de chaque espace.
  useEffect(() => {
    if (!onboarding && !o.open.onboarding && !hasSeenScreenGuide(tab)) overlays.showGuide(tab);
  }, [tab, onboarding, o.open.onboarding]);

  const handleMenuAction = (action: MenuAction) => {
    setIsMenuOpen(false);
    if (action.type === 'route') navigate(action.to);
    else if (action.type === 'help') overlays.showGuide(tab);
    else overlays.show(action.name);
  };

  const chapter = o.chapterId ? (CHAPTERS_CATALOG.find((c) => c.id === o.chapterId) ?? null) : null;
  const showOnboarding = onboarding || !!o.open.onboarding;

  return (
    <TermProvider>
      <div className="min-h-dvh bg-stone-100/70 dark:bg-[#0c1512] text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-200">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] bg-amber-400 text-stone-950 px-3 py-2 rounded-lg font-bold">
          Aller au contenu
        </a>
        <OfflineBanner />
        <Header
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenSearch={() => overlays.show('search')}
          onOpenHelp={() => overlays.showGuide(tab)}
          onOpenOfflineGuide={() => overlays.show('offlineGuide')}
        />
        <div className="flex-1 w-full max-w-6xl mx-auto lg:flex lg:gap-2 px-4">
          <SideNav current={tab} />
          <main id="contenu" tabIndex={-1} className="flex-1 min-w-0 max-w-3xl w-full mx-auto py-4 sm:py-6 pb-28 lg:pb-10 outline-none">
            <Suspense fallback={<p className="text-sm text-stone-500 p-4" role="status">Chargement…</p>}>
              <ErrorBoundary key={route.join('/')}>
                <Screen route={route} />
              </ErrorBoundary>
            </Suspense>
          </main>
        </div>
        <BottomNav current={tab} />

        <HamburgerMenu isOpen={isMenuOpen} currentPath={route.join('/')} onClose={() => setIsMenuOpen(false)} onAction={handleMenuAction} />
        <SearchModal isOpen={!!o.open.search} onClose={() => overlays.hide('search')} />
        <LessonViewModal lessonId={o.lessonId} onClose={overlays.closeLesson} />
        <ChapterDetailModal
          chapter={chapter}
          onClose={overlays.closeChapter}
          onSelectLesson={(l) => overlays.openLesson(l.id)}
          onOpenQuizForChapter={(n) => {
            const quiz = LESSONS_CATALOG.filter((l) => l.chapterNumber === n).map((l) => exerciseForLesson(l.id)).find(Boolean);
            navigate(quiz ? `pratiquer/exercice/${quiz.id}` : 'pratiquer');
          }}
        />
        <OfflineGuideModal isOpen={!!o.open.offlineGuide} onClose={() => overlays.hide('offlineGuide')} />
        <LegalEthicsModal isOpen={!!o.open.ethics} onClose={() => overlays.hide('ethics')} />
        <SystemSettingsModal isOpen={!!o.open.systemSettings} onClose={() => overlays.hide('systemSettings')} onOpenLegalNotice={() => overlays.show('legalNotice')} />
        <LegalNoticeModal isOpen={!!o.open.legalNotice} onClose={() => overlays.hide('legalNotice')} />
        <InstallGuideModal isOpen={!!o.open.install} onClose={() => overlays.hide('install')} />
        <ScreenGuideSheet
          tab={o.guide as TabType | null}
          onClose={() => {
            if (o.guide) markScreenGuideSeen(o.guide as TabType);
            overlays.hideGuide();
          }}
        />
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={() => {
            setOnboarding(false);
            overlays.hide('onboarding');
          }}
        />
        <Toaster />
      </div>
    </TermProvider>
  );
}
