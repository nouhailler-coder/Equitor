import React, { useEffect } from 'react';
import { LegalSections } from './LegalSections';

interface LegalNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Écran « Mentions légales » accessible en permanence (menu ☰ et Paramètres système). */
export const LegalNoticeModal: React.FC<LegalNoticeModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-page-title"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-stone-200"
      >
        <div className="p-4 sm:p-5 bg-[#162e24] text-white flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Informations légales</div>
            <h2 id="legal-page-title" className="text-lg font-black">Mentions légales</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 text-stone-300 hover:text-white"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto">
          <LegalSections />
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
    </div>
  );
};
