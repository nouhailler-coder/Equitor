import type { Checklist } from '../types/models';

/**
 * Checklists proposées par défaut (modifiables par l'utilisateur, enregistrées en IndexedDB).
 * Elles ne remplacent jamais les procédures du centre équestre ni les consignes de l'enseignant.
 * Les identifiants `chk-*` reprennent ceux de la v1 pour conserver l'état déjà coché.
 */
const item = (id: string, label: string, critical = false) => ({ id, label, critical, checked: false });

const EPOCH = '2026-10-30T00:00:00.000Z';

export const DEFAULT_CHECKLISTS: Checklist[] = [
  {
    id: 'checklist-avant-seance',
    title: 'Avant une séance',
    icon: '🧭',
    description: 'Se préparer soi-même et vérifier l’environnement avant d’aller chercher le cheval.',
    isDefault: true,
    createdAt: EPOCH,
    updatedAt: EPOCH,
    items: [
      item('chk-cav-01', 'Casque d’équitation aux normes, attaché', true),
      item('chk-cav-02', 'Chaussures d’équitation à talon (pas de baskets)', true),
      item('chk-cav-03', 'Gants et tenue adaptée à la météo'),
      item('chk-cav-04', 'Gilet de protection si l’activité ou l’enseignant le demande'),
      item('chk-av-05', 'Consignes de l’enseignant ou du centre équestre écoutées et comprises', true),
      item('chk-sec-01', 'Aire de travail repérée : sol, portes, autres cavaliers, obstacles éventuels', true),
      item('chk-av-07', 'Objectif de la séance relu (programme de préparation)'),
      item('chk-av-08', 'Téléphone en silencieux, rangé en sécurité'),
    ],
  },
  {
    id: 'checklist-preparation-cheval',
    title: 'Préparation du cheval',
    icon: '🐴',
    description: 'De l’approche au harnachement, en suivant toujours les consignes du centre.',
    isDefault: true,
    createdAt: EPOCH,
    updatedAt: EPOCH,
    items: [
      item('chk-pc-01', 'Approche calme, en parlant, par l’avant et un peu de côté (jamais par surprise à l’arrière)', true),
      item('chk-pc-02', 'Cheval attaché avec un nœud qui se défait facilement', true),
      item('chk-pc-03', 'Observation générale : attitude, appétit, membres, plaies visibles — tout doute est signalé à un responsable', true),
      item('chk-pc-04', 'Pansage : étrille, brosse douce, crins, curage des quatre pieds'),
      item('chk-eq-01', 'Tapis bien placé, sans pli, dégagé du garrot'),
      item('chk-eq-02', 'Sangle vérifiée avant de monter, puis à nouveau après quelques minutes', true),
      item('chk-eq-03', 'Filet en place et vérifié par une personne compétente en cas de doute', true),
      item('chk-eq-05', 'Protections propres et posées comme on vous l’a montré'),
      item('chk-pc-09', 'Vérification visuelle du matériel : coutures, boucles, étrivières, rênes', true),
    ],
  },
  {
    id: 'checklist-apres-seance',
    title: 'Après une séance',
    icon: '🌿',
    description: 'Retour au calme, soins, rangement et bilan personnel.',
    isDefault: true,
    createdAt: EPOCH,
    updatedAt: EPOCH,
    items: [
      item('chk-rec-01', 'Retour au calme au pas selon les consignes de l’enseignant', true),
      item('chk-rec-02', 'Desserrer la sangle de quelques trous avant de dessangler complètement'),
      item('chk-rec-03', 'Pieds curés, observation de l’état général après l’effort', true),
      item('chk-rec-05', 'Eau propre à disposition, soins selon les habitudes du centre'),
      item('chk-ap-05', 'Matériel nettoyé et rangé à sa place'),
      item('chk-ap-06', 'Observations notées : comportement, ressenti, éventuelle anomalie à signaler'),
      item('chk-ap-07', 'Bilan rédigé dans le journal (points positifs, à améliorer, prochain objectif)'),
    ],
  },
];
