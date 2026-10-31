/**
 * Atelier du matériel : bibliothèque de connaissances générales.
 * Aucune recommandation individualisée de réglage : l'adaptation du matériel au cheval
 * et au cavalier relève de professionnels (enseignant, sellier, vétérinaire).
 */
export type EquipmentCategory =
  | 'selle'
  | 'filet'
  | 'bridons'
  | 'renes'
  | 'etriers'
  | 'sangles'
  | 'protections'
  | 'licols'
  | 'pansage'
  | 'cavalier';

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  icon: string;
  /** Vue interactive associée (schéma des parties), facultative. */
  viewId?: string;
  description: string;
  fonction: string;
  parts: { name: string; role: string }[];
  usage: string;
  safetyChecks: string[];
  maintenance: string[];
  commonMistakes: string[];
  termIds: string[];
  lessonIds: string[];
  exerciseId?: string;
}

export const EQUIPMENT_CATEGORIES: { id: EquipmentCategory; label: string }[] = [
  { id: 'selle', label: 'Selle' },
  { id: 'filet', label: 'Filet' },
  { id: 'bridons', label: 'Bridons et mors' },
  { id: 'renes', label: 'Rênes' },
  { id: 'etriers', label: 'Étriers et étrivières' },
  { id: 'sangles', label: 'Sangles' },
  { id: 'protections', label: 'Protections' },
  { id: 'licols', label: 'Licols' },
  { id: 'pansage', label: 'Pansage' },
  { id: 'cavalier', label: 'Équipement du cavalier' },
];

export const EQUIPMENT: EquipmentItem[] = [
  {
    id: 'selle', name: 'La selle', category: 'selle', icon: '🪑', viewId: 'materiel-selle',
    description: 'Siège construit autour d’une structure rigide (l’arçon), posé sur le dos du cheval par l’intermédiaire d’un tapis.',
    fonction: 'Répartir le poids du cavalier sur le dos du cheval et lui offrir une assise stable.',
    parts: [
      { name: 'Pommeau', role: 'Avant relevé, qui doit dégager le garrot.' },
      { name: 'Siège', role: 'Partie où s’assoit le cavalier.' },
      { name: 'Troussequin', role: 'Arrière relevé.' },
      { name: 'Quartiers', role: 'Rabats de cuir sous la jambe du cavalier.' },
      { name: 'Panneaux', role: 'Coussins en contact avec le dos, de part et d’autre de la colonne.' },
      { name: 'Contre-sanglons', role: 'Courroies sous les quartiers où s’attache la sangle.' },
    ],
    usage: 'Posée un peu en avant puis glissée vers l’arrière dans le sens du poil, sur un tapis propre et sans pli.',
    safetyChecks: ['Coutures des contre-sanglons et des étrivières en bon état', 'Garrot dégagé', 'Tapis sans pli ni corps étranger', 'Sangle vérifiée avant de monter'],
    maintenance: ['Retirer sueur et poussière après usage', 'Nourrir le cuir régulièrement', 'Ranger sur un porte-selle, à l’abri de l’humidité'],
    commonMistakes: ['Poser la selle trop en arrière, sur le rein', 'Laisser un pli de tapis sous les panneaux', 'Utiliser une selle qui n’est pas adaptée au cheval (à faire vérifier par un professionnel)'],
    termIds: ['term-selle', 'term-pommeau', 'term-troussequin', 'term-quartier', 'term-tapis'],
    lessonIds: ['fiche-03-monter-descendre'],
    exerciseId: 'ex-selle',
  },
  {
    id: 'filet', name: 'Le filet', category: 'filet', icon: '🐴', viewId: 'materiel-filet',
    description: 'Bride la plus courante, composée de courroies de cuir et d’un mors simple.',
    fonction: 'Transmettre les indications de la main du cavalier par l’intermédiaire du mors.',
    parts: [
      { name: 'Têtière', role: 'Passe derrière les oreilles, sur la nuque.' },
      { name: 'Frontal', role: 'Sur le front, sous les oreilles.' },
      { name: 'Montants', role: 'Relient la têtière au mors, le long des joues.' },
      { name: 'Sous-gorge', role: 'Sous la gorge ; empêche le filet de passer par-dessus les oreilles.' },
      { name: 'Muserolle', role: 'Entoure le chanfrein, au-dessus du mors.' },
      { name: 'Mors', role: 'Dans la bouche, repose sur la langue et les barres.' },
    ],
    usage: 'Mis après avoir passé les rênes sur l’encolure ; le mors s’engage doucement, sans heurter les dents.',
    safetyChecks: ['Cuir non fendillé aux boucles', 'Mors propre, sans arête ni usure', 'Ajustement vérifié par une personne compétente'],
    maintenance: ['Rincer le mors après chaque usage', 'Nettoyer et nourrir le cuir', 'Démonter et vérifier les boucles régulièrement'],
    commonMistakes: ['Frontal trop court qui tire sur les oreilles', 'Muserolle trop serrée', 'Heurter les dents en passant le mors'],
    termIds: ['term-filet', 'term-tetiere', 'term-frontal', 'term-muserolle', 'term-sous-gorge', 'term-mors'],
    lessonIds: ['fiche-11-tenue-des-renes'],
    exerciseId: 'ex-filet',
  },
  {
    id: 'mors', name: 'Bridons et mors', category: 'bridons', icon: '🔩',
    description: 'Le mors est la pièce métallique ou synthétique placée dans la bouche ; le « bridon » désigne un filet simple et son mors.',
    fonction: 'Relier la main du cavalier à la bouche du cheval.',
    parts: [
      { name: 'Canon du mors', role: 'Partie dans la bouche (droite, brisée, à double brisure…).' },
      { name: 'Anneaux', role: 'Où s’attachent les montants et les rênes.' },
    ],
    usage: 'Le choix du mors relève de professionnels ; la qualité de la main compte plus que l’embouchure.',
    safetyChecks: ['Absence d’usure tranchante ou de jeu anormal', 'Anneaux qui tournent sans pincer les commissures'],
    maintenance: ['Rincer après chaque utilisation', 'Contrôler l’usure au niveau de la brisure'],
    commonMistakes: ['Croire qu’un mors plus « fort » règle un problème de main ou d’équilibre', 'Changer de mors sans avis professionnel'],
    termIds: ['term-mors', 'term-barres', 'term-contact'],
    lessonIds: ['fiche-11-tenue-des-renes'],
  },
  {
    id: 'renes', name: 'Les rênes', category: 'renes', icon: '〰️',
    description: 'Courroies (cuir, toile, caoutchouc) reliant le mors aux mains.',
    fonction: 'Transmettre les indications de la main : direction, ralentissement, contact.',
    parts: [{ name: 'Rênes', role: 'Bouclées ou cousues aux anneaux du mors, avec une boucle centrale.' }],
    usage: 'Tenues entre les doigts, pouces dessus ; on les ajuste pour garder un contact moelleux.',
    safetyChecks: ['Coutures et boucles solides', 'Longueur sans excédent qui pourrait accrocher le pied'],
    maintenance: ['Nettoyer le cuir', 'Remplacer des rênes usées'],
    commonMistakes: ['Se tenir aux rênes pour garder l’équilibre', 'Attacher le cheval par les rênes'],
    termIds: ['term-renes', 'term-contact', 'term-rene-ouverture'],
    lessonIds: ['fiche-11-tenue-des-renes'],
  },
  {
    id: 'etriers', name: 'Étriers et étrivières', category: 'etriers', icon: '🦶',
    description: 'L’étrier reçoit le pied ; l’étrivière le suspend à la selle.',
    fonction: 'Offrir un appui léger au cavalier, sans servir de tremplin.',
    parts: [
      { name: 'Étrier', role: 'Anneau qui reçoit le pied.' },
      { name: 'Étrivière', role: 'Courroie réglable fixée au porte-étrivière de la selle.' },
    ],
    usage: 'La longueur se règle selon l’activité, avec l’aide de l’enseignant.',
    safetyChecks: ['Chaussures à talon pour que le pied ne traverse pas l’étrier', 'Porte-étrivière qui libère l’étrivière en cas de chute (sécurité ouverte)', 'Trous et coutures des étrivières en bon état'],
    maintenance: ['Nettoyer le cuir des étrivières', 'Remonter les étriers quand le cheval est mené en main'],
    commonMistakes: ['Chausser l’étrier trop profond', 'Laisser pendre les étriers en menant en main'],
    termIds: ['term-etrier', 'term-etriviere'],
    lessonIds: ['fiche-03-monter-descendre'],
  },
  {
    id: 'sangles', name: 'La sangle', category: 'sangles', icon: '🔗',
    description: 'Bande passant sous le thorax, bouclée aux contre-sanglons de chaque côté.',
    fonction: 'Maintenir la selle en place.',
    parts: [{ name: 'Sangle', role: 'Bande en cuir, tissu ou matière synthétique, avec deux boucles à chaque extrémité.' }],
    usage: 'Se serre progressivement : à l’écurie, avant de monter, puis après quelques minutes de travail.',
    safetyChecks: ['Absence d’usure ou de déchirure', 'Boucles et ardillons en bon état', 'Pas de pli de peau pincé derrière le coude'],
    maintenance: ['Nettoyer la sueur après usage', 'Laisser sécher à plat'],
    commonMistakes: ['Sangler d’un coup, trop fort', 'Oublier de vérifier la sangle avant de monter'],
    termIds: ['term-sangle'],
    lessonIds: ['fiche-03-monter-descendre'],
  },
  {
    id: 'protections', name: 'Protections des membres', category: 'protections', icon: '🦵',
    description: 'Guêtres, protège-boulets, cloches et bandes protègent les membres des chocs et atteintes.',
    fonction: 'Limiter les blessures lors du travail.',
    parts: [
      { name: 'Guêtres', role: 'Couvrent canon et tendons.' },
      { name: 'Protège-boulets', role: 'Protègent la face interne du boulet.' },
      { name: 'Cloches', role: 'Couvrent couronne et talons.' },
    ],
    usage: 'Propres, posées symétriquement, comme l’enseignant l’a montré. Les bandes demandent un apprentissage encadré.',
    safetyChecks: ['Pas de sable ni de copeaux à l’intérieur', 'Fermetures bien attachées', 'Pas de protection trop serrée'],
    maintenance: ['Brosser l’intérieur après usage', 'Laver selon les indications du fabricant'],
    commonMistakes: ['Poser des protections sales', 'Garder les protections trop longtemps après le travail'],
    termIds: ['term-guetres', 'term-cloches'],
    lessonIds: [],
  },
  {
    id: 'licol', name: 'Licol et longe', category: 'licols', icon: '🪢',
    description: 'Harnachement de tête sans mors, utilisé avec une longe pour attacher et mener.',
    fonction: 'Manipuler le cheval au sol en sécurité.',
    parts: [
      { name: 'Licol', role: 'Têtière, muserolle et sous-gorge reliées par un anneau sous le menton.' },
      { name: 'Longe', role: 'Corde ou sangle fixée à l’anneau par un mousqueton.' },
    ],
    usage: 'La longe se tient pliée en accordéon, jamais enroulée autour de la main ; on attache avec un nœud d’attache rapide.',
    safetyChecks: ['Mousqueton qui s’ouvre et se ferme bien', 'Licol ni trop lâche ni trop serré'],
    maintenance: ['Laver et vérifier les coutures', 'Remplacer une longe effilochée'],
    commonMistakes: ['Enrouler la longe autour de la main', 'Laisser un licol au pré sans système de sécurité adapté'],
    termIds: ['term-licol', 'term-longe', 'term-noeud-attache'],
    lessonIds: ['fiche-02-mener-en-main'],
    exerciseId: 'ex-travail-a-pied',
  },
  {
    id: 'pansage', name: 'Matériel de pansage', category: 'pansage', icon: '🪮',
    description: 'Étrille, brosses, peigne, cure-pied et éponge pour soigner le cheval.',
    fonction: 'Nettoyer, masser et observer le cheval.',
    parts: [
      { name: 'Étrille', role: 'Décolle poussière et poils morts sur les zones charnues.' },
      { name: 'Brosse dure (bouchon)', role: 'Chasse la poussière dans le sens du poil.' },
      { name: 'Brosse douce', role: 'Finition et tête.' },
      { name: 'Cure-pied', role: 'Nettoie le dessous des pieds.' },
      { name: 'Peigne', role: 'Démêle crinière et queue (avec douceur).' },
    ],
    usage: 'Étrille, brosse dure, brosse douce, puis crins et pieds ; toujours en observant le cheval.',
    safetyChecks: ['Se placer sur le côté, jamais derrière', 'Garder un contact de la main sur le cheval en passant autour'],
    maintenance: ['Nettoyer les brosses régulièrement', 'Un kit par cheval limite la transmission de maladies de peau'],
    commonMistakes: ['Étriller les membres ou la tête', 'Curer de la pince vers le talon'],
    termIds: ['term-pansage', 'term-etrille', 'term-bouchon', 'term-curer'],
    lessonIds: [],
    exerciseId: 'ex-pansage',
  },
  {
    id: 'equipement-cavalier', name: 'Équipement du cavalier', category: 'cavalier', icon: '🪖',
    description: 'Casque, chaussures à talon, gants, gilet de protection selon l’activité.',
    fonction: 'Protéger le cavalier en cas de chute ou de geste du cheval.',
    parts: [
      { name: 'Casque', role: 'Aux normes en vigueur, à la bonne taille, toujours attaché.' },
      { name: 'Chaussures', role: 'À talon, pour que le pied ne traverse pas l’étrier.' },
      { name: 'Gilet de protection', role: 'Protège le tronc ; obligatoire dans certaines activités.' },
      { name: 'Gants', role: 'Meilleure tenue des rênes et protection des mains.' },
    ],
    usage: 'S’équiper avant d’aller chercher le cheval.',
    safetyChecks: ['Casque attaché et non endommagé', 'Lacets rangés', 'Pas de bijoux qui pourraient accrocher'],
    maintenance: ['Remplacer un casque après un choc important', 'Respecter la durée de vie indiquée par le fabricant'],
    commonMistakes: ['Monter en baskets', 'Casque posé sans être attaché'],
    termIds: ['term-casque', 'term-gilet'],
    lessonIds: ['fiche-24-fondamentaux-cross'],
    exerciseId: 'ex-equipement-cavalier',
  },
];
