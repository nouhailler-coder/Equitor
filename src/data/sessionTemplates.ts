import type { SessionType } from '../types/models';

/**
 * Modèles de préparation de séance : supports de préparation théorique.
 * Les programmes avancés sont à valider avec un enseignant qualifié avant toute pratique.
 */
export interface SessionTemplate {
  id: string;
  title: string;
  icon: string;
  objective: string;
  sessionType: SessionType;
  skillIds: string[];
  lessonIds: string[];
  exerciseIds: string[];
  notes: string;
  /** Exige explicitement la validation d'un enseignant. */
  advanced: boolean;
}

export const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    id: 'tpl-decouverte-cheval', title: 'Découverte du cheval', icon: '🐴', sessionType: 'mise_en_confiance',
    objective: 'Faire connaissance avec le cheval en sécurité : approche, observation, pansage.',
    skillIds: ['se-approche', 'se-zones', 'co-proie', 'ma-pansage'],
    lessonIds: ['fiche-02-mener-en-main'],
    exerciseIds: ['ex-securite-approche', 'ex-pansage', 'ex-comportement-langage'],
    notes: 'Observer les oreilles, l’attitude générale et noter ses impressions dans le journal.',
    advanced: false,
  },
  {
    id: 'tpl-avant-seance', title: 'Préparation avant une séance', icon: '🧭', sessionType: 'travail_general',
    objective: 'Arriver prêt : équipement, harnachement vérifié, objectif clair.',
    skillIds: ['eq-tenue', 'se-verifications', 'ma-selle', 'ma-filet'],
    lessonIds: ['fiche-03-monter-descendre', 'fiche-20-echauffement-recuperation'],
    exerciseIds: ['ex-equipement-cavalier', 'ex-selle', 'ex-filet'],
    notes: 'Cocher la checklist « Avant une séance » ; noter la question à poser à l’enseignant.',
    advanced: false,
  },
  {
    id: 'tpl-revision', title: 'Révision des connaissances', icon: '💡', sessionType: 'theorie',
    objective: 'Consolider les notions fragiles repérées dans le tableau de révision.',
    skillIds: ['th-vocabulaire', 'al-identifier', 'ai-identifier'],
    lessonIds: [],
    exerciseIds: ['ex-vocabulaire', 'ex-allures-bases', 'ex-aides'],
    notes: 'Faire d’abord les révisions du jour, puis un exercice sur la notion la plus fragile.',
    advanced: false,
  },
  {
    id: 'tpl-position', title: 'Comprendre la position', icon: '🧍', sessionType: 'travail_general',
    objective: 'Comprendre l’alignement et l’équilibre avant de les travailler avec l’enseignant.',
    skillIds: ['po-position', 'po-equilibre', 'po-defauts'],
    lessonIds: ['fiche-04-position-profil', 'fiche-05-defauts-position'],
    exerciseIds: ['ex-position', 'ex-equilibre'],
    notes: 'Demander à l’enseignant un retour sur un point précis de la position.',
    advanced: false,
  },
  {
    id: 'tpl-transitions', title: 'Comprendre les transitions', icon: '🔁', sessionType: 'dressage',
    objective: 'Préparer des transitions fluides grâce au demi-arrêt.',
    skillIds: ['al-transitions', 'ai-demi-arret'],
    lessonIds: ['fiche-13-transitions-harmonieuses', 'fiche-12-demi-arret-mecanique'],
    exerciseIds: ['ex-transitions', 'ex-renes-demi-arret'],
    notes: 'Visualiser les transitions sur le plan de manège avant la séance.',
    advanced: false,
  },
  {
    id: 'tpl-dressage', title: 'Découverte du dressage', icon: '🎯', sessionType: 'dressage',
    objective: 'Se repérer dans la carrière et comprendre les figures et l’échelle de progression.',
    skillIds: ['dr-lettres', 'dr-figures', 'dr-echelle'],
    lessonIds: ['fiche-14-figures-de-manege', 'fiche-19-echelles-progression'],
    exerciseIds: ['ex-figures-manege', 'ex-echelle-progression'],
    notes: 'Revoir les figures animées dans le manège interactif.',
    advanced: false,
  },
  {
    id: 'tpl-obstacle', title: 'Découverte de l’obstacle', icon: '🚧', sessionType: 'obstacle',
    objective: 'Comprendre les barres au sol et les phases du saut avant une séance encadrée.',
    skillIds: ['ob-barres', 'ob-phases', 'po-equilibre'],
    lessonIds: ['fiche-09-barres-au-sol', 'fiche-22-phases-du-saut'],
    exerciseIds: ['ex-obstacle-bases', 'ex-equilibre'],
    notes: 'Support théorique : hauteurs, distances et exercices sont fixés par l’enseignant.',
    advanced: true,
  },
  {
    id: 'tpl-travail-pied', title: 'Travail à pied', icon: '🚶', sessionType: 'travail_a_pied',
    objective: 'Comprendre la conduite en main et les principes de la longe.',
    skillIds: ['tp-mener', 'tp-longe', 'se-zones'],
    lessonIds: ['fiche-02-mener-en-main', 'fiche-18-technique-longe-cheval'],
    exerciseIds: ['ex-travail-a-pied', 'ex-securite-approche'],
    notes: 'La longe se pratique d’abord sous la surveillance d’un professionnel.',
    advanced: true,
  },
];
