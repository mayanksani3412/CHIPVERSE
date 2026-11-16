import { lazy, Suspense, useState, type ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import './App.css'
import { featureCards, labOptions, worldConfig } from './gameData'
import { calculateLevel, calculateRank, logicGateOutput } from './gameLogic'
import { useChipverseStore } from './store'
import { AccountScreen } from './auth/AccountScreen'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/AuthContext'

const LogicLandGame = lazy(() => import('./game/LogicLandGame').then(({ LogicLandGame: Game }) => ({ default: Game })))
const UniverseMap = lazy(() => import('./game/UniverseMap').then(({ UniverseMap: Map }) => ({ default: Map })))

const navItems = [
  { to: '/', label: 'Intro' },
  { to: '/account', label: 'Profile' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/universe', label: 'Universe' },
  { to: '/labs', label: 'Labs' },
  { to: '/settings', label: 'Settings' },
]

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}

function AppShell() {
  const profile = useChipverseStore((state) => state.profile)
  const { session } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">C</div>
          <div>
            <div className="brand-name">CHIPVERSE</div>
            <div className="brand-tag">Learn. Design. Simulate. Innovate.</div>
          </div>
        </div>

        <nav className="topnav" aria-label="Main Navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {session
          ? <Link className="profile-chip" to="/account"><span className="chip-avatar">{profile.avatar}</span><span>{profile.name}</span></Link>
          : <Link className="profile-chip sign-in-chip" to="/account">Sign in</Link>}
      </header>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/account" element={<AccountScreen />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardView /></RequireAuth>} />
          <Route path="/universe" element={<RequireAuth><UniverseScreen /></RequireAuth>} />
          <Route path="/play/logic-land" element={
            <RequireAuth>
              <Suspense fallback={<SceneRouteLoading />}>
                <LogicLandGame onExit={() => navigate('/universe')} />
              </Suspense>
            </RequireAuth>
          } />
          <Route path="/world/:worldId" element={<RequireAuth><WorldScreen /></RequireAuth>} />
          <Route path="/mission/:missionId" element={<RequireAuth><MissionScreen /></RequireAuth>} />
          <Route path="/labs" element={<RequireAuth><LabsScreen /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsScreen /></RequireAuth>} />
        </Routes>
      </main>
    </div>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, authLoading, profileStatus, profileError, retryProfile } = useAuth()
  const location = useLocation()

  if (authLoading) return <SceneRouteLoading />
  if (!session) return <Navigate to="/account" replace state={{ from: location }} />
  if (profileStatus === 'loading' || profileStatus === 'idle') return <SceneRouteLoading />
  if (profileStatus === 'error') {
    return (
      <section className="panel-card auth-panel">
        <p className="eyebrow">CLOUD PROFILE</p>
        <h2>Could not load your player profile</h2>
        <p className="auth-error" role="alert">{profileError}</p>
        <button type="button" className="primary-btn" onClick={retryProfile}>Retry</button>
      </section>
    )
  }
  return children
}

function LandingPage() {
  const navigate = useNavigate()

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">3D VLSI ENGINEERING ADVENTURE</p>
          <h1>Explore the semiconductor universe and master chip design.</h1>
          <p className="lead">
            Travel through eight worlds, complete missions, build circuits, design Verilog systems,
            and become a Master Chip Architect.
          </p>
          <div className="cta-row">
            <button type="button" className="primary-btn" onClick={() => navigate('/account')}>
              Start Your Journey
            </button>
            <button type="button" className="secondary-btn" onClick={() => navigate('/dashboard')}>
              Continue Mission
            </button>
          </div>
          <ul className="feature-inline">
            {featureCards.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="hero-visual">
          <div className="chip-core">
            <div className="chip-outline" />
            <div className="chip-glow" />
            <div className="chip-lines" />
          </div>
        </div>
      </section>

      <section className="info-grid">
        <div className="info-card">
          <h3>Explore Worlds</h3>
          <p>Eight distinct planets from Logic Land to the final ChipVerse Core.</p>
        </div>
        <div className="info-card">
          <h3>Build & Simulate</h3>
          <p>Use logic labs, circuit builders, waveform analysis, and HDL exercises.</p>
        </div>
        <div className="info-card">
          <h3>Grow Your Rank</h3>
          <p>Earn XP, unlock achievements, and climb the engineer progression ladder.</p>
        </div>
      </section>
    </motion.div>
  )
}

function DashboardView() {
  const profile = useChipverseStore((state) => state.profile)
  const completedCount = profile.completedMissions.length
  const rank = calculateRank(profile.xp)
  const level = calculateLevel(profile.xp)
  const recentMissions = worldConfig
    .flatMap((world) => world.missions)
    .filter((mission) => profile.completedMissions.includes(mission.id))
    .slice(-3)
    .reverse()

  return (
    <div className="dashboard-grid">
      <section className="panel-card dashboard-top">
        <div className="profile-summary">
          <div className="avatar-box large">{profile.avatar}</div>
          <div>
            <p className="eyebrow">PLAYER DASHBOARD</p>
            <h2>{profile.name}</h2>
            <div className="stat-row">
              <span>Rank: {rank}</span>
              <span>Level: {level}</span>
              <span>Player ID: {profile.playerId}</span>
            </div>
          </div>
        </div>
        <div className="xp-box">
          <span>XP</span>
          <strong>{profile.xp}</strong>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Progress Overview</h3>
        </div>
        <div className="stat-grid">
          <div className="mini-stat"><span>Completed missions</span><strong>{completedCount}</strong></div>
          <div className="mini-stat"><span>Unlocked worlds</span><strong>{profile.unlockedWorlds.length}</strong></div>
          <div className="mini-stat"><span>Achievements</span><strong>{profile.achievements.length}</strong></div>
          <div className="mini-stat"><span>Energy crystals</span><strong>{profile.collectibles.length}</strong></div>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>World Progress</h3>
          <Link to="/universe">Explore universe</Link>
        </div>
        <div className="progress-stack">
          {worldConfig.map((world) => (
            <div key={world.id} className="progress-bar-row">
              <span>{world.name}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(world.missions.filter((mission) => profile.completedMissions.includes(mission.id)).length / world.missions.length) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Recent Activity</h3>
        </div>
        <ul className="activity-list">
          {recentMissions.length > 0
            ? recentMissions.map((mission) => <li key={mission.id}>Completed {mission.name}</li>)
            : <li>Ready to begin the first Logic Land mission</li>}
          {profile.collectibles.length > 0 && <li>Collected {profile.collectibles.length} energy crystal{profile.collectibles.length === 1 ? '' : 's'}</li>}
          <li>Progress syncs to your CHIPVERSE cloud profile</li>
        </ul>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Daily Challenge</h3>
        </div>
        <p className="daily-challenge">Solve a 2-input logic puzzle and earn +200 XP.</p>
        <Link to="/world/logic-land" className="primary-link">Continue Journey</Link>
      </section>
    </div>
  )
}

function UniverseScreen() {
  const navigate = useNavigate()
  return (
    <Suspense fallback={<SceneRouteLoading />}>
      <UniverseMap
        onEnterLogicLand={() => navigate('/play/logic-land')}
        onPreviewWorld={(worldId) => navigate(`/world/${worldId}`)}
      />
    </Suspense>
  )
}

function SceneRouteLoading() {
  return (
    <div className="route-loading-panel" role="status">
      <span className="scene-loading-spinner" />
      <span>Loading the 3D environment…</span>
    </div>
  )
}
function WorldScreen() {
  const { worldId } = useParams()
  const navigate = useNavigate()
  const world = worldConfig.find((item) => item.id === worldId) ?? worldConfig[0]

  if (world.id !== 'logic-land') {
    return (
      <div className="panel-card wide-panel world-preview-page">
        <p className="eyebrow">INTERACTIVE WORLD PREVIEW</p>
        <h2>{world.name}</h2>
        <p>{world.description}</p>
        <div className="preview-status">
          <span className="preview-status-dot" />
          This world is a navigable universe preview. Its 3D gameplay and missions are not implemented yet.
        </div>
        <ul className="topic-list">
          {world.topics.map((topic) => <li key={topic}>{topic}</li>)}
        </ul>
        <button type="button" className="secondary-btn" onClick={() => navigate('/universe')}>Back to Universe</button>
      </div>
    )
  }

  return (
    <div className="panel-card wide-panel">
      <div className="panel-header split-header">
        <div>
          <p className="eyebrow">PLAYABLE WORLD</p>
          <h2>{world.name}</h2>
        </div>
        <button type="button" className="primary-btn" onClick={() => navigate('/play/logic-land')}>Enter 3D World</button>
      </div>

      <div className="world-body">
        <div className="world-visual" style={{ background: `linear-gradient(135deg, ${world.color}33, #0d1425)` }}>
          <div className="world-planet" style={{ background: world.color }} />
        </div>
        <div className="world-copy">
          <p>{world.description}</p>
          <ul className="topic-list">
            {world.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mission-list">
        {world.missions.map((mission, index) => (
          <div key={mission.id} className="mission-card">
            <div>
              <h4>{mission.name}</h4>
              <p>{mission.objective}</p>
            </div>
            <div className="mission-meta">
              <span className="pill">{mission.difficulty}</span>
              <span>+{mission.reward} XP</span>
            </div>
            <button type="button" className="primary-btn" onClick={() => navigate(`/play/logic-land?mission=${index}`)}>
              Land at checkpoint
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function MissionScreen() {
  const { missionId } = useParams()
  const navigate = useNavigate()
  const allMissions = worldConfig.flatMap((world) => world.missions.map((mission) => ({ ...mission, worldId: world.id })))
  const mission = allMissions.find((item) => item.id === missionId) ?? allMissions[0]
  const logicMissionIndex = mission.worldId === 'logic-land'
    ? worldConfig.find((world) => world.id === 'logic-land')?.missions.findIndex((entry) => entry.id === mission.id) ?? -1
    : -1

  return (
    <div className="panel-card wide-panel">
      <p className="eyebrow">{mission.worldId === 'logic-land' ? '3D WORLD CHECKPOINT' : 'WORLD PREVIEW'}</p>
      <h2>{mission.name}</h2>
      <p>{mission.worldId === 'logic-land'
        ? 'This challenge is played at its checkpoint inside Logic Land.'
        : 'This world is a preview and does not have playable missions yet.'}</p>
      <button
        type="button"
        className="primary-btn"
        disabled={mission.worldId !== 'logic-land'}
        onClick={() => navigate(`/play/logic-land?mission=${logicMissionIndex}`)}
      >
        {mission.worldId === 'logic-land' ? 'Open Logic Land checkpoint' : 'Not playable yet'}
      </button>
    </div>
  )
}

function LabsScreen() {
  const [activeLab, setActiveLab] = useState(labOptions[0].id)

  return (
    <div className="labs-layout">
      <aside className="panel-card lab-sidebar">
        <p className="eyebrow">LABS</p>
        <ul className="lab-list">
          {labOptions.map((lab) => (
            <li key={lab.id}>
              <button type="button" className={activeLab === lab.id ? 'lab-btn active' : 'lab-btn'} onClick={() => setActiveLab(lab.id)}>
                {lab.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="panel-card lab-panel">
        {activeLab === 'logic-simulator' && <LogicSimulatorLab />}
        {activeLab === 'circuit-builder' && <CircuitBuilderLab />}
        {activeLab === 'verilog-editor' && <VerilogLab />}
        {activeLab === 'waveform-viewer' && <WaveformLab />}
        {activeLab === 'fpga-lab' && <Fpgalab />}
        {activeLab === 'physical-design' && <PhysicalDesignLab />}
      </section>
    </div>
  )
}

function LogicSimulatorLab() {
  const [gate, setGate] = useState<'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'XNOR'>('AND')
  const [a, setA] = useState(true)
  const [b, setB] = useState(false)

  return (
    <div className="lab-content">
      <p className="eyebrow">LAB 1: LOGIC GATE SIMULATOR</p>
      <h3>Boolean Explorer</h3>
      <div className="gate-controls">
        <select value={gate} onChange={(event) => setGate(event.target.value as 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'XNOR')}>
          <option value="AND">AND</option>
          <option value="OR">OR</option>
          <option value="NOT">NOT</option>
          <option value="XOR">XOR</option>
          <option value="NAND">NAND</option>
          <option value="NOR">NOR</option>
          <option value="XNOR">XNOR</option>
        </select>

        <button type="button" className="toggle-btn" onClick={() => setA(!a)}>
          Input A: {String(a)}
        </button>
        <button type="button" className="toggle-btn" onClick={() => setB(!b)}>
          Input B: {String(b)}
        </button>
      </div>

      <div className="output-box">
        <span>Output</span>
        <strong>{String(logicGateOutput(gate, a, b))}</strong>
      </div>
    </div>
  )
}

function CircuitBuilderLab() {
  return (
    <div className="lab-content">
      <p className="eyebrow">LAB 2: DIGITAL CIRCUIT BUILDER</p>
      <h3>Build a Half Adder</h3>
      <div className="adder-grid">
        <div className="node">A</div>
        <div className="node">B</div>
        <div className="node">SUM</div>
        <div className="node">CARRY</div>
      </div>
      <p>Educational approximation: input bits feed XOR and AND primitives before combining into a half adder output.</p>
    </div>
  )
}

function VerilogLab() {
  const [code, setCode] = useState('module top(input a, b, output y);\n  assign y = a & b;\nendmodule')

  return (
    <div className="lab-content">
      <p className="eyebrow">LAB 3: VERILOG CODING ARENA</p>
      <h3>RTL snippet</h3>
      <textarea className="code-editor" value={code} onChange={(event) => setCode(event.target.value)} />
      <div className="output-box">
        <span>Validation mode</span>
        <strong>Educational code check — compiler unavailable in this local demo.</strong>
      </div>
    </div>
  )
}

function WaveformLab() {
  const waveformValues = [0, 1, 1, 0, 1, 0, 1, 1]

  return (
    <div className="lab-content">
      <p className="eyebrow">LAB 4: WAVEFORM VIEWER</p>
      <h3>Signal Analysis</h3>
      <div className="waveform-grid">
        {waveformValues.map((value, index) => (
          <div key={`${value}-${index}`} className={value === 1 ? 'wave-signal on' : 'wave-signal off'}>
            {value}
          </div>
        ))}
      </div>
      <div className="output-box">
        <span>Clock</span>
        <strong>01010101</strong>
      </div>
    </div>
  )
}

function Fpgalab() {
  return (
    <div className="lab-content">
      <p className="eyebrow">LAB 5: FPGA VIRTUAL BOARD</p>
      <h3>LED and switch matrix</h3>
      <div className="fpga-grid">
        <div className="fpga-led on">LED 1</div>
        <div className="fpga-led off">LED 2</div>
        <div className="fpga-led on">LED 3</div>
        <div className="fpga-led off">LED 4</div>
      </div>
    </div>
  )
}

function PhysicalDesignLab() {
  return (
    <div className="lab-content">
      <p className="eyebrow">LAB 6: PHYSICAL DESIGN STUDIO</p>
      <h3>Simplified chip floorplan</h3>
      <div className="floorplan-grid">
        <div className="cell cell-a">MACRO</div>
        <div className="cell cell-b">PLACEMENT</div>
        <div className="cell cell-c">ROUTE</div>
        <div className="cell cell-d">CLOCK</div>
      </div>
      <p>Educational simulation only: simplified block placement and routing for timing understanding.</p>
    </div>
  )
}

function SettingsScreen() {
  const profile = useChipverseStore((state) => state.profile)
  const setProfile = useChipverseStore((state) => state.setProfile)

  return (
    <div className="panel-card wide-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">SETTINGS</p>
          <h2>Engineer configuration</h2>
        </div>
      </div>

      <div className="settings-grid">
        <label>
          Sound
          <input type="checkbox" checked={profile.settings.sound} onChange={() => setProfile({ settings: { ...profile.settings, sound: !profile.settings.sound } })} />
        </label>
        <label>
          Music
          <input type="checkbox" checked={profile.settings.music} onChange={() => setProfile({ settings: { ...profile.settings, music: !profile.settings.music } })} />
        </label>
        <label>
          Graphics quality
          <select value={profile.settings.graphics} onChange={(event) => setProfile({ settings: { ...profile.settings, graphics: event.target.value as 'low' | 'medium' | 'high' } })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
    </div>
  )
}

export default App
