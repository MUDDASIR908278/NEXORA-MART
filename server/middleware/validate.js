import { supabaseAnon } from '../config/supabase.js'

/**
 * Verifies the Supabase access token sent in the Authorization header.
 * On success, attaches `req.user` and `req.token` to the request.
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    const { data, error } = await supabaseAnon.auth.getUser(token)

    if (error || !data?.user) {
      return res.status(401).json({ message: 'Invalid or expired token.' })
    }

    req.user = data.user
    req.token = token
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Optional auth — attaches the user if a valid token is present,
 * but never blocks the request.
 */
export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null

    if (token) {
      const { data } = await supabaseAnon.auth.getUser(token)
      if (data?.user) {
        req.user = data.user
        req.token = token
      }
    }
  } catch {
    /* ignore */
  }
  next()
}

/**
 * Requires the authenticated user's profiles.role === 'admin'.
 * Requires a prior requireAuth call.
 */
export async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    const { data: profile, error } = await supabaseAnon
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .maybeSingle()

    if (error) {
      return res.status(500).json({ message: 'Failed to verify admin role.' })
    }

    if (profile?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' })
    }

    next()
  } catch (err) {
    next(err)
  }
}