# 🔍 Audit initial — ÉquiProgression v1.2.0

> Audit réalisé le 30 octobre 2026 sur le dépôt `nouhailler-coder/Equitor` (commit `217cc13`), déployé sur https://equitor.pages.dev/.
> Méthode : lecture du code source, exécution des tests et du build, parcours manuel de l'application dans un navigateur (mobile 375 px et bureau). Une fonctionnalité n'est notée « opérationnelle » que si son action produit un résultat persisté et vérifiable.

## 1. Architecture existante

| Couche | Choix actuel | Commentaire |
|---|---|---|
| Interface | React 19 + TypeScript, Tailwind CSS 4 | Pas de routeur : un état `currentTab` dans `App.tsx` choisit l'écran. |
| Build | Vite 8 (Rolldown) | Un seul bundle JS de ~590 ko (≈170 ko gzip), sans découpage. |
| Données personnelles | IndexedDB via Dexie 4 (`EquiProgressionDB`, **schéma v1**) | 5 tables : `horses`, `ridingSessions`, `userProgress`, `quizAttempts`, `favorites`. |
| Préférences | `localStorage` | Checklists cochées, acceptation légale, guides vus, mises à jour. |
| Contenus | Fichiers TypeScript statiques dans `src/data/` | 18 chapitres, 24 fiches, 12 questions, 16 termes, 18 items de checklist, 3 parcours. |
| PWA | `vite-plugin-pwa` (Workbox `generateSW`, mode `prompt`) | Pré-cache de tout le build ; `version.json` hors cache pour détecter les versions. |
| Hébergement | Cloudflare Pages (fichiers statiques) | Aucune fonction serveur. |
| Tests | `node:test` via `tsx` | 5 tests de validation des contenus + script `check:legal`. Aucun test des composants, du stockage ni de bout en bout. |

Arborescence : `src/components` (layout, communs), `src/features/{home,library,practice,quiz,profile,settings}`, `src/data`, `src/db`, `src/legal`, `src/onboarding`, `src/pwa`, `src/hooks`, `src/types`.

## 2. Fonctionnalités réellement opérationnelles

| Fonctionnalité | Vérification |
|---|---|
| Consultation des 18 chapitres et 24 fiches (sections, objectifs, erreurs, schémas SVG) | ✅ affichage complet, hors ligne |
| Favoris de fiches | ✅ écrits dans `favorites`, relus à l'accueil et dans le suivi |
| Statut de fiche (non commencé / en cours / terminé) et note personnelle | ✅ écrits dans `userProgress` |
| Quiz à choix unique / multiple / vrai-faux / situation | ✅ correction, explication, tentative écrite dans `quizAttempts` |
| Journal des séances (création, modification, suppression avec confirmation, filtre par cheval) | ✅ table `ridingSessions` |
| Gestion des chevaux (création, modification, suppression) | ✅ table `horses` |
| Checklists cochables | ✅ état en `localStorage` |
| Statistiques de l'accueil et de « Mon suivi » | ✅ calculées depuis IndexedDB (aucun chiffre inventé) |
| Export JSON, import avec aperçu, fusion ou remplacement, effacement | ✅ |
| Recherche (fiches, chapitres, glossaire) insensible aux accents | ✅ contenus statiques uniquement |
| Hors ligne, installation, mises à jour automatiques, onboarding, mentions légales, aide contextuelle | ✅ (v1.1–1.2) |

## 3. Fonctionnalités partiellement implémentées

- **Progression** : le statut « terminé » est déclaré à la main ; la simple ouverture d'une fiche la passe « en cours ». Aucun lien avec les résultats des quiz : la maîtrise n'est pas mesurée.
- **Flashcards** : retournement des 16 termes du glossaire, mais aucun enregistrement du niveau de maîtrise ni de planification.
- **Quiz** : pas d'historique consultable par série, pas de score enregistré par session, pas de durée. Changer de filtre ne réinitialise pas la question courante (risque d'écran vide).
- **Journal** : pas de type de séance ni de discipline, pas de recherche ni de filtre par date, pas de favoris.
- **Chevaux** : pas de robe, sexe, photo ni historique par cheval.
- **Checklists** : liste figée (non modifiable), état hors de la sauvegarde JSON.
- **Recherche** : ne couvre ni le journal, ni les chevaux, ni les exercices ; pas d'historique.
- **Reprise de lecture** : `lastViewedAt` n'est mis à jour qu'à la première ouverture d'une fiche, « Reprendre » peut donc pointer sur une fiche ancienne.
- **Parcours A/B/C** : listes statiques de fiches, sans personnalisation.

## 4. Fonctionnalités simulées

- **Formulaire « Nouvelle séance »** : les champs *Thème*, *Objectifs* et *Exercices* sont **pré-remplis avec un exemple** (« Échauffement progressif au pas 10 min… »). Un utilisateur pressé enregistre ces valeurs comme si elles étaient les siennes.
- **Indicateur « Enregistrement… » des notes** : délai artificiel de 600 ms (`setTimeout`) ; l'écriture est réelle mais le retour visuel ne reflète pas sa durée.
- `metadata.json` déclare une capacité « SERVER_SIDE_GEMINI_API » et `.env.example` une clé `GEMINI_API_KEY` : **aucune** n'est utilisée (reliquat du modèle Google AI Studio).

## 5. Données statiques présentes

- Contenus pédagogiques (`src/data/*.ts`) : légitimes, originaux, mais **volume insuffisant** pour les modules demandés (12 questions, 16 termes).
- ⚠️ **`public/assets/aistudio/`** : deux documents de travail (référentiel pédagogique dérivé de la table des matières d'un manuel sous droit d'auteur, et le cahier des charges interne) sont **publiés sur le site et pré-mis en cache** (motif `**/*.md`). Ils n'ont pas vocation à être distribués.

## 6. Problèmes ergonomiques

- 5 onglets alors que le projet en prévoit 6 + Ressources ; pas de navigation adaptée à l'ordinateur (barre du bas étirée).
- Pas de mode sombre.
- Écrans longs et denses (accueil, pratique) ; peu de retours visuels (« toast ») après enregistrement.
- Modales imbriquées sans gestion du bouton retour Android (hors onboarding).
- Quiz filtré par fiche : impossible de retirer le filtre sans changer d'onglet.

## 7. Problèmes techniques

- **Dépendances inutilisées** : `@google/genai`, `express`, `dotenv`, `motion`, `@types/express` (poids d'installation, surface d'attaque).
- `npm install` échoue sans `--legacy-peer-deps` (conflit de dépendances pairs).
- Bundle unique non découpé ; toutes les données pédagogiques chargées au démarrage.
- Identifiants générés avec `Math.random()` (préférer `crypto.randomUUID()`).
- Validation de l'import limitée à la présence de deux tableaux : aucun contrôle du type des enregistrements.
- Types `any` dans `BackupModal`.
- Aucune stratégie de migration IndexedDB (schéma v1 unique).
- Le nom du paquet est encore `react-example`.

## 8. Risques de perte de données

| Risque | Gravité | Mesure prévue |
|---|---|---|
| Stockage non persistant : le navigateur peut purger IndexedDB sous pression d'espace (surtout iOS) | 🔴 élevée | Demander `navigator.storage.persist()` et rappeler la sauvegarde |
| Import « remplacer » : une case à cocher suffit à tout effacer | 🟠 moyenne | Confirmation explicite + sauvegarde automatique avant remplacement |
| Données d'enregistrements importés non validées (champs manquants → écrans cassés) | 🟠 moyenne | Validation par type et normalisation |
| État des checklists absent de la sauvegarde | 🟡 faible | Passage en IndexedDB, inclus dans l'export |
| Évolution du schéma sans migration | 🟠 moyenne | Versionnement Dexie + fonctions `upgrade()` testées |

## 9. Fonctionnalités manquantes (par rapport au cahier des charges)

Profil pédagogique · diagnostic initial · référentiel de compétences et calcul de maîtrise · moteur d'exercices (associations, classement, identification sur image, texte à compléter, question ouverte, flashcards notées) · historique des résultats · répétition espacée · dictionnaire complet (catégories, favoris, historique, renvois, termes cliquables dans les fiches) · préparation de séance (programmes, modèles, bilan) · atlas anatomique · atelier du matériel · manège interactif · comportement du cheval · checklists configurables · tableau de bord statistique avec graphiques · recherche globale (journal, chevaux, exercices, programmes, historique) · favoris et notes généralisés · export PDF · mode sombre · navigation 6 espaces + Ressources · tests d'intégration et de bout en bout.

## 10. Plan d'intervention recommandé

| Phase | Contenu | Priorité |
|---|---|---|
| 1 — Sécurisation | Retirer les documents de travail du site, nettoyer les dépendances et reliquats AI Studio, supprimer le pré-remplissage factice, persistance du stockage, corrections quiz / reprise | 🔴 |
| 2 — Socle | Modèles TypeScript, schéma Dexie v2 avec migrations conservatrices, couche d'accès centralisée, sauvegarde v2 validée (compatible v1) | 🔴 |
| 3 — Parcours | Profil, diagnostic, référentiel de compétences, calcul de maîtrise, tableau de bord | 🟠 |
| 4 — Exercices & révisions | Moteur générique (10 types), historique, répétition espacée, flashcards notées | 🟠 |
| 5 — Carnet | Journal enrichi, chevaux enrichis + historique, programmes et bilans, checklists configurables | 🟠 |
| 6 — Ressources | Dictionnaire, atlas, matériel, manège, comportement | 🟡 |
| 7 — Finalisation | Statistiques, recherche globale, export PDF, mode sombre, navigation, accessibilité, performance, documentation | 🟡 |

Règle transversale : **aucune donnée existante n'est supprimée** ; chaque migration recopie les champs anciens vers les nouveaux et conserve les originaux tant que la nouvelle version n'est pas éprouvée.
