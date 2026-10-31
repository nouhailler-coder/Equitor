# 📶 Stratégie hors ligne

## Ce qui fonctionne sans réseau (vérifié par le test de bout en bout n° 11)

Fiches, dictionnaire et ressources · exercices et enregistrement des résultats · révisions · journal, chevaux, programmes, checklists · statistiques · sauvegarde, restauration et export PDF.

## Service Worker (vite-plugin-pwa / Workbox)

| Élément | Stratégie |
|---|---|
| Code JS/CSS, HTML, icônes, logo, manifeste | **Pré-cache** à l'installation (≈ 45 fichiers, ≈ 1,1 Mo) |
| Contenus pédagogiques | Compilés dans le code : pré-mis en cache avec lui |
| Polices Google | `CacheFirst`, 1 an |
| `version.json` | **Jamais mis en cache** : sert à détecter une nouvelle version |
| Données personnelles | **Jamais dans le Cache Storage** : uniquement IndexedDB |

Les écrans sont découpés en fichiers chargés à la demande ; ils sont tous pré-mis en cache, donc disponibles hors ligne même s'ils n'ont jamais été ouverts.

## Mises à jour

- Mode `prompt` : la nouvelle version est téléchargée en arrière-plan puis **appliquée au lancement ou quand l'application passe en arrière-plan** — jamais pendant une saisie.
- Vérification horaire, au retour en ligne et au retour au premier plan (≥ 15 min).
- Pastille sur le menu ☰ et bouton « Installer maintenant » dans Paramètres système quand une version est prête.
- **Une mise à jour ne touche jamais IndexedDB** : seul le cache du code est remplacé. Les changements de schéma passent par les migrations Dexie (voir `SCHEMA_DONNEES.md`).
- « Forcer la mise à jour » vide le Cache Storage et désinscrit le Service Worker, sans toucher aux données.

## Persistance

`navigator.storage.persist()` est demandé automatiquement quand l'application est installée, et proposé dans « Mes données ». L'espace utilisé y est affiché.

## Installation

Manifeste avec icônes 192/512 et maskable ; bouton « Installer l'App » (invite native si disponible, sinon guide Android / iPhone / ordinateur).
