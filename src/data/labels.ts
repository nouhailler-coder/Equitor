import type { Discipline, Experience, HorseSex, SessionType } from '../types/models';

export const SESSION_TYPES: { id: SessionType; label: string; icon: string }[] = [
  { id: 'dressage', label: 'Dressage', icon: '🎯' },
  { id: 'obstacle', label: 'Saut d’obstacles', icon: '🚧' },
  { id: 'travail_a_pied', label: 'Travail à pied', icon: '🚶' },
  { id: 'exterieur', label: 'Extérieur', icon: '🌳' },
  { id: 'mise_en_confiance', label: 'Mise en confiance', icon: '🤝' },
  { id: 'theorie', label: 'Théorie', icon: '📘' },
  { id: 'travail_general', label: 'Travail général', icon: '🐎' },
];
export const SESSION_TYPE_LABEL = Object.fromEntries(SESSION_TYPES.map((t) => [t.id, `${t.icon} ${t.label}`])) as Record<SessionType, string>;

export const DISCIPLINES: { id: Discipline; label: string }[] = [
  { id: 'dressage', label: 'Dressage' },
  { id: 'saut_obstacles', label: 'Saut d’obstacles' },
  { id: 'cross', label: 'Cross / concours complet' },
  { id: 'equitation_exterieur', label: 'Équitation d’extérieur' },
  { id: 'equitation_ethologique', label: 'Équitation éthologique' },
  { id: 'voltige', label: 'Voltige' },
  { id: 'loisir_polyvalent', label: 'Loisir / polyvalent' },
];
export const DISCIPLINE_LABEL = Object.fromEntries(DISCIPLINES.map((d) => [d.id, d.label])) as Record<Discipline, string>;

export const HORSE_SEX: { id: HorseSex; label: string }[] = [
  { id: 'non_precise', label: 'Non précisé' },
  { id: 'jument', label: 'Jument' },
  { id: 'hongre', label: 'Hongre' },
  { id: 'etalon', label: 'Étalon' },
];

export const EXPERIENCES: { id: Experience; label: string }[] = [
  { id: 'aucune', label: 'Je débute' },
  { id: 'moins_1_an', label: 'Moins d’un an' },
  { id: '1_3_ans', label: '1 à 3 ans' },
  { id: 'plus_3_ans', label: 'Plus de 3 ans' },
];

export const FEELINGS = ['', 'Difficile', 'Mitigé', 'Correct', 'Bon', 'Excellent'];

export const fmtDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

export const fmtMinutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`);

export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
