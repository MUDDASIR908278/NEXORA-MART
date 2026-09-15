import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Loader from '../components/Loader'
import { useCart } from '../context/CartContext'

const FALLBACK =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        if (active) setProduct(data.product ?? data)
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [id])

  if (loading) return <Loader full />

  if (error || !product)
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>Product not found</h3>
          <p>{error || 'This product may have been removed.'}</p>
          <Link to="/shop" className="btn">
            Back to shop
          </Link>
        </div>
      </div>
    )

  const stock = product.stock ?? 99
  const outOfStock = stock <= 0
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price

  const handleAdd = () => {
    addToCart(product, qty)
    toast.success(`${qty} × ${product.name} added to cart`)
  }

  const handleBuyNow = () => {
    addToCart(product, qty)
    navigate('/cart')
  }

  return (
    <div className="container page">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Back
      </button>

      <div className="pd-grid" style={{ marginTop: 24 }}>
        <div className="pd-image">
          <img
            src={product.image_url || FALLBACK}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = FALLBACK
            }}
          />
        </div>

        <div>
          {product.category && (
            <span className="product-category">{product.category}</span>
          )}
          <h1 className="pd-title">{product.name}</h1>

          <div className="product-rating">
            <Star size={15} fill="currentColor" color="#f59e0b" />
            <span>{Number(product.rating ?? 4.5).toFixed(1)}</span>
            <span>·</span>
            <span>{outOfStock ? 'Out of stock' : `${stock} in stock`}</span>
          </div>

          <div className="pd-price">
            ${Number(product.price).toFixed(2)}
            {hasDiscount && (
              <span className="price-old">
                ${Number(product.compare_at_price).toFixed(2)}
              </span>
            )}
          </div>

          <p className="pd-desc">
            {product.description ||
              'A carefully selected product from the NEXORA MART catalogue.'}
          </p>

          <div className="qty-row">
            <div className="qty-control">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
              >
                <Minus size={15} />
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(stock, q + 1))}
                aria-label="Increase"
              >
                <Plus size={15} />
              </button>
            </div>

            <button className="btn" onClick={handleAdd} disabled={outOfStock}>
              <ShoppingCart size={17} /> Add to cart
            </button>

            <button
              className="btn btn-outline"
              onClick={handleBuyNow}
              disabled={outOfStock}
            >
              Buy now
            </button>
          </div>

          <div
            className="card"
            style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 16 }}
          >
            <Truck size={20} color="var(--accent)" />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Free shipping on orders over $100 · Dispatched within 24 hours
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}