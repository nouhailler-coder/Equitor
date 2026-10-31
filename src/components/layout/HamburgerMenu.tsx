import React, { useEffect, useRef } from 'react';
import { useEscape } from '../../hooks/useEscape';
import {
  BookOpen,
  BookA,
  CalendarCheck,
  ClipboardCheck,
  CircleHelp,
  Download,
  Dumbbell,
  FileText,
  GraduationCap,
  HardDriveDownload,
  Home,
  Layers,
  LayoutGrid,
  NotebookPen,
  PlayCircle,
  Route,
  Scale,
  Search,
  Settings,
  Stethoscope,
  TrendingUp,
  WifiOff,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import type { OverlayName } from '../../app/overlays';

export type MenuAction = { type: 'route'; to: string } | { type: 'overlay'; name: OverlayName } | { type: 'help' };

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  action: MenuAction;
  badge?: string;
}

interface HamburgerMenuProps {
  isOpen: boolean;
  currentPath: string;
  onClose: () => void;
  onAction: (action: MenuAction) => void;
}

const ic = 'w-4.5 h-4.5 shrink-0';
const route = (to: string): MenuAction => ({ type: 'route', to });
const overlay = (name: OverlayName): MenuAction => ({ type: 'overlay', name });

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, currentPath, onClose, onAction }) => {
  const { isInstalled } = usePWAInstall();
  const update = useAppUpdate();
  const ref = useRef<HTMLElement>(null);
  useFocusTrap(ref, isOpen);

  useEscape(!!isOpen, onClose);

  const categories: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Général',
      items: [
        { label: 'Accueil', icon: <Home className={ic} />, action: route('accueil') },
        { label: 'Rechercher', icon: <Search className={ic} />, action: overlay('search') },
      ],
    },
    {
      title: 'Apprendre',
      items: [
        { label: 'Fiches pédagogiques', icon: <BookOpen className={ic} />, action: route('apprendre') },
        { label: 'Mon parcours', icon: <Route className={ic} />, action: route('apprendre/parcours') },
        { label: 'Ressources', icon: <LayoutGrid className={ic} />, action: route('ressources') },
        { label: 'Dictionnaire équestre', icon: <BookA className={ic} />, action: route('ressources/dictionnaire') },
      ],
    },
    {
      title: 'Pratiquer & réviser',
      items: [
        { label: 'Exercices interactifs', icon: <Dumbbell className={ic} />, action: route('pratiquer') },
        { label: 'Préparer une séance', icon: <CalendarCheck className={ic} />, action: route('pratiquer/preparation') },
        { label: 'Checklists', icon: <ClipboardCheck className={ic} />, action: route('pratiquer/checklists') },
        { label: 'Révisions', icon: <GraduationCap className={ic} />, action: route('reviser') },
        { label: 'Cartes mémoire', icon: <Layers className={ic} />, action: route('reviser/cartes') },
      ],
    },
    {
      title: 'Suivi',
      items: [
        { label: 'Ma progression', icon: <TrendingUp className={ic} />, action: route('progression') },
        { label: 'Diagnostic', icon: <Stethoscope className={ic} />, action: route('progression/diagnostic') },
        { label: 'Mon journal', icon: <NotebookPen className={ic} />, action: route('journal') },
        { label: 'Sauvegarde & export', icon: <HardDriveDownload className={ic} />, action: route('progression/donnees') },
      ],
    },
    {
      title: 'Aide & informations',
      items: [
        { label: 'Aide sur cet écran', icon: <CircleHelp className={ic} />, action: { type: 'help' } },
        { label: 'Revoir l’introduction', icon: <PlayCircle className={ic} />, action: overlay('onboarding') },
        ...(isInstalled ? [] : [{ label: 'Installer l’application', icon: <Download className={ic} />, action: overlay('install') }]),
        { label: 'Mode hors ligne', icon: <WifiOff className={ic} />, action: overlay('offlineGuide') },
        { label: 'Principes & déontologie', icon: <Scale className={ic} />, action: overlay('ethics') },
        { label: 'Mentions légales', icon: <FileText className={ic} />, action: overlay('legalNotice') },
      ],
    },
    {
      title: 'Système',
      items: [
        {
          label: 'Paramètres système',
          icon: <Settings className={ic} />,
          action: overlay('systemSettings'),
          badge: update.status === 'ready' ? 'MAJ' : undefined,
        },
      ],
    },
  ];

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-xs bg-[#162e24] text-stone-100 shadow-2xl flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-emerald-900/60 shrink-0">
          <span className="font-black tracking-tight">
            Equi<span className="text-amber-400">tor</span>
          </span>
          <button onClick={onClose} className="p-2 rounded-lg text-emerald-200 hover:bg-emerald-900 transition" aria-label="Fermer le menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 pb-[env(safe-area-inset-bottom)]">
          {categories.map((cat) => (
            <div key={cat.title} className="px-3 py-2">
              <h3 className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/90">{cat.title}</h3>
              <ul>
                {cat.items.map((item) => {
                  const isActive = item.action.type === 'route' && item.action.to === currentPath;
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => onAction(item.action)}
                        tabIndex={isOpen ? 0 : -1}
                        className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-left transition ${
                          isActive ? 'bg-emerald-900/80 text-amber-300 font-bold' : 'text-stone-200 hover:bg-emerald-900/50 active:bg-emerald-900'
                        }`}
                      >
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                        {item.badge && <span className="text-[9px] font-black bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="px-5 py-3 border-t border-emerald-900/60 text-[10px] text-emerald-200/60 shrink-0">v{update.current.version} · 100 % locale</div>
      </aside>
    </div>
  );
};
