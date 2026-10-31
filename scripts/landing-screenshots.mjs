/**
 * Captures d'écran authentiques de l'application pour la landing page (landing/public/screens/).
 * Chaque image provient du build de production réel, sans retouche, en thème clair.
 *
 * Lancement : npm run landing:screens  (construit l'app puis lance `vite preview` sur le port 4175).
 * Navigateur : celui de Playwright s'il est installé, sinon CHROMIUM_PATH ou un Chromium/Chrome du système.
 */
import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';
import { chromium } from 'playwright-core';

const PORT = 4175;
const BASE = `http://localhost:${PORT}`;
const OUT = 'landing/public/screens';

function findSystemBrowser() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  for (const name of ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable']) {
    try {
      const p = execSync(`command -v ${name}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (p && existsSync(p)) return p;
    } catch {
      // essayer le suivant
    }
  }
  return undefined;
}

async function launch() {
  try {
    return await chromium.launch();
  } catch {
    const executablePath = findSystemBrowser();
    if (!executablePath) throw new Error('Aucun navigateur Chromium trouvé : définissez CHROMIUM_PATH.');
    return chromium.launch({ executablePath });
  }
}

async function waitForServer(url, ms = 20000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // pas encore prêt
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('Le serveur de prévisualisation ne répond pas.');
}

/** Écrans capturés : nom du fichier, route, action facultative avant la capture. */
const MOBILE_SHOTS = [
  { name: 'accueil', route: 'accueil' },
  {
    name: 'fiche',
    route: 'apprendre',
    before: async (page) => {
      await page.getByText('Principes des aides naturelles').first().click();
      await page.getByRole('dialog').waitFor();
    },
    // La fiche est une fenêtre globale : la refermer pour ne pas masquer les écrans suivants.
    after: (page) => page.getByRole('button', { name: 'Fermer', exact: true }).click(),
  },
  { name: 'preparation', route: 'pratiquer/preparation/nouveau/tpl-avant-seance' },
  { name: 'journal', route: 'journal/nouveau' },
  { name: 'progression', route: 'progression' },
  { name: 'manege', route: 'ressources/manege/demi-volte' },
  { name: 'dictionnaire', route: 'ressources/dictionnaire' },
  { name: 'revision', route: 'reviser' },
];
const DESKTOP_SHOTS = [{ name: 'accueil-ordinateur', route: 'accueil' }];

async function capture(context, shots, width) {
  const page = await context.newPage();
  for (const shot of shots) {
    await page.goto(`${BASE}/#/${shot.route}`);
    await page.locator('main').waitFor();
    await page.waitForLoadState('networkidle');
    if (shot.before) await shot.before(page);
    await page.waitForTimeout(600);
    const png = await page.screenshot();
    await sharp(png).resize({ width }).webp({ quality: 82 }).toFile(`${OUT}/${shot.name}.webp`);
    if (shot.after) await shot.after(page);
    console.log(`  ✔ ${shot.name}.webp`);
  }
  await page.close();
}

async function newContext(browser, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: 'fr-FR', colorScheme: 'light', reducedMotion: 'reduce' });
  // Premier lancement déjà passé : ni onboarding, ni aide contextuelle par-dessus les écrans.
  await context.addInitScript(() => {
    localStorage.setItem('legal_notice_acknowledged', 'true');
    localStorage.setItem('legal_notice_acknowledged_version', '1.0');
    localStorage.setItem('equi.guide.seen', JSON.stringify(['accueil', 'apprendre', 'pratiquer', 'reviser', 'progression', 'journal', 'ressources']));
    localStorage.setItem('equi.theme', 'light');
  });
  return context;
}

mkdirSync(OUT, { recursive: true });
if (!process.argv.includes('--no-build')) execSync('npm run build', { stdio: 'inherit' });
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
try {
  await waitForServer(BASE);
  const browser = await launch();
  await capture(await newContext(browser, { width: 390, height: 844 }), MOBILE_SHOTS, 520);
  await capture(await newContext(browser, { width: 1280, height: 800 }), DESKTOP_SHOTS, 1280);
  await browser.close();
} finally {
  server.kill();
}
