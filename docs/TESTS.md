# 🧪 Tests

| Commande | Contenu | Résultat (31/10/2026) |
|---|---|---|
| `npm test` | Tests unitaires, d'intégration et de contenus (`node:test` via `tsx`) + `check:legal` | 69 tests ✔, invariants légaux ✔ |
| `npm run lint` | Vérification TypeScript (`tsc --noEmit`) | ✔ |
| `npm run build` | Build de production PWA | ✔ |
| `npm run test:e2e` | Build + 12 parcours Playwright en format mobile (375 × 812) | 12/12 ✔, 0 erreur console |

## Tests unitaires — `src/tests/services.test.ts`, `features.test.ts`, `terms.test.ts`

- **Répétition espacée** : suite 1-3-7-14-30, facilité au-delà, oubli, « difficile », « facile », crédit de retard, classement (retard / jour / fragile / maîtrisée).
- **Progression** : la lecture seule ne donne pas la maîtrise, pondération des évaluations récentes, règle des 3 évaluations sur 2 jours, échec récent, maîtrise ancienne.
- **Correction** : QCM simple et multiple (crédit partiel, pénalité), vrai/faux, image, carte, association, classement, texte à trous (accents/casse), question ouverte ; mélange déterministe (non-régression sur graine négative).
- **Migrations v1 → v2** : cheval, séance, progression + note, idempotence, type de séance deviné.
- **Statistiques** : semaines, répartitions, fréquence, journal vide = zéros, taux de réussite, régularité.
- **Recherche** : accents, classement titre/corps, fautes de frappe, catégories, suggestions.
- **Parcours** : prérequis, priorités (lacunes, intérêts), exclusion des compétences maîtrisées.
- **Termes cliquables** : détection avec accents et pluriels, respect des limites de mots, expression la plus longue.

## Tests d'intégration (IndexedDB simulée par `fake-indexeddb`)

- `storage.integration.test.ts` : **migration réelle d'une base v1** vers v2 (aucune perte), base neuve, export → validation (intégrité) → remplacement, fusion, import v1, fichiers invalides / trop récents / altérés, enregistrements incomplets.
- `progress.integration.test.ts` : profil + diagnostic, consultation sans maîtrise, exercice (tentative, compétences, révisions planifiées), révision de carte, journal (création, modification, favori, suppression), suppression de cheval, programme → séance, historique borné.

## Tests de contenus — `content.test.ts`, `domain.test.ts`

Identifiants uniques, réponses valides, explications présentes, chaque compétence a un exercice, et **aucun lien interne cassé** entre compétences, exercices, fiches, dictionnaire, atlas, matériel, manège, comportement, modèles et diagnostic.

## Tests de bout en bout — `scripts/e2e.mjs`

1. Ouverture, avertissement légal mémorisé, Service Worker enregistré
2. Profil et diagnostic complet (26 questions)
3. Fiche et définition contextuelle (Échap ne ferme que la définition)
4. Quiz couvrant les 10 types de questions
5. Progression mise à jour
6. Ajout d'un cheval
7. Séance au journal + recherche
8. Programme, bilan, création de l'entrée de journal
9. Révision espacée enregistrée
10. Export JSON, effacement, import (intégrité vérifiée, fusion), données retrouvées
11. Hors ligne : journal, dictionnaire, exercice
12. Mode sombre et absence de débordement horizontal sur 7 écrans

Navigateur : celui de Playwright s'il est installé, sinon `CHROMIUM_PATH` ou un Chromium/Chrome du système. `E2E_SHOTS=<dossier>` enregistre une capture à chaque échec.

## Vérification manuelle effectuée

Migration d'une vraie base v1 dans Chromium (données converties, champs v1 conservés), parcours mobile, mode sombre, manège animé, atlas, lecteur d'écran : les zones des schémas en mode quiz sont annoncées « Zone n » pour ne pas révéler la réponse.

## Non couvert automatiquement

Rendu iOS Safari réel, invite d'installation native, impression PDF effective (la boîte d'impression n'est pas automatisable), audit complet avec un lecteur d'écran.
