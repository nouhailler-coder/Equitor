import React from 'react';

interface OfflineGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineGuideModal: React.FC<OfflineGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-stone-200">
        <div className="p-4 sm:p-5 bg-[#162e24] text-white flex items-center justify-between border-b border-emerald-950">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              Architecture &amp; PWA
            </div>
            <h2 className="text-lg font-black text-white">
              Guide d’installation &amp; Mode Hors Ligne
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 text-stone-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-800 leading-relaxed">
          {/* Zero cloud guarantee */}
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-emerald-900">
              <span>🛡️</span> Garantie de confidentialité totale
            </h3>
            <p className="text-xs">
              ÉquiProgression fonctionne selon une architecture 100% locale : aucun serveur distant, aucune base de données cloud, aucun traceur ou analytics. Vos notes, vos chevaux et vos séances restent stockés exclusivement dans la mémoire interne de votre appareil (IndexedDB).
            </p>
          </div>

          {/* Installation steps */}
          <div>
            <h3 className="font-bold text-sm text-stone-900 mb-2">
              Comment installer l’application sur votre smartphone ?
            </h3>
            <div className="space-y-2 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-800 block mb-1">
                  📱 Sur Android (Google Chrome, Edge, Brave) :
                </span>
                <p className="text-stone-600">
                  Appuyez sur le menu (trois points en haut à droite) et choisissez « <strong>Installer l'application</strong> » ou « <strong>Ajouter à l'écran d'accueil</strong> ».
                </p>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-800 block mb-1">
                  🍏 Sur iPhone &amp; iPad (Safari) :
                </span>
                <p className="text-stone-600">
                  Appuyez sur l’icône de <strong>Partage</strong> en bas d'écran (carré avec une flèche vers le haut), puis sélectionnez « <strong>Sur l'écran d'accueil</strong> ».
                </p>
              </div>
            </div>
          </div>

          {/* Storage limitations */}
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-950 space-y-1 text-xs">
            <span className="font-bold block">
              ⚠️ Limites du stockage du navigateur :
            </span>
            <p>
              Les navigateurs mobiles peuvent, dans des cas extrêmes de saturation d'espace disque ou de vidage explicite du cache, purger les bases de données locales. Nous vous conseillons d'effectuer périodiquement une sauvegarde de sécurité via le bouton <strong>Exporter mes données (JSON)</strong>.
            </p>
          </div>
        </div>

        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
