# PROMPT CODEX — Développement d'une PWA mobile d'apprentissage et de pratique de l'équitation

## 1. Rôle et objectif

Tu es un développeur senior spécialisé en React, TypeScript, PWA, applications mobiles hors ligne, ergonomie tactile, accessibilité et architecture logicielle locale.

Tu dois concevoir et développer une application PWA entièrement en français permettant de comprendre l'équitation, de préparer ses séances, de réviser ses connaissances et de suivre sa progression.

Le projet pédagogique s'appuie sur l'ouvrage :

*The BHS Complete Manual of Equitation: The Training of Horse and Rider*, British Horse Society, édition publiée chez Quiller en 2011.

Le projet dispose d'un fichier EPUB de référence et d'un document de travail intitulé `referentiel_pedagogique_equitation_BHS.md`, si ce dernier est disponible dans les fichiers du projet.

L'application doit transformer les thèmes du manuel en un outil pédagogique interactif, accessible sur smartphone, utilisable à l'écurie et à la maison, y compris sans connexion Internet.

### Principes non négociables

1. Toute l'interface utilisateur est en français.
2. Tous les contenus pédagogiques rédigés pour l'application sont en français.
3. Aucune base de données PostgreSQL.
4. Aucun backend, serveur applicatif ou service cloud.
5. Aucune authentification distante obligatoire.
6. Toutes les données personnelles restent sur le téléphone.
7. L'application fonctionne hors ligne après installation et mise en cache de ses ressources.
8. Les résumés, explications, illustrations et quiz sont originaux et respectent le droit d'auteur.
9. Les exercices avancés ne doivent jamais être présentés comme des instructions d'entraînement autonome.
10. La sécurité du cavalier et le bien-être du cheval priment sur la progression pédagogique.

Ne remplace pas ces choix par une architecture cloud, même si elle semble plus simple à mettre en œuvre.

---

## 2. Première tâche : analyser le projet existant

Avant d'écrire du code :

1. Inspecte l'intégralité du dépôt et identifie le framework, les dépendances, les composants existants, les tests et la configuration de déploiement.
2. Repère le fichier `referentiel_pedagogique_equitation_BHS.md` et les éventuels contenus pédagogiques déjà créés.
3. Si l'EPUB est accessible dans l'environnement de travail, utilise-le comme source de vérification des titres et des références.
4. Examine la table des matières, les 18 chapitres et leurs sous-sections.
5. Distingue systématiquement les informations confirmées dans l'ouvrage, les synthèses éditoriales et les nouvelles fiches créées pour l'application.
6. Identifie les éléments existants à conserver avant de modifier l'architecture.
7. Si le dépôt est vide, crée une architecture complète adaptée au projet.

Ne prétends pas avoir lu ou vérifié une section du livre si son contenu n'a pas été consulté.

Ne bloque pas le développement si certaines informations du manuel restent à vérifier : crée des contenus provisoires correctement identifiés et poursuis les fonctionnalités indépendantes.

À la fin de l'analyse initiale, établis une liste des composants à créer, des fichiers à modifier et des risques techniques. Puis commence effectivement l'implémentation.

---

## 3. Architecture technique obligatoire

### Frontend

Utiliser de préférence :

- React ;
- TypeScript en mode strict ;
- Vite ;
- une bibliothèque de composants légère ou des composants natifs accessibles ;
- CSS responsive, avec Tailwind CSS uniquement si cela est cohérent avec le projet existant ;
- Vitest et Testing Library pour les tests unitaires ;
- Playwright pour les parcours fonctionnels.

Conserve la stack existante lorsqu'elle est adaptée. Évite de réécrire inutilement un projet déjà fonctionnel.

### Stockage local

Utiliser :

- IndexedDB pour les données structurées et les données personnelles ;
- Cache Storage pour les ressources statiques et les médias autorisés ;
- un Service Worker pour la stratégie hors ligne ;
- des fichiers JSON embarqués pour le catalogue pédagogique initial ;
- éventuellement `localStorage` pour quelques préférences non critiques, mais pas comme stockage principal.

Utilise une bibliothèque IndexedDB maintenue, par exemple Dexie.js, si elle apporte une réelle simplification.

### Interdictions explicites

Ne pas installer ou utiliser :

- PostgreSQL ;
- Supabase ;
- Firebase pour les données ou l'authentification ;
- un backend FastAPI, Node.js ou équivalent ;
- une API distante pour charger les fiches ;
- une base de données hébergée ;
- un service d'IA distant ;
- un service d'analytics tiers ;
- une dépendance à un compte utilisateur distant.

L'application ne doit pas envoyer les données du cavalier, ses notes, ses chevaux ou ses résultats à un serveur.

Le téléchargement initial de l'application nécessite un hébergement HTTPS statique. Après installation et mise en cache, les fonctionnalités principales doivent fonctionner sans serveur applicatif ni accès réseau.

Ne prétends pas qu'une PWA installée possède un accès illimité au système de fichiers ou qu'elle peut empêcher le navigateur de supprimer son stockage. Documente les limites du stockage du navigateur.

---

## 4. Langue et localisation

Toute l'application doit être en français, sans exception.

Cela comprend :

- navigation ;
- titres et sous-titres ;
- menus ;
- boutons ;
- formulaires ;
- messages d'erreur ;
- confirmations ;
- notifications ;
- pages de sécurité ;
- fiches pédagogiques ;
- quiz et corrigés ;
- paramètres ;
- aide ;
- messages de fonctionnement hors ligne ;
- importations et exportations ;
- exemples de démonstration.

Les noms de variables, les types TypeScript, les noms de fichiers et les clés JSON peuvent être en anglais pour conserver des conventions techniques courantes.

Les textes affichés aux utilisateurs ne doivent pas être en anglais.

Pour les termes équestres anglais importants, prévoir un glossaire français avec le terme original en anglais uniquement comme équivalent de référence, lorsqu'il est utile.

Exemple :

- « trot enlevé » ;
- « assiette » ;
- « aides naturelles » ;
- « longe » ;
- « siège en équilibre » ;
- « travail sur le plat ».

Ne traduis pas approximativement un terme technique si son équivalent français est incertain. Signale-le pour validation éditoriale.

Utilise le français de Belgique et de France lorsqu'aucune différence terminologique n'est pertinente. Les formats de date, d'heure et les nombres doivent respecter la locale française.

---

## 5. Identité et navigation de l'application

Nom de travail : **ÉquiProgression**.

Le nom doit être facilement modifiable dans un fichier de configuration.

Créer une interface mobile-first, sobre, chaleureuse, lisible et adaptée à une utilisation dans une écurie.

### Navigation principale

Créer cinq entrées persistantes :

1. Accueil
2. Apprendre
3. Pratiquer
4. Réviser
5. Mon suivi

### Accueil

Afficher :

- la reprise du dernier apprentissage ;
- le parcours pédagogique en cours ;
- les fiches favorites ;
- un raccourci vers la préparation d'une séance ;
- les révisions à effectuer ;
- les dernières séances ;
- la progression par thème.

Ne fabrique pas de statistiques si aucune donnée réelle n'existe. Prévoir un état vide utile pour les nouveaux utilisateurs.

### Bibliothèque

Créer une bibliothèque consultable hors ligne comprenant :

- recherche textuelle ;
- filtres par thème ;
- filtres par niveau ;
- filtres par discipline ;
- filtres par type de fiche ;
- accès par chapitre du manuel ;
- favoris ;
- historique de consultation.

### Fiche pédagogique

Chaque fiche doit présenter :

- titre ;
- résumé ;
- niveau indicatif ;
- thème ;
- objectifs pédagogiques ;
- prérequis ;
- explication originale ;
- illustrations originales ou autorisées ;
- notions de vocabulaire ;
- points à observer ;
- erreurs fréquentes lorsque celles-ci sont vérifiées ;
- précautions de sécurité ;
- notions associées ;
- quiz éventuel ;
- référence au chapitre et à la sous-section de l'ouvrage ;
- statut de validation éditoriale.

Les sections non pertinentes peuvent être omises. Ne remplis jamais une fiche avec des informations inventées pour satisfaire un schéma obligatoire.

---

## 6. Référentiel pédagogique : 18 chapitres

Représente les 18 chapitres du manuel dans la bibliothèque.

Les titres originaux anglais peuvent être conservés dans les métadonnées internes pour faciliter la traçabilité, mais tous les titres visibles par l'utilisateur doivent être en français.

Utilise les traductions françaises suivantes comme intitulés de travail :

1. Premiers pas en équitation.
2. Position de base du cavalier sur le plat et au-dessus des obstacles.
3. Les premières leçons.
4. Progresser grâce au travail à la longe.
5. Apprendre le galop, le saut et la pratique en extérieur.
6. Théorie des aides.
7. Utilisation des aides.
8. Les allures.
9. Premiers apprentissages du cheval monté.
10. Travail du cheval à la longe.
11. Les échelles de progression du dressage.
12. Principes d'entraînement pour le travail monté.
13. Préparation du cheval au travail monté.
14. Principes généraux de l'entraînement du cheval de dressage.
15. Travail monté de niveau intermédiaire.
16. Perfectionnement du travail sur le plat.
17. Préparer le cheval au saut d'obstacles.
18. Pratique du cross.

Ces titres sont des traductions éditoriales de travail, non des titres officiels français.

### Contenu de chaque chapitre

Chaque chapitre doit pouvoir contenir :

- sa présentation générale ;
- ses sous-sections ;
- les concepts importants ;
- le vocabulaire ;
- les fiches pédagogiques associées ;
- les quiz ;
- les exercices ou activités identifiés dans la source ;
- les précautions applicables ;
- les références internes.

Le référentiel fourni est une base de départ, pas une preuve que chaque procédure du manuel a été entièrement extraite.

Vérifie les détails dans l'EPUB lorsqu'il est disponible.

Ne complète pas les lacunes du référentiel en inventant des exercices attribués à l'auteur.

### Références

Utilise des références stables de cette forme :

- chapitre source ;
- titre original de la sous-section ;
- identifiant interne du chapitre ;
- éventuellement fichier HTML interne de l'EPUB.

La pagination ne doit être ajoutée que si elle a été vérifiée et si elle est stable dans l'édition utilisée.

---

## 7. Droit d'auteur et création du contenu

Le fichier EPUB est une source de travail pédagogique. Sa possession ne donne pas automatiquement le droit de republier son texte, ses illustrations, ses tableaux ou ses traductions.

### Règles obligatoires

Ne pas :

- incorporer le livre intégral dans le paquet de l'application ;
- copier les chapitres dans les fiches ;
- reproduire les illustrations de l'ouvrage sans autorisation ;
- créer une traduction intégrale du livre ;
- reproduire de longs passages ;
- extraire les images du livre pour les distribuer avec la PWA sans vérifier les droits ;
- présenter une paraphrase proche de l'original comme un contenu libre de droits.

Créer des fiches originales qui expliquent les concepts avec une formulation propre à l'application.

Produire de nouvelles illustrations schématiques ou utiliser des médias dont les licences autorisent explicitement l'usage prévu.

Si une image générée ou provenant d'une bibliothèque est utilisée, conserver les métadonnées de provenance et les informations de licence nécessaires.

### Métadonnées de provenance

Chaque fiche doit comporter des champs tels que :

- `sourceChapterId` ;
- `sourceSectionTitle` ;
- `contentOrigin` ;
- `editorialStatus` ;
- `reviewedBy` ;
- `reviewDate` ;
- `mediaLicense` lorsque nécessaire.

Valeurs possibles de `contentOrigin` :

- `synthese_originale` ;
- `aide_pedagogique_originale` ;
- `complement_securite` ;
- `glossaire_original` ;
- `reference_source_non_verifiee`.

Statuts éditoriaux :

- brouillon ;
- à vérifier ;
- en relecture ;
- validé ;
- publié.

Ne présente pas une fiche comme validée tant qu'elle n'a pas été effectivement vérifiée.

### Illustrations

Privilégier :

- schémas de position ;
- diagrammes de carrière ;
- représentations simplifiées des trajectoires ;
- illustrations originales du matériel ;
- schémas explicatifs des notions ;
- icônes et pictogrammes adaptés au mobile.

Les schémas techniques doivent être vérifiés avant publication. Ne crée pas de diagramme anatomique ou biomécanique donnant une impression de précision scientifique non justifiée.

---

## 8. Avertissements de sécurité et fiches avancées

Cette règle est obligatoire dans le contenu, le modèle de données et l'interface.

Les fiches concernant :

- le jeune cheval ;
- le travail à la longe ;
- le saut d'obstacles ;
- le cross ;
- le dressage avancé ;
- les exercices montés présentant un risque particulier ;

doivent être explicitement présentées comme des **supports de compréhension et de préparation, et non comme des instructions d'entraînement autonome**.

### Message à afficher

Utiliser un avertissement français explicite, par exemple :

« Cette fiche est un support de compréhension et de préparation. Elle ne constitue pas un mode d'emploi pour réaliser seul cet exercice. La mise en pratique doit être adaptée au cheval, au cavalier et aux conditions de sécurité, sous l'encadrement d'un professionnel qualifié lorsque cela est nécessaire. »

Adapter le texte au risque réel de chaque fiche, sans supprimer le principe de base.

### Métadonnées de risque

Chaque fiche pratique doit pouvoir définir :

- `riskLevel` ;
- `supervisionRequired` ;
- `advancedPractice` ;
- `safetyNotice` ;
- `publicationRequiresReview`.

Valeurs indicatives de `riskLevel` :

- faible ;
- modéré ;
- élevé ;
- à déterminer par un relecteur qualifié.

Ne classe pas automatiquement un exercice comme sûr sur la seule base de son titre.

### Règles éditoriales

Ne jamais encourager :

- un débutant à réaliser seul un exercice avancé ;
- une augmentation du niveau de difficulté sans encadrement adapté ;
- la poursuite d'une séance malgré une douleur ou une boiterie apparente ;
- des pratiques susceptibles de mettre le cheval ou le cavalier en danger.

En présence d'un problème de santé animale, orienter vers un vétérinaire. Pour une difficulté technique, proposer de demander conseil à un enseignant.

L'application est un outil pédagogique. Elle ne certifie pas les compétences pratiques du cavalier.

---

## 9. Parcours pédagogiques

Créer trois parcours initiaux.

### Parcours A — Découvrir l'équitation

- environnement équestre ;
- équipement et préparation ;
- sécurité ;
- position de base ;
- premières leçons ;
- découverte des allures ;
- vocabulaire fondamental.

### Parcours B — Consolider ses acquis

- position et équilibre ;
- compréhension des aides ;
- pas, trot et galop ;
- transitions ;
- observation de la réponse du cheval ;
- préparation et bilan d'une séance.

### Parcours C — Approfondir sa compréhension technique

- principes d'entraînement ;
- travail sur le plat ;
- éducation du cheval ;
- dressage ;
- saut d'obstacles ;
- cross.

Les fiches avancées doivent rester théoriques et préparatoires lorsqu'une pratique autonome serait inappropriée.

Permettre de suivre des thèmes indépendamment : un utilisateur peut avoir un niveau différent selon les disciplines.

### Progression

Enregistrer :

- fiches consultées ;
- fiches terminées ;
- quiz effectués ;
- résultats ;
- notions à revoir ;
- objectifs personnels.

Ne pas déduire un niveau équestre réel à partir du seul taux de réussite aux quiz.

---

## 10. Quiz et révisions

Créer un moteur de quiz local.

Types de questions :

- choix unique ;
- choix multiples ;
- vrai ou faux ;
- association de termes ;
- identification d'une notion dans une illustration ;
- situations théoriques à analyser.

Chaque question contient :

- un énoncé français ;
- les choix proposés ;
- la bonne réponse ;
- une explication originale ;
- une référence à la fiche concernée ;
- éventuellement une illustration autorisée ;
- un niveau indicatif ;
- un statut de validation.

Les corrections doivent expliquer pourquoi une réponse est correcte. Ne pas simplement afficher « bonne réponse » ou « mauvaise réponse ».

Les quiz de sécurité doivent privilégier la prudence et ne pas proposer de choix dangereux comme des conseils acceptables.

Prévoir une répétition espacée simple, enregistrée localement.

Aucun service externe ne doit être nécessaire pour générer ou corriger les quiz.

---

## 11. Mode pratique à l'écurie

Créer un mode dédié, utilisable d'une main et hors ligne.

### Préparation d'une séance

Permettre de noter :

- date ;
- durée prévue ;
- cheval ;
- objectifs ;
- thème à travailler ;
- matériel à préparer ;
- points de vigilance.

### Checklist

Proposer des checklists personnalisables :

- préparation générale ;
- équipement du cavalier ;
- vérification visuelle du matériel ;
- préparation de la séance ;
- fin de séance.

Les checklists ne doivent jamais prétendre remplacer un contrôle complet du matériel ou les instructions d'un professionnel.

### Pendant la séance

Afficher rapidement :

- les objectifs ;
- les fiches favorites ;
- les notes préparatoires ;
- les points d'observation ;
- les consignes de sécurité.

Éviter les interactions longues ou les formulaires complexes lorsqu'une personne est à cheval. Ne pas inciter à utiliser le téléphone pendant la monte.

### Après la séance

Permettre de consigner :

- exercices abordés ;
- réussites ;
- difficultés ;
- observations sur le cheval ;
- ressenti du cavalier ;
- éléments à revoir ;
- objectif de la prochaine séance.

Les observations sont personnelles et ne constituent pas un diagnostic vétérinaire.

---

## 12. Journal et gestion locale des chevaux

Créer un journal de séances et un registre facultatif des chevaux.

### Cheval

Champs possibles :

- identifiant local ;
- nom ou surnom ;
- description facultative ;
- discipline habituelle ;
- notes personnelles ;
- date de création.

Ne demander aucune donnée qui n'est pas utile.

### Séance

Champs possibles :

- identifiant ;
- date ;
- cheval associé ;
- durée ;
- objectifs ;
- exercices ;
- observations ;
- bilan ;
- prochaine étape.

Les informations sont privées et enregistrées exclusivement dans IndexedDB.

Prévoir la modification et la suppression d'une séance et d'un cheval.

La suppression d'un cheval doit demander confirmation et expliquer les conséquences sur les séances associées.

---

## 13. Fonctionnement hors ligne et PWA

La PWA doit fonctionner après installation sur smartphone.

### Exigences

- manifeste Web App complet ;
- icônes adaptées ;
- affichage responsive ;
- Service Worker ;
- mise en cache des ressources essentielles ;
- page de secours hors ligne ;
- accès au catalogue et aux fiches embarquées ;
- quiz disponibles hors ligne ;
- journal et progression disponibles hors ligne ;
- favoris disponibles hors ligne ;
- aucune requête réseau obligatoire au démarrage après mise en cache.

Les mises à jour de l'application doivent être contrôlées et ne doivent pas effacer les données locales.

### Stratégie de cache

- ressources versionnées de l'application : cache contrôlé ;
- fiches embarquées : disponibles dès le paquet initial ;
- médias facultatifs : cache selon les besoins et les droits ;
- données personnelles : IndexedDB, jamais Cache Storage ;
- contenus utilisateur : jamais envoyés à un serveur.

Éviter de télécharger des vidéos volumineuses par défaut.

Afficher un indicateur discret de disponibilité hors ligne et un message clair si une ressource facultative n'est pas disponible.

### Installation

Prévoir une page d'aide expliquant en français comment installer la PWA depuis le navigateur.

Ne prétends pas qu'un bouton d'installation natif est toujours disponible sur tous les navigateurs.

---

## 14. Schéma de données local

Créer une couche d'accès aux données indépendante des composants React.

Entités recommandées :

### `chapters`

- `id`
- `number`
- `titleFr`
- `sourceTitle`
- `summaryFr`
- `sourceReference`
- `editorialStatus`

### `topics`

- `id`
- `nameFr`
- `descriptionFr`

### `lessons`

- `id`
- `chapterId`
- `topicIds`
- `titleFr`
- `summaryFr`
- `objectives`
- `prerequisites`
- `sections`
- `vocabulary`
- `observations`
- `commonMistakes`
- `safetyNotice`
- `riskLevel`
- `supervisionRequired`
- `advancedPractice`
- `sourceReference`
- `contentOrigin`
- `editorialStatus`
- `contentVersion`

### `mediaAssets`

- `id`
- `lessonId`
- `type`
- `localPath`
- `altTextFr`
- `captionFr`
- `license`
- `provenance`

### `quizQuestions`

- `id`
- `lessonId`
- `questionFr`
- `questionType`
- `choices`
- `correctAnswer`
- `explanationFr`
- `editorialStatus`

### `userProgress`

- `lessonId`
- `status`
- `lastViewedAt`
- `completedAt`
- `reviewCount`

### `quizAttempts`

- `id`
- `questionId`
- `selectedAnswer`
- `isCorrect`
- `attemptedAt`

### `favorites`

- `lessonId`
- `createdAt`

### `horses`

- `id`
- `name`
- `description`
- `createdAt`
- `updatedAt`

### `ridingSessions`

- `id`
- `horseId`
- `date`
- `durationMinutes`
- `objectives`
- `exercises`
- `observations`
- `summary`
- `nextGoals`
- `createdAt`
- `updatedAt`

Les structures peuvent être adaptées si une solution plus simple et robuste est préférable.

Créer les index nécessaires dans IndexedDB. Utiliser des identifiants stables pour les contenus embarqués et des identifiants uniques pour les données personnelles.

Mettre en place un versionnement du schéma IndexedDB et des migrations testées.

Ne pas stocker les données utilisateur dans un simple fichier JSON modifiable depuis le frontend.

---

## 15. Sauvegarde, import et confidentialité

L'application ne doit pas dépendre d'une sauvegarde cloud.

### Export

Proposer un export JSON local contenant :

- les chevaux ;
- les séances ;
- les favoris ;
- la progression ;
- les résultats de quiz ;
- les préférences personnelles.

Ne pas inclure par défaut le catalogue pédagogique embarqué, qui peut être réinstallé.

Ajouter une version de format d'export et une date de création.

### Import

- valider le format ;
- contrôler les versions ;
- vérifier les types et les valeurs ;
- détecter les doublons ;
- afficher un résumé avant import ;
- permettre de refuser l'opération ;
- éviter les écrasements silencieux ;
- prévoir une procédure de restauration en cas d'erreur.

Ne jamais exécuter du code provenant d'un fichier importé.

### Confidentialité

- aucune transmission distante des données ;
- aucune télémétrie ;
- aucune publicité intégrée ;
- aucune clé API secrète dans le frontend ;
- suppression des données locales depuis les paramètres ;
- information claire sur les limites de conservation du navigateur.

Si le stockage est supprimé par le système ou le navigateur, les données non exportées peuvent être perdues. Cette limite doit être documentée.

---

## 16. Recherche et glossaire

Créer une recherche locale sans API externe.

La recherche doit couvrir :

- titres ;
- résumés ;
- texte des fiches ;
- vocabulaire ;
- chapitres ;
- disciplines ;
- synonymes français validés.

Gérer les accents et les variantes orthographiques usuelles.

Créer un glossaire comprenant :

- terme ;
- définition originale en français ;
- synonymes ;
- équivalent anglais éventuel ;
- exemple de contexte ;
- fiches associées ;
- référence source ;
- statut éditorial.

Ne pas inventer une définition technique en prétendant qu'elle provient du livre.

---

## 17. Design et accessibilité

Le design doit être pensé pour les smartphones.

### Principes

- grandes zones tactiles ;
- typographie lisible ;
- contraste suffisant ;
- navigation prévisible ;
- textes courts et hiérarchisés ;
- peu de saisie ;
- indicateurs de progression compréhensibles ;
- boutons clairement libellés ;
- alternatives textuelles aux images ;
- prise en charge de la navigation clavier ;
- respect des préférences de réduction des animations.

Ne pas utiliser uniquement la couleur pour communiquer un statut.

Prévoir des états vides, des erreurs explicites, des confirmations de suppression et des messages de succès.

Éviter les animations décoratives lourdes et les images plein écran qui ralentissent l'utilisation à l'écurie.

---

## 18. Architecture des dossiers proposée

Adapte cette structure au dépôt existant.

    src/
      app/
        App.tsx
        router.tsx
        providers/
      components/
        layout/
        navigation/
        forms/
        feedback/
        cards/
      features/
        home/
        library/
        lessons/
        chapters/
        glossary/
        quizzes/
        practice/
        horses/
        riding-sessions/
        progress/
        favorites/
        settings/
        backup/
      data/
        chapters.fr.json
        topics.fr.json
        lessons/
        glossary.fr.json
        quizzes/
      db/
        database.ts
        schema.ts
        migrations/
        repositories/
      services/
        search/
        progress/
        review/
        export/
        import/
      hooks/
      styles/
      types/
      utils/
      i18n/
      assets/
        icons/
        illustrations-originales/
      tests/
    public/
      icons/
      manifest.webmanifest
    docs/
      architecture.md
      referentiel-pedagogique.md
      droits-auteur.md
      securite-pedagogique.md
      sauvegarde-locale.md

Les textes visibles sont stockés en français.

Ne crée pas de doublons entre les fichiers JSON et la base IndexedDB. Les données pédagogiques initiales sont embarquées dans l'application ; les données personnelles sont stockées localement.

---

## 19. Tests obligatoires

Créer des tests automatisés pour les fonctionnalités critiques.

### Tests unitaires

- recherche et normalisation des accents ;
- validation des fiches ;
- calcul de progression ;
- correction des quiz ;
- validation des imports ;
- génération des exports ;
- migrations IndexedDB ;
- gestion des favoris ;
- validation des métadonnées de sécurité.

### Tests fonctionnels

- navigation entre les cinq rubriques ;
- recherche d'une fiche ;
- consultation d'un chapitre ;
- passage d'un quiz ;
- enregistrement d'une séance ;
- modification d'une observation ;
- création et suppression d'un cheval ;
- export puis réimport des données ;
- restauration après fermeture de l'application ;
- comportement hors ligne après mise en cache ;
- mise à jour de l'application sans perte des données.

### Tests de confidentialité

Vérifier qu'aucune requête réseau applicative ne transmet :

- notes personnelles ;
- résultats de quiz ;
- chevaux ;
- séances ;
- préférences ;
- données de progression.

Vérifier l'absence de dépendances obligatoires à un backend ou à un service cloud.

### Tests de contenu

- tous les chapitres sont présents ;
- chaque fiche possède un identifiant unique ;
- toutes les fiches publiées disposent de leurs métadonnées requises ;
- les avertissements de sécurité sont présents pour les fiches concernées ;
- aucune fiche provisoire n'est présentée comme validée ;
- les textes visibles sont en français ;
- les références aux sources ne sont pas inventées.

---

## 20. Critères d'acceptation

La première version est acceptable lorsque :

1. L'application peut être installée comme PWA sur smartphone.
2. Toute l'interface est en français.
3. Les 18 chapitres sont accessibles depuis la bibliothèque.
4. Les fiches peuvent être recherchées et filtrées.
5. Les contenus pédagogiques initiaux sont disponibles hors ligne.
6. Les quiz fonctionnent sans réseau.
7. Les résultats des quiz sont conservés localement.
8. Les favoris et la progression persistent après fermeture.
9. Le journal de séances fonctionne hors ligne.
10. Les données peuvent être exportées et réimportées.
11. Aucun backend ou service cloud n'est nécessaire.
12. Aucune donnée personnelle n'est transmise à un serveur.
13. Le catalogue distingue les synthèses, les fiches originales et les références à vérifier.
14. Les illustrations sont originales ou disposent de droits d'utilisation vérifiés.
15. Les fiches avancées affichent les avertissements appropriés.
16. Les tests automatisés critiques passent.
17. Le projet peut être construit et déployé comme site statique HTTPS.
18. Les instructions d'installation, d'utilisation hors ligne et de sauvegarde sont documentées en français.

---

## 21. Livrables attendus

Tu dois livrer un projet réellement fonctionnel, pas seulement une maquette ou un document de conception.

Produire :

- l'application PWA complète ;
- les composants React et les pages ;
- le modèle de données local ;
- la couche IndexedDB ;
- les migrations ;
- les données initiales des 18 chapitres ;
- les fiches pédagogiques originales disponibles à ce stade ;
- le glossaire initial ;
- les quiz validés disponibles ;
- le Service Worker et le manifeste PWA ;
- les fonctionnalités de sauvegarde et de restauration ;
- les tests automatisés ;
- un fichier README entièrement en français ;
- un guide d'installation ;
- un guide de sauvegarde et de confidentialité ;
- un document expliquant la provenance et le statut éditorial des contenus ;
- un document listant les éléments pédagogiques encore à vérifier.

Ne fabrique pas artificiellement un grand nombre de fiches pour donner l'impression que tout le manuel a été exploité. Il vaut mieux livrer un premier ensemble de fiches originales correctement sourcées, puis étendre progressivement le contenu.

---

## 22. Méthode de travail demandée à Codex

Procède par étapes, sans t'arrêter après la seule analyse.

### Étape A — Audit

Inspecte le projet, établis l'architecture existante et identifie les ressources pédagogiques.

### Étape B — Socle technique

Implémente le shell mobile, la navigation, le stockage local, la recherche et le fonctionnement hors ligne.

### Étape C — Référentiel

Intègre les 18 chapitres, les références vérifiables et les premiers contenus éditoriaux originaux.

### Étape D — Fonctionnalités pédagogiques

Implémente les fiches, le glossaire, les quiz, les favoris et la progression.

### Étape E — Pratique

Implémente le journal, les chevaux, les checklists et les bilans de séance.

### Étape F — Confidentialité et sauvegarde

Implémente les exports, imports, migrations et contrôles de données locales.

### Étape G — Validation

Lance les tests, corrige les erreurs et vérifie le comportement hors ligne.

### Étape H — Documentation

Rédige les guides en français et liste précisément les fonctions terminées, les limites restantes et les contenus nécessitant une validation humaine.

À chaque étape, vérifie que le projet reste compilable. Ne laisse pas des boutons factices ou des fonctionnalités annoncées mais inopérantes.

Si une fonctionnalité ne peut pas être achevée, documente clairement son état et son motif au lieu de prétendre qu'elle fonctionne.

## Résultat final attendu

Une PWA mobile française, installable, rapide, utilisable hors ligne, sans backend et sans base de données cloud, qui aide le cavalier à comprendre les notions équestres, préparer ses séances, réviser ses connaissances et suivre sa progression, tout en respectant le droit d'auteur, les limites pédagogiques et la sécurité du cheval et du cavalier.