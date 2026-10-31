/** Retours visuels courts après une action (« toasts »), sans dépendance. */
export type ToastTone = 'succes' | 'erreur' | 'info';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

let toasts: Toast[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const subscribeToasts = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
export const getToasts = () => toasts;

export function toast(message: string, tone: ToastTone = 'succes', durationMs = 2800) {
  const id = ++seq;
  toasts = [...toasts, { id, message, tone }];
  emit();
  setTimeout(() => dismissToast(id), durationMs);
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/**
 * Exécute une écriture en base et signale l'échec à l'utilisateur au lieu de l'ignorer.
 * Retourne `undefined` en cas d'erreur.
 */
export async function safeWrite<T>(action: () => Promise<T>, successMessage?: string): Promise<T | undefined> {
  try {
    const result = await action();
    if (successMessage) toast(successMessage);
    return result;
  } catch (err) {
    const quota = err instanceof Error && /quota/i.test(err.name + err.message);
    toast(
      quota
        ? 'Espace de stockage insuffisant : exportez une sauvegarde puis libérez de l’espace.'
        : 'L’enregistrement a échoué. Réessayez ; si le problème persiste, exportez une sauvegarde.',
      'erreur',
      5000,
    );
    return undefined;
  }
}
