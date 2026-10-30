// Génère les icônes PWA à partir de public/logo.svg : node scripts/generate-icons.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const svg = readFileSync('public/logo.svg');
const out = (name) => `public/${name}`;

await sharp(svg).resize(192).png().toFile(out('pwa-192x192.png'));
await sharp(svg).resize(512).png().toFile(out('pwa-512x512.png'));

// Maskable / Apple : fond plein (le système applique son propre masque), logo dans la zone sûre.
const composeFull = async (size, ratio, file) => {
  const inner = await sharp(svg).resize(Math.round(size * ratio)).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: '#162e24' } })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toFile(out(file));
};
await composeFull(512, 0.8, 'pwa-maskable-512x512.png');
await composeFull(180, 0.92, 'apple-touch-icon.png');

// favicon.ico : conteneur ICO embarquant un PNG 32×32.
const png = await sharp(svg).resize(32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // réservé
header.writeUInt16LE(1, 2); // type icône
header.writeUInt16LE(1, 4); // une image
header.writeUInt8(32, 6); // largeur
header.writeUInt8(32, 7); // hauteur
header.writeUInt16LE(1, 10); // plans de couleur
header.writeUInt16LE(32, 12); // bits par pixel
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18); // offset des données
writeFileSync(out('favicon.ico'), Buffer.concat([header, png]));

console.log('Icônes générées.');
