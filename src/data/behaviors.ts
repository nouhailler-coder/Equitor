/**
 * Comportement et langage du cheval.
 * Principe : un signal isolé ne permet pas de conclure avec certitude à un état émotionnel
 * ou médical. Les interprétations proposées sont des pistes, à confronter au contexte et à
 * l'avis d'un professionnel (enseignant, vétérinaire, comportementaliste).
 */
export type BehaviorTheme =
  | 'communication'
  | 'postures'
  | 'expressions'
  | 'oreilles'
  | 'regard'
  | 'mouvements'
  | 'social'
  | 'stress'
  | 'inconfort'
  | 'evitement';

export interface BehaviorIllustration {
  ears: 'avant' | 'une_arriere' | 'plaquees' | 'relachees' | 'mobiles';
  eye: 'normal' | 'blanc' | 'mi_clos';
  head: 'haute' | 'normale' | 'basse';
  mouth?: 'detendue' | 'crispee' | 'mache' | 'baille';
  tail?: 'calme' | 'fouette' | 'haute';
}

export interface Behavior {
  id: string;
  title: string;
  theme: BehaviorTheme;
  illustration: BehaviorIllustration;
  description: string;
  interpretations: string[];
  contexts: string;
  vigilance: string;
  precautions: string;
  /** Situation où l'avis d'un professionnel est recommandé. */
  professional?: string;
}

export const BEHAVIOR_THEMES: { id: BehaviorTheme; label: string }[] = [
  { id: 'communication', label: 'Communication' },
  { id: 'postures', label: 'Postures' },
  { id: 'expressions', label: 'Expressions' },
  { id: 'oreilles', label: 'Oreilles' },
  { id: 'regard', label: 'Regard' },
  { id: 'mouvements', label: 'Mouvements' },
  { id: 'social', label: 'Comportements sociaux' },
  { id: 'stress', label: 'Signaux de stress' },
  { id: 'inconfort', label: 'Signaux d’inconfort' },
  { id: 'evitement', label: 'Évitement' },
];

export const BEHAVIORS: Behavior[] = [
  {
    id: 'oreilles-avant', title: 'Oreilles pointées vers l’avant', theme: 'oreilles',
    illustration: { ears: 'avant', eye: 'normal', head: 'haute' },
    description: 'Les deux oreilles sont dressées et orientées vers ce qui se trouve devant le cheval.',
    interpretations: ['Attention portée vers un élément devant lui', 'Curiosité', 'Vigilance si la tête est haute et le corps tendu'],
    contexts: 'Découverte d’un objet, arrivée d’un congénère, abord d’un obstacle.',
    vigilance: 'Associées à une tête haute, des naseaux dilatés et une immobilité tendue, elles peuvent précéder un écart.',
    precautions: 'Laisser le cheval regarder, garder une attitude calme, parler d’une voix posée.',
  },
  {
    id: 'oreille-cavalier', title: 'Une oreille tournée vers le cavalier', theme: 'oreilles',
    illustration: { ears: 'une_arriere', eye: 'normal', head: 'normale' },
    description: 'Une oreille regarde devant, l’autre est orientée vers le cavalier ou la personne qui le mène.',
    interpretations: ['Écoute partagée entre l’environnement et le cavalier', 'Attention aux aides'],
    contexts: 'Au travail monté ou en main.',
    vigilance: 'Rien de particulier si le reste du corps est détendu.',
    precautions: 'C’est souvent un bon moment pour une demande claire et douce.',
  },
  {
    id: 'oreilles-plaquees', title: 'Oreilles plaquées en arrière', theme: 'oreilles',
    illustration: { ears: 'plaquees', eye: 'blanc', head: 'normale', mouth: 'crispee' },
    description: 'Les oreilles sont couchées à plat contre l’encolure.',
    interpretations: ['Mécontentement ou menace', 'Inconfort ou douleur possible', 'Protection des oreilles (vent, galop rapide)'],
    contexts: 'Approche d’un autre cheval à la mangeoire, sanglage, manipulation d’une zone sensible.',
    vigilance: 'Avec une encolure tendue vers vous, une bouche crispée ou un postérieur levé, un coup ou une morsure est possible.',
    precautions: 'S’écarter calmement, sans geste brusque, et en parler à l’enseignant.',
    professional: 'Si ce comportement apparaît systématiquement lors d’une manipulation (sanglage, pansage d’une zone), une cause physique est à rechercher par un professionnel.',
  },
  {
    id: 'oreilles-relachees', title: 'Oreilles relâchées sur le côté', theme: 'oreilles',
    illustration: { ears: 'relachees', eye: 'mi_clos', head: 'basse', mouth: 'detendue' },
    description: 'Les oreilles tombent légèrement sur les côtés, sans tension.',
    interpretations: ['Détente, somnolence', 'Fatigue', 'Parfois abattement si associé à d’autres signes'],
    contexts: 'Repos au box ou au pré, fin de séance.',
    vigilance: 'Un cheval habituellement vif qui reste prostré, qui ne mange pas ou se regarde le flanc doit être signalé.',
    precautions: 'Le prévenir avant de le toucher pour ne pas le surprendre.',
    professional: 'Abattement inhabituel, perte d’appétit : prévenir le responsable, qui jugera s’il faut appeler le vétérinaire.',
  },
  {
    id: 'oreilles-mobiles', title: 'Oreilles qui bougent sans cesse', theme: 'oreilles',
    illustration: { ears: 'mobiles', eye: 'blanc', head: 'haute' },
    description: 'Les oreilles pivotent rapidement dans toutes les directions.',
    interpretations: ['Vigilance face à un environnement nouveau ou bruyant', 'Inquiétude possible'],
    contexts: 'Nouveau lieu, vent, bruits inhabituels.',
    vigilance: 'Le cheval est prêt à réagir : rester attentif.',
    precautions: 'Lui laisser le temps d’explorer, éviter de le brusquer.',
  },
  {
    id: 'blanc-oeil', title: 'Blanc de l’œil visible', theme: 'regard',
    illustration: { ears: 'avant', eye: 'blanc', head: 'haute' },
    description: 'On aperçoit le blanc de l’œil autour de l’iris.',
    interpretations: ['Peur, surprise ou vigilance accrue', 'Particularité naturelle chez certains chevaux'],
    contexts: 'Bruit soudain, objet inconnu, situation de contrainte.',
    vigilance: 'À interpréter avec la posture : certains chevaux montrent naturellement du blanc.',
    precautions: 'Réduire la pression de la situation, garder ses distances avec l’objet inquiétant.',
  },
  {
    id: 'encolure-basse', title: 'Encolure basse et mâchonnement', theme: 'postures',
    illustration: { ears: 'relachees', eye: 'normal', head: 'basse', mouth: 'mache' },
    description: 'Le cheval descend l’encolure, mâchonne, parfois souffle longuement.',
    interpretations: ['Détente', 'Relâchement après une tension'],
    contexts: 'Retour au calme, fin d’une manipulation, rênes longues.',
    vigilance: 'Ne pas confondre avec un mâchonnement crispé ou des grincements de dents.',
    precautions: 'Souvent le bon moment pour terminer un exercice sur une note positive.',
  },
  {
    id: 'tete-haute', title: 'Tête haute et corps tendu', theme: 'postures',
    illustration: { ears: 'avant', eye: 'blanc', head: 'haute' },
    description: 'Encolure relevée, regard fixé au loin, muscles tendus.',
    interpretations: ['Alerte', 'Préparation à la fuite'],
    contexts: 'Bruit, mouvement au loin, cheval qui s’en va.',
    vigilance: 'Un écart ou un démarrage brusque peut suivre.',
    precautions: 'Rester calme, garder une distance de sécurité, suivre les consignes de l’enseignant.',
  },
  {
    id: 'ebrouement', title: 'S’ébrouer', theme: 'expressions',
    illustration: { ears: 'relachees', eye: 'normal', head: 'basse', mouth: 'detendue' },
    description: 'Expiration bruyante par les naseaux, qui vibrent.',
    interpretations: ['Souvent associé à la détente au travail', 'Dégagement des voies respiratoires (poussière)'],
    contexts: 'Début ou fin de travail, pré poussiéreux.',
    vigilance: 'Différent du « souffle » bref et fort d’un cheval qui découvre un objet inquiétant.',
    precautions: 'Aucune en général ; une toux répétée, elle, se signale.',
    professional: 'Toux répétée, écoulement nasal : à signaler au responsable.',
  },
  {
    id: 'queue-fouettante', title: 'Queue qui fouette', theme: 'inconfort',
    illustration: { ears: 'plaquees', eye: 'normal', head: 'normale', tail: 'fouette' },
    description: 'La queue bat vivement de façon répétée.',
    interpretations: ['Irritation (insectes)', 'Mécontentement face à une demande', 'Inconfort ou douleur possible'],
    contexts: 'Été (insectes), aides trop insistantes, matériel gênant.',
    vigilance: 'Au travail, si elle accompagne chaque demande, la demande ou le matériel sont à revoir avec l’enseignant.',
    precautions: 'Vérifier l’environnement (insectes), alléger les aides, en parler à l’enseignant.',
  },
  {
    id: 'queue-haute', title: 'Queue relevée', theme: 'mouvements',
    illustration: { ears: 'avant', eye: 'normal', head: 'haute', tail: 'haute' },
    description: 'La queue est portée haute, souvent au trot ou au galop en liberté.',
    interpretations: ['Excitation, énergie', 'Jeu ou alerte'],
    contexts: 'Sortie au pré, temps frais, congénères qui galopent.',
    vigilance: 'Le cheval peut être joueur et démonstratif : attention aux gestes vifs.',
    precautions: 'Éviter d’entrer au pré au milieu d’un groupe excité.',
  },
  {
    id: 'pietinement', title: 'Piétinement, gratte le sol', theme: 'stress',
    illustration: { ears: 'mobiles', eye: 'normal', head: 'normale' },
    description: 'Le cheval ne tient pas en place, gratte le sol d’un antérieur.',
    interpretations: ['Impatience (attente du repas)', 'Frustration', 'Inconfort ou douleur possible'],
    contexts: 'Attente attaché, heure du repas, cheval seul.',
    vigilance: 'Associé à des regards vers le flanc, des tentatives de se coucher et de l’agitation, il peut s’agir d’une urgence.',
    precautions: 'Ne pas rester dans la trajectoire des antérieurs.',
    professional: 'Gratte le sol, se regarde le flanc, veut se coucher : prévenir immédiatement le responsable (suspicion de coliques).',
  },
  {
    id: 'baillements', title: 'Bâillements répétés', theme: 'expressions',
    illustration: { ears: 'relachees', eye: 'mi_clos', head: 'normale', mouth: 'baille' },
    description: 'Le cheval ouvre largement la bouche plusieurs fois de suite.',
    interpretations: ['Relâchement après une tension', 'Possible signe d’inconfort digestif ou de stress, selon le contexte'],
    contexts: 'Après le dessanglage, après un moment de stress, au repos.',
    vigilance: 'C’est un exemple typique de signal ambigu : seul, il ne permet pas de conclure.',
    precautions: 'Observer ce qui précède et ce qui suit.',
  },
  {
    id: 'evitement', title: 'Comportement d’évitement', theme: 'evitement',
    illustration: { ears: 'une_arriere', eye: 'blanc', head: 'haute' },
    description: 'Le cheval recule, s’écarte, tourne la tête ou les hanches pour se soustraire à une demande ou un contact.',
    interpretations: ['Peur', 'Incompréhension de la demande', 'Inconfort ou douleur', 'Expérience passée désagréable'],
    contexts: 'Présentation du filet, approche d’un objet, soins.',
    vigilance: 'Ne pas l’interpréter comme de la « mauvaise volonté » sans chercher la cause.',
    precautions: 'Diminuer la pression, revenir à une étape plus simple, demander de l’aide.',
    professional: 'Un évitement nouveau ou croissant justifie l’avis de l’enseignant et, si besoin, d’un vétérinaire ou d’un dentiste équin.',
  },
  {
    id: 'toilettage-mutuel', title: 'Toilettage mutuel', theme: 'social',
    illustration: { ears: 'relachees', eye: 'mi_clos', head: 'normale', mouth: 'mache' },
    description: 'Deux chevaux se grattent mutuellement le garrot ou l’encolure avec les dents.',
    interpretations: ['Lien social', 'Apaisement'],
    contexts: 'Au pré, entre chevaux qui se connaissent.',
    vigilance: 'Un cheval peut vouloir faire de même avec un humain : ne pas l’encourager, les dents peuvent pincer.',
    precautions: 'Se reculer calmement si le cheval cherche à « gratter » une personne.',
  },
  {
    id: 'repos-posterieur', title: 'Postérieur au repos', theme: 'postures',
    illustration: { ears: 'relachees', eye: 'mi_clos', head: 'basse', mouth: 'detendue' },
    description: 'Le cheval repose un postérieur sur la pince du sabot, hanche abaissée.',
    interpretations: ['Repos normal : le cheval peut somnoler debout'],
    contexts: 'Au box, attaché, au pré.',
    vigilance: 'Un cheval qui somnole peut sursauter s’il est surpris.',
    precautions: 'Lui parler avant de l’approcher. Un antérieur constamment soulagé, en revanche, se signale.',
    professional: 'Un cheval qui soulage sans cesse un antérieur ou refuse de poser un pied doit être vu par un professionnel.',
  },
  {
    id: 'signaux-stress', title: 'Un ensemble de signaux de stress', theme: 'stress',
    illustration: { ears: 'mobiles', eye: 'blanc', head: 'haute', mouth: 'crispee', tail: 'fouette' },
    description: 'Plusieurs signaux simultanés : tête haute, blanc de l’œil, naseaux dilatés, queue qui fouette, sudation sans effort, piétinement.',
    interpretations: ['Stress ou peur', 'Douleur possible'],
    contexts: 'Situation nouvelle, transport, séparation des congénères, douleur.',
    vigilance: 'C’est l’ensemble, dans son contexte, qui oriente l’interprétation — jamais un signal seul.',
    precautions: 'Se mettre en sécurité, réduire la pression, prévenir l’encadrement.',
    professional: 'Sudation sans effort, agitation inhabituelle ou signes persistants : prévenir le responsable sans attendre.',
  },
];
