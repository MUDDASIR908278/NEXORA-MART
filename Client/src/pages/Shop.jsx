import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import api from '../lib/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports']
const LIMIT = 12

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [term, setTerm] = useState(searchParams.get('search') || '')

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || 'All'
  const page = Number(searchParams.get('page') || 1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (search) params.search = search
      if (category !== 'All') params.category = category

      const { data } = await api.get('/products', { params })
      setProducts(data.products ?? data.data ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [search, category, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([k, v]) => {
      if (!v || v === 'All') next.delete(k)
      else next.set(k, v)
    })
    if (!('page' in patch)) next.delete('page')
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateParams({ search: term.trim() })
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div className="container page">
      <h1 className="page-title">Shop</h1>
      <p className="page-subtitle">
        {total > 0 ? `${total} products available` : 'Browse our catalogue'}
      </p>

      <form onSubmit={handleSearch} className="filters">
        <input
          className="form-input"
          style={{ maxWidth: 340 }}
          placeholder="Search products..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button className="btn" type="submit">
          <Search size={16} /> Search
        </button>
      </form>

      <div className="filters">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? 'active' : ''}`}
            onClick={() => updateParams({ category: c })}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try a different search term or category.</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => updateParams({ page: page - 1 })}
              >
                Previous
              </button>
              <span
                style={{ padding: '8px 14px', color: 'var(--text-muted)' }}
              >
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: page + 1 })}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}