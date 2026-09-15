import axios from 'axios'
import { supabase } from '../lib/supabase'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * Pre-configured Axios instance for the NEXORA MART API.
 * Automatically attaches the Supabase access token to every request.
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

api.interceptors.request.use(
  async (config) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
    } catch {
      /* no session — continue unauthenticated */
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong. Please try again.'

    if (error.response?.status === 401) {
      supabase.auth.signOut().catch(() => {})
    }

    return Promise.reject(new Error(message))
  }
)

/* ---------------- Convenience wrappers ---------------- */

export const get = (url, config) => api.get(url, config).then((r) => r.data)

export const post = (url, body, config) =>
  api.post(url, body, config).then((r) => r.data)

export const put = (url, body, config) =>
  api.put(url, body, config).then((r) => r.data)

export const patch = (url, body, config) =>
  api.patch(url, body, config).then((r) => r.data)

export const del = (url, config) => api.delete(url, config).then((r) => r.data)

/* ---------------- Domain helpers ---------------- */

export const productsApi = {
  list: (params) => get('/products', { params }),
  detail: (id) => get(`/products/${id}`),
  create: (body) => post('/products', body),
  update: (id, body) => put(`/products/${id}`, body),
  remove: (id) => del(`/products/${id}`),
}

export const authApi = {
  me: () => get('/auth/me'),
  updateMe: (body) => put('/auth/me', body),
}

export const ordersApi = {
  create: (body) => post('/orders', body),
  myOrders: () => get('/orders/my-orders'),
  detail: (id) => get(`/orders/${id}`),
}

export default api