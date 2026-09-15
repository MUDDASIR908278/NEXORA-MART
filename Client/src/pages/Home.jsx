import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react'
import api from '../lib/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

const PERKS = [
  { icon: Truck, title: 'Free Shipping', text: 'On orders over $100' },
  { icon: ShieldCheck, title: 'Secure Payment', text: '256-bit SSL encryption' },
  { icon: RefreshCw, title: 'Easy Returns', text: '30-day return window' },
  { icon: Headphones, title: '24/7 Support', text: 'We are always here' },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api
      .get('/products', { params: { limit: 8, featured: true } })
      .then(({ data }) => {
        if (active) setProducts(data.products ?? data.data ?? [])
      })
      .catch(() => {})
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <span className="hero-tag">New season · Up to 40% off</span>
          <h1>
            Everything you need, <span>delivered to your door</span>
          </h1>
          <p>
            Discover thousands of curated products across electronics, fashion,
            home and more — all at prices that make sense.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn">
              Shop now <ArrowRight size={17} />
            </Link>
            <Link to="/register" className="btn btn-outline">
              Create account
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            className="product-grid"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
          >
            {PERKS.map(({ icon: Icon, title, text }) => (
              <div className="card" key={title} style={{ padding: 20 }}>
                <Icon size={22} color="var(--primary)" />
                <h4 style={{ margin: '12px 0 4px', fontSize: '0.98rem' }}>{title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>Featured Products</h2>
            <Link to="/shop" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products yet</h3>
              <p>Add products in Supabase to see them here.</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}