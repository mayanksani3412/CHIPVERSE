import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { MutableRefObject, PointerEvent as ReactPointerEvent } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { useSearchParams } from 'react-router-dom'
import { calculateMissionScore, combineMovementInput, logicGateOutput, movementToWorldVector, type LogicGate } from '../gameLogic'
import { useChipverseStore } from '../store'
import { getLogicLandMissionFromIndex, logicGateChoices, logicLandMissions } from './logicLandMissions'

type Props = {
  onExit: () => void
}

class PlayerControls {
  private readonly movementInput = { x: 0, z: 0 }
  private readonly cameraInput = { x: 0, y: 0 }

  get movement(): Readonly<{ x: number; z: number }> {
    return this.movementInput
  }

  setMovement(x: number, z: number) {
    this.movementInput.x = x
    this.movementInput.z = z
  }

  addCameraMovement(x: number, y: number) {
    this.cameraInput.x += x
    this.cameraInput.y += y
  }

  consumeCameraMovement() {
    const movement = { ...this.cameraInput }
    this.cameraInput.x = 0
    this.cameraInput.y = 0
    return movement
  }

  reset() {
    this.setMovement(0, 0)
    this.cameraInput.x = 0
    this.cameraInput.y = 0
  }
}

const collectibles: Array<{ id: string; position: [number, number, number] }> = [
  { id: 'logic-crystal-1', position: [-10, 0.8, 5] },
  { id: 'logic-crystal-2', position: [-5, 0.8, 2] },
  { id: 'logic-crystal-3', position: [0, 0.8, 5] },
  { id: 'logic-crystal-4', position: [5, 0.8, 2] },
  { id: 'logic-crystal-5', position: [10, 0.8, 5] },
]

function EngineerAvatar({ walking }: { walking: MutableRefObject<boolean> }) {
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const suitColor = useChipverseStore((state) => state.profile.suit)
  const suitMaterial = suitColor.toLowerCase().includes('purple') ? '#8b5cf6' : '#167ce5'

  useFrame(({ clock }) => {
    const swing = walking.current ? Math.sin(clock.elapsedTime * 10) * 0.42 : Math.sin(clock.elapsedTime * 2) * 0.035
    if (leftArm.current) leftArm.current.rotation.x = swing
    if (rightArm.current) rightArm.current.rotation.x = -swing
  })

  return (
    <group>
      <mesh position={[0, 1.22, 0]} castShadow>
        <capsuleGeometry args={[0.34, 0.55, 4, 8]} />
        <meshStandardMaterial color={suitMaterial} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.3, -0.335]}>
        <boxGeometry args={[0.36, 0.16, 0.025]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>
      <mesh position={[0, 1.88, 0]} castShadow>
        <sphereGeometry args={[0.25, 14, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.22} />
      </mesh>
      <mesh position={[0, 1.89, -0.12]}>
        <sphereGeometry args={[0.18, 12, 8]} />
        <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={0.55} transparent opacity={0.76} />
      </mesh>
      <group position={[-0.4, 1.38, 0]} ref={leftArm}>
        <mesh position={[0, -0.22, 0]} rotation={[0.08, 0, -0.12]} castShadow>
          <capsuleGeometry args={[0.11, 0.34, 3, 6]} />
          <meshStandardMaterial color="#334155" metalness={0.45} />
        </mesh>
      </group>
      <group position={[0.4, 1.38, 0]} ref={rightArm}>
        <mesh position={[0, -0.22, 0]} rotation={[-0.08, 0, 0.12]} castShadow>
          <capsuleGeometry args={[0.11, 0.34, 3, 6]} />
          <meshStandardMaterial color="#334155" metalness={0.45} />
        </mesh>
      </group>
      {[-0.19, 0.19].map((x) => (
        <mesh key={x} position={[x, 0.49, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.42, 3, 6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.28} />
        </mesh>
      ))}
      <pointLight position={[0, 1.35, 0]} color="#00d9ff" intensity={0.6} distance={2.2} />
    </group>
  )
}

function MissionCheckpoint({
  mission,
  active,
  complete,
  onActivate,
}: {
  mission: (typeof logicLandMissions)[number]
  active: boolean
  complete: boolean
  onActivate: () => void
}) {
  const ring = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.z += delta * (active ? 0.8 : 0.26)
  })

  return (
    <group position={mission.checkpoint} onClick={(event) => {
      event.stopPropagation()
      onActivate()
    }}>
      <mesh position={[0, 0.16, 0]} receiveShadow>
        <cylinderGeometry args={[0.88, 1.02, 0.3, 8]} />
        <meshStandardMaterial color={complete ? '#14532d' : '#101e34'} metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.2, 0.32, 0.16, 8]} />
        <meshStandardMaterial color={active ? '#00d9ff' : mission.gate === 'NOR' ? '#f59e0b' : '#2563eb'} emissive={active ? '#00d9ff' : '#2563eb'} emissiveIntensity={0.65} />
      </mesh>
      <mesh ref={ring} position={[0, 0.6, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.62, 0.045, 8, 40]} />
        <meshBasicMaterial color={complete ? '#22c55e' : active ? '#e0fbff' : '#00d9ff'} />
      </mesh>
      <Float speed={2.2} floatIntensity={0.12}>
        <mesh position={[0, 1.05, 0]}>
          <octahedronGeometry args={[0.36, 0]} />
          <meshStandardMaterial color={complete ? '#22c55e' : '#00d9ff'} emissive={complete ? '#22c55e' : '#00d9ff'} emissiveIntensity={0.7} metalness={0.4} roughness={0.2} />
        </mesh>
      </Float>
    </group>
  )
}

function EnergyCrystal({
  id,
  position,
  collected,
  onCollect,
}: {
  id: string
  position: [number, number, number]
  collected: boolean
  onCollect: (id: string) => void
}) {
  const crystal = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (crystal.current && !collected) {
      crystal.current.rotation.y += 0.01
      crystal.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2.4 + position[0]) * 0.12
    }
  })

  if (collected) return null

  return (
    <group
      ref={crystal}
      position={position}
      onClick={(event) => {
        event.stopPropagation()
        onCollect(id)
      }}
    >
      <mesh>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1.3} metalness={0.25} roughness={0.15} />
      </mesh>
      <pointLight color="#8b5cf6" intensity={0.8} distance={2.2} />
    </group>
  )
}

function BinarySwitch({
  input,
  value,
  onToggle,
}: {
  input: 'A' | 'B'
  value: boolean
  onToggle: () => void
}) {
  return (
    <group position={[input === 'A' ? -1.25 : 1.25, 0.1, 5.2]} onClick={(event) => {
      event.stopPropagation()
      onToggle()
    }}>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.8, 0.42, 0.72]} />
        <meshStandardMaterial color="#132942" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.57, 0]}>
        <sphereGeometry args={[0.17, 12, 10]} />
        <meshStandardMaterial color={value ? '#22c55e' : '#64748b'} emissive={value ? '#22c55e' : '#1e293b'} emissiveIntensity={value ? 0.85 : 0.15} />
      </mesh>
    </group>
  )
}

function LogicLandScene({
  controls,
  paused,
  completed,
  collected,
  inputA,
  inputB,
  onCheckpoint,
  onCollect,
  onNearCheckpoint,
  onToggleInput,
}: {
  controls: MutableRefObject<PlayerControls>
  paused: boolean
  completed: string[]
  collected: string[]
  inputA: boolean
  inputB: boolean
  onCheckpoint: (id: string) => void
  onCollect: (id: string) => void
  onNearCheckpoint: (id: string | null) => void
  onToggleInput: (input: 'A' | 'B') => void
}) {
  const player = useRef<THREE.Group>(null)
  const cameraYaw = useRef(0)
  const cameraPitch = useRef(0.35)
  const jumpVelocity = useRef(0)
  const jumpPending = useRef(false)
  const walking = useRef(false)
  const keys = useRef(new Set<string>())
  const nearId = useRef<string | null>(null)
  const nearestUpdate = useRef(0)
  const desiredCamera = useRef(new THREE.Vector3())
  const { camera } = useThree()

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'e'].includes(event.key.toLowerCase())) {
        if (!(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) event.preventDefault()
        keys.current.add(event.key.toLowerCase())
        if (event.key === ' ' && !event.repeat) jumpPending.current = true
      }
    }
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase())
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((_, rawDelta) => {
    if (!player.current) return
    const delta = Math.min(rawDelta, 0.045)
    if (!paused) {
      const direction = combineMovementInput(keys.current, controls.current.movement)

      const cameraMovement = controls.current.consumeCameraMovement()
      cameraYaw.current += cameraMovement.x * 0.004
      cameraPitch.current = THREE.MathUtils.clamp(cameraPitch.current + cameraMovement.y * 0.002, 0.12, 0.75)

      const worldDirection = movementToWorldVector(direction, cameraYaw.current)
      const worldX = worldDirection.x * 5.2 * delta
      const worldZ = worldDirection.z * 5.2 * delta
      player.current.position.x = THREE.MathUtils.clamp(player.current.position.x + worldX, -14, 14)
      player.current.position.z = THREE.MathUtils.clamp(player.current.position.z + worldZ, -13, 12)
      walking.current = Math.hypot(worldX, worldZ) > 0.001

      if (walking.current) player.current.rotation.y = Math.atan2(worldX, -worldZ)
      if (jumpPending.current && player.current.position.y <= 0.015) {
        jumpVelocity.current = 5.3
        jumpPending.current = false
      }
      jumpVelocity.current -= 12 * delta
      player.current.position.y = Math.max(0, player.current.position.y + jumpVelocity.current * delta)
      if (player.current.position.y === 0) jumpVelocity.current = 0

      desiredCamera.current.set(
        player.current.position.x + Math.sin(cameraYaw.current) * 7.3,
        player.current.position.y + 3 + cameraPitch.current * 2.5,
        player.current.position.z + Math.cos(cameraYaw.current) * 7.3,
      )
      camera.position.lerp(desiredCamera.current, 1 - Math.exp(-5.5 * delta))
      camera.lookAt(player.current.position.x, player.current.position.y + 1.1, player.current.position.z)

      let closest: string | null = null
      let closestDistance = 2.35
      for (const mission of logicLandMissions) {
        const distance = Math.hypot(
          player.current.position.x - mission.checkpoint[0],
          player.current.position.z - mission.checkpoint[2],
        )
        if (distance < closestDistance && !completed.includes(mission.id)) {
          closest = mission.id
          closestDistance = distance
        }
      }
      if (closest !== nearId.current && performance.now() - nearestUpdate.current > 140) {
        nearId.current = closest
        nearestUpdate.current = performance.now()
        onNearCheckpoint(closest)
      }
      if (closest && keys.current.has('e')) {
        keys.current.delete('e')
        onCheckpoint(closest)
      }
    } else {
      keys.current.clear()
      jumpPending.current = false
      walking.current = false
      controls.current.reset()
    }
  })

  return (
    <>
      <color attach="background" args={['#07111f']} />
      <fog attach="fog" args={['#07111f', 18, 38]} />
      <ambientLight intensity={0.75} />
      <hemisphereLight args={['#a8eeff', '#10172d', 1]} />
      <directionalLight position={[8, 14, 5]} intensity={1.15} />
      <pointLight position={[0, 5, 0]} color="#00d9ff" intensity={14} distance={24} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial color="#0b1728" roughness={0.9} metalness={0.2} />
      </mesh>
      <gridHelper args={[32, 32, '#175477', '#10243a']} position={[0, -0.1, 0]} />

      {Array.from({ length: 10 }, (_, index) => {
        const x = -13.2 + index * 2.92
        return (
          <group key={index} position={[x, 0, index % 2 === 0 ? -12 : -11]}>
            <mesh position={[0, 1.45, 0]} castShadow>
              <boxGeometry args={[1.1, 2.9 + (index % 3) * 0.8, 1]} />
              <meshStandardMaterial color={index % 2 === 0 ? '#132d4b' : '#241b49'} metalness={0.52} roughness={0.42} />
            </mesh>
            <mesh position={[0, 0.9, 0.54]}>
              <boxGeometry args={[0.6, 0.07, 0.025]} />
              <meshBasicMaterial color={index % 2 === 0 ? '#00d9ff' : '#a855f7'} />
            </mesh>
          </group>
        )
      })}

      {logicLandMissions.slice(0, -1).map((mission, index) => {
        const next = logicLandMissions[index + 1]
        const startX = mission.checkpoint[0]
        const startZ = mission.checkpoint[2]
        const endX = next.checkpoint[0]
        const endZ = next.checkpoint[2]
        const centerX = (startX + endX) / 2
        const centerZ = (startZ + endZ) / 2
        const length = Math.hypot(endX - startX, endZ - startZ)
        const angle = Math.atan2(endZ - startZ, endX - startX)

        return (
          <mesh key={mission.id} position={[centerX, 0.015, centerZ]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[length, 0.035, 0.12]} />
            <meshBasicMaterial color="#00bce8" transparent opacity={0.72} />
          </mesh>
        )
      })}

      {logicLandMissions.map((mission) => (
        <MissionCheckpoint
          key={mission.id}
          mission={mission}
          active={!completed.includes(mission.id)}
          complete={completed.includes(mission.id)}
          onActivate={() => onCheckpoint(mission.id)}
        />
      ))}

      {collectibles.map((item) => (
        <EnergyCrystal
          key={item.id}
          id={item.id}
          position={item.position}
          collected={collected.includes(item.id)}
          onCollect={onCollect}
        />
      ))}

      <BinarySwitch input="A" value={inputA} onToggle={() => onToggleInput('A')} />
      <BinarySwitch input="B" value={inputB} onToggle={() => onToggleInput('B')} />

      <group ref={player} position={[0, 0, 10]}>
        <EngineerAvatar walking={walking} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <ringGeometry args={[14.8, 15.1, 72]} />
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.62} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

function VirtualJoystick({
  controls,
}: {
  controls: MutableRefObject<PlayerControls>
}) {
  const base = useRef<HTMLDivElement>(null)
  const activePointer = useRef<number | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const update = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!base.current) return
    const rect = base.current.getBoundingClientRect()
    const radius = rect.width * 0.34
    const x = event.clientX - (rect.left + rect.width / 2)
    const y = event.clientY - (rect.top + rect.height / 2)
    const length = Math.hypot(x, y)
    const scale = length > radius ? radius / length : 1
    const limitedX = x * scale
    const limitedY = y * scale
    controls.current.setMovement(limitedX / radius, limitedY / radius)
    setOffset({ x: limitedX, y: limitedY })
  }

  return (
    <div
      ref={base}
      className="virtual-joystick"
      aria-label="Movement joystick"
      onPointerDown={(event) => {
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        activePointer.current = event.pointerId
        update(event)
      }}
      onPointerMove={(event) => {
        if (activePointer.current === event.pointerId) update(event)
      }}
      onPointerUp={(event) => {
        if (activePointer.current === event.pointerId) {
          activePointer.current = null
          controls.current.setMovement(0, 0)
          setOffset({ x: 0, y: 0 })
        }
      }}
      onPointerCancel={() => {
        activePointer.current = null
        controls.current.setMovement(0, 0)
        setOffset({ x: 0, y: 0 })
      }}
    >
      <span className="joystick-arrow joystick-up">▲</span>
      <span className="joystick-arrow joystick-down">▼</span>
      <span className="joystick-arrow joystick-left">◀</span>
      <span className="joystick-arrow joystick-right">▶</span>
      <span className="joystick-thumb" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} />
    </div>
  )
}

function TouchLook({
  controls,
}: {
  controls: MutableRefObject<PlayerControls>
}) {
  const activePointer = useRef<number | null>(null)
  const last = useRef({ x: 0, y: 0 })

  return (
    <div
      className="touch-look-pad"
      aria-label="Touch camera control"
      onPointerDown={(event) => {
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        activePointer.current = event.pointerId
        last.current = { x: event.clientX, y: event.clientY }
      }}
      onPointerMove={(event) => {
        if (activePointer.current !== event.pointerId) return
        controls.current.addCameraMovement(event.clientX - last.current.x, event.clientY - last.current.y)
        last.current = { x: event.clientX, y: event.clientY }
      }}
      onPointerUp={(event) => {
        if (activePointer.current === event.pointerId) activePointer.current = null
      }}
      onPointerCancel={() => { activePointer.current = null }}
    >
      <span>DRAG TO LOOK</span>
    </div>
  )
}

export function LogicLandGame({ onExit }: Props) {
  const [searchParams] = useSearchParams()
  const initialMission = getLogicLandMissionFromIndex(searchParams.get('mission'))
  const profile = useChipverseStore((state) => state.profile)
  const completeMission = useChipverseStore((state) => state.completeMission)
  const collectItem = useChipverseStore((state) => state.collectItem)
  const controls = useRef(new PlayerControls())
  const [activeMission, setActiveMission] = useState<(typeof logicLandMissions)[number] | null>(initialMission)
  const [stage, setStage] = useState<'briefing' | 'challenge' | 'result'>('briefing')
  const [selectedGate, setSelectedGate] = useState<LogicGate>('AND')
  const [inputA, setInputA] = useState(initialMission?.a ?? true)
  const [inputB, setInputB] = useState(initialMission?.b ?? false)
  const [attempts, setAttempts] = useState(0)
  const [score, setScore] = useState(0)
  const [awardedXp, setAwardedXp] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [nearbyMissionId, setNearbyMissionId] = useState<string | null>(null)
  const [collected, setCollected] = useState<string[]>(() => profile.collectibles ?? [])
  const [paused, setPaused] = useState(initialMission !== null)
  const [sceneReady, setSceneReady] = useState(false)

  const completed = profile.completedMissions.filter((id) => logicLandMissions.some((mission) => mission.id === id))
  const firstIncomplete = logicLandMissions.find((mission) => !completed.includes(mission.id))
  const isComplete = completed.length === logicLandMissions.length
  const output = activeMission ? logicGateOutput(selectedGate, inputA, inputB) : false
  const award = useCallback((id: string) => {
    if (collected.includes(id)) return
    setCollected((current) => current.includes(id) ? current : [...current, id])
    collectItem(id, 25)
  }, [collectItem, collected])

  const openMission = useCallback((missionId: string) => {
    const mission = logicLandMissions.find((entry) => entry.id === missionId)
    if (!mission) return
    setActiveMission(mission)
    setSelectedGate('AND')
    setInputA(mission.a)
    setInputB(mission.b)
    setAttempts(0)
    setFeedback('')
    setStage('briefing')
    setPaused(true)
  }, [])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activeMission) {
          setActiveMission(null)
          setPaused(false)
        } else {
          setPaused((current) => !current)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeMission])

  const startChallenge = () => {
    setStage('challenge')
    setSelectedGate('AND')
  }

  const submitAnswer = () => {
    if (!activeMission) return
    const expected = logicGateOutput(activeMission.gate, inputA, inputB)
    if (selectedGate !== activeMission.gate || output !== expected) {
      setAttempts((current) => current + 1)
      setFeedback(`Not yet. With A=${Number(inputA)} and B=${Number(inputB)}, ${selectedGate} produces ${Number(output)}. Try another gate.`)
      return
    }

    const challengeScore = calculateMissionScore(attempts)
    const alreadyCompleted = profile.completedMissions.includes(activeMission.id)
    const xp = alreadyCompleted ? 0 : activeMission.reward
    setScore(challengeScore)
    setAwardedXp(xp)
    setFeedback(alreadyCompleted ? 'Practice complete. This mission was already rewarded.' : activeMission.concept)
    completeMission(activeMission.id, 'logic-land', xp)
    setStage('result')
  }

  const cameraDrag = useRef(false)

  return (
    <section
      className="logic-land-screen"
      aria-label="Playable Logic Land 3D world"
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse' && (event.target as HTMLElement).tagName === 'CANVAS') cameraDrag.current = true
      }}
      onPointerMove={(event) => {
        if (cameraDrag.current && event.pointerType === 'mouse' && event.buttons === 1) {
          controls.current.addCameraMovement(event.movementX, event.movementY)
        }
      }}
      onPointerUp={() => { cameraDrag.current = false }}
      onPointerLeave={() => { cameraDrag.current = false }}
    >
      <Canvas
        camera={{ position: [0, 4.5, 17.5], fov: 58 }}
        dpr={profile.settings.graphics === 'low' ? [0.8, 1] : profile.settings.graphics === 'high' ? [1, 1.6] : [1, 1.2]}
        gl={{ antialias: profile.settings.graphics !== 'low', powerPreference: 'low-power', alpha: false }}
        shadows={profile.settings.graphics === 'high'}
        onCreated={() => setSceneReady(true)}
        fallback={<div className="scene-fallback">3D graphics are unavailable in this browser. You can still return to the universe or use the existing learning labs.</div>}
      >
        <Suspense fallback={null}>
          <LogicLandScene
            controls={controls}
            paused={paused}
            completed={completed}
            collected={collected}
            inputA={inputA}
            inputB={inputB}
            onCheckpoint={openMission}
            onCollect={award}
            onNearCheckpoint={setNearbyMissionId}
            onToggleInput={(input) => {
              if (input === 'A') setInputA((value) => !value)
              else setInputB((value) => !value)
            }}
          />
        </Suspense>
      </Canvas>
      {!sceneReady && (
        <div className="scene-loading" role="status">
          <span className="scene-loading-spinner" />
          <span>Generating Logic Land</span>
        </div>
      )}

      <div className="game-topbar">
        <button type="button" className="game-back-button" onClick={onExit}>← Universe</button>
        <div className="game-world-title">
          <span className="world-live-dot" />
          <div><strong>LOGIC LAND</strong><small>Interactive VLSI world · local save enabled</small></div>
        </div>
        <div className="game-player-hud">
          <span>{profile.name}</span><b>{profile.xp} XP</b>
        </div>
      </div>

      <aside className="game-objective-panel">
        <p className="eyebrow">MISSION TRACKER</p>
        <h2>{isComplete ? 'World mastered' : firstIncomplete?.name ?? 'All checkpoints cleared'}</h2>
        <p>{isComplete ? 'All five Logic Land missions are complete.' : firstIncomplete?.briefing}</p>
        <div className="mission-progress-dots">
          {logicLandMissions.map((mission) => (
            <span key={mission.id} className={completed.includes(mission.id) ? 'mission-dot completed' : 'mission-dot'} title={mission.name} />
          ))}
        </div>
        <small>{completed.length} / {logicLandMissions.length} checkpoints cleared</small>
        {isComplete && <button type="button" className="secondary-btn" onClick={onExit}>Return to Universe</button>}
      </aside>

      <div className="game-hint">
        {nearbyMissionId ? (
          <button type="button" className="primary-btn" onClick={() => openMission(nearbyMissionId)}>
            Interact · press E
          </button>
        ) : (
          <span>WASD / arrows to move · Space to jump · explore the glowing checkpoints</span>
        )}
      </div>

      <div className="game-control-hint">Drag the scene to look around</div>
      <VirtualJoystick controls={controls} />
      <TouchLook controls={controls} />
      <button type="button" className="pause-game-button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Resume game' : 'Pause game'}>
        {paused ? '▶' : 'Ⅱ'}
      </button>

      {paused && !activeMission && (
        <div className="game-modal-backdrop">
          <div className="game-dialog game-pause-dialog">
            <p className="eyebrow">GAME PAUSED</p>
            <h2>Take a breather, Engineer.</h2>
            <p>Your mission progress and collectibles are saved locally.</p>
            <div className="cta-row">
              <button type="button" className="primary-btn" onClick={() => setPaused(false)}>Resume</button>
              <button type="button" className="secondary-btn" onClick={onExit}>Exit to Universe</button>
            </div>
          </div>
        </div>
      )}

      {activeMission && (
        <div className="game-modal-backdrop">
          <section className="game-dialog" role="dialog" aria-modal="true" aria-labelledby="mission-title">
            <button type="button" className="dialog-close" onClick={() => { setActiveMission(null); setPaused(false) }} aria-label="Close mission">×</button>
            {stage === 'briefing' && (
              <>
                <p className="eyebrow">CHECKPOINT BRIEFING</p>
                <h2 id="mission-title">{activeMission.name}</h2>
                <p>{activeMission.briefing}</p>
                <div className="briefing-target">
                  <span>Mission objective</span>
                  <strong>Identify the correct gate</strong>
                  <small>Toggle the inputs, select a gate, and compare the live output.</small>
                </div>
                <div className="dialog-actions">
                  <button type="button" className="secondary-btn" onClick={() => { setActiveMission(null); setPaused(false) }}>Not now</button>
                  <button type="button" className="primary-btn" onClick={startChallenge}>Start challenge</button>
                </div>
              </>
            )}

            {stage === 'challenge' && (
              <>
                <p className="eyebrow">BOOLEAN LOGIC CHALLENGE</p>
                <h2 id="mission-title">{activeMission.name}</h2>
                <p>{activeMission.briefing}</p>
                <div className="truth-inputs">
                  <button type="button" className={inputA ? 'logic-input on' : 'logic-input'} onClick={() => setInputA((value) => !value)}>A <b>{Number(inputA)}</b></button>
                  <button type="button" className={inputB ? 'logic-input on' : 'logic-input'} onClick={() => setInputB((value) => !value)}>B <b>{Number(inputB)}</b></button>
                  <div className="logic-output">
                    <span>{selectedGate} output</span>
                    <strong>{Number(output)}</strong>
                  </div>
                </div>
                <div className="gate-choice-row" aria-label="Select a logic gate">
                  {logicGateChoices.map((gate) => (
                    <button
                      type="button"
                      key={gate}
                      className={selectedGate === gate ? 'gate-choice selected' : 'gate-choice'}
                      onClick={() => { setSelectedGate(gate); setFeedback('') }}
                    >
                      {gate}
                    </button>
                  ))}
                </div>
                <div className="truth-table" aria-label={`${selectedGate} truth table`}>
                  <span>A</span><span>B</span><span>{selectedGate}</span>
                  {[false, true].flatMap((a) => [false, true].map((b) => (
                    <span key={`${Number(a)}${Number(b)}`} className={a === inputA && b === inputB ? 'truth-row current' : 'truth-row'}>
                      {Number(a)} {Number(b)} → {Number(logicGateOutput(selectedGate, a, b))}
                    </span>
                  )))}
                </div>
                {feedback && <p className="challenge-feedback error">{feedback}</p>}
                <div className="dialog-actions">
                  <button type="button" className="secondary-btn" onClick={() => setStage('briefing')}>Briefing</button>
                  <button type="button" className="primary-btn" onClick={submitAnswer}>Test circuit</button>
                </div>
              </>
            )}

            {stage === 'result' && (
              <>
                <p className="eyebrow">{isComplete ? 'LOGIC LAND COMPLETE' : 'MISSION COMPLETE'}</p>
                <div className="mission-result-icon">✓</div>
                <h2 id="mission-title">{isComplete ? 'Logic Land mastered!' : 'Circuit online!'}</h2>
                <p>{feedback}</p>
                <div className="score-summary">
                  <div><small>Mission score</small><strong>{score} / 100</strong></div>
                  <div><small>Attempts</small><strong>{attempts + 1}</strong></div>
                  <div><small>XP earned</small><strong>+{awardedXp}</strong></div>
                </div>
                <div className="dialog-actions">
                  <button type="button" className="secondary-btn" onClick={() => { setActiveMission(null); setPaused(false) }}>Keep exploring</button>
                  {firstIncomplete ? (
                    <button type="button" className="primary-btn" onClick={() => openMission(firstIncomplete.id)}>Next checkpoint</button>
                  ) : (
                    <button type="button" className="primary-btn" onClick={onExit}>Return to Universe</button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}

    </section>
  )
}
