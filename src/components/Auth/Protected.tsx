import React from 'react'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  children: React.ReactNode
}

export const Protected: React.FC<Props> = ({ children }) => {
  const { userId, configured } = useAuth()
  if (!configured) {
    return <div className="card">Supabase未設定です。環境変数を設定してください。</div>
  }
  if (!userId) {
    return <div className="card">このセクションはログイン後に利用できます。</div>
  }
  return <>{children}</>
}

