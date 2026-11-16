import { createClient } from '@supabase/supabase-js'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type CloudProfileRow = {
  id: string
  player_id: string
  display_name: string
  avatar: string
  suit: string
  xp: number
  completed_missions: string[]
  unlocked_worlds: string[]
  achievements: string[]
  collectibles: string[]
  settings: {
    sound: boolean
    music: boolean
    graphics: 'low' | 'medium' | 'high'
  }
  created_at: string
  updated_at: string
}

type CloudProfileUpdate = Pick<
  CloudProfileRow,
  'display_name' | 'avatar' | 'suit' | 'xp' | 'completed_missions' | 'unlocked_worlds' | 'achievements' | 'collectibles' | 'settings'
>

type Database = {
  public: {
    Tables: {
      profiles: {
        Row: CloudProfileRow
        Insert: Partial<CloudProfileRow>
        Update: Partial<CloudProfileUpdate>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      'delete-account': {
        Args: Record<string, never>
        Returns: { success: boolean }
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const supabase = supabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null

export function rememberLocalProgressImport(identifier: string) {
  try {
    window.localStorage.setItem(
      'chipverse:pending-progress-import',
      JSON.stringify({ identifier, createdAt: Date.now() }),
    )
  } catch {
    throw new Error('This browser could not save the progress-import choice. Check its storage settings and try again.')
  }
}

export function hasLocalProgressImport(identifier: string): boolean {
  try {
    const raw = window.localStorage.getItem('chipverse:pending-progress-import')
    if (!raw) return false

    const request = JSON.parse(raw) as { identifier?: string; createdAt?: number }
    const expired = !request.createdAt || Date.now() - request.createdAt > 24 * 60 * 60 * 1000
    if (expired) {
      window.localStorage.removeItem('chipverse:pending-progress-import')
      return false
    }

    return request.identifier?.toLowerCase() === identifier.toLowerCase()
  } catch {
    throw new Error('This browser could not read the saved progress-import choice. Clear browser storage and try again.')
  }
}

export function clearLocalProgressImport() {
  try {
    window.localStorage.removeItem('chipverse:pending-progress-import')
  } catch {
    throw new Error('The saved progress-import choice could not be cleared from browser storage.')
  }
}
