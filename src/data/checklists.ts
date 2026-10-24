import type { ChecklistItem } from '../types';

export const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  // Cavalier
  {
    id: 'chk-cav-01',
    label: 'Casque ou bombe d’équitation homologué (norme CE), jugulaire ajustée à deux doigts du menton',
    category: 'cavalier',
    critical: true,
  },
  {
    id: 'chk-cav-02',
    label: 'Bottes ou bottines d’équitation avec talon décroché (au moins 1,5 cm) pour éviter le coincement dans l’étrier',
    category: 'cavalier',
    critical: true,
  },
  {
    id: 'chk-cav-03',
    label: 'Gants d’équitation propres et renforcés pour la prise des rênes',
    category: 'cavalier',
    critical: false,
  },
  {
    id: 'chk-cav-04',
    label: 'Gilet de protection ajusté (obligatoire en cross ou saut selon niveau)',
    category: 'cavalier',
    critical: false,
  },

  // Cheval & Harnachement
  {
    id: 'chk-eq-01',
    label: 'Tapis bien dégarrotté au sommet du garrot (pas de pression directe sur les vertèbres)',
    category: 'cheval_materiel',
    critical: true,
  },
  {
    id: 'chk-eq-02',
    label: 'Sanglage vérifié une première fois à l’écurie, puis ressanglage progressif après 5 min de pas',
    category: 'cheval_materiel',
    critical: true,
  },
  {
    id: 'chk-eq-03',
    label: 'Filet correctement ajusté : mors à la commissure avec 1 à 2 plis souples, sous-gorge laissant passer un poing',
    category: 'cheval_materiel',
    critical: true,
  },
  {
    id: 'chk-eq-04',
    label: 'Muserolle bien réglée : deux doigts à plat doivent pouvoir passer entre le chanfrein et la muserolle',
    category: 'cheval_materiel',
    critical: true,
  },
  {
    id: 'chk-eq-05',
    label: 'Protections des membres (guêtres, protège-boulets ou bandes) propres sans grain de sable et posées symétriquement',
    category: 'cheval_materiel',
    critical: false,
  },

  // Carrière & Sécurité
  {
    id: 'chk-sec-01',
    label: 'Porte de la carrière fermée et verrouillée avant de détacher ou monter le cheval',
    category: 'manege_securite',
    critical: true,
  },
  {
    id: 'chk-sec-02',
    label: 'Annonce claire à haute voix avant d’ouvrir la porte (« Porte s’il vous plaît ! »)',
    category: 'manege_securite',
    critical: true,
  },
  {
    id: 'chk-sec-03',
    label: 'Usage d’un montoir pour préserver le dos du cheval',
    category: 'manege_securite',
    critical: false,
  },
  {
    id: 'chk-sec-04',
    label: 'Respect de la distance de sécurité de 3 mètres (une longueur de cheval) en permanence',
    category: 'manege_securite',
    critical: true,
  },

  // Soins & Récupération
  {
    id: 'chk-rec-01',
    label: '10 minutes de pas actif sur rênes longues pour dissiper la chaleur et l’acide lactique',
    category: 'recuperation',
    critical: true,
  },
  {
    id: 'chk-rec-02',
    label: 'Dessangler de quelques trous dès la fin du travail actif avant de descendre de cheval',
    category: 'recuperation',
    critical: false,
  },
  {
    id: 'chk-rec-03',
    label: 'Curer les 4 pieds et vérifier l’absence de caillou coincé dans la fourchette ou de fer branlant',
    category: 'recuperation',
    critical: true,
  },
  {
    id: 'chk-rec-04',
    label: 'Palpation des 4 membres : vérifier l’absence de molette chaude, de tendon douloureux ou d’engorgement',
    category: 'recuperation',
    critical: true,
  },
  {
    id: 'chk-rec-05',
    label: 'Bouchonner ou doucher les membres selon la température, vérifier la mise à disposition d’eau propre',
    category: 'recuperation',
    critical: false,
  },
];
