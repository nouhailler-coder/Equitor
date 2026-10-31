import type { Domain, DomainId, Skill } from '../types/models';

export const DOMAINS: Domain[] = [
  { id: 'connaissance_cheval', label: 'Connaissance du cheval', icon: '🐴', description: 'Besoins fondamentaux, mode de vie, alimentation et soins de base.' },
  { id: 'anatomie', label: 'Anatomie', icon: '🦴', description: 'Régions du corps, membres, pieds et grandes fonctions.' },
  { id: 'comportement', label: 'Comportement', icon: '👂', description: 'Langage corporel, perception, vie sociale et signaux d’inconfort.' },
  { id: 'securite', label: 'Sécurité', icon: '🦺', description: 'Approche, zones de vigilance, règles de manège et vérifications.' },
  { id: 'materiel', label: 'Matériel', icon: '🧰', description: 'Selle, filet, licol, protections et matériel de pansage.' },
  { id: 'equipement', label: 'Équipement du cavalier', icon: '🪖', description: 'Casque, chaussures, gilet et tenue adaptée.' },
  { id: 'allures', label: 'Allures', icon: '🏇', description: 'Pas, trot, galop : rythme, temps et transitions.' },
  { id: 'position', label: 'Position du cavalier', icon: '🧍', description: 'Assiette, alignement, équilibre et indépendance des aides.' },
  { id: 'aides', label: 'Aides', icon: '🤝', description: 'Jambes, mains, assiette, voix et leur coordination.' },
  { id: 'travail_a_pied', label: 'Travail à pied', icon: '🚶', description: 'Mener en main, longe et éducation au sol.' },
  { id: 'dressage', label: 'Dressage', icon: '🎯', description: 'Figures, échelle de progression et mouvements de base.' },
  { id: 'obstacle', label: 'Obstacle', icon: '🚧', description: 'Barres au sol, phases du saut et équilibre du cavalier.' },
  { id: 'theorie', label: 'Théorie équestre', icon: '📘', description: 'Vocabulaire, principes et culture équestre.' },
];

export const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map((d) => [d.id, d])) as Record<DomainId, Domain>;

type SkillDef = Omit<Skill, 'exerciseIds'>;

/**
 * Référentiel de compétences (connaissances théoriques et compréhension).
 * Il ne constitue pas une certification : les niveaux sont indicatifs.
 * Les exercices associés sont déduits des exercices qui déclarent la compétence (voir catalog.ts).
 */
export const SKILL_DEFS: SkillDef[] = [
  // Connaissance du cheval
  { id: 'cc-besoins', name: 'Comprendre les besoins fondamentaux', description: 'Citer les besoins essentiels du cheval : mouvement, contacts sociaux, alimentation fibreuse en continu, eau, abri.', domain: 'connaissance_cheval', level: 'debutant', prerequisites: [], lessonIds: [] },
  { id: 'cc-alimentation', name: 'Connaître les bases de l’alimentation', description: 'Expliquer pourquoi le fourrage est la base de la ration et pourquoi les changements doivent être progressifs.', domain: 'connaissance_cheval', level: 'debutant', prerequisites: ['cc-besoins'], lessonIds: [] },
  { id: 'cc-soins', name: 'Connaître les soins courants', description: 'Décrire le pansage, le curage des pieds et l’observation quotidienne ; savoir quand alerter un professionnel.', domain: 'connaissance_cheval', level: 'debutant', prerequisites: [], lessonIds: ['fiche-20-echauffement-recuperation'] },
  { id: 'cc-robes', name: 'Reconnaître les robes de base', description: 'Distinguer alezan, bai, noir et gris, et quelques marques (liste, balzane).', domain: 'connaissance_cheval', level: 'intermediaire', prerequisites: [], lessonIds: [] },

  // Anatomie
  { id: 'an-regions', name: 'Identifier les principales parties du corps', description: 'Nommer et situer tête, encolure, garrot, dos, rein, croupe, épaule, flanc, membres.', domain: 'anatomie', level: 'debutant', prerequisites: [], lessonIds: [] },
  { id: 'an-membres', name: 'Connaître les régions des membres', description: 'Situer genou, jarret, canon, boulet, paturon, couronne et sabot.', domain: 'anatomie', level: 'intermediaire', prerequisites: ['an-regions'], lessonIds: [] },
  { id: 'an-pied', name: 'Comprendre le pied du cheval', description: 'Décrire la paroi, la sole et la fourchette, et l’intérêt du curage.', domain: 'anatomie', level: 'intermediaire', prerequisites: ['an-membres'], lessonIds: [] },
  { id: 'an-tete', name: 'Situer les régions de la tête', description: 'Nommer chanfrein, naseaux, ganache, nuque, toupet, barres.', domain: 'anatomie', level: 'intermediaire', prerequisites: ['an-regions'], lessonIds: [] },
  { id: 'an-locomotion', name: 'Comprendre le rôle du dos et de l’arrière-main', description: 'Expliquer que l’arrière-main propulse et que le dos transmet le mouvement.', domain: 'anatomie', level: 'confirme', prerequisites: ['an-regions'], lessonIds: ['fiche-15-mecanique-allures', 'fiche-19-echelles-progression'] },

  // Comportement
  { id: 'co-proie', name: 'Comprendre le cheval, animal de fuite', description: 'Relier la vision panoramique, la réactivité et la fuite à la vie de proie.', domain: 'comportement', level: 'debutant', prerequisites: [], lessonIds: [] },
  { id: 'co-oreilles', name: 'Lire les oreilles et l’expression', description: 'Interpréter avec prudence le port des oreilles, l’œil, les naseaux et la bouche.', domain: 'comportement', level: 'debutant', prerequisites: ['co-proie'], lessonIds: [] },
  { id: 'co-stress', name: 'Repérer des signaux de stress ou d’inconfort', description: 'Reconnaître un ensemble de signaux (queue fouettante, tension, sudation…) sans conclure à partir d’un seul.', domain: 'comportement', level: 'intermediaire', prerequisites: ['co-oreilles'], lessonIds: [] },
  { id: 'co-social', name: 'Comprendre la vie sociale du cheval', description: 'Décrire la vie en groupe, la hiérarchie souple et l’importance des congénères.', domain: 'comportement', level: 'intermediaire', prerequisites: ['co-proie'], lessonIds: [] },

  // Sécurité
  { id: 'se-approche', name: 'Comprendre les règles d’approche', description: 'Approcher calmement, en parlant, par l’avant et un peu de côté.', domain: 'securite', level: 'debutant', prerequisites: [], lessonIds: ['fiche-02-mener-en-main'] },
  { id: 'se-zones', name: 'Identifier les zones de vigilance', description: 'Connaître les angles morts et les zones à risque autour du cheval.', domain: 'securite', level: 'debutant', prerequisites: ['se-approche'], lessonIds: ['fiche-02-mener-en-main'] },
  { id: 'se-manege', name: 'Connaître les règles de circulation en manège', description: 'Croisement main gauche à main gauche, priorités, distances, annonce des entrées.', domain: 'securite', level: 'debutant', prerequisites: [], lessonIds: ['fiche-01-regles-manege'] },
  { id: 'se-verifications', name: 'Connaître les vérifications du matériel', description: 'Lister les points à vérifier avant de monter : sangle, filet, étrivières, état général.', domain: 'securite', level: 'debutant', prerequisites: ['ma-selle', 'ma-filet'], lessonIds: ['fiche-03-monter-descendre'] },
  { id: 'se-risques', name: 'Comprendre les comportements à risque', description: 'Identifier les situations où l’encadrement d’un professionnel est indispensable.', domain: 'securite', level: 'intermediaire', prerequisites: ['co-stress'], lessonIds: ['fiche-17-etapes-debourrage'] },

  // Matériel
  { id: 'ma-selle', name: 'Connaître les parties de la selle', description: 'Nommer pommeau, siège, troussequin, quartiers, panneaux, étrivières, sangle.', domain: 'materiel', level: 'debutant', prerequisites: [], lessonIds: [] },
  { id: 'ma-filet', name: 'Connaître les parties du filet', description: 'Nommer têtière, frontal, montants, sous-gorge, muserolle, mors, rênes.', domain: 'materiel', level: 'debutant', prerequisites: [], lessonIds: ['fiche-11-tenue-des-renes'] },
  { id: 'ma-pansage', name: 'Connaître le matériel de pansage', description: 'Associer étrille, brosse dure, brosse douce, cure-pied, peigne à leur usage.', domain: 'materiel', level: 'debutant', prerequisites: [], lessonIds: [] },
  { id: 'ma-protections', name: 'Connaître les protections et le licol', description: 'Distinguer guêtres, cloches, bandes, licol et longe, et leurs précautions d’usage.', domain: 'materiel', level: 'intermediaire', prerequisites: [], lessonIds: [] },
  { id: 'ma-entretien', name: 'Comprendre l’entretien du matériel', description: 'Expliquer pourquoi et comment nettoyer et contrôler le cuir et les sangles.', domain: 'materiel', level: 'intermediaire', prerequisites: ['ma-selle', 'ma-filet'], lessonIds: [] },

  // Équipement
  { id: 'eq-tenue', name: 'Connaître l’équipement de sécurité du cavalier', description: 'Casque aux normes, chaussures à talon, gilet selon l’activité, gants.', domain: 'equipement', level: 'debutant', prerequisites: [], lessonIds: ['fiche-24-fondamentaux-cross'] },

  // Allures
  { id: 'al-identifier', name: 'Identifier les principales allures', description: 'Distinguer pas, trot et galop et leur nombre de temps.', domain: 'allures', level: 'debutant', prerequisites: [], lessonIds: ['fiche-15-mecanique-allures'] },
  { id: 'al-mecanique', name: 'Comprendre la mécanique des allures', description: 'Décrire la succession des posers, les diagonaux et le temps de suspension.', domain: 'allures', level: 'intermediaire', prerequisites: ['al-identifier'], lessonIds: ['fiche-15-mecanique-allures'] },
  { id: 'al-transitions', name: 'Comprendre les transitions', description: 'Expliquer la préparation, la fluidité et l’intérêt des transitions.', domain: 'allures', level: 'debutant', prerequisites: ['al-identifier'], lessonIds: ['fiche-13-transitions-harmonieuses'] },
  { id: 'al-variations', name: 'Connaître les variations d’allure', description: 'Distinguer allure de travail, rassemblée, moyenne et allongée.', domain: 'allures', level: 'confirme', prerequisites: ['al-mecanique'], lessonIds: ['fiche-16-variations-allures'] },
  { id: 'al-trot-enleve', name: 'Comprendre le trot enlevé et le diagonal', description: 'Expliquer le principe du trot enlevé et du changement de diagonal.', domain: 'allures', level: 'debutant', prerequisites: ['al-identifier'], lessonIds: ['fiche-06-trot-enleve-assis'] },

  // Position
  { id: 'po-position', name: 'Comprendre la position du cavalier', description: 'Décrire l’alignement oreille-épaule-hanche-talon et la décontraction.', domain: 'position', level: 'debutant', prerequisites: [], lessonIds: ['fiche-04-position-profil'] },
  { id: 'po-equilibre', name: 'Comprendre l’équilibre', description: 'Expliquer le rôle du centre de gravité, de l’assiette et du siège en équilibre.', domain: 'position', level: 'intermediaire', prerequisites: ['po-position'], lessonIds: ['fiche-08-decouverte-galop', 'fiche-07-longe-cavalier'] },
  { id: 'po-defauts', name: 'Reconnaître les défauts de position', description: 'Identifier les défauts courants et leurs effets sur le cheval.', domain: 'position', level: 'intermediaire', prerequisites: ['po-position'], lessonIds: ['fiche-05-defauts-position'] },

  // Aides
  { id: 'ai-identifier', name: 'Identifier les aides', description: 'Distinguer aides naturelles et artificielles et leur rôle.', domain: 'aides', level: 'debutant', prerequisites: [], lessonIds: ['fiche-10-aides-naturelles'] },
  { id: 'ai-renes', name: 'Comprendre la tenue des rênes et le contact', description: 'Expliquer un contact moelleux et la différence avec des rênes longues.', domain: 'aides', level: 'debutant', prerequisites: ['ai-identifier'], lessonIds: ['fiche-11-tenue-des-renes'] },
  { id: 'ai-demi-arret', name: 'Comprendre le demi-arrêt', description: 'Expliquer le but du demi-arrêt et la coordination des aides qu’il suppose.', domain: 'aides', level: 'intermediaire', prerequisites: ['ai-renes'], lessonIds: ['fiche-12-demi-arret-mecanique'] },
  { id: 'ai-coordination', name: 'Comprendre la coordination des aides', description: 'Expliquer l’indépendance des aides et la cessation de la demande quand le cheval répond.', domain: 'aides', level: 'intermediaire', prerequisites: ['ai-identifier', 'po-position'], lessonIds: ['fiche-10-aides-naturelles', 'fiche-07-longe-cavalier'] },

  // Travail à pied
  { id: 'tp-mener', name: 'Comprendre la conduite en main', description: 'Position du meneur, tenue de la longe, tourner en poussant le cheval.', domain: 'travail_a_pied', level: 'debutant', prerequisites: ['se-approche'], lessonIds: ['fiche-02-mener-en-main'] },
  { id: 'tp-longe', name: 'Comprendre les principes du travail à la longe', description: 'Triangle de longe, matériel, sécurité : supports théoriques à pratiquer encadré.', domain: 'travail_a_pied', level: 'intermediaire', prerequisites: ['tp-mener'], lessonIds: ['fiche-18-technique-longe-cheval'] },

  // Dressage
  { id: 'dr-figures', name: 'Connaître les figures de manège', description: 'Reconnaître cercle, volte, demi-volte, diagonale, serpentine, changement de main.', domain: 'dressage', level: 'debutant', prerequisites: ['dr-lettres'], lessonIds: ['fiche-14-figures-de-manege'] },
  { id: 'dr-lettres', name: 'Se repérer dans la carrière', description: 'Connaître les lettres du rectangle 20 × 40 et les lignes de référence.', domain: 'dressage', level: 'debutant', prerequisites: [], lessonIds: ['fiche-14-figures-de-manege'] },
  { id: 'dr-echelle', name: 'Connaître l’échelle de progression', description: 'Citer dans l’ordre rythme, décontraction, contact, impulsion, rectitude, rassembler.', domain: 'dressage', level: 'intermediaire', prerequisites: ['al-identifier'], lessonIds: ['fiche-19-echelles-progression'] },
  { id: 'dr-lateraux', name: 'Comprendre les premiers mouvements latéraux', description: 'Décrire cession à la jambe et épaule en dedans (compréhension, pas de pratique seul).', domain: 'dressage', level: 'confirme', prerequisites: ['dr-echelle', 'ai-coordination'], lessonIds: ['fiche-21-mouvements-lateraux'] },

  // Obstacle
  { id: 'ob-barres', name: 'Comprendre le travail sur barres au sol', description: 'Expliquer l’intérêt des barres pour le rythme et l’équilibre.', domain: 'obstacle', level: 'intermediaire', prerequisites: ['al-identifier'], lessonIds: ['fiche-09-barres-au-sol'] },
  { id: 'ob-phases', name: 'Connaître les phases du saut', description: 'Citer abord, battue, planer, réception, reprise.', domain: 'obstacle', level: 'intermediaire', prerequisites: ['ob-barres'], lessonIds: ['fiche-22-phases-du-saut'] },
  { id: 'ob-equilibre', name: 'Comprendre l’équilibre du cavalier à l’obstacle', description: 'Expliquer le siège en équilibre et le rendu de main.', domain: 'obstacle', level: 'confirme', prerequisites: ['ob-phases', 'po-equilibre'], lessonIds: ['fiche-22-phases-du-saut', 'fiche-23-resoudre-problemes-obstacle'] },

  // Théorie
  { id: 'th-vocabulaire', name: 'Maîtriser le vocabulaire de base', description: 'Utiliser correctement main, piste, rêne d’ouverture, assiette, impulsion…', domain: 'theorie', level: 'debutant', prerequisites: [], lessonIds: [] },
  { id: 'th-principes', name: 'Connaître les grands principes de l’équitation classique', description: 'Légèreté, calme, en avant et droit ; respect du cheval.', domain: 'theorie', level: 'intermediaire', prerequisites: ['th-vocabulaire'], lessonIds: ['fiche-19-echelles-progression'] },
];
