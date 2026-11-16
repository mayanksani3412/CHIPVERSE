import type { LogicGate } from '../gameLogic'

export type LogicLandMission = {
  id: string
  name: string
  briefing: string
  concept: string
  gate: LogicGate
  a: boolean
  b: boolean
  reward: number
  checkpoint: [number, number, number]
}

export const logicLandMissions: LogicLandMission[] = [
  {
    id: 'binary-gate-challenge',
    name: 'Binary Gate Challenge',
    briefing: 'Both input lines are high. Identify the gate that only lights its output when every input is high.',
    concept: 'An AND gate requires A = 1 and B = 1.',
    gate: 'AND',
    a: true,
    b: true,
    reward: 250,
    checkpoint: [-8, 0, 0],
  },
  {
    id: 'logic-gate-builder',
    name: 'Logic Gate Builder',
    briefing: 'One input is high. Find the gate that passes a high signal from either input.',
    concept: 'An OR gate is high when at least one input is high.',
    gate: 'OR',
    a: false,
    b: true,
    reward: 310,
    checkpoint: [-4, 0, -4],
  },
  {
    id: 'truth-table-explorer',
    name: 'Truth Table Explorer',
    briefing: 'The inputs differ. Select the gate whose output is high only when its inputs are different.',
    concept: 'XOR is 1 when A and B differ; equal inputs produce 0.',
    gate: 'XOR',
    a: true,
    b: false,
    reward: 420,
    checkpoint: [0, 0, -6],
  },
  {
    id: 'boolean-formula-puzzle',
    name: 'Boolean Formula Puzzle',
    briefing: 'Both inputs are high, but the output must be low. Find the universal gate that inverts AND.',
    concept: 'NAND is the complement of AND: NOT (A AND B).',
    gate: 'NAND',
    a: true,
    b: true,
    reward: 540,
    checkpoint: [4, 0, -4],
  },
  {
    id: 'de-morgan-boss-battle',
    name: 'De Morgan Boss Battle',
    briefing: 'Both inputs are low. Defeat the boss by finding the gate that outputs high only when neither input is high.',
    concept: 'NOR is the complement of OR: NOT (A OR B).',
    gate: 'NOR',
    a: false,
    b: false,
    reward: 750,
    checkpoint: [8, 0, 0],
  },
]

export const logicGateChoices: LogicGate[] = ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR']

export function getLogicLandMissionFromIndex(value: string | null): LogicLandMission | null {
  if (value === null || value.trim() === '') return null
  const index = Number(value)
  return Number.isInteger(index) && index >= 0 && index < logicLandMissions.length
    ? logicLandMissions[index]
    : null
}
