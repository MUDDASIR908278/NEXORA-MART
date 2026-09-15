import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const FALLBACK =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'

export default function Cart() {
  const {
    items,
    subtotal,
    shipping,
    tax,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleCheckout = () => {
    navigate(isAuthenticated ? '/checkout' : '/login', {
      state: { from: '/checkout' },
    })
  }

  if (items.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add some products to get started.</p>
          <Link to="/shop" className="btn">
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      <h1 className="page-title">Your Cart</h1>
      <p className="page-subtitle">{items.length} item(s)</p>

      <div className="cart-layout">
        <div>
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <img
                src={item.image_url || FALLBACK}
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK
                }}
              />

              <div>
                <Link to={`/product/${item.id}`} className="cart-item-name">
                  {item.name}
                </Link>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  ${Number(item.price).toFixed(2)} each
                </div>

                <div
                  className="qty-control"
                  style={{ marginTop: 10, width: 'fit-content' }}
                >
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label="Decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label="Increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger)', marginTop: 8 }}
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}

          <button className="btn btn-ghost btn-sm" onClick={clearCart}>
            Clear cart
          </button>
        </div>

        <aside className="card">
          <h3 style={{ marginBottom: 16 }}>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax (5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            className="btn btn-block"
            style={{ marginTop: 20 }}
            onClick={handleCheckout}
          >
            Checkout <ArrowRight size={16} />
          </button>

          <Link
            to="/shop"
            className="btn btn-ghost btn-block"
            style={{ marginTop: 8 }}
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}