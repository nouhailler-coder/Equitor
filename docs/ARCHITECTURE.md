# 🏗️ Architecture — ÉquiProgression 2.0

## Principes

- **100 % client** : React s'exécute dans le navigateur ; Cloudflare Pages ne sert que des fichiers statiques.
- **Aucune donnée personnelle ne quitte l'appareil** : IndexedDB pour les données, `localStorage` pour quelques préférences d'affichage.
- **Hors ligne d'abord** : tout le code et tous les contenus pédagogiques sont pré-mis en cache par le Service Worker.
- **Contenus = données** : ajouter un exercice, un terme ou une figure ne demande aucune modification du code des écrans.

## Pile technique (inchangée)

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Dexie 4 (IndexedDB) · vite-plugin-pwa (Workbox) · lucide-react.
Aucune dépendance ajoutée à l'exécution. En développement : `fake-indexeddb` (tests d'intégration) et `playwright-core` (tests de bout en bout).

## Arborescence

```
src/
├── app/            router.ts (routes par fragment #/…), overlays.ts (fenêtres globales), theme.ts
├── components/
│   ├── layout/     en-tête, navigation 6 espaces (barre du bas / barre latérale), menu ☰
│   ├── common/     recherche globale, infobulles, guide d’installation, schémas SVG historiques
│   └── ui/         kit (cartes, boutons, modale, toasts, favoris, notes), graphiques SVG,
│                   InteractiveSvg (vues cliquables), BehaviorHead, TermText (termes cliquables), ErrorBoundary
├── data/           contenus originaux : skills, exercises, flashcards, dictionary, atlas, equipment,
│                   behaviors, arenaFigures, interactiveViews, sessionTemplates, diagnostic,
│                   defaultChecklists, lessons, chapters, quizzes, pathways, labels, catalog (index dérivés)
├── features/       écrans par domaine : home, library, exercises, revision, progression, journal,
│                   preparation, checklists, resources, settings, profile (modales d’aide)
├── services/
│   ├── storage/    db.ts (schéma + migrations Dexie), migrations.ts (conversions pures v1→v2), repos.ts
│   ├── backup/     export / validation / fusion / restauration JSON
│   ├── progression/ mastery.ts (maîtrise), recommend.ts (parcours), progressService.ts (écritures)
│   ├── revision/   spacedRepetition.ts
│   ├── exercises/  scoring.ts
│   ├── statistics/ stats.ts
│   ├── search/     search.ts
│   ├── export/     print.ts (export PDF par impression)
│   └── feedback/   toast.ts (retours visuels, gestion des erreurs d’écriture)
├── legal/ onboarding/ pwa/ hooks/ types/ (models.ts = modèles v2)
└── tests/          unitaires, intégration (IndexedDB simulée), contenus
scripts/            e2e.mjs (Playwright), check-legal.ts, generate-icons.mjs
```

## Flux de données

```
Écran ──(lecture réactive useLive / liveQuery)──► IndexedDB
  │
  └─(action)─► services (repos / progressService) ─(transaction)─► IndexedDB ─► tous les écrans abonnés se mettent à jour
```

- **Lecture** : `useLive(requête)` s'abonne via `liveQuery` de Dexie ; toute écriture rafraîchit automatiquement les écrans concernés.
- **Écriture** : uniquement via `services/` ; les écritures multi-tables sont transactionnelles (ex. un résultat d'exercice met à jour la tentative, les compétences et les révisions dans une seule transaction). `safeWrite` affiche un message en cas d'échec (y compris quota dépassé) au lieu d'échouer silencieusement.
- **Logique métier pure** (maîtrise, révisions, correction, statistiques, recherche, migrations, validation de sauvegarde) : fonctions sans effet de bord, testées unitairement.

## Navigation

- Routes par fragment (`#/journal/seance/…`) : compatibles hébergement statique et hors ligne ; le bouton retour (navigateur, Android) revient à l'écran précédent.
- Six espaces : Accueil, Apprendre, Pratiquer, Réviser, Ma progression, Mon journal, plus Ressources (barre latérale sur ordinateur, depuis Apprendre et le menu sur mobile).
- Écrans chargés à la demande (`React.lazy`) : un fichier JavaScript par groupe d'écrans.
- Fenêtres globales (fiche, chapitre, recherche, mentions…) gérées par `app/overlays.ts` ; la touche Échap ferme uniquement la fenêtre du dessus (`useEscape`).

## Sécurité

- Aucun `dangerouslySetInnerHTML` ; les exports PDF échappent tout texte (`esc`) avant de construire le document imprimé.
- Les sauvegardes importées sont validées enregistrement par enregistrement (champs obligatoires et types), avec contrôle de version et d'empreinte SHA-256.
- Aucun secret, aucune clé d'API, aucune requête réseau hormis les ressources statiques de l'application (`version.json`, polices).

## Hébergement Cloudflare Pages

| Réglage | Valeur |
|---|---|
| Commande de build | `npm ci && npm run build` |
| Dossier de sortie | `dist` |
| Version de Node | 20 ou plus (`NODE_VERSION=22` conseillé) |
| Variables d'environnement | aucune |

Les routes étant des fragments d'URL, aucune règle de réécriture n'est nécessaire.
