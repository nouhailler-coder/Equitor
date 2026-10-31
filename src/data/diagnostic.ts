import type { DomainId, ExerciseQuestion } from '../types/models';

/**
 * Questionnaire de diagnostic initial : 2 questions par domaine.
 * Il évalue des connaissances théoriques et ne constitue en aucun cas une certification.
 */
export interface DiagnosticQuestion {
  domain: DomainId;
  skillIds: string[];
  question: ExerciseQuestion;
}

const q = (domain: DomainId, skillIds: string[], question: ExerciseQuestion): DiagnosticQuestion => ({ domain, skillIds, question });

export const DIAGNOSTIC: DiagnosticQuestion[] = [
  q('connaissance_cheval', ['cc-besoins'], { id: 'dg-cc-1', type: 'qcm', prompt: 'Lequel de ces besoins est fondamental pour le cheval ?', options: ['Vivre au contact de congénères', 'Rester au box toute la journée', 'Manger deux gros repas par jour seulement'], correct: [0], explanation: 'Le cheval est un animal grégaire ; il a aussi besoin de bouger et de manger du fourrage tout au long de la journée.' }),
  q('connaissance_cheval', ['cc-alimentation'], { id: 'dg-cc-2', type: 'vrai_faux', prompt: 'Un changement d’alimentation doit être progressif.', answer: true, explanation: 'Un changement brutal peut provoquer des troubles digestifs.' }),
  q('anatomie', ['an-regions'], { id: 'dg-an-1', type: 'qcm', prompt: 'Où se trouve le garrot ?', options: ['À la jonction de l’encolure et du dos', 'Au-dessus de la queue', 'Sous le ventre'], correct: [0], explanation: 'C’est la saillie au-dessus des épaules, où l’on mesure la taille du cheval.' }),
  q('anatomie', ['an-membres'], { id: 'dg-an-2', type: 'qcm', prompt: 'Sur quel membre se trouve le jarret ?', options: ['Le membre antérieur', 'Le membre postérieur'], correct: [1], explanation: 'Le jarret est l’articulation anguleuse du postérieur.' }),
  q('comportement', ['co-proie'], { id: 'dg-co-1', type: 'qcm', prompt: 'Face à un danger, quel est le premier réflexe du cheval ?', options: ['Attaquer', 'Fuir', 'Se coucher'], correct: [1], explanation: 'C’est un animal proie : il fuit d’abord.' }),
  q('comportement', ['co-oreilles', 'co-stress'], { id: 'dg-co-2', type: 'vrai_faux', prompt: 'Un seul signal (comme un bâillement) suffit à connaître l’état émotionnel du cheval.', answer: false, explanation: 'On observe un ensemble de signaux dans leur contexte.' }),
  q('securite', ['se-approche'], { id: 'dg-se-1', type: 'qcm', prompt: 'Comment aborder un cheval ?', options: ['Par l’arrière, sans bruit', 'Par l’avant et un peu de côté, en lui parlant', 'En courant'], correct: [1], explanation: 'Le cheval doit vous voir et vous entendre arriver.' }),
  q('securite', ['se-manege'], { id: 'dg-se-2', type: 'qcm', prompt: 'Comment se croisent deux cavaliers en sens opposé ?', options: ['Main droite à main droite', 'Main gauche à main gauche'], correct: [1], explanation: 'La règle est de se croiser main gauche à main gauche.' }),
  q('materiel', ['ma-selle'], { id: 'dg-ma-1', type: 'qcm', prompt: 'Comment s’appelle l’arrière relevé de la selle ?', options: ['Le pommeau', 'Le troussequin', 'Le quartier'], correct: [1], explanation: 'Le pommeau est à l’avant, le troussequin à l’arrière.' }),
  q('materiel', ['ma-filet', 'ma-pansage'], { id: 'dg-ma-2', type: 'qcm', prompt: 'Quelle pièce du filet passe derrière les oreilles ?', options: ['Le frontal', 'La têtière', 'La muserolle'], correct: [1], explanation: 'La têtière repose sur la nuque, derrière les oreilles.' }),
  q('equipement', ['eq-tenue'], { id: 'dg-eq-1', type: 'qcm', prompt: 'Pourquoi porter des chaussures à talon pour monter ?', options: ['Pour que le pied ne traverse pas l’étrier', 'Par élégance'], correct: [0], explanation: 'Un pied coincé dans l’étrier lors d’une chute est très dangereux.' }),
  q('equipement', ['eq-tenue'], { id: 'dg-eq-2', type: 'vrai_faux', prompt: 'Un casque d’équitation doit toujours être attaché.', answer: true, explanation: 'Un casque non attaché peut tomber lors d’une chute.' }),
  q('allures', ['al-identifier'], { id: 'dg-al-1', type: 'qcm', prompt: 'Combien de temps compte le trot ?', options: ['2', '3', '4'], correct: [0], explanation: 'Le trot est une allure à 2 temps, par diagonaux.' }),
  q('allures', ['al-mecanique'], { id: 'dg-al-2', type: 'vrai_faux', prompt: 'Le pas comporte un temps de suspension.', answer: false, explanation: 'Au pas, le cheval a toujours au moins deux pieds au sol.' }),
  q('position', ['po-position'], { id: 'dg-po-1', type: 'qcm', prompt: 'Vu de profil, quel alignement recherche-t-on ?', options: ['Oreille – épaule – hanche – talon', 'Genou – main – pied', 'Tête – genou – étrier'], correct: [0], explanation: 'Oreille, épaule, hanche et talon alignés verticalement.' }),
  q('position', ['po-equilibre'], { id: 'dg-po-2', type: 'qcm', prompt: 'En cas de déséquilibre, où peut-on se tenir sans gêner le cheval ?', options: ['Aux rênes', 'À la crinière ou au pommeau'], correct: [1], explanation: 'Se tenir aux rênes fait mal à la bouche du cheval.' }),
  q('aides', ['ai-identifier'], { id: 'dg-ai-1', type: 'qcm', prompt: 'Laquelle est une aide naturelle ?', options: ['La cravache', 'L’assiette', 'Les éperons'], correct: [1], explanation: 'Aides naturelles : jambes, mains, assiette, voix.' }),
  q('aides', ['ai-demi-arret'], { id: 'dg-ai-2', type: 'qcm', prompt: 'À quoi sert le demi-arrêt ?', options: ['Arrêter le cheval', 'Prévenir et rééquilibrer le cheval', 'Accélérer'], correct: [1], explanation: 'C’est une action brève et coordonnée des aides.' }),
  q('travail_a_pied', ['tp-mener'], { id: 'dg-tp-1', type: 'vrai_faux', prompt: 'On peut enrouler la longe autour de sa main pour mieux tenir.', answer: false, explanation: 'Jamais : la longe se plie en accordéon.' }),
  q('travail_a_pied', ['tp-mener'], { id: 'dg-tp-2', type: 'qcm', prompt: 'Où se placer pour mener un cheval en main ?', options: ['Devant lui', 'Au niveau de son épaule', 'Derrière lui'], correct: [1], explanation: 'À hauteur de l’épaule, visible et en sécurité.' }),
  q('dressage', ['dr-lettres', 'dr-figures'], { id: 'dg-dr-1', type: 'qcm', prompt: 'Qu’est-ce qu’une volte ?', options: ['Un petit cercle de 6 à 10 m', 'Une ligne droite', 'Un arrêt'], correct: [0], explanation: 'La volte est un petit cercle.' }),
  q('dressage', ['dr-echelle'], { id: 'dg-dr-2', type: 'qcm', prompt: 'Quelle est la première étape de l’échelle de progression ?', options: ['Le rassembler', 'Le rythme', 'L’impulsion'], correct: [1], explanation: 'Rythme, décontraction, contact, impulsion, rectitude, rassembler.' }),
  q('obstacle', ['ob-phases'], { id: 'dg-ob-1', type: 'qcm', prompt: 'Comment s’appelle le dernier appui avant le saut ?', options: ['La battue', 'La réception', 'Le planer'], correct: [0], explanation: 'La battue (ou appel) précède le planer.' }),
  q('obstacle', ['ob-barres'], { id: 'dg-ob-2', type: 'vrai_faux', prompt: 'Les barres au sol servent à travailler le rythme et l’équilibre.', answer: true, explanation: 'C’est un exercice de base, sans hauteur.' }),
  q('theorie', ['th-vocabulaire'], { id: 'dg-th-1', type: 'qcm', prompt: 'Que signifie « à main droite » ?', options: ['On tient les rênes de la main droite', 'L’intérieur de la carrière est à droite du cavalier'], correct: [1], explanation: 'La main désigne le sens de rotation dans la carrière.' }),
  q('theorie', ['th-principes'], { id: 'dg-th-2', type: 'qcm', prompt: 'L’impulsion, c’est…', options: ['La vitesse', 'L’énergie de propulsion venant de l’arrière-main'], correct: [1], explanation: 'Un cheval peut aller vite sans impulsion.' }),
];
