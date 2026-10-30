import type { TabType } from '../components/layout/Navigation';

export interface ScreenGuide {
  icon: string;
  title: string;
  intro: string;
  tips: { icon: string; text: string }[];
}

/**
 * Aide contextuelle de chaque écran : affichée automatiquement à la première visite,
 * puis à la demande via le bouton « ? » de l'en-tête. Tout nouvel onglet doit avoir
 * son entrée ici (vérifié par scripts/check-legal.ts).
 */
export const SCREEN_GUIDES: Record<TabType, ScreenGuide> = {
  accueil: {
    icon: '🏠',
    title: 'Accueil',
    intro: 'Votre tableau de bord : reprenez là où vous vous étiez arrêté et choisissez la suite.',
    tips: [
      { icon: '▶️', text: '« Reprendre l’apprentissage » rouvre la dernière fiche consultée.' },
      { icon: '🗺️', text: 'Les parcours A, B et C proposent un ordre de lecture selon votre niveau.' },
      { icon: '📊', text: 'Les compteurs résument vos fiches assimilées, séances et chevaux enregistrés.' },
      { icon: '🐎', text: '« Préparer une séance » ouvre directement le formulaire du journal.' },
    ],
  },
  apprendre: {
    icon: '📚',
    title: 'Apprendre',
    intro: 'La bibliothèque pédagogique : modules, fiches techniques illustrées et glossaire.',
    tips: [
      { icon: '🔎', text: 'Filtrez les fiches par niveau (débutant → avancé) et par thème.' },
      { icon: '📖', text: 'Touchez un module pour voir ses sous-parties et ses fiches liées.' },
      { icon: '⭐', text: 'Dans une fiche, l’étoile l’ajoute à vos favoris ; marquez-la « assimilée » quand vous la maîtrisez.' },
      { icon: '⚠️', text: 'Les fiches à risque élevé rappellent qu’un encadrement qualifié est indispensable.' },
    ],
  },
  pratiquer: {
    icon: '📋',
    title: 'Pratiquer',
    intro: 'L’écran de l’écurie : préparez-vous avant de monter et notez vos ressentis après.',
    tips: [
      { icon: '✅', text: 'Les checklists (cavalier, matériel, sécurité, soins) se cochent d’un doigt.' },
      { icon: '🐴', text: '« Mes chevaux » enregistre les fiches de vos chevaux pour les associer aux séances.' },
      { icon: '📝', text: '« Nouvelle séance » ajoute une entrée au journal : objectifs, ressenti, réussites, difficultés.' },
      { icon: '🔽', text: 'Touchez une séance du journal pour la déplier, la modifier ou la supprimer.' },
    ],
  },
  reviser: {
    icon: '💡',
    title: 'Réviser',
    intro: 'Testez vos connaissances avec des quiz commentés et des flashcards.',
    tips: [
      { icon: '🎯', text: 'Choisissez un chapitre ou une fiche pour un quiz ciblé, ou lancez une série générale.' },
      { icon: '💬', text: 'Chaque réponse est suivie d’une explication pédagogique.' },
      { icon: '🃏', text: 'Les flashcards se retournent d’un toucher pour réviser le vocabulaire.' },
      { icon: '📈', text: 'Vos résultats alimentent le taux de réussite visible dans « Mon suivi ».' },
    ],
  },
  suivi: {
    icon: '👤',
    title: 'Mon suivi',
    intro: 'Votre espace personnel : progression, favoris et gestion de vos données.',
    tips: [
      { icon: '📊', text: 'Les statistiques sont calculées localement à partir de votre activité.' },
      { icon: '💾', text: '« Sauvegarde » exporte toutes vos données dans un fichier JSON à conserver.' },
      { icon: '♻️', text: 'La restauration réimporte une sauvegarde (fusion ou remplacement) avec un aperçu préalable.' },
      { icon: '🔒', text: 'Rien ne quitte votre appareil : sans sauvegarde, effacer le navigateur efface vos données.' },
    ],
  },
};
