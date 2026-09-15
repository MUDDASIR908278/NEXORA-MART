/**
 * NEXORA MART — server-side utility helpers
 */

/* -------------------- Numbers -------------------- */

export function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function toInt(value, fallback = 0) {
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/* -------------------- Money -------------------- */

export const SHIPPING_FLAT = 9.99
export const FREE_SHIPPING_THRESHOLD = 100
export const TAX_RATE = 0.05

export function computeShipping(subtotal) {
  const s = toNumber(subtotal)
  return s > 0 && s < FREE_SHIPPING_THRESHOLD ? SHIPPING_FLAT : 0
}

export function computeTax(subtotal) {
  return round2(toNumber(subtotal) * TAX_RATE)
}

export function computeTotals(subtotal) {
  const s = round2(toNumber(subtotal))
  const shipping = computeShipping(s)
  const tax = computeTax(s)
  const total = round2(s + shipping + tax)
  return { subtotal: s, shipping, tax, total }
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(toNumber(amount))
}

/* -------------------- Strings -------------------- */

export function slugify(input) {
  return String(input ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function shortId(id, length = 8) {
  return String(id ?? '').slice(0, length).toUpperCase()
}

export function truncate(str, max = 120) {
  const s = String(str ?? '')
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim())
}

/* -------------------- Objects / arrays -------------------- */

export function pick(obj, keys) {
  const out = {}
  for (const k of keys) {
    if (obj != null && Object.prototype.hasOwnProperty.call(obj, k)) {
      out[k] = obj[k]
    }
  }
  return out
}

export function omit(obj, keys) {
  const set = new Set(keys)
  const out = {}
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (!set.has(k)) out[k] = v
  }
  return out
}

export function uniqueBy(arr, keyFn) {
  const seen = new Set()
  const out = []
  for (const item of arr ?? []) {
    const key = keyFn(item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

export function groupBy(arr, keyFn) {
  const out = {}
  for (const item of arr ?? []) {
    const key = keyFn(item)
    if (!out[key]) out[key] = []
    out[key].push(item)
  }
  return out
}

/* -------------------- Async -------------------- */

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wrap a promise with a timeout. Rejects with an Error if the promise
 * does not settle within `ms` milliseconds.
 */
export function withTimeout(promise, ms = 20000, label = 'Operation') {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    )
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

/**
 * Retry an async function with exponential backoff.
 */
export async function retry(fn, { attempts = 3, baseDelay = 200 } = {}) {
  let lastErr
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn(i)
    } catch (err) {
      lastErr = err
      if (i < attempts - 1) {
        await sleep(baseDelay * 2 ** i)
      }
    }
  }
  throw lastErr
}

/* -------------------- Pagination -------------------- */

export function parsePagination(query, { defaultLimit = 12, maxLimit = 60 } = {}) {
  const page = Math.max(1, toInt(query?.page, 1))
  const limit = clamp(toInt(query?.limit, defaultLimit), 1, maxLimit)
  const from = (page - 1) * limit
  const to = from + limit - 1
  return { page, limit, from, to }
}

export function buildPaginatedResponse(rows, count, page, limit) {
  const total = toNumber(count)
  return {
    data: rows ?? [],
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

/* -------------------- Env -------------------- */

export function requireEnv(keys) {
  const list = Array.isArray(keys) ? keys : [keys]
  const missing = list.filter((k) => !process.env[k])
  if (missing.length > 0) {
    throw new Error(
      `[NEXORA MART] Missing required environment variable(s): ${missing.join(', ')}`
    )
  }
}

/* -------------------- Logging -------------------- */

export function logInfo(...args) {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('[INFO]', ...args)
  }
}

export function logWarn(...args) {
  // eslint-disable-next-line no-console
  console.warn('[WARN]', ...args)
}

export function logError(...args) {
  // eslint-disable-next-line no-console
  console.error('[ERROR]', ...args)
}