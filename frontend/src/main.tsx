import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

const Landing = React.lazy(() => import('./pages/Landing'))
const HowItWorks = React.lazy(() => import('./pages/HowItWorks'))

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
}

const router = createBrowserRouter([
  { path: '/', element: <React.Suspense fallback={<div />}> <Landing /> </React.Suspense> },
  { path: '/how-it-works', element: <React.Suspense fallback={<div />}> <HowItWorks /> </React.Suspense> },
  { path: '/demo', element: <App /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
