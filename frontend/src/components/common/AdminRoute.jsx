import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * Protects admin-only routes.
 * Must be nested inside <PrivateRoute> — assumes user is authenticated.
 * Redirects non-admins to their user dashboard.
 */
export default function AdminRoute({ children }) {
  const { user } = useSelector((s) => s.auth)

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
