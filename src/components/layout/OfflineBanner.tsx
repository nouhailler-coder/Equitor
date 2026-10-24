import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-stone-900/95 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs font-medium flex items-center justify-between shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span>Mode Hors Ligne Actif — Vos données et fiches locales sont 100 % accessibles.</span>
      </div>
      <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
        Stockage local
      </span>
    </div>
  );
};
