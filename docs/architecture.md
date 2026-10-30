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

## 4. Mises à jour de l'application
- **Version & date de sortie** : `__APP_VERSION__` (issu de `package.json`) et `__BUILD_DATE__` (horodatage du build) sont injectés par Vite. Un fichier `version.json` est publié à la racine à chaque build ; il est exclu du pré-cache pour toujours refléter la dernière version en ligne.
- **Gestionnaire** : `src/pwa/updateManager.ts` (hook `useAppUpdate`). Le Service Worker est enregistré en mode `prompt` : une nouvelle version est téléchargée en arrière-plan puis reste en attente.
- **Vérification automatique** : toutes les heures, au retour en ligne et au retour au premier plan (si la dernière vérification date de plus de 15 min).
- **Installation automatique** : si l'option « Mises à jour automatiques » est active (par défaut), la version en attente est appliquée au lancement de l'application ou lorsqu'elle passe en arrière-plan, pour ne jamais interrompre une saisie.
- **Paramètres système** (menu ☰ → Système) : version, date de sortie, date de dernière vérification, boutons « Vérifier les mises à jour » et « Forcer la mise à jour » (désinscription du Service Worker + vidage du Cache Storage, sans toucher aux données IndexedDB).
- Seule la ressource statique `version.json` est interrogée : aucune donnée personnelle n'est transmise.
