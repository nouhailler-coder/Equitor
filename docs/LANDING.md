# 🌿 Landing page Equitor

Page de présentation d'Equitor, destinée aux cavaliers qui découvrent l'application. Elle renvoie vers l'application publiée sur **https://equitor.swinux.ch/**.

## Choix d'architecture

La landing est un **site statique indépendant**, dans `landing/`, publié comme **projet Cloudflare Pages distinct** de l'application.

- L'application occupe déjà la racine de `equitor.swinux.ch` avec son service worker (portée `/`) et son routage `#/…`. Une landing sur le même domaine devrait déplacer l'application ou partager sa portée de cache : le risque de casser l'application installée est réel, le gain nul.
- La landing n'a **ni React, ni service worker, ni manifeste** : HTML sémantique, une feuille de style et 0,7 ko de JavaScript (menu mobile). Elle n'est pas installable et n'a pas besoin de l'être.
- Elle réutilise l'outil de build du dépôt (**Vite**, configuration `landing/vite.config.mjs`) : aucune dépendance ajoutée.
- **Aucune ressource externe** : polices système (pas de Google Fonts), icônes en sprite SVG, images servies par le site. Aucun cookie, aucun traceur.
- L'application n'est pas modifiée, à une ligne près : `@source not "../landing"` dans `src/index.css` empêche Tailwind de générer des classes à partir des fichiers de la landing (le CSS de l'application est identique, octet pour octet, à celui de la version 2.0.0 publiée).

```
landing/
├── index.html            tous les textes de la page (source unique du contenu)
├── src/styles.css        identité visuelle (jetons de couleur sur :root)
├── src/main.js           menu mobile accessible
├── public/
│   ├── screens/          captures réelles de l'application (WebP)
│   ├── favicon.svg …     icônes et image de partage (générées)
│   └── _headers          en-têtes Cloudflare (CSP, cache)
├── tests/landing.test.ts vérifications statiques du build
└── vite.config.mjs       build + URL canonique / sitemap si LANDING_URL est défini
scripts/
├── landing-screenshots.mjs  captures de l'application (npm run landing:screens)
├── landing-assets.mjs       icônes + image Open Graph (npm run landing:assets)
└── landing-e2e.mjs          parcours navigateur (inclus dans npm run landing:test)
```

## Commandes

```bash
npm run landing:dev       # serveur de développement (port 3100)
npm run landing:build     # build de production → landing/dist
npm run landing:preview   # prévisualiser le build (port 4180)
npm run landing:test      # build + 11 vérifications statiques + 11 vérifications navigateur
npm run landing:screens   # reconstruit l'app et refait les captures d'écran
npm run landing:assets    # régénère favicon, apple-touch-icon et og-image depuis public/logo.svg
```

## ☁️ Déploiement Cloudflare Pages

Créer un **nouveau projet Pages** (ne pas modifier celui de l'application) :

| Réglage | Valeur |
|---|---|
| Dépôt | `nouhailler-coder/Equitor` |
| Branche de production | `main` |
| Préréglage de framework | Aucun |
| Commande de build | `npm ci && npm run landing:build` |
| Répertoire de sortie | `landing/dist` |
| Répertoire racine | *(vide : racine du dépôt)* |
| Variable d'environnement | `LANDING_URL` = adresse publique de la landing, ex. `https://www.exemple.ch` *(facultative)* |

- **Sans `LANDING_URL`** : la page fonctionne ; l'URL canonique, `og:url` et le sitemap sont simplement omis (l'image de partage reste en chemin relatif, moins bien prise en charge par certains réseaux sociaux).
- **Avec `LANDING_URL`** : ajout de `<link rel="canonical">`, `og:url`, image de partage en URL absolue, `sitemap.xml` et sa mention dans `robots.txt`.
- Domaine personnalisé : à choisir puis à ajouter dans *Pages → projet → Domaines personnalisés* ; reporter la même adresse dans `LANDING_URL` et relancer un déploiement.
- Les deux projets Pages se reconstruisent à chaque push sur `main`. Pour éviter des builds inutiles, des *chemins de build* peuvent être configurés dans Cloudflare (inclure `landing/**` pour la landing ; exclure `landing/**` pour l'application).

## Règles de contenu

1. **Aucune fonctionnalité annoncée sans vérification** dans le code et dans l'interface (voir le tableau ci-dessous). Toute évolution de l'application qui retire ou change une fonction citée doit mettre à jour `landing/index.html`.
2. Pas de statistiques d'usage, de témoignages, d'avis ni de promesse de résultat ; Equitor ne remplace pas un enseignant.
3. Les captures sont **authentiques** (`npm run landing:screens`) : ne jamais les retoucher ni les remplacer par des maquettes présentées comme réelles.
4. Les informations d'éditeur sont celles de l'application (`src/legal/legalContent.ts`) : Swinux, Canton de Vaud, Suisse, contact@swinux.ch ; hébergement Cloudflare.

## Correspondance textes ↔ fonctionnalités vérifiées

| Texte de la landing | Vérifié dans |
|---|---|
| 24 fiches, 18 modules, thèmes listés | `src/data/lessons.ts` (24 titres), `src/data/chapters.ts` (18) |
| Objectifs pédagogiques, consigne de sécurité, résumé ; termes reliés au dictionnaire | `LessonViewModal`, `TermText` ; capture `fiche.webp` |
| Atlas 5 vues / 40 régions, 17 comportements, dictionnaire 108 termes | `interactiveViews.ts`, `atlas.ts`, `behaviors.ts`, `dictionary.ts` (tests de contenus) |
| Manège 20 × 40 m, 9 figures au tracé animé | `arenaFigures.ts`, `ArenaView` ; capture `manege.webp` |
| Programme de séance, 8 modèles, champs cités | `sessionTemplates.ts`, `PlanForm` ; capture `preparation.webp` |
| 3 checklists modifiables | `defaultChecklists.ts`, `ChecklistsView` |
| Bilan relié au journal (objectifs atteints, difficultés, questions pour l'enseignant…) | `PlanDetail` ; parcours e2e n° 8 |
| Journal : champs, recherche et filtres ; fiches chevaux avec photo et historique | `JournalForm`, `JournalView`, `HorseDetail` ; parcours e2e n° 6 et 7 |
| 47 compétences, 13 domaines ; maîtrise par les exercices, jamais par la lecture | `skills.ts`, `mastery.ts` (tests unitaires) |
| Révisions 1-3-7-14-30 jours, 42 cartes mémoire | `spacedRepetition.ts`, `flashcards.ts` |
| Tableau de bord sans valeur artificielle, objectifs hebdomadaires | `stats.ts`, `ProgressionView` (journal vide = zéros, testé) |
| Diagnostic de 26 questions, comparaison avec les débuts | `diagnostic.ts`, `ProgressionView` |
| 10 types de questions corrigées et expliquées | `models.ts`, `QuestionView` ; parcours e2e n° 4 |
| Recherche tolérante, favoris et notes, exports PDF, sauvegarde/restauration, mode sombre, aide contextuelle | `search.ts`, `repos.ts`, `print.ts`, `backup.ts`, `theme.ts`, `screenGuides.ts` |
| Sans compte, données dans le navigateur, pas de synchronisation | IndexedDB uniquement, aucun appel réseau hors ressources statiques |
| Hors ligne après une première visite | service worker Workbox ; parcours e2e n° 11 |
| Mises à jour en arrière-plan sans interrompre une saisie | `src/pwa/updateManager.ts` |
| Installation Android / iPhone-iPad / ordinateur, bouton et guide dans l'app | `InstallGuideModal`, `PWAInstallButton` |
| Niveaux du débutant au confirmé | profil (`débutant / intermédiaire / confirmé`) |

## Points d'attention

- **Mentions légales** : elles n'existent que dans l'application (menu ☰ → Mentions légales), sans lien direct possible ; la landing reprend les informations d'éditeur et y renvoie.
- **Visuels** : faute de photographies sous licence dans le dépôt, la page utilise les captures réelles et une carrière stylisée en SVG. Des photographies authentiques (avec droits d'utilisation) amélioreraient l'ambiance.
