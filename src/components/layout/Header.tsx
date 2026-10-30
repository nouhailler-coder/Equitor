import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useAppUpdate } from '../../hooks/useAppUpdate';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenOfflineGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu, onOpenSearch, onOpenOfflineGuide }) => {
  const isOnline = useOnlineStatus();
  const { status: updateStatus } = useAppUpdate();

  return (
    <header className="sticky top-0 z-40 bg-[#162e24] text-stone-100 border-b border-emerald-900/60 shadow-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Hamburger + Brand identity */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMenu}
            className="relative -ml-1.5 p-2 rounded-lg text-emerald-100 hover:bg-emerald-900 transition"
            title="Menu"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {updateStatus === 'ready' && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#162e24]" />
            )}
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-inner text-[#162e24] font-black text-lg">
            🐎
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight leading-none text-white">
              Équi<span className="text-amber-400">Progression</span>
            </h1>
            <p className="text-[10px] text-emerald-200/70 font-medium tracking-wide">
              Équitation Classique • 100% Locale
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Offline status indicator button */}
          <button
            onClick={onOpenOfflineGuide}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border transition ${
              isOnline
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                : 'bg-amber-950/90 border-amber-600 text-amber-300 animate-pulse'
            }`}
            title="Cliquez pour voir les informations de fonctionnement hors ligne"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}
            />
            <span className="hidden xs:inline">{isOnline ? 'Hors ligne prêt' : 'Hors ligne actif'}</span>
          </button>

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 transition border border-emerald-800/60"
            title="Rechercher une notion, un chapitre ou une fiche"
            aria-label="Recherche"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* In-app install button */}
          <PWAInstallButton compact />
        </div>
      </div>
    </header>
  );
};
