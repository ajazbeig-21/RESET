import '@fontsource-variable/inter'
import './index.css'
import './utils/installPrompt'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppStoreProvider } from './store/AppStore'
import { ToastProvider } from './components/Toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStoreProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AppStoreProvider>
  </StrictMode>,
)
