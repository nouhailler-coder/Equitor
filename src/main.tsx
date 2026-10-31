import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initUpdateManager } from './pwa/updateManager';
import { initTheme, applyTheme } from './app/theme';
import { db, requestPersistentStorage } from './services/storage/db';
import { toast } from './services/feedback/toast';
// Importé tôt pour capter l'événement `beforeinstallprompt`, émis une seule fois.
import './hooks/usePWAInstall';

initTheme();
initUpdateManager();

db.open()
  .then(async () => {
    // Le thème enregistré (y compris après une restauration) prime sur le miroir local.
    const s = await db.settings.get('app');
    if (s?.theme) applyTheme(s.theme);
    // Application installée : on demande que les données ne soient jamais purgées
    // (accordé sans question par Chrome/Edge ; sinon bouton dans « Mes données »).
    if (window.matchMedia('(display-mode: standalone)').matches) void requestPersistentStorage();
  })
  .catch(() => {
    toast('Le stockage local est indisponible (navigation privée ?) : vos données ne pourront pas être enregistrées.', 'erreur', 8000);
  });

createRoot(document.getElementById('root')!).render(<App />);
