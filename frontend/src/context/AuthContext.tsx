import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { api, registerAccessTokenGetter } from '@/services/api'
import type { User } from '@/types/user'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    registerAccessTokenGetter(async () => (await supabase?.auth.getSession())?.data.session?.access_token ?? null)
    if (!supabase) {
      setLoading(false)
      return
    }

    const hydrate = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        setLoading(false)
        return
      }
      await loadProfile()
    }

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) await loadProfile()
      else {
        setUser(null)
        setLoading(false)
      }
    })

    void hydrate()
    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadProfile() {
    try {
      const profile = await api.getMe()
      setUser({ id: profile.id, name: profile.name, email: profile.email, avatarUrl: profile.avatar_url })
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    if (!supabase) throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY primero.')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase?.auth.signOut()
    window.location.href = '/login'
  }

  const value = useMemo(() => ({ user, loading, signInWithGoogle, signOut }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
