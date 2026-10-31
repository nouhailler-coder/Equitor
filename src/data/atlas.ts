/**
 * Atlas anatomique : explication et fonction générale de chaque région.
 * Schémas pédagogiques simplifiés — ce ne sont pas des planches vétérinaires de référence.
 */
export interface AtlasEntry {
  name: string;
  explanation: string;
  fonction: string;
  termId?: string;
  lessonIds?: string[];
}

export const ATLAS_VIEWS = [
  { id: 'anatomie-profil', label: 'Profil' },
  { id: 'anatomie-face', label: 'Face' },
  { id: 'anatomie-arriere', label: 'Arrière' },
  { id: 'anatomie-tete', label: 'Tête' },
  { id: 'anatomie-membres', label: 'Membres' },
] as const;

export const ATLAS: Record<string, AtlasEntry> = {
  tete: { name: 'Tête', explanation: 'Elle porte les organes des sens : yeux sur les côtés (vision très large), oreilles mobiles, naseaux.', fonction: 'Perception de l’environnement ; avec l’encolure, elle participe à l’équilibre.', lessonIds: [] },
  encolure: { name: 'Encolure', explanation: 'Région musclée qui relie la tête au tronc. La crinière pousse sur son bord supérieur.', fonction: 'Balancier : elle aide le cheval à s’équilibrer, surtout au galop et à l’obstacle.', termId: 'term-encolure', lessonIds: ['fiche-08-decouverte-galop'] },
  garrot: { name: 'Garrot', explanation: 'Saillie osseuse à la jonction de l’encolure et du dos, au-dessus des épaules.', fonction: 'Repère de mesure de la taille ; la selle et le tapis doivent le dégager.', termId: 'term-garrot' },
  epaule: { name: 'Épaule', explanation: 'Région oblique formée de l’omoplate et de puissants muscles.', fonction: 'Son inclinaison influence l’amplitude du geste des antérieurs.', termId: 'term-epaule' },
  poitrail: { name: 'Poitrail', explanation: 'Face avant du thorax, entre les deux épaules.', fonction: 'Sa largeur participe à la stabilité de l’avant-main.' },
  dos: { name: 'Dos', explanation: 'Région située entre le garrot et le rein, sur laquelle repose la selle.', fonction: 'Il transmet vers l’avant la poussée de l’arrière-main ; souple et tonique, il porte le cavalier.', termId: 'term-dos', lessonIds: ['fiche-19-echelles-progression'] },
  rein: { name: 'Rein', explanation: 'Région courte entre le dos et la croupe, non soutenue par les côtes.', fonction: 'Pont entre arrière-main et dos ; zone à ménager (selle, poids du cavalier).', termId: 'term-rein' },
  hanche: { name: 'Hanche', explanation: 'La pointe de la hanche est la saillie osseuse visible à l’avant de la croupe.', fonction: 'Repère pour observer la symétrie et la musculature de l’arrière-main.' },
  croupe: { name: 'Croupe', explanation: 'Partie supérieure de l’arrière-main, du rein à la naissance de la queue.', fonction: 'Elle recouvre le bassin, point d’ancrage des muscles propulseurs.', termId: 'term-croupe' },
  queue: { name: 'Queue', explanation: 'Prolongement de la colonne vertébrale recouvert de crins.', fonction: 'Chasse les insectes ; son port renseigne aussi sur l’état du cheval (à interpréter avec prudence).' },
  fesse: { name: 'Fesse', explanation: 'Région arrière de l’arrière-main, sous la croupe.', fonction: 'Muscles puissants qui participent à la propulsion.' },
  cotes: { name: 'Côtes (thorax)', explanation: 'Cage thoracique protégeant cœur et poumons ; la sangle passe en arrière du coude.', fonction: 'Respiration ; la jambe du cavalier agit le long de cette zone.' },
  flanc: { name: 'Flanc', explanation: 'Creux situé entre les dernières côtes et la hanche.', fonction: 'Son mouvement permet d’observer la respiration.', termId: 'term-flanc' },
  cuisse: { name: 'Cuisse', explanation: 'Région musclée du haut du postérieur.', fonction: 'Propulsion et engagement des postérieurs.' },
  grasset: { name: 'Grasset', explanation: 'Articulation du postérieur, à l’avant de la cuisse, équivalente au genou humain.', fonction: 'Flexion du postérieur lors de l’engagement.', termId: 'term-grasset' },
  jambe: { name: 'Jambe', explanation: 'Région du postérieur entre le grasset et le jarret.', fonction: 'Transmet la force de la cuisse vers le jarret.' },
  jarret: { name: 'Jarret', explanation: 'Articulation anguleuse du postérieur, au-dessus du canon.', fonction: 'Rôle majeur dans la propulsion et le report de poids vers l’arrière.', termId: 'term-jarret' },
  'canon-post': { name: 'Canon (postérieur)', explanation: 'Partie droite du membre entre le jarret et le boulet.', fonction: 'Support ; les tendons passent à l’arrière.', termId: 'term-canon' },
  'boulet-post': { name: 'Boulet (postérieur)', explanation: 'Articulation arrondie entre canon et paturon.', fonction: 'Amortit l’appui.', termId: 'term-boulet' },
  'paturon-post': { name: 'Paturon (postérieur)', explanation: 'Région entre boulet et couronne.', fonction: 'Participe à l’amortissement.', termId: 'term-paturon' },
  'sabot-post': { name: 'Sabot (postérieur)', explanation: 'Enveloppe cornée de l’extrémité du membre.', fonction: 'Protège le pied et encaisse les chocs ; entretenu par le maréchal-ferrant ou le pareur.', termId: 'term-sabot' },
  coude: { name: 'Coude', explanation: 'Articulation du haut de l’antérieur, contre le thorax.', fonction: 'La sangle passe un peu en arrière : elle ne doit pas le pincer.' },
  'avant-bras': { name: 'Avant-bras', explanation: 'Région musclée de l’antérieur, au-dessus du genou.', fonction: 'Ses muscles mobilisent le bas du membre.' },
  genou: { name: 'Genou', explanation: 'Articulation de l’antérieur entre avant-bras et canon, comparable au poignet humain.', fonction: 'Flexion du membre antérieur pendant la foulée.', termId: 'term-genou' },
  'canon-ant': { name: 'Canon (antérieur)', explanation: 'Partie droite du membre entre genou et boulet.', fonction: 'Support du membre ; zone souvent couverte par les guêtres.', termId: 'term-canon' },
  tendons: { name: 'Tendons', explanation: 'Structures situées à l’arrière du canon, reliant muscles et os.', fonction: 'Transmettent la force et soutiennent le boulet. Toute chaleur ou gonflement se signale à un professionnel.' },
  'boulet-ant': { name: 'Boulet (antérieur)', explanation: 'Articulation arrondie entre canon et paturon.', fonction: 'Amortit l’appui à chaque foulée.', termId: 'term-boulet' },
  'paturon-ant': { name: 'Paturon (antérieur)', explanation: 'Région entre boulet et couronne.', fonction: 'Son inclinaison participe à l’amortissement.', termId: 'term-paturon' },
  couronne: { name: 'Couronne', explanation: 'Bourrelet à la jonction de la peau et du sabot.', fonction: 'Zone de pousse de la corne ; les cloches la protègent des atteintes.' },
  'sabot-ant': { name: 'Sabot (antérieur)', explanation: 'Paroi, sole et fourchette forment le pied.', fonction: 'Protège et amortit ; on le cure du talon vers la pince.', termId: 'term-sabot' },
  oreille: { name: 'Oreilles', explanation: 'Très mobiles, elles s’orientent indépendamment.', fonction: 'Audition ; leur orientation indique souvent la direction de l’attention.', termId: 'term-oreilles' },
  nuque: { name: 'Nuque', explanation: 'Région située derrière les oreilles.', fonction: 'La têtière y repose ; sa flexion est recherchée en dressage, sans contrainte.', termId: 'term-nuque' },
  front: { name: 'Front', explanation: 'Partie large de la tête entre les yeux, sous le toupet.', fonction: 'Le frontal du filet passe juste en dessous des oreilles.' },
  oeil: { name: 'Œil', explanation: 'Placés sur les côtés de la tête, les yeux offrent une vision presque circulaire.', fonction: 'Vision large mais angles morts juste derrière et juste devant le nez.', termId: 'term-angle-mort' },
  chanfrein: { name: 'Chanfrein', explanation: 'Partie avant de la tête, entre les yeux et les naseaux.', fonction: 'La muserolle passe sur sa partie basse.', termId: 'term-chanfrein' },
  naseaux: { name: 'Naseaux', explanation: 'Narines du cheval, qui respire uniquement par le nez.', fonction: 'Respiration et odorat ; ils se dilatent à l’effort ou sous l’émotion.', termId: 'term-naseaux' },
  bouche: { name: 'Bouche et lèvres', explanation: 'Lèvres mobiles et sensibles ; le mors repose sur la langue et les barres.', fonction: 'Préhension des aliments ; sensibilité à la main du cavalier.', termId: 'term-barres' },
  joue: { name: 'Joue', explanation: 'Région plate sur le côté de la tête, recouvrant les muscles masticateurs.', fonction: 'Mastication ; les montants du filet passent dessus.' },
  ganache: { name: 'Ganache', explanation: 'Bord arrondi de la mâchoire inférieure.', fonction: 'Repère pour la sous-gorge ; zone qui doit rester libre pour la flexion.', termId: 'term-ganache' },
  gorge: { name: 'Gorge', explanation: 'Région située sous l’attache de la tête et de l’encolure.', fonction: 'Passage de la respiration ; la sous-gorge ne doit pas la comprimer.' },
};
