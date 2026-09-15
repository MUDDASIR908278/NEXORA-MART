import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.js'
import { supabaseAdmin } from '../config/supabase.js'
import { httpError } from '../middleware/errorHandler.js'

const router = Router()

/**
 * POST /api/cart/validate
 * Body: { items: [{ product_id, quantity }] }
 * Returns authoritative line items with server-computed prices, stock
 * checks and totals. The client cart is persisted in localStorage; this
 * endpoint is used at cart/checkout time to reconcile prices.
 */
router.post('/validate', optionalAuth, async (req, res, next) => {
  try {
    const { items } = req.body ?? {}

    if (!Array.isArray(items) || items.length === 0) {
      throw httpError(400, 'Cart must contain at least one item.')
    }

    const productIds = items.map((i) => i?.product_id).filter(Boolean)
    if (productIds.length !== items.length) {
      throw httpError(400, 'Each item must include a product_id.')
    }

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, price, image_url, stock')
      .in('id', productIds)

    if (error) throw httpError(500, error.message)

    const map = new Map((products ?? []).map((p) => [p.id, p]))

    let subtotal = 0
    const issues = []

    const lineItems = items.map((item) => {
      const product = map.get(item.product_id)
      const requested = Math.max(1, parseInt(item.quantity, 10) || 1)

      if (!product) {
        issues.push({
          product_id: item.product_id,
          reason: 'not_found',
        })
        return null
      }

      const available = product.stock ?? 0
      const quantity = Math.min(requested, available)

      if (available <= 0) {
        issues.push({
          product_id: product.id,
          name: product.name,
          reason: 'out_of_stock',
        })
      } else if (quantity < requested) {
        issues.push({
          product_id: product.id,
          name: product.name,
          reason: 'quantity_reduced',
          requested,
          available,
        })
      }

      const price = Number(product.price)
      subtotal += price * quantity

      return {
        product_id: product.id,
        name: product.name,
        price,
        image_url: product.image_url,
        stock: available,
        quantity,
      }
    }).filter(Boolean)

    const shipping = subtotal > 0 && subtotal < 100 ? 9.99 : 0
    const tax = Number((subtotal * 0.05).toFixed(2))
    const total = Number((subtotal + shipping + tax).toFixed(2))

    res.json({
      items: lineItems,
      issues,
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      tax,
      total,
      valid: issues.length === 0,
    })
  } catch (err) {
    next(err)
  }
})

export default router