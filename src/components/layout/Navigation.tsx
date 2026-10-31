import React from 'react';
import { BookOpen, Dumbbell, GraduationCap, Home, Library, NotebookPen, TrendingUp } from 'lucide-react';
import { navigate } from '../../app/router';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';

/** Espaces de l'application. « ressources » est accessible depuis Apprendre, le menu et la barre latérale. */
export type TabType = 'accueil' | 'apprendre' | 'pratiquer' | 'reviser' | 'progression' | 'journal' | 'ressources';

export const TABS: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'accueil', label: 'Accueil', icon: Home },
  { id: 'apprendre', label: 'Apprendre', icon: BookOpen },
  { id: 'pratiquer', label: 'Pratiquer', icon: Dumbbell },
  { id: 'reviser', label: 'Réviser', icon: GraduationCap },
  { id: 'progression', label: 'Progression', icon: TrendingUp },
  { id: 'journal', label: 'Journal', icon: NotebookPen },
];

export const isTab = (s: string): s is TabType => ['accueil', 'apprendre', 'pratiquer', 'reviser', 'progression', 'journal', 'ressources'].includes(s);

/** Nombre de révisions dues aujourd'hui (pastille sur « Réviser »). */
function useDueCount() {
  return useLive(
    async () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return db.revisionItems.where('dueAt').belowOrEqual(end.toISOString()).count();
    },
    [],
    0,
  );
}

/** Barre de navigation inférieure (mobile et tablette). */
export const BottomNav: React.FC<{ current: TabType }> = ({ current }) => {
  const due = useDueCount();
  const active = current === 'ressources' ? 'apprendre' : current;
  return (
    <nav aria-label="Navigation principale" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto grid grid-cols-6 h-16">
        {TABS.map((t) => {
          const isActive = active === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => navigate(t.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition ${isActive ? 'text-amber-400' : 'text-stone-400 hover:text-stone-200'}`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                {t.id === 'reviser' && due > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-stone-950 text-[9px] font-black flex items-center justify-center">
                    {due > 99 ? '99+' : due}
                  </span>
                )}
              </span>
              <span className={`text-[10px] tracking-tight ${isActive ? 'font-bold' : ''}`}>{t.label}</span>
              {isActive && <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-amber-400" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/** Barre latérale (ordinateur). */
export const SideNav: React.FC<{ current: TabType }> = ({ current }) => {
  const due = useDueCount();
  const items = [...TABS, { id: 'ressources' as TabType, label: 'Ressources', icon: Library }];
  return (
    <nav aria-label="Navigation principale" className="hidden lg:block w-56 shrink-0 sticky top-14 self-start h-[calc(100dvh-3.5rem)] py-6 pr-4">
      <ul className="space-y-1">
        {items.map((t) => {
          const isActive = current === t.id;
          const Icon = t.icon;
          return (
            <li key={t.id}>
              <button
                onClick={() => navigate(t.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-900 text-amber-300 dark:bg-emerald-900/60'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{t.label}</span>
                {t.id === 'reviser' && due > 0 && (
                  <span className="rounded-full bg-amber-500 text-stone-950 text-[10px] font-black px-1.5">{due}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
