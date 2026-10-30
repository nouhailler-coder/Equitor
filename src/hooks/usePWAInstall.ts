import { useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type InstallPlatform = 'ios' | 'android' | 'desktop';
export type InstallBrowser = 'safari' | 'chrome' | 'edge' | 'firefox' | 'samsung' | 'other';

interface InstallState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
}

// `beforeinstallprompt` n'est émis qu'une fois, souvent avant le montage des composants :
// on le capture au niveau du module (importé dès main.tsx) et on le partage via un store.
let state: InstallState = { deferredPrompt: null, isInstalled: false };
const listeners = new Set<() => void>();

const setState = (patch: Partial<InstallState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => state;

const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
const isIOSDevice =
  /iphone|ipad|ipod/.test(ua) ||
  (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const platform: InstallPlatform = isIOSDevice ? 'ios' : /android/.test(ua) ? 'android' : 'desktop';
const browser: InstallBrowser = /samsungbrowser/.test(ua)
  ? 'samsung'
  : /edg\//.test(ua)
    ? 'edge'
    : /firefox|fxios/.test(ua)
      ? 'firefox'
      : /crios|chrome/.test(ua)
        ? 'chrome'
        : /safari/.test(ua)
          ? 'safari'
          : 'other';

if (typeof window !== 'undefined') {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  state = { ...state, isInstalled: standalone };

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    setState({ deferredPrompt: e as BeforeInstallPromptEvent });
  });
  window.addEventListener('appinstalled', () => {
    setState({ isInstalled: true, deferredPrompt: null });
  });
}

export function usePWAInstall() {
  const { deferredPrompt, isInstalled } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setState({ isInstalled: true, deferredPrompt: null });
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS: platform === 'ios',
    platform,
    browser,
    install,
  };
}
