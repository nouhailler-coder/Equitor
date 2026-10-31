import type { Level } from '../types/models';
import { ARENA_GEOMETRY as G, ARENA_POINTS as P } from './interactiveViews';

/**
 * Figures de manège : supports de compréhension, pas des instructions autonomes de conduite.
 * Les tracés sont exprimés dans le repère de la vue « manege-carriere » (1 m = 8 px).
 */
export interface ArenaFigure {
  id: string;
  name: string;
  /** Chemin SVG du tracé (animé le long de ce chemin). */
  path: string;
  description: string;
  objective: string;
  notions: string[];
  termIds: string[];
  level: Level;
  /** Durée de l'animation en secondes. */
  duration: number;
}

const m = G.scale;
const [Ax, Ay] = P.A;
const [Cx, Cy] = P.C;
const [Xx, Xy] = P.X;
const [Kx, Ky] = P.K;
const [Mx, My] = P.M;
const [Ex, Ey] = P.E;
const [Bx, By] = P.B;
const left = G.x;
const right = G.x + G.w;
const top = G.y;
const bottom = G.y + G.h;
// Arrondi des coins (2 m)
const r = 2 * m;

/** Tour de piste à main droite depuis A (sens horaire vu du dessus). */
const fullTrack = `M${Ax},${bottom} H${left + r} Q${left},${bottom} ${left},${bottom - r} V${top + r} Q${left},${top} ${left + r},${top} H${right - r} Q${right},${top} ${right},${top + r} V${bottom - r} Q${right},${bottom} ${right - r},${bottom} H${Ax}`;

const circle = (cx: number, cy: number, radius: number, sweep: 0 | 1 = 1) =>
  `M${cx},${cy + radius} A${radius},${radius} 0 1,${sweep} ${cx},${cy - radius} A${radius},${radius} 0 1,${sweep} ${cx},${cy + radius}`;

export const ARENA_FIGURES: ArenaFigure[] = [
  {
    id: 'ligne-droite', name: 'Ligne droite (ligne du milieu)', path: `M${Ax},${Ay} L${Cx},${Cy}`,
    description: 'Sur la ligne du milieu, de A à C : le cheval avance droit, sans appui sur le mur.',
    objective: 'Tester et améliorer la rectitude ; préparer l’entrée en reprise.',
    notions: ['Rectitude', 'Regard au loin, vers la lettre visée', 'Jambes et mains égales'],
    termIds: ['term-rectitude'], level: 'debutant', duration: 4,
  },
  {
    id: 'tour-piste', name: 'Tour de piste à main droite', path: fullTrack,
    description: 'Le cavalier suit la piste avec l’intérieur à sa droite : A, K, E, H, C, M, B, F.',
    objective: 'Se repérer dans la carrière, travailler les coins et la régularité.',
    notions: ['Main droite / main gauche', 'Passage des coins', 'Lettres de la carrière'],
    termIds: ['term-main', 'term-piste'], level: 'debutant', duration: 9,
  },
  {
    id: 'cercle', name: 'Cercle de 20 m en A', path: circle(Ax, bottom - 10 * m, 10 * m, 0),
    description: 'Cercle de 20 m de diamètre touchant A et les deux grands côtés.',
    objective: 'Régularité de la courbe, incurvation, rythme constant.',
    notions: ['Pli et incurvation', 'Rythme', 'Regard dans la courbe'],
    termIds: ['term-cercle', 'term-pli'], level: 'debutant', duration: 6,
  },
  {
    id: 'volte', name: 'Volte de 10 m en E', path: circle(Ex + 5 * m, Ey, 5 * m, 0),
    description: 'Petit cercle de 10 m de diamètre partant de E et revenant en E.',
    objective: 'Équilibre et incurvation plus marquée qu’un grand cercle.',
    notions: ['Incurvation', 'Équilibre', 'Préparation par demi-arrêt'],
    termIds: ['term-volte', 'term-incurvation'], level: 'debutant', duration: 4,
  },
  {
    id: 'demi-volte', name: 'Demi-volte en E, retour en K', path: `M${Kx},${Ky} L${Ex},${Ey} A${5 * m},${5 * m} 0 0,1 ${Ex + 10 * m},${Ey} L${Kx},${Ky}`,
    description: 'À main droite, en E : demi-cercle de 10 m vers l’intérieur, puis retour en oblique sur la piste vers K. Le cavalier repart à main gauche.',
    objective: 'Changer de main sur une courbe ; travailler l’équilibre.',
    notions: ['Changement de main', 'Incurvation puis redressement'],
    termIds: ['term-demi-volte', 'term-changement-main'], level: 'debutant', duration: 5,
  },
  {
    id: 'diagonale', name: 'Changement de main par la diagonale K-X-M', path: `M${Ax},${bottom} H${left + r} Q${left},${bottom} ${Kx},${bottom - r} L${Kx},${Ky} L${Xx},${Xy} L${Mx},${My} L${right},${top + r}`,
    description: 'De K à M en passant par X : ligne droite qui fait passer de main droite à main gauche.',
    objective: 'Changer de main en gardant rythme et rectitude.',
    notions: ['Changement de main', 'Rectitude', 'Préparer la nouvelle incurvation'],
    termIds: ['term-diagonale', 'term-changement-main'], level: 'debutant', duration: 6,
  },
  {
    id: 'serpentine', name: 'Serpentine de trois boucles', path: `M${Ax},${bottom} C${left - 10},${bottom - 20} ${left - 10},${bottom - 100} ${Xx},${bottom - 107} C${right + 10},${bottom - 114} ${right + 10},${top + 114} ${Xx},${top + 107} C${left - 10},${top + 100} ${left - 10},${top + 20} ${Cx},${top}`,
    description: 'Trois boucles égales de A à C, en traversant la ligne du milieu.',
    objective: 'Travailler les changements d’incurvation et la souplesse.',
    notions: ['Changement de pli', 'Symétrie des boucles', 'Redresser en traversant la ligne du milieu'],
    termIds: ['term-serpentine', 'term-pli'], level: 'intermediaire', duration: 8,
  },
  {
    id: 'changement-main', name: 'Doubler dans la largeur en E', path: `M${Ex},${Ey + 6 * m} L${Ex},${Ey} L${Bx},${By} L${Bx},${By - 6 * m}`,
    description: 'Traverser la carrière de E à B dans la largeur, puis tourner à l’opposé : on change de main.',
    objective: 'Précision des tournants et de la ligne droite.',
    notions: ['Changement de main', 'Tournant précis', 'Ligne droite'],
    termIds: ['term-changement-main'], level: 'debutant', duration: 4,
  },
  {
    id: 'transitions', name: 'Transitions sur la piste', path: `M${Ax},${bottom} H${right - r} Q${right},${bottom} ${right},${bottom - r} V${top + r}`,
    description: 'Exemple : trot de A à F, transition au pas en B, reprise du trot en M. Les points de transition sont matérialisés par les lettres.',
    objective: 'Préparer les transitions et les réaliser à l’endroit prévu.',
    notions: ['Demi-arrêt', 'Transition montante et descendante', 'Précision'],
    termIds: ['term-transition', 'term-demi-arret'], level: 'debutant', duration: 6,
  },
];
