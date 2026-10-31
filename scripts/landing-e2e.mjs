/**
 * Parcours navigateur de la landing page (build de production, `vite preview` sur le port 4181) :
 * débordement horizontal de 320 à 1920 px, menu mobile (ouverture, Échap, lien), navigation au
 * clavier, images chargées, absence d'erreur console et de requête vers un autre domaine.
 *
 * Lancement : npm run landing:test (ou node scripts/landing-e2e.mjs après npm run landing:build).
 * Captures facultatives : LANDING_SHOTS=<dossier> enregistre une capture pleine page par largeur.
 */
import { spawn, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const PORT = 4181;
const BASE = `http://localhost:${PORT}`;
const WIDTHS = [320, 375, 768, 1024, 1366, 1920];
const results = [];

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

async function step(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✔ ${name}`);
  } catch (e) {
    results.push({ name, ok: false });
    console.log(`  ✖ ${name}\n    ${e.message.split('\n')[0]}`);
  }
}

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

/** Ouvre la page en suivant les erreurs console et les requêtes sortantes. */
async function openPage(browser, width, height = 900) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  const foreign = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) foreign.push(r.url());
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  return { page, errors, foreign };
}

const server = spawn('npx', ['vite', 'preview', '--config', 'landing/vite.config.mjs', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
let browser;
try {
  await waitForServer(BASE);
  browser = await launch();

  for (const width of WIDTHS) {
    await step(`${width} px : pas de débordement horizontal, pas d'erreur, aucune requête externe`, async () => {
      const { page, errors, foreign } = await openPage(browser, width);
      // Faire défiler toute la page pour déclencher le chargement différé des images.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 80));
        }
        // Sur mobile, la galerie défile horizontalement : la parcourir aussi.
        const gallery = document.querySelector('.gallery');
        for (let x = 0; gallery && x <= gallery.scrollWidth; x += 200) {
          gallery.scrollLeft = x;
          await new Promise((r) => setTimeout(r, 80));
        }
      });
      await page
        .waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 8000 })
        .catch(() => {});
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(over <= 1, `débordement de ${over}px`);
      const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src));
      assert(broken.length === 0, `images non chargées : ${broken.join(', ')}`);
      assert(errors.length === 0, `erreurs console : ${errors.join(' | ')}`);
      assert(foreign.length === 0, `requêtes externes : ${foreign.join(', ')}`);
      if (process.env.LANDING_SHOTS) await page.screenshot({ path: join(process.env.LANDING_SHOTS, `landing-${width}.png`), fullPage: true });
      await page.close();
    });
  }

  await step('menu mobile : ouverture, lien, Échap et retour du focus', async () => {
    const { page } = await openPage(browser, 375);
    const toggle = page.locator('.menu-toggle');
    const nav = page.locator('#menu-principal');
    assert(!(await nav.isVisible()), 'menu visible avant ouverture');
    await toggle.click();
    assert((await toggle.getAttribute('aria-expanded')) === 'true', 'aria-expanded non mis à jour');
    assert(await nav.getByRole('link', { name: 'Préparer' }).isVisible(), 'liens du menu invisibles');
    await nav.getByRole('link', { name: 'Préparer' }).click();
    await page.waitForFunction(() => location.hash === '#preparer');
    assert(!(await nav.isVisible()), 'le menu reste ouvert après un clic sur un lien');
    await toggle.click();
    await page.keyboard.press('Escape');
    assert(!(await nav.isVisible()), 'Échap ne ferme pas le menu');
    assert(await toggle.evaluate((el) => el === document.activeElement), 'le focus ne revient pas au bouton');
    await page.close();
  });

  await step('ordinateur : navigation visible et menu mobile masqué', async () => {
    const { page } = await openPage(browser, 1366);
    assert(await page.locator('#menu-principal').isVisible(), 'navigation masquée');
    assert(!(await page.locator('.menu-toggle').isVisible()), 'bouton de menu visible');
    await page.close();
  });

  await step('clavier : lien d’évitement puis éléments focalisables visibles', async () => {
    const { page } = await openPage(browser, 1366);
    await page.keyboard.press('Tab');
    const skip = await page.evaluate(() => document.activeElement?.textContent?.trim());
    assert(skip === 'Aller au contenu', `premier focus : ${skip}`);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => location.hash === '#contenu');
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      const visible = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).outlineStyle !== 'none';
      });
      assert(visible, `élément focalisé n° ${i + 1} invisible ou sans contour`);
    }
    await page.close();
  });

  await step('boutons d’action : cibles tactiles ≥ 44 px et lien vers l’application', async () => {
    const { page } = await openPage(browser, 375);
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('.btn, .menu-toggle')]
        .filter((el) => el.offsetParent !== null)
        .filter((el) => el.getBoundingClientRect().height < 44)
        .map((el) => el.textContent?.trim()),
    );
    assert(small.length === 0, `cibles trop petites : ${small.join(', ')}`);
    const href = await page.getByRole('link', { name: 'Ouvrir Equitor', exact: true }).getAttribute('href');
    assert(href === 'https://equitor.swinux.ch/', `lien principal : ${href}`);
    await page.close();
  });

  await step('réduction des animations respectée', async () => {
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(BASE);
    const behavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
    assert(behavior === 'auto', `scroll-behavior : ${behavior}`);
    await page.close();
  });
} finally {
  await browser?.close();
  server.kill();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} vérifications réussies`);
process.exit(failed ? 1 : 0);
