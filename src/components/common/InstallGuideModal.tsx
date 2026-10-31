import React, { useEffect, useState } from 'react';
import { useEscape } from '../../hooks/useEscape';
import { createPortal } from 'react-dom';
import { usePWAInstall, type InstallPlatform } from '../../hooks/usePWAInstall';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Permet de s'afficher au-dessus de l'onboarding. */
  zClass?: string;
}

const PLATFORM_TABS: { id: InstallPlatform; label: string; icon: string }[] = [
  { id: 'android', label: 'Android', icon: '🤖' },
  { id: 'ios', label: 'iPhone / iPad', icon: '🍎' },
  { id: 'desktop', label: 'Ordinateur', icon: '💻' },
];

const GUIDES: Record<InstallPlatform, { browser: string; steps: string[] }[]> = {
  android: [
    {
      browser: 'Chrome',
      steps: [
        'Touchez le menu ⋮ en haut à droite.',
        'Choisissez « Installer l’application » (ou « Ajouter à l’écran d’accueil »).',
        'Confirmez avec « Installer ». L’icône apparaît sur votre écran d’accueil.',
      ],
    },
    {
      browser: 'Samsung Internet',
      steps: [
        'Touchez le menu ≡ en bas à droite.',
        'Choisissez « Ajouter page à » puis « Écran d’accueil ».',
        'Confirmez avec « Ajouter ».',
      ],
    },
    {
      browser: 'Firefox',
      steps: ['Touchez le menu ⋮.', 'Choisissez « Installer ».', 'Confirmez l’ajout à l’écran d’accueil.'],
    },
  ],
  ios: [
    {
      browser: 'Safari',
      steps: [
        'Touchez le bouton Partager (carré avec une flèche vers le haut) dans la barre d’outils.',
        'Faites défiler et choisissez « Sur l’écran d’accueil ».',
        'Touchez « Ajouter » en haut à droite. L’application s’ouvre ensuite en plein écran, même hors ligne.',
      ],
    },
    {
      browser: 'Chrome (iOS 16.4 et plus)',
      steps: [
        'Touchez l’icône Partager à droite de la barre d’adresse.',
        'Choisissez « Sur l’écran d’accueil ».',
        'Touchez « Ajouter ».',
      ],
    },
  ],
  desktop: [
    {
      browser: 'Chrome',
      steps: [
        'Cliquez sur l’icône d’installation (écran avec une flèche) à droite de la barre d’adresse.',
        'Ou : menu ⋮ → « Caster, enregistrer et partager » → « Installer la page en tant qu’application ».',
        'Cliquez sur « Installer ». L’application s’ouvre dans sa propre fenêtre.',
      ],
    },
    {
      browser: 'Edge',
      steps: [
        'Cliquez sur le menu ··· en haut à droite.',
        'Choisissez « Applications » → « Installer ce site en tant qu’application ».',
        'Cliquez sur « Installer ».',
      ],
    },
    {
      browser: 'Safari (macOS Sonoma et plus)',
      steps: ['Menu « Fichier » → « Ajouter au Dock ».', 'Cliquez sur « Ajouter ».'],
    },
    {
      browser: 'Firefox',
      steps: [
        'Firefox pour ordinateur ne sait pas installer les applications web.',
        'Ouvrez cette page dans Chrome ou Edge pour l’installer, ou ajoutez-la simplement à vos favoris.',
      ],
    },
  ],
};

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose, zClass = 'z-[60]' }) => {
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();
  const [tab, setTab] = useState<InstallPlatform>(platform);

  useEffect(() => {
    if (isOpen) setTab(platform);
  }, [isOpen, platform]);

  useEscape(!!isOpen, onClose);

  if (!isOpen) return null;

  // Portail vers <body> : ouvert depuis l'en-tête (sticky, z-40), la modale resterait sinon
  // piégée dans son contexte d'empilement, sous la barre de navigation.
  return createPortal(
    <div className={`fixed inset-0 ${zClass} flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4`}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-guide-title"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-stone-200"
      >
        <div className="p-4 sm:p-5 bg-[#162e24] text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="w-10 h-10 rounded-xl" />
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Application</div>
              <h2 id="install-guide-title" className="text-lg font-black">
                Installer Equitor
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 text-stone-300 hover:text-white"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm text-stone-800">
          {isInstalled ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 font-medium">
              ✅ L’application est déjà installée sur cet appareil.
            </div>
          ) : (
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Installer l’application ajoute une icône sur votre écran d’accueil ou votre bureau : elle
              s’ouvre en plein écran, d’un seul geste, et fonctionne <strong>sans connexion</strong> à
              l’écurie. Rien n’est téléchargé depuis un store, et vos données restent sur l’appareil.
            </p>
          )}

          {isInstallable && !isInstalled && (
            <button
              onClick={async () => {
                if (await install()) onClose();
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-base shadow transition active:scale-95"
            >
              📲 Installer en un clic
            </button>
          )}

          {!isInstalled && (
            <>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                  {isInstallable ? 'Ou manuellement, selon votre appareil' : 'Choisissez votre appareil'}
                </p>
                <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1 rounded-xl" role="tablist">
                  {PLATFORM_TABS.map((t) => (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={tab === t.id}
                      onClick={() => setTab(t.id)}
                      className={`py-2 rounded-lg text-xs font-semibold transition ${
                        tab === t.id ? 'bg-white shadow text-emerald-900' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <span aria-hidden="true">{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {GUIDES[tab].map((g) => (
                  <div key={g.browser} className="rounded-xl border border-stone-200 p-3">
                    <h3 className="font-bold text-stone-900 text-sm mb-2">{g.browser}</h3>
                    <ol className="space-y-1.5">
                      {g.steps.map((s, i) => (
                        <li key={i} className="flex gap-2 text-xs sm:text-sm text-stone-700">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-3 border-t border-stone-100 bg-stone-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#162e24] hover:bg-emerald-900 text-white font-semibold text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
