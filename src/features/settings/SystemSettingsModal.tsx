import React, { useState } from 'react';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import { resetLegalNotice } from '../../legal/legalStorage';
import { applyTheme, readThemePreference } from '../../app/theme';
import { saveSettings } from '../../services/storage/repos';
import type { ThemePreference } from '../../types/models';
import { resetScreenGuides } from '../../onboarding/ScreenGuideSheet';
import {
  applyUpdate,
  checkForUpdates,
  forceUpdate,
  setAutoUpdate,
  type UpdateStatus,
} from '../../pwa/updateManager';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegalNotice: () => void;
}

const formatDate = (iso: string | null) => {
  if (!iso) return 'Jamais';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const STATUS_LABELS: Record<UpdateStatus, { text: string; tone: string }> = {
  idle: { text: 'En attente de vérification', tone: 'bg-stone-100 text-stone-700 border-stone-200' },
  checking: { text: 'Vérification en cours…', tone: 'bg-sky-50 text-sky-800 border-sky-200' },
  'up-to-date': { text: 'Application à jour', tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  downloading: { text: 'Nouvelle version en téléchargement…', tone: 'bg-sky-50 text-sky-800 border-sky-200' },
  ready: { text: 'Nouvelle version prête à être installée', tone: 'bg-amber-50 text-amber-900 border-amber-300' },
  offline: { text: 'Hors ligne — vérification impossible', tone: 'bg-stone-100 text-stone-700 border-stone-200' },
  error: { text: 'Échec de la vérification', tone: 'bg-red-50 text-red-800 border-red-200' },
  unsupported: { text: 'Mises à jour non prises en charge par ce navigateur', tone: 'bg-stone-100 text-stone-700 border-stone-200' },
};

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({ isOpen, onClose, onOpenLegalNotice }) => {
  const update = useAppUpdate();
  const [confirmForce, setConfirmForce] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>(readThemePreference);
  const [isForcing, setIsForcing] = useState(false);

  if (!isOpen) return null;

  const status = STATUS_LABELS[update.status];
  const busy = update.status === 'checking' || isForcing;

  const handleForce = async () => {
    setIsForcing(true);
    try {
      await forceUpdate();
    } finally {
      setIsForcing(false);
      setConfirmForce(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-stone-200">
        <div className="p-4 sm:p-5 bg-[#162e24] text-white flex items-center justify-between border-b border-emerald-950">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              Système
            </div>
            <h2 className="text-lg font-black text-white">Paramètres système</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 text-stone-300 hover:text-white"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-800">
          {/* Version information */}
          <section className="rounded-xl border border-stone-200 divide-y divide-stone-100">
            <div className="flex items-center justify-between gap-3 p-3">
              <span className="text-stone-500">Version installée</span>
              <span className="font-bold text-stone-900">v{update.current.version}</span>
            </div>
            <div className="flex items-center justify-between gap-3 p-3">
              <span className="text-stone-500">Date de sortie</span>
              <span className="font-semibold text-stone-900 text-right">
                {formatDate(update.current.buildDate)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 p-3">
              <span className="text-stone-500">Dernière vérification</span>
              <span className="font-semibold text-stone-900 text-right">
                {formatDate(update.lastCheck)}
              </span>
            </div>
            {update.remote && update.remote.buildDate !== update.current.buildDate && (
              <div className="flex items-center justify-between gap-3 p-3 bg-amber-50/60">
                <span className="text-stone-500">Version disponible</span>
                <span className="font-semibold text-amber-900 text-right">
                  v{update.remote.version} · {formatDate(update.remote.buildDate)}
                </span>
              </div>
            )}
          </section>

          {/* Status */}
          <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 font-medium ${status.tone}`}>
            <span
              className={`w-2 h-2 rounded-full bg-current shrink-0 ${
                update.status === 'checking' || update.status === 'downloading' ? 'animate-pulse' : ''
              }`}
            />
            <span>{status.text}</span>
          </div>
          {update.status === 'error' && update.errorMessage && (
            <p className="text-[11px] text-red-700 -mt-2">{update.errorMessage}</p>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {update.status === 'ready' ? (
              <button
                onClick={() => void applyUpdate()}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition active:scale-95"
              >
                Installer maintenant
              </button>
            ) : (
              <button
                onClick={() => void checkForUpdates()}
                disabled={busy || update.status === 'unsupported'}
                className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition active:scale-95"
              >
                {update.status === 'checking' ? 'Vérification…' : 'Vérifier les mises à jour'}
              </button>
            )}

            {confirmForce ? (
              <button
                onClick={() => void handleForce()}
                disabled={isForcing}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold transition active:scale-95"
              >
                {isForcing ? 'Mise à jour…' : 'Confirmer et recharger'}
              </button>
            ) : (
              <button
                onClick={() => setConfirmForce(true)}
                disabled={busy}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 disabled:opacity-50 border border-stone-300 text-stone-800 font-semibold transition active:scale-95"
              >
                Forcer la mise à jour
              </button>
            )}
          </div>
          {confirmForce && (
            <p className="text-[11px] text-stone-600 bg-stone-50 border border-stone-200 rounded-lg p-2.5">
              Le cache hors ligne de l’application va être vidé puis la dernière version rechargée depuis
              le réseau. Vos chevaux, séances, progression et favoris (IndexedDB) sont conservés.{' '}
              <button onClick={() => setConfirmForce(false)} className="underline font-semibold">
                Annuler
              </button>
            </p>
          )}

          {/* Auto-update toggle */}
          <label className="flex items-start gap-3 rounded-xl border border-stone-200 p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={update.autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-emerald-700"
            />
            <span>
              <span className="block font-semibold text-stone-900">Mises à jour automatiques</span>
              <span className="block text-[11px] text-stone-500 leading-relaxed">
                Vérification toutes les heures et au retour en ligne. Les nouvelles versions sont
                téléchargées en arrière-plan puis installées au prochain lancement ou lorsque
                l’application passe en arrière-plan, sans interrompre votre saisie.
              </span>
            </span>
          </label>

          {/* Theme */}
          <fieldset className="rounded-xl border border-stone-200 p-3">
            <legend className="px-1 font-semibold text-stone-900">Apparence</legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Thème">
              {([
                ['clair', '☀️ Clair'],
                ['sombre', '🌙 Sombre'],
                ['auto', '🖥️ Auto'],
              ] as [ThemePreference, string][]).map(([id, l]) => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={theme === id}
                  onClick={() => {
                    setTheme(id);
                    applyTheme(id);
                    void saveSettings({ theme: id });
                  }}
                  className={`rounded-xl border-2 py-2 text-xs font-semibold ${theme === id ? 'border-emerald-700 bg-emerald-50' : 'border-stone-200'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500 mt-2">« Auto » suit le réglage clair/sombre de votre appareil.</p>
          </fieldset>

          {/* Legal */}
          <button
            onClick={onOpenLegalNotice}
            className="w-full flex items-center justify-between rounded-xl border border-stone-200 p-3 hover:bg-stone-50 transition text-left"
          >
            <span className="font-semibold text-stone-900">📄 Mentions légales</span>
            <span className="text-stone-400" aria-hidden="true">›</span>
          </button>

          {/* Developer-only reset to replay the first launch */}
          {import.meta.env.DEV && (
            <button
              onClick={() => {
                resetLegalNotice();
                resetScreenGuides();
                window.location.reload();
              }}
              className="w-full rounded-xl border border-dashed border-red-300 text-red-700 p-2.5 text-xs font-semibold"
            >
              🛠️ [DEV] Réinitialiser les mentions légales et l’onboarding
            </button>
          )}
        </div>

        <div className="p-4 border-t border-stone-100 bg-stone-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#162e24] hover:bg-emerald-900 text-white font-semibold transition text-xs sm:text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
