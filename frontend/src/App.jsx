import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import store from './store/store'
import { fetchCurrentUser } from './store/authSlice'
import PrivateRoute from './components/common/PrivateRoute'
import AdminRoute from './components/common/AdminRoute'

// ─── Lazy Loaded Pages (flat pages/ folder) ───────────────────────────────────

const Login           = lazy(() => import('./pages/Login'))
const Register        = lazy(() => import('./pages/Register'))
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'))
const UserDashboard   = lazy(() => import('./pages/UserDashboard'))
const ConflictList    = lazy(() => import('./pages/ConflictList'))
const ConflictDetail  = lazy(() => import('./pages/ConflictDetail'))
const ConflictCompare = lazy(() => import('./pages/ConflictCompare'))
const Analytics       = lazy(() => import('./pages/Analytics'))
const AdminConflicts  = lazy(() => import('./pages/AdminConflicts'))
const AdminUsers      = lazy(() => import('./pages/AdminUsers'))
const Profile         = lazy(() => import('./pages/Profile'))
const Settings        = lazy(() => import('./pages/Settings'))
const NotFound        = lazy(() => import('./pages/NotFound'))

// ─── Skeleton Fallback ────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1117',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '32px',
    }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: i === 1 ? '48px' : '120px',
            borderRadius: '10px',
            background: 'linear-gradient(90deg, #161B22 25%, #1C2128 50%, #161B22 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            maxWidth: i === 1 ? '300px' : '100%',
          }}
        />
      ))}
    </div>
  )
}

// ─── App Inner (needs Redux context) ─────────────────────────────────────────

function AppInner() {
  const dispatch = useDispatch()
  const { theme } = useSelector((s) => s.ui)

  // Apply dark/light class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  // Auto-login: validate stored token on app load
  useEffect(() => {
    const token = localStorage.getItem('cl_token')
    if (token) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Root redirect ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ── Protected: any authenticated user ── */}
          <Route path="/dashboard"          element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          <Route path="/conflicts"          element={<PrivateRoute><ConflictList /></PrivateRoute>} />
          <Route path="/conflicts/compare"  element={<PrivateRoute><ConflictCompare /></PrivateRoute>} />
          <Route path="/conflicts/:id"      element={<PrivateRoute><ConflictDetail /></PrivateRoute>} />
          <Route path="/analytics"          element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/profile"            element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* ── Admin-only Routes ── */}
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminRoute><AdminDashboard /></AdminRoute></PrivateRoute>} />
          <Route path="/admin/conflicts"  element={<PrivateRoute><AdminRoute><AdminConflicts /></AdminRoute></PrivateRoute>} />
          <Route path="/admin/users"      element={<PrivateRoute><AdminRoute><AdminUsers /></AdminRoute></PrivateRoute>} />
          <Route path="/settings"         element={<PrivateRoute><AdminRoute><Settings /></AdminRoute></PrivateRoute>} />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#161B22',
            color: '#E6EDF3',
            border: '1px solid #30363D',
            borderRadius: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#23D18B', secondary: '#161B22' } },
          error:   { iconTheme: { primary: '#FF4B4B', secondary: '#161B22' } },
        }}
      />
    </BrowserRouter>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <AppInner />
      </HelmetProvider>
    </Provider>
  )
}
