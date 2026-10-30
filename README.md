# ÉquiProgression — Application PWA d’Apprentissage et de Pratique Équestre

**ÉquiProgression** est une Progressive Web App (PWA) mobile, 100 % en français, conçue pour l’apprentissage, la révision des connaissances théoriques et le suivi des séances d’équitation à l’écurie et à la maison.

Elle s’appuie sur les principes fondamentaux de l’équitation classique, de la biomécanique équine et des échelles de progression du dressage.

---

## 🔒 Principes Architecturaux Non Négociables

1. **100 % Local & Zéro Cloud** : Aucune base de données distante, aucun compte obligatoire, aucun backend, aucune API d’IA distante.
2. **Stockage sécurisé sur l’appareil** : Toutes les données personnelles (chevaux, journal de séances, favoris, progression, quiz) sont stockées dans le navigateur via **IndexedDB** (Dexie.js).
3. **Fonctionnement Hors Ligne Intégral** : Grâce au Service Worker et au Cache Storage configurés via `vite-plugin-pwa`, l’application reste utilisable à 100 % au fond du manège ou en extérieur sans connexion réseau.
4. **Propriété intellectuelle & Éthique** : Aucun manuel sous droit d'auteur n'est reproduit. Tous les résumés, fiches, illustrations vectorielles SVG et quiz sont des créations originales de synthèse et d’aide à l’étude.
5. **Priorité Sécurité & Bien-être Animal** : Les fiches avancées (débourrage, longe, saut, cross, mouvements latéraux) sont strictement des supports de préparation théorique et affichent des avertissements explicites d’encadrement obligatoire.

---

## 📱 Fonctionnalités Principales

### 1. Accueil
- Reprise immédiate du dernier apprentissage consulté.
- Parcours recommandés (A : Découvrir, B : Consolider, C : Approfondir).
- Statistiques réelles locales (fiches assimilées, séances au journal, chevaux enregistrés).
- Fiches favorites en accès rapide.
- Raccourci vers la préparation de séance d’écurie.

### 2. Bibliothèque Pédagogique
- **Les 18 modules d'apprentissage** présentés avec titres français, résumés, sous-sections et vocabulaire.
- **Catalogue de fiches originales** filtrables par niveau (Débutant, Intermédiaire, Avancé) et thématique (Position, Aides, Allures, Longe, Dressage, Obstacle, Cross, Jeune cheval, Sécurité).
- **Schémas biomécaniques vectoriels SVG** :
  - Alignement vertical de profil (oreille-épaule-hanche-talon)
  - Pyramide des échelles de progression (Rythme, Souplesse, Contact, Impulsion, Rectitude, Rassembler)
  - Carrière et cercle de 20 m
  - Décomposition chronologique des 3 allures
  - Parabole et bascule du saut d’obstacles
  - Angle de 30° de l’épaule en dedans sur 3 pistes
  - Contact élastique vs rêne flottante
- **Glossaire technique équestre** : Définitions claires en français avec variantes et synonymes usuels.

### 3. Mode Écurie & Pratique
- Interface tactile utilisable d’une seule main.
- **Checklists interactives** : Cavalier, matériel & harnachement, sécurité en carrière, soins & récupération.
- **Journal de bord des séances** : Thème, durée, cheval, objectifs, ressenti cavalier (étoiles), décontraction du cheval, réussites, difficultés et objectifs de la prochaine séance.
- **Gestionnaire de chevaux** : Enregistrement local des chevaux (nom, surnom, race, année de naissance, tempérament, notes matérielles).

### 4. Moteur de Quiz & Flashcards
- Questions multi-formats : Choix unique, choix multiples, vrai/faux, situations pratiques.
- Justifications pédagogiques détaillées pour chaque réponse.
- Cartes mémoire (Flashcards) pour réviser le vocabulaire et les principes.

### 5. Espace Suivi & Sauvegarde
- Exportation d'une sauvegarde complète au format **JSON**.
- Restauration avec contrôle de schéma, validation des versions et aperçu avant import (avec option de fusion ou d'écrasement).
- Effacement sécurisé des données locales à la demande.

### 6. Menu & Paramètres système
- **Menu hamburger (☰)** regroupant toutes les fonctionnalités par catégorie : Général, Apprendre, Pratiquer à l’écurie, Réviser, Suivi & données, Aide & informations, Système.
- **Paramètres système** : version installée, date de sortie, date de la dernière vérification, boutons « Vérifier les mises à jour » et « Forcer la mise à jour ».
- **Mises à jour automatiques en arrière-plan** : vérification régulière, téléchargement silencieux et installation au moment opportun (désactivable).

---

## 🛠️ Commandes Utiles

```bash
# Lancer le serveur de développement local
npm run dev

# Compiler l'application pour la production (PWA)
npm run build

# Lancer la suite de tests unitaires et de validation métier
npm run test

# Vérifier les types TypeScript
npm run lint
```

---

## 📂 Documentation Complémentaire

- `docs/architecture.md` : Détail technique du stockage local IndexedDB et du Service Worker PWA.
- `docs/referentiel-pedagogique.md` : Table des 18 modules d’apprentissage classique.
- `docs/droits-auteur.md` : Règles de conformité au droit d’auteur et métadonnées de traçabilité.
- `docs/securite-pedagogique.md` : Classification des risques et avertissements d’encadrement.
- `docs/sauvegarde-locale.md` : Guide d'exportation, de réimportation et de pérennité des données.
