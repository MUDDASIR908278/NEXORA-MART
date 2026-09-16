import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  Search,
  Mic,
  Camera,
  ShoppingCart,
  User,
  LogOut,
  Package,
  Heart,
  Home as HomeIcon,
  Grid3x3,
  Sparkles,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { itemCount } = useCart()
  const { isAuthenticated, user, signOut } = useAuth()
  const navigate = useNavigate()

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [drawerOpen])

  // Close drawer on route change / escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const close = () => setDrawerOpen(false)

  const handleSearch = (e) => {
    e.preventDefault()
    const term = searchTerm.trim()
    close()
    if (term) {
      navigate(`/shop?search=${encodeURIComponent(term)}`)
    } else {
      navigate('/shop')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    close()
    navigate('/')
  }

  return (
    <>
      {/* ============ TOP NAVBAR ============ */}
      <header className="navbar">
        <div className="navbar-inner">
          {/* LEFT: Hamburger (mobile) */}
          <div className="navbar-left">
            <button
              type="button"
              className="icon-btn"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={22} strokeWidth={1.6} />
            </button>
          </div>

          {/* CENTER-LEFT: Brand */}
          <Link to="/" className="brand" onClick={close} aria-label="NEXORA MART home">
            NEXORA<span>MART</span>
          </Link>

          {/* DESKTOP LINKS */}
          <nav className="nav-desktop-links" aria-label="Primary">
            <NavLink to="/" end className="nav-link">
              Home
            </NavLink>
            <NavLink to="/shop" className="nav-link">
              Shop
            </NavLink>
            <NavLink to="/shop?category=Electronics" className="nav-link">
              Electronics
            </NavLink>
            <NavLink to="/shop?category=Fashion" className="nav-link">
              Fashion
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/orders" className="nav-link">
                Orders
              </NavLink>
            )}
          </nav>

          {/* RIGHT: Cart + Auth */}
          <div className="navbar-right">
            <Link
              to="/cart"
              className="icon-btn"
              aria-label={`Cart, ${itemCount} items`}
            >
              <ShoppingCart size={20} strokeWidth={1.6} />
              {itemCount > 0 && (
                <span className="cart-badge">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link
                to="/orders"
                className="icon-btn"
                aria-label="Account"
                title={user?.email || 'Account'}
              >
                <User size={20} strokeWidth={1.6} />
              </Link>
            ) : (
              <Link to="/login" className="btn btn-sm hide-mobile">
                Sign In
              </Link>
            )}

            {isAuthenticated && (
              <button
                type="button"
                className="icon-btn hide-mobile"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={19} strokeWidth={1.6} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============ SEARCH BAR (below navbar) ============ */}
      <div className="nav-search">
        <div className="nav-search-inner">
          <Search size={18} strokeWidth={1.6} className="nav-search-icon" />

          <form onSubmit={handleSearch} style={{ width: '100%' }}>
            <input
              type="search"
              className="nav-search-input"
              placeholder="Search for products, brands and more…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
            />
          </form>

          <div className="nav-search-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Voice search"
              onClick={() =>
                navigate('/shop?search=' + encodeURIComponent(searchTerm.trim()))
              }
            >
              <Mic size={17} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Image search"
              onClick={() => navigate('/shop')}
            >
              <Camera size={17} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>

      {/* ============ MOBILE DRAWER ============ */}
      <aside
        className={`nav-drawer ${drawerOpen ? 'open' : ''}`}
        aria-hidden={!drawerOpen}
      >
        <div className="drawer-head">
          <div className="drawer-title">
            NEXORA<span>MART</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close menu"
            onClick={close}
          >
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>

        <nav className="drawer-nav">
          <NavLink to="/" end className="drawer-link" onClick={close}>
            <HomeIcon size={18} strokeWidth={1.6} />
            Home
          </NavLink>
          <NavLink to="/shop" className="drawer-link" onClick={close}>
            <Grid3x3 size={18} strokeWidth={1.6} />
            Shop All
          </NavLink>
          <NavLink
            to="/shop?category=Electronics"
            className="drawer-link"
            onClick={close}
          >
            <Sparkles size={18} strokeWidth={1.6} />
            Electronics
          </NavLink>
          <NavLink
            to="/shop?category=Fashion"
            className="drawer-link"
            onClick={close}
          >
            <Sparkles size={18} strokeWidth={1.6} />
            Fashion
          </NavLink>
          <NavLink
            to="/shop?category=Home"
            className="drawer-link"
            onClick={close}
          >
            <Sparkles size={18} strokeWidth={1.6} />
            Home & Living
          </NavLink>

          <div className="divider" style={{ margin: '12px 0' }} />

          <NavLink to="/cart" className="drawer-link" onClick={close}>
            <ShoppingCart size={18} strokeWidth={1.6} />
            Cart{itemCount > 0 ? ` (${itemCount})` : ''}
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/orders" className="drawer-link" onClick={close}>
                <Package size={18} strokeWidth={1.6} />
                My Orders
              </NavLink>
              <NavLink to="/wishlist" className="drawer-link" onClick={close}>
                <Heart size={18} strokeWidth={1.6} />
                Wishlist
              </NavLink>
            </>
          ) : null}
        </nav>

        <div className="drawer-foot">
          {isAuthenticated ? (
            <button
              type="button"
              className="btn btn-outline btn-block"
              onClick={handleSignOut}
            >
              <LogOut size={16} strokeWidth={1.6} />
              Sign Out
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to="/login"
                className="btn btn-block"
                onClick={close}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-outline btn-block"
                onClick={close}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ============ BACKDROP ============ */}
      <div
        className={`nav-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={close}
        aria-hidden="true"
      />
    </>
  )
}