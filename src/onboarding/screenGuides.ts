import type { TabType } from '../components/layout/Navigation';

export interface ScreenGuide {
  icon: string;
  title: string;
  intro: string;
  tips: { icon: string; text: string }[];
}

/**
 * Aide contextuelle de chaque espace : affichée automatiquement à la première visite,
 * puis à la demande via le bouton « ? » de l'en-tête. Tout nouvel espace doit avoir
 * son entrée ici (vérifié par scripts/check-legal.ts).
 */
export const SCREEN_GUIDES: Record<TabType, ScreenGuide> = {
  accueil: {
    icon: '🏠',
    title: 'Accueil',
    intro: 'Votre tableau de bord : révisions du jour, prochaine étape de votre parcours et accès rapides.',
    tips: [
      { icon: '🎯', text: '« Prochaine étape » propose les compétences à travailler, d’après votre profil et vos résultats.' },
      { icon: '🔁', text: 'Le bloc Révisions indique les notions à revoir aujourd’hui.' },
      { icon: '⭐', text: 'Vos favoris (fiches, termes, exercices…) sont regroupés ici.' },
      { icon: '📝', text: 'Accès direct au journal et à la préparation de séance.' },
    ],
  },
  apprendre: {
    icon: '📚',
    title: 'Apprendre',
    intro: 'Les fiches pédagogiques, votre parcours personnalisé et l’accès aux ressources.',
    tips: [
      { icon: '🧭', text: '« Mon parcours » liste les compétences recommandées et leur état de maîtrise.' },
      { icon: '🔎', text: 'Filtrez les fiches par niveau et par thème ; les mots soulignés ouvrent leur définition.' },
      { icon: '⭐', text: 'Dans une fiche : favori, note personnelle, quiz associé et export PDF.' },
      { icon: '⚠️', text: 'Les fiches avancées sont des supports de compréhension : leur pratique se fait encadrée.' },
    ],
  },
  pratiquer: {
    icon: '🏋️',
    title: 'Pratiquer',
    intro: 'Exercices interactifs, préparation de vos séances et checklists d’écurie.',
    tips: [
      { icon: '🧩', text: 'Dix types d’exercices : QCM, associations, classement, schémas à toucher, textes à trous…' },
      { icon: '💬', text: 'Après chaque réponse : explication, erreurs fréquentes et ressource pour approfondir.' },
      { icon: '🗓️', text: 'Préparez une séance à partir d’un modèle, puis faites le bilan après.' },
      { icon: '✅', text: 'Les checklists sont modifiables et enregistrées sur l’appareil.' },
    ],
  },
  reviser: {
    icon: '💡',
    title: 'Réviser',
    intro: 'Répétition espacée : chaque notion revient au bon moment selon vos réussites.',
    tips: [
      { icon: '📅', text: 'Les révisions du jour et en retard sont à faire en priorité.' },
      { icon: '🃏', text: 'Retournez une carte, puis indiquez si c’était oublié, difficile, bien ou facile.' },
      { icon: '⏱️', text: 'Intervalles indicatifs : 1, 3, 7, 14 puis 30 jours, raccourcis en cas de difficulté.' },
      { icon: '🌱', text: '« À découvrir » regroupe les cartes jamais révisées.' },
    ],
  },
  progression: {
    icon: '📈',
    title: 'Ma progression',
    intro: 'Votre profil, le diagnostic, le référentiel de compétences et vos statistiques.',
    tips: [
      { icon: '🩺', text: 'Le diagnostic évalue vos connaissances théoriques et propose un parcours (ce n’est pas une certification).' },
      { icon: '🏅', text: 'La maîtrise d’une compétence vient des exercices et révisions, jamais de la simple lecture.' },
      { icon: '📊', text: 'Toutes les statistiques sont calculées à partir de vos données réelles.' },
      { icon: '💾', text: 'Sauvegardez régulièrement vos données (JSON) et exportez vos bilans en PDF.' },
    ],
  },
  journal: {
    icon: '📓',
    title: 'Mon journal',
    intro: 'Votre carnet de séances et les fiches de vos chevaux.',
    tips: [
      { icon: '➕', text: 'Ajoutez une entrée après chaque séance : type, objectifs, ressenti, points positifs et à améliorer.' },
      { icon: '🔎', text: 'Recherchez et filtrez par date, type de séance, discipline ou cheval.' },
      { icon: '🐴', text: 'Chaque cheval a son historique (séances, exercices, observations).' },
      { icon: '🩺', text: 'Vos observations restent personnelles : elles ne remplacent pas l’avis d’un vétérinaire.' },
    ],
  },
  ressources: {
    icon: '🗂️',
    title: 'Ressources',
    intro: 'Dictionnaire, atlas anatomique, atelier du matériel, manège interactif et comportement du cheval.',
    tips: [
      { icon: '📖', text: 'Le dictionnaire se consulte aussi depuis les fiches : touchez un mot souligné.' },
      { icon: '🦴', text: 'Dans l’atlas, touchez une région du schéma pour afficher son nom et sa fonction.' },
      { icon: '🏟️', text: 'Le manège anime les figures : un support de compréhension, pas une consigne de pratique.' },
      { icon: '👂', text: 'Comportement : un signal isolé ne suffit jamais à conclure.' },
    ],
  },
};
