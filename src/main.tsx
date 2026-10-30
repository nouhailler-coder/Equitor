import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initUpdateManager } from './pwa/updateManager';

initUpdateManager();

createRoot(document.getElementById('root')!).render(<App />);
