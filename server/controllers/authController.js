import { supabaseAdmin } from '../config/supabase.js'
import { httpError } from '../middleware/errorHandler.js'

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile (creates one on first call).
 */
export async function getMe(req, res, next) {
  try {
    const userId = req.user.id

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw httpError(500, error.message)

    // Auto-create a profile row on first access
    if (!profile) {
      const { data: created, error: createErr } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: req.user.email,
          full_name: req.user.user_metadata?.full_name ?? null,
          role: 'customer',
        })
        .select()
        .single()

      if (createErr) throw httpError(500, createErr.message)
      return res.json({ user: created })
    }

    res.json({ user: profile })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/auth/me
 * Updates editable profile fields.
 */
export async function updateMe(req, res, next) {
  try {
    const { full_name, phone, address } = req.body ?? {}

    const updates = {}
    if (typeof full_name === 'string') updates.full_name = full_name.trim()
    if (typeof phone === 'string') updates.phone = phone.trim()
    if (address && typeof address === 'object') updates.address = address

    if (Object.keys(updates).length === 0) {
      throw httpError(400, 'No valid fields to update.')
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single()

    if (error) throw httpError(500, error.message)

    res.json({ user: data })
  } catch (err) {
    next(err)
  }
}