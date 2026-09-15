import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { supabaseAdmin } from '../config/supabase.js'
import { httpError } from '../middleware/errorHandler.js'

const router = Router()

/**
 * GET /api/wishlist
 * Returns the authenticated user's wishlist with joined product data.
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('wishlists')
      .select('id, product_id, created_at, products(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw httpError(500, error.message)

    const items = (data ?? []).map((row) => ({
      id: row.id,
      product_id: row.product_id,
      created_at: row.created_at,
      product: row.products,
    }))

    res.json({ items })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/wishlist
 * Body: { product_id }
 * Adds a product to the user's wishlist (idempotent).
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { product_id } = req.body ?? {}

    if (!product_id) {
      throw httpError(400, 'product_id is required.')
    }

    // Verify the product exists
    const { data: product, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', product_id)
      .maybeSingle()

    if (prodErr) throw httpError(500, prodErr.message)
    if (!product) throw httpError(404, 'Product not found.')

    // Upsert (unique on user_id + product_id)
    const { data, error } = await supabaseAdmin
      .from('wishlists')
      .upsert(
        { user_id: req.user.id, product_id },
        { onConflict: 'user_id,product_id', ignoreDuplicates: false }
      )
      .select()
      .single()

    if (error) throw httpError(500, error.message)

    res.status(201).json({ item: data })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/wishlist/:productId
 * Removes a product from the user's wishlist.
 */
router.delete('/:productId', requireAuth, async (req, res, next) => {
  try {
    const { productId } = req.params

    const { error } = await supabaseAdmin
      .from('wishlists')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', productId)

    if (error) throw httpError(500, error.message)

    res.json({ message: 'Removed from wishlist.' })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/wishlist
 * Clears the entire wishlist.
 */
router.delete('/', requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('wishlists')
      .delete()
      .eq('user_id', req.user.id)

    if (error) throw httpError(500, error.message)

    res.json({ message: 'Wishlist cleared.' })
  } catch (err) {
    next(err)
  }
})

export default router