import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initPWAAutoReload } from './registerPWA';

// Włącz automatyczne wykrywanie nowych wdrożeń i auto-reload
initPWAAutoReload();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
