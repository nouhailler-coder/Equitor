import React, { useEffect, useState } from 'react';
import { Download, FileJson, Printer, ShieldCheck, Trash2, Upload } from 'lucide-react';
import type { Horse, JournalEntry, UserProfile } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db, requestPersistentStorage } from '../../services/storage/db';
import {
  TABLE_LABELS,
  downloadBackup,
  exportBackup,
  importBackup,
  resetAllUserData,
  validateBackup,
  type BackupData,
  type BackupPreview,
  type ImportMode,
} from '../../services/backup/backup';
import { safeWrite, toast } from '../../services/feedback/toast';
import { printFlashcards, printJournal, printProgress } from '../../services/export/print';
import { FLASHCARDS } from '../../data/flashcards';
import { ConfirmDialog, PageHeader, btn, card } from '../../components/ui/kit';
import { useLearningData } from './ProgressionView';
import type { UserTable } from '../../services/storage/db';

const LS_LAST_EXPORT = 'equi.backup.lastExport';

export const DataView: React.FC = () => {
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [usage, setUsage] = useState<string>('');
  const [preview, setPreview] = useState<{ preview: BackupPreview; data: BackupData; fileName: string } | null>(null);
  const [mode, setMode] = useState<ImportMode>('fusion');
  const [confirmImport, setConfirmImport] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState('');
  const [lastExport, setLastExport] = useState(() => {
    try {
      return localStorage.getItem(LS_LAST_EXPORT);
    } catch {
      return null;
    }
  });
  const entries = useLive(() => db.ridingSessions.orderBy('date').reverse().toArray(), [], [] as JournalEntry[]);
  const horses = useLive(() => db.horses.toArray(), [], [] as Horse[]);
  const profile = useLive(async () => (await db.profile.get('me')) ?? null, [], null as UserProfile | null);
  const { skills, attempts, stats } = useLearningData();

  useEffect(() => {
    void navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null));
    void navigator.storage?.estimate?.().then((e) => {
      if (e.usage !== undefined) setUsage(`${(e.usage / 1024 / 1024).toFixed(1)} Mo utilisés`);
    });
  }, []);

  const doExport = async (suffix = '') => {
    const file = await safeWrite(() => exportBackup(__APP_VERSION__));
    if (!file) return false;
    downloadBackup(file, suffix);
    try {
      localStorage.setItem(LS_LAST_EXPORT, file.exportedAt);
    } catch {
      // ignore
    }
    setLastExport(file.exportedAt);
    toast('Sauvegarde téléchargée');
    return true;
  };

  const onFile = async (f: File | undefined) => {
    setError('');
    setPreview(null);
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) {
      setError('Fichier trop volumineux (plus de 50 Mo) : ce n’est probablement pas une sauvegarde ÉquiProgression.');
      return;
    }
    const res = await validateBackup(await f.text());
    if (!res.ok) setError(res.error);
    else setPreview({ preview: res.preview, data: res.data, fileName: f.name });
  };

  const runImport = async () => {
    if (!preview) return;
    // Filet de sécurité : copie des données actuelles avant tout remplacement.
    if (mode === 'remplacement' && !(await doExport('_avant_restauration'))) return;
    const ok = await safeWrite(async () => {
      await importBackup(preview.data, mode);
      return true;
    }, mode === 'fusion' ? 'Sauvegarde fusionnée avec vos données' : 'Données restaurées');
    if (ok) setPreview(null);
    setConfirmImport(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Mes données" icon="💾" back="progression" subtitle="Tout est stocké sur cet appareil, rien n’est envoyé" />

      <section className={`${card} p-4 space-y-3`}>
        <h2 className="font-black text-stone-900 dark:text-stone-100 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-700" /> Conservation</h2>
        <p className="text-sm text-stone-700 dark:text-stone-300">
          {persisted ? '✅ Stockage persistant accordé : le navigateur ne supprimera pas vos données pour libérer de l’espace.' : 'Le navigateur peut effacer les données d’un site peu utilisé quand l’espace manque. Demandez un stockage persistant et exportez régulièrement une sauvegarde.'}
          {usage && <span className="block text-xs text-stone-500 mt-1">{usage}</span>}
        </p>
        {!persisted && (
          <button className={btn('secondary')} onClick={async () => { const ok = await requestPersistentStorage(); setPersisted(ok); toast(ok ? 'Stockage persistant accordé' : 'Le navigateur n’a pas accordé le stockage persistant (installer l’application aide souvent).', ok ? 'succes' : 'info', 4000); }}>
            Demander un stockage persistant
          </button>
        )}
      </section>

      <section className={`${card} p-4 space-y-3`}>
        <h2 className="font-black text-stone-900 dark:text-stone-100 flex items-center gap-2"><FileJson className="w-5 h-5 text-emerald-700" /> Sauvegarde complète (JSON)</h2>
        <p className="text-sm text-stone-600 dark:text-stone-300">Profil, progression, compétences, résultats, révisions, journal, chevaux, favoris, notes, programmes, checklists et paramètres. Format versionné avec empreinte d’intégrité.</p>
        <p className="text-xs text-stone-500">Dernière sauvegarde : {lastExport ? new Date(lastExport).toLocaleString('fr-FR') : 'jamais'}</p>
        <button className={btn('primary', 'w-full')} onClick={() => void doExport()}><Download className="w-4 h-4" /> Exporter mes données</button>
      </section>

      <section className={`${card} p-4 space-y-3`}>
        <h2 className="font-black text-stone-900 dark:text-stone-100 flex items-center gap-2"><Upload className="w-5 h-5 text-emerald-700" /> Restaurer une sauvegarde</h2>
        <label className={btn('secondary', 'w-full cursor-pointer')}>
          Choisir un fichier .json
          <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 rounded-xl p-3">{error}</p>}
        {preview && (
          <div className="space-y-3">
            <div className="rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-3 text-sm space-y-2">
              <p className="font-bold text-stone-900 dark:text-stone-100">Récapitulatif — {preview.fileName}</p>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Format v{preview.preview.formatVersion} · application {preview.preview.appVersion}
                {preview.preview.exportedAt && ` · exportée le ${new Date(preview.preview.exportedAt).toLocaleString('fr-FR')}`}
              </p>
              <p className="text-xs">
                Intégrité : {preview.preview.integrity === 'verifiee' ? '✅ vérifiée' : preview.preview.integrity === 'invalide' ? '⚠️ le fichier a été modifié' : 'non vérifiable (ancien format)'}
              </p>
              <ul className="grid grid-cols-2 gap-x-3 text-xs text-stone-700 dark:text-stone-300">
                {(Object.entries(preview.preview.counts) as [UserTable, number][]).map(([t, n]) => <li key={t}>{TABLE_LABELS[t]} : <strong>{n}</strong></li>)}
              </ul>
              {preview.preview.warnings.map((w) => <p key={w} className="text-xs text-amber-800 dark:text-amber-300">⚠️ {w}</p>)}
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-stone-900 dark:text-stone-100">Mode de restauration</legend>
              <label className="flex items-start gap-2 text-sm">
                <input type="radio" name="mode" className="mt-1 accent-emerald-700" checked={mode === 'fusion'} onChange={() => setMode('fusion')} />
                <span><strong>Fusionner</strong> — ajoute les éléments de la sauvegarde ; en cas de doublon, la version la plus récente est gardée. Rien n’est supprimé.</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="radio" name="mode" className="mt-1 accent-emerald-700" checked={mode === 'remplacement'} onChange={() => setMode('remplacement')} />
                <span><strong>Remplacer</strong> — vos données actuelles sont remplacées par la sauvegarde. Une copie de vos données actuelles est téléchargée juste avant.</span>
              </label>
            </fieldset>
            <div className="grid grid-cols-2 gap-2">
              <button className={btn('secondary')} onClick={() => setPreview(null)}>Annuler</button>
              <button className={btn(mode === 'remplacement' ? 'danger' : 'primary')} onClick={() => setConfirmImport(true)}>Restaurer</button>
            </div>
          </div>
        )}
      </section>

      <section className={`${card} p-4 space-y-2`}>
        <h2 className="font-black text-stone-900 dark:text-stone-100 flex items-center gap-2"><Printer className="w-5 h-5 text-emerald-700" /> Documents PDF</h2>
        <p className="text-xs text-stone-500">La fenêtre d’impression s’ouvre : choisissez « Enregistrer au format PDF ». Une fiche pédagogique s’exporte depuis la fiche, un programme depuis la page du programme.</p>
        <div className="grid sm:grid-cols-3 gap-2">
          <button className={btn('secondary')} onClick={() => printProgress({ profile: profile ?? undefined, skills, attempts, stats: { ...stats, sessions: entries.length } })}>Bilan de progression</button>
          <button className={btn('secondary')} disabled={!entries.length} onClick={() => printJournal(entries, horses)}>Historique des séances</button>
          <button className={btn('secondary')} onClick={() => printFlashcards(FLASHCARDS)}>Fiche de révision</button>
        </div>
      </section>

      <section className={`${card} p-4 space-y-2 border-red-200 dark:border-red-900`}>
        <h2 className="font-black text-red-800 dark:text-red-300 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Effacer toutes mes données</h2>
        <p className="text-sm text-stone-600 dark:text-stone-300">Supprime définitivement toutes vos données de cet appareil. Exportez une sauvegarde avant.</p>
        <button className={btn('danger')} onClick={() => setConfirmReset(true)}>Effacer mes données…</button>
      </section>

      <ConfirmDialog
        open={confirmImport}
        title={mode === 'fusion' ? 'Fusionner la sauvegarde ?' : 'Remplacer toutes vos données ?'}
        message={mode === 'fusion' ? 'Les éléments de la sauvegarde seront ajoutés à vos données actuelles.' : 'Vos données actuelles seront remplacées. Une copie de sécurité sera d’abord téléchargée.'}
        confirmLabel={mode === 'fusion' ? 'Fusionner' : 'Remplacer'}
        danger={mode === 'remplacement'}
        onCancel={() => setConfirmImport(false)}
        onConfirm={() => void runImport()}
      />
      <ConfirmDialog
        open={confirmReset}
        title="Effacer toutes les données ?"
        message="Profil, progression, journal, chevaux, favoris, notes, programmes et révisions seront définitivement supprimés de cet appareil. Cette action est irréversible."
        confirmLabel="Tout effacer"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={async () => {
          await safeWrite(() => resetAllUserData(), 'Données effacées');
          setConfirmReset(false);
        }}
      />
    </div>
  );
};
