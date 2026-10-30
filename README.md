<div align="center">

<img src="public/logo.svg" alt="Logo ÉquiProgression" width="128" height="128" />

# ÉquiProgression

**Le carnet d’apprentissage équestre qui tient dans la poche — 100 % local, 100 % hors ligne.**

![Version](https://img.shields.io/badge/version-1.2.0-f59e0b?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-installable-1e3a2f?style=flat-square&logo=pwa&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![Hors ligne](https://img.shields.io/badge/hors_ligne-✓-16a34a?style=flat-square)
![Zéro cloud](https://img.shields.io/badge/zéro_cloud-✓-16a34a?style=flat-square)

[Fonctionnalités](#-fonctionnalités) · [Captures](#-captures-décran) · [Installation](#-installer-lapplication) · [Développement](#%EF%B8%8F-développement) · [Changelog](CHANGELOG.md)

</div>

---

## 🐎 Présentation

**ÉquiProgression** est une Progressive Web App mobile, entièrement en français, pour **apprendre**, **réviser** et **suivre sa pratique** de l’équitation, à l’écurie comme à la maison. Elle s’appuie sur les principes de l’équitation classique, de la biomécanique équine et de l’échelle de progression du dressage.

> [!NOTE]
> Aucune inscription, aucun serveur : vos chevaux, séances et progrès restent **sur votre appareil**.

## 📸 Captures d’écran

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/04-accueil.jpg" width="220" alt="Écran d’accueil" /><br /><sub><b>🏠 Accueil</b></sub></td>
    <td align="center"><img src="docs/screenshots/01-onboarding.jpg" width="220" alt="Onboarding de bienvenue" /><br /><sub><b>👋 Onboarding</b></sub></td>
    <td align="center"><img src="docs/screenshots/02-avertissement.jpg" width="220" alt="Avertissement légal au premier lancement" /><br /><sub><b>⚠️ Information importante</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/03-guide-ecran.jpg" width="220" alt="Guide contextuel d’un écran" /><br /><sub><b>💬 Aide contextuelle</b></sub></td>
    <td align="center"><img src="docs/screenshots/05-infobulle.jpg" width="220" alt="Infobulle explicative" /><br /><sub><b>ℹ️ Infobulles</b></sub></td>
    <td align="center"><img src="docs/screenshots/06-installation.jpg" width="220" alt="Guide d’installation" /><br /><sub><b>📲 Installer l’application</b></sub></td>
  </tr>
</table>

## ✨ Fonctionnalités

| | Espace | Ce que vous pouvez faire |
|---|---|---|
| 🏠 | **Accueil** | Reprendre la dernière fiche, suivre les parcours A / B / C, voir vos statistiques et favoris. |
| 📚 | **Apprendre** | 18 modules, fiches originales filtrables par niveau et thème, schémas SVG, glossaire. |
| 📋 | **Pratiquer** | Checklists d’écurie, journal de séances détaillé, fiches de vos chevaux. |
| 💡 | **Réviser** | Quiz multi-formats commentés et flashcards, ciblés par chapitre ou par fiche. |
| 👤 | **Mon suivi** | Progression, favoris, sauvegarde / restauration JSON, effacement sécurisé. |

### 🧭 Prise en main pour les novices
- 👋 **Onboarding de premier lancement** : présentation de l’application en 3 étapes, puis avertissement légal à valider.
- 💬 **Aide contextuelle par écran** : affichée automatiquement à la première visite de chaque onglet, puis à tout moment via le bouton **?** de l’en-tête.
- ℹ️ **Infobulles** sur les sections clés de chaque écran (toucher sur mobile, survol sur ordinateur).
- 📲 **Bouton « Installer l’App »** toujours visible : installation en un clic quand le navigateur le permet, sinon guide pas à pas pour Android, iPhone / iPad et ordinateur.

### ☰ Menu & système
- **Menu hamburger** regroupant toutes les fonctionnalités par catégorie (Général, Apprendre, Pratiquer, Réviser, Suivi & données, Aide & informations, Système).
- **Paramètres système** : version, date de sortie, dernière vérification, boutons « Vérifier les mises à jour » et « Forcer la mise à jour ».
- 🔄 **Mises à jour automatiques** en arrière-plan, appliquées sans jamais interrompre une saisie.

### ⚖️ Mentions légales
- Avertissement et **limitation de responsabilité** acceptés au premier lancement (mémorisés localement).
- Écran **Mentions légales** accessible en permanence : menu ☰ → *Aide & informations*, ou *Paramètres système*.

## 🔒 Principes non négociables

1. **100 % local & zéro cloud** : ni base distante, ni compte, ni backend, ni API d’IA, ni traceur.
2. **Stockage sur l’appareil** : IndexedDB (Dexie.js) pour les données, `localStorage` pour les préférences.
3. **Hors ligne intégral** : Service Worker + Cache Storage via `vite-plugin-pwa`.
4. **Propriété intellectuelle** : fiches, schémas et quiz sont des créations originales.
5. **Sécurité & bien-être animal** : les fiches avancées rappellent l’obligation d’un encadrement qualifié.

## 📲 Installer l’application

Ouvrez l’application dans votre navigateur puis touchez **⬇ Installer l’App** en haut de l’écran.

| Appareil | Navigateur | Marche à suivre |
|---|---|---|
| 🤖 Android | Chrome | Menu **⋮** → *Installer l’application* |
| 🍎 iPhone / iPad | Safari | **Partager** → *Sur l’écran d’accueil* |
| 💻 Ordinateur | Chrome / Edge | Icône d’installation dans la barre d’adresse |

## 🛠️ Développement

```bash
npm install --legacy-peer-deps   # installer les dépendances
npm run dev                      # serveur de développement (port 3000)
npm run build                    # build de production PWA (dist/)
npm run preview                  # prévisualiser le build
npm test                         # tests métier + vérification des invariants légaux
npm run lint                     # vérification TypeScript
npm run icons                    # régénérer les icônes PWA depuis public/logo.svg
```

> [!TIP]
> Pour rejouer le premier lancement en développement : **Paramètres système → 🛠️ [DEV] Réinitialiser les mentions légales et l’onboarding** (bouton absent en production).

### 🗂️ Structure

```
src/
├── components/    # en-tête, navigation, menu ☰, infobulles, guide d’installation
├── features/      # écrans : home, library, practice, quiz, profile, settings
├── legal/         # contenu légal centralisé, stockage de l’acceptation, rendu
├── onboarding/    # onboarding de 1er lancement et guides contextuels par écran
├── pwa/           # gestionnaire de mises à jour
├── db/            # IndexedDB (Dexie)
└── data/          # contenus pédagogiques
scripts/           # génération d’icônes, vérification des invariants légaux
```

## 📂 Documentation

| Document | Contenu |
|---|---|
| 📘 [`CONTEXT.md`](CONTEXT.md) | Contexte du projet, conventions et mécanismes clés |
| 📝 [`CHANGELOG.md`](CHANGELOG.md) | Historique des versions |
| 🏗️ [`docs/architecture.md`](docs/architecture.md) | Stockage local, Service Worker, mises à jour, onboarding |
| 📖 [`docs/referentiel-pedagogique.md`](docs/referentiel-pedagogique.md) | Les 18 modules d’apprentissage |
| ©️ [`docs/droits-auteur.md`](docs/droits-auteur.md) | Conformité au droit d’auteur |
| ⚠️ [`docs/securite-pedagogique.md`](docs/securite-pedagogique.md) | Classification des risques et encadrement |
| 💾 [`docs/sauvegarde-locale.md`](docs/sauvegarde-locale.md) | Export, import et pérennité des données |

---

<div align="center">
<sub>Édité par <b>Swinux</b> · Canton de Vaud, Suisse · <a href="mailto:contact@swinux.ch">contact@swinux.ch</a></sub><br />
<sub>Application fournie à titre informatif : elle ne remplace pas l’enseignement d’un professionnel diplômé.</sub>
</div>
