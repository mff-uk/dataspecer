import { ThemeProvider } from 'next-themes'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './globals.css'
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { I18nextProvider } from "react-i18next"
import { i18nConfig } from './i18n.ts'
import { SortModelsProvider } from './components/sort-models.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute='class'>
      <I18nextProvider i18n={i18nConfig} defaultNS={'default'}>
        <QueryClientProvider client={queryClient}>
          <SortModelsProvider>
            <TooltipProvider>
              <App />
            </TooltipProvider>
          </SortModelsProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
