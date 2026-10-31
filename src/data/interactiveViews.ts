/**
 * Vues interactives originales (schémas pédagogiques simplifiés, non vétérinaires).
 * Chaque vue = des formes de fond + des régions sélectionnables (chemins SVG).
 * Utilisées par l'atlas, l'atelier du matériel, le manège et les questions « image ».
 */
export interface ViewRegion {
  id: string;
  label: string;
  d: string;
  /** Position de l'étiquette (centre approximatif). */
  lx: number;
  ly: number;
}

export interface ViewShape {
  d: string;
  tone: 'robe' | 'ombre' | 'crins' | 'sabot' | 'cuir' | 'metal' | 'tissu' | 'sol' | 'ligne' | 'piste';
}

export interface InteractiveView {
  id: string;
  title: string;
  viewBox: string;
  shapes: ViewShape[];
  regions: ViewRegion[];
  /** Textes fixes (lettres du manège…). */
  labels?: { x: number; y: number; text: string }[];
}

const poly = (pts: string) => `M${pts.trim().replace(/\s+/g, ' L')} Z`;

/* ───────────── Cheval de profil (tête à gauche) ───────────── */
const HORSE_SILHOUETTE =
  'M40,185 C38,170 60,150 85,120 L105,95 L118,62 L128,88 L140,96 C175,88 215,98 255,115 C300,128 340,132 380,132 C420,128 470,126 505,138 C520,145 525,165 522,190 C520,215 512,235 500,255 L497,300 C495,320 492,345 492,362 L494,385 L500,400 L470,400 L474,385 L474,362 C472,340 470,320 468,300 C462,285 452,272 440,262 C400,272 330,275 270,268 L258,270 C254,295 250,315 249,325 L247,342 L245,365 L244,385 L250,400 L214,400 L221,385 L224,365 L226,342 L226,325 C222,305 216,290 214,275 C210,262 198,245 193,228 C185,205 165,185 150,168 C135,178 115,190 95,198 C75,205 50,205 40,195 Z';

export const VIEW_PROFILE: InteractiveView = {
  id: 'anatomie-profil',
  title: 'Le cheval de profil',
  viewBox: '0 0 580 420',
  shapes: [
    { d: 'M0,400 L580,400 L580,420 L0,420 Z', tone: 'sol' },
    // membres du côté opposé, en retrait
    { d: 'M262,268 L268,330 L266,366 L262,386 L268,400 L240,400 L246,386 L248,366 L250,330 Z', tone: 'ombre' },
    { d: 'M452,262 C462,280 470,300 472,320 L470,362 L472,386 L478,400 L452,400 L456,386 L456,362 C452,330 446,300 440,280 Z', tone: 'ombre' },
    { d: HORSE_SILHOUETTE, tone: 'robe' },
    { d: 'M128,88 C160,80 205,90 250,110 L246,122 C205,104 165,96 136,102 Z', tone: 'crins' },
    { d: 'M512,142 C540,160 548,230 545,305 L530,300 C532,240 525,185 506,150 Z', tone: 'crins' },
  ],
  regions: [
    { id: 'tete', label: 'Tête', d: poly('40,185 85,120 105,95 128,88 140,98 150,168 120,186 95,198 50,203'), lx: 95, ly: 160 },
    { id: 'encolure', label: 'Encolure', d: poly('140,98 175,90 215,99 250,114 198,226 182,203 150,168'), lx: 190, ly: 150 },
    { id: 'garrot', label: 'Garrot', d: poly('240,110 290,122 282,145 248,142'), lx: 265, ly: 128 },
    { id: 'epaule', label: 'Épaule', d: poly('248,142 282,145 262,215 240,262 222,268 200,235'), lx: 240, ly: 200 },
    { id: 'poitrail', label: 'Poitrail', d: poly('190,222 205,238 224,272 210,266 196,248'), lx: 205, ly: 250 },
    { id: 'dos', label: 'Dos', d: poly('282,125 375,133 372,175 290,165'), lx: 330, ly: 150 },
    { id: 'rein', label: 'Rein', d: poly('375,133 425,129 428,170 372,175'), lx: 400, ly: 152 },
    { id: 'hanche', label: 'Hanche', d: poly('428,150 450,148 452,172 430,174'), lx: 440, ly: 162 },
    { id: 'croupe', label: 'Croupe', d: poly('425,129 470,127 505,138 518,160 470,175 452,172 450,148 428,150'), lx: 478, ly: 150 },
    { id: 'queue', label: 'Queue', d: 'M512,142 C540,160 548,230 545,305 L530,300 C532,240 525,185 506,150 Z', lx: 538, ly: 230 },
    { id: 'fesse', label: 'Fesse', d: poly('518,160 522,190 515,230 490,225 470,175'), lx: 500, ly: 195 },
    { id: 'cotes', label: 'Côtes (thorax)', d: poly('290,165 372,175 380,215 395,262 300,270 270,268 262,215'), lx: 325, ly: 220 },
    { id: 'flanc', label: 'Flanc', d: poly('372,175 428,170 450,215 440,256 395,262 380,215'), lx: 412, ly: 215 },
    { id: 'cuisse', label: 'Cuisse', d: poly('470,175 490,225 500,255 470,262 450,215'), lx: 478, ly: 228 },
    { id: 'grasset', label: 'Grasset', d: poly('434,236 456,238 459,262 437,262'), lx: 446, ly: 250 },
    { id: 'jambe', label: 'Jambe', d: poly('470,262 500,255 497,292 468,292'), lx: 484, ly: 275 },
    { id: 'jarret', label: 'Jarret', d: poly('466,290 499,290 498,316 468,316'), lx: 483, ly: 303 },
    { id: 'canon-post', label: 'Canon (postérieur)', d: poly('468,316 498,316 493,358 474,358'), lx: 484, ly: 337 },
    { id: 'boulet-post', label: 'Boulet (postérieur)', d: poly('472,356 494,356 494,372 474,372'), lx: 484, ly: 364 },
    { id: 'paturon-post', label: 'Paturon (postérieur)', d: poly('474,372 494,372 497,388 476,388'), lx: 486, ly: 380 },
    { id: 'sabot-post', label: 'Sabot (postérieur)', d: poly('470,386 500,386 503,400 468,400'), lx: 486, ly: 394 },
    { id: 'avant-bras', label: 'Avant-bras', d: poly('214,272 258,270 249,322 226,322'), lx: 236, ly: 296 },
    { id: 'genou', label: 'Genou', d: poly('226,322 249,322 247,342 226,342'), lx: 237, ly: 332 },
    { id: 'canon-ant', label: 'Canon (antérieur)', d: poly('226,342 247,342 245,362 224,362'), lx: 235, ly: 352 },
    { id: 'boulet-ant', label: 'Boulet (antérieur)', d: poly('222,360 245,360 244,376 222,376'), lx: 233, ly: 368 },
    { id: 'paturon-ant', label: 'Paturon (antérieur)', d: poly('222,376 244,376 242,389 220,389'), lx: 232, ly: 382 },
    { id: 'sabot-ant', label: 'Sabot (antérieur)', d: poly('214,388 247,388 248,400 214,400'), lx: 231, ly: 394 },
  ],
};

/* ───────────── Détail de la tête (profil, tête à gauche) ───────────── */
export const VIEW_HEAD: InteractiveView = {
  id: 'anatomie-tete',
  title: 'Détails de la tête',
  viewBox: '0 0 380 300',
  shapes: [
    {
      d: 'M55,215 C50,200 62,192 75,188 L150,92 C160,80 175,76 186,74 L190,22 L205,60 L212,30 L220,82 C250,92 290,120 312,140 L350,175 L350,290 L290,290 C270,250 250,238 230,240 C200,245 160,248 120,248 L80,250 C62,248 52,232 55,215 Z',
      tone: 'robe',
    },
    { d: 'M212,30 L220,82 C250,92 290,120 312,140 L300,148 C280,130 250,108 214,96 Z', tone: 'crins' },
    { d: 'M186,120 m-9,0 a9,7 0 1,0 18,0 a9,7 0 1,0 -18,0', tone: 'sabot' },
  ],
  regions: [
    { id: 'oreille', label: 'Oreille', d: poly('186,74 190,22 205,60 212,30 220,82 205,86'), lx: 205, ly: 55 },
    { id: 'nuque', label: 'Nuque', d: poly('220,82 252,94 245,120 214,104'), lx: 233, ly: 100 },
    { id: 'front', label: 'Front', d: poly('150,92 186,74 214,86 214,104 180,108 160,118'), lx: 185, ly: 92 },
    { id: 'oeil', label: 'Œil', d: 'M186,120 m-13,0 a13,11 0 1,0 26,0 a13,11 0 1,0 -26,0', lx: 186, ly: 120 },
    { id: 'chanfrein', label: 'Chanfrein', d: poly('75,188 150,92 160,118 172,132 108,198'), lx: 125, ly: 150 },
    { id: 'naseaux', label: 'Naseaux', d: poly('55,212 75,188 108,198 100,220 62,226'), lx: 80, ly: 207 },
    { id: 'bouche', label: 'Bouche et lèvres', d: poly('56,228 100,220 118,246 80,250 60,240'), lx: 88, ly: 237 },
    { id: 'joue', label: 'Joue', d: poly('172,132 214,106 245,120 255,150 228,170 175,176 118,212 108,198'), lx: 200, ly: 148 },
    { id: 'ganache', label: 'Ganache', d: poly('175,176 228,170 252,195 240,236 200,244 168,222'), lx: 210, ly: 207 },
    { id: 'gorge', label: 'Gorge', d: poly('255,150 312,140 335,210 290,235 252,195 228,170'), lx: 285, ly: 185 },
  ],
};

/* ───────────── Détail des membres ───────────── */
export const VIEW_LIMBS: InteractiveView = {
  id: 'anatomie-membres',
  title: 'Détails des membres',
  viewBox: '0 0 420 380',
  shapes: [
    { d: 'M0,362 L420,362 L420,380 L0,380 Z', tone: 'sol' },
    // antérieur (à gauche)
    { d: 'M70,20 L150,20 L140,70 L132,150 L130,175 L126,262 L124,300 L128,330 L136,346 L142,362 L72,362 L80,346 L86,330 L92,300 L94,262 L90,175 L84,150 L76,70 Z', tone: 'robe' },
    // postérieur (à droite)
    { d: 'M250,20 L370,20 L368,70 L352,120 L345,150 L350,180 L346,262 L344,300 L348,330 L356,346 L362,362 L292,362 L300,346 L306,330 L312,300 L314,262 L310,190 C300,160 285,120 262,80 Z', tone: 'robe' },
  ],
  regions: [
    { id: 'coude', label: 'Coude', d: poly('74,40 112,40 106,72 78,72'), lx: 93, ly: 56 },
    { id: 'avant-bras', label: 'Avant-bras', d: poly('78,72 140,72 132,150 84,150'), lx: 108, ly: 110 },
    { id: 'genou', label: 'Genou', d: poly('84,150 132,150 130,178 90,178'), lx: 110, ly: 164 },
    { id: 'canon-ant', label: 'Canon', d: poly('92,178 116,178 114,262 94,262'), lx: 104, ly: 220 },
    { id: 'tendons', label: 'Tendons', d: poly('116,178 130,178 126,262 114,262'), lx: 140, ly: 220 },
    { id: 'boulet-ant', label: 'Boulet', d: poly('92,262 126,262 124,300 92,300'), lx: 108, ly: 281 },
    { id: 'paturon-ant', label: 'Paturon', d: poly('92,300 124,300 128,328 86,328'), lx: 108, ly: 314 },
    { id: 'couronne', label: 'Couronne', d: poly('86,328 128,328 134,342 80,342'), lx: 107, ly: 335 },
    { id: 'sabot-ant', label: 'Sabot', d: poly('80,342 134,342 142,362 72,362'), lx: 107, ly: 352 },
    { id: 'grasset', label: 'Grasset', d: poly('262,80 300,70 312,110 280,120'), lx: 288, ly: 96 },
    { id: 'jambe', label: 'Jambe', d: poly('280,120 352,110 345,150 304,160'), lx: 322, ly: 136 },
    { id: 'jarret', label: 'Jarret', d: poly('304,160 345,150 350,190 310,192'), lx: 328, ly: 174 },
    { id: 'canon-post', label: 'Canon', d: poly('310,192 350,190 346,262 314,262'), lx: 330, ly: 226 },
    { id: 'boulet-post', label: 'Boulet', d: poly('312,262 346,262 344,300 312,300'), lx: 328, ly: 281 },
    { id: 'paturon-post', label: 'Paturon', d: poly('312,300 344,300 348,330 306,330'), lx: 328, ly: 315 },
    { id: 'sabot-post', label: 'Sabot', d: poly('300,330 350,330 362,362 292,362'), lx: 328, ly: 348 },
  ],
  labels: [
    { x: 110, y: 14, text: 'Antérieur' },
    { x: 310, y: 14, text: 'Postérieur' },
  ],
};

/* ───────────── Vue de face ───────────── */
export const VIEW_FRONT: InteractiveView = {
  id: 'anatomie-face',
  title: 'Le cheval de face',
  viewBox: '0 0 400 420',
  shapes: [
    { d: 'M0,408 L400,408 L400,420 L0,420 Z', tone: 'sol' },
    { d: 'M130,160 C150,140 250,140 270,160 L290,300 L260,305 L254,408 L222,408 L226,305 L174,305 L178,408 L146,408 L140,305 L110,300 Z', tone: 'robe' },
    { d: 'M165,40 L178,88 C176,140 182,190 180,210 C182,228 218,228 220,210 C218,190 224,140 222,88 L235,40 L214,80 L186,80 Z', tone: 'robe' },
    { d: 'M186,80 L214,80 L210,100 L190,100 Z', tone: 'crins' },
  ],
  regions: [
    { id: 'oreille', label: 'Oreilles', d: `${poly('165,40 186,80 176,88')} ${poly('235,40 214,80 224,88')}`, lx: 200, ly: 60 },
    { id: 'front', label: 'Front', d: poly('176,88 224,88 222,128 178,128'), lx: 200, ly: 108 },
    { id: 'oeil', label: 'Yeux', d: `${poly('168,112 178,108 180,124 168,124')} ${poly('232,112 222,108 220,124 232,124')}`, lx: 200, ly: 118 },
    { id: 'chanfrein', label: 'Chanfrein', d: poly('178,128 222,128 220,186 180,186'), lx: 200, ly: 157 },
    { id: 'naseaux', label: 'Naseaux', d: poly('180,186 220,186 220,214 180,214'), lx: 200, ly: 200 },
    { id: 'encolure', label: 'Encolure', d: `${poly('140,150 178,140 178,220 150,230')} ${poly('260,150 222,140 222,220 250,230')}`, lx: 160, ly: 185 },
    { id: 'poitrail', label: 'Poitrail', d: poly('150,230 250,230 262,300 138,300'), lx: 200, ly: 265 },
    { id: 'epaule', label: 'Épaules', d: `${poly('112,190 150,230 138,300 110,300')} ${poly('288,190 250,230 262,300 290,300')}`, lx: 125, ly: 255 },
    { id: 'avant-bras', label: 'Avant-bras', d: `${poly('140,305 174,305 176,345 144,345')} ${poly('226,305 260,305 256,345 224,345')}`, lx: 160, ly: 325 },
    { id: 'genou', label: 'Genoux', d: `${poly('144,345 176,345 177,362 146,362')} ${poly('224,345 256,345 254,362 223,362')}`, lx: 160, ly: 353 },
    { id: 'canon-ant', label: 'Canons', d: `${poly('146,362 177,362 178,392 146,392')} ${poly('223,362 254,362 254,392 222,392')}`, lx: 162, ly: 377 },
    { id: 'sabot-ant', label: 'Sabots', d: `${poly('144,392 180,392 180,408 142,408')} ${poly('220,392 256,392 258,408 220,408')}`, lx: 162, ly: 400 },
  ],
};

/* ───────────── Vue arrière ───────────── */
export const VIEW_REAR: InteractiveView = {
  id: 'anatomie-arriere',
  title: 'Le cheval vu de l’arrière',
  viewBox: '0 0 400 420',
  shapes: [
    { d: 'M0,408 L400,408 L400,420 L0,420 Z', tone: 'sol' },
    { d: 'M105,118 C130,70 270,70 295,118 L292,230 L270,262 L262,300 L258,408 L228,408 L232,300 L214,250 L186,250 L168,300 L172,408 L142,408 L138,300 L130,262 L108,230 Z', tone: 'robe' },
    { d: 'M190,80 L210,80 C214,130 214,200 222,262 L178,262 C186,200 186,130 190,80 Z', tone: 'crins' },
  ],
  regions: [
    { id: 'croupe', label: 'Croupe', d: poly('120,105 160,82 240,82 280,105 270,120 130,120'), lx: 200, ly: 100 },
    { id: 'hanche', label: 'Pointes des hanches', d: `${poly('105,112 128,104 132,126 108,132')} ${poly('295,112 272,104 268,126 292,132')}`, lx: 118, ly: 118 },
    { id: 'queue', label: 'Queue', d: 'M190,80 L210,80 C214,130 214,200 222,262 L178,262 C186,200 186,130 190,80 Z', lx: 200, ly: 180 },
    { id: 'fesse', label: 'Fesses', d: `${poly('130,124 186,124 184,210 120,200')} ${poly('270,124 214,124 216,210 280,200')}`, lx: 150, ly: 165 },
    { id: 'cuisse', label: 'Cuisses', d: `${poly('108,200 184,212 168,250 130,262')} ${poly('292,200 216,212 232,250 270,262')}`, lx: 150, ly: 230 },
    { id: 'jarret', label: 'Jarrets', d: `${poly('134,280 168,280 168,305 138,305')} ${poly('232,280 266,280 262,305 232,305')}`, lx: 152, ly: 293 },
    { id: 'canon-post', label: 'Canons', d: `${poly('138,305 168,305 170,380 140,380')} ${poly('232,305 262,305 260,380 230,380')}`, lx: 154, ly: 342 },
    { id: 'sabot-post', label: 'Sabots', d: `${poly('140,390 172,390 172,408 142,408')} ${poly('228,390 260,390 258,408 228,408')}`, lx: 156, ly: 399 },
  ],
};

/* ───────────── Selle (vue de côté) ───────────── */
export const VIEW_SADDLE: InteractiveView = {
  id: 'materiel-selle',
  title: 'La selle',
  viewBox: '0 0 420 330',
  shapes: [
    { d: 'M60,95 C70,70 95,62 110,70 C150,98 260,98 300,72 C318,62 345,66 352,85 L346,120 L70,120 Z', tone: 'cuir' },
    { d: 'M110,110 L300,110 L290,250 L130,250 Z', tone: 'cuir' },
  ],
  regions: [
    { id: 'pommeau', label: 'Pommeau', d: poly('56,98 64,72 92,60 116,72 112,104 70,110'), lx: 86, ly: 86 },
    { id: 'siege', label: 'Siège', d: 'M116,72 C150,98 260,98 296,74 L300,104 C250,118 160,118 112,104 Z', lx: 205, ly: 98 },
    { id: 'troussequin', label: 'Troussequin', d: poly('296,74 318,62 346,66 354,86 346,108 300,104'), lx: 326, ly: 86 },
    { id: 'panneau', label: 'Panneaux', d: 'M70,112 L346,112 L340,132 C260,140 150,140 76,132 Z', lx: 210, ly: 126 },
    { id: 'quartier', label: 'Quartier', d: poly('112,136 296,136 286,250 132,250'), lx: 205, ly: 190 },
    { id: 'etriviere', label: 'Étrivière', d: poly('128,104 140,104 146,262 134,262'), lx: 160, ly: 240 },
    { id: 'etrier', label: 'Étrier', d: 'M116,262 L166,262 L172,300 L110,300 Z M124,270 L158,270 L162,292 L120,292 Z', lx: 141, ly: 285 },
    { id: 'sangle', label: 'Sangle', d: poly('196,250 236,250 238,322 194,322'), lx: 216, ly: 290 },
    { id: 'contre-sanglons', label: 'Contre-sanglons', d: poly('192,228 240,228 238,252 194,252'), lx: 268, ly: 240 },
  ],
};

/* ───────────── Filet (sur une tête de profil) ───────────── */
export const VIEW_BRIDLE: InteractiveView = {
  id: 'materiel-filet',
  title: 'Le filet',
  viewBox: '0 0 380 300',
  shapes: [VIEW_HEAD.shapes[0], VIEW_HEAD.shapes[1], VIEW_HEAD.shapes[2]],
  regions: [
    { id: 'tetiere', label: 'Têtière', d: poly('206,86 226,80 236,96 258,150 246,154 222,100'), lx: 236, ly: 112 },
    { id: 'frontal', label: 'Frontal', d: poly('168,94 206,82 210,96 172,108'), lx: 188, ly: 96 },
    { id: 'montant', label: 'Montant', d: poly('200,108 212,104 150,212 138,206'), lx: 168, ly: 160 },
    { id: 'sous-gorge', label: 'Sous-gorge', d: poly('246,148 258,146 262,214 250,216'), lx: 256, ly: 182 },
    { id: 'muserolle', label: 'Muserolle', d: poly('96,176 108,166 168,200 230,214 226,228 160,214'), lx: 165, ly: 210 },
    { id: 'mors', label: 'Mors', d: 'M112,226 m-11,0 a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0', lx: 112, ly: 226 },
    { id: 'renes', label: 'Rênes', d: 'M120,224 C180,236 260,260 350,262 L350,274 C260,272 180,250 116,236 Z', lx: 290, ly: 262 },
  ],
};

/* ───────────── Carrière 20 × 40 vue du dessus ───────────── */
// Échelle : 1 m = 8 px. Rectangle de 160 × 320 décalé de (40, 30). A en bas, C en haut.
const ARENA_X = 40;
const ARENA_Y = 30;
const W = 160;
const H = 320;
const letter = (id: string, x: number, y: number) => ({
  id: `lettre-${id}`,
  label: `Lettre ${id}`,
  d: `M${x},${y} m-13,0 a13,13 0 1,0 26,0 a13,13 0 1,0 -26,0`,
  lx: x,
  ly: y,
});

export const ARENA_LETTERS = {
  A: [ARENA_X + W / 2, ARENA_Y + H + 14],
  K: [ARENA_X - 14, ARENA_Y + H - 48],
  E: [ARENA_X - 14, ARENA_Y + H / 2],
  H: [ARENA_X - 14, ARENA_Y + 48],
  C: [ARENA_X + W / 2, ARENA_Y - 14],
  M: [ARENA_X + W + 14, ARENA_Y + 48],
  B: [ARENA_X + W + 14, ARENA_Y + H / 2],
  F: [ARENA_X + W + 14, ARENA_Y + H - 48],
} as const;

/** Points de la carrière (en px) utiles aux tracés des figures. */
export const ARENA_POINTS = {
  A: [ARENA_X + W / 2, ARENA_Y + H],
  C: [ARENA_X + W / 2, ARENA_Y],
  K: [ARENA_X, ARENA_Y + H - 48],
  F: [ARENA_X + W, ARENA_Y + H - 48],
  E: [ARENA_X, ARENA_Y + H / 2],
  B: [ARENA_X + W, ARENA_Y + H / 2],
  H: [ARENA_X, ARENA_Y + 48],
  M: [ARENA_X + W, ARENA_Y + 48],
  X: [ARENA_X + W / 2, ARENA_Y + H / 2],
} as const;

export const ARENA_GEOMETRY = { x: ARENA_X, y: ARENA_Y, w: W, h: H, scale: 8 };

export const VIEW_ARENA: InteractiveView = {
  id: 'manege-carriere',
  title: 'La carrière 20 × 40 m',
  viewBox: '0 0 240 380',
  shapes: [
    { d: `M${ARENA_X},${ARENA_Y} h${W} v${H} h-${W} Z`, tone: 'piste' },
    // ligne du milieu
    { d: `M${ARENA_X + W / 2},${ARENA_Y} V${ARENA_Y + H}`, tone: 'ligne' },
    // lignes du quart (5 m des grands côtés)
    { d: `M${ARENA_X + 40},${ARENA_Y} V${ARENA_Y + H} M${ARENA_X + W - 40},${ARENA_Y} V${ARENA_Y + H}`, tone: 'ligne' },
  ],
  regions: [
    ...Object.entries(ARENA_LETTERS).map(([k, [x, y]]) => letter(k, x, y)),
    { id: 'lettre-X', label: 'X (centre)', d: `M${ARENA_X + W / 2},${ARENA_Y + H / 2} m-11,0 a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0`, lx: ARENA_X + W / 2, ly: ARENA_Y + H / 2 },
  ],
  labels: [
    ...Object.entries(ARENA_LETTERS).map(([k, [x, y]]) => ({ x, y: y + 4, text: k })),
    { x: ARENA_X + W / 2, y: ARENA_Y + H / 2 + 4, text: 'X' },
  ],
};

export const INTERACTIVE_VIEWS: Record<string, InteractiveView> = Object.fromEntries(
  [VIEW_PROFILE, VIEW_HEAD, VIEW_LIMBS, VIEW_FRONT, VIEW_REAR, VIEW_SADDLE, VIEW_BRIDLE, VIEW_ARENA].map((v) => [v.id, v]),
);
