# 📘 CONTEXT — ÉquiProgression

Document de contexte pour toute personne (ou agent) qui reprend le projet : ce qu’est l’application, ses règles, et où se trouvent les mécanismes transverses.

## 🎯 Le projet

PWA mobile en français d’apprentissage et de suivi de la pratique équestre. **Aucun backend** : tout s’exécute dans le navigateur, les données restent sur l’appareil. Éditeur : **Swinux** (Canton de Vaud, Suisse — contact@swinux.ch). Hébergement : **Cloudflare Pages**.

- **Stack** : React 19, TypeScript, Vite 8, Tailwind CSS 4, Dexie (IndexedDB), `vite-plugin-pwa` (Workbox), icônes `lucide-react`.
- **Version courante** : voir `package.json` (injectée au build dans `__APP_VERSION__`).

## 📏 Règles du projet

1. **Zéro cloud** : pas d’appel réseau autre que les ressources statiques de l’app (`version.json`, polices Google).
2. **Données personnelles** → IndexedDB (`src/db`). **Préférences d’appareil** → `localStorage`.
3. **Tout écran visible doit être expliqué** : un guide dans `src/onboarding/screenGuides.ts` (vérifié par `npm run check:legal`) et des infobulles `InfoTip` sur ses sections clés.
4. **Le texte légal n’existe qu’à un seul endroit** : `src/legal/legalContent.ts`, rendu par `LegalSections`.
5. **Mobile d’abord** : aucun défilement horizontal à 375 px, cibles tactiles confortables.
6. Les modales ouvertes depuis l’en-tête (sticky) passent par un **portail** vers `<body>`, sinon elles restent sous la barre de navigation.

## 🧩 Mécanismes clés

### 👋 Onboarding & mentions légales
| Élément | Fichier |
|---|---|
| Contenu légal (sections, éditeur, hébergeur, version) | `src/legal/legalContent.ts` |
| Acceptation (lecture / écriture / reset) | `src/legal/legalStorage.ts` |
| Rendu unique des sections | `src/legal/LegalSections.tsx` |
| Écran permanent « Mentions légales » | `src/legal/LegalNoticeModal.tsx` |
| Onboarding 4 étapes (dont l’avertissement) | `src/onboarding/OnboardingModal.tsx` |

- **Clés de stockage** : `legal_notice_acknowledged` = `"true"` et `legal_notice_acknowledged_version` = `"1.0"`.
- **Affichage** : au démarrage si `isLegalNoticeAcknowledged()` est faux (mode non strict : une acceptation d’une version antérieure suffit).
- **Modifier le texte** : éditer `legalContent.ts` et mettre à jour `legalPublisher.lastUpdated`.
- **Exiger une nouvelle acceptation** après un changement important : incrémenter `legalNotice.version` puis appeler `isLegalNoticeAcknowledged({ strict: true })` dans `App.tsx`.
- « Voir les détails » ouvre les mentions comme **seconde page de l’onboarding** ; le bouton retour Android les referme (entrée d’historique dédiée).
- **Pas de section GPS** (l’app ne lit pas la position) et **pas de politique de confidentialité** pour l’instant (emplacement `privacyPolicy` réservé).

### 💬 Aide contextuelle
- Guides par onglet : `src/onboarding/screenGuides.ts`, affichés par `ScreenGuideSheet.tsx`.
- Vus une fois par onglet (`localStorage` : `equi.guide.seen`), puis rouvrables via le bouton **?** de l’en-tête.
- Infobulles : `src/components/common/InfoTip.tsx` (position `fixed`, bornée à l’écran).

### 📲 Installation
- `src/hooks/usePWAInstall.ts` capture `beforeinstallprompt` au chargement (store partagé).
- `PWAInstallButton` : installation native si disponible, sinon `InstallGuideModal` (instructions par plateforme).

### 🔄 Mises à jour
- `src/pwa/updateManager.ts` + hook `useAppUpdate`. Détails dans `docs/architecture.md` §4.
- Préférences : `equi.update.lastCheck`, `equi.update.auto`.

## 🧪 Tester le premier lancement

- **En développement** : Paramètres système → *🛠️ [DEV] Réinitialiser les mentions légales et l’onboarding*.
- **Partout** : effacer les données du site (ou `localStorage.clear()` dans la console), puis recharger.

## ✅ Avant de livrer

```bash
npm test        # tests métier + check:legal
npm run lint    # TypeScript
npm run build   # build PWA
```

Puis mettre à jour `CHANGELOG.md` et la version dans `package.json`.
