# Architecture Technique Locale — ÉquiProgression

## 1. Principes Fondamentaux
- **Client-Side Exclusive** : L'application s'exécute intégralement dans le navigateur de l'utilisateur.
- **Zéro Cloud & Zéro Télémesure** : Aucune dépendance externe vers des serveurs d'authentification, bases hébergées (PostgreSQL, Supabase, Firebase) ou API d'analytics tiers.
- **PWA Autonome** : L'application est mise en cache via Service Worker lors de la première consultation et reste opérationnelle sans réseau.

## 2. Modèle de Données (IndexedDB via Dexie.js)
Le stockage persistant utilise IndexedDB avec les tables suivantes :
- `horses` : Profils des chevaux (nom, race, année de naissance, tempérament, notes matérielles).
- `ridingSessions` : Journal des séances (date, durée, thème, objectifs, exercices, ressenti cavalier, bien-être équin, réussites, difficultés, prochaines étapes).
- `userProgress` : État de consultation et d'assimilation des fiches pédagogiques (`non_commence`, `en_cours`, `termine`), compteur de révisions et notes personnelles privées.
- `quizAttempts` : Historique des tentatives de quiz, réponses sélectionnées et taux de réussite.
- `favorites` : Identifiants des fiches ou notions mises en favoris.

## 3. Stratégie Hors Ligne (Service Worker)
- Généré automatiquement par `vite-plugin-pwa` avec Workbox.
- Cache First pour les polices et ressources statiques.
- Pré-mise en cache des bundles JavaScript, styles Tailwind CSS, images PNG d'icônes et schémas vectoriels SVG.
- Bandeau visuel d'information lorsque la connectivité réseau est interrompue.
