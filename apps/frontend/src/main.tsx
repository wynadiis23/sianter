import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { App } from './App'
import './style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  </StrictMode>,
)

if (import.meta.env.DEV) {
  import('react').then((React) =>
    import('react-dom').then((ReactDOM) =>
      import('@axe-core/react').then(({ default: axe }) => {
        axe(React, ReactDOM, 1000)
      }),
    ),
  )
}
