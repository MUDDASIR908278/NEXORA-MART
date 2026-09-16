import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Store,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  PieChart,
  LineChart,
  Clock,
  CheckCircle2,
  Truck,
  PackageX,
  Loader2,
} from 'lucide-react'
import api from '../../lib/api'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/', label: 'Back to Store', icon: Store, end: true },
]

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—'

const STATUS_CLASS = {
  pending: '',
  processing: '',
  shipped: '',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

const STATUS_ICON = {
  pending: Clock,
  processing: Loader2,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: PackageX,
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api
      .get('/admin/stats')
      .then(({ data }) => {
        if (active) setStats(data)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load stats')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const totals = stats?.totals ?? {
    products: 0,
    orders: 0,
    revenue: 0,
    customers: 0,
  }
  const recentOrders = stats?.recentOrders ?? []
  const lowStock = stats?.lowStock ?? []
  const weekly = stats?.weeklySales ?? []

  return (
    <div className="admin-layout">
      {/* ============ SIDEBAR ============ */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <Link to="/admin" className="admin-brand">
            NEXORA<span>MART</span>
          </Link>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={17} strokeWidth={1.7} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ============ MAIN ============ */}
      <main className="admin-main">
        {/* ---------- Header ---------- */}
        <div className="admin-page-head">
          <div>
            <h1 className="admin-title">Dashboard</h1>
            <p className="admin-subtitle">
              Overview of your store&rsquo;s performance
            </p>
          </div>
          <Link to="/admin/products" className="btn btn-sm">
            <Package size={14} strokeWidth={1.8} />
            Manage Products
          </Link>
        </div>

        {/* ---------- Error ---------- */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* ---------- Stat cards ---------- */}
        <div className="admin-stats-grid">
          <StatCard
            icon={Package}
            label="Total Products"
            value={loading ? '—' : totals.products.toLocaleString('en-IN')}
            trend={stats?.trends?.products}
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={loading ? '—' : totals.orders.toLocaleString('en-IN')}
            trend={stats?.trends?.orders}
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={loading ? '—' : formatINR(totals.revenue)}
            trend={stats?.trends?.revenue}
          />
          <StatCard
            icon={Users}
            label="Total Customers"
            value={loading ? '—' : totals.customers.toLocaleString('en-IN')}
            trend={stats?.trends?.customers}
          />
        </div>

        {/* ---------- Two-column: chart + low stock ---------- */}
        <div className="admin-grid-2">
          {/* Chart placeholder */}
          <section className="admin-card">
            <div className="admin-card-head">
              <div>
                <h3>Sales Overview</h3>
                <p className="admin-card-sub">Last 7 days</p>
              </div>
              <LineChart size={17} strokeWidth={1.6} color="var(--rose)" />
            </div>

            <div className="admin-chart">
              <div className="admin-chart-bars">
                {(weekly.length > 0
                  ? weekly
                  : Array.from({ length: 7 }).map((_, i) => ({
                      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                      value: 0,
                    }))
                ).map((d, i) => {
                  const max = Math.max(
                    1,
                    ...(weekly.map((w) => w.value) || [1])
                  )
                  const height = Math.max(6, (d.value / max) * 100)
                  return (
                    <div key={i} className="admin-chart-col">
                      <div
                        className="admin-chart-bar"
                        style={{ height: `${height}%` }}
                        title={`${d.day}: ${formatINR(d.value)}`}
                      />
                      <span className="admin-chart-label">
                        {d.day?.slice(0, 3) ?? ''}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="admin-chart-legend">
                <BarChart3 size={13} strokeWidth={1.6} />
                <span>
                  Daily revenue ·{' '}
                  {weekly.length === 0 && (
                    <em style={{ color: 'var(--text-dim)' }}>no data yet</em>
                  )}
                </span>
              </div>
            </div>
          </section>

          {/* Low stock */}
          <section className="admin-card">
            <div className="admin-card-head">
              <div>
                <h3>Low Stock Alert</h3>
                <p className="admin-card-sub">
                  {lowStock.length > 0
                    ? `${lowStock.length} product${
                        lowStock.length === 1 ? '' : 's'
                      } need restocking`
                    : 'All products are well stocked'}
                </p>
              </div>
              <AlertTriangle size={17} strokeWidth={1.6} color="#e0a0a0" />
            </div>

            {loading ? (
              <div className="admin-empty">Loading…</div>
            ) : lowStock.length === 0 ? (
              <div className="admin-empty">
                <CheckCircle2 size={26} strokeWidth={1.5} color="var(--rose)" />
                <p>No low-stock items right now.</p>
              </div>
            ) : (
              <ul className="admin-low-stock-list">
                {lowStock.slice(0, 5).map((p) => (
                  <li key={p.id} className="admin-low-stock-item">
                    <div className="admin-low-stock-info">
                      <Link to={`/product/${p.id}`} className="admin-low-stock-name">
                        {p.name}
                      </Link>
                      <span className="admin-low-stock-cat">
                        {p.category || 'Uncategorised'}
                      </span>
                    </div>
                    <span
                      className={`admin-stock-pill ${
                        p.stock === 0 ? 'out' : ''
                      }`}
                    >
                      {p.stock === 0 ? 'Out' : `${p.stock} left`}
                    </span>
                  </li>
                ))}
                {lowStock.length > 5 && (
                  <li className="admin-low-stock-more">
                    <Link to="/admin/products">
                      + {lowStock.length - 5} more
                      <ArrowRight size={12} strokeWidth={1.8} />
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </section>
        </div>

        {/* ---------- Recent orders ---------- */}
        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h3>Recent Orders</h3>
              <p className="admin-card-sub">
                Latest {Math.min(recentOrders.length, 8)} orders
              </p>
            </div>
            <Link to="/admin/orders" className="admin-card-link">
              View all <ArrowRight size={13} strokeWidth={1.8} />
            </Link>
          </div>

          {loading ? (
            <div className="admin-empty">Loading…</div>
          ) : recentOrders.length === 0 ? (
            <div className="admin-empty">
              <ShoppingBag size={26} strokeWidth={1.5} color="var(--rose)" />
              <p>No orders yet.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 8).map((o) => {
                    const StatusIcon =
                      STATUS_ICON[o.status] || Clock
                    return (
                      <tr key={o.id}>
                        <td>
                          <span className="admin-order-id">
                            #{String(o.id).slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="admin-customer">
                            {o.customer_name ||
                              o.shipping_address?.fullName ||
                              'Guest'}
                          </span>
                        </td>
                        <td className="admin-date">{formatDate(o.created_at)}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              STATUS_CLASS[o.status] || ''
                            }`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <StatusIcon size={11} strokeWidth={1.8} />
                            {o.status || 'pending'}
                          </span>
                        </td>
                        <td className="right admin-total">
                          {formatINR(o.total)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ---------- Category breakdown ---------- */}
        <div className="admin-grid-2">
          <section className="admin-card">
            <div className="admin-card-head">
              <div>
                <h3>Top Categories</h3>
                <p className="admin-card-sub">By product count</p>
              </div>
              <PieChart size={17} strokeWidth={1.6} color="var(--rose)" />
            </div>

            {loading || !stats?.categories?.length ? (
              <div className="admin-empty">
                <p style={{ color: 'var(--text-dim)' }}>No category data yet.</p>
              </div>
            ) : (
              <ul className="admin-cat-list">
                {stats.categories.slice(0, 6).map((c, i) => {
                  const max = Math.max(
                    ...stats.categories.map((x) => x.count)
                  )
                  const pct = (c.count / max) * 100
                  return (
                    <li key={i} className="admin-cat-row">
                      <div className="admin-cat-meta">
                        <span className="admin-cat-name">
                          {c.category || 'Uncategorised'}
                        </span>
                        <span className="admin-cat-count">{c.count}</span>
                      </div>
                      <div className="admin-cat-bar-track">
                        <div
                          className="admin-cat-bar"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="admin-card">
            <div className="admin-card-head">
              <div>
                <h3>Quick Insights</h3>
                <p className="admin-card-sub">Today at a glance</p>
              </div>
              <TrendingUp size={17} strokeWidth={1.6} color="var(--rose)" />
            </div>

            <div className="admin-insights">
              <Insight
                label="Avg. Order Value"
                value={
                  loading
                    ? '—'
                    : formatINR(
                        totals.orders > 0
                          ? Math.round(totals.revenue / totals.orders)
                          : 0
                      )
                }
              />
              <Insight
                label="Pending Orders"
                value={
                  loading
                    ? '—'
                    : (
                        recentOrders.filter((o) => o.status === 'pending')
                          .length || 0
                      ).toString()
                }
              />
              <Insight
                label="Out of Stock"
                value={
                  loading
                    ? '—'
                    : (
                        lowStock.filter((p) => p.stock === 0).length || 0
                      ).toString()
                }
              />
              <Insight
                label="Uncategorised"
                value={
                  loading
                    ? '—'
                    : (totals.products - (stats?.categorisedProducts ?? totals.products))
                        .toString()
                }
              />
            </div>
          </section>
        </div>
      </main>

      {/* ============ INLINE STYLES (scoped to admin) ============ */}
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: var(--bg-deep);
          color: var(--text);
        }

        .admin-sidebar {
          width: 248px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #2a0d1a 0%, #1a0810 100%);
          border-right: 1px solid var(--border);
          padding: 20px 14px;
          display: none;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        @media (min-width: 1024px) {
          .admin-sidebar { display: flex; }
        }

        .admin-sidebar-head {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px 22px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .admin-brand {
          font-family: var(--ff-heading);
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          color: var(--white);
        }
        .admin-brand span {
          font-style: italic;
          background: var(--grad-rose);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .admin-badge {
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--rose);
          background: rgba(232, 180, 160, 0.14);
          border: 1px solid var(--border-rose);
          padding: 3px 8px;
          border-radius: var(--r-full);
          margin-left: auto;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: var(--r-sm);
          color: var(--text-muted);
          font-size: 0.88rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: all 0.2s var(--ease);
          border-left: 2px solid transparent;
        }
        .admin-nav-link:hover {
          color: var(--champagne);
          background: rgba(232, 180, 160, 0.06);
        }
        .admin-nav-link.active {
          color: var(--rose);
          background: rgba(232, 180, 160, 0.1);
          border-left-color: var(--rose);
        }

        .admin-main {
          flex: 1;
          min-width: 0;
          padding: clamp(20px, 3vw, 36px);
          display: flex;
          flex-direction: column;
          gap: 22px;
          max-width: 100%;
          overflow-x: clip;
        }

        .admin-page-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .admin-title {
          font-family: var(--ff-heading);
          font-size: clamp(1.5rem, 3.4vw, 2rem);
          font-weight: 700;
          background: var(--grad-rose);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          line-height: 1.15;
          margin-bottom: 4px;
        }

        .admin-subtitle {
          color: var(--text-muted);
          font-size: 0.85rem;
          letter-spacing: 0.02em;
        }

        /* ---------- Stat cards ---------- */
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        @media (min-width: 900px) {
          .admin-stats-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        .admin-stat-card {
          background: var(--grad-surface);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid var(--border-soft);
          border-radius: var(--r-lg);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.22s var(--ease);
          position: relative;
          overflow: hidden;
        }
        .admin-stat-card::before {
          content: '';
          position: absolute;
          inset: 0 auto auto 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-rose), transparent);
          opacity: 0.6;
        }
        .admin-stat-card:hover {
          border-color: var(--border-rose);
          box-shadow: var(--shadow), 0 0 24px rgba(232, 180, 160, 0.14);
          transform: translateY(-2px);
        }

        .admin-stat-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--r-sm);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(232, 180, 160, 0.14);
          border: 1px solid var(--border-rose);
          color: var(--rose);
        }

        .admin-stat-label {
          font-size: 0.68rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-dim);
          font-weight: 600;
        }

        .admin-stat-value {
          font-family: var(--ff-heading);
          font-size: clamp(1.3rem, 3vw, 1.75rem);
          font-weight: 800;
          color: var(--champagne);
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .admin-stat-trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .admin-stat-trend.up { color: #a8e6c0; }
        .admin-stat-trend.down { color: #f0b8b8; }
        .admin-stat-trend.flat { color: var(--text-dim); }

        /* ---------- Generic card ---------- */
        .admin-card {
          background: var(--grad-surface);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid var(--border-soft);
          border-radius: var(--r-lg);
          padding: clamp(16px, 2.6vw, 22px);
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
        }
        .admin-card::before {
          content: '';
          position: absolute;
          inset: 0 auto auto 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-rose), transparent);
          opacity: 0.5;
        }

        .admin-card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
        }
        .admin-card-head h3 {
          font-family: var(--ff-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--champagne);
          letter-spacing: 0.01em;
        }
        .admin-card-sub {
          font-size: 0.72rem;
          color: var(--text-dim);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 3px;
        }
        .admin-card-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.76rem;
          color: var(--rose);
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        .admin-card-link:hover { color: var(--champagne); }

        .admin-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 900px) {
          .admin-grid-2 {
            grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
          }
        }

        /* ---------- Chart placeholder ---------- */
        .admin-chart {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .admin-chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          height: 180px;
          padding: 6px 0;
        }
        .admin-chart-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
          justify-content: flex-end;
        }
        .admin-chart-bar {
          width: 100%;
          max-width: 40px;
          min-height: 6px;
          border-radius: 6px 6px 2px 2px;
          background: linear-gradient(180deg, #e8b4a0 0%, #d4a59a 55%, #b88b7d 100%);
          box-shadow: 0 0 18px rgba(232, 180, 160, 0.28);
          transition: height 0.6s var(--ease);
          position: relative;
        }
        .admin-chart-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(180deg, rgba(255,255,255,0.25), transparent 40%);
        }
        .admin-chart-label {
          font-size: 0.62rem;
          color: var(--text-dim);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .admin-chart-legend {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.72rem;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }

        /* ---------- Low stock list ---------- */
        .admin-low-stock-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .admin-low-stock-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--r-sm);
          background: rgba(26, 8, 16, 0.4);
          border: 1px solid transparent;
          transition: all 0.18s var(--ease);
        }
        .admin-low-stock-item:hover {
          border-color: var(--border-rose);
          background: rgba(232, 180, 160, 0.05);
        }
        .admin-low-stock-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .admin-low-stock-name {
          font-size: 0.84rem;
          font-weight: 500;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .admin-low-stock-name:hover { color: var(--rose); }
        .admin-low-stock-cat {
          font-size: 0.66rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-dim);
        }
        .admin-stock-pill {
          flex-shrink: 0;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: var(--r-full);
          color: var(--champagne);
          background: rgba(232, 180, 160, 0.14);
          border: 1px solid var(--border-rose);
        }
        .admin-stock-pill.out {
          color: #f4b8b8;
          background: rgba(224, 160, 160, 0.14);
          border-color: rgba(224, 160, 160, 0.4);
        }
        .admin-low-stock-more {
          padding: 10px 12px;
          font-size: 0.76rem;
        }
        .admin-low-stock-more a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--rose);
          letter-spacing: 0.03em;
        }
        .admin-low-stock-more a:hover { color: var(--champagne); }

        /* ---------- Table ---------- */
        .admin-table-wrap {
          overflow-x: auto;
          border-radius: var(--r-sm);
          margin: -4px -4px 0;
          padding: 4px;
          scrollbar-width: none;
        }
        .admin-table-wrap::-webkit-scrollbar { display: none; }

        .admin-table {
          width: 100%;
          min-width: 560px;
          border-collapse: separate;
          border-spacing: 0 4px;
        }
        .admin-table th {
          text-align: left;
          font-size: 0.66rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-dim);
          font-weight: 600;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
        }
        .admin-table td {
          padding: 12px;
          font-size: 0.84rem;
          color: var(--text-muted);
          background: rgba(26, 8, 16, 0.35);
          border-top: 1px solid transparent;
          border-bottom: 1px solid transparent;
        }
        .admin-table tbody tr td:first-child {
          border-top-left-radius: var(--r-sm);
          border-bottom-left-radius: var(--r-sm);
        }
        .admin-table tbody tr td:last-child {
          border-top-right-radius: var(--r-sm);
          border-bottom-right-radius: var(--r-sm);
        }
        .admin-table tbody tr:hover td {
          background: rgba(232, 180, 160, 0.06);
          border-color: var(--border);
        }
        .admin-table .right { text-align: right; }

        .admin-order-id {
          font-family: var(--ff-heading);
          font-weight: 700;
          color: var(--champagne);
          letter-spacing: 0.02em;
          font-size: 0.82rem;
        }
        .admin-customer {
          color: var(--text);
          font-weight: 500;
        }
        .admin-date {
          font-size: 0.78rem;
          color: var(--text-dim);
          letter-spacing: 0.02em;
        }
        .admin-total {
          font-family: var(--ff-heading);
          font-weight: 700;
          color: var(--champagne);
          font-size: 0.92rem;
        }

        /* ---------- Category bars ---------- */
        .admin-cat-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .admin-cat-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .admin-cat-meta {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 10px;
        }
        .admin-cat-name {
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text);
          letter-spacing: 0.01em;
        }
        .admin-cat-count {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--rose);
          letter-spacing: 0.05em;
        }
        .admin-cat-bar-track {
          height: 6px;
          border-radius: var(--r-full);
          background: rgba(232, 180, 160, 0.1);
          overflow: hidden;
        }
        .admin-cat-bar {
          height: 100%;
          border-radius: var(--r-full);
          background: var(--grad-rose);
          box-shadow: 0 0 14px rgba(232, 180, 160, 0.4);
          transition: width 0.6s var(--ease);
        }

        /* ---------- Insights ---------- */
        .admin-insights {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .admin-insight {
          background: rgba(26, 8, 16, 0.4);
          border: 1px solid var(--border);
          border-radius: var(--r-sm);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: all 0.18s var(--ease);
        }
        .admin-insight:hover {
          border-color: var(--border-rose);
          background: rgba(232, 180, 160, 0.05);
        }
        .admin-insight-label {
          font-size: 0.62rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-dim);
          font-weight: 600;
        }
        .admin-insight-value {
          font-family: var(--ff-heading);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--champagne);
          letter-spacing: -0.01em;
        }

        /* ---------- Empty ---------- */
        .admin-empty {
          padding: 34px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--text-muted);
          font-size: 0.86rem;
          text-align: center;
          letter-spacing: 0.02em;
        }

        /* ---------- Mobile sidebar fallback ---------- */
        @media (max-width: 1023px) {
          .admin-mobile-nav {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding-bottom: 6px;
            scrollbar-width: none;
            margin: -4px -20px 0;
            padding-inline: 20px;
          }
          .admin-mobile-nav::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </div>
  )
}

/* ============================================================
   Sub-components
   ============================================================ */

function StatCard({ icon: Icon, label, value, trend }) {
  const trendDir =
    trend == null ? 'flat' : trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat'
  const TrendIcon =
    trendDir === 'up' ? TrendingUp : trendDir === 'down' ? TrendingDown : null

  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">
        <Icon size={18} strokeWidth={1.7} />
      </div>
      <div>
        <div className="admin-stat-label">{label}</div>
        <div className="admin-stat-value">{value}</div>
      </div>
      {TrendIcon && (
        <div className={`admin-stat-trend ${trendDir}`}>
          <TrendIcon size={12} strokeWidth={2} />
          {Math.abs(trend)}% vs last week
        </div>
      )}
    </div>
  )
}

function Insight({ label, value }) {
  return (
    <div className="admin-insight">
      <span className="admin-insight-label">{label}</span>
      <span className="admin-insight-value">{value}</span>
    </div>
  )
}