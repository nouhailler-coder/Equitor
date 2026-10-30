import { registerSW } from 'virtual:pwa-register';

/**
 * Gestionnaire de mises à jour de la PWA.
 *
 * - Vérifie périodiquement (et au retour en ligne / au premier plan) si une nouvelle
 *   version est publiée, en interrogeant le Service Worker et `version.json`.
 * - Le nouveau Service Worker télécharge la version en arrière-plan.
 * - Si les mises à jour automatiques sont actives, la nouvelle version est appliquée
 *   à un moment sûr : au lancement de l'application ou lorsqu'elle passe en arrière-plan,
 *   pour ne jamais interrompre une saisie en cours.
 *
 * Aucune donnée personnelle n'est transmise : seule la ressource statique `version.json`
 * de l'application est téléchargée.
 */

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'downloading'
  | 'ready'
  | 'offline'
  | 'error'
  | 'unsupported';

export interface VersionInfo {
  version: string;
  buildDate: string;
}

export interface UpdateState {
  status: UpdateStatus;
  current: VersionInfo;
  remote: VersionInfo | null;
  lastCheck: string | null;
  autoUpdate: boolean;
  errorMessage: string | null;
}

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 h
const FOREGROUND_RECHECK_MS = 15 * 60 * 1000; // 15 min
const STARTUP_GRACE_MS = 15 * 1000; // appliquer sans attendre juste après le lancement

const LS_LAST_CHECK = 'equi.update.lastCheck';
const LS_AUTO_UPDATE = 'equi.update.auto';

const readLS = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeLS = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // stockage indisponible (navigation privée) : on ignore
  }
};

let state: UpdateState = {
  status: 'idle',
  current: { version: __APP_VERSION__, buildDate: __BUILD_DATE__ },
  remote: null,
  lastCheck: readLS(LS_LAST_CHECK),
  autoUpdate: readLS(LS_AUTO_UPDATE) !== 'false',
  errorMessage: null,
};

const listeners = new Set<() => void>();
const startedAt = Date.now();

let registration: ServiceWorkerRegistration | undefined;
let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
let needRefresh = false;
let initialized = false;

const setState = (patch: Partial<UpdateState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const getUpdateState = () => state;

export const subscribeUpdates = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Active le Service Worker en attente puis recharge la page. workbox-window ne recharge
 * que sur l'événement `controlling` : on recharge nous-mêmes si la page n'était pas contrôlée.
 */
const activateWaiting = async () => {
  if (!updateSW) return;
  const fallback = window.setTimeout(() => window.location.reload(), 3000);
  try {
    await updateSW(true);
  } catch {
    window.clearTimeout(fallback);
    window.location.reload();
  }
};

const applyWhenSafe = () => {
  if (!needRefresh || !state.autoUpdate || !updateSW) return;
  const justLaunched = Date.now() - startedAt < STARTUP_GRACE_MS;
  if (justLaunched || document.visibilityState === 'hidden') {
    void activateWaiting();
  }
};

const trackInstalling = (reg: ServiceWorkerRegistration) => {
  reg.addEventListener('updatefound', () => {
    if (!needRefresh) setState({ status: 'downloading' });
  });
};

const fetchRemoteVersion = async (): Promise<VersionInfo | null> => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<VersionInfo>;
    if (typeof data.version !== 'string' || typeof data.buildDate !== 'string') return null;
    return { version: data.version, buildDate: data.buildDate };
  } catch {
    return null;
  }
};

export const checkForUpdates = async (): Promise<UpdateStatus> => {
  if (state.status === 'checking') return state.status;
  if (!navigator.onLine) {
    setState({ status: needRefresh ? 'ready' : 'offline' });
    return state.status;
  }

  setState({ status: 'checking', errorMessage: null });

  try {
    const [remote] = await Promise.all([fetchRemoteVersion(), registration?.update()]);
    const now = new Date().toISOString();
    writeLS(LS_LAST_CHECK, now);

    let status: UpdateStatus;
    if (needRefresh) {
      status = 'ready';
    } else if (registration?.installing) {
      status = 'downloading';
    } else if (remote && remote.buildDate !== state.current.buildDate) {
      // Nouvelle version publiée : le Service Worker la récupère en arrière-plan.
      status = registration ? 'downloading' : 'up-to-date';
    } else {
      status = 'up-to-date';
    }

    setState({ status, remote: remote ?? state.remote, lastCheck: now });
  } catch (err) {
    setState({
      status: 'error',
      errorMessage: err instanceof Error ? err.message : 'Vérification impossible',
    });
  }
  return state.status;
};

/** Applique immédiatement la version téléchargée (recharge l'application). */
export const applyUpdate = async () => {
  if (needRefresh) await activateWaiting();
};

/**
 * Force la réinstallation complète : désinscrit le Service Worker, vide les caches
 * de l'application puis recharge depuis le réseau. Les données IndexedDB ne sont pas touchées.
 */
export const forceUpdate = async () => {
  if (needRefresh && updateSW) {
    await activateWaiting();
    return;
  }
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
  writeLS(LS_LAST_CHECK, new Date().toISOString());
  window.location.reload();
};

export const setAutoUpdate = (enabled: boolean) => {
  writeLS(LS_AUTO_UPDATE, String(enabled));
  setState({ autoUpdate: enabled });
  if (enabled) applyWhenSafe();
};

export const initUpdateManager = () => {
  if (initialized) return;
  initialized = true;

  if (!('serviceWorker' in navigator)) {
    setState({ status: 'unsupported' });
    return;
  }

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      needRefresh = true;
      setState({ status: 'ready' });
      applyWhenSafe();
    },
    onRegisteredSW(_swUrl, reg) {
      registration = reg;
      if (reg) trackInstalling(reg);
      void checkForUpdates();
    },
    onRegisterError(err) {
      setState({
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Service Worker indisponible',
      });
    },
  });

  window.setInterval(() => {
    if (state.autoUpdate) void checkForUpdates();
  }, CHECK_INTERVAL_MS);

  window.addEventListener('online', () => {
    if (state.autoUpdate) void checkForUpdates();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      applyWhenSafe();
      return;
    }
    const last = state.lastCheck ? Date.parse(state.lastCheck) : 0;
    if (state.autoUpdate && Date.now() - last > FOREGROUND_RECHECK_MS) {
      void checkForUpdates();
    }
  });
};
