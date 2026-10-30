import React from 'react';
import { PLACEHOLDER, legalNotice, legalPublisher, type LegalSection } from './legalContent';

/** Affiche une valeur, ou un repère d'alerte bien visible si elle reste à compléter. */
const Value: React.FC<{ value: string }> = ({ value }) =>
  value.includes(PLACEHOLDER) ? (
    <em className="text-red-700 font-semibold not-italic bg-red-50 px-1 rounded">{value}</em>
  ) : (
    <>{value}</>
  );

/** Rendu unique du contenu légal (avertissement de 1er lancement + écran Mentions légales). */
export const LegalSections: React.FC<{ sections?: LegalSection[]; showPublisher?: boolean }> = ({
  sections = legalNotice.sections,
  showPublisher = true,
}) => (
  <div className="space-y-5 text-sm text-stone-700 leading-relaxed">
    {sections.map((s) => (
      <section key={s.id} aria-labelledby={`legal-${s.id}`}>
        <h3 id={`legal-${s.id}`} className="font-bold text-stone-900 text-base mb-1.5">
          {s.title}
        </h3>
        <div className="space-y-2">
          {s.paragraphs.map((p, i) => (
            <p key={i}>
              <Value value={p} />
            </p>
          ))}
        </div>
      </section>
    ))}

    {showPublisher && (
      <section aria-labelledby="legal-editeur" className="rounded-xl bg-stone-50 border border-stone-200 p-3.5">
        <h3 id="legal-editeur" className="font-bold text-stone-900 text-base mb-2">
          Éditeur &amp; hébergement
        </h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs sm:text-sm">
          <dt className="text-stone-500">Application</dt>
          <dd><Value value={legalPublisher.appName} /></dd>
          <dt className="text-stone-500">Éditeur</dt>
          <dd><Value value={legalPublisher.publisher} /></dd>
          <dt className="text-stone-500">Adresse</dt>
          <dd><Value value={legalPublisher.address} /></dd>
          <dt className="text-stone-500">Contact</dt>
          <dd>
            <a href={`mailto:${legalPublisher.email}`} className="text-emerald-800 underline break-all">
              {legalPublisher.email}
            </a>
          </dd>
          <dt className="text-stone-500">Hébergeur</dt>
          <dd><Value value={legalPublisher.host} /></dd>
          <dt className="text-stone-500">Mise à jour</dt>
          <dd>
            <Value value={legalPublisher.lastUpdated} /> · version {legalNotice.version}
          </dd>
        </dl>
      </section>
    )}
  </div>
);
