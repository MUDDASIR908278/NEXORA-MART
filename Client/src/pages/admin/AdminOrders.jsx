import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
} from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

/* ------------------------------------------------------------------ */
/*  Luxury palette                                                     */
/* ------------------------------------------------------------------ */
const COLORS = {
  burgundy: '#5C1A2B',
  burgundyDark: '#3E0F1C',
  burgundyLight: '#7A2438',
  roseGold: '#B76E79',
  roseGoldLight: '#E8B4B8',
  roseGoldDark: '#8E4E58',
  cream: '#F5EFE6',
  creamDark: '#E8DFD2',
  creamSoft: '#FBF7F0',
  ink: '#2B1418',
  muted: '#8A6E72',
  border: 'rgba(183, 110, 121, 0.25)',
  danger: '#B03A48',
  success: '#4E7A5C',
  info: '#4A6B8A',
  warning: '#B8863A',
}

/* ------------------------------------------------------------------ */
/*  Status metadata                                                    */
/* ------------------------------------------------------------------ */
const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
]

const STATUS_STYLES = {
  pending: { bg: 'rgba(184, 134, 58, 0.12)', color: COLORS.warning, border: 'rgba(184, 134, 58, 0.35)' },
  confirmed: { bg: 'rgba(74, 107, 138, 0.12)', color: COLORS.info, border: 'rgba(74, 107, 138, 0.35)' },
  packed: { bg: 'rgba(122, 36, 56, 0.10)', color: COLORS.burgundyLight, border: 'rgba(122, 36, 56, 0.30)' },
  shipped: { bg: 'rgba(183, 110, 121, 0.14)', color: COLORS.roseGoldDark, border: 'rgba(183, 110, 121, 0.35)' },
  delivered: { bg: 'rgba(78, 122, 92, 0.12)', color: COLORS.success, border: 'rgba(78, 122, 92, 0.35)' },
  cancelled: { bg: 'rgba(176, 58, 72, 0.12)', color: COLORS.danger, border: 'rgba(176, 58, 72, 0.35)' },
}

const PAGE_SIZE = 8

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

function AdminSidebar({ activePath }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <span style={styles.brandMark}>N</span>
        <div>
          <div style={styles.brandName}>NEXORA</div>
          <div style={styles.brandSub}>Admin Suite</div>
        </div>
      </div>

      <nav style={styles.navList}>
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
          const active =
            activePath === to ||
            (to !== '/admin' && activePath?.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              style={{
                ...styles.navItem,
                ...(active ? styles.navItemActive : null),
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={styles.sidebarFooter}>
        <div style={styles.userChip}>
          <div style={styles.userAvatar}>
            {(user?.email?.[0] || 'A').toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={styles.userName}>Administrator</div>
            <div style={styles.userEmail}>{user?.email || 'admin@nexora'}</div>
          </div>
        </div>
        <button onClick={handleSignOut} style={styles.signOutBtn}>
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatCurrency(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '$0.00'
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function customerName(order) {
  const addr = order?.shipping_address || {}
  return (
    order?.customer_name ||
    addr.fullName ||
    order?.profiles?.full_name ||
    order?.user?.email ||
    'Guest'
  )
}

function shortId(id) {
  return String(id || '').slice(0, 8).toUpperCase()
}

/* ------------------------------------------------------------------ */
/*  StatusPill                                                         */
/* ------------------------------------------------------------------ */
function StatusPill({ status }) {
  const s = String(status || 'pending').toLowerCase()
  const palette = STATUS_STYLES[s] || STATUS_STYLES.pending
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
      }}
    >
      {s}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  StatusDropdown                                                     */
/* ------------------------------------------------------------------ */
function StatusDropdown({ value, disabled, onChange }) {
  const s = String(value || 'pending').toLowerCase()
  const palette = STATUS_STYLES[s] || STATUS_STYLES.pending
  return (
    <select
      value={s}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      style={{
        padding: '6px 26px 6px 12px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        cursor: disabled ? 'wait' : 'pointer',
        outline: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(
          palette.color
        )}' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
      }}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}

/* ------------------------------------------------------------------ */
/*  Order Detail Modal                                                 */
/* ------------------------------------------------------------------ */
function OrderDetailModal({ order, onClose }) {
  if (!order) return null

  const addr = order.shipping_address || {}
  const items = Array.isArray(order.order_items) ? order.order_items : []

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header style={styles.modalHeader}>
          <div>
            <div style={styles.modalEyebrow}>Order detail</div>
            <h2 style={styles.modalTitle}>
              #{shortId(order.id)}
            </h2>
          </div>
          <button
            style={styles.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div style={styles.modalRule} />

        <div style={styles.modalGrid}>
          <section>
            <h3 style={styles.modalSectionTitle}>Customer</h3>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Name</span>
              <span style={styles.detailValue}>{customerName(order)}</span>
            </div>
            {addr.email && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Email</span>
                <span style={styles.detailValue}>{addr.email}</span>
              </div>
            )}
            {addr.phone && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Phone</span>
                <span style={styles.detailValue}>{addr.phone}</span>
              </div>
            )}

            <h3 style={{ ...styles.modalSectionTitle, marginTop: 22 }}>
              Shipping address
            </h3>
            <div style={styles.addressBlock}>
              {addr.address && <div>{addr.address}</div>}
              <div>
                {[addr.city, addr.state, addr.postalCode]
                  .filter(Boolean)
                  .join(', ')}
              </div>
              {addr.country && <div>{addr.country}</div>}
              {!addr.address && !addr.city && (
                <div style={styles.mutedText}>No address on file.</div>
              )}
            </div>
          </section>

          <section>
            <h3 style={styles.modalSectionTitle}>Order info</h3>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Status</span>
              <span className="detail-value">
                <StatusPill status={order.status} />
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Payment</span>
              <span style={styles.detailValue}>
                {order.payment_method || 'cod'}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Placed</span>
              <span style={styles.detailValue}>
                {formatDate(order.created_at)}
              </span>
            </div>

            <h3 style={{ ...styles.modalSectionTitle, marginTop: 22 }}>
              Totals
            </h3>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Subtotal</span>
              <span style={styles.detailValue}>
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Shipping</span>
              <span style={styles.detailValue}>
                {formatCurrency(order.shipping)}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Tax</span>
              <span style={styles.detailValue}>
                {formatCurrency(order.tax)}
              </span>
            </div>
            <div style={styles.detailTotalRow}>
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </section>
        </div>

        <h3 style={{ ...styles.modalSectionTitle, marginTop: 24 }}>
          Items ({items.length})
        </h3>

        <div style={styles.itemsTable}>
          <div style={styles.itemsHeader}>
            <span>Product</span>
            <span style={{ textAlign: 'center' }}>Qty</span>
            <span style={{ textAlign: 'right' }}>Price</span>
            <span style={{ textAlign: 'right' }}>Line</span>
          </div>
          {items.length === 0 ? (
            <div style={styles.itemsEmpty}>No items on this order.</div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.id || `${item.product_id}-${idx}`}
                style={styles.itemsRow}
              >
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={{ textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <span style={{ textAlign: 'right' }}>
                  {formatCurrency(item.price)}
                </span>
                <span style={{ textAlign: 'right', fontWeight: 700 }}>
                  {formatCurrency(
                    Number(item.price) * Number(item.quantity)
                  )}
                </span>
              </div>
            ))
          )}
        </div>

        {order.notes && (
          <>
            <h3 style={{ ...styles.modalSectionTitle, marginTop: 22 }}>
              Notes
            </h3>
            <div style={styles.notesBox}>{order.notes}</div>
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [term, setTerm] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  /* ---------------- Fetch ---------------- */
  const fetchOrders = useCallback(async (showRefresh = false) => {
    showRefresh ? setRefreshing(true) : setLoading(true)
    setError('')
    try {
      const params = { limit: 200 }
      if (activeTab !== 'all') params.status = activeTab
      const { data } = await api.get('/orders', { params })
      const list = data.orders ?? data.data ?? []
      setOrders(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.message)
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    setPage(1)
  }, [activeTab, term])

  /* ---------------- Derived ---------------- */
  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) => {
      const hay = `${o.id} ${customerName(o)} ${o.status} ${
        o.shipping_address?.email || ''
      }`.toLowerCase()
      return hay.includes(q)
    })
  }, [orders, term])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  /* ---------------- Actions ---------------- */
  const handleStatusChange = async (orderId, newStatus) => {
    const prev = orders
    setUpdatingId(orderId)
    setOrders((list) =>
      list.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      toast.success(`Order ${shortId(orderId)} marked ${newStatus}.`)
    } catch (err) {
      setOrders(prev)
      toast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  /* ---------------- Render ---------------- */
  return (
    <div style={styles.page}>
      <AdminSidebar activePath="/admin/orders" />

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Orders</h1>
            <p style={styles.subtitle}>
              Track, filter and update every customer order in one place.
            </p>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            style={styles.refreshBtn}
          >
            <RefreshCw
              size={16}
              style={{
                animation: refreshing ? 'nx-spin 0.9s linear infinite' : 'none',
              }}
            />
            <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </header>

        {/* Search */}
        <div style={styles.toolbar}>
          <div style={styles.searchWrap}>
            <Search size={16} style={styles.searchIcon} />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search by order ID, customer, email…"
              style={styles.searchInput}
            />
          </div>
          <div style={styles.countChip}>
            {filtered.length} order{filtered.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Status tabs */}
        <div style={styles.tabs}>
          {STATUS_TABS.map((tab) => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...styles.tab,
                  ...(active ? styles.tabActive : null),
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {error && (
          <div style={styles.alertError}>
            <X size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingWrap}>
              <div style={styles.spinner} />
            </div>
          ) : paginated.length === 0 ? (
            <div style={styles.emptyState}>
              <ShoppingBag size={36} color={COLORS.roseGold} />
              <h3 style={styles.emptyTitle}>No orders found</h3>
              <p style={styles.emptyText}>
                Try a different status filter or search term.
              </p>
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <div style={styles.thead}>
                <span>Order ID</span>
                <span>Customer</span>
                <span style={{ textAlign: 'right' }}>Total</span>
                <span>Status</span>
                <span>Date</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>

              {paginated.map((order) => (
                <div key={order.id} style={styles.trow}>
                  <span style={styles.orderIdCell}>
                    #{shortId(order.id)}
                  </span>
                  <span style={styles.customerCell}>
                    {customerName(order)}
                  </span>
                  <span style={styles.totalCell}>
                    {formatCurrency(order.total)}
                  </span>
                  <span>
                    <StatusDropdown
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(s) => handleStatusChange(order.id, s)}
                    />
                  </span>
                  <span style={styles.dateCell}>
                    {formatDate(order.created_at)}
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelected(order)}
                      style={styles.viewBtn}
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                ...styles.pageBtn,
                ...(page <= 1 ? styles.pageBtnDisabled : null),
              }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                ...styles.pageBtn,
                ...(page >= totalPages ? styles.pageBtnDisabled : null),
              }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {selected && (
          <OrderDetailModal
            order={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: COLORS.cream,
    color: COLORS.ink,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* Sidebar */
  sidebar: {
    width: 260,
    flexShrink: 0,
    background: `linear-gradient(180deg, ${COLORS.burgundy} 0%, ${COLORS.burgundyDark} 100%)`,
    color: COLORS.cream,
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 18px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    boxShadow: '4px 0 24px rgba(62, 15, 28, 0.35)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 24,
    borderBottom: `1px solid rgba(232, 180, 184, 0.18)`,
    marginBottom: 22,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    background: `linear-gradient(135deg, ${COLORS.roseGold}, ${COLORS.roseGoldLight})`,
    color: COLORS.burgundyDark,
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: -1,
    boxShadow: '0 6px 18px rgba(183, 110, 121, 0.4)',
  },
  brandName: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: 2,
    color: COLORS.cream,
  },
  brandSub: {
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: COLORS.roseGoldLight,
    opacity: 0.85,
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 14px',
    borderRadius: 10,
    color: 'rgba(245, 239, 230, 0.78)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.18s ease',
  },
  navItemActive: {
    background: 'rgba(232, 180, 184, 0.14)',
    color: COLORS.cream,
    boxShadow: `inset 3px 0 0 ${COLORS.roseGold}`,
  },
  sidebarFooter: {
    borderTop: `1px solid rgba(232, 180, 184, 0.18)`,
    paddingTop: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 10,
    background: 'rgba(0,0,0,0.18)',
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: COLORS.roseGoldLight,
    color: COLORS.burgundyDark,
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  userName: { fontSize: 13, fontWeight: 600, color: COLORS.cream },
  userEmail: {
    fontSize: 11,
    color: 'rgba(245, 239, 230, 0.6)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 140,
  },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 10,
    background: 'transparent',
    border: `1px solid rgba(232, 180, 184, 0.28)`,
    color: COLORS.roseGoldLight,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  /* Main */
  main: {
    flex: 1,
    padding: '36px 40px 60px',
    maxWidth: 1320,
    margin: '0 auto',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 20,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  title: {
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: -0.6,
    color: COLORS.burgundy,
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 6,
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 18px',
    borderRadius: 10,
    background: 'transparent',
    border: `1px solid ${COLORS.burgundy}`,
    color: COLORS.burgundy,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  toolbar: {
    display: 'flex',
    gap: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    maxWidth: 460,
  },
  searchIcon: {
    position: 'absolute',
    top: '50%',
    left: 14,
    transform: 'translateY(-50%)',
    color: COLORS.roseGold,
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '11px 14px 11px 40px',
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.creamSoft,
    color: COLORS.ink,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  countChip: {
    padding: '8px 16px',
    borderRadius: 999,
    background: 'rgba(183, 110, 121, 0.12)',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.roseGoldDark,
    fontSize: 12.5,
    fontWeight: 700,
    letterSpacing: 0.4,
  },

  tabs: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 20,
    padding: 6,
    borderRadius: 12,
    background: 'rgba(232, 223, 210, 0.5)',
    border: `1px solid ${COLORS.border}`,
  },
  tab: {
    padding: '9px 16px',
    borderRadius: 8,
    background: 'transparent',
    border: 'none',
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.3,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  tabActive: {
    background: `linear-gradient(135deg, ${COLORS.burgundy} 0%, ${COLORS.burgundyLight} 100%)`,
    color: COLORS.cream,
    boxShadow: '0 6px 16px rgba(92, 26, 43, 0.25)',
  },

  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 10,
    background: 'rgba(176, 58, 72, 0.08)',
    border: `1px solid rgba(176, 58, 72, 0.3)`,
    color: COLORS.danger,
    fontSize: 14,
    marginBottom: 18,
  },

  tableCard: {
    background: COLORS.creamSoft,
    borderRadius: 14,
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 8px 24px rgba(92, 26, 43, 0.06)',
    overflow: 'hidden',
  },

  loadingWrap: {
    display: 'grid',
    placeItems: 'center',
    padding: '80px 0',
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: `3px solid ${COLORS.border}`,
    borderTopColor: COLORS.roseGold,
    animation: 'nx-spin 0.75s linear infinite',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '70px 20px',
    textAlign: 'center',
  },
  emptyTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.burgundy,
  },
  emptyText: {
    margin: 0,
    fontSize: 13,
    color: COLORS.muted,
  },

  tableWrap: {
    width: '100%',
  },
  thead: {
    display: 'grid',
    gridTemplateColumns: '110px minmax(160px, 1.4fr) 110px 150px 120px 110px',
    gap: 12,
    padding: '14px 22px',
    background: `linear-gradient(90deg, ${COLORS.burgundy} 0%, ${COLORS.burgundyLight} 100%)`,
    color: COLORS.cream,
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  trow: {
    display: 'grid',
    gridTemplateColumns: '110px minmax(160px, 1.4fr) 110px 150px 120px 110px',
    gap: 12,
    alignItems: 'center',
    padding: '14px 22px',
    borderBottom: `1px solid rgba(183, 110, 121, 0.14)`,
    fontSize: 13.5,
    transition: 'background 0.15s ease',
  },
  orderIdCell: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontWeight: 700,
    color: COLORS.burgundy,
    fontSize: 12.5,
    letterSpacing: 0.4,
  },
  customerCell: {
    fontWeight: 600,
    color: COLORS.ink,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  totalCell: {
    textAlign: 'right',
    fontWeight: 700,
    color: COLORS.burgundy,
  },
  dateCell: {
    color: COLORS.muted,
    fontSize: 12.5,
  },
  viewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    borderRadius: 8,
    background: 'transparent',
    border: `1px solid ${COLORS.roseGold}`,
    color: COLORS.roseGoldDark,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.3,
    cursor: 'pointer',
  },

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 28,
  },
  pageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 16px',
    borderRadius: 10,
    background: COLORS.creamSoft,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.burgundy,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  pageBtnDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: 500,
  },

  /* Modal */
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(43, 20, 24, 0.55)',
    backdropFilter: 'blur(4px)',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    zIndex: 200,
  },
  modal: {
    background: COLORS.creamSoft,
    borderRadius: 16,
    width: '100%',
    maxWidth: 800,
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '28px 32px 32px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 24px 60px rgba(43, 20, 24, 0.4)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  modalEyebrow: {
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: COLORS.roseGoldDark,
    marginBottom: 4,
  },
  modalTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: COLORS.burgundy,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    letterSpacing: 0.5,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 9,
    display: 'grid',
    placeItems: 'center',
    background: 'transparent',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.burgundy,
    cursor: 'pointer',
  },
  modalRule: {
    height: 1,
    background: `linear-gradient(90deg, ${COLORS.roseGold} 0%, transparent 100%)`,
    margin: '16px 0 22px',
    opacity: 0.55,
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 28,
  },
  modalSectionTitle: {
    margin: '0 0 12px',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: COLORS.roseGoldDark,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: '7px 0',
    fontSize: 13.5,
    borderBottom: `1px dashed rgba(183, 110, 121, 0.18)`,
  },
  detailLabel: { color: COLORS.muted, fontWeight: 500 },
  detailValue: {
    fontWeight: 600,
    color: COLORS.ink,
    textAlign: 'right',
    wordBreak: 'break-word',
  },
  detailTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0 0',
    marginTop: 6,
    fontSize: 16,
    fontWeight: 800,
    color: COLORS.burgundy,
    borderTop: `1px solid ${COLORS.border}`,
  },
  addressBlock: {
    fontSize: 13.5,
    lineHeight: 1.7,
    color: COLORS.ink,
    padding: '12px 14px',
    borderRadius: 10,
    background: COLORS.creamDark,
  },
  mutedText: { color: COLORS.muted, fontStyle: 'italic' },

  itemsTable: {
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    overflow: 'hidden',
    background: '#fff',
  },
  itemsHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 70px 100px 110px',
    gap: 10,
    padding: '10px 16px',
    background: COLORS.creamDark,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.burgundy,
  },
  itemsRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 70px 100px 110px',
    gap: 10,
    padding: '12px 16px',
    borderTop: `1px solid rgba(183, 110, 121, 0.12)`,
    fontSize: 13.5,
  },
  itemsEmpty: {
    padding: '24px 16px',
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 13,
  },

  notesBox: {
    padding: '12px 16px',
    borderRadius: 10,
    background: COLORS.creamDark,
    fontSize: 13.5,
    color: COLORS.ink,
    lineHeight: 1.6,
  },
}

/* Inject keyframes once */
if (typeof document !== 'undefined') {
  const STYLE_ID = 'nx-admin-orders-keyframes'
  if (!document.getElementById(STYLE_ID)) {
    const tag = document.createElement('style')
    tag.id = STYLE_ID
    tag.textContent =
      '@keyframes nx-spin { to { transform: rotate(360deg); } }'
    document.head.appendChild(tag)
  }
}