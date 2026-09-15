import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()
  const { isAuthenticated, user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
    navigate('/')
  }

  const close = () => setOpen(false)

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          NEXORA<span>MART</span>
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" className="nav-link" onClick={close} end>
            Home
          </NavLink>
          <NavLink to="/shop" className="nav-link" onClick={close}>
            Shop
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/orders" className="nav-link" onClick={close}>
              Orders
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <ShoppingCart size={20} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          {isAuthenticated ? (
            <>
              <span
                className="icon-btn"
                title={user?.email}
                style={{ cursor: 'default' }}
              >
                <User size={20} />
              </span>
              <button
                className="icon-btn"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-sm">
              Sign in
            </Link>
          )}

          <button
            className="icon-btn nav-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}