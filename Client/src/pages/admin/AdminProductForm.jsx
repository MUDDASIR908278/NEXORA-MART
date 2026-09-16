import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
  Save,
  X,
  Image as ImageIcon,
  Star,
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
}

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home',
  'Beauty',
  'Sports',
  'Books',
  'Toys',
  'Grocery',
]

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'

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
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    compare_at_price: '',
    category: 'Electronics',
    stock: '',
    image_url: '',
    rating: '4.5',
    featured: false,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  /* ---------------- Load product when editing ---------------- */
  useEffect(() => {
    if (!isEdit) return

    let active = true
    setLoading(true)
    setLoadError('')

    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        if (!active) return
        const p = data.product ?? data
        setForm({
          name: p.name ?? '',
          description: p.description ?? '',
          price: p.price != null ? String(p.price) : '',
          compare_at_price:
            p.compare_at_price != null ? String(p.compare_at_price) : '',
          category: p.category ?? 'Electronics',
          stock: p.stock != null ? String(p.stock) : '',
          image_url: p.image_url ?? '',
          rating: p.rating != null ? String(p.rating) : '4.5',
          featured: Boolean(p.featured),
        })
      })
      .catch((err) => active && setLoadError(err.message))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [id, isEdit])

  /* ---------------- Handlers ---------------- */
  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validate = () => {
    const next = {}

    if (!form.name.trim()) next.name = 'Product name is required.'

    const price = Number(form.price)
    if (form.price === '' || Number.isNaN(price) || price < 0) {
      next.price = 'Enter a valid price (0 or greater).'
    }

    if (form.compare_at_price !== '') {
      const cmp = Number(form.compare_at_price)
      if (Number.isNaN(cmp) || cmp < 0) {
        next.compare_at_price = 'Compare-at price must be 0 or greater.'
      }
    }

    const stock = Number(form.stock)
    if (form.stock === '' || Number.isNaN(stock) || stock < 0) {
      next.stock = 'Enter a valid stock quantity (0 or greater).'
    }

    const rating = Number(form.rating)
    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      next.rating = 'Rating must be between 0 and 5.'
    }

    if (!form.category) next.category = 'Select a category.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        compare_at_price:
          form.compare_at_price === '' ? null : Number(form.compare_at_price),
        category: form.category,
        stock: Number(form.stock),
        image_url: form.image_url.trim(),
        rating: Number(form.rating),
        featured: form.featured,
      }

      if (isEdit) {
        await api.put(`/products/${id}`, payload)
        toast.success('Product updated.')
      } else {
        await api.post('/products', payload)
        toast.success('Product created.')
      }

      navigate('/admin/products')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => navigate('/admin/products')

  const previewSrc = useMemo(
    () => form.image_url.trim() || FALLBACK_IMG,
    [form.image_url]
  )

  /* ---------------- Render ---------------- */
  return (
    <div style={styles.page}>
      <AdminSidebar activePath="/admin/products" />

      <main style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <button onClick={handleCancel} style={styles.backBtn}>
              <ArrowLeft size={16} />
              <span>Back to products</span>
            </button>
            <h1 style={styles.title}>
              {isEdit ? 'Edit Product' : 'Add Product'}
            </h1>
            <p style={styles.subtitle}>
              {isEdit
                ? 'Update the details of this product.'
                : 'Fill in the details to publish a new product.'}
            </p>
          </div>
          <div style={styles.headerDecor} aria-hidden="true" />
        </header>

        {loadError && (
          <div style={styles.alertError}>
            <X size={16} />
            <span>{loadError}</span>
          </div>
        )}

        {loading ? (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.formGrid} noValidate>
            {/* ---------- Left: fields ---------- */}
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Product details</h2>
              <div style={styles.cardRule} />

              <div style={styles.field}>
                <label style={styles.label} htmlFor="name">
                  Product name <span style={styles.req}>*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={onChange}
                  placeholder="e.g. Aurora Wireless Headphones"
                  style={{
                    ...styles.input,
                    ...(errors.name ? styles.inputError : null),
                  }}
                />
                {errors.name && <span style={styles.err}>{errors.name}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={5}
                  placeholder="Tell customers what makes this product special…"
                  style={styles.textarea}
                />
              </div>

              <div style={styles.row2}>
                <div style={styles.field}>
                  <label style={styles.label} htmlFor="price">
                    Price (USD) <span style={styles.req}>*</span>
                  </label>
                  <div style={styles.inputPrefixWrap}>
                    <span style={styles.inputPrefix}>$</span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={onChange}
                      placeholder="0.00"
                      style={{
                        ...styles.input,
                        ...styles.inputWithPrefix,
                        ...(errors.price ? styles.inputError : null),
                      }}
                    />
                  </div>
                  {errors.price && <span style={styles.err}>{errors.price}</span>}
                </div>

                <div style={styles.field}>
                  <label style={styles.label} htmlFor="compare_at_price">
                    Compare-at price
                  </label>
                  <div style={styles.inputPrefixWrap}>
                    <span style={styles.inputPrefix}>$</span>
                    <input
                      id="compare_at_price"
                      name="compare_at_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.compare_at_price}
                      onChange={onChange}
                      placeholder="Optional"
                      style={{
                        ...styles.input,
                        ...styles.inputWithPrefix,
                        ...(errors.compare_at_price
                          ? styles.inputError
                          : null),
                      }}
                    />
                  </div>
                  {errors.compare_at_price && (
                    <span style={styles.err}>{errors.compare_at_price}</span>
                  )}
                </div>
              </div>

              <div style={styles.row2}>
                <div style={styles.field}>
                  <label style={styles.label} htmlFor="category">
                    Category <span style={styles.req}>*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    style={{
                      ...styles.select,
                      ...(errors.category ? styles.inputError : null),
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <span style={styles.err}>{errors.category}</span>
                  )}
                </div>

                <div style={styles.field}>
                  <label style={styles.label} htmlFor="stock">
                    Stock quantity <span style={styles.req}>*</span>
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={onChange}
                    placeholder="0"
                    style={{
                      ...styles.input,
                      ...(errors.stock ? styles.inputError : null),
                    }}
                  />
                  {errors.stock && <span style={styles.err}>{errors.stock}</span>}
                </div>
              </div>

              <div style={styles.row2}>
                <div style={styles.field}>
                  <label style={styles.label} htmlFor="rating">
                    Rating (0 – 5)
                  </label>
                  <input
                    id="rating"
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={onChange}
                    placeholder="4.5"
                    style={{
                      ...styles.input,
                      ...(errors.rating ? styles.inputError : null),
                    }}
                  />
                  {errors.rating && (
                    <span style={styles.err}>{errors.rating}</span>
                  )}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Featured product</label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, featured: !f.featured }))
                    }
                    aria-pressed={form.featured}
                    style={{
                      ...styles.toggle,
                      ...(form.featured ? styles.toggleOn : null),
                    }}
                  >
                    <span
                      style={{
                        ...styles.toggleKnob,
                        ...(form.featured ? styles.toggleKnobOn : null),
                      }}
                    />
                    <span
                      style={{
                        ...styles.toggleLabel,
                        ...(form.featured ? styles.toggleLabelOn : null),
                      }}
                    >
                      {form.featured ? 'Featured' : 'Not featured'}
                    </span>
                  </button>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="image_url">
                  Image URL
                </label>
                <div style={styles.inputIconWrap}>
                  <ImageIcon size={16} style={styles.inputIcon} />
                  <input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={form.image_url}
                    onChange={onChange}
                    placeholder="https://images.example.com/product.jpg"
                    style={{ ...styles.input, ...styles.inputWithIcon }}
                  />
                </div>
              </div>
            </section>

            {/* ---------- Right: preview + actions ---------- */}
            <aside style={styles.sidebarCol}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Preview</h2>
                <div style={styles.cardRule} />

                <div style={styles.previewBox}>
                  <img
                    src={previewSrc}
                    alt="Product preview"
                    style={styles.previewImg}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMG
                    }}
                  />
                  {form.category && (
                    <span style={styles.previewCategory}>{form.category}</span>
                  )}
                </div>

                <div style={styles.previewMeta}>
                  <h3 style={styles.previewName}>
                    {form.name.trim() || 'Untitled product'}
                  </h3>

                  <div style={styles.previewRating}>
                    <Star size={14} fill={COLORS.roseGold} color={COLORS.roseGold} />
                    <span>{Number(form.rating || 0).toFixed(1)}</span>
                  </div>

                  <div style={styles.previewPriceRow}>
                    <span style={styles.previewPrice}>
                      {form.price === ''
                        ? '$0.00'
                        : `$${Number(form.price).toFixed(2)}`}
                    </span>
                    {form.compare_at_price !== '' &&
                      Number(form.compare_at_price) >
                        Number(form.price || 0) && (
                        <span style={styles.previewCompare}>
                          ${Number(form.compare_at_price).toFixed(2)}
                        </span>
                      )}
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Actions</h2>
                <div style={styles.cardRule} />

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...styles.saveBtn,
                    ...(saving ? styles.saveBtnDisabled : null),
                  }}
                >
                  <Save size={17} />
                  <span>
                    {saving
                      ? 'Saving…'
                      : isEdit
                        ? 'Save changes'
                        : 'Create product'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  style={styles.cancelBtn}
                >
                  <X size={17} />
                  <span>Cancel</span>
                </button>

                <p style={styles.hint}>
                  {isEdit
                    ? 'Changes go live immediately after saving.'
                    : 'The product will appear in the shop once saved.'}
                </p>
              </div>
            </aside>
          </form>
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
    transition: 'all 0.18s ease',
  },

  /* Main */
  main: {
    flex: 1,
    padding: '36px 40px 60px',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
  header: {
    position: 'relative',
    marginBottom: 28,
    paddingBottom: 22,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  headerDecor: {
    position: 'absolute',
    top: -20,
    right: 0,
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(183,110,121,0.18) 0%, transparent 70%)`,
    pointerEvents: 'none',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    border: 'none',
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    padding: 0,
    marginBottom: 12,
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
    marginBottom: 20,
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

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 340px',
    gap: 24,
    alignItems: 'start',
  },

  card: {
    background: COLORS.creamSoft,
    borderRadius: 14,
    padding: '24px 24px 26px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 8px 24px rgba(92, 26, 43, 0.06)',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 0.4,
    color: COLORS.burgundy,
    margin: 0,
    textTransform: 'uppercase',
  },
  cardRule: {
    height: 1,
    background: `linear-gradient(90deg, ${COLORS.roseGold} 0%, transparent 100%)`,
    margin: '10px 0 22px',
    opacity: 0.5,
  },

  sidebarCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    position: 'sticky',
    top: 36,
  },

  field: { marginBottom: 18 },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  label: {
    display: 'block',
    fontSize: 12.5,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: COLORS.burgundy,
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  req: { color: COLORS.roseGold },

  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 9,
    border: `1px solid ${COLORS.border}`,
    background: '#FFFFFF',
    color: COLORS.ink,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: COLORS.danger,
    boxShadow: '0 0 0 3px rgba(176, 58, 72, 0.12)',
  },
  inputWithPrefix: {
    paddingLeft: 32,
  },
  inputWithIcon: {
    paddingLeft: 38,
  },
  inputPrefixWrap: { position: 'relative' },
  inputPrefix: {
    position: 'absolute',
    top: '50%',
    left: 12,
    transform: 'translateY(-50%)',
    color: COLORS.roseGold,
    fontWeight: 700,
    fontSize: 14,
    pointerEvents: 'none',
  },
  inputIconWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute',
    top: '50%',
    left: 12,
    transform: 'translateY(-50%)',
    color: COLORS.roseGold,
    pointerEvents: 'none',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 9,
    border: `1px solid ${COLORS.border}`,
    background: '#FFFFFF',
    color: COLORS.ink,
    fontSize: 14,
    outline: 'none',
    resize: 'vertical',
    minHeight: 110,
    lineHeight: 1.55,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 9,
    border: `1px solid ${COLORS.border}`,
    background: '#FFFFFF',
    color: COLORS.ink,
    fontSize: 14,
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  err: {
    display: 'block',
    marginTop: 6,
    fontSize: 12,
    color: COLORS.danger,
  },

  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 14px 8px 8px',
    borderRadius: 999,
    background: '#FFFFFF',
    border: `1px solid ${COLORS.border}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toggleOn: {
    background: `linear-gradient(135deg, ${COLORS.burgundy} 0%, ${COLORS.burgundyLight} 100%)`,
    borderColor: COLORS.burgundy,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: COLORS.creamDark,
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  toggleKnobOn: {
    background: `linear-gradient(135deg, ${COLORS.roseGoldLight}, ${COLORS.roseGold})`,
    boxShadow: '0 0 0 3px rgba(232, 180, 184, 0.28)',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.muted,
  },
  toggleLabelOn: { color: COLORS.cream },

  /* Preview */
  previewBox: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: 12,
    overflow: 'hidden',
    background: COLORS.creamDark,
    border: `1px solid ${COLORS.border}`,
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  previewCategory: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: '4px 10px',
    borderRadius: 999,
    background: 'rgba(62, 15, 28, 0.85)',
    color: COLORS.roseGoldLight,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  previewMeta: { marginTop: 16 },
  previewName: {
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.ink,
    margin: '0 0 8px',
    lineHeight: 1.35,
  },
  previewRating: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 10,
  },
  previewPriceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
  },
  previewPrice: {
    fontSize: 22,
    fontWeight: 800,
    color: COLORS.burgundy,
  },
  previewCompare: {
    fontSize: 13,
    color: COLORS.muted,
    textDecoration: 'line-through',
  },

  /* Actions */
  saveBtn: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    padding: '13px 20px',
    borderRadius: 10,
    border: 'none',
    background: `linear-gradient(135deg, ${COLORS.roseGold} 0%, ${COLORS.roseGoldLight} 50%, ${COLORS.roseGold} 100%)`,
    color: COLORS.burgundyDark,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0.3,
    cursor: 'pointer',
    boxShadow: '0 8px 22px rgba(183, 110, 121, 0.38)',
    transition: 'transform 0.15s ease, box-shadow 0.2s ease',
  },
  saveBtnDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  cancelBtn: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    padding: '12px 20px',
    marginTop: 10,
    borderRadius: 10,
    background: 'transparent',
    border: `1px solid ${COLORS.burgundy}`,
    color: COLORS.burgundy,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 1.55,
  },
}

/* Inject the spinner keyframes once */
if (typeof document !== 'undefined') {
  const STYLE_ID = 'nx-admin-spin-keyframes'
  if (!document.getElementById(STYLE_ID)) {
    const tag = document.createElement('style')
    tag.id = STYLE_ID
    tag.textContent =
      '@keyframes nx-spin { to { transform: rotate(360deg); } }'
    document.head.appendChild(tag)
  }
}