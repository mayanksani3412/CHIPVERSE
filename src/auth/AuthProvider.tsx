import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useChipverseStore, type ChipverseProfile } from '../store'
import { clearLocalProgressImport, hasLocalProgressImport, supabase, supabaseConfigured } from './supabase'
import { AuthContext, type AuthContextValue, type ProfileStatus } from './AuthContext'
import { mergeLocalProgress } from './profileSync'

function toCloudUpdate(profile: ChipverseProfile) {
  return {
    display_name: profile.name.trim(),
    avatar: profile.avatar.trim(),
    suit: profile.suit.trim(),
    xp: profile.xp,
    completed_missions: profile.completedMissions,
    unlocked_worlds: profile.unlockedWorlds,
    achievements: profile.achievements,
    collectibles: profile.collectibles,
    settings: profile.settings,
  }
}

function toLocalProfile(profile: NonNullable<Awaited<ReturnType<typeof loadCloudProfile>>>) {
  const local = useChipverseStore.getState().profile
  return {
    ...local,
    playerId: profile.player_id,
    name: profile.display_name,
    avatar: profile.avatar,
    suit: profile.suit,
    xp: profile.xp,
    completedMissions: profile.completed_missions,
    unlockedWorlds: profile.unlocked_worlds,
    achievements: profile.achievements,
    collectibles: profile.collectibles,
    settings: profile.settings,
  } satisfies ChipverseProfile
}

async function loadCloudProfile(userId: string) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(`Could not load the cloud player profile: ${error.message}`)
  if (!data) throw new Error('The cloud profile was not created. Apply the Supabase database migration and try again.')
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(supabaseConfigured)
  const [profileLoadResult, setProfileLoadResult] = useState<{
    key: string
    status: Exclude<ProfileStatus, 'idle' | 'loading'>
    error: string | null
  } | null>(null)
  const [profileSyncError, setProfileSyncError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!supabase) {
      return
    }

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) setProfileSyncError(null)
      setAuthLoading(false)
    })

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setProfileSyncError(`Could not restore the authentication session: ${error.message}`)
      setSession(data.session)
      setAuthLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user.id
  const userIdentifier = session?.user.email ?? session?.user.phone
  const profileKey = userId ? `${userId}:${retryCount}` : ''
  const profileStatus = !userId
    ? 'idle'
    : profileLoadResult?.key === profileKey
      ? profileLoadResult.status
      : 'loading'
  const profileError = profileLoadResult?.key === profileKey && profileLoadResult.status === 'error'
    ? profileLoadResult.error
    : profileSyncError

  useEffect(() => {
    const client = supabase
    if (!userId || !client) {
      return
    }

    let active = true

    void loadCloudProfile(userId)
      .then(async (row) => {
        if (!active) return
        const cloudProfile = toLocalProfile(row)
        const shouldImportLocal = userIdentifier ? hasLocalProgressImport(userIdentifier) : false
        const nextProfile = shouldImportLocal
          ? mergeLocalProgress(useChipverseStore.getState().profile, cloudProfile)
          : cloudProfile

        useChipverseStore.getState().setProfile(nextProfile)

        if (shouldImportLocal) {
          const { data, error } = await client
            .from('profiles')
            .update(toCloudUpdate(nextProfile))
            .eq('id', userId)
            .select('id')
            .single()
          if (error) throw new Error(`Could not import this device's saved progress: ${error.message}`)
          if (!data) throw new Error('The saved progress import did not update a cloud profile.')
          clearLocalProgressImport()
        }

        if (active) {
          setProfileSyncError(null)
          setProfileLoadResult({ key: profileKey, status: 'ready', error: null })
        }
      })
      .catch((error: unknown) => {
        if (!active) return
        setProfileLoadResult({
          key: profileKey,
          status: 'error',
          error: error instanceof Error ? error.message : 'Could not load the cloud player profile.',
        })
      })

    return () => {
      active = false
    }
  }, [userId, userIdentifier, profileKey, retryCount])

  const saveCloudProfile = useCallback(async (profile: ChipverseProfile) => {
    const client = supabase
    if (!client || !userId) throw new Error('Sign in before saving a cloud profile.')

    const { data, error } = await client
      .from('profiles')
      .update(toCloudUpdate(profile))
      .eq('id', userId)
      .select('id')
      .single()

    if (error) throw new Error(`Could not save the cloud player profile: ${error.message}`)
    if (!data) throw new Error('The cloud player profile was not updated.')
  }, [userId])

  useEffect(() => {
    if (!userId || profileStatus !== 'ready') return

    let timer: ReturnType<typeof setTimeout> | undefined
    let active = true
    let saving = false
    let pendingProfile: ChipverseProfile | null = null
    const flush = async () => {
      if (saving || !pendingProfile || !active) return
      const profile = pendingProfile
      pendingProfile = null
      saving = true
      try {
        await saveCloudProfile(profile)
        if (active) setProfileSyncError(null)
      } catch (error) {
        if (active) setProfileSyncError(error instanceof Error ? error.message : 'Could not save the cloud player profile.')
      } finally {
        saving = false
        if (pendingProfile) void flush()
      }
    }
    const unsubscribe = useChipverseStore.subscribe((state, previousState) => {
      if (state.profile === previousState.profile) return
      pendingProfile = state.profile
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        void flush()
      }, 500)
    })

    return () => {
      active = false
      if (timer) clearTimeout(timer)
      unsubscribe()
    }
  }, [userId, profileStatus, saveCloudProfile])

  const retryProfile = useCallback(() => setRetryCount((count) => count + 1), [])
  const signOut = useCallback(async () => {
    if (!supabase) throw new Error('Supabase is not configured.')
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(`Could not sign out: ${error.message}`)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    authLoading,
    profileStatus: supabaseConfigured ? profileStatus : 'idle',
    profileError,
    retryProfile,
    signOut,
    saveCloudProfile,
  }), [session, authLoading, profileStatus, profileError, retryProfile, signOut, saveCloudProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
