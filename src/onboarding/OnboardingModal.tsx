import React, { useEffect, useRef, useState } from 'react';
import { legalNotice } from '../legal/legalContent';
import { LegalSections } from '../legal/LegalSections';
import { acknowledgeLegalNotice } from '../legal/legalStorage';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallGuideModal } from '../components/common/InstallGuideModal';

interface OnboardingModalProps {
  isOpen: boolean;
  /** Appelé après « J'ai compris » (acceptation enregistrée). */
  onComplete: () => void;
}

const FEATURES = [
  { icon: '🏠', title: 'Accueil', text: 'Reprenez votre dernière fiche, suivez un parcours et voyez vos statistiques.' },
  { icon: '📚', title: 'Apprendre', text: '18 modules, des fiches illustrées et un glossaire équestre.' },
  { icon: '📋', title: 'Pratiquer', text: 'Checklists d’écurie, journal de séances et fiches de vos chevaux.' },
  { icon: '💡', title: 'Réviser', text: 'Quiz commentés et flashcards pour ancrer les notions.' },
  { icon: '👤', title: 'Mon suivi', text: 'Progression, favoris et sauvegarde de vos données.' },
];

const STEP_COUNT = 4;
const LEGAL_STEP = STEP_COUNT - 1;

/**
 * Onboarding de premier lancement : présentation (3 étapes) puis avertissement légal
 * obligatoire. « Voir les détails » ouvre les mentions complètes comme seconde page de
 * cette modale (une modale séparée s'afficherait derrière celle-ci).
 */
export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  useFocusTrap(dialogRef, isOpen && !showInstallGuide, `${step}-${showDetails}`);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setShowDetails(false);
    }
  }, [isOpen]);

  // Retour Android : ferme les détails plutôt que de quitter la page.
  useEffect(() => {
    if (!showDetails) return;
    const onPop = () => setShowDetails(false);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [showDetails]);

  if (!isOpen) return null;

  const openDetails = () => {
    window.history.pushState({ legalDetails: true }, '');
    setShowDetails(true);
  };
  // Fermeture depuis l'app : on dépile l'entrée ajoutée (le popstate ferme les détails).
  const closeDetails = () => window.history.back();

  const accept = () => {
    if (showDetails) window.history.back();
    acknowledgeLegalNotice();
    onComplete();
  };

  const handleInstall = async () => {
    if (isInstallable && (await install())) return;
    setShowInstallGuide(true);
  };

  const isLegal = step === LEGAL_STEP;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0f1d17]/90 backdrop-blur-sm p-3 sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)]"
      >
        {/* Progress */}
        <div className="flex items-center justify-between px-5 pt-4 shrink-0">
          <div className="flex gap-1.5" aria-label={`Étape ${step + 1} sur ${STEP_COUNT}`}>
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-amber-500' : i < step ? 'w-3 bg-emerald-700' : 'w-3 bg-stone-200'
                }`}
              />
            ))}
          </div>
          {!isLegal && (
            <button
              onClick={() => setStep(LEGAL_STEP)}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-2 py-1 rounded"
            >
              Passer
            </button>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 0 && (
            <div className="text-center space-y-4 py-2">
              <img src="/logo.svg" alt="Logo ÉquiProgression" className="w-24 h-24 mx-auto rounded-3xl shadow-lg" />
              <h2 id="onboarding-title" className="text-2xl font-black text-stone-900 tracking-tight">
                Bienvenue sur Équi<span className="text-amber-600">Progression</span>
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Votre carnet d’apprentissage équestre : comprendre les principes de l’équitation
                classique, préparer vos séances à l’écurie et suivre votre progression.
              </p>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-emerald-900">
                <span className="bg-emerald-50 rounded-xl py-2">🔒 100 % local</span>
                <span className="bg-emerald-50 rounded-xl py-2">📶 Hors ligne</span>
                <span className="bg-emerald-50 rounded-xl py-2">🚫 Sans compte</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <h2 id="onboarding-title" className="text-xl font-black text-stone-900">Comment ça marche ?</h2>
              <p className="text-sm text-stone-600">
                La barre en bas de l’écran donne accès aux 5 espaces ; le menu ☰ en haut à gauche les
                regroupe tous, avec l’aide et les paramètres.
              </p>
              <ul className="space-y-2">
                {FEATURES.map((f) => (
                  <li key={f.title} className="flex gap-3 items-start rounded-xl border border-stone-200 p-2.5">
                    <span className="text-xl" aria-hidden="true">{f.icon}</span>
                    <span className="text-sm">
                      <strong className="block text-stone-900">{f.title}</strong>
                      <span className="text-stone-600 text-xs">{f.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-stone-500 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                💬 Repérez les icônes <strong>ⓘ</strong> et le bouton <strong>?</strong> en haut de l’écran :
                ils expliquent chaque écran.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 id="onboarding-title" className="text-xl font-black text-stone-900">Installez l’application</h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Ajoutez ÉquiProgression à l’écran d’accueil de votre téléphone ou à votre ordinateur :
                elle s’ouvrira d’un geste, en plein écran, et fonctionnera même sans réseau au fond du
                manège.
              </p>
              {isInstalled ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-sm font-medium">
                  ✅ L’application est déjà installée sur cet appareil.
                </div>
              ) : (
                <button
                  onClick={() => void handleInstall()}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow transition active:scale-95"
                >
                  📲 Installer l’application
                </button>
              )}
              <div className="text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-1">
                <p>
                  🔒 <strong>Vos données restent sur votre appareil</strong> : aucun compte, aucun serveur.
                </p>
                <p>💾 Pensez à exporter une sauvegarde de temps en temps (Mon suivi → Sauvegarde).</p>
                <p>🔄 Les mises à jour s’installent automatiquement en arrière-plan.</p>
              </div>
            </div>
          )}

          {isLegal && !showDetails && (
            <div className="space-y-3">
              <h2 id="onboarding-title" className="text-xl font-black text-stone-900">{legalNotice.title}</h2>
              <div className="space-y-2.5 text-sm text-stone-700 leading-relaxed">
                {legalNotice.shortWarning.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {isLegal && showDetails && (
            <div className="space-y-3">
              <button
                onClick={closeDetails}
                className="text-sm font-semibold text-emerald-800 hover:underline"
              >
                ← Retour
              </button>
              <h2 id="onboarding-title" className="text-xl font-black text-stone-900">Mentions légales</h2>
              <LegalSections />
            </div>
          )}
        </div>

        {/* Actions — toujours visibles en bas, sans défilement */}
        <div className="shrink-0 border-t border-stone-100 bg-stone-50 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2">
          {isLegal ? (
            <>
              <button
                onClick={accept}
                data-autofocus
                className="w-full py-3 rounded-xl bg-[#162e24] hover:bg-emerald-900 text-white font-black text-base shadow transition active:scale-95"
              >
                J’ai compris
              </button>
              {!showDetails && (
                <button
                  onClick={openDetails}
                  className="w-full py-1.5 text-sm font-semibold text-emerald-800 underline underline-offset-2"
                >
                  Voir les détails
                </button>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Précédent
                </button>
              )}
              <button
                onClick={() => setStep(step + 1)}
                data-autofocus
                className="flex-1 py-3 rounded-xl bg-[#162e24] hover:bg-emerald-900 text-white font-bold shadow transition active:scale-95"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      <InstallGuideModal isOpen={showInstallGuide} onClose={() => setShowInstallGuide(false)} zClass="z-[80]" />
    </div>
  );
};
