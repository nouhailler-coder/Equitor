import React, { useMemo, useState } from 'react';
import { BarChart3, Pencil, Plus, Printer, Trash2 } from 'lucide-react';
import type { Horse, JournalEntry, SessionType, Discipline } from '../../types/models';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { deleteJournalEntry } from '../../services/storage/repos';
import { safeWrite } from '../../services/feedback/toast';
import { buildIndex, search } from '../../services/search/search';
import { DISCIPLINES, DISCIPLINE_LABEL, FEELINGS, SESSION_TYPES, SESSION_TYPE_LABEL, fmtDate, fmtMinutes } from '../../data/labels';
import { SKILL_BY_ID } from '../../data/catalog';
import { Chips, ConfirmDialog, EmptyState, FavoriteButton, Link, PageHeader, btn, card, input, label } from '../../components/ui/kit';
import { navigate } from '../../app/router';
import { printJournal } from '../../services/export/print';

export const JournalView: React.FC = () => {
  const entries = useLive(() => db.ridingSessions.orderBy('date').reverse().toArray(), [], [] as JournalEntry[]);
  const horses = useLive(() => db.horses.toArray(), [], [] as Horse[]);
  const horseName = (e: JournalEntry) => horses.find((h) => h.id === e.horseId)?.name ?? e.horseName;
  const [q, setQ] = useState('');
  const [type, setType] = useState<SessionType | 'tous'>('tous');
  const [discipline, setDiscipline] = useState<Discipline | ''>('');
  const [horse, setHorse] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [favOnly, setFavOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = entries.filter(
      (e) =>
        (type === 'tous' || e.sessionType === type) &&
        (!discipline || e.discipline === discipline) &&
        (!horse || e.horseId === horse) &&
        (!from || e.date >= from) &&
        (!to || e.date <= to) &&
        (!favOnly || e.isFavorite),
    );
    if (q.trim()) {
      const idx = buildIndex(list.map((e) => ({ id: e.id, category: 'journal' as const, title: e.title, body: [e.objectives.join(' '), e.exercises.join(' '), e.positives, e.difficulties, e.improvements, e.comments, e.personalNotes, horseName(e)].join(' ') })));
      const ids = new Set(search(idx, q).map((h) => h.id));
      list = list.filter((e) => ids.has(e.id));
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, q, type, discipline, horse, from, to, favOnly, horses]);

  const filtersActive = type !== 'tous' || discipline || horse || from || to || favOnly || q;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mon journal"
        icon="📓"
        subtitle={`${entries.length} séance(s) · ${horses.length} cheval(aux)`}
        help="Notez chaque séance pour suivre vos progrès. Recherchez et filtrez par date, type, discipline ou cheval. Les données restent sur cet appareil."
        actions={
          <button className={btn('primary')} onClick={() => navigate('journal/nouveau')} aria-label="Nouvelle séance">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nouvelle séance</span>
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Link to="journal/chevaux" className={`${card} p-3 flex items-center gap-2 hover:border-emerald-500`}>
          <span className="text-2xl" aria-hidden="true">🐴</span>
          <span className="text-sm font-bold text-stone-900 dark:text-stone-100">Mes chevaux</span>
        </Link>
        <Link to="journal/analyse" className={`${card} p-3 flex items-center gap-2 hover:border-emerald-500`}>
          <BarChart3 className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
          <span className="text-sm font-bold text-stone-900 dark:text-stone-100">Analyse des séances</span>
        </Link>
      </div>

      <div className="space-y-2">
        <input className={input} type="search" placeholder="Rechercher dans le journal…" aria-label="Rechercher dans le journal" value={q} onChange={(e) => setQ(e.target.value)} />
        <Chips label="Type de séance" value={type} onChange={setType} options={[{ id: 'tous', label: 'Tous les types' }, ...SESSION_TYPES.map((t) => ({ id: t.id, label: `${t.icon} ${t.label}` }))]} />
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold text-emerald-800 dark:text-emerald-300 py-1">Plus de filtres</summary>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className={label} htmlFor="f-from">Du</label>
              <input id="f-from" type="date" className={input} value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="f-to">Au</label>
              <input id="f-to" type="date" className={input} value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="f-disc">Discipline</label>
              <select id="f-disc" className={input} value={discipline} onChange={(e) => setDiscipline(e.target.value as Discipline | '')}>
                <option value="">Toutes</option>
                {DISCIPLINES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="f-horse">Cheval</label>
              <select id="f-horse" className={input} value={horse} onChange={(e) => setHorse(e.target.value)}>
                <option value="">Tous</option>
                {horses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <label className="col-span-2 flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
              <input type="checkbox" className="w-4 h-4 accent-emerald-700" checked={favOnly} onChange={(e) => setFavOnly(e.target.checked)} /> Favoris uniquement
            </label>
          </div>
        </details>
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span aria-live="polite">{filtered.length} résultat(s)</span>
          {filtered.length > 0 && (
            <button className="flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300" onClick={() => printJournal(filtered, horses)}>
              <Printer className="w-3.5 h-3.5" /> Exporter en PDF
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon="🐎" title="Votre journal est vide" text="Après votre prochaine séance, notez vos objectifs, votre ressenti et vos points à améliorer." action={<button className={btn('primary')} onClick={() => navigate('journal/nouveau')}>Ajouter ma première séance</button>} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Aucune séance ne correspond" text={filtersActive ? 'Modifiez ou retirez les filtres.' : undefined} />
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((e) => (
            <li key={e.id}>
              <Link to={`journal/seance/${e.id}`} className={`${card} p-4 block hover:border-emerald-500 transition`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-stone-500">{fmtDate(e.date)} · {fmtMinutes(e.durationMinutes)}</p>
                    <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{e.isFavorite && '⭐ '}{e.title}</p>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">{SESSION_TYPE_LABEL[e.sessionType]}{horseName(e) ? ` · 🐴 ${horseName(e)}` : ''}</p>
                  </div>
                  <span className="text-amber-500 text-sm shrink-0" aria-label={`Ressenti ${e.feeling} sur 5`}>{'★'.repeat(e.feeling)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const JournalDetail: React.FC<{ id: string }> = ({ id }) => {
  const e = useLive(async () => (await db.ridingSessions.get(id)) ?? null, [id], undefined as JournalEntry | null | undefined);
  const horses = useLive(() => db.horses.toArray(), [], [] as Horse[]);
  const [confirm, setConfirm] = useState(false);
  if (e === undefined) return null;
  if (e === null) return <EmptyState icon="🔍" title="Séance introuvable" action={<button className={btn('primary')} onClick={() => navigate('journal')}>Retour au journal</button>} />;
  const horse = horses.find((h) => h.id === e.horseId);
  const Block: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) =>
    children ? (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">{title}</h2>
        <div className="text-sm text-stone-800 dark:text-stone-200 whitespace-pre-line">{children}</div>
      </div>
    ) : null;
  return (
    <div className="space-y-4">
      <PageHeader
        title={e.title}
        subtitle={`${fmtDate(e.date)} · ${fmtMinutes(e.durationMinutes)}`}
        back="journal"
        actions={<FavoriteButton type="journal" targetId={e.id} label={e.title} />}
      />
      <div className={`${card} p-4 space-y-4`}>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1">{SESSION_TYPE_LABEL[e.sessionType]}</span>
          {e.discipline && <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1">{DISCIPLINE_LABEL[e.discipline]}</span>}
          {(horse || e.horseName) && (
            horse ? <Link to={`journal/chevaux/${horse.id}`} className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 font-semibold">🐴 {horse.name}</Link> : <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1">🐴 {e.horseName}</span>
          )}
          <span className="rounded-full bg-amber-50 dark:bg-amber-950 px-2.5 py-1">Ressenti : {'★'.repeat(e.feeling)} {FEELINGS[e.feeling]}</span>
        </div>
        <Block title="Objectifs">{e.objectives.length ? e.objectives.map((o) => `• ${o}`).join('\n') : ''}</Block>
        <Block title="Exercices abordés">{e.exercises.length ? e.exercises.map((o) => `• ${o}`).join('\n') : ''}</Block>
        <Block title="Points positifs">{e.positives}</Block>
        <Block title="Difficultés">{e.difficulties}</Block>
        <Block title="À améliorer / prochain objectif">{e.improvements}</Block>
        <Block title="Observations sur le cheval">{[e.horseRelaxation ? `Décontraction observée : ${e.horseRelaxation}/5` : '', e.horseObservations].filter(Boolean).join('\n')}</Block>
        <Block title="Commentaires">{e.comments}</Block>
        <Block title="Notes personnelles">{e.personalNotes}</Block>
        {e.skillIds.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Compétences travaillées</h2>
            <div className="flex flex-wrap gap-1.5">
              {e.skillIds.map((s) => <span key={s} className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 text-xs">{SKILL_BY_ID[s]?.name ?? s}</span>)}
            </div>
          </div>
        )}
        {e.planId && <Link to={`pratiquer/preparation/${e.planId}`} className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 underline">Voir le programme de préparation</Link>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button className={btn('secondary')} onClick={() => navigate(`journal/modifier/${e.id}`)}><Pencil className="w-4 h-4" /> Modifier</button>
        <button className={btn('secondary')} onClick={() => printJournal([e], horses)}><Printer className="w-4 h-4" /> PDF</button>
        <button className={btn('secondary', 'text-red-700 dark:text-red-300')} onClick={() => setConfirm(true)}><Trash2 className="w-4 h-4" /> Supprimer</button>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Supprimer cette séance ?"
        message="Cette entrée du journal sera définitivement supprimée de cet appareil."
        confirmLabel="Supprimer"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          await safeWrite(() => deleteJournalEntry(e.id), 'Séance supprimée');
          navigate('journal', { replace: true });
        }}
      />
    </div>
  );
};
