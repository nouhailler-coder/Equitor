/**
 * Invariants du système légal et de l'aide contextuelle, vérifiés mécaniquement :
 *  1. La section « Précision de la localisation » existe si et seulement si le code lit la position.
 *  2. Aucune section légale ni aucun paragraphe n'est vide.
 *  3. Chaque onglet de navigation possède son guide d'écran (avec au moins une astuce).
 * Lancement : npm run check:legal (inclus dans npm test).
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { legalNotice } from '../src/legal/legalContent';
import { SCREEN_GUIDES } from '../src/onboarding/screenGuides';

const errors: string[] = [];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(p) ? [p] : [];
  });

// 1. Localisation : on cherche l'usage réel de l'API de position du navigateur.
const positionApi = new RegExp(['navigator', 'geo' + 'location'].join('\\.'));
const usesPosition = walk('src').some((f) => positionApi.test(readFileSync(f, 'utf-8')));
const hasGpsSection =
  legalNotice.gpsWarning !== null && legalNotice.sections.some((s) => s.id === legalNotice.gpsWarning?.id);
if (usesPosition !== hasGpsSection) {
  errors.push(
    usesPosition
      ? 'Le code utilise la localisation mais la section « Précision de la localisation » est absente.'
      : 'La section « Précision de la localisation » est présente alors que le code n’utilise pas la localisation.',
  );
}

// 2. Sections non vides.
if (legalNotice.shortWarning.length === 0) errors.push('L’avertissement court est vide.');
for (const s of legalNotice.sections) {
  if (!s.title.trim()) errors.push(`Section « ${s.id} » sans titre.`);
  if (s.paragraphs.length === 0) errors.push(`Section « ${s.title} » vide.`);
  s.paragraphs.forEach((p, i) => {
    if (!p.trim()) errors.push(`Section « ${s.title} » : paragraphe ${i + 1} vide.`);
  });
}

// 3. Un guide par onglet déclaré dans Navigation.tsx.
const nav = readFileSync('src/components/layout/Navigation.tsx', 'utf-8');
const union = nav.match(/export type TabType\s*=\s*([^;]+);/)?.[1] ?? '';
const tabs = [...union.matchAll(/'([^']+)'/g)].map((m) => m[1]);
if (tabs.length === 0) errors.push('Impossible de lire TabType dans Navigation.tsx.');
for (const t of tabs) {
  const g = (SCREEN_GUIDES as Record<string, { tips: unknown[] } | undefined>)[t];
  if (!g || g.tips.length === 0) errors.push(`L’écran « ${t} » n’a pas de guide contextuel.`);
}

if (errors.length) {
  console.error('✗ check-legal :\n  - ' + errors.join('\n  - '));
  process.exit(1);
}
console.log(`✓ check-legal : ${legalNotice.sections.length} sections, ${tabs.length} guides d’écran, localisation ${usesPosition ? 'utilisée' : 'non utilisée'}.`);
