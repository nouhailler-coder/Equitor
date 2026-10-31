# 📝 Changelog

Toutes les évolutions notables d’ÉquiProgression sont consignées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions selon [SemVer](https://semver.org/lang/fr/).

## [2.0.0] — 2026-10-31

Évolution en plateforme pédagogique complète. Audit préalable : `docs/AUDIT_INITIAL.md`.

### ✨ Ajouté
- 🧭 **Parcours personnalisé** : profil pédagogique, diagnostic initial (26 questions, 13 domaines), référentiel de 47 compétences avec prérequis, états de maîtrise calculés à partir des résultats (jamais de la simple lecture), recommandations.
- 🧩 **Moteur d’exercices** : 10 types de questions (QCM, vrai/faux, associations, classement, identification sur image, texte à compléter, question ouverte, notion, situation, carte mémoire), 41 exercices / 144 questions, explications, erreurs fréquentes, ressources, historique et courbe d’évolution.
- 💡 **Révisions espacées** (1-3-7-14-30 jours adaptés aux résultats), tableau de révision, 42 cartes mémoire.
- 📓 **Journal enrichi** (type, discipline, points positifs / à améliorer, compétences, recherche, filtres, favoris), **chevaux** (photo, robe, sexe, historique), **analyse des séances**.
- 🗓️ **Préparation des séances** : 8 modèles, programmes, bilan relié au journal.
- 🗂️ **Ressources** : dictionnaire de 108 termes avec termes cliquables dans les fiches, atlas anatomique (5 vues, 40 régions), atelier du matériel (10 éléments), manège interactif animé (9 figures), comportement du cheval (17 signaux).
- ✅ **Checklists configurables** stockées en IndexedDB.
- 📈 **Tableau de bord** : statistiques réelles, maîtrise par domaine, régularité, objectifs, comparaison avec le diagnostic.
- 🔍 **Recherche globale**, ⭐ favoris et 📝 notes généralisés, 🌙 **mode sombre**, 📄 **exports PDF**.
- Navigation à 6 espaces + Ressources (barre latérale sur ordinateur), routes avec retour Android.
- Tests : 69 tests automatisés (unitaires, intégration IndexedDB, contenus) et 12 parcours de bout en bout Playwright.
- Documentation : architecture, fonctionnalités, schéma de données, hors ligne, sauvegarde, tests, guide utilisateur.

### 🔧 Modifié
- Base IndexedDB **v2** avec migration automatique sans perte depuis la v1 (champs d’origine conservés).
- Sauvegarde **v2** : toutes les données, version de format, empreinte SHA-256, validation par enregistrement, fusion ou remplacement (copie de sécurité préalable) ; les sauvegardes v1 restent importables.
- Écrans chargés à la demande ; demande de stockage persistant ; Échap ne ferme que la fenêtre du dessus ; écran de secours en cas d’erreur.

### 🐞 Corrigé
- Formulaire de séance pré-rempli avec un exemple factice.
- Statut « en cours » et date de reprise de lecture non mis à jour.
- Quiz : filtre pouvant mener à une question inexistante.

### 🔒 Sécurité et conformité
- Documents de travail (`public/assets/aistudio/`) retirés du site publié et du pré-cache.
- Dépendances inutilisées supprimées (`@google/genai`, `express`, `dotenv`, `motion`, `esbuild`, `autoprefixer`) ; plus besoin de `--legacy-peer-deps` ; `package-lock.json` remplace `bun.lock`.
- Reliquats AI Studio retirés (`metadata.json`, `.env.example`).

## [1.2.0] — 2026-10-30

### ✨ Ajouté
- 👋 **Onboarding de premier lancement** en 4 étapes : bienvenue, fonctionnement des 5 espaces, installation, puis avertissement légal à valider (« J’ai compris »).
- ⚖️ **Mentions légales** : avertissement, limitation de responsabilité, utilisation, exactitude des informations, disponibilité, données et résultats, sources externes, évolution, éditeur (Swinux) et hébergeur (Cloudflare). Accessibles en permanence depuis le menu ☰ et les Paramètres système.
- 💬 **Aide contextuelle** pour chaque écran, affichée à la première visite puis via le bouton **?** de l’en-tête ou le menu (« Aide sur cet écran »).
- ℹ️ **Infobulles** sur les sections clés des 5 écrans.
- 📲 **Bouton « Installer l’App »** toujours visible tant que l’application n’est pas installée, avec guide pas à pas Android / iPhone-iPad / ordinateur.
- 🎨 **Nouveau logo** (tête de cheval dans un fer à cheval) et icônes PWA régénérées (`npm run icons`).
- 🧪 Script `npm run check:legal` (inclus dans `npm test`) vérifiant les invariants : section localisation présente si et seulement si l’app lit la position, aucune section légale vide, un guide par écran.
- Menu ☰ : entrées « Aide sur cet écran », « Revoir l’introduction », « Installer l’application », « Mentions légales ».

### 🔧 Modifié
- La détection d’installation (`beforeinstallprompt`) est désormais partagée par toute l’application.
- « Mentions légales & éthique » devient « Principes & déontologie » ; sa version affichée suit celle de l’application.
- En-tête mobile allégé (sous-titre et pastille « en ligne » masqués sous 640 px).
- README réécrit avec captures d’écran ; ajout de `CONTEXT.md` et de ce changelog.

## [1.1.0] — 2026-10-30

### ✨ Ajouté
- ☰ **Menu hamburger** regroupant les fonctionnalités par catégorie.
- ⚙️ **Paramètres système** : version, date de sortie, date de dernière vérification, « Vérifier les mises à jour », « Forcer la mise à jour », option de mise à jour automatique.
- 🔄 **Mises à jour automatiques en arrière-plan** : vérification horaire, au retour en ligne et au premier plan ; installation au lancement ou lorsque l’application passe en arrière-plan.
- `version.json` publié à chaque build pour détecter les nouvelles versions.

### 🔧 Modifié
- Service Worker en mode `prompt` (au lieu de `autoUpdate`) pour ne jamais recharger la page pendant une saisie.

## [1.0.0] — 2026-10-24

### ✨ Ajouté
- 🎉 Première version d’ÉquiProgression : accueil, bibliothèque de 18 modules, fiches illustrées et glossaire, checklists et journal de séances, gestion des chevaux, quiz et flashcards, suivi de progression, sauvegarde / restauration JSON, fonctionnement 100 % local et hors ligne.
