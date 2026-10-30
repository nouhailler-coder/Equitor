import { useSyncExternalStore } from 'react';
import { getUpdateState, subscribeUpdates } from '../pwa/updateManager';

export function useAppUpdate() {
  return useSyncExternalStore(subscribeUpdates, getUpdateState, getUpdateState);
}
