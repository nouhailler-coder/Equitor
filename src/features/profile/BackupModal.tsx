import React, { useState } from 'react';
import { exportDatabaseBackup, validateBackupJson, importDatabaseBackup, resetAllUserData } from '../../db';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onDataChanged }) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [pendingData, setPendingData] = useState<any | null>(null);
  const [overwriteOption, setOverwriteOption] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const data = await exportDatabaseBackup();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `equi_progression_sauvegarde_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setImportStatus('✅ Sauvegarde JSON téléchargée avec succès.');
    } catch (err) {
      setImportStatus('❌ Erreur lors de l’exportation locale.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = validateBackupJson(text);
      if (!res.preview.valid) {
        setImportStatus(`❌ Fichier invalide : ${res.preview.error}`);
        setPreview(null);
        setPendingData(null);
      } else {
        setPreview(res.preview);
        setPendingData(res.data);
        setImportStatus(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!pendingData) return;
    try {
      await importDatabaseBackup(pendingData, overwriteOption);
      setImportStatus('✅ Restauration effectuée avec succès !');
      setPreview(null);
      setPendingData(null);
      onDataChanged();
    } catch (err) {
      setImportStatus('❌ Erreur lors de l’importation.');
    }
  };

  const handleResetData = async () => {
    await resetAllUserData();
    setShowResetConfirm(false);
    setImportStatus('🧹 Toutes les données locales ont été effacées.');
    onDataChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#162e24] text-white flex items-center justify-between border-b border-emerald-950">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              Confidentialité &amp; Données
            </div>
            <h2 className="text-lg font-black text-white">
              Sauvegarde et Restauration Locale (JSON)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 text-stone-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-stone-800 text-xs sm:text-sm">
          {importStatus && (
            <div className="p-3 bg-stone-100 border border-stone-300 rounded-xl font-medium text-stone-800">
              {importStatus}
            </div>
          )}

          {/* Section Export */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <h3 className="font-bold text-sm text-[#162e24] flex items-center gap-1.5">
              <span>💾</span> Exporter mes données locales
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Téléchargez un fichier JSON complet contenant vos chevaux, vos séances du journal, vos favoris et vos résultats de quiz. Vous gardez la maîtrise absolue de vos données.
            </p>
            <button
              onClick={handleExport}
              className="mt-2 px-4 py-2 rounded-xl bg-[#162e24] hover:bg-[#1e3f31] text-white font-bold text-xs transition shadow-xs"
            >
              Télécharger ma sauvegarde locale (.json)
            </button>
          </div>

          {/* Section Import */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
            <h3 className="font-bold text-sm text-[#162e24] flex items-center gap-1.5">
              <span>📂</span> Restaurer une sauvegarde
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Sélectionnez un fichier JSON de sauvegarde précédemment généré par ÉquiProgression.
            </p>

            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-900 hover:file:bg-emerald-200 cursor-pointer"
            />

            {/* Preview modal before applying */}
            {preview && preview.valid && (
              <div className="bg-white p-3.5 rounded-xl border border-amber-300 space-y-2 text-xs">
                <div className="font-bold text-amber-950 flex items-center gap-1">
                  <span>🔍</span> Résumé du contenu de la sauvegarde :
                </div>
                <ul className="grid grid-cols-2 gap-1 text-stone-700">
                  <li>• Chevaux : <strong>{preview.horsesCount}</strong></li>
                  <li>• Séances : <strong>{preview.sessionsCount}</strong></li>
                  <li>• Quiz enregistrés : <strong>{preview.quizCount}</strong></li>
                  <li>• Fiches suivies : <strong>{preview.progressCount}</strong></li>
                </ul>

                <div className="pt-2 border-t border-stone-200 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="overwrite"
                    checked={overwriteOption}
                    onChange={(e) => setOverwriteOption(e.target.checked)}
                    className="rounded text-emerald-800"
                  />
                  <label htmlFor="overwrite" className="text-stone-700">
                    Remplacer toutes les données actuelles (au lieu de fusionner)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      setPreview(null);
                      setPendingData(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    className="px-4 py-1.5 rounded-lg bg-emerald-800 text-white font-bold text-xs"
                  >
                    Confirmer l’importation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section Danger Zone / Purge */}
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-2">
            <h3 className="font-bold text-sm text-rose-950 flex items-center gap-1.5">
              <span>⚠️</span> Zone de réinitialisation
            </h3>
            <p className="text-rose-900 text-xs leading-relaxed">
              Effacer l’ensemble de vos chevaux, séances, favoris et progression locale de ce navigateur.
            </p>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="mt-1 px-3 py-1.5 rounded-lg bg-rose-700 text-white font-bold text-xs hover:bg-rose-800 transition"
              >
                Effacer toutes mes données locales
              </button>
            ) : (
              <div className="p-3 bg-white rounded-lg border border-rose-300 space-y-2 text-xs">
                <p className="font-bold text-rose-800">
                  Êtes-vous certain ? Cette action est irréversible.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 rounded border text-stone-700"
                  >
                    Non, annuler
                  </button>
                  <button
                    onClick={handleResetData}
                    className="px-3 py-1 rounded bg-rose-700 text-white font-bold"
                  >
                    Oui, effacer définitivement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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
