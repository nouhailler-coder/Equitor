import { legalNotice } from './legalContent';

/** Clés localStorage (préférences de l'appareil, aucune donnée personnelle). */
export const LEGAL_ACK_KEY = 'legal_notice_acknowledged';
export const LEGAL_ACK_VERSION_KEY = 'legal_notice_acknowledged_version';

/**
 * Indique si l'avertissement a déjà été accepté sur cet appareil.
 * - Mode non strict (par défaut) : toute acceptation passée suffit, même d'une version antérieure.
 * - Mode strict : exige l'acceptation de la version courante. Pour forcer une nouvelle
 *   acceptation après un changement important, passer `strict: true` dans App.tsx.
 */
export function isLegalNoticeAcknowledged({ strict = false }: { strict?: boolean } = {}): boolean {
  try {
    if (localStorage.getItem(LEGAL_ACK_KEY) !== 'true') return false;
    if (!strict) return true;
    return localStorage.getItem(LEGAL_ACK_VERSION_KEY) === legalNotice.version;
  } catch {
    return false;
  }
}

export function acknowledgeLegalNotice() {
  try {
    localStorage.setItem(LEGAL_ACK_KEY, 'true');
    localStorage.setItem(LEGAL_ACK_VERSION_KEY, legalNotice.version);
  } catch {
    // stockage indisponible : l'avertissement sera simplement réaffiché au prochain lancement
  }
}

/** Réinitialisation — réservée au développement (bouton visible seulement en mode dev). */
export function resetLegalNotice() {
  try {
    localStorage.removeItem(LEGAL_ACK_KEY);
    localStorage.removeItem(LEGAL_ACK_VERSION_KEY);
  } catch {
    // ignore
  }
}
