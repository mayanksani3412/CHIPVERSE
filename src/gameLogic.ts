export type RankName =
  | 'Silicon Rookie'
  | 'Logic Explorer'
  | 'Circuit Engineer'
  | 'RTL Designer'
  | 'Verification Expert'
  | 'VLSI Architect'
  | 'Master Chip Architect'

export type LogicGate = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'XNOR'

export type MovementKeys = ReadonlySet<string>

export function combineMovementInput(
  keys: MovementKeys,
  joystick: { x: number; z: number },
): { x: number; z: number } {
  const keyX = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
  const keyZ = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'))
  const x = Math.max(-1, Math.min(1, keyX + joystick.x))
  const z = Math.max(-1, Math.min(1, keyZ + joystick.z))
  const magnitude = Math.hypot(x, z)

  return magnitude > 1
    ? { x: x / magnitude, z: z / magnitude }
    : { x, z }
}

export function movementToWorldVector(
  input: { x: number; z: number },
  cameraYaw: number,
): { x: number; z: number } {
  return {
    x: Math.cos(cameraYaw) * input.x + Math.sin(cameraYaw) * input.z,
    z: -Math.sin(cameraYaw) * input.x + Math.cos(cameraYaw) * input.z,
  }
}

export function calculateMissionScore(incorrectAttempts: number): number {
  return Math.max(25, 100 - Math.max(0, Math.floor(incorrectAttempts)) * 20)
}

export function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 500) + 1)
}

export function calculateRank(xp: number): RankName {
  if (xp < 500) return 'Silicon Rookie'
  if (xp < 1500) return 'Logic Explorer'
  if (xp < 3000) return 'Circuit Engineer'
  if (xp < 5000) return 'RTL Designer'
  if (xp < 7500) return 'Verification Expert'
  if (xp < 10000) return 'VLSI Architect'
  return 'Master Chip Architect'
}

export function logicGateOutput(gate: LogicGate, a: boolean, b: boolean): boolean {
  switch (gate) {
    case 'AND':
      return a && b
    case 'OR':
      return a || b
    case 'NOT':
      return !a
    case 'XOR':
      return a !== b
    case 'NAND':
      return !(a && b)
    case 'NOR':
      return !(a || b)
    case 'XNOR':
      return a === b
    default:
      return false
  }
}

export function evaluateMissionAnswer(answer: string, expected: string): boolean {
  const normalized = answer.trim().toLowerCase()
  const normalExpected = expected.trim().toLowerCase()
  return normalized === normalExpected || normalized.includes(normalExpected)
}
