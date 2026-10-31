# 🗃️ Schéma des données

Base IndexedDB `EquiProgressionDB`, gérée par Dexie. Modèles TypeScript : `src/types/models.ts`.
Identifiants : chaînes stables (`préfixe_uuid`). Dates : ISO 8601 (`2026-10-30T21:15:00.000Z`, ou `2026-10-30` pour une date calendaire).

## Tables (schéma v2)

| Table | Clé | Index | Contenu |
|---|---|---|---|
| `profile` | `id` (= `me`) | — | `UserProfile` : niveau, expérience, objectifs, intérêts, auto-évaluation théorique, date du diagnostic |
| `diagnostics` | `id` | `completedAt` | `DiagnosticResult` : score par domaine, score global, compétences recommandées |
| `skillProgress` | `skillId` | `state`, `updatedAt` | `SkillProgress` : état, indice 0–100, historique des évaluations (30 max) |
| `lessonProgress` | `lessonId` | `status`, `lastViewedAt` | consultation des fiches : statut de lecture, nombre de vues, temps de lecture |
| `exerciseAttempts` | `id` | `exerciseId`, `finishedAt` | `ExerciseAttempt` : score, réponses, erreurs, durée, n° de tentative |
| `quizAttempts` | `id` | `questionId`, `attemptedAt` | réponses aux quiz de la v1 (historique conservé) |
| `revisionItems` | `id` (`kind:refId`) | `kind`, `dueAt` | `RevisionItem` : étape, intervalle, facilité, échéance, oublis |
| `ridingSessions` | `id` | `date`, `horseId`, `sessionType`, `discipline`, `planId`, `createdAt` | `JournalEntry` (nom de table v1 conservé) |
| `horses` | `id` | `name`, `createdAt` | `Horse` : photo réduite facultative, robe, race, sexe, particularités, notes |
| `sessionPlans` | `id` | `date`, `status`, `horseId`, `createdAt` | `SessionPlan` + bilan (`SessionDebrief`) |
| `favorites` | `id` (`type_cible`) | `type`, `targetId`, `createdAt` | favoris : fiche, terme, exercice, séance, figure, matériel, comportement, région anatomique |
| `notes` | `id` (`type_cible`) | `[targetType+targetId]`, `updatedAt` | une note personnelle par élément |
| `checklists` | `id` | `updatedAt` | listes modifiables et état des cases |
| `settings` | `key` (= `app`) | — | thème, objectifs (séances / semaine, révisions / jour) |
| `history` | `id` | `kind`, `at` | recherches et termes consultés (30 derniers par type) |
| `userProgress` | `lessonId` | — | table v1 conservée en lecture seule (filet de sécurité de la migration) |

### Préférences en `localStorage` (non critiques)

`equi.theme` (miroir du thème pour éviter un flash au chargement), `legal_notice_acknowledged(_version)`, `equi.guide.seen`, `equi.update.*`, `equi.backup.lastExport`.

## Contenus pédagogiques (statiques, dans le code)

`Skill`, `Exercise` / `ExerciseQuestion` (10 types), `Flashcard`, `DictionaryEntry`, `AtlasEntry`, `EquipmentItem`, `Behavior`, `ArenaFigure`, `InteractiveView`, `SessionTemplate`, `DiagnosticQuestion`. Ils ne contiennent aucune donnée personnelle et sont pré-mis en cache.

## Migrations

| Version | Changement | Stratégie |
|---|---|---|
| v1 → v2 | Journal, chevaux, favoris enrichis ; `userProgress` → `lessonProgress` + `notes` ; 11 nouvelles tables ; checklists en base | `upgrade()` Dexie appelant les fonctions pures de `migrations.ts`. **Aucun champ v1 n'est supprimé** : les champs v2 sont ajoutés à côté. La table `userProgress` est conservée. L'état coché des checklists (ancien `localStorage`) est reporté. |

Correspondances principales v1 → v2 :

| v1 | v2 |
|---|---|
| séance `theme` | `title` (+ `sessionType` deviné : obstacle, extérieur, travail à pied…) |
| `successes` / `nextGoals` / `observations` | `positives` / `improvements` / `comments` |
| `riderFeelScore` / `horseRelaxationScore` | `feeling` / `horseRelaxation` |
| cheval `temperament` / `specialNotes` | `particularities` / `notes` |
| `userProgress.personalNotes` | table `notes` (`lesson_<id>`) |
| dates numériques (ms) | dates ISO 8601 |

Ajouter une version : déclarer `this.version(3).stores({...}).upgrade(...)` dans `db.ts`, écrire la conversion pure dans `migrations.ts` et l'appliquer aussi dans `convertV1`/import si nécessaire, puis ajouter un test dans `storage.integration.test.ts`.

## Règles métier clés

- **Maîtrise** (`mastery.ts`) : moyenne pondérée des 6 dernières évaluations ; « Maîtrisé » si indice ≥ 85, ≥ 3 évaluations sur ≥ 2 jours, dernière ≥ 0,7 ; « À réviser » après un échec ou 60 jours sans évaluation. Ouvrir une fiche donne au plus « En cours d'apprentissage ».
- **Répétition espacée** (`spacedRepetition.ts`) : 1, 3, 7, 14, 30 jours puis × facilité ; voir `docs/FONCTIONNALITES.md`.
