// Génère les icônes et l'image de partage de la landing page à partir de public/logo.svg :
// node scripts/landing-assets.mjs  (ou npm run landing:assets)
import sharp from 'sharp';
import { copyFileSync, mkdirSync, readFileSync } from 'fs';

const OUT = 'landing/public';
mkdirSync(OUT, { recursive: true });

const logo = readFileSync('public/logo.svg');
copyFileSync('public/logo.svg', `${OUT}/favicon.svg`);
await sharp(logo).resize(32).png().toFile(`${OUT}/favicon-32.png`);

// Apple : fond plein (le système arrondit lui-même), logo dans la zone sûre.
const inner = await sharp(logo).resize(166).png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#162e24' } })
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile(`${OUT}/apple-touch-icon.png`);

// Image de partage 1200 × 630 (Open Graph) : logo, nom, accroche et carrière stylisée.
const W = 1200;
const H = 630;
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1f4434"/>
      <stop offset="1" stop-color="#0c1712"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g fill="none" stroke="#e3c77e" stroke-opacity="0.22" stroke-width="2.5">
    <rect x="880" y="-40" width="240" height="720" rx="4" transform="rotate(8 1000 315)"/>
    <path d="M1000 -40c-110 120-110 200 0 240s110 120 0 240-110 120 0 240" transform="rotate(8 1000 315)"/>
  </g>
  <text x="300" y="268" font-family="Palatino, 'Palatino Linotype', 'URW Palladio L', Georgia, serif" font-size="96" font-weight="600" fill="#f3eee3">Equitor</text>
  <text x="300" y="330" font-family="'DejaVu Sans', Arial, sans-serif" font-size="25" letter-spacing="3" fill="#e3c77e">CARNET D’APPRENTISSAGE ÉQUESTRE</text>
  <text font-family="Palatino, 'Palatino Linotype', 'URW Palladio L', Georgia, serif" font-size="38" fill="#c9c3b5">
    <tspan x="96" y="470">Apprendre, comprendre et progresser</tspan>
    <tspan x="96" y="520">en équitation classique.</tspan>
  </text>
  <rect x="96" y="558" width="72" height="4" rx="2" fill="#e3c77e"/>
</svg>`;
const logoOg = await sharp(logo).resize(168).png().toBuffer();
await sharp(Buffer.from(og))
  .composite([{ input: logoOg, left: 96, top: 150 }])
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/og-image.png`);

console.log('Icônes et image de partage générées dans', OUT);
