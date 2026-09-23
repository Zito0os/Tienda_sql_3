import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const requestedPath = window.location.pathname.replace(/\/+$/, '') || '/'

if (requestedPath === '/') {
  window.history.replaceState(null, '', '/admin')
}

const AdminDashboard = lazy(() => import('./AdminDashboard.jsx'))
const isAdminRoute = requestedPath === '/' || requestedPath === '/admin'

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
