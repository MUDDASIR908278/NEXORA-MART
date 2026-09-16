import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  Heart,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Loader from '../components/Loader'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'

const FALLBACK =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [wished, setWished] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setQty(1)
    setActiveImg(0)

    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        if (!active) return
        setProduct(data.product ?? data)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load product')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  // Fetch related products (same category)
  useEffect(() => {
    if (!product?.category) return
    let active = true

    api
      .get('/products', {
        params: { category: product.category, limit: 5 },
      })
      .then(({ data }) => {
        if (!active) return
        const list = data.products ?? data.data ?? []
        setRelated(list.filter((p) => p.id !== product.id).slice(0, 4))
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [product?.category, product?.id])

  /* -------------------- Loading / Error -------------------- */
  if (loading) return <Loader full />

  if (error || !product) {
    return (
      <div className="container page">
        <div className="empty-state">
          <div className="empty-state-icon">
            <ShoppingCart size={30} strokeWidth={1.5} />
          </div>
          <h3>Product not found</h3>
          <p>{error || 'This product may have been removed or is no longer available.'}</p>
          <Link to="/shop" className="btn">
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  /* -------------------- Derived values -------------------- */
  const stock = product.stock ?? 0
  const outOfStock = stock <= 0
  const price = Number(product.price ?? 0)
  const compareAt = Number(product.compare_at_price ?? 0)
  const hasDiscount = compareAt > price && compareAt > 0
  const discountPct = hasDiscount
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : 0

  // Build a small gallery from the main image + a few variants
  const gallery = [
    product.image_url || FALLBACK,
    product.image_url || FALLBACK,
    product.image_url || FALLBACK,
  ]

  const handleAdd = () => {
    addToCart(product, qty)
    toast.success(`${qty} × ${product.name} added to cart`)
  }

  const handleBuyNow = () => {
    addToCart(product, qty)
    navigate('/cart')
  }

  const handleWish = () => {
    setWished((v) => !v)
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <div className="container page">
      {/* ============ BREADCRUMB ============ */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          fontSize: 'var(--fs-xs)',
          color: 'var(--text-dim)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}
      >
        <Link to="/" className="text-dim" style={{ color: 'inherit' }}>
          Home
        </Link>
        <ChevronRight size={12} strokeWidth={1.6} />
        <Link to="/shop" className="text-dim" style={{ color: 'inherit' }}>
          Shop
        </Link>
        {product.category && (
          <>
            <ChevronRight size={12} strokeWidth={1.6} />
            <Link
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="text-dim"
              style={{ color: 'inherit' }}
            >
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight size={12} strokeWidth={1.6} />
        <span style={{ color: 'var(--rose)', fontWeight: 500 }}>
          {product.name.length > 30
            ? `${product.name.slice(0, 30)}…`
            : product.name}
        </span>
      </nav>

      {/* ============ MAIN PRODUCT ============ */}
      <div className="pd-wrap">
        {/* ---------- GALLERY ---------- */}
        <div className="pd-gallery">
          <div className="pd-image">
            <img
              src={gallery[activeImg]}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = FALLBACK
              }}
            />

            {hasDiscount && (
              <span className="product-badge">−{discountPct}%</span>
            )}

            <button
              type="button"
              className={`product-wish ${wished ? 'active' : ''}`}
              onClick={handleWish}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                size={16}
                strokeWidth={1.8}
                fill={wished ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          <div className="pd-thumbs">
            {gallery.map((src, i) => (
              <button
                type="button"
                key={i}
                className={`pd-thumb ${i === activeImg ? 'active' : ''}`}
                onClick={() => setActiveImg(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`${product.name} view ${i + 1}`}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ---------- INFO ---------- */}
        <div className="pd-info">
          {product.category && (
            <span className="pd-category">{product.category}</span>
          )}

          <h1 className="pd-title">{product.name}</h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div className="product-rating" style={{ fontSize: '0.82rem' }}>
              <Star size={14} strokeWidth={1.6} fill="currentColor" />
              <span style={{ color: 'var(--champagne)', fontWeight: 600 }}>
                {Number(product.rating ?? 4.5).toFixed(1)}
              </span>
              <span className="text-dim">·</span>
              <span className="text-dim">Verified reviews</span>
            </div>

            <span className="pd-stock">
              <span
                className={`pd-stock-dot ${outOfStock ? 'out' : ''}`}
                aria-hidden="true"
              />
              {outOfStock ? 'Out of stock' : `In stock · ${stock} available`}
            </span>
          </div>

          <div className="pd-price-row">
            <span className="pd-price">${price.toFixed(2)}</span>
            {hasDiscount && (
              <>
                <span className="price-old" style={{ fontSize: '0.95rem' }}>
                  ${compareAt.toFixed(2)}
                </span>
                <span className="discount-pill">Save {discountPct}%</span>
              </>
            )}
          </div>

          <p className="pd-desc">
            {product.description ||
              'A carefully selected piece from the NEXORA MART collection — crafted with premium materials and delivered with our signature attention to detail.'}
          </p>

          {/* Quantity + actions */}
          <div className="qty-row">
            <span
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--rose)',
                fontWeight: 600,
              }}
            >
              Quantity
            </span>

            <div className="qty-control" role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={15} strokeWidth={1.8} />
              </button>
              <span aria-live="polite">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(stock, q + 1))}
                disabled={qty >= stock || outOfStock}
                aria-label="Increase quantity"
              >
                <Plus size={15} strokeWidth={1.8} />
              </button>
            </div>

            <span className="text-dim" style={{ fontSize: '0.78rem' }}>
              {stock > 0 && `${stock} available`}
            </span>
          </div>

          <div className="pd-actions">
            <button
              type="button"
              className="btn btn-lg"
              onClick={handleAdd}
              disabled={outOfStock}
            >
              <ShoppingCart size={17} strokeWidth={1.8} />
              Add to Cart
            </button>
            <button
              type="button"
              className="btn btn-outline btn-lg"
              onClick={handleBuyNow}
              disabled={outOfStock}
            >
              Buy Now
            </button>
          </div>

          {/* Trust strip */}
          <div
            className="glass-card"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              padding: 20,
              marginTop: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Truck size={18} strokeWidth={1.6} color="var(--rose)" />
              <div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--champagne)',
                  }}
                >
                  Free Shipping
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  On orders over $100
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={18} strokeWidth={1.6} color="var(--rose)" />
              <div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--champagne)',
                  }}
                >
                  Secure Payment
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  256-bit SSL encrypted
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RefreshCw size={18} strokeWidth={1.6} color="var(--rose)" />
              <div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--champagne)',
                  }}
                >
                  Easy Returns
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  30-day return window
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginTop: 4,
            }}
          >
            {[
              'Authentic product, sourced directly',
              'Dispatched within 24 hours',
              'Signature NEXORA packaging',
            ].map((line) => (
              <li
                key={line}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                <Check
                  size={14}
                  strokeWidth={2}
                  color="var(--champagne)"
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ============ RELATED PRODUCTS ============ */}
      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>You May Also Like</h2>
            <Link to="/shop" className="btn-ghost">
              View All <ChevronRight size={15} strokeWidth={1.8} />
            </Link>
          </div>

          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ============ BACK LINK ============ */}
      <div style={{ marginTop: 32 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={15} strokeWidth={1.8} />
          Go back
        </button>
      </div>
    </div>
  )
}