import { useCallback, useEffect, useState } from 'react'

/**
 * useLocalStorage — a persistent useState that syncs to localStorage.
 *
 * @param {string} key          - Storage key
 * @param {any}    initialValue - Default value if nothing is stored
 * @returns {[any, (value: any) => void, () => void]} [value, setValue, remove]
 */
export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      try {
        const next =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(next)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(next))
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[useLocalStorage] set failed:', err)
      }
    },
    [key, storedValue]
  )

  const remove = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[useLocalStorage] remove failed:', err)
    }
  }, [key, initialValue])

  // Sync across tabs / windows
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const onStorage = (e) => {
      if (e.key !== key) return
      try {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue)
      } catch {
        setStoredValue(initialValue)
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, initialValue])

  return [storedValue, setValue, remove]
}