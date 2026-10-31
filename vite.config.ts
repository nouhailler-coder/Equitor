import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const APP_VERSION: string = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')).version;
const BUILD_DATE = new Date().toISOString();

/**
 * Publie `version.json` (version + date de sortie) à la racine du site.
 * Ce fichier n'est jamais pré-mis en cache : il sert à détecter les nouvelles versions.
 */
const versionManifest = (): Plugin => {
  const body = () => JSON.stringify({ version: APP_VERSION, buildDate: BUILD_DATE }, null, 2);
  return {
    name: 'equi-version-manifest',
    configureServer(server) {
      server.middlewares.use('/version.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(body());
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: body() });
    },
  };
};

export default defineConfig(() => {
  return {
    define: {
      __APP_VERSION__: JSON.stringify(APP_VERSION),
      __BUILD_DATE__: JSON.stringify(BUILD_DATE),
    },
    plugins: [
      react(),
      tailwindcss(),
      versionManifest(),
      VitePWA({
        // 'prompt' : le nouveau Service Worker attend ; src/pwa/updateManager.ts
        // décide quand l'appliquer (automatiquement à un moment sûr, ou à la demande).
        registerType: 'prompt',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'ÉquiProgression',
          short_name: 'ÉquiProgr',
          description: 'Application PWA 100% locale d’apprentissage, de pratique équestre et de révisions fondée sur les principes de l’équitation classique.',
          theme_color: '#1e3a2f',
          background_color: '#1e3a2f',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json,md}'],
          globIgnores: ['**/version.json'],
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

