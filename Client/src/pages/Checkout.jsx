import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useCart } from '../context/CartContext'

export default function Checkout() {
  const { items, subtotal, shipping, tax, total, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    paymentMethod: 'cod',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        items: items.map((i) => ({
          product_id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        shipping_address: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
        payment_method: form.paymentMethod,
        notes: form.notes,
        subtotal,
        shipping,
        tax,
        total,
      }

      await api.post('/orders', payload)
      clearCart()
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <h3>Nothing to check out</h3>
          <p>Your cart is empty.</p>
          <Link to="/shop" className="btn">
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      <h1 className="page-title">Checkout</h1>
      <p className="page-subtitle">
        Enter your shipping details to place the order.
      </p>

      <div className="cart-layout">
        <form onSubmit={handleSubmit} className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <h3 style={{ marginBottom: 18 }}>Shipping Information</h3>

          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              className="form-input"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              required
            />
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
          >
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                name="phone"
                value={form.phone}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              className="form-input"
              name="address"
              value={form.address}
              onChange={onChange}
              required
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 14,
            }}
          >
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                className="form-input"
                name="city"
                value={form.city}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                className="form-input"
                name="state"
                value={form.state}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postal code</label>
              <input
                className="form-input"
                name="postalCode"
                value={form.postalCode}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Country</label>
            <input
              className="form-input"
              name="country"
              value={form.country}
              onChange={onChange}
              required
            />
          </div>

          <h3 style={{ margin: '24px 0 14px' }}>Payment Method</h3>

          <div className="form-group">
            <select
              className="form-select"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={onChange}
            >
              <option value="cod">Cash on Delivery</option>
              <option value="card">Credit / Debit Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Order notes (optional)</label>
            <textarea
              className="form-textarea"
              name="notes"
              value={form.notes}
              onChange={onChange}
              placeholder="Delivery instructions, landmarks, etc."
            />
          </div>

          <button className="btn btn-block" type="submit" disabled={submitting}>
            {submitting
              ? 'Placing order...'
              : `Place Order · $${total.toFixed(2)}`}
          </button>
        </form>

        <aside className="card">
          <h3 style={{ marginBottom: 16 }}>Your Order</h3>

          {items.map((i) => (
            <div className="summary-row" key={i.id}>
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="summary-row" style={{ marginTop: 12 }}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}