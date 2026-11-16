import { describe, expect, it } from 'vitest'
import {
  calculateLevel,
  calculateMissionScore,
  calculateRank,
  combineMovementInput,
  evaluateMissionAnswer,
  logicGateOutput,
  movementToWorldVector,
} from './gameLogic'
import { getLogicLandMissionFromIndex, logicLandMissions } from './game/logicLandMissions'
import { useChipverseStore } from './store'

describe('player progression logic', () => {
  it('maps XP to the correct rank', () => {
    expect(calculateRank(0)).toBe('Silicon Rookie')
    expect(calculateRank(1500)).toBe('Circuit Engineer')
    expect(calculateRank(7500)).toBe('VLSI Architect')
    expect(calculateRank(12000)).toBe('Master Chip Architect')
  })

  it('computes levels from accumulated XP', () => {
    expect(calculateLevel(0)).toBe(1)
    expect(calculateLevel(500)).toBe(2)
    expect(calculateLevel(2000)).toBe(5)
  })
})

describe('logic evaluation helpers', () => {
  it('evaluates gate behavior correctly', () => {
    expect(logicGateOutput('AND', true, true)).toBe(true)
    expect(logicGateOutput('OR', false, true)).toBe(true)
    expect(logicGateOutput('XOR', true, true)).toBe(false)
    expect(logicGateOutput('NAND', false, true)).toBe(true)
    expect(logicGateOutput('NOR', false, false)).toBe(true)
    expect(logicGateOutput('XNOR', true, true)).toBe(true)
    expect(logicGateOutput('NOT', false, true)).toBe(true)
  })

  it('defines five distinct Logic Land checkpoints with matching gate outputs', () => {
    expect(logicLandMissions).toHaveLength(5)
    const expectedOutputs = [true, true, true, false, true]
    for (const [index, mission] of logicLandMissions.entries()) {
      expect(logicGateOutput(mission.gate, mission.a, mission.b)).toBe(
        expectedOutputs[index],
      )
    }
  })

  it('only opens a checkpoint when a valid mission index is present', () => {
    expect(getLogicLandMissionFromIndex(null)).toBeNull()
    expect(getLogicLandMissionFromIndex('')).toBeNull()
    expect(getLogicLandMissionFromIndex('-1')).toBeNull()
    expect(getLogicLandMissionFromIndex('5')).toBeNull()
    expect(getLogicLandMissionFromIndex('2')?.id).toBe('truth-table-explorer')
  })

  it('normalizes and compares answers', () => {
    expect(evaluateMissionAnswer(' 1010 ', '1010')).toBe(true)
    expect(evaluateMissionAnswer('A AND B', 'A+B')).toBe(false)
  })

  it('awards mission XP and collectibles only once', () => {
    const store = useChipverseStore.getState()
    store.resetProfile()
    store.completeMission('binary-gate-challenge', 'logic-land', 250)
    store.completeMission('binary-gate-challenge', 'logic-land', 250)
    store.collectItem('logic-crystal-test', 25)
    store.collectItem('logic-crystal-test', 25)

    const profile = useChipverseStore.getState().profile
    expect(profile.xp).toBe(275)
    expect(profile.completedMissions).toEqual(['binary-gate-challenge'])
    expect(profile.collectibles).toEqual(['logic-crystal-test'])
    store.resetProfile()
  })
})

describe('desktop and touch movement input', () => {
  it('maps WASD/arrow keys and joystick directions to the same movement', () => {
    const keyboardForward = combineMovementInput(new Set(['w']), { x: 0, z: 0 })
    const arrowForward = combineMovementInput(new Set(['arrowup']), { x: 0, z: 0 })
    const joystickForward = combineMovementInput(new Set(), { x: 0, z: -1 })

    expect(keyboardForward).toEqual({ x: 0, z: -1 })
    expect(arrowForward).toEqual(keyboardForward)
    expect(joystickForward).toEqual(keyboardForward)
    expect(movementToWorldVector(keyboardForward, 0)).toEqual({ x: 0, z: -1 })
  })

  it('normalizes diagonal input and respects the camera heading', () => {
    const diagonal = combineMovementInput(new Set(['w', 'd']), { x: 0, z: 0 })
    const facingRight = movementToWorldVector({ x: 0, z: -1 }, Math.PI / 2)

    expect(Math.hypot(diagonal.x, diagonal.z)).toBeCloseTo(1)
    expect(facingRight.x).toBeCloseTo(-1)
    expect(facingRight.z).toBeCloseTo(0)
  })
})

describe('mission scoring', () => {
  it('rewards first-try completion more while preserving a minimum score', () => {
    expect(calculateMissionScore(0)).toBe(100)
    expect(calculateMissionScore(1)).toBe(80)
    expect(calculateMissionScore(5)).toBe(25)
    expect(calculateMissionScore(-1)).toBe(100)
  })
})
