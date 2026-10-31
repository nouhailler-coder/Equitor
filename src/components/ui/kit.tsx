import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useEscape } from '../../hooks/useEscape';
import { createPortal } from 'react-dom';
import { ArrowLeft, Star, X } from 'lucide-react';
import { goBack, navigate } from '../../app/router';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { favoriteId, noteId, saveNote, toggleFavorite } from '../../services/storage/repos';
import { dismissToast, getToasts, safeWrite, subscribeToasts, toast } from '../../services/feedback/toast';
import type { FavoriteType } from '../../types/models';
import { InfoTip } from '../common/InfoTip';

/* ───────── Styles partagés ───────── */
export const card = 'rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs';
export const input =
  'w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30';
export const label = 'block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1';

type Tone = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
const TONES: Record<Tone, string> = {
  primary: 'bg-brand-900 hover:bg-brand-700 text-white',
  accent: 'bg-amber-500 hover:bg-amber-400 text-stone-950',
  secondary: 'bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800',
  ghost: 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
};
export const btn = (tone: Tone = 'primary', extra = '') =>
  `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 min-h-11 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${TONES[tone]} ${extra}`;

/* ───────── Lien interne ───────── */
export const Link: React.FC<{ to: string; className?: string; children: React.ReactNode; 'aria-label'?: string }> = ({ to, className, children, ...rest }) => (
  <a
    href={`#/${to}`}
    className={className}
    onClick={(e) => {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      navigate(to);
    }}
    {...rest}
  >
    {children}
  </a>
);

/* ───────── En-tête de page ───────── */
export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  back?: string;
  help?: string;
  actions?: React.ReactNode;
  icon?: string;
}> = ({ title, subtitle, back, help, actions, icon }) => (
  <div className="flex items-start justify-between gap-3 mb-4">
    <div className="flex items-start gap-2 min-w-0">
      {back && (
        <button onClick={() => goBack(back)} className="mt-0.5 p-2 -ml-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200" aria-label="Retour">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-2 flex-wrap">
          {icon && <span aria-hidden="true">{icon}</span>}
          <span>{title}</span>
          {help && <InfoTip label={title} text={help} />}
        </h1>
        {subtitle && <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
  </div>
);

export const Section: React.FC<{ title?: string; icon?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, action, children, className = '' }) => (
  <section className={`space-y-3 ${className}`}>
    {title && (
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-black text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </h2>
        {action}
      </div>
    )}
    {children}
  </section>
);

export const EmptyState: React.FC<{ icon: string; title: string; text?: string; action?: React.ReactNode }> = ({ icon, title, text, action }) => (
  <div className={`${card} p-6 text-center space-y-2`}>
    <div className="text-4xl" aria-hidden="true">{icon}</div>
    <p className="font-bold text-stone-900 dark:text-stone-100">{title}</p>
    {text && <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto">{text}</p>}
    {action && <div className="pt-2">{action}</div>}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; tone?: 'stone' | 'emerald' | 'amber' | 'red' | 'sky' }> = ({ children, tone = 'stone' }) => {
  const tones = {
    stone: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    sky: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
};

/* ───────── Filtres en « puces » ───────── */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  label: aria,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="radiogroup" aria-label={aria}>
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
            value === o.id
              ? 'bg-brand-900 text-white border-brand-900 dark:bg-emerald-700 dark:border-emerald-700'
              : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ───────── Modale accessible (portail, piège de focus, Échap) ───────── */
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}> = ({ open, onClose, title, children, footer, size = 'md' }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);
  useEscape(!!open, onClose);
  if (!open) return null;
  const width = size === 'sm' ? 'sm:max-w-sm' : size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg';
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px] sm:p-4" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${width} max-h-[92dvh] flex flex-col bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl`}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-stone-100 dark:border-stone-800">
          <h2 className="font-black text-lg text-stone-900 dark:text-stone-50">{title}</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-stone-100 dark:border-stone-800 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, message, confirmLabel, danger, onConfirm, onCancel }) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    size="sm"
    footer={
      <div className="flex gap-2">
        <button className={btn('secondary', 'flex-1')} onClick={onCancel}>Annuler</button>
        <button className={btn(danger ? 'danger' : 'primary', 'flex-1')} onClick={onConfirm} data-autofocus>{confirmLabel}</button>
      </div>
    }
  >
    <div className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{message}</div>
  </Modal>
);

/* ───────── Toasts ───────── */
export const Toaster: React.FC = () => {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);
  return createPortal(
    <div className="fixed inset-x-0 bottom-20 lg:bottom-6 z-[90] flex flex-col items-center gap-2 px-4 pointer-events-none" aria-live="polite" role="status">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`pointer-events-auto max-w-md w-full sm:w-auto rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl text-left ${
            t.tone === 'erreur' ? 'bg-red-700 text-white' : t.tone === 'info' ? 'bg-stone-800 text-white' : 'bg-emerald-800 text-white'
          }`}
        >
          {t.tone === 'erreur' ? '⚠️ ' : t.tone === 'succes' ? '✓ ' : ''}
          {t.message}
        </button>
      ))}
    </div>,
    document.body,
  );
};

/* ───────── Favoris ───────── */
export const FavoriteButton: React.FC<{ type: FavoriteType; targetId: string; label: string; className?: string }> = ({ type, targetId, label: name, className = '' }) => {
  const isFav = useLive(async () => !!(await db.favorites.get(favoriteId(type, targetId))), [type, targetId], false);
  return (
    <button
      onClick={async () => {
        const now = await safeWrite(() => toggleFavorite(type, targetId));
        if (now !== undefined) toast(now ? 'Ajouté aux favoris' : 'Retiré des favoris', 'info', 1800);
      }}
      aria-pressed={isFav}
      aria-label={isFav ? `Retirer « ${name} » des favoris` : `Ajouter « ${name} » aux favoris`}
      className={`p-2 rounded-xl transition ${isFav ? 'text-amber-500' : 'text-stone-400 hover:text-amber-500'} ${className}`}
    >
      <Star className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
    </button>
  );
};

/* ───────── Note personnelle ───────── */
export const NoteEditor: React.FC<{ type: FavoriteType; targetId: string; placeholder?: string }> = ({ type, targetId, placeholder }) => {
  const saved = useLive(async () => (await db.notes.get(noteId(type, targetId)))?.text ?? '', [type, targetId], '');
  const [text, setText] = useState(saved);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) setText(saved);
  }, [saved, dirty]);
  const save = async () => {
    if (!dirty) return;
    await safeWrite(() => saveNote(type, targetId, text), text.trim() ? 'Note enregistrée' : 'Note supprimée');
    setDirty(false);
  };
  return (
    <div className="space-y-2">
      <label className={label} htmlFor={`note-${type}-${targetId}`}>📝 Ma note personnelle (privée, sur cet appareil)</label>
      <textarea
        id={`note-${type}-${targetId}`}
        className={`${input} min-h-24`}
        value={text}
        placeholder={placeholder ?? 'Vos annotations, questions à poser à l’enseignant…'}
        onChange={(e) => {
          setText(e.target.value);
          setDirty(true);
        }}
        onBlur={save}
      />
      {dirty && (
        <button className={btn('secondary', 'text-xs py-1.5 min-h-9')} onClick={save}>Enregistrer la note</button>
      )}
    </div>
  );
};

/* ───────── Barre de progression ───────── */
export const ProgressBar: React.FC<{ value: number; label?: string; tone?: 'emerald' | 'amber' | 'sky' }> = ({ value, label: l, tone = 'emerald' }) => {
  const color = tone === 'amber' ? 'bg-amber-500' : tone === 'sky' ? 'bg-sky-500' : 'bg-emerald-600';
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={l}>
      <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
};

export const StatTile: React.FC<{ value: React.ReactNode; label: string; icon?: string; onClick?: () => void }> = ({ value, label: l, icon, onClick }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={`${card} p-3 text-left ${onClick ? 'hover:border-emerald-500 transition' : ''}`}>
      <div className="text-xl font-black text-stone-900 dark:text-stone-50 flex items-center gap-1.5">
        {icon && <span aria-hidden="true" className="text-base">{icon}</span>}
        {value}
      </div>
      <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5">{l}</div>
    </Tag>
  );
};
