import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
const AdminDashboard = lazy(() => import('./AdminDashboard.jsx'))
const isAdminRoute = normalizedPath === '/admin'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? (
      <Suspense fallback={<div className="route-loader">Cargando panel…</div>}>
        <AdminDashboard />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
