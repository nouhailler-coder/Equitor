import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { Checklist } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db, newId } from '../../services/storage/db';
import { createChecklist, deleteChecklist, saveChecklist } from '../../services/storage/repos';
import { safeWrite, toast } from '../../services/feedback/toast';
import { DEFAULT_CHECKLISTS } from '../../data/defaultChecklists';
import { ConfirmDialog, EmptyState, PageHeader, ProgressBar, btn, card, input } from '../../components/ui/kit';

/** Checklists configurables, enregistrées dans IndexedDB. */
export const ChecklistsView: React.FC = () => {
  const lists = useLive(() => db.checklists.orderBy('updatedAt').toArray(), [], [] as Checklist[]);
  const [editing, setEditing] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Checklist | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [confirmRestore, setConfirmRestore] = useState(false);

  const ordered = [...lists].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="space-y-5">
      <PageHeader title="Checklists" icon="✅" back="pratiquer" subtitle="Modifiables et enregistrées sur cet appareil" help="Cochez au fil de la préparation. En mode édition, renommez la liste, ajoutez, supprimez ou réordonnez les points. Elles ne remplacent jamais les procédures de votre centre équestre ni les consignes de votre enseignant." />

      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-xs text-amber-900 dark:text-amber-200">
        ⚠️ Ces listes sont des aide-mémoire : les consignes du centre équestre et de votre enseignant priment toujours.
      </div>

      {ordered.length === 0 && <EmptyState icon="📋" title="Aucune checklist" text="Restaurez les listes par défaut ou créez la vôtre." />}

      {ordered.map((l) =>
        editing === l.id ? (
          <ChecklistEditor key={l.id} list={l} onDone={() => setEditing(null)} />
        ) : (
          <ChecklistCard key={l.id} list={l} onEdit={() => setEditing(l.id)} onDelete={() => setToDelete(l)} />
        ),
      )}

      <div className={`${card} p-4 space-y-2`}>
        <label htmlFor="new-checklist" className="text-sm font-bold text-stone-900 dark:text-stone-100">Créer une checklist</label>
        <div className="flex gap-2">
          <input id="new-checklist" className={input} placeholder="ex. Avant une balade en extérieur" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <button
            className={btn('primary')}
            disabled={!newTitle.trim()}
            onClick={async () => {
              const l = await safeWrite(() => createChecklist(newTitle), 'Checklist créée');
              if (l) {
                setNewTitle('');
                setEditing(l.id);
              }
            }}
          >
            <Plus className="w-4 h-4" /> Créer
          </button>
        </div>
      </div>

      <button className={btn('ghost', 'w-full')} onClick={() => setConfirmRestore(true)}>
        <RotateCcw className="w-4 h-4" /> Restaurer les checklists par défaut
      </button>

      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer cette checklist ?"
        message={<>La checklist « {toDelete?.title} » sera supprimée de cet appareil.</>}
        confirmLabel="Supprimer"
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await safeWrite(() => deleteChecklist(toDelete.id), 'Checklist supprimée');
          setToDelete(null);
        }}
      />
      <ConfirmDialog
        open={confirmRestore}
        title="Restaurer les listes par défaut ?"
        message="Les trois listes par défaut retrouvent leur contenu d’origine (vos modifications de ces listes sont perdues). Vos listes personnelles sont conservées."
        confirmLabel="Restaurer"
        onCancel={() => setConfirmRestore(false)}
        onConfirm={async () => {
          await safeWrite(() => db.checklists.bulkPut(DEFAULT_CHECKLISTS), 'Listes par défaut restaurées');
          setConfirmRestore(false);
        }}
      />
    </div>
  );
};

const ChecklistCard: React.FC<{ list: Checklist; onEdit: () => void; onDelete: () => void }> = ({ list, onEdit, onDelete }) => {
  const done = list.items.filter((i) => i.checked).length;
  const toggle = (id: string) => void safeWrite(() => saveChecklist({ ...list, items: list.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) }));
  return (
    <section className={`${card} p-4 space-y-3`} aria-labelledby={`cl-${list.id}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id={`cl-${list.id}`} className="font-black text-stone-900 dark:text-stone-100">{list.icon} {list.title}</h2>
          {list.description && <p className="text-xs text-stone-500 dark:text-stone-400">{list.description}</p>}
        </div>
        <div className="flex gap-1">
          <button className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800" onClick={onEdit} aria-label={`Modifier « ${list.title} »`}><Pencil className="w-4 h-4" /></button>
          {!list.isDefault && (
            <button className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-red-600" onClick={onDelete} aria-label={`Supprimer « ${list.title} »`}><Trash2 className="w-4 h-4" /></button>
          )}
        </div>
      </div>
      <ProgressBar value={list.items.length ? (done / list.items.length) * 100 : 0} label={`${done} sur ${list.items.length}`} />
      <ul className="space-y-1">
        {list.items.map((i) => (
          <li key={i.id}>
            <label className="flex items-start gap-3 py-2 px-1 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer">
              <input type="checkbox" className="mt-0.5 w-5 h-5 accent-emerald-700 shrink-0" checked={i.checked} onChange={() => toggle(i.id)} />
              <span className={`text-sm ${i.checked ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'}`}>
                {i.label}
                {i.critical && <span className="ml-1.5 text-[10px] font-black text-red-700 dark:text-red-300 uppercase">essentiel</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {done > 0 && (
        <button
          className={btn('secondary', 'w-full text-xs')}
          onClick={async () => {
            await safeWrite(() => saveChecklist({ ...list, items: list.items.map((i) => ({ ...i, checked: false })) }));
            toast('Checklist remise à zéro', 'info');
          }}
        >
          Tout décocher
        </button>
      )}
    </section>
  );
};

const ChecklistEditor: React.FC<{ list: Checklist; onDone: () => void }> = ({ list, onDone }) => {
  const [draft, setDraft] = useState<Checklist>(list);
  const [newItem, setNewItem] = useState('');
  const move = (i: number, d: -1 | 1) =>
    setDraft((l) => {
      const items = [...l.items];
      [items[i], items[i + d]] = [items[i + d], items[i]];
      return { ...l, items };
    });
  return (
    <section className={`${card} p-4 space-y-3 border-amber-400`} aria-label={`Modification de ${list.title}`}>
      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300" htmlFor={`t-${list.id}`}>Titre</label>
      <input id={`t-${list.id}`} className={input} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
      <ul className="space-y-2">
        {draft.items.map((i, idx) => (
          <li key={i.id} className="flex items-center gap-1.5">
            <input className={input} value={i.label} aria-label={`Point ${idx + 1}`} onChange={(e) => setDraft({ ...draft, items: draft.items.map((x) => (x.id === i.id ? { ...x, label: e.target.value } : x)) })} />
            <button className={`p-2 rounded-lg text-xs font-black ${i.critical ? 'text-red-600' : 'text-stone-400'}`} aria-pressed={i.critical} aria-label="Marquer comme essentiel" title="Essentiel" onClick={() => setDraft({ ...draft, items: draft.items.map((x) => (x.id === i.id ? { ...x, critical: !x.critical } : x)) })}>!</button>
            <button className="p-2 disabled:opacity-30" disabled={idx === 0} onClick={() => move(idx, -1)} aria-label="Monter"><ArrowUp className="w-4 h-4" /></button>
            <button className="p-2 disabled:opacity-30" disabled={idx === draft.items.length - 1} onClick={() => move(idx, 1)} aria-label="Descendre"><ArrowDown className="w-4 h-4" /></button>
            <button className="p-2 text-red-600" onClick={() => setDraft({ ...draft, items: draft.items.filter((x) => x.id !== i.id) })} aria-label="Supprimer ce point"><Trash2 className="w-4 h-4" /></button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input className={input} placeholder="Nouveau point" value={newItem} onChange={(e) => setNewItem(e.target.value)} aria-label="Nouveau point" />
        <button
          className={btn('secondary')}
          disabled={!newItem.trim()}
          onClick={() => {
            setDraft({ ...draft, items: [...draft.items, { id: newId('item'), label: newItem.trim(), critical: false, checked: false }] });
            setNewItem('');
          }}
        >
          Ajouter
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className={btn('secondary')} onClick={onDone}>Annuler</button>
        <button
          className={btn('primary')}
          disabled={!draft.title.trim()}
          onClick={async () => {
            await safeWrite(() => saveChecklist({ ...draft, items: draft.items.filter((i) => i.label.trim()) }), 'Checklist enregistrée');
            onDone();
          }}
        >
          Enregistrer
        </button>
      </div>
    </section>
  );
};
