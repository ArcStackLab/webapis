import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SearchParamProvider } from './providers/SearchParamProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SearchParamProvider>
      <App />
    </SearchParamProvider>
  </StrictMode>
)
