import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ShieldCheck, ArrowLeft, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

export default function AdminLogin() {
  const { signIn, user, profile, loading: authLoading, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [denied, setDenied] = useState(false)

  // If already signed in as admin, bounce straight to /admin
  useEffect(() => {
    if (authLoading) return
    if (!user) return

    const role = profile?.role
    if (role === 'admin' || role === 'owner') {
      navigate('/admin', { replace: true })
    } else if (role) {
      setDenied(true)
    }
    // if role is undefined, wait — profile may still be loading
  }, [user, profile, authLoading, navigate])

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setDenied(false)
    setLoading(true)

    try {
      await signIn({ email: form.email.trim(), password: form.password })

      // Fetch the freshly signed-in user's profile to check role
      const { data } = await api.get('/auth/me')
      const fresh = data?.user ?? data?.profile ?? data
      const role = fresh?.role

      if (role === 'admin' || role === 'owner') {
        // Keep AuthContext in sync so isAdmin flag updates elsewhere
        if (typeof refreshProfile === 'function') {
          await refreshProfile()
        }
        toast.success('Welcome back, admin')
        navigate('/admin', { replace: true })
      } else {
        setDenied(true)
        setError('Access denied. This account does not have admin privileges.')
      }
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap" style={{ maxWidth: 460 }}>
        {/* ============ BACK LINK ============ */}
        <Link
          to="/"
          className="btn-ghost btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 18,
            color: 'var(--text-muted)',
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          Back to store
        </Link>

        {/* ============ HEADER ============ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--r-full)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(232, 180, 160, 0.12)',
              border: '1px solid var(--border-rose)',
              color: 'var(--rose)',
              boxShadow: 'var(--glow-sm)',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={20} strokeWidth={1.6} />
          </div>

          <div>
            <h1
              className="auth-title"
              style={{ marginBottom: 2, fontSize: '1.5rem' }}
            >
              NEXORA<span>MART</span>
            </h1>
            <p
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--rose)',
                fontWeight: 600,
                margin: 0,
              }}
            >
              Admin Panel
            </p>
          </div>
        </div>

        <p
          className="auth-sub"
          style={{ marginTop: 14, marginBottom: 24 }}
        >
          Restricted area. Sign in with your administrator credentials.
        </p>

        {/* ============ ERRORS / ALERTS ============ */}
        {denied && (
          <div
            className="alert"
            style={{
              background: 'rgba(224, 160, 160, 0.12)',
              border: '1px solid rgba(224, 160, 160, 0.4)',
              color: '#f4b8b8',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <AlertTriangle size={16} strokeWidth={1.8} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', marginBottom: 2 }}>
                Access Denied
              </strong>
              <span style={{ fontSize: '0.82rem' }}>
                Your account does not have admin privileges. Contact the site
                owner if you believe this is a mistake.
              </span>
            </div>
          </div>
        )}

        {error && !denied && (
          <div className="alert alert-error">{error}</div>
        )}

        {/* ============ FORM ============ */}
        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                strokeWidth={1.6}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--rose)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="admin-email"
                className="form-input"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="admin@nexoramart.com"
                autoComplete="email"
                required
                style={{ paddingLeft: 44 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                strokeWidth={1.6}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--rose)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="admin-password"
                className="form-input"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{ paddingLeft: 44 }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-lg btn-block"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? (
              'Verifying…'
            ) : (
              <>
                <ShieldCheck size={16} strokeWidth={1.8} />
                Sign In to Admin
              </>
            )}
          </button>
        </form>

        {/* ============ FOOTER ============ */}
        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
          }}
        >
          Authorised personnel only · NEXORA MART
        </div>
      </div>
    </div>
  )
}