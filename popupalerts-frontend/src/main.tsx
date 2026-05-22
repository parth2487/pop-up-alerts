import React from 'react'; // Impor React secara eksplisit
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

// --- PERBAIKAN UTAMA DI SINI: Pastikan baris ini ada dan tidak dikomentari ---
import './index.css';
// ----------------------------------------------------------------------

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

