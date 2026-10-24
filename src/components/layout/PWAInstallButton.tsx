import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium shadow-sm transition active:scale-95 ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm'
        }`}
        title="Installer l’application sur cet appareil pour un accès direct hors ligne"
      >
        <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Installer l’App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 font-medium transition active:scale-95 ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
          title="Guide d’installation sur iPhone ou iPad"
        >
          <svg className="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .61-2.63 1.35-.55.63-.99 1.68-.87 2.7.99.08 2-.45 2.58-1.2z" />
          </svg>
          <span>Installer sur iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-stone-900 border border-stone-700 p-6 text-stone-100 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-900/80 text-emerald-400 flex items-center justify-center font-bold">
                    📲
                  </span>
                  <h3 className="font-bold text-base text-stone-100">Installer sur iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-stone-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 space-y-3 text-xs sm:text-sm text-stone-300">
                <div className="flex items-start gap-3 bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </span>
                  <p>
                    Ouvrez la barre d’outils Safari et appuyez sur l’icône <strong>Partager</strong> (le carré avec une flèche vers le haut).
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </span>
                  <p>
                    Faites défiler la liste vers le bas et sélectionnez <strong>Sur l’écran d’accueil</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </span>
                  <p>
                    Validez en appuyant sur <strong>Ajouter</strong> en haut à droite. L’icône apparaîtra sur votre écran d’accueil et fonctionnera hors ligne !
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 font-semibold text-white transition text-xs sm:text-sm"
              >
                Compris, fermer
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
