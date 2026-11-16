import { describe, expect, it } from 'vitest'
import { defaultProfile } from '../gameData'
import { mergeLocalProgress } from './profileSync'

describe('consented local progress import', () => {
  it('merges progress without duplicating XP and preserves the cloud identity', () => {
    const local = {
      ...defaultProfile,
      playerId: null,
      xp: 600,
      completedMissions: ['binary-gate-challenge', 'truth-table-explorer'],
      collectibles: ['crystal-a'],
    }
    const cloud = {
      ...defaultProfile,
      playerId: 'CV-MK-000042',
      name: 'Cloud Engineer',
      xp: 500,
      completedMissions: ['binary-gate-challenge'],
      collectibles: ['crystal-b'],
    }

    expect(mergeLocalProgress(local, cloud)).toMatchObject({
      playerId: 'CV-MK-000042',
      name: 'Cloud Engineer',
      xp: 600,
      completedMissions: ['binary-gate-challenge', 'truth-table-explorer'],
      collectibles: ['crystal-b', 'crystal-a'],
    })
  })
})
