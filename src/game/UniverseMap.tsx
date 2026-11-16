import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { worldConfig } from '../gameData'
import { useChipverseStore } from '../store'

type UniverseMapProps = {
  onEnterLogicLand: () => void
  onPreviewWorld: (worldId: string) => void
}

function Planet({
  index,
  position,
  color,
  selected,
  onSelect,
}: {
  index: number
  position: [number, number, number]
  color: string
  selected: boolean
  onSelect: () => void
}) {
  const planetRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * (selected ? 0.3 : 0.12)
      planetRef.current.rotation.x = Math.sin(performance.now() * 0.00015 + index) * 0.04
    }
  })

  const radius = 0.72 + (index % 3) * 0.09

  return (
    <Float speed={1 + index * 0.09} floatIntensity={0.16} rotationIntensity={0.12}>
      <group ref={planetRef} position={position} onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}>
        <mesh>
          <sphereGeometry args={[radius, 28, 20]} />
          <meshStandardMaterial color={color} roughness={0.72} metalness={0.08} emissive={color} emissiveIntensity={selected ? 0.35 : 0.12} />
        </mesh>
        <mesh scale={radius * 1.035}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={selected ? 0.16 : 0.08} />
        </mesh>
        {index % 3 === 1 && (
          <mesh rotation={[0.35, 0.2, 0.1]}>
            <torusGeometry args={[radius * 1.48, 0.035, 8, 54]} />
            <meshBasicMaterial color={color} transparent opacity={0.72} />
          </mesh>
        )}
        {index % 3 === 2 && (
          <group>
            <mesh position={[radius * 0.82, radius * 0.45, 0]}>
              <boxGeometry args={[0.22, 0.22, 0.22]} />
              <meshStandardMaterial color="#dbeafe" emissive={color} emissiveIntensity={0.45} />
            </mesh>
            <mesh position={[-radius * 0.82, -radius * 0.3, radius * 0.25]}>
              <octahedronGeometry args={[0.18, 0]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} />
            </mesh>
          </group>
        )}
        {selected && (
          <mesh>
            <sphereGeometry args={[radius * 1.18, 24, 16]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.2} />
          </mesh>
        )}
      </group>
    </Float>
  )
}

function StarField() {
  const positions = useMemo(() => {
    const points = new Float32Array(420 * 3)
    for (let index = 0; index < 420; index += 1) {
      const randomA = Math.sin(index * 127.1 + 311.7) * 43758.5453
      const randomB = Math.sin(index * 269.5 + 183.3) * 24634.6345
      const randomC = Math.sin(index * 419.2 + 79.7) * 13421.321
      const fractionA = randomA - Math.floor(randomA)
      const fractionB = randomB - Math.floor(randomB)
      const fractionC = randomC - Math.floor(randomC)
      const radius = 16 + fractionA * 24
      const theta = fractionB * Math.PI * 2
      points[index * 3] = Math.cos(theta) * radius
      points[index * 3 + 1] = (fractionC - 0.5) * 26
      points[index * 3 + 2] = Math.sin(theta) * radius
    }
    return points
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#a8dfff" size={0.055} sizeAttenuation transparent opacity={0.75} />
    </points>
  )
}

function UniverseScene({
  selectedId,
  onSelect,
  lowPower,
}: {
  selectedId: string
  onSelect: (id: string) => void
  lowPower: boolean
}) {
  const radius = 5.2

  return (
    <>
      <color attach="background" args={['#050914']} />
      <fog attach="fog" args={['#050914', 16, 36]} />
      <ambientLight intensity={0.9} />
      <pointLight position={[0, 5, 6]} color="#00d9ff" intensity={42} distance={30} />
      <pointLight position={[-8, -3, -6]} color="#8b5cf6" intensity={22} distance={26} />
      {!lowPower && <StarField />}
      <group>
        {worldConfig.map((world, index) => {
          const angle = (index / worldConfig.length) * Math.PI * 2 - Math.PI / 2
          const position: [number, number, number] = [
            Math.cos(angle) * radius,
            Math.sin(angle * 2) * 0.65,
            Math.sin(angle) * radius,
          ]

          return (
            <Planet
              key={world.id}
              index={index}
              position={position}
              color={world.color}
              selected={selectedId === world.id}
              onSelect={() => onSelect(world.id)}
            />
          )
        })}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.2, 0]}>
        <ringGeometry args={[3.2, 8.6, 72]} />
        <meshBasicMaterial color="#167db2" transparent opacity={0.16} side={THREE.DoubleSide} />
      </mesh>
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={8}
        maxDistance={21}
        minPolarAngle={0.55}
        maxPolarAngle={2.25}
        autoRotate
        autoRotateSpeed={0.24}
        rotateSpeed={0.55}
        zoomSpeed={0.65}
      />
    </>
  )
}

export function UniverseMap({ onEnterLogicLand, onPreviewWorld }: UniverseMapProps) {
  const profile = useChipverseStore((state) => state.profile)
  const [selectedId, setSelectedId] = useState('logic-land')
  const [sceneReady, setSceneReady] = useState(false)
  const selectedWorld = worldConfig.find((world) => world.id === selectedId) ?? worldConfig[0]
  const unlocked = profile.unlockedWorlds.includes(selectedWorld.id)
  const lowPower = profile.settings.graphics === 'low' || (typeof navigator !== 'undefined' && navigator.hardwareConcurrency < 5)

  return (
    <section className="universe-screen" aria-label="Interactive 3D universe map">
      <Canvas
        camera={{ position: [0, 7.5, 13.5], fov: 48 }}
        dpr={lowPower ? [0.8, 1] : profile.settings.graphics === 'high' ? [1, 1.65] : [1, 1.25]}
        gl={{ antialias: !lowPower, powerPreference: 'low-power', alpha: false }}
        onCreated={() => setSceneReady(true)}
        fallback={<div className="scene-fallback">3D graphics are unavailable in this browser. The world list remains available below.</div>}
      >
        <Suspense fallback={null}>
          <UniverseScene selectedId={selectedId} onSelect={setSelectedId} lowPower={lowPower} />
        </Suspense>
      </Canvas>
      {!sceneReady && (
        <div className="scene-loading" role="status">
          <span className="scene-loading-spinner" />
          <span>Mapping the semiconductor universe</span>
        </div>
      )}

      <div className="universe-heading">
        <p className="eyebrow">CHIPVERSE NAVIGATION</p>
        <h1>Semiconductor Universe</h1>
        <p>Drag to rotate · scroll or pinch to zoom · select a planet to inspect it</p>
      </div>

      <aside className="universe-inspector">
        <div className="inspector-world-color" style={{ backgroundColor: selectedWorld.color }} />
        <p className="eyebrow">{unlocked ? 'PLAYABLE WORLD' : 'WORLD PREVIEW'}</p>
        <h2>{selectedWorld.name}</h2>
        <p>{selectedWorld.description}</p>
        <div className="world-topic-chips">
          {selectedWorld.topics.slice(0, 4).map((topic) => <span key={topic}>{topic}</span>)}
        </div>
        {selectedWorld.id === 'logic-land' ? (
          <button type="button" className="primary-btn" onClick={onEnterLogicLand}>Land in Logic Land</button>
        ) : (
          <button type="button" className="secondary-btn" onClick={() => onPreviewWorld(selectedWorld.id)}>
            View world brief
          </button>
        )}
        <small>Logic Land is the playable 3D world in this release. Other planets are interactive previews.</small>
      </aside>

      <div className="universe-world-strip" aria-label="Select a world">
        {worldConfig.map((world) => (
          <button
            type="button"
            className={world.id === selectedId ? 'world-select active' : 'world-select'}
            key={world.id}
            onClick={() => setSelectedId(world.id)}
          >
            <span className="world-select-dot" style={{ backgroundColor: world.color }} />
            <span>{world.name}</span>
            <small>{world.id === 'logic-land' ? 'PLAYABLE' : 'PREVIEW'}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
