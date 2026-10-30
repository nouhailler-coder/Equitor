import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { InstallGuideModal } from '../common/InstallGuideModal';

/**
 * Bouton « Installer l'App » toujours visible tant que l'application n'est pas installée.
 * Lance l'installation native si le navigateur la propose, sinon ouvre le guide pas à pas.
 */
export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (isInstallable && (await install())) return;
    setShowGuide(true);
  };

  return (
    <>
      <button
        onClick={() => void handleClick()}
        className={`flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-sm transition active:scale-95 ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
        }`}
        title="Ajouter l’application à l’écran d’accueil ou au bureau"
        aria-label="Installer l’application"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className={compact ? 'hidden sm:inline' : ''}>Installer l’App</span>
      </button>
      <InstallGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
};
