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
  Clock,
} from 'lucide-react'

const CONTACT = {
  email: 'siddiquimuddasir93@gmail.com',
  phone: '+91 9082783346',
  phoneHref: 'tel:+919082783346',
  whatsapp: 'https://wa.me/919082783346',
  location: 'Malad West, Mumbai - 400095, Maharashtra, India',
  hours: 'Mon – Sat, 10:00 AM – 8:00 PM',
}

const SOCIALS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/nexora_mart28',
    icon: Instagram,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/share/1J5ursccTa/',
    icon: Facebook,
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@NEXORA_MART28',
    icon: Youtube,
  },
  {
    name: 'X',
    href: 'https://x.com/NEXORA_MART28',
    icon: Twitter,
  },
  {
    name: 'WhatsApp',
    href: CONTACT.whatsapp,
    icon: MessageCircle,
  },
]

const SHOP_LINKS = [
  { label: 'All Products', to: '/shop' },
  { label: 'Toys', to: '/shop?category=Toys' },
  { label: 'Baby', to: '/shop?category=Baby' },
  { label: 'Home', to: '/shop?category=Home' },
  { label: 'Kitchen', to: '/shop?category=Kitchen' },
  { label: 'Fashion', to: '/shop?category=Fashion' },
  { label: 'Beauty', to: '/shop?category=Beauty' },
]

const ACCOUNT_LINKS = [
  { label: 'Sign In', to: '/login' },
  { label: 'Register', to: '/register' },
  { label: 'My Orders', to: '/orders' },
  { label: 'Shopping Cart', to: '/cart' },
  { label: 'Wishlist', to: '/wishlist' },
  { label: 'Profile Settings', to: '/profile' },
]

const SUPPORT_LINKS = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Shipping Policy', to: '/shipping' },
  { label: 'Returns & Refunds', to: '/returns' },
  { label: 'FAQs', to: '/faq' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* ============ BRAND COLUMN ============ */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              NEXORA<span>MART</span>
            </div>

            <p className="eyebrow" style={{ marginBottom: 14 }}>
              For What&rsquo;s Next
            </p>

            <p className="footer-desc">
              India&rsquo;s curated destination for premium essentials —
              thoughtfully sourced electronics, fashion, home and lifestyle
              pieces, delivered with care to your doorstep.
            </p>

            <div className="footer-contact">
              <a
                href={`mailto:${CONTACT.email}`}
                className="footer-contact-item"
              >
                <Mail size={15} strokeWidth={1.6} />
                <span>{CONTACT.email}</span>
              </a>

              <a href={CONTACT.phoneHref} className="footer-contact-item">
                <Phone size={15} strokeWidth={1.6} />
                <span>{CONTACT.phone}</span>
              </a>

              <div className="footer-contact-item">
                <MapPin size={15} strokeWidth={1.6} />
                <span>{CONTACT.location}</span>
              </div>

              <div className="footer-contact-item">
                <Clock size={15} strokeWidth={1.6} />
                <span>{CONTACT.hours}</span>
              </div>
            </div>
          </div>

          {/* ============ SHOP COLUMN ============ */}
          <div>
            <h4>Shop</h4>
            <ul>
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ============ ACCOUNT COLUMN ============ */}
          <div>
            <h4>Account</h4>
            <ul>
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ============ SUPPORT COLUMN ============ */}
          <div>
            <h4>Support</h4>
            <ul>
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ============ BOTTOM BAR ============ */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            © {year} NEXORA MART. All rights reserved. · Crafted with{' '}
            <span className="heart">♥</span> for what&rsquo;s next.
          </div>

          <div className="footer-social" aria-label="Social media">
            {SOCIALS.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                title={name}
              >
                <Icon size={17} strokeWidth={1.6} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}