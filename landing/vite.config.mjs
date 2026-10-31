import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

/**
 * Landing page Equitor : site statique indépendant de l'application (pas de React,
 * pas de service worker, pas de manifeste). Construit dans landing/dist.
 *
 * LANDING_URL (facultatif) : adresse publique de la landing, ex. https://www.exemple.ch
 * Si elle est définie, le build ajoute l'URL canonique, og:url, une image de partage en
 * URL absolue et un sitemap. Sinon, ces éléments sont omis plutôt que devinés.
 */
const root = fileURLToPath(new URL('.', import.meta.url));

function siteUrl() {
  const raw = process.env.LANDING_URL?.trim();
  if (!raw) return '';
  const url = new URL(raw);
  if (url.protocol !== 'https:') throw new Error(`LANDING_URL doit commencer par https:// (reçu : ${raw})`);
  return url.origin + url.pathname.replace(/\/+$/, '');
}

const seo = () => {
  const SITE = siteUrl();
  return {
    name: 'equitor-landing-seo',
    transformIndexHtml(html) {
      if (!SITE) return html;
      return {
        html: html.replace('content="/og-image.png"', `content="${SITE}/og-image.png"`),
        tags: [
          { tag: 'link', attrs: { rel: 'canonical', href: `${SITE}/` }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:url', content: `${SITE}/` }, injectTo: 'head' },
        ],
      };
    },
    generateBundle() {
      const robots = `User-agent: *\nAllow: /\n${SITE ? `\nSitemap: ${SITE}/sitemap.xml\n` : ''}`;
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      if (SITE) {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc></url>\n</urlset>\n`;
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      }
    },
  };
};

export default defineConfig({
  root,
  publicDir: 'public',
  plugins: [seo()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Un seul petit script, sans import dynamique : le polyfill de préchargement est inutile.
    modulePreload: { polyfill: false },
  },
  server: { port: 3100 },
  preview: { port: 4180 },
});
