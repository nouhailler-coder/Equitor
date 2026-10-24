# Sauvegarde Locale, Restauration et Pérennité des Données

L'application **ÉquiProgression** ne transmettant aucune donnée à un serveur cloud, l'utilisateur est le seul propriétaire et garant de ses données.

## 1. Format d'Exportation JSON
L'exportation génère un fichier structuré `equi_progression_sauvegarde_YYYY-MM-DD.json` conforme au schéma TypeScript suivant :

```json
{
  "version": "1.0.0",
  "exportedAt": "2026-10-24T12:00:00.000Z",
  "horses": [ ... ],
  "sessions": [ ... ],
  "progress": [ ... ],
  "quizAttempts": [ ... ],
  "favorites": [ ... ]
}
```

## 2. Procédure de Restauration Sécurisée
1. Sélection du fichier JSON par l'utilisateur.
2. **Contrôle d'intégrité strict** : validation syntaxique JSON, vérification de la présence des tables maîtresses et contrôle de version.
3. **Aperçu avant validation** : affichage du décompte exact d'éléments (nombre de chevaux, nombre de séances, nombre de quiz).
4. **Choix du mode** :
   - *Fusion* (par défaut) : complète la base locale sans supprimer les éléments existants non conflictuels.
   - *Écrasement complet* : remplace intégralement la base locale par la sauvegarde.
5. Notification immédiate du résultat de l'opération.

## 3. Limites et Recommandations
- Les navigateurs mobiles peuvent réinitialiser le stockage IndexedDB si l'espace disque du téléphone est saturé à plus de 90 % ou si l'utilisateur supprime manuellement les données de site.
- Il est fortement recommandé d'effectuer un export mensuel ou après chaque cycle de leçons important.
