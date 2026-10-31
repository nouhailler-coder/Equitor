import React from 'react';
import { Link, PageHeader, card } from '../../components/ui/kit';
import { DICTIONARY } from '../../data/dictionary';
import { ATLAS } from '../../data/atlas';
import { EQUIPMENT } from '../../data/equipment';
import { ARENA_FIGURES } from '../../data/arenaFigures';
import { BEHAVIORS } from '../../data/behaviors';

const RESOURCES = [
  { to: 'ressources/dictionnaire', icon: '📖', title: 'Dictionnaire équestre', text: `${DICTIONARY.length} définitions, catégories et renvois` },
  { to: 'ressources/atlas', icon: '🦴', title: 'Atlas anatomique', text: `${Object.keys(ATLAS).length} régions sur 5 vues interactives` },
  { to: 'ressources/materiel', icon: '🧰', title: 'Atelier du matériel', text: `${EQUIPMENT.length} éléments : parties, sécurité, entretien` },
  { to: 'ressources/manege', icon: '🏟️', title: 'Manège interactif', text: `Lettres, lignes et ${ARENA_FIGURES.length} figures animées` },
  { to: 'ressources/comportement', icon: '👂', title: 'Comportement du cheval', text: `${BEHAVIORS.length} signaux à interpréter avec prudence` },
];

export const ResourcesHub: React.FC = () => (
  <div className="space-y-4">
    <PageHeader title="Ressources" icon="🗂️" subtitle="Bibliothèque pédagogique, consultable hors ligne" help="Ces ressources sont des supports de compréhension : schémas simplifiés, définitions générales. Elles ne remplacent ni l’enseignant, ni le vétérinaire." />
    <ul className="grid sm:grid-cols-2 gap-3">
      {RESOURCES.map((r) => (
        <li key={r.to}>
          <Link to={r.to} className={`${card} p-4 flex items-center gap-4 hover:border-emerald-500 transition h-full`}>
            <span className="text-3xl" aria-hidden="true">{r.icon}</span>
            <span>
              <span className="block font-black text-stone-900 dark:text-stone-100">{r.title}</span>
              <span className="block text-xs text-stone-500 dark:text-stone-400">{r.text}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
