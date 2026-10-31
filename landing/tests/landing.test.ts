/**
 * Vérifications statiques du build de la landing page (landing/dist), sans navigateur :
 * liens et ancres, images, titres, métadonnées, absence de ressources externes et isolation
 * vis-à-vis de l'application (ni service worker ni manifeste).
 *
 * Lancement : npm run landing:test (construit la landing puis exécute ces tests et le parcours navigateur).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'landing/dist';
const html = readFileSync(join(DIST, 'index.html'), 'utf-8');
const APP_URL = 'https://equitor.swinux.ch/';
const ALLOWED_EXTERNAL = [APP_URL, 'https://github.com/nouhailler-coder/Equitor', 'mailto:contact@swinux.ch'];

const attrs = (tag: string, attr: string) =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*\\s${attr}="([^"]*)"`, 'g'))].map((m) => m[1]);
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

test('chaque ancre interne mène à un élément existant', () => {
  const anchors = attrs('a', 'href').filter((h) => h.startsWith('#'));
  assert.ok(anchors.length >= 8);
  for (const a of anchors) assert.ok(ids.has(a.slice(1)), `ancre sans cible : ${a}`);
});

test('les liens externes sont limités à l’application, au dépôt et au contact', () => {
  const external = attrs('a', 'href').filter((h) => !h.startsWith('#'));
  for (const h of external) assert.ok(ALLOWED_EXTERNAL.includes(h), `lien inattendu : ${h}`);
  const ctas = external.filter((h) => h === APP_URL);
  assert.ok(ctas.length >= 4, 'boutons vers l’application manquants');
});

test('les références de sprite pointent vers des symboles existants', () => {
  for (const ref of attrs('use', 'href')) assert.ok(ids.has(ref.slice(1)), `icône inconnue : ${ref}`);
});

test('chaque image existe, a un texte alternatif et des dimensions', () => {
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  assert.ok(imgs.length >= 10);
  for (const img of imgs) {
    const src = /\ssrc="([^"]+)"/.exec(img)?.[1] ?? '';
    assert.match(img, /\salt="[^"]*"/, `alt manquant : ${src}`);
    assert.match(img, /\swidth="\d+"/, `largeur manquante : ${src}`);
    assert.match(img, /\sheight="\d+"/, `hauteur manquante : ${src}`);
    assert.ok(existsSync(join(DIST, src)), `image absente du build : ${src}`);
  }
});

test('les captures d’écran sont décrites précisément', () => {
  const screens = [...html.matchAll(/<img\b[^>]*src="\/screens\/[^"]+"[^>]*>/g)].map((m) => m[0]);
  assert.ok(screens.length >= 8);
  for (const img of screens) assert.ok((/\salt="([^"]*)"/.exec(img)?.[1] ?? '').length > 30, img);
});

test('un seul h1 et une hiérarchie de titres sans saut', () => {
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  assert.equal(levels.filter((l) => l === 1).length, 1);
  assert.equal(levels[0], 1);
  for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1, `saut h${levels[i - 1]} → h${levels[i]}`);
});

test('métadonnées de référencement et de partage présentes', () => {
  assert.match(html, /<html lang="fr">/);
  assert.match(html, /<title>Equitor — [^<]+<\/title>/);
  for (const name of ['description']) assert.match(html, new RegExp(`<meta name="${name}" content="[^"]{60,}"`));
  for (const prop of ['og:title', 'og:description', 'og:image', 'og:type', 'og:locale']) {
    assert.match(html, new RegExp(`<meta property="${prop}" content="[^"]+"`), prop);
  }
  assert.ok(existsSync(join(DIST, 'og-image.png')));
  assert.ok(existsSync(join(DIST, 'favicon.svg')));
  assert.ok(existsSync(join(DIST, 'robots.txt')));
  JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '');
});

test('aucune ressource externe chargée, aucun style ni script en ligne', () => {
  for (const tag of ['script', 'img', 'link', 'iframe', 'source']) {
    for (const src of [...attrs(tag, 'src'), ...attrs(tag, 'href')]) {
      assert.ok(!/^(https?:)?\/\//.test(src), `ressource externe : <${tag}> ${src}`);
    }
  }
  assert.doesNotMatch(html, /\sstyle="/, 'attribut style en ligne (bloqué par la CSP)');
  const inline = [...html.matchAll(/<script(?![^>]*\ssrc=)([^>]*)>/g)].map((m) => m[1]);
  for (const s of inline) assert.match(s, /type="application\/ld\+json"/, 'script en ligne (bloqué par la CSP)');
});

test('la landing reste indépendante de l’application (pas de PWA ni de cache)', () => {
  assert.doesNotMatch(html, /rel="manifest"/);
  assert.doesNotMatch(html, /serviceWorker/);
  const files = readdirSync(DIST, { recursive: true }).map(String);
  assert.ok(!files.some((f) => /(^|\/)(sw|workbox-[^/]*)\.js$|manifest\.webmanifest$/.test(f)), files.join(', '));
  const js = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(DIST, f), 'utf-8')).join('\n');
  assert.doesNotMatch(js, /serviceWorker|localStorage|indexedDB|fetch\(/);
});

test('aucune promesse non vérifiée dans les textes', () => {
  const text = html.replace(/<[^>]+>/g, ' ');
  for (const forbidden of [/synchronisation (automatique|cloud)/i, /sauvegarde (cloud|en ligne)/i, /garanti/i, /témoignage/i, /\bnote de \d/i, /\d+\s?% des cavaliers/i]) {
    assert.doesNotMatch(text, forbidden);
  }
  assert.match(text, /ne remplace pas/);
});

test('en-têtes Cloudflare : CSP stricte et cache long des fichiers versionnés', () => {
  const headers = readFileSync(join(DIST, '_headers'), 'utf-8');
  assert.match(headers, /Content-Security-Policy: default-src 'self'/);
  assert.match(headers, /\/assets\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/);
});
