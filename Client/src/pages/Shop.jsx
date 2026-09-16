import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, PackageSearch, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../lib/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home',
  'Beauty',
  'Sports',
  'Toys',
  'Baby',
  'Kitchen',
  'Bags',
  'Stationery',
  'Gifts',
  'Pet',
  'Car',
  'Hobby',
  'Seasonal',
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

const LIMIT = 12

function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="product-card" key={i} style={{ pointerEvents: 'none' }}>
          <div className="product-image">
            <div className="skeleton skeleton-image" />
          </div>
          <div className="product-body">
            <div className="skeleton skeleton-text" style={{ width: '40%' }} />
            <div className="skeleton skeleton-text" style={{ width: '85%' }} />
            <div className="skeleton skeleton-text" style={{ width: '55%' }} />
            <div className="product-foot">
              <div className="skeleton skeleton-text" style={{ width: '60px', height: 18 }} />
              <div className="skeleton" style={{ width: '100%', height: 38, borderRadius: 'var(--r-full)' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [term, setTerm] = useState(searchParams.get('search') || '')

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || 'All'
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page') || 1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const params = { page, limit: LIMIT, sort }
      if (search) params.search = search
      if (category && category !== 'All') params.category = category

      const { data } = await api.get('/products', { params })
      setProducts(data.products ?? data.data ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      setError(err.message || 'Failed to load products')
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [search, category, sort, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([k, v]) => {
      if (!v || v === 'All' || (k === 'sort' && v === 'newest')) {
        next.delete(k)
      } else {
        next.set(k, v)
      }
    })
    if (!('page' in patch)) next.delete('page')
    setSearchParams(next)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    updateParams({ search: term.trim() })
  }

  const handleCategory = (c) => updateParams({ category: c })

  const handleSortChange = (e) => updateParams({ sort: e.target.value })

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return
    updateParams({ page: p })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Build a small windowed pagination range
  const pageNumbers = (() => {
    const pages = []
    const maxShown = 5
    let start = Math.max(1, page - Math.floor(maxShown / 2))
    const end = Math.min(totalPages, start + maxShown - 1)
    if (end - start + 1 < maxShown) start = Math.max(1, end - maxShown + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  })()

  return (
    <div className="container page">
      <header style={{ marginBottom: 24 }}>
        <h1 className="page-title">Shop</h1>
        <p className="page-subtitle">
          {loading
            ? 'Curating the finest pieces for you…'
            : total > 0
            ? `${total} ${total === 1 ? 'product' : 'products'} available`
            : 'Browse our curated collection'}
        </p>
      </header>

      {/* ============ SEARCH BAR ============ */}
      <form onSubmit={handleSearchSubmit} className="filters">
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 0 }}>
          <Search
            size={16}
            strokeWidth={1.7}
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
            type="search"
            className="form-input"
            placeholder="Search products…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            style={{ paddingLeft: 44 }}
            aria-label="Search products"
          />
        </div>

        <button type="submit" className="btn btn-sm">
          <Search size={15} strokeWidth={1.8} /> Search
        </button>
      </form>

      {/* ============ FILTER ROW ============ */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        {/* Category chips */}
        <div className="category-chips" style={{ flex: '1 1 auto', minWidth: 0, margin: 0 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${category === c ? 'active' : ''}`}
              onClick={() => handleCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <SlidersHorizontal
            size={15}
            strokeWidth={1.7}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--rose)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
          <select
            className="form-select"
            value={sort}
            onChange={handleSortChange}
            aria-label="Sort products"
            style={{ minWidth: 190, paddingLeft: 38, height: 42 }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ============ PRODUCTS ============ */}
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <PackageSearch size={30} strokeWidth={1.5} />
          </div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button type="button" className="btn" onClick={fetchProducts}>
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <PackageSearch size={30} strokeWidth={1.5} />
          </div>
          <h3>No products found</h3>
          <p>
            We couldn&rsquo;t find anything matching your filters. Try a
            different search term or category.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setTerm('')
              setSearchParams(new URLSearchParams())
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* ============ PAGINATION ============ */}
          {totalPages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={15} strokeWidth={1.8} /> Prev
              </button>

              {pageNumbers[0] > 1 && (
                <>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => goToPage(1)}
                  >
                    1
                  </button>
                  {pageNumbers[0] > 2 && (
                    <span aria-hidden="true" className="text-dim">
                      …
                    </span>
                  )}
                </>
              )}

              {pageNumbers.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm ${
                    p === page ? '' : 'btn-ghost'
                  }`}
                  onClick={() => goToPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span aria-hidden="true" className="text-dim">
                      …
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => goToPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                Next <ChevronRight size={15} strokeWidth={1.8} />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}