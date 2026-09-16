import { Navigate, Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

const ADMIN_ROLES = new Set(['admin', 'owner'])

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, profile, loading } = useAuth()

  // Still resolving session / profile
  if (loading) return <Loader full />

  // Not signed in → send to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  // Signed in but profile hasn't loaded yet — keep waiting
  if (!profile) return <Loader full />

  // Signed in, but not an admin/owner → Access Denied
  if (!ADMIN_ROLES.has(profile.role)) {
    return (
      <div className="container page">
        <div className="empty-state">
          <div className="empty-state-icon">
            <ShieldAlert size={30} strokeWidth={1.5} />
          </div>
          <h3>Access Denied</h3>
          <p>
            This area is restricted to NEXORA MART administrators. If you
            believe you should have access, please contact the store owner.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 22,
            }}
          >
            <Link to="/" className="btn btn-outline">
              <ArrowLeft size={15} strokeWidth={1.8} />
              Back to Store
            </Link>
            <Link to="/admin/login" className="btn">
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Authorised
  return children
}