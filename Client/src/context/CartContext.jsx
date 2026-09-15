import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'nexora-mart-cart'

const initialState = { items: [] }

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, quantity } = action.payload
      const existing = state.items.find((i) => i.id === product.id)

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id
              ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock ?? 99) }
              : i
          ),
        }
      }

      return {
        items: [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url,
            stock: product.stock ?? 99,
            quantity,
          },
        ],
      }
    }

    case 'UPDATE_QTY': {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.id !== id) }
      }
      return {
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        ),
      }
    }

    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.payload) }

    case 'CLEAR':
      return initialState

    case 'HYDRATE':
      return action.payload

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) })
    } catch {
      /* ignore corrupted storage */
    }
  }, [])

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full / unavailable */
    }
  }, [state])

  const addToCart = (product, quantity = 1) =>
    dispatch({ type: 'ADD', payload: { product, quantity } })

  const updateQuantity = (id, quantity) =>
    dispatch({ type: 'UPDATE_QTY', payload: { id, quantity } })

  const removeFromCart = (id) => dispatch({ type: 'REMOVE', payload: id })

  const clearCart = () => dispatch({ type: 'CLEAR' })

  const value = useMemo(() => {
    const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = state.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    )
    const shipping = subtotal > 0 && subtotal < 100 ? 9.99 : 0
    const tax = Number((subtotal * 0.05).toFixed(2))
    const total = Number((subtotal + shipping + tax).toFixed(2))

    return {
      items: state.items,
      itemCount,
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      tax,
      total,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside a <CartProvider>')
  return ctx
}