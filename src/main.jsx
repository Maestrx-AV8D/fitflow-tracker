// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import App from './App';
import './index.css';
import { supabase } from './lib/supabaseClient';

// initialize your React Query client
const queryClient = new QueryClient();

// Before mounting the app, consume any magic-link tokens in the URL.
// Guard so that on versions without getSessionFromUrl, it silently skips.
if (typeof supabase.auth.getSessionFromUrl === 'function') {
  supabase.auth
    .getSessionFromUrl({ storeSession: true })
    .catch(() => {
      // no-op if it fails or helper isn’t present
    });
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </BrowserRouter>
);