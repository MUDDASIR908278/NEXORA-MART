import { Link } from 'react-router-dom'
import { Star, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'

const FALLBACK =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const stock = product?.stock ?? 0
  const outOfStock = stock <= 0
  const price = Number(product?.price ?? 0)
  const compareAt = Number(product?.compare_at_price ?? 0)
  const hasDiscount = compareAt > price && compareAt > 0
  const discountPct = hasDiscount
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : 0

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addToCart(product, 1)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card"
      aria-label={product.name}
    >
      {/* ============ IMAGE ============ */}
      <div className="product-image">
        <img
          src={product.image_url || FALLBACK}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK) {
              e.currentTarget.src = FALLBACK
            }
          }}
        />

        {product.category && (
          <span className="product-badge">{product.category}</span>
        )}

        {hasDiscount && (
          <span className="discount-pill discount-badge">−{discountPct}%</span>
        )}

        {outOfStock && (
          <div className="product-oos">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      {/* ============ BODY ============ */}
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating">
          <Star size={13} strokeWidth={1.6} fill="currentColor" />
          <span>{Number(product.rating ?? 4.5).toFixed(1)}</span>
        </div>

        <div className="product-foot">
          <div className="product-price-row">
            <span className="product-price">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="price-old">${compareAt.toFixed(2)}</span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-sm btn-block"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label="Add to cart"
          >
            <ShoppingCart size={14} strokeWidth={1.8} />
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}