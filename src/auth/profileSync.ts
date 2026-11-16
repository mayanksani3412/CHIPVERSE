import type { ChipverseProfile } from '../store'

export function mergeLocalProgress(local: ChipverseProfile, cloud: ChipverseProfile): ChipverseProfile {
  return {
    ...cloud,
    xp: Math.max(local.xp, cloud.xp),
    completedMissions: [...new Set([...cloud.completedMissions, ...local.completedMissions])],
    unlockedWorlds: [...new Set([...cloud.unlockedWorlds, ...local.unlockedWorlds])],
    achievements: [...new Set([...cloud.achievements, ...local.achievements])],
    collectibles: [...new Set([...cloud.collectibles, ...local.collectibles])],
    settings: { ...local.settings, ...cloud.settings },
  }
}
