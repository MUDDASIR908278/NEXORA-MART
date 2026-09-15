import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container page">
      <div className="empty-state">
        <h1
          style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)' }}
        >
          404
        </h1>
        <h3>Page not found</h3>
        <p>The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
        <Link to="/" className="btn">
          Back to home
        </Link>
      </div>
    </div>
  )
}