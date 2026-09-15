import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../lib/supabase'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      setProfile(data.user ?? data.profile ?? data)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch(() => mounted && setLoading(false))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user) loadProfile()
    else setProfile(null)
  }, [user, loadProfile])

  const signUp = useCallback(async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw new Error(error.message)
    return data
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(error.message)
    return data
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: profile?.role === 'admin',
      signUp,
      signIn,
      signOut,
      refreshProfile: loadProfile,
    }),
    [user, profile, loading, signUp, signIn, signOut, loadProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>')
  return ctx
}