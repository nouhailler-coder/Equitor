import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';

/**
 * Requête IndexedDB réactive : le composant est rafraîchi automatiquement dès qu'une
 * table lue par `query` est modifiée, où que ce soit dans l'application.
 */
export function useLive<T>(query: () => Promise<T>, deps: unknown[], initial: T): T {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    const sub = liveQuery(query).subscribe({
      next: setValue,
      error: () => {
        // l'erreur est déjà visible côté écriture ; on garde la dernière valeur connue
      },
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}
