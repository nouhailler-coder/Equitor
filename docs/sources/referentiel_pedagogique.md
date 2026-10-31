# Référentiel pédagogique — The BHS Complete Manual of Equitation (2011)
## Statut et méthode
Document de travail pour concevoir une PWA d’apprentissage de l’équitation **100 % locale**. Le plan des chapitres et leurs sous-sections ci-dessous proviennent de la table des titres HTML de l’EPUB fourni. Les résumés et listes de fiches sont des synthèses et propositions éditoriales, non des citations du livre. Les exercices ne sont qualifiés de « présents dans le manuel » que lorsque leur intitulé apparaît dans les rubriques extraites ; leur protocole détaillé doit être revérifié dans le texte complet avant publication. Les numéros de pages ne sont pas attribués ici, car la pagination EPUB varie selon les éditions/lecteurs ; les références stables sont chapitre + titre de section.
## Architecture locale imposée
- Aucun backend cloud, aucune base PostgreSQL, aucun compte obligatoire.
- Contenus éditoriaux embarqués en JSON/Markdown/HTML dans le paquet PWA.
- IndexedDB pour progression, favoris, quiz, journal et profils/chevaux locaux.
- Cache Storage / Service Worker pour ressources de l’application et médias autorisés.
- Export/import local JSON pour sauvegarde manuelle ; chiffrement de sauvegarde à décider si des données privées y figurent.
- Toute fonction IA, synchronisation distante ou partage cloud est exclue du périmètre par défaut.
## Légende de confiance
- **Structure source** : titre présent dans l’EPUB.
- **Synthèse** : résumé éditorial du thème, à contrôler au fil du texte.
- **Fiche proposée** : création originale destinée à l’application.
- **Exercice explicitement nommé** : intitulé trouvé dans le plan du chapitre ; cela ne dispense pas de vérifier les détails, précautions et conditions d’exécution dans le texte.

## Chapitre 01 — 1. Getting Started
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_01.html` / chapitre 1.
**Synthèse thématique :** Accueil dans la pratique équestre : choix de l’école et de l’instructeur, tenue, condition physique, morphologie du cavalier, choix du premier cheval, manège et règles de circulation, harnachement de base, conduite en main, monter et descendre.
### Sous-sections extraites de l’EPUB
- Learning to ride
    - BRITISH HORSE SOCIETY EXAMINATION SYSTEM
- The riding school
- Instructors
- Clothing
- Motivation and fitness
- Rider’s body shape
  - Somatotypes
- Selecting the first horse
- The riding arena
  - Arena etiquette
- The horse’s basic tack
- Leading the horse in hand
- Mounting and dismounting
- Mounting from a block
- Mounting from the ground
- Mounting via a ‘leg up’
  - Giving a ‘leg up’
  - Receiving a ‘leg up’
- Dismounting

### Vocabulaire à indexer
école d’équitation, instructeur, carrière/manège, tack/harnachement, conduire en main, montoir, descente.

### Exercices ou contenus pratiques explicitement signalés par le plan
Les gestes explicitement annoncés par les rubriques : mener le cheval en main ; monter depuis un montoir, du sol ou avec aide ; descendre. Ce sont des sujets à transformer en fiches de préparation, avec supervision adaptée.
### Propositions de fiches originales
- Choisir une école et préparer sa première leçon
- Tenue et équipement du cavalier
- Règles de circulation dans le manège
- Conduire un cheval en main : points d’attention
- Monter et descendre : comparer les méthodes décrites
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 1
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 02 — 2. The Rider’s Basic Position on the Flat and Over Fences
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_02.html` / chapitre 2.
**Synthèse thématique :** Position de base en selle sur le plat et au-dessus des obstacles ; description de profil et de dos ; assiette ; défauts courants ; facteurs corporels, matériels et environnementaux influençant l’équilibre ; adaptation aux allures rapides et au saut.
### Sous-sections extraites de l’EPUB
- A basic balanced seat
  - Outline from the side
  - Outline from the rear
  - The seat
- Common mistakes and why they happen
  - Tipping forward
  - Sitting behind the movement
  - Not sitting square
  - Gripping up
  - Looking down
- Other influences that could affect the rider’s position and balance
  - Conformation of the rider
  - Fitness and confidence of the rider
  - Problems with everyday footwear
  - Handed dominance
  - Conformation of the horse
  - Design and style of the saddle used
  - Terrain ridden over and the speed of riding
  - Medical conditions
  - Stress
- Changes required in balance for faster work and jumping

### Vocabulaire à indexer
assiette, équilibre, position de profil, symétrie, bascule vers l’avant, retard du mouvement, étriers, selle.

### Exercices ou contenus pratiques explicitement signalés par le plan
Le chapitre est surtout descriptif/analytique. Les exercices pratiques ne sont pas listés comme un programme autonome dans le sommaire ; les fiches proposées ci-dessous sont des outils d’observation dérivés des thèmes.
### Propositions de fiches originales
- Auto-observation de la position de profil
- Observer la symétrie depuis l’arrière avec un enseignant
- Repérer les cinq erreurs de position citées dans le chapitre
- Facteurs qui influencent l’équilibre : grille d’observation
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 2
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 03 — 3. Early Lessons
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_03.html` / chapitre 3.
**Synthèse thématique :** Premières leçons, progression, position au pas et au trot, trot assis et enlevé, apprentissage à la longe ou en tenant le cheval en main avec un lead rein.
### Sous-sections extraites de l’EPUB
    - Riding school terms
- Making progress
- Position in movement in walk and trot
  - Walk
  - Trot
    - Sitting trot
    - Rising trot
- Learning to ride on the lunge or lead rein
  - Learning on the lunge
  - Learning on a lead rein

### Vocabulaire à indexer
pas, trot, trot assis, trot enlevé, longe, lead rein/rênes de conduite par un assistant.

### Exercices ou contenus pratiques explicitement signalés par le plan
Thèmes de pratique explicitement nommés : position en mouvement au pas et au trot ; trot assis/enlevé ; apprentissage à la longe ; apprentissage avec lead rein. La conduite réelle doit rester celle de l’enseignant.
### Propositions de fiches originales
- Déroulement d’une première leçon
- Observer la position au pas
- Comprendre le trot assis et le trot enlevé
- Longe ou lead rein : objectifs et différences
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 3
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 04 — 4. Improving on the Lunge
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_04.html` / chapitre 4.
**Synthèse thématique :** Améliorer la position et la confiance grâce au travail du cavalier à la longe ; responsabilités de l’enseignant, sécurité, installation, matériel, choix du cheval, déroulement de séance, exercices de position, marche, trot et galop.
### Sous-sections extraites de l’EPUB
- Responsibilities of the instructor
  - Instructing the rider on the lunge
    - The rider’s safety
- Facilities needed
  - The lungeing area
  - Tack
  - The lunge horse
- Technique for lungeing a rider
  - The instructor
  - Length of a lungeing lesson
  - Preliminary work
- The lunge lesson
  - Rider position
    - Exercise to assist in achieving the correct position
    - Exercise to build confidence
  - Work at the walk
  - Sitting to the trot on the lunge
  - Rising to the trot on the lunge
    - Changing the diagonal
  - Cantering on the lunge
  - Mounted exercises on the lunge

### Vocabulaire à indexer
longe, longeur, cheval de longe, étriers, équilibre, trot assis, trot enlevé, diagonale.

### Exercices ou contenus pratiques explicitement signalés par le plan
Exercices explicitement présents dans les rubriques : exercices pour aider à trouver la position correcte ; exercices de confiance ; travail au pas ; trot assis et enlevé à la longe ; changement de diagonale ; galop ; exercices montés à la longe.
### Propositions de fiches originales
- Préparer une séance à la longe : rôle de chacun
- Observer l’équilibre au pas
- Comprendre le changement de diagonale au trot
- Journal de confiance et d’aisance du cavalier
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 4
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 05 — 5. Cantering, Jumping and Riding Out
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_05.html` / chapitre 5.
**Synthèse thématique :** Condition physique du cavalier, apprentissage du galop, travail rapide, apprentissage du saut, siège en équilibre, barres au sol, premiers sauts, doubles, parcours, obstacles larges, lignes et grilles, évaluation de parcours, sorties, route, pentes et barrières.
### Sous-sections extraites de l’EPUB
- Rider fitness
  - Methods of achieving fitness
- Learning to canter
  - Fast work – strong canters and galloping
- Learning to jump
  - The balanced jumping seat
    - Strengthening the position
    - Overcoming fear
  - Using ground poles
  - The first jumps
  - Jumping doubles
  - Introducing a basic course
  - Jumping spread fences
  - Grid work
  - Assessing and riding a course
    - Measuring the distances
  - Average striding distances
    - Changes of lead
    - Warming-up
    - Use of the whip
- Riding out
  - Hacking
  - Roadwork
- Riding up and down hills
  - Opening and closing gates
    - Opening and closing a gate – mounted
    - Opening and closing a gate – dismounted

### Vocabulaire à indexer
siège en équilibre, barres au sol, double, ligne, grille, foulée, changement de pied, échauffement, hacking, routework.

### Exercices ou contenus pratiques explicitement signalés par le plan
Les exercices et thèmes pratiques sont explicitement nommés : barres au sol ; premiers sauts ; doubles ; parcours ; obstacles larges ; travail en grille ; évaluation et distances ; sorties, montées/descentes et ouverture/fermeture de barrières à cheval ou à pied.
### Propositions de fiches originales
- Préparer le galop avec un enseignant
- Reconnaître les étapes d’apprentissage de l’obstacle
- Comprendre la fonction des barres au sol
- Préparer une sortie à l’extérieur
- Ouverture et fermeture d’une barrière : distinguer les situations
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 5
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 06 — 6. The Theory of the Aids
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_06.html` / chapitre 6.
**Synthèse thématique :** Théorie des aides : aides naturelles (voix, jambes, assiette/poids, mains), tenue des rênes, rênes longues et rênes flottantes, aides artificielles (cravache, éperons) et application pratique.
### Sous-sections extraites de l’EPUB
- Natural aids
  - The voice
  - The legs, seat and hands
    - The legs
    - The seat, including the weight
    - The hands
    - Riding on a long and on a loose rein
- Methods of holding the reins
- The artificial aids
  - The whip
  - Spurs
- Practical use of the aids
- Summary

### Vocabulaire à indexer
aides naturelles, aides artificielles, contact, assiette, poids, rêne longue, rêne flottante, cravache, éperons.

### Exercices ou contenus pratiques explicitement signalés par le plan
Le chapitre contient une section « Practical use of the aids » et un résumé. Ne convertir les descriptions en consignes de gestes qu’après vérification détaillée du passage et relecture professionnelle.
### Propositions de fiches originales
- Glossaire des aides naturelles
- Comparer rêne longue et rêne flottante
- Rôle et limites des aides artificielles
- Quiz : identifier l’aide décrite
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 6
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 07 — 7. The Use of the Aids
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_07.html` / chapitre 7.
**Synthèse thématique :** Utilisation des aides pour avancer, transitions montantes et descendantes, départ au galop, contrôle de l’impulsion, demi-arrêt, arrêt, tournants et cercles, position à droite et à gauche.
### Sous-sections extraites de l’EPUB
- Forward movement
  - Moving off and upward transitions
    - Striking off into canter
  - Controlling the forward movement
    - The half-halt (see also page 150)
    - Upward transitions within a gait
  - Downward transitions
    - The halt (see also page 151)
- Turns and circles (see also illustration on page 39/bottom right)
  - Position right and left

### Vocabulaire à indexer
transition montante, transition descendante, départ au galop, demi-arrêt, arrêt, incurvation/position dans le tournant.

### Exercices ou contenus pratiques explicitement signalés par le plan
Mouvements explicitement abordés : départ et transitions montantes ; départ au galop ; contrôle de l’avancée ; demi-arrêt ; transitions descendantes ; arrêt ; tournants et cercles. Les fiches doivent expliquer les objectifs, pas remplacer l’enseignement monté.
### Propositions de fiches originales
- Carte des transitions
- Observer une transition sans juger seul la performance
- Comprendre le demi-arrêt à partir du texte validé
- Tracer et comprendre un cercle
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 7
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 08 — 8. The Gaits
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_08.html` / chapitre 8.
**Synthèse thématique :** Mécanique et rythme des allures : pas, trot, galop, galop rapide, pieds qui mènent, variations de chaque allure et catégories de travail, moyen, allongé, rassemblé et libre.
### Sous-sections extraites de l’EPUB
- The walk
- The trot
  - Rhythm
- The canter
    - When the right foreleg leads:
    - When the left foreleg leads:
- The gallop
    - When the left foreleg leads:
    - When the right foreleg leads:
- Variations within a gait
  - Working gaits
  - Medium gaits
  - Extended gaits
  - Collected gaits
  - Free gaits

### Vocabulaire à indexer
allure, rythme, poser des membres, bipède diagonal, galop à droite/gauche, travail, moyen, allongé, rassemblé, libre.

### Exercices ou contenus pratiques explicitement signalés par le plan
Le chapitre décrit les séquences de membres et les variations d’allure. Les activités pédagogiques proposées sont d’abord des observations, schémas et quiz de reconnaissance.
### Propositions de fiches originales
- Reconnaître les quatre temps du pas
- Comparer le rythme du trot et du galop
- Schémas des séquences de membres
- Associer les termes aux variations d’allure
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 8
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 09 — 9. The Initial Training of the Ridden Horse
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_09.html` / chapitre 9.
**Synthèse thématique :** Éducation initiale du cheval monté : manipulation précoce, étapes de formation, ajustement de la sellerie et du bridon, conduite en main, longe et longues rênes, débourrage, mise en selle, aides, contrôle, galop, immobilité monté et habituation aux objets inhabituels, circulation et réactions de peur.
### Sous-sections extraites de l’EPUB
- Early handling
- The stages of initial training
- Tack (see also page 128)
  - Fitting the tack
    - To fit a lunge cavesson
    - To fit a bridle
    - To fit a roller
    - To fit a saddle
- Leading in hand
  - The foal
  - The young horse
    - Assistance
    - Technique
- Lungeing and long reining
  - Long reining
    - The stages
- Backing
  - Timing
  - Equipment
  - Assistance
  - The stages
- Riding on the lead and lunge
  - Equipment
  - Introducing the aids
  - Control by the rider
  - Cantering
  - Standing still when mounted
  - Acceptance of strange/unusual objects
    - Traffic
    - Shying
- Summary

### Vocabulaire à indexer
manipulation, longues rênes, débourrage/backing, bridon, caveçon de longe, surfaix, mise en selle, désensibilisation/habituation.

### Exercices ou contenus pratiques explicitement signalés par le plan
Les procédures nommées dans les rubriques incluent l’ajustement du caveçon, du bridon, du surfaix et de la selle ; conduite du jeune cheval ; longues rênes ; étapes du backing ; introduction des aides ; immobilité monté ; exposition à des objets inhabituels et circulation. Réservé aux personnes compétentes.
### Propositions de fiches originales
- Carte des étapes de formation initiale
- Checklist éditoriale d’ajustement du matériel (sans remplacer un professionnel)
- Comprendre longues rênes et conduite en main
- Fiche d’observation de la réaction à un objet inhabituel
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 9
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 10 — 10. Lungeing the Horse
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_10.html` / chapitre 10.
**Synthèse thématique :** Travail à la longe du cheval : équipement et aire, rôle et position du longeur, aides de longe, travail du cheval novice, arrêt, programme et étapes, rectitude, variations d’allure, travail sur barres, barres surélevées, saut en longe et travail avancé.
### Sous-sections extraites de l’EPUB
- Equipment
  - The lungeing area (see also page 58)
  - Tack
- Lungeing technique
  - The trainer
  - The lunger’s position
  - The lungeing aids
- Work on the lunge
  - The novice horse
    - Assistance
    - The halt
  - The schedule
    - The stages
  - Straightness on the lunge
  - Variations of gait and gaits
  - Backing (see also Chapter 9)
- Lungeing over obstacles
  - Lungeing over poles
    - Lungeing over raised poles
  - Lungeing over a fence
- More advanced work on the lunge

### Vocabulaire à indexer
longeur, cercle de longe, rectitude, caveçon, aides de longe, barres au sol, barres surélevées.

### Exercices ou contenus pratiques explicitement signalés par le plan
Rubriques de travail explicitement nommées : halt/arrêt, progression par étapes, rectitude, variations d’allure, barres au sol, barres surélevées et franchissement d’un obstacle en longe. Ces fiches sont destinées à l’étude et à la préparation avec un professionnel.
### Propositions de fiches originales
- Matériel et espace de longe : fiche de vérification
- Observer la rectitude sur le cercle
- Différencier barres au sol et barres surélevées
- Suivre la progression d’une séance de longe
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 10
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 11 — 11. The Scales of Training
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_11.html` / chapitre 11.
**Synthèse thématique :** Échelles de progression de l’entraînement : rythme, souplesse, contact, impulsion, rectitude et rassembler ; finalité et liens entre ces qualités.
### Sous-sections extraites de l’EPUB
- Rhythm
- Suppleness
- Contact
- Impulsion
- Straightness
- Collection
- Summary

### Vocabulaire à indexer
échelles de progression, rythme, souplesse, contact, impulsion, rectitude, rassembler.

### Exercices ou contenus pratiques explicitement signalés par le plan
Le chapitre est organisé autour des six notions, chacune avec sa rubrique. Les fiches proposées relient chaque notion à des observations et à des questions de compréhension, sans créer de tests de diagnostic.
### Propositions de fiches originales
- Une fiche par notion des échelles de progression
- Relier les six notions sans les isoler
- Journal d’observation du travail du cheval
- Quiz de vocabulaire et de compréhension
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 11
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 12 — 12. Training Principles for Ridden Work
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_12.html` / chapitre 12.
**Synthèse thématique :** Principes généraux du travail monté, qualités du cavalier/entraîneur, échauffement et retour au calme.
### Sous-sections extraites de l’EPUB
- General principles
- Qualities of the trainer/rider
- Warming up and cooling down
  - Warming up
  - Cooling down

### Vocabulaire à indexer
échauffement, retour au calme, qualités du cavalier/entraîneur, principes d’entraînement.

### Exercices ou contenus pratiques explicitement signalés par le plan
Les rubriques comprennent des sections dédiées à l’échauffement et au retour au calme. Les séquences précises doivent être reprises après lecture du texte intégral et validation.
### Propositions de fiches originales
- Avant/pendant/après la séance : fiche d’observation
- Comprendre les objectifs de l’échauffement
- Comprendre les objectifs du retour au calme
- Bilan de disponibilité du cheval
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 12
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 13 — 13. Preparatory Training of the Ridden Horse
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_13.html` / chapitre 13.
**Synthèse thématique :** Préparation du cheval monté : travail sur le plat, figures, allures, transitions et mouvements (demi-arrêt et arrêt), exercices de gymnastique à l’obstacle et sorties.
### Sous-sections extraites de l’EPUB
- Work on the flat
  - The figures
  - The gaits
  - The transitions
  - Movements
    - The half-halt (see also page 102)
    - The halt (see also page 103)
- Gymnastic jumping exercises
- Riding out

### Vocabulaire à indexer
figures, transitions, demi-arrêt, arrêt, gymnastique à l’obstacle, rectitude, courbes.

### Exercices ou contenus pratiques explicitement signalés par le plan
Rubriques explicitement présentes : figures, allures, transitions, demi-arrêt, arrêt, gymnastique à l’obstacle et sorties. Le texte introductif décrit des objectifs de régularité, calme, réponse aux aides, équilibre et rectitude.
### Propositions de fiches originales
- Répertoire illustré des figures du manège
- Carte des transitions et objectifs
- Journal d’observation de la régularité
- Préparer une séance de travail sur le plat
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 13
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 14 — 14. General Principles of Training the Dressage Horse
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_14.html` / chapitre 14.
**Synthèse thématique :** Principes généraux du dressage : démarrage du jeune cheval, longe, débourrage, premières séances montées, étapes liées aux chevaux de quatre, cinq et six ans, travail plus avancé, piaffer, passage et progrès au galop.
### Sous-sections extraites de l’EPUB
- Starting the young horse
  - Lungeing
  - Backing
  - Early ridden work
- The 4-year-old
- The 5-year-old
- The 6-year-old
- More advanced work
  - Piaffe and passage
  - Advances in canter

### Vocabulaire à indexer
dressage, débourrage, travail précoce monté, piaffer, passage, développement selon l’âge.

### Exercices ou contenus pratiques explicitement signalés par le plan
Les sections de travail avancé nomment le piaffer, le passage et les progrès au galop. Les âges correspondent à l’organisation du chapitre, pas à une prescription universelle applicable à chaque cheval.
### Propositions de fiches originales
- Comprendre les étapes de formation présentées par le manuel
- Distinguer progression générale et calendrier individuel
- Glossaire du piaffer et du passage
- Relier le dressage aux échelles de progression
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 14
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 15 — 15. Intermediate Training of the Ridden Horse
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_15.html` / chapitre 15.
**Synthèse thématique :** Travail intermédiaire : rassembler et ses bénéfices, figures, transitions, arrêt, reculer, contre-galop, changements de pied simples et en l’air, travail latéral : tourner autour des épaules, cession à la jambe, épaule en dedans, travers/renvers, appuyer, demi-pirouette au pas ; introduction du double bridon.
### Sous-sections extraites de l’EPUB
- Collection
  - Benefits of collection
  - To collect
- General work on the flat
  - The figures
  - Transitions
    - Aims
  - The halt (see also page 103)
    - Aims
    - Execution
  - The rein-back
    - Aims
    - Execution
    - The stages
    - The rider
  - The counter-canter
    - Aims
    - Execution
    - Benefits
    - The rider
  - Change of leg
    - Simple change
    - The flying change of leg
    - Alternative situations in which to ask for a change
- Lateral work
  - The turn on the forehand
    - The rider
  - Leg yielding
    - Execution
    - The rider
  - Shoulder-in
    - Benefits
    - Aims
    - Execution
    - The rider
  - The travers and renvers
    - Benefits
    - Execution
    - The rider
  - The half-pass
    - Aims
    - Execution
    - The rider
  - Half-pirouette at the walk
    - Aims
    - Execution
- Introducing the double bridle
- Summary

### Vocabulaire à indexer
rassembler, reculer, contre-galop, changement de pied, cession à la jambe, épaule en dedans, travers, renvers, appuyer, demi-pirouette, double bridon.

### Exercices ou contenus pratiques explicitement signalés par le plan
Les mouvements et rubriques « aims/execution/rider » sont explicitement présents. Ces contenus avancés doivent être traités comme des fiches de compréhension, avec niveau requis et supervision.
### Propositions de fiches originales
- Dictionnaire illustré des mouvements latéraux
- Comparer changement de pied simple et en l’air
- Comprendre le but du reculer
- Fiche de compréhension du rassembler
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 15
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 16 — 16. Advanced Training on the Flat
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_16.html` / chapitre 16.
**Synthèse thématique :** Travail avancé sur le plat : prérequis et installations, figures, cercles, serpentines, transitions, changements de main en zigzag, changements de pied en série, pirouette au galop, piaffer, passage et concours de dressage.
### Sous-sections extraites de l’EPUB
- Prerequisites and facilities
- General school work
  - The gaits
  - Circles
    - Aims
  - Serpentines
    - Aims
  - Transitions
    - Later:
    - Later:
- Advancing the lateral work
  - Counter change of hand (zigzag)
    - To execute at the trot
    - To execute at the canter
    - Aims
- Advanced exercises
  - Flying changes in series
    - Execution
    - Aims
  - Canter pirouette
    - Aims
    - The rider
    - Execution
    - Various methods
  - Piaffe
    - Aims
    - The rider
    - Execution
  - Passage
    - Aims
    - Execution
    - Variations of passage
- Dressage competitions

### Vocabulaire à indexer
serpentine, changement de main, zigzag, changements de pied en série, pirouette au galop, piaffer, passage, reprise.

### Exercices ou contenus pratiques explicitement signalés par le plan
Les sections avancées nomment l’exécution, les objectifs et parfois le rôle du cavalier. À présenter sans suggérer que les mouvements peuvent être appris en autonomie sans encadrement.
### Propositions de fiches originales
- Glossaire illustré des exercices avancés
- Comprendre les prérequis avant une séance spécialisée
- Préparer l’observation d’une reprise de dressage
- Comparer les objectifs des figures
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 16
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 17 — 17. Training the Horse to Jump
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_17.html` / chapitre 17.
**Synthèse thématique :** Formation du cheval à l’obstacle : technique de saut, programme, petits obstacles en longe, travail en liberté, saut avec cavalier, barres au trot, introduction des obstacles, types de fences, galop, variation des distances et obstacles, parcours, vitesse et résolution de problèmes (refus, précipitation, appel trop près, dos creux).
### Sous-sections extraites de l’EPUB
- The horse’s jumping technique
- The training programme
  - Lungeing over small obstacles
  - Loose-schooling over obstacles
    - Requirements
    - Technique
  - Jumping with a rider
    - General principles
    - Method of riding
  - The stages of training
    - Trotting poles
    - Introducing obstacles
    - Types of obstacle
    - Cantering
    - Changing the distances
    - Varying the fences
    - Courses
    - Jumping at speed
- Solving jumping problems
  - Refusing
  - Rushing
    - To correct
  - Taking off too close
    - To correct
  - Jumping with a hollow back
    - To correct
  - Familiarisation

### Vocabulaire à indexer
technique de saut, travail en liberté, barres au trot, abord, foulées, refus, précipitation, distance d’appel.

### Exercices ou contenus pratiques explicitement signalés par le plan
Rubriques d’exercices explicitement nommées : longe sur petits obstacles, travail en liberté, barres au trot, introduction progressive des obstacles, variations de distances et de types, parcours. Les fiches sur les problèmes doivent privilégier observation et recours à l’entraîneur.
### Propositions de fiches originales
- Comprendre les phases d’un saut
- Observer l’abord sans prescrire une correction automatique
- Glossaire des problèmes à l’obstacle cités
- Préparer une fiche de retour avec le moniteur
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 17
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Chapitre 18 — 18 . Cross-country Riding
**Référence source stable :** EPUB / `OPS/9781905693498_chapter_18.html` / chapitre 18.
**Synthèse thématique :** Cross : galop et position de galop, saut de cross, préparation, entraînement par intervalles, programme, travail au galop du cheval de concours complet, évaluation de la condition physique, fréquence cardiaque et respiratoire, sensations, départ/arrivée et équipement de sécurité.
### Sous-sections extraites de l’EPUB
- Galloping and the galloping seat
- Cross-country jumping
- Schooling and preparation
  - Interval training
    - Principles
    - Use
    - The programme
  - Notes on canter work for the event horse
  - Evaluating fitness
    - Heart and respiration rates
  - Feel
  - Conversion Table
- The start and finish
- Safety equipment
- Summary

### Vocabulaire à indexer
cross-country, siège de galop, entraînement par intervalles, fréquence cardiaque, fréquence respiratoire, concours complet.

### Exercices ou contenus pratiques explicitement signalés par le plan
Les rubriques nomment le travail par intervalles, l’évaluation de la condition physique, les paramètres cardiorespiratoires, le départ/arrivée et l’équipement de sécurité. Niveau avancé : aucune séance de cross autonome ne doit être encouragée.
### Propositions de fiches originales
- Comprendre les exigences spécifiques du cross
- Fiche de préparation et équipement
- Journal d’observation de la récupération (sans diagnostic)
- Vocabulaire du concours complet
### Métadonnées recommandées pour les fiches de ce chapitre
- `source_chapter`: 18
- `source_section`: titre exact de la sous-section pertinente
- `content_status`: `draft` / `reviewed` / `published`
- `difficulty`: à valider éditorialement
- `practical_risk`: `low` / `supervised` / `advanced_supervised` après revue qualifiée
- `content_origin`: `source_summary` / `original_learning_aid` / `safety_addendum`

## Index transversal de vocabulaire (première version)
- Aides naturelles
- Aides artificielles
- Assiette
- Équilibre
- Pas
- Trot
- Trot assis
- Trot enlevé
- Galop
- Galop à droite/gauche
- Rythme
- Souplesse
- Contact
- Impulsion
- Rectitude
- Rassembler
- Transition montante
- Transition descendante
- Demi-arrêt
- Arrêt
- Cercle
- Serpentine
- Contre-galop
- Reculer
- Cession à la jambe
- Épaule en dedans
- Travers
- Renvers
- Appuyer
- Demi-pirouette
- Piaffer
- Passage
- Barres au sol
- Grille
- Double
- Cross-country
- Longues rênes
- Longe
- Caveçon de longe
- Surfaix
- Débourrage
- Siège en équilibre

## Schéma de données local recommandé
```json
{
  "id": "stable-uuid",
  "title": "Titre de fiche",
  "source": {"book": "The BHS Complete Manual of Equitation", "edition": 2011, "chapter": 6, "section": "The Theory of the Aids"},
  "content_origin": "original_learning_aid",
  "summary": "Résumé original",
  "learning_objectives": [],
  "prerequisites": [],
  "sections": [{"heading": "Comprendre", "body": "..."}],
  "vocabulary": [],
  "exercise_refs": [],
  "quiz_ids": [],
  "safety_notes": [],
  "difficulty": "beginner",
  "review_status": "draft",
  "reviewed_by": null,
  "version": 1
}
```

## Limites avant génération du prompt Codex
1. Faire une relecture chapitre par chapitre du corps complet pour confirmer les descriptions détaillées et les renvois internes.
2. Relever les numéros de pages imprimées uniquement lorsque ceux-ci sont lisibles et fiables dans l’édition ; garder chapitre + sous-section comme identifiant primaire.
3. Faire relire les consignes pratiques par un moniteur qualifié ; les sujets de santé par un vétérinaire.
4. Vérifier les droits de reproduction : le fichier EPUB possédé ne confère pas automatiquement un droit de redistribution. Préférer des résumés et illustrations originaux.
5. Les fiches avancées (jeune cheval, longe, saut, cross, dressage avancé) sont des supports de compréhension et de préparation, pas des instructions d’entraînement autonome.
