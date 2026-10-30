/**
 * Contenu légal centralisé : seule source du texte affiché dans l'avertissement
 * de premier lancement ET dans l'écran « Mentions légales » (rendu par LegalSections).
 *
 * - Modifier un texte : éditer ce fichier uniquement.
 * - Valeur inconnue : laisser PLACEHOLDER, elle est signalée visuellement à l'écran.
 * - Changement important nécessitant une nouvelle acceptation : incrémenter `version`
 *   puis passer `strict: true` dans l'appel à isLegalNoticeAcknowledged (voir legalStorage.ts).
 *
 * Choix volontaires (à ne pas « corriger ») :
 * - Pas de section « Précision de la localisation » : l'application n'utilise aucune
 *   donnée de position (vérifié par scripts/check-legal.ts).
 * - Pas de politique de confidentialité pour l'instant : document distinct à créer
 *   le jour où elle sera demandée (emplacement prévu : `privacyPolicy` ci-dessous).
 * - Pas de clause d'âge minimum.
 */

export const PLACEHOLDER = '[À COMPLÉTER]';

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export const legalPublisher = {
  appName: 'ÉquiProgression',
  publisher: 'Swinux',
  address: 'Canton de Vaud, Suisse',
  email: 'contact@swinux.ch',
  host: 'Cloudflare, Inc. (Cloudflare Pages) — 101 Townsend Street, San Francisco, CA 94107, États-Unis',
  lastUpdated: '30 octobre 2026',
};

const shortWarning = [
  'Cette application est fournie à titre informatif et pratique. Malgré les précautions prises lors de son développement, elle peut contenir des erreurs, des imprécisions ou présenter des limitations techniques.',
  'L’utilisation de cette application se fait sous votre responsabilité. Les informations, résultats, données ou recommandations fournis par l’application ne doivent pas être considérés comme infaillibles.',
  'Pour toute information importante ou décision susceptible d’avoir des conséquences, vérifiez les données auprès de sources fiables et officielles ou auprès d’un professionnel compétent.',
  'En utilisant cette application, vous reconnaissez avoir pris connaissance de cet avertissement.',
];

const liability = [
  'Cette application est proposée à titre informatif, documentaire, éducatif et/ou pratique selon sa finalité. Elle est destinée à fournir à l’utilisateur des informations, données, outils ou fonctionnalités destinés à faciliter son utilisation.',
  'L’éditeur s’efforce de fournir des informations aussi fiables, pertinentes et actualisées que possible. Toutefois, aucune garantie ne peut être donnée quant à l’exactitude, l’exhaustivité, l’actualité ou la pertinence des informations présentées.',
  'Certaines informations peuvent provenir de sources externes ou être générées, calculées ou interprétées automatiquement. Des erreurs, omissions, imprécisions ou incohérences peuvent donc subsister.',
  'L’utilisateur reconnaît utiliser l’application sous sa propre responsabilité et demeure seul responsable de l’utilisation qu’il fait des informations et fonctionnalités proposées.',
  'L’application ne doit pas être considérée comme une source unique ou définitive d’information lorsqu’une décision importante, professionnelle, financière, médicale, juridique, scientifique, géographique ou liée à la sécurité est concernée.',
  'Lorsque cela est nécessaire, l’utilisateur doit vérifier les informations auprès de sources officielles, de documents de référence ou d’un professionnel qualifié.',
  'Malgré les efforts déployés pour assurer le bon fonctionnement de l’application, l’éditeur ne garantit pas que celle-ci sera disponible en permanence, exempte d’erreurs ou compatible avec tous les appareils, systèmes d’exploitation, navigateurs, réseaux ou configurations.',
  'Des interruptions, ralentissements, pertes de connexion, erreurs techniques ou indisponibilités temporaires peuvent notamment survenir.',
  'Les résultats, calculs, estimations, localisations, statistiques, recommandations ou autres données produits par l’application sont fournis à titre indicatif, sauf indication contraire explicite.',
  'L’utilisateur doit apprécier leur pertinence en fonction de son propre contexte et procéder aux vérifications nécessaires avant toute utilisation susceptible d’entraîner des conséquences importantes.',
  'Dans les limites autorisées par la réglementation applicable, l’éditeur ne saurait être tenu responsable des dommages, pertes, préjudices ou conséquences résultant directement ou indirectement de l’utilisation, de l’impossibilité d’utiliser ou de l’interprétation des informations ou fonctionnalités proposées par l’application.',
  'Cette limitation concerne notamment, lorsque cela est applicable, les erreurs ou omissions dans les informations, les dysfonctionnements techniques, les interruptions de service, les pertes de données, les problèmes de connexion, les incompatibilités matérielles ou logicielles et les décisions prises par l’utilisateur sur la base des informations fournies.',
  'Lorsque l’application utilise ou référence des données provenant de sources externes, celles-ci peuvent évoluer, devenir indisponibles ou être modifiées indépendamment de l’éditeur. L’éditeur ne garantit donc pas la disponibilité permanente ni l’exactitude des contenus provenant de ces sources.',
  'Les fonctionnalités, contenus, données et services proposés par l’application peuvent être modifiés, mis à jour, suspendus ou supprimés à tout moment afin d’assurer son évolution et sa maintenance.',
  'L’utilisation de l’application implique que l’utilisateur a pris connaissance du présent avertissement et accepte les conditions d’utilisation applicables à l’application.',
];

const sections: LegalSection[] = [
  {
    id: 'avertissement',
    title: 'Avertissement',
    paragraphs: shortWarning,
  },
  {
    id: 'limitation',
    title: 'Limitation de responsabilité',
    paragraphs: liability,
  },
  {
    id: 'utilisation',
    title: 'Utilisation de l’application',
    paragraphs: [
      'ÉquiProgression est un outil d’aide à l’apprentissage théorique et au suivi personnel de la pratique équestre. Les fiches, schémas, quiz et checklists sont des supports de réflexion et de révision.',
      'L’équitation est une activité comportant des risques inhérents. L’application ne remplace en aucun cas l’enseignement direct d’un moniteur ou instructeur diplômé, ni l’avis d’un vétérinaire, d’un maréchal-ferrant ou de tout autre professionnel des équidés. Les exercices avancés (longe, saut, cross, jeune cheval, mouvements latéraux) ne doivent être pratiqués que sous encadrement qualifié.',
    ],
  },
  {
    id: 'exactitude',
    title: 'Exactitude des informations',
    paragraphs: [
      'Les contenus pédagogiques sont des synthèses originales rédigées avec soin, mais ils peuvent comporter des simplifications, des erreurs ou des omissions, et les pratiques équestres varient selon les écoles, les fédérations et les chevaux.',
      'L’éditeur n’est pas responsable des informations, fiches et données fournies dans l’application ni de l’usage qui en est fait. En cas de doute, référez-vous aux ouvrages de référence, à votre fédération ou à un professionnel qualifié.',
    ],
  },
  {
    id: 'disponibilite',
    title: 'Dysfonctionnements et disponibilité',
    paragraphs: [
      'L’application fonctionne hors ligne grâce au cache de votre navigateur. Son bon fonctionnement dépend de votre appareil, de votre navigateur et de l’espace de stockage disponible ; le navigateur peut effacer ce cache ou ces données sans préavis.',
      'Les mises à jour sont téléchargées automatiquement lorsque l’appareil est connecté. Une mise à jour peut modifier ou retirer des fonctionnalités.',
    ],
  },
  {
    id: 'donnees',
    title: 'Données et résultats',
    paragraphs: [
      'Les données que vous saisissez (chevaux, séances, notes, progression, résultats de quiz, favoris) sont enregistrées uniquement sur votre appareil. Elles ne sont ni transmises ni sauvegardées par l’éditeur, qui n’y a pas accès.',
      'Vous êtes seul responsable de l’exactitude des données que vous saisissez et de leur conservation. L’éditeur ne saurait être tenu responsable de leur perte (effacement du navigateur, changement d’appareil, panne). Utilisez régulièrement la fonction « Sauvegarde & restauration » pour en conserver une copie.',
      'Les statistiques, taux de réussite et indicateurs de progression sont calculés automatiquement et fournis à titre indicatif.',
    ],
  },
  {
    id: 'sources',
    title: 'Sources externes',
    paragraphs: [
      'Les contenus s’inspirent des principes généralement admis de l’équitation classique. Aucun extrait d’ouvrage protégé par le droit d’auteur n’est reproduit ; les éventuelles références externes restent la propriété de leurs auteurs et peuvent évoluer indépendamment de l’éditeur.',
    ],
  },
  {
    id: 'evolution',
    title: 'Évolution de l’application',
    paragraphs: [
      'L’éditeur peut faire évoluer l’application, ses contenus et les présentes mentions à tout moment. La date de dernière mise à jour figure en bas de cette page.',
    ],
  },
];

export const legalNotice = {
  title: '⚠️ Information importante',
  shortWarning,
  liability,
  sections,
  /** Section GPS volontairement absente : l'application n'utilise pas la localisation. */
  gpsWarning: null as LegalSection | null,
  /** Emplacement réservé : politique de confidentialité (document distinct, non créée). */
  privacyPolicy: null as LegalSection[] | null,
  version: '1.0',
};
