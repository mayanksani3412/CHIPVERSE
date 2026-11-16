import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultProfile } from './gameData'

export type PlayerSettings = {
  sound: boolean
  music: boolean
  graphics: 'low' | 'medium' | 'high'
}

export type ChipverseProfile = {
  name: string
  avatar: string
  suit: string
  playerId: string | null
  xp: number
  completedMissions: string[]
  unlockedWorlds: string[]
  achievements: string[]
  collectibles: string[]
  settings: PlayerSettings
}

type ChipverseState = {
  profile: ChipverseProfile
  currentWorldId: string
  setProfile: (profile: Partial<ChipverseProfile>) => void
  completeMission: (missionId: string, worldId: string, xpGain: number) => void
  collectItem: (collectibleId: string, xpGain: number) => void
  setWorld: (worldId: string) => void
  resetProfile: () => void
}

export const useChipverseStore = create<ChipverseState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      currentWorldId: 'logic-land',
      setProfile: (profile) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...profile,
            settings: {
              ...state.profile.settings,
              ...(profile.settings ?? {}),
            },
          },
        })),
      completeMission: (missionId, worldId, xpGain) =>
        set((state) => {
          if (state.profile.completedMissions.includes(missionId)) return state
          const completedMissions = [...state.profile.completedMissions, missionId]

          const unlockedWorlds = state.profile.unlockedWorlds.includes(worldId)
            ? state.profile.unlockedWorlds
            : [...state.profile.unlockedWorlds, worldId]

          return {
            profile: {
              ...state.profile,
              xp: state.profile.xp + Math.max(0, xpGain),
              completedMissions,
              unlockedWorlds,
              achievements: state.profile.achievements.includes('Mission Master')
                ? state.profile.achievements
                : [...state.profile.achievements, 'Mission Master'],
            },
            currentWorldId: worldId,
          }
        }),
      collectItem: (collectibleId, xpGain) =>
        set((state) => {
          const collectibles = state.profile.collectibles ?? []
          if (collectibles.includes(collectibleId)) return state
          return {
            profile: {
              ...state.profile,
              xp: state.profile.xp + Math.max(0, xpGain),
              collectibles: [...collectibles, collectibleId],
            },
          }
        }),
      setWorld: (worldId) => set({ currentWorldId: worldId }),
      resetProfile: () => set({ profile: defaultProfile, currentWorldId: 'logic-land' }),
    }),
    {
      name: 'chipverse-save',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ChipverseState> | undefined
        const persistedProfile = persisted?.profile
        return {
          ...currentState,
          ...persisted,
          profile: {
            ...currentState.profile,
            ...persistedProfile,
            collectibles: persistedProfile?.collectibles ?? [],
            settings: {
              ...currentState.profile.settings,
              ...persistedProfile?.settings,
            },
          },
        }
      },
    },
  ),
)

export function getProgressSummary() {
  return useChipverseStore.getState().profile
}
