import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../lib/api'

/**
 * useApi — declarative data fetching hook for the NEXORA MART API.
 *
 * @param {string|null} url     - Endpoint path, e.g. '/products'. Pass null to skip.
 * @param {object}      options
 * @param {object}      options.params    - Query params
 * @param {boolean}     options.immediate - Fire on mount (default true)
 * @param {any}         options.initial   - Initial data value
 *
 * @returns {{
 *   data: any,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: (overrideParams?: object) => Promise<any>,
 *   setData: (d: any) => void,
 *   reset: () => void,
 * }}
 */
export default function useApi(url, options = {}) {
  const {
    params = undefined,
    immediate = true,
    initial = null,
  } = options

  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(Boolean(immediate && url))
  const [error, setError] = useState(null)

  const mountedRef = useRef(true)
  const abortRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  const refetch = useCallback(
    async (overrideParams) => {
      if (!url) return null

      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)

      try {
        const { data: res } = await api.get(url, {
          params: overrideParams ?? params,
          signal: controller.signal,
        })

        if (!mountedRef.current) return null

        const payload = res?.data ?? res
        setData(payload)
        return payload
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return null
        }
        if (mountedRef.current) setError(err.message || 'Request failed')
        return null
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    },
    [url, params]
  )

  useEffect(() => {
    if (immediate && url) refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(params), immediate])

  const reset = useCallback(() => {
    setData(initial)
    setError(null)
    setLoading(false)
  }, [initial])

  return { data, loading, error, refetch, setData, reset }
}