import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Sparkles,
  Star,
  ShoppingBag,
  Home as HomeIcon,
  Utensils,
  Shirt,
  Briefcase,
  Pencil,
  Gift,
  Heart,
  PawPrint,
  Dumbbell,
  Car,
  Palette,
  Snowflake,
} from 'lucide-react'
import api from '../lib/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

const PERKS = [
  { icon: Truck, title: 'Free Shipping', text: 'On orders over $100' },
  { icon: ShieldCheck, title: 'Secure Payment', text: '256-bit SSL encryption' },
  { icon: RefreshCw, title: 'Easy Returns', text: '30-day return window' },
  { icon: Headphones, title: '24/7 Support', text: 'Concierge always on' },
]

const CATEGORIES = [
  { label: 'For You', icon: Sparkles },
  { label: 'Toys', icon: Star },
  { label: 'Baby', icon: Heart },
  { label: 'Home', icon: HomeIcon },
  { label: 'Kitchen', icon: Utensils },
  { label: 'Fashion', icon: Shirt },
  { label: 'Bags', icon: Briefcase },
  { label: 'Stationery', icon: Pencil },
  { label: 'Gifts', icon: Gift },
  { label: 'Beauty', icon: Sparkles },
  { label: 'Pet', icon: PawPrint },
  { label: 'Sports', icon: Dumbbell },
  { label: 'Car', icon: Car },
  { label: 'Hobby', icon: Palette },
  { label: 'Seasonal', icon: Snowflake },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api
      .get('/products', { params: { limit: 8, featured: true } })
      .then(({ data }) => {
        if (!active) return
        setProducts(data.products ?? data.data ?? [])
      })
      .catch((err) => {
        if (!active) return
        setError(err.message || 'Failed to load products')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="container">
          <div className="banner-carousel">
            <div
              className="banner-slide active"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80')",
              }}
            />
            <div className="banner-overlay">
              <span className="banner-tag">New Season · Up to 40% Off</span>

              <h1 className="hero-title">
                Everything you need,{' '}
                <span>delivered to your door</span>
              </h1>

              <p className="banner-sub">
                Discover curated luxury across electronics, fashion, home and
                more — thoughtfully chosen, beautifully delivered.
              </p>

              <div className="hero-actions">
                <Link to="/shop" className="btn btn-lg">
                  Shop Now <ArrowRight size={17} strokeWidth={1.8} />
                </Link>
                <Link to="/register" className="btn btn-outline btn-lg">
                  Create Account
                </Link>
              </div>
            </div>

            <div className="banner-dots" aria-hidden="true">
              <span className="banner-dot active" />
              <span className="banner-dot" />
              <span className="banner-dot" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BADGES ============ */}
      <section className="section-sm">
        <div className="container">
          <div className="perks-row">
            {PERKS.map(({ icon: Icon, title, text }) => (
              <div className="perk" key={title}>
                <Icon size={22} strokeWidth={1.5} />
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATEGORY CHIPS ============ */}
      <section className="section-sm">
        <div className="container">
          <div className="category-chips" aria-label="Shop by category">
            {CATEGORIES.map(({ label, icon: Icon }) => (
              <Link
                key={label}
                to={
                  label === 'For You'
                    ? '/shop'
                    : `/shop?category=${encodeURIComponent(label)}`
                }
                className="chip"
              >
                <span className="chip-icon">
                  <Icon size={12} strokeWidth={2} />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Featured Products</h2>
            <Link to="/shop" className="btn-ghost">
              View All <ArrowRight size={15} strokeWidth={1.8} />
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ShoppingBag size={30} strokeWidth={1.5} />
              </div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button
                type="button"
                className="btn"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ShoppingBag size={30} strokeWidth={1.5} />
              </div>
              <h3>No products yet</h3>
              <p>New arrivals are on their way. Check back soon.</p>
              <Link to="/shop" className="btn">
                Browse Shop
              </Link>
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

      {/* ============ BOTTOM CTA ============ */}
      <section className="section">
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: 'clamp(28px, 5vw, 56px)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span className="eyebrow">The NEXORA Promise</span>
            <h2
              style={{
                fontFamily: 'var(--ff-heading)',
                fontSize: 'clamp(1.5rem, 4.2vw, 2.4rem)',
                maxWidth: 620,
              }}
            >
              Luxury finds, honest prices,{' '}
              <span className="italic-gold">endless discovery</span>
            </h2>
            <p style={{ maxWidth: 520 }}>
              Join thousands of members and unlock early access to new drops,
              member-only pricing, and complimentary express shipping.
            </p>
            <Link to="/register" className="btn btn-lg" style={{ marginTop: 8 }}>
              Become a Member <ArrowRight size={17} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}