import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { ChipverseProfile } from '../store'

export type ProfileStatus = 'idle' | 'loading' | 'ready' | 'error'

export type AuthContextValue = {
  session: Session | null
  authLoading: boolean
  profileStatus: ProfileStatus
  profileError: string | null
  retryProfile: () => void
  signOut: () => Promise<void>
  saveCloudProfile: (profile: ChipverseProfile) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}
