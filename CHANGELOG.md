# 📝 Changelog

Toutes les évolutions notables d’ÉquiProgression sont consignées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions selon [SemVer](https://semver.org/lang/fr/).

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
