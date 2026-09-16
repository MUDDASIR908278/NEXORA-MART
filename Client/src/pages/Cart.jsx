import { Link, useNavigate } from 'react-router-dom'
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Lock,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const FALLBACK =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80'

const FREE_SHIP_THRESHOLD = 999

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

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

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const remainingForFreeShip = Math.max(0, FREE_SHIP_THRESHOLD - subtotal)
  const progressPct = Math.min(
    100,
    (subtotal / FREE_SHIP_THRESHOLD) * 100
  )

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout')
    } else {
      navigate('/login', { state: { from: '/checkout' } })
    }
  }

  /* ============ EMPTY STATE ============ */
  if (items.length === 0) {
    return (
      <div className="container page">
        <header style={{ marginBottom: 24 }}>
          <h1 className="page-title">Shopping Cart</h1>
        </header>

        <div className="empty-state">
          <div className="empty-state-icon">
            <ShoppingBag size={30} strokeWidth={1.5} />
          </div>
          <h3>Your cart is empty</h3>
          <p>
            Looks like you haven&rsquo;t added anything yet. Explore our
            curated collection and find something you love.
          </p>
          <Link to="/shop" className="btn btn-lg">
            Continue Shopping <ArrowRight size={16} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      {/* ============ HEADER ============ */}
      <header
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} · Ready to checkout
          </p>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={clearCart}
          aria-label="Clear cart"
        >
          <Trash2 size={14} strokeWidth={1.8} />
          Clear Cart
        </button>
      </header>

      {/* ============ FREE SHIPPING PROGRESS ============ */}
      <div
        className="glass-card"
        style={{
          padding: 18,
          marginBottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={18} strokeWidth={1.6} color="var(--rose)" />
            <span
              style={{
                fontSize: 'var(--fs-sm)',
                color: 'var(--champagne)',
                fontWeight: 500,
              }}
            >
              {remainingForFreeShip > 0 ? (
                <>
                  Add{' '}
                  <strong style={{ color: 'var(--rose)' }}>
                    {formatINR(remainingForFreeShip)}
                  </strong>{' '}
                  more for free shipping
                </>
              ) : (
                <>
                  🎉 You&rsquo;ve unlocked{' '}
                  <strong style={{ color: 'var(--rose)' }}>
                    free shipping
                  </strong>
                  !
                </>
              )}
            </span>
          </div>

          <span
            style={{
              fontSize: 'var(--fs-xs)',
              color: 'var(--text-dim)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Threshold {formatINR(FREE_SHIP_THRESHOLD)}
          </span>
        </div>

        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: 'rgba(232, 180, 160, 0.12)',
            overflow: 'hidden',
          }}
          role="progressbar"
          aria-valuenow={Math.round(progressPct)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--grad-rose)',
              borderRadius: 999,
              boxShadow: '0 0 14px rgba(232, 180, 160, 0.55)',
              transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </div>
      </div>

      {/* ============ CART LAYOUT ============ */}
      <div className="cart-layout">
        {/* ---------- ITEMS ---------- */}
        <div className="cart-items">
          {items.map((item) => {
            const stock = item.stock ?? 99
            const atMax = item.quantity >= stock
            const lineTotal = Number(item.price) * item.quantity

            return (
              <div className="cart-item" key={item.id}>
                <Link to={`/product/${item.id}`} aria-label={item.name}>
                  <img
                    src={item.image_url || FALLBACK}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK
                    }}
                  />
                </Link>

                <div className="cart-item-body">
                  <Link to={`/product/${item.id}`} className="cart-item-name">
                    {item.name}
                  </Link>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span className="cart-item-price">
                      {formatINR(item.price)}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-dim)',
                      }}
                    >
                      each
                    </span>
                  </div>

                  {atMax && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--rose)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Max stock reached
                    </span>
                  )}

                  <div className="cart-item-actions">
                    <div
                      className="qty-control"
                      role="group"
                      aria-label={`Quantity for ${item.name}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} strokeWidth={1.8} />
                      </button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={atMax}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} strokeWidth={1.8} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 size={13} strokeWidth={1.8} />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Line total (grid col 3 on desktop) */}
                <div
                  className="cart-line-total"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: 4,
                    gridColumn: '1 / -1',
                    paddingTop: 12,
                    marginTop: 4,
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.66rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--text-dim)',
                    }}
                  >
                    Line Total
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--ff-heading)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--champagne)',
                    }}
                  >
                    {formatINR(lineTotal)}
                  </span>
                </div>
              </div>
            )
          })}

          <Link
            to="/shop"
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 4, alignSelf: 'flex-start' }}
          >
            <ArrowRight
              size={14}
              strokeWidth={1.8}
              style={{ transform: 'rotate(180deg)' }}
            />
            Continue Shopping
          </Link>
        </div>

        {/* ---------- SUMMARY ---------- */}
        <aside className="cart-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>
              {shipping === 0 ? (
                <span style={{ color: 'var(--rose)', fontWeight: 600 }}>
                  Free
                </span>
              ) : (
                formatINR(shipping)
              )}
            </span>
          </div>

          <div className="summary-row">
            <span>Tax (5%)</span>
            <span>{formatINR(tax)}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>

          <button
            type="button"
            className="btn btn-lg btn-block"
            onClick={handleCheckout}
            style={{ marginTop: 20 }}
          >
            <Lock size={15} strokeWidth={1.8} />
            Proceed to Checkout
          </button>

          <Link
            to="/shop"
            className="btn btn-ghost btn-block"
            style={{ marginTop: 8 }}
          >
            Continue Shopping
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              marginTop: 20,
              paddingTop: 18,
              borderTop: '1px solid var(--border)',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.68rem',
                color: 'var(--text-dim)',
                letterSpacing: '0.04em',
              }}
            >
              <ShieldCheck size={13} strokeWidth={1.6} color="var(--rose)" />
              Secure
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.68rem',
                color: 'var(--text-dim)',
                letterSpacing: '0.04em',
              }}
            >
              <Truck size={13} strokeWidth={1.6} color="var(--rose)" />
              Fast Delivery
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.68rem',
                color: 'var(--text-dim)',
                letterSpacing: '0.04em',
              }}
            >
              <Lock size={13} strokeWidth={1.6} color="var(--rose)" />
              Encrypted
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}