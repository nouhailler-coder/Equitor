import React, { useState, useEffect } from 'react';
import { DEFAULT_CHECKLIST_ITEMS } from '../../data/checklists';
import type { ChecklistItem } from '../../types';

interface ChecklistsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChecklistsModal: React.FC<ChecklistsModalProps> = ({ isOpen, onClose }) => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<ChecklistItem['category'] | 'tous'>('tous');

  useEffect(() => {
    // Load state from localStorage
    try {
      const saved = localStorage.getItem('equi_checklist_state');
      if (saved) {
        setCheckedIds(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('equi_checklist_state', JSON.stringify(next));
      return next;
    });
  };

  const resetAll = () => {
    setCheckedIds({});
    localStorage.removeItem('equi_checklist_state');
  };

  const categories: { id: ChecklistItem['category'] | 'tous'; label: string; icon: string }[] = [
    { id: 'tous', label: 'Toutes les listes', icon: '📋' },
    { id: 'cavalier', label: 'Cavalier', icon: '👤' },
    { id: 'cheval_materiel', label: 'Harnachement', icon: '🐴' },
    { id: 'manege_securite', label: 'Sécurité manège', icon: '🏟️' },
    { id: 'recuperation', label: 'Soins & Récupération', icon: '🧼' },
  ];

  const items = activeCategory === 'tous'
    ? DEFAULT_CHECKLIST_ITEMS
    : DEFAULT_CHECKLIST_ITEMS.filter((item) => item.category === activeCategory);

  const totalCount = DEFAULT_CHECKLIST_ITEMS.length;
  const checkedCount = Object.values(checkedIds).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#162e24] text-white flex items-center justify-between border-b border-emerald-950">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <span>Mode Écurie</span>
              <span>•</span>
              <span>Checklists de sécurité</span>
            </div>
            <h2 className="text-lg font-black text-white">
              Vérifications du cavalier et du cheval
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 text-stone-300 hover:text-white hover:bg-emerald-900 transition"
          >
            ✕
          </button>
        </div>

        {/* Progress header bar */}
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
              <span>Points contrôlés : {checkedCount} / {totalCount}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={resetAll}
            className="text-xs text-rose-700 hover:text-rose-900 font-semibold underline px-2 py-1"
          >
            Réinitialiser
          </button>
        </div>

        {/* Category selector */}
        <div className="px-4 py-2 bg-stone-100/70 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg shrink-0 transition flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-[#162e24] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Checklist items list */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {items.map((item) => {
            const isChecked = !!checkedIds[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
                  isChecked
                    ? 'bg-emerald-50/70 border-emerald-300 text-stone-700'
                    : 'bg-white border-stone-200 text-stone-900 hover:border-stone-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs mt-0.5 shrink-0 transition ${
                    isChecked
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-stone-300 bg-white'
                  }`}
                >
                  {isChecked ? '✓' : ''}
                </div>

                <div className="flex-1 text-xs sm:text-sm">
                  <p className={`leading-relaxed ${isChecked ? 'line-through text-stone-500' : 'font-medium'}`}>
                    {item.label}
                  </p>
                  {item.critical && (
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Point critique de sécurité
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
          <span>Ces checklists ne remplacent pas les consignes de votre moniteur.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
