import React from 'react';

interface LegalEthicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalEthicsModal: React.FC<LegalEthicsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-stone-200">
        <div className="p-4 sm:p-5 bg-[#162e24] text-white flex items-center justify-between border-b border-emerald-950">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              Cadre Pédagogique &amp; Déontologie
            </div>
            <h2 className="text-lg font-black text-white">
              Principes &amp; Déontologie de l’Application
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
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1 text-xs">
            <span className="font-bold text-stone-900 block">
              📖 Fondements pédagogiques :
            </span>
            <p className="text-stone-700">
              Synthèse originale et structurée des principes fondamentaux de l’équitation classique, de l’échelle de progression, de la biomécanique et des bonnes pratiques équestres.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm text-stone-900 mb-1">
              Contenus originaux &amp; Respect de la propriété intellectuelle
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Cette application propose des fiches synthétiques, schémas explicatifs vectoriels et questionnaires entièrement créés et rédigés de manière originale en langue française. Aucun extrait d’ouvrage sous droit d’auteur ni texte protégé n’y est reproduit.
            </p>
          </div>

          <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-rose-950 space-y-1 text-xs">
            <span className="font-bold block">
              ⚠️ Avertissement de sécurité et responsabilité :
            </span>
            <p>
              L'équitation est un sport comportant des risques inhérents. Les informations et exercices proposés sont des aides à la réflexion et à la compréhension. Ils ne remplacent en aucun cas les conseils directs d’un enseignant d’équitation diplômé d'État ni l'expertise d'un médecin vétérinaire en cas de problème de santé équine.
            </p>
          </div>

          <div className="text-[11px] text-stone-400 border-t pt-3">
            Version application : 1.0.0 • Architecture : PWA Offline-First • Moteur : React &amp; Dexie IndexedDB
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
