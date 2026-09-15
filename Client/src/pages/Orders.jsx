import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Loader from '../components/Loader'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api
      .get('/orders/my-orders')
      .then(({ data }) => {
        if (active) setOrders(data.orders ?? data.data ?? [])
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [])

  if (loading) return <Loader full />

  return (
    <div className="container page">
      <h1 className="page-title">My Orders</h1>
      <p className="page-subtitle">Track and review your purchases</p>

      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>When you place an order it will appear here.</p>
          <Link to="/shop" className="btn">
            Start shopping
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-head">
              <div>
                <strong>Order #{String(order.id).slice(0, 8).toUpperCase()}</strong>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`status-pill ${order.status || 'pending'}`}>
                  {order.status || 'pending'}
                </span>
                <strong>${Number(order.total ?? 0).toFixed(2)}</strong>
              </div>
            </div>

            {Array.isArray(order.order_items) &&
              order.order_items.length > 0 && (
                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: 12,
                  }}
                >
                  {order.order_items.map((item) => (
                    <div
                      className="summary-row"
                      key={item.id ?? item.product_id}
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))
      )}
    </div>
  )
}