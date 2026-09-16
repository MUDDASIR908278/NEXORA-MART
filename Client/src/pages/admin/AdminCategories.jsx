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
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  RefreshCw,
  Tag,
  AlertTriangle,
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

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Categories', to: '/admin/categories', icon: Tag },
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
function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/* ------------------------------------------------------------------ */
/*  Category Modal                                                     */
/* ------------------------------------------------------------------ */
function CategoryModal({ open, initial, onClose, onSubmit }) {
  const isEdit = Boolean(initial?.id)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(initial?.name || '')
    setSlug(initial?.slug || '')
    setDescription(initial?.description || '')
    setSlugTouched(Boolean(initial?.slug))
    setErrors({})
    setSaving(false)
  }, [open, initial])

  // Auto-derive slug from name unless user edited it
  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name))
    }
  }, [name, slugTouched])

  if (!open) return null

  const validate = () => {
    const next = {}
    if (!name.trim()) next.name = 'Category name is required.'
    if (!slug.trim()) next.slug = 'Slug is required.'
    else if (!/^[a-z0-9-]+$/.test(slug.trim())) {
      next.slug = 'Slug may only contain lowercase letters, numbers and hyphens.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
      })
    } finally {
      setSaving(false)
    }
  }

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
            <div style={styles.modalEyebrow}>
              {isEdit ? 'Edit category' : 'New category'}
            </div>
            <h2 style={styles.modalTitle}>
              {isEdit ? initial.name : 'Create category'}
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

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="cat-name">
              Name <span style={styles.req}>*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electronics"
              style={{
                ...styles.input,
                ...(errors.name ? styles.inputError : null),
              }}
            />
            {errors.name && <span style={styles.err}>{errors.name}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="cat-slug">
              Slug <span style={styles.req}>*</span>
            </label>
            <input
              id="cat-slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugTouched(true)
              }}
              placeholder="electronics"
              style={{
                ...styles.input,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                ...(errors.slug ? styles.inputError : null),
              }}
            />
            {errors.slug ? (
              <span style={styles.err}>{errors.slug}</span>
            ) : (
              <span style={styles.hint}>
                Used in URLs — lowercase, numbers and hyphens only.
              </span>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="cat-desc">
              Description
            </label>
            <textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional short description…"
              style={styles.textarea}
            />
          </div>

          <div style={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Delete Confirm Modal                                               */
/* ------------------------------------------------------------------ */
function DeleteConfirmModal({ open, category, onClose, onConfirm, busy }) {
  if (!open) return null
  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div
        style={{ ...styles.modal, maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div style={styles.confirmIcon}>
          <AlertTriangle size={26} color={COLORS.danger} />
        </div>
        <h2 style={{ ...styles.modalTitle, textAlign: 'center' }}>
          Delete category?
        </h2>
        <p style={styles.confirmText}>
          <strong>{category?.name}</strong> will be permanently removed.
          {category?.product_count > 0 && (
            <>
              {' '}
              {category.product_count} product
              {category.product_count === 1 ? '' : 's'} currently reference this
              category.
            </>
          )}
        </p>
        <div style={styles.modalActions}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={styles.dangerBtn}
          >
            {busy ? 'Deleting…' : 'Delete category'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [term, setTerm] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  /* ---------------- Fetch ---------------- */
  const fetchCategories = useCallback(async (showRefresh = false) => {
    showRefresh ? setRefreshing(true) : setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/categories')
      const list = data.categories ?? data.data ?? []
      setCategories(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.message)
      setCategories([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  /* ---------------- Derived ---------------- */
  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) =>
      `${c.name} ${c.slug}`.toLowerCase().includes(q)
    )
  }, [categories, term])

  /* ---------------- Actions ---------------- */
  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (category) => {
    setEditing(category)
    setModalOpen(true)
  }

  const handleSubmit = async (payload) => {
    try {
      if (editing?.id) {
        const { data } = await api.put(
          `/categories/${editing.id}`,
          payload
        )
        const updated = data.category ?? data
        setCategories((list) =>
          list.map((c) => (c.id === editing.id ? { ...c, ...updated } : c))
        )
        toast.success('Category updated.')
      } else {
        const { data } = await api.post('/categories', payload)
        const created = data.category ?? data
        setCategories((list) => [
          { ...created, product_count: created.product_count ?? 0 },
          ...list,
        ])
        toast.success('Category created.')
      }
      setModalOpen(false)
      setEditing(null)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const openDelete = (category) => {
    setDeleting(category)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!deleting?.id) return
    setDeleteBusy(true)
    try {
      await api.delete(`/categories/${deleting.id}`)
      setCategories((list) => list.filter((c) => c.id !== deleting.id))
      toast.success('Category deleted.')
      setConfirmOpen(false)
      setDeleting(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleteBusy(false)
    }
  }

  /* ---------------- Render ---------------- */
  return (
    <div style={styles.page}>
      <AdminSidebar activePath="/admin/categories" />

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Categories</h1>
            <p style={styles.subtitle}>
              Organise your catalogue into shoppable groups.
            </p>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={() => fetchCategories(true)}
              disabled={refreshing}
              style={styles.refreshBtn}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: refreshing
                    ? 'nx-spin 0.9s linear infinite'
                    : 'none',
                }}
              />
              <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>
            <button onClick={openCreate} style={styles.addBtn}>
              <Plus size={17} />
              <span>Add Category</span>
            </button>
          </div>
        </header>

        <div style={styles.toolbar}>
          <div style={styles.searchWrap}>
            <Search size={16} style={styles.searchIcon} />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search categories by name or slug…"
              style={styles.searchInput}
            />
          </div>
          <div style={styles.countChip}>
            {filtered.length} categor{filtered.length === 1 ? 'y' : 'ies'}
          </div>
        </div>

        {error && (
          <div style={styles.alertError}>
            <X size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingWrap}>
              <div style={styles.spinner} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <Tag size={36} color={COLORS.roseGold} />
              <h3 style={styles.emptyTitle}>No categories yet</h3>
              <p style={styles.emptyText}>
                Create your first category to organise the catalogue.
              </p>
              <button onClick={openCreate} style={{ ...styles.addBtn, marginTop: 16 }}>
                <Plus size={16} />
                <span>Add Category</span>
              </button>
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <div style={styles.thead}>
                <span>Name</span>
                <span>Slug</span>
                <span style={{ textAlign: 'right' }}>Products</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>

              {filtered.map((category) => (
                <div key={category.id} style={styles.trow}>
                  <span style={styles.nameCell}>
                    <span style={styles.swatch} />
                    <span>
                      <div style={styles.nameText}>{category.name}</div>
                      {category.description && (
                        <div style={styles.descText}>
                          {category.description}
                        </div>
                      )}
                    </span>
                  </span>

                  <span style={styles.slugCell}>{category.slug}</span>

                  <span style={styles.countCell}>
                    {Number(category.product_count || 0)}
                  </span>

                  <span style={styles.actionsCell}>
                    <button
                      onClick={() => openEdit(category)}
                      style={styles.iconActionBtn}
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => openDelete(category)}
                      style={{
                        ...styles.iconActionBtn,
                        ...styles.iconActionDanger,
                      }}
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <CategoryModal
          open={modalOpen}
          initial={editing}
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
          }}
          onSubmit={handleSubmit}
        />

        <DeleteConfirmModal
          open={confirmOpen}
          category={deleting}
          onClose={() => {
            setConfirmOpen(false)
            setDeleting(null)
          }}
          onConfirm={handleDelete}
          busy={deleteBusy}
        />
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
  headerActions: {
    display: 'flex',
    gap: 10,
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
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 10,
    border: 'none',
    background: `linear-gradient(135deg, ${COLORS.roseGold} 0%, ${COLORS.roseGoldLight} 50%, ${COLORS.roseGold} 100%)`,
    color: COLORS.burgundyDark,
    fontSize: 13.5,
    fontWeight: 700,
    letterSpacing: 0.3,
    cursor: 'pointer',
    boxShadow: '0 8px 22px rgba(183, 110, 121, 0.38)',
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
    maxWidth: 320,
  },

  tableWrap: { width: '100%' },
  thead: {
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 1.6fr) minmax(140px, 1fr) 110px 120px',
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
    gridTemplateColumns: 'minmax(220px, 1.6fr) minmax(140px, 1fr) 110px 120px',
    gap: 12,
    alignItems: 'center',
    padding: '14px 22px',
    borderBottom: `1px solid rgba(183, 110, 121, 0.14)`,
    fontSize: 13.5,
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: `linear-gradient(135deg, ${COLORS.roseGold} 0%, ${COLORS.roseGoldLight} 100%)`,
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)',
    flexShrink: 0,
  },
  nameText: {
    fontWeight: 700,
    color: COLORS.ink,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  descText: {
    fontSize: 12,
    color: COLORS.muted,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 320,
  },
  slugCell: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12.5,
    color: COLORS.roseGoldDark,
    letterSpacing: 0.4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  countCell: {
    textAlign: 'right',
    fontWeight: 700,
    color: COLORS.burgundy,
    fontSize: 14,
  },
  actionsCell: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: 'grid',
    placeItems: 'center',
    background: 'transparent',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.burgundy,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  iconActionDanger: {
    color: COLORS.danger,
    borderColor: 'rgba(176, 58, 72, 0.35)',
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
    maxWidth: 520,
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
    fontSize: 22,
    fontWeight: 800,
    color: COLORS.burgundy,
    letterSpacing: -0.3,
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
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 22,
  },

  field: { marginBottom: 16 },
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
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: COLORS.danger,
    boxShadow: '0 0 0 3px rgba(176, 58, 72, 0.12)',
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
    minHeight: 80,
    fontFamily: 'inherit',
    lineHeight: 1.55,
    boxSizing: 'border-box',
  },
  err: {
    display: 'block',
    marginTop: 6,
    fontSize: 12,
    color: COLORS.danger,
  },
  hint: {
    display: 'block',
    marginTop: 6,
    fontSize: 12,
    color: COLORS.muted,
  },

  cancelBtn: {
    padding: '11px 20px',
    borderRadius: 10,
    background: 'transparent',
    border: `1px solid ${COLORS.burgundy}`,
    color: COLORS.burgundy,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '11px 22px',
    borderRadius: 10,
    border: 'none',
    background: `linear-gradient(135deg, ${COLORS.roseGold} 0%, ${COLORS.roseGoldLight} 50%, ${COLORS.roseGold} 100%)`,
    color: COLORS.burgundyDark,
    fontSize: 13.5,
    fontWeight: 700,
    letterSpacing: 0.3,
    cursor: 'pointer',
    boxShadow: '0 8px 22px rgba(183, 110, 121, 0.38)',
  },
  dangerBtn: {
    padding: '11px 22px',
    borderRadius: 10,
    border: 'none',
    background: `linear-gradient(135deg, ${COLORS.danger} 0%, #8E2F3C 100%)`,
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: 700,
    letterSpacing: 0.3,
    cursor: 'pointer',
    boxShadow: '0 8px 22px rgba(176, 58, 72, 0.35)',
  },

  confirmIcon: {
    width: 60,
    height: 60,
    margin: '0 auto 14px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(176, 58, 72, 0.10)',
    border: `1px solid rgba(176, 58, 72, 0.3)`,
  },
  confirmText: {
    margin: '0 0 8px',
    textAlign: 'center',
    fontSize: 13.5,
    color: COLORS.muted,
    lineHeight: 1.6,
  },
}

/* Inject keyframes once */
if (typeof document !== 'undefined') {
  const STYLE_ID = 'nx-admin-categories-keyframes'
  if (!document.getElementById(STYLE_ID)) {
    const tag = document.createElement('style')
    tag.id = STYLE_ID
    tag.textContent =
      '@keyframes nx-spin { to { transform: rotate(360deg); } }'
    document.head.appendChild(tag)
  }
}