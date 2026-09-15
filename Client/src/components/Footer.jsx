import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: 12 }}>
              NEXORA<span>MART</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 320 }}>
              Your one-stop shop for electronics, fashion, home essentials and
              more — delivered fast, priced fair.
            </p>
          </div>

          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/shop?category=Electronics">Electronics</Link></li>
              <li><Link to="/shop?category=Fashion">Fashion</Link></li>
              <li><Link to="/shop?category=Home">Home</Link></li>
            </ul>
          </div>

          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Sign in</Link></li>
              <li><Link to="/register">Create account</Link></li>
              <li><Link to="/orders">My orders</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:support@nexoramart.com">Contact us</a></li>
              <li><a href="#">Shipping policy</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Privacy policy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} NEXORA MART. All rights reserved.
        </div>
      </div>
    </footer>
  )
}