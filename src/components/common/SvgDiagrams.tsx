import React from 'react';

interface DiagramProps {
  type: 'seat_profile' | 'scales_pyramid' | 'arena_geometry' | 'gait_timeline' | 'jumping_phases' | 'rein_contact' | 'lateral_angle';
  className?: string;
}

export const SvgDiagram: React.FC<DiagramProps> = ({ type, className = '' }) => {
  switch (type) {
    case 'seat_profile':
      return (
        <div className={`p-4 bg-stone-900 rounded-xl text-stone-100 flex flex-col items-center shadow-inner ${className}`}>
          <div className="w-full text-xs font-semibold tracking-wider text-amber-400 uppercase mb-2 flex items-center justify-between">
            <span>Schéma : Alignement vertical de profil</span>
            <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-300">Biomécanique</span>
          </div>
          <svg viewBox="0 0 400 280" className="w-full max-w-sm h-auto select-none" fill="none" stroke="currentColor">
            {/* Background grid */}
            <path d="M50 0v280 M150 0v280 M250 0v280 M350 0v280 M0 70h400 M0 140h400 M0 210h400" stroke="#333" strokeDasharray="3 3" strokeWidth="0.7"/>
            {/* Saddle outline */}
            <path d="M120 180 Q170 200 230 180 Q250 200 260 215" stroke="#ca8a04" strokeWidth="3" fill="#854d0e" fillOpacity="0.3"/>
            {/* Horse back curve */}
            <path d="M50 170 Q130 195 200 190 Q280 180 340 150" stroke="#78716c" strokeWidth="5"/>
            {/* Horse neck and withers */}
            <path d="M340 150 Q360 120 370 70" stroke="#78716c" strokeWidth="5"/>
            {/* Rider torso */}
            <circle cx="180" cy="50" r="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="2"/>
            {/* Ear point */}
            <circle cx="180" cy="50" r="3" fill="#dc2626"/>
            {/* Body */}
            <path d="M180 64 L180 130" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round"/>
            {/* Shoulder point */}
            <circle cx="180" cy="78" r="3.5" fill="#dc2626"/>
            {/* Arm to elbow and hand */}
            <path d="M180 78 L195 115 L250 112" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Reins to mouth */}
            <path d="M250 112 L360 85" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2"/>
            <circle cx="360" cy="85" r="4" fill="#f59e0b"/>
            <text x="365" y="82" fill="#f59e0b" fontSize="9" fontWeight="bold">Mors</text>
            {/* Thigh & Leg */}
            <path d="M180 130 Q195 170 195 190 L180 235" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Hip point */}
            <circle cx="180" cy="130" r="3.5" fill="#dc2626"/>
            {/* Stirrup leather */}
            <line x1="170" y1="180" x2="175" y2="242" stroke="#e2e8f0" strokeWidth="1.5"/>
            <rect x="165" y="240" width="22" height="6" rx="2" fill="#94a3b8"/>
            {/* Heel point */}
            <circle cx="180" cy="235" r="3.5" fill="#dc2626"/>
            <path d="M180 235 L200 238" stroke="#10b981" strokeWidth="4" strokeLinecap="round"/>
            {/* Vertical plumb line (RED) */}
            <line x1="180" y1="20" x2="180" y2="265" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 4"/>
            {/* Legend texts */}
            <text x="190" y="32" fill="#ef4444" fontSize="10" fontWeight="bold">Axe Oreille - Épaule - Hanche - Talon</text>
            <text x="210" y="105" fill="#38bdf8" fontSize="9">Ligne coude-main-bouche</text>
            <text x="10" y="270" fill="#9ca3af" fontSize="9">© ÉquiProgression — Doctrine Classique</text>
          </svg>
          <p className="text-[11px] text-stone-400 mt-2 text-center leading-relaxed">
            La ligne d’aplomb rouge montre l’alignement parfait du centre de gravité. Le coude plié assure une ligne directe et souple vers le mors sans casser le poignet.
          </p>
        </div>
      );

    case 'scales_pyramid':
      return (
        <div className={`p-4 bg-stone-900 rounded-xl text-stone-100 flex flex-col items-center shadow-inner ${className}`}>
          <div className="w-full text-xs font-semibold tracking-wider text-amber-400 uppercase mb-2 flex items-center justify-between">
            <span>Pyramide : Les échelles de progression classique</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">6 Piliers</span>
          </div>
          <svg viewBox="0 0 380 240" className="w-full max-w-sm h-auto select-none font-sans">
            {/* 6. Collection */}
            <polygon points="190,15 135,50 245,50" fill="#dc2626" fillOpacity="0.85" stroke="#f87171" strokeWidth="1.5"/>
            <text x="190" y="40" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">6. Rassembler</text>

            {/* 5. Straightness */}
            <polygon points="135,53 245,53 275,88 105,88" fill="#ea580c" fillOpacity="0.85" stroke="#fb923c" strokeWidth="1.5"/>
            <text x="190" y="75" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">5. Rectitude</text>

            {/* 4. Impulsion */}
            <polygon points="105,91 275,91 305,126 75,126" fill="#d97706" fillOpacity="0.85" stroke="#fbbf24" strokeWidth="1.5"/>
            <text x="190" y="112" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">4. Impulsion</text>

            {/* 3. Contact */}
            <polygon points="75,129 305,129 335,164 45,164" fill="#0284c7" fillOpacity="0.85" stroke="#38bdf8" strokeWidth="1.5"/>
            <text x="190" y="150" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">3. Contact</text>

            {/* 2. Suppleness */}
            <polygon points="45,167 335,167 365,202 15,202" fill="#059669" fillOpacity="0.85" stroke="#34d399" strokeWidth="1.5"/>
            <text x="190" y="188" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">2. Souplesse &amp; Décontraction</text>

            {/* 1. Rhythm */}
            <polygon points="15,205 365,205 375,235 5,235" fill="#166534" fillOpacity="0.95" stroke="#4ade80" strokeWidth="2"/>
            <text x="190" y="224" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="900">1. Rythme &amp; Régularité</text>
          </svg>
          <p className="text-[11px] text-stone-400 mt-2 text-center leading-relaxed">
            La fondation verte (Rythme et Souplesse) conditionne tout le reste. On ne peut exiger le rassembler (sommet rouge) si la base n’est pas acquise.
          </p>
        </div>
      );

    case 'arena_geometry':
      return (
        <div className={`p-4 bg-stone-900 rounded-xl text-stone-100 flex flex-col items-center shadow-inner ${className}`}>
          <div className="w-full text-xs font-semibold tracking-wider text-amber-400 uppercase mb-2 flex items-center justify-between">
            <span>Carrière : Lettres et Tracé d’un Cercle de 20 m</span>
            <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-300">20 × 40 m</span>
          </div>
          <svg viewBox="0 0 360 220" className="w-full max-w-sm h-auto select-none font-sans">
            {/* Arena Border */}
            <rect x="40" y="20" width="280" height="180" rx="8" fill="#1c1917" stroke="#ca8a04" strokeWidth="3"/>
            {/* Center line */}
            <line x1="180" y1="20" x2="180" y2="200" stroke="#57534e" strokeDasharray="4 4" strokeWidth="1.5"/>
            {/* 20m circle at C */}
            <circle cx="110" cy="110" r="70" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="5 3"/>
            <text x="110" y="115" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">Cercle 20 m</text>
            {/* Arena Letters */}
            {/* Top row */}
            <text x="60" y="14" fill="#fef08a" fontSize="12" fontWeight="bold">F</text>
            <text x="180" y="14" textAnchor="middle" fill="#fef08a" fontSize="12" fontWeight="bold">A</text>
            <text x="300" y="14" fill="#fef08a" fontSize="12" fontWeight="bold">K</text>
            {/* Sides */}
            <text x="24" y="114" fill="#fef08a" fontSize="12" fontWeight="bold">B</text>
            <text x="328" y="114" fill="#fef08a" fontSize="12" fontWeight="bold">E</text>
            {/* Center X */}
            <circle cx="180" cy="110" r="3" fill="#ea580c"/>
            <text x="190" y="114" fill="#ea580c" fontSize="11" fontWeight="bold">X</text>
            {/* Bottom row */}
            <text x="60" y="214" fill="#fef08a" fontSize="12" fontWeight="bold">M</text>
            <text x="180" y="214" textAnchor="middle" fill="#fef08a" fontSize="12" fontWeight="bold">C</text>
            <text x="300" y="214" fill="#fef08a" fontSize="12" fontWeight="bold">H</text>
          </svg>
          <p className="text-[11px] text-stone-400 mt-2 text-center leading-relaxed">
            Le cercle de 20 m touche les deux lices extérieures et passe exactement par le centre X. Les lettres de manège sont les repères précis d’orientation.
          </p>
        </div>
      );

    case 'gait_timeline':
      return (
        <div className={`p-4 bg-stone-900 rounded-xl text-stone-100 flex flex-col items-center shadow-inner ${className}`}>
          <div className="w-full text-xs font-semibold tracking-wider text-amber-400 uppercase mb-2 flex items-center justify-between">
            <span>Séquence des Allures : Posés des Sabots</span>
            <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-300">Mécanique</span>
          </div>
          <div className="w-full space-y-3 my-2 text-xs">
            {/* Pas */}
            <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
              <div className="flex justify-between font-bold text-amber-300 mb-1">
                <span>Le Pas : 4 temps égaux</span>
                <span className="text-emerald-400 text-[10px]">Sans suspension</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px]">
                <div className="bg-stone-700 py-1 rounded text-stone-200">1. Post. G</div>
                <div className="bg-stone-700 py-1 rounded text-stone-200">2. Ant. G</div>
                <div className="bg-stone-700 py-1 rounded text-stone-200">3. Post. D</div>
                <div className="bg-stone-700 py-1 rounded text-stone-200">4. Ant. D</div>
              </div>
            </div>
            {/* Trot */}
            <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
              <div className="flex justify-between font-bold text-sky-300 mb-1">
                <span>Le Trot : 2 temps diagonaux</span>
                <span className="text-sky-400 text-[10px]">Suspension aérienne</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center font-mono text-[11px]">
                <div className="bg-stone-700 py-1 rounded text-stone-200">1. Bipède Diag. G (PG+AD)</div>
                <div className="bg-amber-950 border border-amber-500 py-1 rounded text-amber-300 font-bold">Suspension</div>
                <div className="bg-stone-700 py-1 rounded text-stone-200">2. Bipède Diag. D (PD+AG)</div>
              </div>
            </div>
            {/* Galop à droite */}
            <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
              <div className="flex justify-between font-bold text-emerald-300 mb-1">
                <span>Galop à droite : 3 temps</span>
                <span className="text-emerald-400 text-[10px]">Projection</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px]">
                <div className="bg-stone-700 py-1 rounded text-stone-200">1. Post. G</div>
                <div className="bg-stone-700 py-1 rounded text-stone-200">2. Diag. G (PD+AG)</div>
                <div className="bg-emerald-900 border border-emerald-500 py-1 rounded text-emerald-200 font-bold">3. Ant. D (Menant)</div>
                <div className="bg-amber-950 border border-amber-500 py-1 rounded text-amber-300 font-bold">Projection</div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 text-center">
            Comprendre ces temps évite de bloquer involontairement un membre par une aide au mauvais moment.
          </p>
        </div>
      );

    case 'jumping_phases':
      return (
        <div className={`p-4 bg-stone-900 rounded-xl text-stone-100 flex flex-col items-center shadow-inner ${className}`}>
          <div className="w-full text-xs font-semibold tracking-wider text-amber-400 uppercase mb-2 flex items-center justify-between">
            <span>Parabole : Les 5 Phases du Saut d’Obstacles</span>
            <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-300">Biomécanique classique</span>
          </div>
          <svg viewBox="0 0 380 180" className="w-full max-w-sm h-auto select-none font-sans">
            {/* Ground */}
            <line x1="10" y1="150" x2="370" y2="150" stroke="#78716c" strokeWidth="3"/>
            {/* Obstacle in middle */}
            <rect x="185" y="90" width="10" height="60" fill="#dc2626"/>
            <line x1="175" y1="95" x2="205" y2="95" stroke="#ffffff" strokeWidth="4"/>
            <line x1="175" y1="115" x2="205" y2="115" stroke="#ffffff" strokeWidth="4"/>
            <line x1="175" y1="135" x2="205" y2="135" stroke="#ffffff" strokeWidth="4"/>
            {/* Trajectory Arc */}
            <path d="M50 145 Q120 140 145 130 Q190 40 235 130 Q260 140 330 145" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5 3"/>
            {/* Phases dots and labels */}
            {/* 1. Abord */}
            <circle cx="60" cy="143" r="4" fill="#f59e0b"/>
            <text x="60" y="165" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">1. Abord</text>
            {/* 2. Appel */}
            <circle cx="130" cy="130" r="4" fill="#f59e0b"/>
            <text x="130" y="120" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">2. Appel</text>
            {/* 3. Bascule / Plané */}
            <circle cx="190" cy="45" r="5" fill="#10b981"/>
            <text x="190" y="32" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">3. Bascule &amp; Céder les mains</text>
            {/* 4. Réception */}
            <circle cx="250" cy="130" r="4" fill="#f59e0b"/>
            <text x="250" y="120" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">4. Réception</text>
            {/* 5. Départ */}
            <circle cx="320" cy="143" r="4" fill="#f59e0b"/>
            <text x="320" y="165" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">5. Départ</text>
          </svg>
          <p className="text-[11px] text-stone-400 mt-2 text-center leading-relaxed">
            Phase 3 : le point culminant de la bascule. Les mains doivent avancer vers la bouche pour ne pas punir le cheval qui arrondit son dos.
          </p>
        </div>
      );

    case 'lateral_angle':
      return (
        <div className={`p-4 bg-stone-900 rounded-xl text-stone-100 flex flex-col items-center shadow-inner ${className}`}>
          <div className="w-full text-xs font-semibold tracking-wider text-amber-400 uppercase mb-2 flex items-center justify-between">
            <span>Mouvements Latéraux : Épaule en dedans (30°)</span>
            <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-300">Sur 3 pistes</span>
          </div>
          <svg viewBox="0 0 340 180" className="w-full max-w-sm h-auto select-none font-sans">
            {/* Arena Wall */}
            <line x1="20" y1="25" x2="320" y2="25" stroke="#ca8a04" strokeWidth="4"/>
            <text x="30" y="18" fill="#ca8a04" fontSize="10" fontWeight="bold">Pare-botte / Mur de piste</text>
            {/* Tracks lines */}
            <line x1="20" y1="45" x2="320" y2="45" stroke="#57534e" strokeDasharray="3 3"/>
            <line x1="20" y1="75" x2="320" y2="75" stroke="#57534e" strokeDasharray="3 3"/>
            <line x1="20" y1="105" x2="320" y2="105" stroke="#57534e" strokeDasharray="3 3"/>
            <text x="325" y="48" fill="#a8a29e" fontSize="9">Piste 1</text>
            <text x="325" y="78" fill="#a8a29e" fontSize="9">Piste 2</text>
            <text x="325" y="108" fill="#a8a29e" fontSize="9">Piste 3</text>
            {/* Horse body oriented at 30 degrees angle */}
            <g transform="translate(160, 75) rotate(-30)">
              {/* Spine */}
              <ellipse cx="0" cy="0" rx="45" ry="14" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2"/>
              {/* Head / Neck incurved */}
              <path d="M35 -5 Q50 -12 60 -5" stroke="#facc15" strokeWidth="4" strokeLinecap="round"/>
              <text x="50" y="15" fill="#facc15" fontSize="9" fontWeight="bold">Tête</text>
              {/* Haunches */}
              <circle cx="-40" cy="0" r="5" fill="#10b981"/>
              <text x="-55" y="18" fill="#10b981" fontSize="9">Hanches</text>
            </g>
            {/* Angle arc */}
            <path d="M120 45 A40 40 0 0 1 145 62" fill="none" stroke="#ef4444" strokeWidth="2"/>
            <text x="148" y="55" fill="#ef4444" fontSize="11" fontWeight="bold">30°</text>
          </svg>
          <p className="text-[11px] text-stone-400 mt-2 text-center leading-relaxed">
            Les hanches restent sur la piste 1 contre le pare-botte. L’angle de 30° permet au postérieur intérieur (piste 3) de s’engager droit sous la masse.
          </p>
        </div>
      );

    case 'rein_contact':
    default:
      return (
        <div className={`p-4 bg-stone-900 rounded-xl text-stone-100 flex flex-col items-center shadow-inner ${className}`}>
          <div className="w-full text-xs font-semibold tracking-wider text-amber-400 uppercase mb-2 flex items-center justify-between">
            <span>Schéma : Contact Élastique vs Rêne Flottante</span>
            <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-300">Aides de main</span>
          </div>
          <svg viewBox="0 0 340 160" className="w-full max-w-sm h-auto select-none font-sans">
            {/* Rider Hand */}
            <rect x="40" y="65" width="25" height="30" rx="6" fill="#38bdf8"/>
            <text x="45" y="112" fill="#38bdf8" fontSize="10" fontWeight="bold">Main</text>
            {/* Horse Mouth */}
            <circle cx="280" cy="80" r="10" fill="#f59e0b"/>
            <text x="265" y="108" fill="#f59e0b" fontSize="10" fontWeight="bold">Mors</text>
            {/* Contact taut line */}
            <line x1="65" y1="75" x2="270" y2="78" stroke="#10b981" strokeWidth="3"/>
            <text x="160" y="70" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">Contact tendu &amp; élastique</text>
            {/* Loose rein curve */}
            <path d="M65 85 Q160 145 270 85" fill="none" stroke="#eab308" strokeWidth="2.5" strokeDasharray="4 3"/>
            <text x="160" y="145" textAnchor="middle" fill="#eab308" fontSize="10">Rêne flottante détendue</text>
          </svg>
          <p className="text-[11px] text-stone-400 mt-2 text-center leading-relaxed">
            Le contact n’est jamais lâche ni tracté : c’est une conversation continue et douce par un fil tendu élastique.
          </p>
        </div>
      );
  }
};
