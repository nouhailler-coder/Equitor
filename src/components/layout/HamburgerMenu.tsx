import React, { useEffect } from 'react';
import {
  BookOpen,
  ClipboardCheck,
  Download,
  GraduationCap,
  HardDriveDownload,
  Home,
  NotebookPen,
  PlusCircle,
  Scale,
  Search,
  Settings,
  User,
  WifiOff,
  X,
} from 'lucide-react';
import type { TabType } from './Navigation';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useAppUpdate } from '../../hooks/useAppUpdate';

export type MenuAction =
  | { type: 'tab'; tab: TabType }
  | {
      type: 'modal';
      modal:
        | 'search'
        | 'newSession'
        | 'checklists'
        | 'horses'
        | 'backup'
        | 'offlineGuide'
        | 'legal'
        | 'systemSettings';
    };

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  action: MenuAction;
  badge?: string;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

interface HamburgerMenuProps {
  isOpen: boolean;
  currentTab: TabType;
  onClose: () => void;
  onAction: (action: MenuAction) => void;
}

const iconClass = 'w-4.5 h-4.5 shrink-0';

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, currentTab, onClose, onAction }) => {
  const { isInstallable, install } = usePWAInstall();
  const update = useAppUpdate();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const categories: MenuCategory[] = [
    {
      title: 'Général',
      items: [
        { label: 'Accueil', icon: <Home className={iconClass} />, action: { type: 'tab', tab: 'accueil' } },
        { label: 'Rechercher', icon: <Search className={iconClass} />, action: { type: 'modal', modal: 'search' } },
      ],
    },
    {
      title: 'Apprendre',
      items: [
        { label: 'Bibliothèque des modules', icon: <BookOpen className={iconClass} />, action: { type: 'tab', tab: 'apprendre' } },
      ],
    },
    {
      title: 'Pratiquer à l’écurie',
      items: [
        { label: 'Journal des séances', icon: <NotebookPen className={iconClass} />, action: { type: 'tab', tab: 'pratiquer' } },
        { label: 'Nouvelle séance', icon: <PlusCircle className={iconClass} />, action: { type: 'modal', modal: 'newSession' } },
        { label: 'Checklists d’écurie', icon: <ClipboardCheck className={iconClass} />, action: { type: 'modal', modal: 'checklists' } },
        { label: 'Mes chevaux', icon: <span className="w-4.5 text-center shrink-0">🐴</span>, action: { type: 'modal', modal: 'horses' } },
      ],
    },
    {
      title: 'Réviser',
      items: [
        { label: 'Quiz & flashcards', icon: <GraduationCap className={iconClass} />, action: { type: 'tab', tab: 'reviser' } },
      ],
    },
    {
      title: 'Suivi & données',
      items: [
        { label: 'Mon suivi', icon: <User className={iconClass} />, action: { type: 'tab', tab: 'suivi' } },
        { label: 'Sauvegarde & restauration', icon: <HardDriveDownload className={iconClass} />, action: { type: 'modal', modal: 'backup' } },
      ],
    },
    {
      title: 'Aide & informations',
      items: [
        { label: 'Hors ligne & installation', icon: <WifiOff className={iconClass} />, action: { type: 'modal', modal: 'offlineGuide' } },
        { label: 'Mentions légales & éthique', icon: <Scale className={iconClass} />, action: { type: 'modal', modal: 'legal' } },
      ],
    },
    {
      title: 'Système',
      items: [
        {
          label: 'Paramètres système',
          icon: <Settings className={iconClass} />,
          action: { type: 'modal', modal: 'systemSettings' },
          badge: update.status === 'ready' ? 'MAJ' : undefined,
        },
      ],
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-xs bg-[#162e24] text-stone-100 shadow-2xl flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-emerald-900/60 shrink-0">
          <span className="font-black tracking-tight">
            Équi<span className="text-amber-400">Progression</span>
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-emerald-200 hover:bg-emerald-900 transition"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 pb-[env(safe-area-inset-bottom)]">
          {categories.map((cat) => (
            <div key={cat.title} className="px-3 py-2">
              <h3 className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                {cat.title}
              </h3>
              <ul>
                {cat.items.map((item) => {
                  const isActive = item.action.type === 'tab' && item.action.tab === currentTab;
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => onAction(item.action)}
                        className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-left transition ${
                          isActive
                            ? 'bg-emerald-900/80 text-amber-300 font-bold'
                            : 'text-stone-200 hover:bg-emerald-900/50 active:bg-emerald-900'
                        }`}
                      >
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-black bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
                {cat.title === 'Système' && isInstallable && (
                  <li>
                    <button
                      onClick={async () => {
                        onClose();
                        await install();
                      }}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-left text-stone-200 hover:bg-emerald-900/50 transition"
                    >
                      <Download className={iconClass} />
                      <span className="flex-1">Installer l’application</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>

        <div className="px-5 py-3 border-t border-emerald-900/60 text-[10px] text-emerald-200/60 shrink-0">
          v{update.current.version} · 100 % locale
        </div>
      </aside>
    </div>
  );
};
