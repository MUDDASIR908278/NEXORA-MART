import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'

const FALLBACK =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const outOfStock = (product.stock ?? 1) <= 0
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price

  const handleAdd = (e) => {
    e.preventDefault()
    addToCart(product, 1)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-media">
        <img
          src={product.image_url || FALLBACK}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK
          }}
        />
        {hasDiscount && <span className="product-badge">Sale</span>}
      </div>

      <div className="product-body">
        {product.category && (
          <span className="product-category">{product.category}</span>
        )}

        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating">
          <Star size={14} fill="currentColor" color="#f59e0b" />
          <span>{Number(product.rating ?? 4.5).toFixed(1)}</span>
        </div>

        <div className="product-foot">
          <div>
            <span className="price">${Number(product.price).toFixed(2)}</span>
            {hasDiscount && (
              <span className="price-old">
                ${Number(product.compare_at_price).toFixed(2)}
              </span>
            )}
          </div>

          <button
            className="btn btn-sm"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label="Add to cart"
          >
            <ShoppingCart size={15} />
            {outOfStock ? 'Out' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  )
}