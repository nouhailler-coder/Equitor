import React from 'react';
import type { RiskLevel } from '../../types';

interface RiskWarningProps {
  riskLevel: RiskLevel;
  supervisionRequired: boolean;
  advancedPractice: boolean;
  customNotice?: string;
  className?: string;
}

export const RiskWarning: React.FC<RiskWarningProps> = ({
  riskLevel,
  supervisionRequired,
  advancedPractice,
  customNotice,
  className = '',
}) => {
  const isHighRisk = riskLevel === 'élevé' || advancedPractice;

  return (
    <div
      className={`rounded-xl p-4 border transition-all ${
        isHighRisk
          ? 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-sm'
          : supervisionRequired
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {isHighRisk ? (
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ) : supervisionRequired ? (
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 text-xs sm:text-sm">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-bold tracking-tight">
              {isHighRisk
                ? 'Avertissement de sécurité — Encadrement obligatoire'
                : supervisionRequired
                ? 'Mise en garde pédagogique — Pratique supervisée'
                : 'Consigne de sécurité'}
            </h4>
            {supervisionRequired && (
              <span className="text-[10px] uppercase font-black bg-stone-900 text-white px-2 py-0.5 rounded">
                Supervision requise
              </span>
            )}
          </div>

          <p className="leading-relaxed opacity-90">
            {customNotice ||
              'Cette fiche est un support de compréhension et de préparation. Elle ne constitue pas un mode d’emploi pour réaliser seul cet exercice. La mise en pratique doit être adaptée au cheval, au cavalier et aux conditions de sécurité, sous l’encadrement d’un professionnel qualifié lorsque cela est nécessaire.'}
          </p>

          {isHighRisk && (
            <div className="mt-2 pt-2 border-t border-rose-200/80 flex items-center gap-2 text-[11px] text-rose-800 font-medium">
              <span>🩺 En cas de gêne, boiterie ou résistance inhabituelle : consultez un vétérinaire.</span>
              <span>•</span>
              <span>🎓 Ne jamais pratiquer d’exercice à risque sans moniteur diplômé.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
