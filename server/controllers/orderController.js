import { supabaseAdmin } from '../config/supabase.js'
import { httpError } from '../middleware/errorHandler.js'

/**
 * POST /api/orders
 * Body: { items: [{ product_id, name, price, quantity }],
 *         shipping_address: {...}, payment_method, notes,
 *         subtotal, shipping, tax, total }
 */
export async function createOrder(req, res, next) {
  try {
    const userId = req.user.id
    const {
      items,
      shipping_address,
      payment_method = 'cod',
      notes = null,
    } = req.body ?? {}

    if (!Array.isArray(items) || items.length === 0) {
      throw httpError(400, 'Order must contain at least one item.')
    }
    if (!shipping_address || typeof shipping_address !== 'object') {
      throw httpError(400, 'Shipping address is required.')
    }

    // Recompute totals server-side from the products table so a client
    // cannot tamper with prices.
    const productIds = items.map((i) => i.product_id)
    const { data: products, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id, name, price, stock')
      .in('id', productIds)

    if (prodErr) throw httpError(500, prodErr.message)

    const productMap = new Map((products ?? []).map((p) => [p.id, p]))

    let computedSubtotal = 0
    const lineItems = items.map((item) => {
      const product = productMap.get(item.product_id)
      if (!product) {
        throw httpError(400, `Product not found: ${item.product_id}`)
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1)
      if (product.stock != null && product.stock < qty) {
        throw httpError(400, `Insufficient stock for "${product.name}".`)
      }

      const price = Number(product.price)
      computedSubtotal += price * qty

      return {
        product_id: product.id,
        name: product.name,
        price,
        quantity: qty,
      }
    })

    const computedShipping =
      computedSubtotal > 0 && computedSubtotal < 100 ? 9.99 : 0
    const computedTax = Number((computedSubtotal * 0.05).toFixed(2))
    const computedTotal = Number(
      (computedSubtotal + computedShipping + computedTax).toFixed(2)
    )

    // Insert the order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        payment_method,
        notes,
        subtotal: computedSubtotal,
        shipping: computedShipping,
        tax: computedTax,
        total: computedTotal,
        shipping_address,
      })
      .select()
      .single()

    if (orderErr) throw httpError(500, orderErr.message)

    // Insert order items
    const { error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .insert(
        lineItems.map((li) => ({
          order_id: order.id,
          product_id: li.product_id,
          name: li.name,
          price: li.price,
          quantity: li.quantity,
        }))
      )

    if (itemsErr) {
      // Roll back the order row if items failed
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      throw httpError(500, itemsErr.message)
    }

    // Decrement stock (best-effort; ignore races)
    await Promise.all(
      lineItems.map((li) =>
        supabaseAdmin
          .rpc('decrement_stock', {
            p_id: li.product_id,
            p_qty: li.quantity,
          })
          .catch(() => null)
      )
    )

    res.status(201).json({ order })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/orders/my-orders
 */
export async function getMyOrders(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw httpError(500, error.message)

    res.json({ orders: data ?? [] })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/orders/:id
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .maybeSingle()

    if (error) throw httpError(500, error.message)
    if (!data) throw httpError(404, 'Order not found.')

    if (data.user_id !== req.user.id) {
      throw httpError(403, 'You do not have access to this order.')
    }

    res.json({ order: data })
  } catch (err) {
    next(err)
  }
}