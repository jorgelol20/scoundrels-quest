import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SoundProvider from './context/SettingsProvider.jsx'
import App from './App.jsx'
import MatchProvider from './context/MatchProvider.jsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      
      <SoundProvider>
        <MatchProvider>
          <App />
        </MatchProvider>
      </SoundProvider>
    </QueryClientProvider>
  </StrictMode>,
)
