# 💾 Sauvegarde et restauration

Écran : **Ma progression → Mes données** (ou menu ☰ → Sauvegarde & export). Code : `src/services/backup/backup.ts`.

## Pourquoi c'est indispensable

Toutes les données restent sur l'appareil. Un nettoyage du navigateur, un changement de téléphone ou une purge automatique (manque d'espace) peut les effacer. L'application :
- demande un **stockage persistant** (automatique quand elle est installée, bouton sinon) ;
- affiche la date de la **dernière sauvegarde** ;
- télécharge automatiquement une **copie de sécurité** avant toute restauration en mode « remplacer ».

## Format du fichier (v2)

```json
{
  "format": "equiprogression-backup",
  "formatVersion": 2,
  "appVersion": "2.0.0",
  "exportedAt": "2026-10-31T10:00:00.000Z",
  "counts": { "horses": 2, "ridingSessions": 14, "...": 0 },
  "checksum": "<SHA-256 hexadécimal de data>",
  "data": { "profile": [], "skillProgress": [], "exerciseAttempts": [], "revisionItems": [], "ridingSessions": [], "horses": [], "favorites": [], "notes": [], "sessionPlans": [], "checklists": [], "settings": [], "...": [] }
}
```

Le bloc `data` contient toutes les tables personnelles (voir `docs/SCHEMA_DONNEES.md`) : profil, progression, compétences, diagnostics, résultats, révisions, journal, chevaux (photo comprise), favoris, notes, programmes, checklists, paramètres, historique.

## Vérifications à l'import

1. **Structure** : JSON valide, objet reconnu (format v2, ou sauvegarde v1 détectée par ses tableaux `horses`/`sessions`).
2. **Version** : un fichier créé par une version plus récente de l'application est refusé avec un message explicite.
3. **Intégrité** : l'empreinte SHA-256 est recalculée ; une différence est signalée (« le fichier a été modifié »).
4. **Données obligatoires** : chaque enregistrement est contrôlé (champs et types requis par table) ; les enregistrements incomplets sont ignorés et comptés.
5. **Compatibilité** : une sauvegarde v1 est convertie avec les mêmes fonctions que la migration de la base.

Un **récapitulatif** (nombre d'éléments par type, version, date, intégrité, avertissements) est présenté avant toute écriture.

## Fusion ou remplacement

| Mode | Effet |
|---|---|
| **Fusionner** (par défaut) | Les éléments de la sauvegarde sont ajoutés ; en cas de doublon (même identifiant), la version la plus récente (`updatedAt`…) est gardée. Rien n'est supprimé. |
| **Remplacer** | Copie de sécurité téléchargée, puis toutes les tables sont vidées et remplies avec la sauvegarde, dans une transaction unique. |

Les deux modes demandent une confirmation explicite.

## Exports PDF

Bilan de progression, historique des séances, fiche de révision (Mes données) ; fiche pédagogique (depuis la fiche) ; programme de préparation (depuis le programme) ; séance (depuis la séance). L'export ouvre la boîte d'impression du système : choisir « Enregistrer au format PDF ». Fonctionne hors ligne.

## Effacement

« Effacer mes données » supprime toutes les tables personnelles (les checklists par défaut sont réinstallées). Action irréversible, confirmée.
