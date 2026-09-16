import { Link } from 'react-router-dom'
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  MessageCircle,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* ============ COLUMN 1: BRAND ============ */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              NEXORA<span>MART</span>
            </div>

            <p className="eyebrow" style={{ marginBottom: 14 }}>
              For What&rsquo;s Next
            </p>

            <p className="footer-desc">
              Curated luxury essentials for the modern connoisseur. Discover
              premium electronics, refined fashion, and timeless home pieces —
              delivered with care, priced with honesty.
            </p>

            <div className="footer-contact">
              <a
                href="mailto:care@nexoramart.com"
                className="footer-contact-item"
              >
                <Mail size={15} strokeWidth={1.6} />
                <span>care@nexoramart.com</span>
              </a>
              <a href="tel:+18005550199" className="footer-contact-item">
                <Phone size={15} strokeWidth={1.6} />
                <span>+1 (800) 555-0199</span>
              </a>
              <div className="footer-contact-item">
                <MapPin size={15} strokeWidth={1.6} />
                <span>New York · London · Dubai</span>
              </div>
            </div>
          </div>

          {/* ============ COLUMN 2: SHOP ============ */}
          <div>
            <h4>Shop</h4>
            <ul>
              <li>
                <Link to="/shop">All Products</Link>
              </li>
              <li>
                <Link to="/shop?category=Electronics">Electronics</Link>
              </li>
              <li>
                <Link to="/shop?category=Fashion">Fashion</Link>
              </li>
              <li>
                <Link to="/shop?category=Home">Home &amp; Living</Link>
              </li>
              <li>
                <Link to="/shop?category=Beauty">Beauty</Link>
              </li>
              <li>
                <Link to="/shop?category=Sports">Sports</Link>
              </li>
              <li>
                <Link to="/shop?featured=true">Featured</Link>
              </li>
            </ul>
          </div>

          {/* ============ COLUMN 3: ACCOUNT ============ */}
          <div>
            <h4>Account</h4>
            <ul>
              <li>
                <Link to="/login">Sign In</Link>
              </li>
              <li>
                <Link to="/register">Create Account</Link>
              </li>
              <li>
                <Link to="/orders">My Orders</Link>
              </li>
              <li>
                <Link to="/cart">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/wishlist">Wishlist</Link>
              </li>
              <li>
                <Link to="/profile">Profile Settings</Link>
              </li>
            </ul>
          </div>

          {/* ============ COLUMN 4: SUPPORT ============ */}
          <div>
            <h4>Support</h4>
            <ul>
              <li>
                <a href="mailto:care@nexoramart.com">Contact Us</a>
              </li>
              <li>
                <Link to="/shipping">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/returns">Returns &amp; Refunds</Link>
              </li>
              <li>
                <Link to="/faq">FAQs</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ============ BOTTOM BAR ============ */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            © {year} NEXORA MART. All rights reserved. · Crafted with{' '}
            <span className="heart">♥</span> for what&rsquo;s next.
          </div>

          <div className="footer-social">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={17} strokeWidth={1.6} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Facebook size={17} strokeWidth={1.6} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <Youtube size={17} strokeWidth={1.6} />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
              <Twitter size={17} strokeWidth={1.6} />
            </a>
            <a
              href="https://wa.me/18005550199"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle size={17} strokeWidth={1.6} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}