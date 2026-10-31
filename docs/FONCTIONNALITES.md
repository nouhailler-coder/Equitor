# ✨ Fonctionnalités — ÉquiProgression 2.0

Chaque fonctionnalité listée ici enregistre réellement ses données et a été testée (voir `TESTS.md`).

## Organisation

| Espace | Contenu |
|---|---|
| 🏠 Accueil | Prochaines compétences recommandées, révisions du jour, reprise de lecture, prochaine séance préparée, dernier journal, favoris |
| 📚 Apprendre | 24 fiches et 18 modules (existants), glossaire, **Mon parcours**, accès aux Ressources |
| 🏋️ Pratiquer | Catalogue d'exercices, préparation des séances, checklists |
| 💡 Réviser | Tableau de révision, session du jour, découverte, cartes mémoire |
| 📈 Ma progression | Tableau de bord, profil, diagnostic, référentiel de compétences, objectifs, données & PDF |
| 📓 Mon journal | Séances, chevaux, analyse |
| 🗂️ Ressources | Dictionnaire, atlas, matériel, manège, comportement |

Navigation : barre du bas sur mobile, barre latérale sur ordinateur, menu ☰, recherche globale, bouton retour Android.

## Module 1 — Parcours personnalisé
- **Profil** : prénom (facultatif), niveau (débutant / intermédiaire / confirmé — indicatif, non certifiant), expérience, objectifs, domaines d'intérêt, auto-évaluation théorique, compétences à améliorer.
- **Diagnostic** : 26 questions couvrant les 13 domaines ; résultats par domaine, acquis, lacunes, parcours proposé ; recommençable ; comparaison avec la maîtrise actuelle.
- **Référentiel** : 47 compétences, 13 domaines, chacune avec identifiant, description, niveau, prérequis, fiches et exercices associés, état, indice et historique d'évaluations.
- **États** : non commencé · en cours d'apprentissage · à réviser · en consolidation · maîtrisé. La lecture d'une fiche ne dépasse jamais « en cours » ; « maîtrisé » exige ≥ 3 évaluations réussies sur ≥ 2 jours.
- **Recommandations** : prérequis acquis, niveau du profil (+1), lacunes du diagnostic, intérêts, compétences fragiles d'abord.

## Module 2 — Journal et chevaux
- Séance : date, durée, type (dressage, obstacle, travail à pied, extérieur, mise en confiance, théorie, travail général), discipline, cheval (enregistré ou nom libre), objectifs, exercices, difficultés, points positifs, à améliorer, ressenti (1–5), décontraction observée, observations, commentaires, notes, compétences travaillées, lien avec un programme.
- Création, modification, suppression confirmée, ordre chronologique, recherche, filtres (dates, type, discipline, cheval, favoris), favoris, export PDF.
- Chevaux : nom, photo facultative (réduite, stockée localement), surnom, sexe, race, robe, année de naissance facultative, description, particularités, notes ; historique (séances, exercices, observations, ressenti, objectifs) ; suppression sans perte des séances.
- Analyse : nombre, durée totale et moyenne, fréquence sur 12 semaines, répartition par type et discipline, évolution du ressenti et des objectifs, compétences travaillées.

## Module 3 — Exercices interactifs
- 29 exercices (dont un de cartes mémoire) + 12 quiz de fiches, **144 questions**, 10 types : QCM, vrai/faux, associations, classement, identification sur image, texte à compléter, question ouverte (correction indicative et auto-évaluation), reconnaissance de notion, situation pédagogique, carte mémoire.
- Après chaque réponse : correct/partiel/incorrect, explication, erreur fréquente, ressource complémentaire (fiche, terme, atlas, matériel, manège, comportement).
- Historique : date, score, réponses, durée, erreurs, n° de tentative, courbe d'évolution, meilleur score dans le catalogue ; recommencer à volonté.
- Ajouter un exercice : un objet dans `src/data/exercises.ts`, sans toucher au moteur.

## Module 4 — Dictionnaire
108 termes (13 catégories) : définition courte, explication, exemple, catégorie, niveau, termes associés, fiches liées, illustration. Recherche instantanée tolérante, ordre alphabétique, filtres, favoris, historique, note personnelle. Dans les fiches, les termes sont **cliquables** : définition rapide, notions associées et recherche intégrée sans quitter la page.

## Module 5 — Préparation des séances
8 modèles (découverte du cheval, avant une séance, révision, position, transitions, dressage, obstacle, travail à pied) ou page blanche : objectif, date, cheval, discipline, compétences, fiches, exercices, notes. Bilan (objectifs atteints, difficultés, questions pour l'enseignant, notions à revoir, prochain objectif) relié au journal. Programmes avancés signalés « à valider avec l'enseignant ». Export PDF.

## Module 6 — Révisions intelligentes
Intervalles 1, 3, 7, 14, 30 jours puis × facilité (1,3 – 3). Oublié : retour à zéro, revu le jour même ; difficile : intervalle réduit ; facile : saut d'étape. Crédit partiel des retards réussis, oublis répétés = retours plus fréquents. Tableau : du jour, en retard, maîtrisées, fragiles, à découvrir. 42 cartes recto-verso (retourner, noter, suivante, recommencer, historique par carte, export PDF). Toute question d'exercice répondue entre dans les révisions.

## Module 7 — Atlas anatomique
5 vues originales (profil, face, arrière, tête, membres), 40 régions sélectionnables (souris, toucher, clavier) : nom, explication, fonction générale, terme et fiches liés, favoris, quiz d'identification. Mention « schéma pédagogique simplifié ».

## Module 8 — Atelier du matériel
10 éléments (selle, filet, mors, rênes, étriers, sangle, protections, licol, pansage, équipement du cavalier) : description, fonction, parties, utilisation, vérifications de sécurité, entretien, erreurs fréquentes, termes, fiches, exercice ; schémas cliquables de la selle et du filet. Aucun réglage personnalisé.

## Module 9 — Manège interactif
Carrière 20 × 40 m : lettres cliquables, ligne du milieu, lignes du quart. 9 figures (ligne droite, tour de piste, cercle, volte, demi-volte, diagonale, serpentine, doubler, transitions) avec tracé animé (pause possible, respect de « réduire les animations »), description, objectif, notions, niveau.

## Module 10 — Comportement
17 comportements, 10 thèmes, illustrations paramétriques originales ; description, interprétations possibles, contextes, vigilance, précautions, et quand consulter un professionnel. Avertissement systématique : un signal isolé ne permet pas de conclure.

## Module 11 — Checklists
3 listes par défaut (avant la séance, préparation du cheval, après la séance), modifiables : renommer, ajouter, supprimer, réordonner, marquer « essentiel », créer, supprimer, restaurer. Enregistrées en IndexedDB et incluses dans la sauvegarde.

## Module 12 — Statistiques
Fiches consultées, exercices, taux de réussite, temps d'apprentissage (lecture + exercices), série de jours, jours actifs, compétences par état, maîtrise par domaine, évolution des scores, calendrier d'activité, objectifs hebdomadaires/quotidiens modifiables, comparaison diagnostic / aujourd'hui, bilan PDF. **Aucune valeur artificielle** : sans données, tout vaut zéro.

## Transversal
- **Recherche globale** : fiches, modules, dictionnaire, exercices, compétences, ressources, journal, chevaux, programmes ; favoris en tête ; accents et fautes tolérés ; catégories ; suggestions ; historique.
- **Favoris et notes** : fiches, termes, exercices, séances, figures, matériel, comportements, régions anatomiques ; notes personnelles sur fiches et termes.
- **Sauvegarde** : voir `SAUVEGARDE_RESTAURATION.md`.
- **Mode sombre** : clair / sombre / automatique (Paramètres système), mémorisé.
- **Accessibilité** : lien d'évitement, focus visible, navigation clavier, modales avec piège de focus et Échap (fenêtre du dessus seulement), libellés et textes alternatifs, graphiques doublés d'un tableau pour lecteurs d'écran, cibles tactiles ≥ 44 px.
- **Retours visuels** : messages après chaque enregistrement, messages d'erreur explicites (dont espace insuffisant), écran de secours en cas d'erreur.
- **Conservés de la v1.2** : onboarding, mentions légales, aide contextuelle, infobulles, installation guidée, mises à jour automatiques, 24 fiches et schémas.
