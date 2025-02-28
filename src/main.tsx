import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

const manifestUrl = `${import.meta.env.VITE_APP_URL}/tonconnect-manifest.json`;
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
    </TonConnectUIProvider>
  </StrictMode>,
)
