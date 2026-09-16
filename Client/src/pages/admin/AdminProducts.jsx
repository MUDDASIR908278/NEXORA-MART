import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Store,
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ImageOff,
  PackageSearch,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/', label: 'Back to Store', icon: Store, end: true },
]

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home',
  'Kitchen',
  'Beauty',
  'Sports',
  'Toys',
  'Baby',
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
  { value: 'stock_asc', label: 'Stock: Low to High' },
]

const LIMIT = 10

const FALLBACK =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [term, setTerm] = useState(searchParams.get('search') || '')
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || 'All'
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page') || 1)

  /* ============ Fetch products ============ */
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

  /* ============ Param helpers ============ */
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

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return
    updateParams({ page: p })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ============ Delete ============ */
  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted')
      setConfirmDelete(null)
      // If this was the last item on the page, step back a page
      if (products.length === 1 && page > 1) {
        updateParams({ page: page - 1 })
      } else {
        fetchProducts()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  /* ============ CSV Upload ============ */
  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      if (rows.length === 0) {
        throw new Error('CSV is empty or malformed')
      }

      let ok = 0
      let failed = 0
      for (const row of rows) {
        try {
          await api.post('/products', row)
          ok += 1
        } catch {
          failed += 1
        }
      }

      if (ok > 0) toast.success(`${ok} product${ok === 1 ? '' : 's'} imported`)
      if (failed > 0) toast.error(`${failed} row${failed === 1 ? '' : 's'} failed`)
      fetchProducts()
    } catch (err) {
      toast.error(err.message || 'CSV upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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
    <div className="admin-layout">
      {/* ============ SIDEBAR ============ */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <Link to="/admin" className="admin-brand">
            NEXORA<span>MART</span>
          </Link>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={17} strokeWidth={1.7} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ============ MAIN ============ */}
      <main className="admin-main">
        {/* ---------- Header ---------- */}
        <div className="admin-page-head">
          <div>
            <h1 className="admin-title">Products</h1>
            <p className="admin-subtitle">
              {loading
                ? 'Loading catalogue…'
                : `${total} ${total === 1 ? 'product' : 'products'} in catalogue`}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Bulk import from CSV"
            >
              <Upload size={14} strokeWidth={1.8} />
              {uploading ? 'Uploading…' : 'Bulk CSV Upload'}
            </button>

            <Link to="/admin/products/new" className="btn btn-sm">
              <Plus size={15} strokeWidth={2} />
              Add New Product
            </Link>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* ---------- Filters card ---------- */}
        <section className="admin-card">
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <form
              onSubmit={handleSearchSubmit}
              style={{ flex: '1 1 260px', minWidth: 0, position: 'relative' }}
            >
              <Search
                size={15}
                strokeWidth={1.7}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--rose)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="search"
                className="form-input"
                placeholder="Search products by name…"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                style={{ paddingLeft: 40, height: 42 }}
                aria-label="Search products"
              />
            </form>

            {/* Category filter */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                className="form-select"
                value={category}
                onChange={(e) => updateParams({ category: e.target.value })}
                aria-label="Filter by category"
                style={{ minWidth: 170, height: 42 }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <SlidersHorizontal
                size={14}
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
                onChange={(e) => updateParams({ sort: e.target.value })}
                aria-label="Sort products"
                style={{ minWidth: 200, paddingLeft: 38, height: 42 }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ---------- Products table ---------- */}
        <section className="admin-card">
          {loading ? (
            <ProductsTableSkeleton />
          ) : products.length === 0 ? (
            <div className="admin-empty">
              <PackageSearch size={30} strokeWidth={1.5} color="var(--rose)" />
              <p>No products match your filters.</p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setTerm('')
                  setSearchParams(new URLSearchParams())
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table admin-products-table">
                <thead>
                  <tr>
                    <th style={{ width: 68 }}>Image</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th className="right">Price</th>
                    <th className="right">Stock</th>
                    <th className="right" style={{ width: 130 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const stock = p.stock ?? 0
                    const stockClass =
                      stock === 0 ? 'out' : stock < 10 ? 'low' : ''
                    return (
                      <tr key={p.id}>
                        <td>
                          <Link
                            to={`/product/${p.id}`}
                            className="admin-prod-thumb"
                          >
                            <img
                              src={p.image_url || FALLBACK}
                              alt={p.name}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK
                              }}
                            />
                          </Link>
                        </td>

                        <td>
                          <div className="admin-prod-name">
                            <Link to={`/product/${p.id}`}>{p.name}</Link>
                          </div>
                          <div className="admin-prod-meta">
                            {p.featured && (
                              <span className="admin-chip-featured">
                                Featured
                              </span>
                            )}
                            {p.rating != null && (
                              <span className="admin-chip-rating">
                                ★ {Number(p.rating).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="admin-prod-cat">
                            {p.category || '—'}
                          </span>
                        </td>

                        <td className="right">
                          <div className="admin-prod-price">
                            {formatINR(p.price)}
                          </div>
                          {p.compare_at_price &&
                            Number(p.compare_at_price) > Number(p.price) && (
                              <div className="admin-prod-price-old">
                                {formatINR(p.compare_at_price)}
                              </div>
                            )}
                        </td>

                        <td className="right">
                          <span className={`admin-stock-pill ${stockClass}`}>
                            {stock === 0 ? 'Out' : stock}
                          </span>
                        </td>

                        <td className="right">
                          <div className="admin-row-actions">
                            <Link
                              to={`/admin/products/${p.id}/edit`}
                              className="admin-icon-btn"
                              aria-label={`Edit ${p.name}`}
                              title="Edit"
                            >
                              <Pencil size={15} strokeWidth={1.7} />
                            </Link>
                            <button
                              type="button"
                              className="admin-icon-btn danger"
                              onClick={() => setConfirmDelete(p)}
                              aria-label={`Delete ${p.name}`}
                              title="Delete"
                              disabled={deleting === p.id}
                            >
                              <Trash2 size={15} strokeWidth={1.7} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ---------- Pagination ---------- */}
          {!loading && totalPages > 1 && (
            <nav className="admin-pagination" aria-label="Pagination">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft size={14} strokeWidth={1.8} />
                Prev
              </button>

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

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight size={14} strokeWidth={1.8} />
              </button>
            </nav>
          )}
        </section>
      </main>

      {/* ============ DELETE CONFIRM MODAL ============ */}
      {confirmDelete && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <div className="admin-modal-head">
              <div className="admin-modal-icon">
                <AlertTriangle size={20} strokeWidth={1.7} />
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setConfirmDelete(null)}
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <h3 className="admin-modal-title">Delete Product?</h3>
            <p className="admin-modal-body">
              <strong>{confirmDelete.name}</strong> will be permanently removed
              from your catalogue. This action cannot be undone.
            </p>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting === confirmDelete.id}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deleting === confirmDelete.id}
              >
                <Trash2 size={14} strokeWidth={1.8} />
                {deleting === confirmDelete.id ? 'Deleting…' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ INLINE STYLES ============ */}
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: var(--bg-deep);
          color: var(--text);
        }
        .admin-sidebar {
          width: 248px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #2a0d1a 0%, #1a0810 100%);
          border-right: 1px solid var(--border);
          padding: 20px 14px;
          display: none;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }
        @media (min-width: 1024px) { .admin-sidebar { display: flex; } }

        .admin-sidebar-head {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px 22px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .admin-brand {
          font-family: var(--ff-heading);
          font-size: 1.15rem; font-weight: 800;
          letter-spacing: 0.03em; color: var(--white);
        }
        .admin-brand span {
          font-style: italic;
          background: var(--grad-rose);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .admin-badge {
          font-size: 0.6rem; letter-spacing: 0.18em;
          text-transform: uppercase; font-weight: 600;
          color: var(--rose);
          background: rgba(232, 180, 160, 0.14);
          border: 1px solid var(--border-rose);
          padding: 3px 8px; border-radius: var(--r-full);
          margin-left: auto;
        }

        .admin-nav { display: flex; flex-direction: column; gap: 4px; }
        .admin-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: var(--r-sm);
          color: var(--text-muted); font-size: 0.88rem;
          font-weight: 500; letter-spacing: 0.02em;
          transition: all 0.2s var(--ease);
          border-left: 2px solid transparent;
        }
        .admin-nav-link:hover {
          color: var(--champagne);
          background: rgba(232, 180, 160, 0.06);
        }
        .admin-nav-link.active {
          color: var(--rose);
          background: rgba(232, 180, 160, 0.1);
          border-left-color: var(--rose);
        }

        .admin-main {
          flex: 1; min-width: 0;
          padding: clamp(20px, 3vw, 36px);
          display: flex; flex-direction: column;
          gap: 20px; max-width: 100%; overflow-x: clip;
        }

        .admin-page-head {
          display: flex; align-items: flex-end;
          justify-content: space-between; gap: 14px; flex-wrap: wrap;
        }
        .admin-title {
          font-family: var(--ff-heading);
          font-size: clamp(1.5rem, 3.4vw, 2rem);
          font-weight: 700;
          background: var(--grad-rose);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          line-height: 1.15; margin-bottom: 4px;
        }
        .admin-subtitle {
          color: var(--text-muted);
          font-size: 0.85rem; letter-spacing: 0.02em;
        }

        .admin-card {
          background: var(--grad-surface);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid var(--border-soft);
          border-radius: var(--r-lg);
          padding: clamp(16px, 2.6vw, 22px);
          box-shadow: var(--shadow-sm);
          position: relative; overflow: hidden;
        }
        .admin-card::before {
          content: '';
          position: absolute; inset: 0 auto auto 0;
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-rose), transparent);
          opacity: 0.5;
        }

        /* ---------- Table ---------- */
        .admin-table-wrap {
          overflow-x: auto; border-radius: var(--r-sm);
          margin: -4px -4px 0; padding: 4px; scrollbar-width: none;
        }
        .admin-table-wrap::-webkit-scrollbar { display: none; }

        .admin-table {
          width: 100%; min-width: 760px;
          border-collapse: separate; border-spacing: 0 4px;
        }
        .admin-table th {
          text-align: left; font-size: 0.66rem;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-dim); font-weight: 600;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
        }
        .admin-table td {
          padding: 10px 12px;
          font-size: 0.84rem; color: var(--text-muted);
          background: rgba(26, 8, 16, 0.35);
          border-top: 1px solid transparent;
          border-bottom: 1px solid transparent;
          vertical-align: middle;
        }
        .admin-table tbody tr td:first-child {
          border-top-left-radius: var(--r-sm);
          border-bottom-left-radius: var(--r-sm);
        }
        .admin-table tbody tr td:last-child {
          border-top-right-radius: var(--r-sm);
          border-bottom-right-radius: var(--r-sm);
        }
        .admin-table tbody tr:hover td {
          background: rgba(232, 180, 160, 0.06);
          border-color: var(--border);
        }
        .admin-table .right { text-align: right; }

        .admin-prod-thumb {
          display: block; width: 52px; height: 52px;
          border-radius: var(--r-sm); overflow: hidden;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          transition: all 0.2s var(--ease);
        }
        .admin-prod-thumb:hover {
          border-color: var(--border-rose);
          box-shadow: 0 0 12px rgba(232, 180, 160, 0.25);
        }
        .admin-prod-thumb img {
          width: 100%; height: 100%; object-fit: cover;
        }

        .admin-prod-name {
          font-size: 0.86rem; font-weight: 500;
          color: var(--text); line-height: 1.35;
          max-width: 280px;
          overflow: hidden; text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .admin-prod-name a:hover { color: var(--rose); }

        .admin-prod-meta {
          display: flex; gap: 6px; margin-top: 5px;
          flex-wrap: wrap;
        }
        .admin-chip-featured {
          font-size: 0.6rem; letter-spacing: 0.12em;
          text-transform: uppercase; font-weight: 600;
          padding: 2px 7px; border-radius: var(--r-full);
          background: rgba(232, 180, 160, 0.16);
          border: 1px solid var(--border-rose);
          color: var(--rose);
        }
        .admin-chip-rating {
          font-size: 0.66rem; font-weight: 600;
          color: var(--champagne);
          letter-spacing: 0.02em;
        }

        .admin-prod-cat {
          font-size: 0.76rem; color: var(--text-muted);
          letter-spacing: 0.04em;
        }

        .admin-prod-price {
          font-family: var(--ff-heading);
          font-weight: 700; color: var(--champagne);
          font-size: 0.9rem; letter-spacing: -0.01em;
        }
        .admin-prod-price-old {
          font-size: 0.7rem; color: var(--text-dim);
          text-decoration: line-through;
          margin-top: 2px;
        }

        .admin-stock-pill {
          display: inline-block;
          min-width: 44px; text-align: center;
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 4px 10px; border-radius: var(--r-full);
          color: var(--champagne);
          background: rgba(232, 180, 160, 0.14);
          border: 1px solid var(--border-rose);
        }
        .admin-stock-pill.low {
          color: #f0c896;
          background: rgba(240, 200, 150, 0.12);
          border-color: rgba(240, 200, 150, 0.4);
        }
        .admin-stock-pill.out {
          color: #f4b8b8;
          background: rgba(224, 160, 160, 0.14);
          border-color: rgba(224, 160, 160, 0.4);
        }

        .admin-row-actions {
          display: inline-flex; gap: 6px; justify-content: flex-end;
        }
        .admin-icon-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px;
          border-radius: var(--r-sm);
          background: rgba(26, 8, 16, 0.4);
          border: 1px solid var(--border);
          color: var(--rose);
          transition: all 0.18s var(--ease);
        }
        .admin-icon-btn:hover {
          background: rgba(232, 180, 160, 0.12);
          border-color: var(--border-rose);
          color: var(--champagne);
          transform: translateY(-1px);
        }
        .admin-icon-btn.danger {
          color: #e0a0a0;
          border-color: rgba(224, 160, 160, 0.3);
        }
        .admin-icon-btn.danger:hover {
          background: rgba(224, 160, 160, 0.14);
          border-color: rgba(224, 160, 160, 0.55);
          color: #f4b8b8;
        }
        .admin-icon-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ---------- Pagination ---------- */
        .admin-pagination {
          display: flex; justify-content: center;
          align-items: center; gap: 6px;
          flex-wrap: wrap;
          margin-top: 18px; padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        /* ---------- Empty ---------- */
        .admin-empty {
          padding: 48px 16px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; color: var(--text-muted);
          font-size: 0.88rem; text-align: center;
          letter-spacing: 0.02em;
        }

        /* ---------- Skeleton ---------- */
        .admin-skel-row td {
          padding: 14px 12px;
        }
        .admin-skel {
          background: linear-gradient(
            90deg,
            rgba(61, 18, 37, 0.55) 0%,
            rgba(232, 180, 160, 0.1) 50%,
            rgba(61, 18, 37, 0.55) 100%
          );
          background-size: 220% 100%;
          animation: adminShimmer 1.5s ease-in-out infinite;
          border-radius: var(--r-sm);
        }
        @keyframes adminShimmer {
          0% { background-position: 220% 0; }
          100% { background-position: -220% 0; }
        }

        /* ---------- Modal ---------- */
        .admin-modal-backdrop {
          position: fixed; inset: 0; z-index: 900;
          background: rgba(10, 3, 7, 0.72);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: adminFadeIn 0.22s var(--ease);
        }
        @keyframes adminFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .admin-modal {
          width: 100%; max-width: 420px;
          background: var(--grad-surface);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid var(--border-rose);
          border-radius: var(--r-lg);
          padding: 24px;
          box-shadow: var(--shadow-lg), 0 0 40px rgba(232, 180, 160, 0.16);
          position: relative; overflow: hidden;
          animation: adminModalIn 0.28s var(--ease);
        }
        @keyframes adminModalIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .admin-modal::before {
          content: '';
          position: absolute; inset: 0 auto auto 0;
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--rose), transparent);
        }
        .admin-modal-head {
          display: flex; justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .admin-modal-icon {
          width: 42px; height: 42px;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: var(--r-full);
          background: rgba(224, 160, 160, 0.14);
          border: 1px solid rgba(224, 160, 160, 0.4);
          color: #f4b8b8;
        }
        .admin-modal-title {
          font-family: var(--ff-heading);
          font-size: 1.25rem; font-weight: 700;
          color: var(--white); margin-bottom: 8px;
        }
        .admin-modal-body {
          font-size: 0.88rem; color: var(--text-muted);
          line-height: 1.65; margin-bottom: 20px;
        }
        .admin-modal-body strong {
          color: var(--champagne); font-weight: 600;
        }
        .admin-modal-actions {
          display: flex; justify-content: flex-end;
          gap: 10px; flex-wrap: wrap;
        }
      `}</style>
    </div>
  )
}

/* ============================================================
   Skeleton
   ============================================================ */
function ProductsTableSkeleton() {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-products-table">
        <thead>
          <tr>
            <th style={{ width: 68 }}>Image</th>
            <th>Product</th>
            <th>Category</th>
            <th className="right">Price</th>
            <th className="right">Stock</th>
            <th className="right" style={{ width: 130 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="admin-skel-row">
              <td>
                <div className="admin-skel" style={{ width: 52, height: 52 }} />
              </td>
              <td>
                <div
                  className="admin-skel"
                  style={{ width: '70%', height: 12, marginBottom: 6 }}
                />
                <div
                  className="admin-skel"
                  style={{ width: '35%', height: 10 }}
                />
              </td>
              <td>
                <div className="admin-skel" style={{ width: 90, height: 12 }} />
              </td>
              <td className="right">
                <div
                  className="admin-skel"
                  style={{ width: 70, height: 12, marginLeft: 'auto' }}
                />
              </td>
              <td className="right">
                <div
                  className="admin-skel"
                  style={{
                    width: 44,
                    height: 20,
                    borderRadius: 999,
                    marginLeft: 'auto',
                  }}
                />
              </td>
              <td className="right">
                <div
                  className="admin-skel"
                  style={{ width: 80, height: 32, marginLeft: 'auto' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ============================================================
   Minimal CSV parser (header row + comma-separated values)
   Expected columns: name, price, category, stock, image_url,
   description, compare_at_price, rating, featured
   ============================================================ */
function parseCsv(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const splitLine = (line) => {
    const cells = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    cells.push(cur)
    return cells.map((c) => c.trim())
  }

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase())

  return lines.slice(1).map((line) => {
    const cells = splitLine(line)
    const row = {}
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? ''
    })

    const out = {}
    if (row.name) out.name = row.name
    if (row.description) out.description = row.description
    if (row.price !== undefined && row.price !== '') out.price = Number(row.price)
    if (row.compare_at_price)
      out.compare_at_price = Number(row.compare_at_price)
    if (row.category) out.category = row.category
    if (row.image_url) out.image_url = row.image_url
    if (row.stock !== undefined && row.stock !== '') out.stock = Number(row.stock)
    if (row.rating !== undefined && row.rating !== '') out.rating = Number(row.rating)
    if (row.featured !== undefined && row.featured !== '')
      out.featured = /^(1|true|yes)$/i.test(row.featured)

    return out
  }).filter((r) => r.name && Number.isFinite(r.price))
}