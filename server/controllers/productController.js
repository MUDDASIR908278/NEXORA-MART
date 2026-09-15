import { supabaseAdmin } from '../config/supabase.js'
import { httpError } from '../middleware/errorHandler.js'

/**
 * GET /api/products
 * Query params: page, limit, search, category, featured, sort
 */
export async function listProducts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 12))
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { search, category, featured, sort } = req.query

    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`
      query = query.or(`name.ilike.${term},description.ilike.${term}`)
    }

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    if (featured === 'true' || featured === true) {
      query = query.eq('featured', true)
    }

    // Default: newest first
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) throw httpError(500, error.message)

    res.json({
      products: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/products/:id
 */
export async function getProduct(req, res, next) {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw httpError(500, error.message)
    if (!data) throw httpError(404, 'Product not found.')

    res.json({ product: data })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/products  (admin)
 */
export async function createProduct(req, res, next) {
  try {
    const {
      name,
      description,
      price,
      compare_at_price,
      category,
      image_url,
      stock,
      rating,
      featured,
    } = req.body ?? {}

    if (!name || price == null) {
      throw httpError(400, 'name and price are required.')
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: String(name).trim(),
        description: description ?? null,
        price: Number(price),
        compare_at_price:
          compare_at_price != null ? Number(compare_at_price) : null,
        category: category ?? null,
        image_url: image_url ?? null,
        stock: Number.isFinite(Number(stock)) ? Number(stock) : 0,
        rating: Number.isFinite(Number(rating)) ? Number(rating) : 4.5,
        featured: Boolean(featured),
      })
      .select()
      .single()

    if (error) throw httpError(500, error.message)
    res.status(201).json({ product: data })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/products/:id  (admin)
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params
    const updates = { ...req.body }

    // Normalize numeric fields
    if (updates.price != null) updates.price = Number(updates.price)
    if (updates.compare_at_price != null)
      updates.compare_at_price = Number(updates.compare_at_price)
    if (updates.stock != null) updates.stock = Number(updates.stock)
    if (updates.rating != null) updates.rating = Number(updates.rating)

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw httpError(500, error.message)
    if (!data) throw httpError(404, 'Product not found.')

    res.json({ product: data })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/products/:id  (admin)
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw httpError(500, error.message)
    res.json({ message: 'Product deleted.' })
  } catch (err) {
    next(err)
  }
}