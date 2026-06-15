import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * Protects routes from unauthenticated users.
 * Redirects to /login with the attempted path saved in state.
 */
export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((s) => s.auth)
  const location = useLocation()

  // While auto-login check is running, show nothing (App.jsx handles skeleton)
  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
