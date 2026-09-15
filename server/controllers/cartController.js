import { supabaseAdmin } from '../config/supabase.js'
import { httpError } from '../middleware/errorHandler.js'

/**
 * POST /api/cart/validate
 * Body: { items: [{ product_id, quantity }] }
 *
 * Reconciles a client-side cart against the products table: verifies
 * each product exists, clamps quantities to available stock, recomputes
 * subtotal / shipping / tax / total server-side, and reports issues.
 */
export async function validateCart(req, res, next) {
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

    const lineItems = items
      .map((item) => {
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
      })
      .filter(Boolean)

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
}

/**
 * POST /api/cart/merge
 * Body: { items: [{ product_id, quantity }] }
 *
 * Merges a guest cart (localStorage) with the authenticated user's most
 * recent active cart, when cart persistence is enabled. In the default
 * localStorage-only setup this endpoint simply validates and returns the
 * merged payload so the client can hydrate its state.
 */
export async function mergeCart(req, res, next) {
  try {
    const { items } = req.body ?? {}

    if (!Array.isArray(items)) {
      throw httpError(400, 'items must be an array.')
    }

    // Deduplicate by product_id, summing quantities
    const merged = new Map()
    for (const item of items) {
      if (!item?.product_id) continue
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1)
      merged.set(
        item.product_id,
        (merged.get(item.product_id) ?? 0) + qty
      )
    }

    const normalized = Array.from(merged.entries()).map(
      ([product_id, quantity]) => ({ product_id, quantity })
    )

    if (normalized.length === 0) {
      return res.json({ items: [], subtotal: 0, shipping: 0, tax: 0, total: 0 })
    }

    // Reuse validateCart's logic by calling it inline
    req.body = { items: normalized }
    return validateCart(req, res, next)
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/cart/summary
 * Body: { items: [{ product_id, quantity }] }
 *
 * Lightweight totals-only endpoint. Returns the same monetary fields as
 * validateCart but without line-item details — useful for a mini-cart.
 */
export async function cartSummary(req, res, next) {
  try {
    const { items } = req.body ?? {}

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({
        itemCount: 0,
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      })
    }

    const productIds = items.map((i) => i?.product_id).filter(Boolean)
    if (productIds.length === 0) {
      return res.json({
        itemCount: 0,
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      })
    }

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, price, stock')
      .in('id', productIds)

    if (error) throw httpError(500, error.message)

    const map = new Map((products ?? []).map((p) => [p.id, p]))

    let subtotal = 0
    let itemCount = 0

    for (const item of items) {
      const product = map.get(item.product_id)
      if (!product) continue

      const requested = Math.max(1, parseInt(item.quantity, 10) || 1)
      const available = product.stock ?? 0
      const quantity = Math.min(requested, available)
      if (quantity <= 0) continue

      itemCount += quantity
      subtotal += Number(product.price) * quantity
    }

    const shipping = subtotal > 0 && subtotal < 100 ? 9.99 : 0
    const tax = Number((subtotal * 0.05).toFixed(2))
    const total = Number((subtotal + shipping + tax).toFixed(2))

    res.json({
      itemCount,
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      tax,
      total,
    })
  } catch (err) {
    next(err)
  }
}