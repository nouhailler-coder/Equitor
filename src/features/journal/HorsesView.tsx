import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Horse, JournalEntry } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { deleteHorse, saveHorse, type HorseDraft } from '../../services/storage/repos';
import { safeWrite, toast } from '../../services/feedback/toast';
import { HORSE_SEX, SESSION_TYPE_LABEL, fmtDate, fmtMinutes } from '../../data/labels';
import { SKILL_BY_ID } from '../../data/catalog';
import { journalStats } from '../../services/statistics/stats';
import { ConfirmDialog, EmptyState, Link, PageHeader, StatTile, btn, card, input, label } from '../../components/ui/kit';
import { LineChart } from '../../components/ui/charts';
import { goBack, navigate } from '../../app/router';

/** Réduit une image à 480 px max (JPEG) : la photo reste légère et dans IndexedDB uniquement. */
async function resizePhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, 480 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const HorseAvatar: React.FC<{ horse: Horse; size?: string }> = ({ horse, size = 'w-14 h-14' }) =>
  horse.photo ? (
    <img src={horse.photo} alt={`Photo de ${horse.name}`} className={`${size} rounded-2xl object-cover shrink-0`} />
  ) : (
    <span className={`${size} rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-2xl shrink-0`} aria-hidden="true">🐴</span>
  );

export const HorsesView: React.FC = () => {
  const horses = useLive(() => db.horses.orderBy('name').toArray(), [], [] as Horse[]);
  const entries = useLive(() => db.ridingSessions.toArray(), [], [] as JournalEntry[]);
  return (
    <div className="space-y-4">
      <PageHeader title="Mes chevaux" icon="🐴" back="journal" subtitle="Fiches personnelles, enregistrées sur cet appareil" actions={<button className={btn('primary')} onClick={() => navigate('journal/chevaux/nouveau')}><Plus className="w-4 h-4" /> Ajouter</button>} />
      {horses.length === 0 ? (
        <EmptyState icon="🐴" title="Aucun cheval enregistré" text="Ajoutez les chevaux que vous montez pour suivre leur historique." action={<button className={btn('primary')} onClick={() => navigate('journal/chevaux/nouveau')}>Ajouter un cheval</button>} />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {horses.map((h) => {
            const n = entries.filter((e) => e.horseId === h.id).length;
            return (
              <li key={h.id}>
                <Link to={`journal/chevaux/${h.id}`} className={`${card} p-3 flex items-center gap-3 hover:border-emerald-500`}>
                  <HorseAvatar horse={h} />
                  <span className="min-w-0">
                    <span className="block font-bold text-stone-900 dark:text-stone-100 truncate">{h.name}{h.nickname ? ` « ${h.nickname} »` : ''}</span>
                    <span className="block text-xs text-stone-500">{[h.breed, h.coat].filter(Boolean).join(' · ') || 'Fiche à compléter'}</span>
                    <span className="block text-xs text-stone-500">{n} séance(s)</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const HorseForm: React.FC<{ id?: string }> = ({ id }) => {
  const existing = useLive(async () => (id ? ((await db.horses.get(id)) ?? null) : null), [id], undefined as Horse | null | undefined);
  const [d, setD] = useState<HorseDraft>({ name: '', sex: 'non_precise', isFavorite: false });
  const [ready, setReady] = useState(!id);
  const [error, setError] = useState('');
  useEffect(() => {
    if (id && existing !== undefined && !ready) {
      if (existing) setD(existing);
      setReady(true);
    }
  }, [existing, id, ready]);
  const set = <K extends keyof HorseDraft>(k: K, v: HorseDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  if (!ready) return null;
  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (!d.name.trim()) {
          setError('Le nom du cheval est obligatoire.');
          return;
        }
        const year = new Date().getFullYear();
        if (d.birthYear && (d.birthYear < 1980 || d.birthYear > year)) {
          setError(`L’année de naissance doit être comprise entre 1980 et ${year}.`);
          return;
        }
        const saved = await safeWrite(() => saveHorse({ ...d, id }), id ? 'Fiche mise à jour' : 'Cheval ajouté');
        if (saved) navigate(`journal/chevaux/${saved.id}`, { replace: true });
      }}
    >
      <PageHeader title={id ? 'Modifier la fiche' : 'Nouveau cheval'} icon="🐴" back="journal/chevaux" subtitle="Seul le nom est obligatoire" />
      {error && <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 p-3 text-sm text-red-800 dark:text-red-200">{error}</p>}
      <div className={`${card} p-4 space-y-3`}>
        <div className="flex items-center gap-3">
          {d.photo ? <img src={d.photo} alt="Aperçu de la photo" className="w-20 h-20 rounded-2xl object-cover" /> : <span className="w-20 h-20 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-3xl" aria-hidden="true">🐴</span>}
          <div className="space-y-1.5">
            <label className={btn('secondary', 'cursor-pointer text-xs')}>
              <Camera className="w-4 h-4" /> {d.photo ? 'Changer la photo' : 'Ajouter une photo'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    set('photo', await resizePhoto(f));
                  } catch {
                    toast('Impossible de lire cette image.', 'erreur');
                  }
                }}
              />
            </label>
            {d.photo && <button type="button" className="block text-xs text-red-700 dark:text-red-300 font-semibold" onClick={() => set('photo', undefined)}>Retirer la photo</button>}
            <p className="text-[11px] text-stone-500">Facultative. Elle reste sur cet appareil.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={label} htmlFor="h-name">Nom *</label>
            <input id="h-name" className={input} value={d.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div>
            <label className={label} htmlFor="h-nick">Surnom</label>
            <input id="h-nick" className={input} value={d.nickname ?? ''} onChange={(e) => set('nickname', e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="h-sex">Sexe</label>
            <select id="h-sex" className={input} value={d.sex} onChange={(e) => set('sex', e.target.value as HorseDraft['sex'])}>
              {HORSE_SEX.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="h-breed">Race</label>
            <input id="h-breed" className={input} value={d.breed ?? ''} onChange={(e) => set('breed', e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="h-coat">Robe</label>
            <input id="h-coat" className={input} placeholder="ex. bai, alezan…" value={d.coat ?? ''} onChange={(e) => set('coat', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={label} htmlFor="h-year">Année de naissance (facultatif)</label>
            <input id="h-year" type="number" inputMode="numeric" className={input} value={d.birthYear ?? ''} onChange={(e) => set('birthYear', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="h-desc">Description</label>
          <textarea id="h-desc" className={`${input} min-h-16`} value={d.description ?? ''} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="h-part">Particularités observées</label>
          <textarea id="h-part" className={`${input} min-h-16`} placeholder="Ce que vous avez remarqué sur son caractère, ses habitudes…" value={d.particularities ?? ''} onChange={(e) => set('particularities', e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="h-notes">Notes personnelles</label>
          <textarea id="h-notes" className={`${input} min-h-16`} value={d.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
        </div>
        <p className="text-[11px] text-stone-500">N’enregistrez que ce qui vous est utile. Ces observations ne sont pas des informations vétérinaires.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={btn('secondary')} onClick={() => goBack('journal/chevaux')}>Annuler</button>
        <button type="submit" className={btn('primary')}>Enregistrer</button>
      </div>
    </form>
  );
};

export const HorseDetail: React.FC<{ id: string }> = ({ id }) => {
  const horse = useLive(async () => (await db.horses.get(id)) ?? null, [id], undefined as Horse | null | undefined);
  const entries = useLive(() => db.ridingSessions.where('horseId').equals(id).reverse().sortBy('date'), [id], [] as JournalEntry[]);
  const [confirm, setConfirm] = useState(false);
  const stats = useMemo(() => journalStats(entries), [entries]);
  const exercises = useMemo(() => {
    const m = new Map<string, number>();
    entries.forEach((e) => e.exercises.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1)));
    return [...m].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [entries]);
  if (horse === undefined) return null;
  if (horse === null) return <EmptyState icon="🔍" title="Cheval introuvable" action={<button className={btn('primary')} onClick={() => navigate('journal/chevaux')}>Mes chevaux</button>} />;
  const sex = HORSE_SEX.find((s) => s.id === horse.sex)?.label;
  return (
    <div className="space-y-4">
      <PageHeader title={horse.name} subtitle={horse.nickname ? `« ${horse.nickname} »` : undefined} back="journal/chevaux" />
      <div className={`${card} p-4 flex gap-4`}>
        <HorseAvatar horse={horse} size="w-24 h-24" />
        <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-stone-700 dark:text-stone-300">
          {horse.breed && (<><dt className="text-stone-500">Race</dt><dd>{horse.breed}</dd></>)}
          {horse.coat && (<><dt className="text-stone-500">Robe</dt><dd>{horse.coat}</dd></>)}
          {horse.sex !== 'non_precise' && (<><dt className="text-stone-500">Sexe</dt><dd>{sex}</dd></>)}
          {horse.birthYear && (<><dt className="text-stone-500">Âge</dt><dd>{new Date().getFullYear() - horse.birthYear} ans</dd></>)}
        </dl>
      </div>
      {(horse.description || horse.particularities || horse.notes) && (
        <div className={`${card} p-4 space-y-3 text-sm`}>
          {horse.description && <p className="text-stone-700 dark:text-stone-300 whitespace-pre-line">{horse.description}</p>}
          {horse.particularities && <p className="whitespace-pre-line"><strong>Particularités observées :</strong> {horse.particularities}</p>}
          {horse.notes && <p className="whitespace-pre-line"><strong>Notes :</strong> {horse.notes}</p>}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <StatTile value={stats.count} label="séances" />
        <StatTile value={fmtMinutes(stats.totalMinutes)} label="au total" />
        <StatTile value={entries.length ? (entries.reduce((s, e) => s + e.feeling, 0) / entries.length).toFixed(1) : '—'} label="ressenti moyen /5" />
      </div>

      {entries.length > 1 && (
        <div className={`${card} p-4`}>
          <h2 className="font-black text-sm text-stone-900 dark:text-stone-100 mb-2">Évolution du ressenti</h2>
          <LineChart title="Ressenti par séance" min={1} max={5} points={[...entries].reverse().map((e) => ({ label: e.date, value: e.feeling }))} />
        </div>
      )}

      {exercises.length > 0 && (
        <div className={`${card} p-4`}>
          <h2 className="font-black text-sm text-stone-900 dark:text-stone-100 mb-2">Exercices travaillés</h2>
          <ul className="flex flex-wrap gap-1.5">{exercises.map(([x, n]) => <li key={x} className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1 text-xs">{x} ×{n}</li>)}</ul>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="font-black text-sm text-stone-900 dark:text-stone-100">Historique des séances</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-stone-500">Aucune séance avec ce cheval pour l’instant.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li key={e.id}>
                <Link to={`journal/seance/${e.id}`} className={`${card} p-3 block hover:border-emerald-500`}>
                  <p className="text-xs text-stone-500">{fmtDate(e.date)} · {SESSION_TYPE_LABEL[e.sessionType]}</p>
                  <p className="font-semibold text-sm text-stone-900 dark:text-stone-100">{e.title}</p>
                  {e.objectives.length > 0 && <p className="text-xs text-stone-600 dark:text-stone-400">🎯 {e.objectives.join(' · ')}</p>}
                  {e.horseObservations && <p className="text-xs text-stone-600 dark:text-stone-400">👁️ {e.horseObservations}</p>}
                  {e.skillIds.length > 0 && <p className="text-xs text-emerald-700 dark:text-emerald-400">{e.skillIds.map((s) => SKILL_BY_ID[s]?.name).filter(Boolean).join(' · ')}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-[11px] text-stone-500">Ces observations personnelles ne constituent pas un suivi vétérinaire.</p>

      <div className="grid grid-cols-2 gap-2">
        <button className={btn('secondary')} onClick={() => navigate(`journal/chevaux/modifier/${horse.id}`)}><Pencil className="w-4 h-4" /> Modifier</button>
        <button className={btn('secondary', 'text-red-700 dark:text-red-300')} onClick={() => setConfirm(true)}><Trash2 className="w-4 h-4" /> Supprimer</button>
      </div>
      <ConfirmDialog
        open={confirm}
        title={`Supprimer ${horse.name} ?`}
        message="La fiche du cheval sera supprimée. Les séances du journal sont conservées (le nom du cheval y reste indiqué)."
        confirmLabel="Supprimer"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          await safeWrite(() => deleteHorse(horse.id), 'Fiche supprimée');
          navigate('journal/chevaux', { replace: true });
        }}
      />
    </div>
  );
};
