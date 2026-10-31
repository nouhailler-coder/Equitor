import type { DomainId } from '../types/models';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  domain: DomainId;
  skillIds: string[];
  termId?: string;
}

/** Cartes mémoire recto-verso (contenus originaux). */
export const FLASHCARDS: Flashcard[] = [
  { id: 'fc-impulsion', front: 'Qu’est-ce que l’impulsion ?', back: 'L’énergie de propulsion produite par l’arrière-main et transmise vers l’avant par un dos souple. Ce n’est pas la vitesse : un cheval peut aller vite sans impulsion. Notions associées : engagement, cadence, décontraction.', domain: 'dressage', skillIds: ['dr-echelle'], termId: 'term-impulsion' },
  { id: 'fc-echelle', front: 'Citez l’échelle de progression dans l’ordre.', back: 'Rythme → décontraction → contact → impulsion → rectitude → rassembler. Chaque étape s’appuie sur les précédentes.', domain: 'dressage', skillIds: ['dr-echelle'], termId: 'term-echelles-progression' },
  { id: 'fc-rassembler', front: 'Qu’est-ce que le rassembler ?', back: 'Un équilibre où l’arrière-main porte davantage et l’avant-main s’allège. Sommet de l’échelle de progression, il ne s’obtient jamais par la contrainte.', domain: 'dressage', skillIds: ['dr-echelle'], termId: 'term-rassembler' },
  { id: 'fc-rectitude', front: 'Que signifie « un cheval droit » ?', back: 'Ses postérieurs suivent la trace de ses antérieurs, sur les lignes droites comme sur les courbes : il pousse également des deux côtés.', domain: 'dressage', skillIds: ['dr-echelle'], termId: 'term-rectitude' },
  { id: 'fc-pas', front: 'Le pas : combien de temps ? Suspension ?', back: '4 temps, marché, sans temps de suspension. Ordre : postérieur, antérieur du même côté, puis l’autre côté.', domain: 'allures', skillIds: ['al-identifier', 'al-mecanique'], termId: 'term-pas' },
  { id: 'fc-trot', front: 'Le trot : combien de temps ?', back: '2 temps, allure sautée par diagonaux, avec un temps de suspension entre chaque diagonal.', domain: 'allures', skillIds: ['al-identifier'], termId: 'term-trot' },
  { id: 'fc-galop', front: 'Le galop à droite : ordre des posers ?', back: '1) postérieur gauche, 2) diagonal gauche (antérieur gauche + postérieur droit), 3) antérieur droit (meneur), puis suspension.', domain: 'allures', skillIds: ['al-mecanique'], termId: 'term-galop' },
  { id: 'fc-diagonal', front: 'Sur quel diagonal trotte-t-on par convention ?', back: 'Le diagonal extérieur : on s’élève quand l’épaule extérieure se porte en avant. On change de diagonal au changement de main.', domain: 'allures', skillIds: ['al-trot-enleve'], termId: 'term-diagonal' },
  { id: 'fc-transition', front: 'Qu’est-ce qu’une transition réussie ?', back: 'Préparée par des demi-arrêts, à l’endroit prévu, fluide et sans résistance, en gardant rythme et équilibre.', domain: 'allures', skillIds: ['al-transitions'], termId: 'term-transition' },
  { id: 'fc-demi-arret', front: 'À quoi sert le demi-arrêt ?', back: 'À prévenir le cheval et à le rééquilibrer : action brève et coordonnée de l’assiette, des jambes et des doigts, suivie d’un rendu de main.', domain: 'aides', skillIds: ['ai-demi-arret'], termId: 'term-demi-arret' },
  { id: 'fc-aides-nat', front: 'Quelles sont les aides naturelles ?', back: 'Les jambes, les mains, l’assiette (poids du corps) et la voix.', domain: 'aides', skillIds: ['ai-identifier'], termId: 'term-aides-naturelles' },
  { id: 'fc-aides-art', front: 'Rôle des aides artificielles ?', back: 'Renforcer ou préciser une aide naturelle (ex. la cravache rappelle la jambe). Elles ne la remplacent pas et ne servent pas à punir.', domain: 'aides', skillIds: ['ai-identifier'], termId: 'term-aides-artificielles' },
  { id: 'fc-contact', front: 'Qu’est-ce qu’un bon contact ?', back: 'Une liaison élastique et constante entre la main et la bouche : la main suit le mouvement de la tête sans tirer.', domain: 'aides', skillIds: ['ai-renes'], termId: 'term-contact' },
  { id: 'fc-cesser', front: 'Quand le cheval répond à une demande, que fait le cavalier ?', back: 'Il cesse (ou allège) l’aide : c’est ce qui permet au cheval de comprendre qu’il a bien répondu.', domain: 'aides', skillIds: ['ai-coordination'] },
  { id: 'fc-alignement', front: 'Alignement vertical du cavalier vu de profil ?', back: 'Oreille – épaule – hanche – talon.', domain: 'position', skillIds: ['po-position'] },
  { id: 'fc-coude-bouche', front: 'Quelle ligne droite relie le cavalier à la bouche du cheval ?', back: 'Coude – main – bouche du cheval.', domain: 'position', skillIds: ['po-position'] },
  { id: 'fc-assiette', front: 'Qu’est-ce que l’assiette ?', back: 'La capacité du cavalier à rester stable et lié au cheval par le bassin, sans s’agripper ; base de l’indépendance des aides.', domain: 'position', skillIds: ['po-equilibre'], termId: 'term-assiette' },
  { id: 'fc-siege-equilibre', front: 'À quoi sert le siège en équilibre ?', back: 'À soulager le dos du cheval au galop en extérieur et à l’obstacle : le cavalier, buste incliné, s’équilibre sur ses étriers.', domain: 'position', skillIds: ['po-equilibre', 'ob-equilibre'], termId: 'term-siege-equilibre' },
  { id: 'fc-croisement', front: 'Règle de croisement en manège ?', back: 'Main gauche à main gauche. L’allure la plus vive a priorité sur la piste ; garder une longueur de cheval d’écart.', domain: 'securite', skillIds: ['se-manege'] },
  { id: 'fc-approche', front: 'Comment approcher un cheval ?', back: 'Calmement, en lui parlant, par l’avant et un peu de côté, vers l’épaule. Jamais par surprise dans ses angles morts.', domain: 'securite', skillIds: ['se-approche'], termId: 'term-approche' },
  { id: 'fc-angles-morts', front: 'Où sont les angles morts du cheval ?', back: 'Juste derrière lui et juste devant le bout de son nez.', domain: 'securite', skillIds: ['se-zones'], termId: 'term-angle-mort' },
  { id: 'fc-longe-main', front: 'Comment tenir une longe ?', back: 'Pliée en accordéon dans la main, jamais enroulée autour de la main ou des doigts.', domain: 'travail_a_pied', skillIds: ['tp-mener'], termId: 'term-longe' },
  { id: 'fc-attache', front: 'Comment attacher un cheval ?', back: 'Au licol, avec un nœud d’attache rapide qui se défait d’un geste. Jamais par les rênes.', domain: 'securite', skillIds: ['se-approche', 'tp-mener'], termId: 'term-noeud-attache' },
  { id: 'fc-garrot', front: 'Où se trouve le garrot ?', back: 'À la jonction de l’encolure et du dos, au-dessus des épaules. On y mesure la taille du cheval ; la selle doit le dégager.', domain: 'anatomie', skillIds: ['an-regions'], termId: 'term-garrot' },
  { id: 'fc-genou', front: 'Le genou du cheval correspond à quoi chez l’humain ?', back: 'Plutôt au poignet. L’équivalent de notre genou est le grasset, sur le postérieur.', domain: 'anatomie', skillIds: ['an-membres'], termId: 'term-genou' },
  { id: 'fc-fourchette', front: 'Comment cure-t-on un pied ?', back: 'Du talon vers la pince, de part et d’autre de la fourchette, sans la piquer. On observe le pied et le fer au passage.', domain: 'anatomie', skillIds: ['an-pied', 'cc-soins'], termId: 'term-curer' },
  { id: 'fc-barres', front: 'Que sont les barres ?', back: 'La gencive sans dents entre incisives et molaires, où repose le mors. Zone sensible : d’où l’importance d’une main douce.', domain: 'anatomie', skillIds: ['an-tete'], termId: 'term-barres' },
  { id: 'fc-selle', front: 'Citez 5 parties de la selle.', back: 'Pommeau, siège, troussequin, quartiers, panneaux (+ étrivières, étriers, sangle, contre-sanglons).', domain: 'materiel', skillIds: ['ma-selle'], termId: 'term-selle' },
  { id: 'fc-filet', front: 'Citez les parties du filet.', back: 'Têtière, frontal, montants, sous-gorge, muserolle, mors, rênes.', domain: 'materiel', skillIds: ['ma-filet'], termId: 'term-filet' },
  { id: 'fc-pansage', front: 'Ordre d’un pansage simple ?', back: 'Étrille (zones charnues), brosse dure dans le sens du poil, brosse douce, puis crins et pieds.', domain: 'materiel', skillIds: ['ma-pansage'], termId: 'term-pansage' },
  { id: 'fc-talon', front: 'Pourquoi des chaussures à talon ?', back: 'Pour que le pied ne traverse pas l’étrier et ne reste pas coincé en cas de chute.', domain: 'equipement', skillIds: ['eq-tenue'] },
  { id: 'fc-proie', front: 'Pourquoi le cheval peut-il sursauter ou fuir ?', back: 'C’est un animal proie : face à un danger possible, son premier réflexe est la fuite. Il est très sensible aux mouvements et bruits soudains.', domain: 'comportement', skillIds: ['co-proie'], termId: 'term-animal-proie' },
  { id: 'fc-oreilles', front: 'Oreilles plaquées en arrière : que retenir ?', back: 'Possible mécontentement ou menace, surtout avec une posture tendue. On s’écarte calmement ; un signal isolé ne suffit pas à conclure.', domain: 'comportement', skillIds: ['co-oreilles'], termId: 'term-oreilles' },
  { id: 'fc-signal-isole', front: 'Un seul signal suffit-il à juger l’état d’un cheval ?', back: 'Non. On observe un ensemble de signaux dans leur contexte, et on demande l’avis d’un professionnel en cas de doute.', domain: 'comportement', skillIds: ['co-stress'], termId: 'term-signal-stress' },
  { id: 'fc-besoins', front: 'Trois besoins fondamentaux du cheval ?', back: 'Bouger chaque jour, vivre avec des congénères, manger du fourrage en petites quantités tout au long de la journée (et eau propre à volonté).', domain: 'connaissance_cheval', skillIds: ['cc-besoins'] },
  { id: 'fc-alimentation', front: 'Pourquoi changer l’alimentation progressivement ?', back: 'Pour laisser la flore digestive s’adapter et limiter les troubles digestifs. Les rations relèvent du responsable et du vétérinaire.', domain: 'connaissance_cheval', skillIds: ['cc-alimentation'] },
  { id: 'fc-lettres', front: 'Lettres d’une carrière 20 × 40 (à partir de A, main droite) ?', back: 'A, K, E, H, C, M, B, F (sens des aiguilles d’une montre vu du dessus). X est au centre, entre E et B.', domain: 'dressage', skillIds: ['dr-lettres'] },
  { id: 'fc-volte', front: 'Volte, cercle, demi-volte : différences ?', back: 'Cercle : souvent 20 m. Volte : petit cercle de 6 à 10 m. Demi-volte : demi-cercle puis retour oblique à la piste pour changer de main.', domain: 'dressage', skillIds: ['dr-figures'], termId: 'term-volte' },
  { id: 'fc-phases-saut', front: 'Les phases du saut ?', back: 'Abord, battue, planer, réception, reprise.', domain: 'obstacle', skillIds: ['ob-phases'] },
  { id: 'fc-bascule', front: 'Qu’est-ce que la bascule ?', back: 'L’arrondi du dos et de l’encolure du cheval au-dessus de l’obstacle ; le cavalier la favorise en rendant la main.', domain: 'obstacle', skillIds: ['ob-phases', 'ob-equilibre'], termId: 'term-bascule' },
  { id: 'fc-main', front: 'Que veut dire « à main droite » ?', back: 'On tourne dans la carrière avec l’intérieur à sa droite (sens des aiguilles d’une montre vu du dessus).', domain: 'theorie', skillIds: ['th-vocabulaire'], termId: 'term-main' },
  { id: 'fc-avant-arriere', front: 'Avant-main / arrière-main ?', back: 'Avant-main : tête, encolure, épaules, antérieurs. Arrière-main : croupe, hanches, postérieurs (le « moteur »).', domain: 'theorie', skillIds: ['th-vocabulaire'], termId: 'term-arriere-main' },
];
