/**
 * Tests de bout en bout (Playwright) sur le build de production, en format mobile.
 * Parcours : installation/ouverture, diagnostic, fiche, quiz, progression, séance, cheval,
 * programme, révision, export/import, plus fonctionnement hors ligne et absence de
 * débordement horizontal / d'erreur console.
 *
 * Lancement : npm run test:e2e  (construit puis lance `vite preview` sur le port 4174).
 * Navigateur : celui de Playwright s'il est installé, sinon CHROMIUM_PATH ou un Chromium/Chrome du système.
 */
import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const PORT = 4174;
const BASE = `http://localhost:${PORT}`;
const results = [];
const consoleErrors = [];

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

let currentPage;
async function step(name, fn) {
  const t = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - t });
    console.log(`  ✔ ${name}`);
  } catch (e) {
    results.push({ name, ok: false, error: e.message.split('\n')[0] });
    console.log(`  ✖ ${name}\n    ${e.message.split('\n')[0]}`);
    // Capture pour diagnostic, puis rechargement : un échec ne doit pas bloquer les parcours suivants.
    if (process.env.E2E_SHOTS && currentPage) await currentPage.screenshot({ path: join(process.env.E2E_SHOTS, `echec-${results.length}.png`) }).catch(() => {});
    await currentPage?.reload().catch(() => {});
  }
}

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

async function noHorizontalScroll(page, where) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(over <= 1, `débordement horizontal de ${over}px sur ${where}`);
}

/** Répond à la question affichée (n'importe quelle réponse) puis passe à la suite. */
async function answerCurrentQuestion(page) {
  const main = page.locator('main');
  // Attendre qu'une question (ou une carte) soit affichée.
  await main.getByText(/^(QCM|Vrai ou faux|Associations|Classement|Identification sur image|Texte à compléter|Question ouverte|Reconnaître la notion|Situation pédagogique|Carte mémoire)$|Recto/).first().waitFor({ timeout: 10000 });
  const radios = main.getByRole('radio');
  const checkboxes = main.locator('[role="checkbox"]');
  if (await main.getByRole('button', { name: 'Retourner la carte' }).count()) {
    await main.getByRole('button', { name: 'Retourner la carte' }).click();
    const knew = main.getByRole('button', { name: 'Je savais' });
    await (await knew.count() ? knew : main.getByRole('button', { name: 'Bien', exact: true })).click();
  } else if (await main.getByRole('button', { name: 'Voir la correction indicative' }).count()) {
    await main.getByRole('button', { name: 'Voir la correction indicative' }).click();
    await main.getByRole('button', { name: 'Valider mon auto-évaluation' }).click();
  } else if (await main.locator('select').count()) {
    for (const s of await main.locator('select').all()) await s.selectOption({ index: 1 });
    await main.getByRole('button', { name: 'Valider', exact: true }).click();
  } else if (await main.getByRole('button', { name: 'Valider l’ordre' }).count()) {
    await main.getByRole('button', { name: 'Valider l’ordre' }).click();
  } else if (await main.locator('input[aria-label^="Trou"]').count()) {
    for (const i of await main.locator('input[aria-label^="Trou"]').all()) await i.fill('réponse');
    await main.getByRole('button', { name: 'Valider', exact: true }).click();
  } else if (await main.locator('path[role="button"]').count()) {
    await main.locator('path[role="button"]').first().click({ force: true });
    await main.getByRole('button', { name: 'Valider', exact: true }).click();
  } else if (await radios.count()) {
    await radios.first().click();
    const v = main.getByRole('button', { name: 'Valider', exact: true });
    if (await v.count()) await v.click();
  } else if (await checkboxes.count()) {
    await checkboxes.first().click();
    await main.getByRole('button', { name: 'Valider', exact: true }).click();
  } else {
    throw new Error('type de question non reconnu');
  }
}

async function runExercise(page, id) {
  await page.goto(`${BASE}/#/pratiquer/exercice/${id}`);
  await page.getByRole('button', { name: /Commencer|Recommencer l’exercice/ }).click();
  for (let i = 0; i < 20; i++) {
    await answerCurrentQuestion(page);
    const next = page.getByRole('button', { name: /Question suivante|Voir mon résultat/ });
    await next.waitFor({ timeout: 5000 });
    const label = await next.textContent();
    await next.click();
    if (label?.includes('résultat')) break;
  }
  await page.getByRole('heading', { name: 'Résultat', exact: true }).waitFor({ timeout: 5000 });
}

async function main() {
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  let browser;
  try {
    await waitForServer(BASE);
    browser = await launch();
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, locale: 'fr-FR', acceptDownloads: true });
    const page = await context.newPage();
    currentPage = page;
    page.on('pageerror', (e) => consoleErrors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    // Les guides contextuels sont testés à part : on les marque vus pour ne pas gêner les parcours.
    const skipGuides = () => page.evaluate(() => localStorage.setItem('equi.guide.seen', JSON.stringify(['accueil', 'apprendre', 'pratiquer', 'reviser', 'progression', 'journal', 'ressources'])));

    console.log('Parcours de bout en bout :');

    await step('1. Ouverture, avertissement légal et service worker', async () => {
      await page.goto(BASE);
      await page.getByRole('dialog').getByRole('heading', { name: /Bienvenue sur/ }).waitFor();
      await page.getByRole('button', { name: 'Passer' }).click();
      await page.getByRole('button', { name: 'J’ai compris' }).click();
      await skipGuides();
      await page.reload();
      await page.locator('main').getByRole('heading', { name: /Bienvenue sur Equitor|Bonjour/ }).waitFor();
      assert((await page.getByRole('button', { name: 'J’ai compris' }).count()) === 0, 'l’avertissement réapparaît');
      const sw = await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()));
      assert(sw, 'service worker non enregistré');
      await noHorizontalScroll(page, 'accueil');
    });

    await step('2. Profil et diagnostic initial', async () => {
      await page.goto(`${BASE}/#/progression/profil`);
      await page.getByRole('button', { name: 'Intermédiaire' }).click();
      await page.getByRole('button', { name: /Enregistrer et faire le diagnostic/ }).click();
      await page.getByRole('button', { name: 'Commencer' }).click();
      for (let i = 0; i < 40; i++) {
        await answerCurrentQuestion(page);
        const next = page.getByRole('button', { name: /Question suivante|Voir mes résultats/ });
        await next.waitFor({ timeout: 5000 });
        const label = await next.textContent();
        await next.click();
        if (label?.includes('résultats')) break;
      }
      await page.getByRole('heading', { name: 'Résultats du diagnostic' }).waitFor();
      await page.getByText('Parcours proposé').waitFor();
      await noHorizontalScroll(page, 'diagnostic');
    });

    await step('3. Consultation d’une fiche et définition contextuelle', async () => {
      await page.goto(`${BASE}/#/apprendre`);
      await page.getByText('Les figures de manège et la géométrie des courbes').first().click();
      await page.getByRole('dialog', { name: /figures de manège/ }).waitFor();
      const term = page.getByRole('button', { name: /^Définition :/ }).first();
      await term.click();
      await page.getByRole('button', { name: 'Voir la fiche complète' }).waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Fermer la fiche' }).click();
    });

    await step('4. Réalisation de quiz (les 10 types de questions)', async () => {
      await runExercise(page, 'ex-allures-bases');
      await page.getByText('Mes résultats précédents').waitFor();
      await runExercise(page, 'ex-anatomie-tete-pied'); // image, notion, ouverte
      await runExercise(page, 'ex-cartes-notions-cles'); // cartes mémoire
      await runExercise(page, 'ex-transitions'); // situation
      await noHorizontalScroll(page, 'exercice');
    });

    await step('5. Consultation de la progression', async () => {
      await page.goto(`${BASE}/#/progression`);
      await page.getByRole('heading', { name: 'Ma progression' }).waitFor();
      // Valeur lue en base de façon asynchrone : on attend qu'elle soit calculée.
      await page.locator('text=exercices réalisés').locator('..').filter({ hasText: /[1-9]/ }).waitFor({ timeout: 5000 });
      await noHorizontalScroll(page, 'progression');
    });

    await step('6. Ajout d’un cheval', async () => {
      await page.goto(`${BASE}/#/journal/chevaux/nouveau`);
      await page.getByLabel('Nom *').fill('Bijou');
      await page.getByLabel('Robe').fill('Bai');
      await page.getByRole('button', { name: 'Enregistrer' }).click();
      await page.getByRole('heading', { name: 'Bijou' }).waitFor();
    });

    await step('7. Création d’une séance au journal', async () => {
      await page.goto(`${BASE}/#/journal/nouveau`);
      await page.getByLabel('Titre').fill('Transitions au trot');
      await page.getByLabel('Cheval', { exact: true }).selectOption({ label: 'Bijou' });
      await page.getByLabel('Objectifs (un par ligne)').fill('Rythme\nTransitions fluides');
      await page.getByRole('button', { name: 'Enregistrer' }).click();
      await page.getByRole('heading', { name: 'Transitions au trot' }).waitFor();
      await page.goto(`${BASE}/#/journal`);
      await page.getByPlaceholder('Rechercher dans le journal…').fill('transitions');
      await page.getByText('Transitions au trot').waitFor();
    });

    await step('8. Création d’un programme et bilan', async () => {
      await page.goto(`${BASE}/#/pratiquer/preparation/nouveau/tpl-transitions`);
      await page.getByRole('button', { name: 'Enregistrer' }).click();
      await page.getByRole('button', { name: 'Faire le bilan de la séance' }).click();
      await page.getByLabel('Objectifs atteints').fill('Transitions plus fluides');
      await page.getByRole('button', { name: 'Enregistrer le bilan' }).click();
      await page.getByText('Bilan après séance').first().waitFor();
      await page.getByRole('button', { name: 'Créer l’entrée du journal' }).click();
      await page.getByRole('heading', { name: 'Nouvelle séance' }).waitFor();
    });

    await step('9. Révision espacée', async () => {
      await page.goto(`${BASE}/#/reviser`);
      await page.getByRole('button', { name: 'Commencer mes révisions' }).click();
      const before = await page.evaluate(() => new Promise((res) => {
        const r = indexedDB.open('EquiProgressionDB');
        r.onsuccess = () => { const t = r.result.transaction('revisionItems').objectStore('revisionItems').getAll(); t.onsuccess = () => res(t.result.reduce((s, i) => s + i.reviews, 0)); };
      }));
      await answerCurrentQuestion(page);
      const cont = page.getByRole('button', { name: /^(Continuer|Bien|Facile|Difficile)$/ }).first();
      await cont.click();
      await page.waitForTimeout(300);
      const after = await page.evaluate(() => new Promise((res) => {
        const r = indexedDB.open('EquiProgressionDB');
        r.onsuccess = () => { const t = r.result.transaction('revisionItems').objectStore('revisionItems').getAll(); t.onsuccess = () => res(t.result.reduce((s, i) => s + i.reviews, 0)); };
      }));
      assert(after > before, 'la révision n’a pas été enregistrée');
    });

    await step('10. Export puis import des données', async () => {
      await page.goto(`${BASE}/#/progression/donnees`);
      const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exporter mes données' }).click()]);
      const file = join(mkdtempSync(join(tmpdir(), 'equi-e2e-')), 'sauvegarde.json');
      await download.saveAs(file);
      const json = JSON.parse(readFileSync(file, 'utf8'));
      assert(json.format === 'equiprogression-backup' && json.formatVersion === 2, 'format de sauvegarde inattendu');
      assert(json.data.horses.length === 1 && json.data.ridingSessions.length >= 1, 'données manquantes dans l’export');
      await page.getByRole('button', { name: 'Effacer mes données…' }).click();
      await page.getByRole('button', { name: 'Tout effacer' }).click();
      await page.waitForTimeout(300);
      await page.locator('input[type=file]').setInputFiles(file);
      await page.getByText('Intégrité : ✅ vérifiée').waitFor();
      await page.getByRole('button', { name: 'Restaurer', exact: true }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Fusionner' }).click();
      await page.goto(`${BASE}/#/journal`);
      await page.getByText('Transitions au trot').waitFor();
    });

    await step('11. Fonctionnement hors ligne (journal, fiches, exercices)', async () => {
      await context.setOffline(true);
      await page.reload();
      await page.getByText('Transitions au trot').waitFor({ timeout: 8000 });
      await page.goto(`${BASE}/#/ressources/dictionnaire/term-impulsion`);
      await page.getByRole('heading', { name: 'Impulsion' }).waitFor();
      await runExercise(page, 'ex-securite-manege');
      await context.setOffline(false);
    });

    await step('12. Mode sombre et pages sans débordement', async () => {
      await page.evaluate(() => localStorage.setItem('equi.theme', 'sombre'));
      for (const r of ['accueil', 'apprendre', 'ressources/atlas', 'ressources/manege', 'reviser/cartes', 'journal/analyse', 'pratiquer/checklists']) {
        await page.goto(`${BASE}/#/${r}`);
        await page.reload();
        await page.locator('main h1').first().waitFor();
        assert(await page.evaluate(() => document.documentElement.classList.contains('dark')), 'thème sombre non appliqué');
        await noHorizontalScroll(page, r);
      }
    });

    await context.close();
  } finally {
    await browser?.close();
    server.kill();
  }

  const failed = results.filter((r) => !r.ok);
  const errors = consoleErrors.filter((e) => !/net::ERR_INTERNET_DISCONNECTED|Failed to fetch|version\.json/.test(e));
  console.log(`\n${results.length - failed.length}/${results.length} parcours réussis.`);
  if (errors.length) console.log(`Erreurs console :\n  - ${errors.join('\n  - ')}`);
  process.exit(failed.length || errors.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
