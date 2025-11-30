import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configured] = useState<boolean>(!!supabase)

  useEffect(() => {
    const init = async () => {
      if (!supabase) return
      const { data } = await supabase.auth.getSession()
      setUserId(data.session?.user?.id ?? null)
      supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id ?? null)
      })
    }
    init()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      setError('Supabase未設定です。環境変数を設定してください。')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      setError('Supabase未設定です。環境変数を設定してください。')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return { userId, loading, error, configured, signIn, signUp, signOut }
}
