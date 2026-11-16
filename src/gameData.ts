export type WorldDefinition = {
  id: string
  name: string
  theme: string
  color: string
  description: string
  topics: string[]
  missions: Array<{
    id: string
    name: string
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Boss'
    objective: string
    reward: number
    answer: string
    type: 'binary' | 'logic' | 'verilog' | 'simulation' | 'hardware'
  }>
}

export const worldConfig: WorldDefinition[] = [
  {
    id: 'logic-land',
    name: 'Logic Land',
    theme: 'Binary and Boolean mastery',
    color: '#00D9FF',
    description: 'A neon digital frontier where logic gates pulse through the atmosphere.',
    topics: ['Binary', 'Boolean algebra', 'Truth tables', 'Logic gates', 'Karnaugh maps'],
    missions: [
      { id: 'binary-gate-challenge', name: 'Binary Gate Challenge', difficulty: 'Beginner', objective: 'Solve the binary gate logic puzzle', reward: 250, answer: '1010', type: 'binary' },
      { id: 'logic-gate-builder', name: 'Logic Gate Builder', difficulty: 'Beginner', objective: 'Design a working AND/OR gate chain', reward: 310, answer: 'AND', type: 'logic' },
      { id: 'truth-table-explorer', name: 'Truth Table Explorer', difficulty: 'Intermediate', objective: 'Map the outputs for a 2-input XOR gate', reward: 420, answer: '0110', type: 'binary' },
      { id: 'boolean-formula-puzzle', name: 'Boolean Formula Puzzle', difficulty: 'Intermediate', objective: 'Simplify the formula with De Morgan rules', reward: 540, answer: 'A+B', type: 'logic' },
      { id: 'de-morgan-boss-battle', name: 'De Morgan Boss Battle', difficulty: 'Boss', objective: 'Defeat the logic boss by proving the identity', reward: 750, answer: 'TRUE', type: 'logic' },
    ],
  },
  {
    id: 'circuit-city',
    name: 'Circuit City',
    theme: 'Combinational and sequential design',
    color: '#2563EB',
    description: 'A sprawling engineered metropolis of adders, counters, and programmable control.',
    topics: ['Half adder', 'Full adder', 'Multiplexer', 'Flip-flops', 'Registers'],
    missions: [
      { id: 'build-half-adder', name: 'Build a Half Adder', difficulty: 'Beginner', objective: 'Create a working 1-bit adder', reward: 350, answer: 'S=SUM, C=CARRY', type: 'hardware' },
      { id: 'design-full-adder', name: 'Design a Full Adder', difficulty: 'Intermediate', objective: 'Compute carry propagation for 1+1+1', reward: 480, answer: '11', type: 'hardware' },
      { id: 'multiplexer-challenge', name: 'Multiplexer Challenge', difficulty: 'Intermediate', objective: 'Select the correct output line', reward: 550, answer: 'B', type: 'hardware' },
      { id: 'flip-flop-laboratory', name: 'Flip-Flop Laboratory', difficulty: 'Advanced', objective: 'Determine the state transition after a clock edge', reward: 670, answer: 'Q=1', type: 'simulation' },
      { id: 'digital-circuit-boss-battle', name: 'Digital Circuit Boss Battle', difficulty: 'Boss', objective: 'Complete the state machine design for the patrol gate', reward: 860, answer: 'DONE', type: 'simulation' },
    ],
  },
  {
    id: 'rtl-kingdom',
    name: 'RTL Kingdom',
    theme: 'Verilog and register-transfer logic',
    color: '#8B5CF6',
    description: 'A holographic coding domain for designing robust logic with HDL.',
    topics: ['Verilog', 'Modules', 'Procedural blocks', 'Operators', 'Sequential modeling'],
    missions: [
      { id: 'first-verilog-module', name: 'Your First Verilog Module', difficulty: 'Beginner', objective: 'Write a simple module with one input and one output', reward: 420, answer: 'module', type: 'verilog' },
      { id: 'design-and-gate', name: 'Design an AND Gate', difficulty: 'Beginner', objective: 'Create a correct AND primitive in HDL', reward: 500, answer: 'a & b', type: 'verilog' },
      { id: 'build-adder-verilog', name: 'Build an Adder in Verilog', difficulty: 'Intermediate', objective: 'Model a one-bit addition operation', reward: 620, answer: 'sum', type: 'verilog' },
      { id: 'sequential-logic-challenge', name: 'Sequential Logic Challenge', difficulty: 'Advanced', objective: 'Use an always block to model state transition', reward: 760, answer: 'always', type: 'verilog' },
      { id: 'rtl-coding-boss-battle', name: 'RTL Coding Boss Battle', difficulty: 'Boss', objective: 'Design a counter that advances every clock cycle', reward: 980, answer: 'count', type: 'verilog' },
    ],
  },
  {
    id: 'verification-zone',
    name: 'Verification Zone',
    theme: 'Simulation, assertions, and debugging',
    color: '#22C55E',
    description: 'An analysis lab for validating waveforms, timing, and test coverage.',
    topics: ['Testbenches', 'Waveforms', 'Assertions', 'Clock generation', 'Timing'],
    missions: [
      { id: 'first-testbench', name: 'First Testbench', difficulty: 'Beginner', objective: 'Create a basic stimulus block for a gate', reward: 480, answer: 'initial', type: 'simulation' },
      { id: 'verify-logic-gate', name: 'Verify a Logic Gate', difficulty: 'Intermediate', objective: 'Check the expected output for input 10', reward: 590, answer: '0', type: 'simulation' },
      { id: 'clock-reset-challenge', name: 'Clock and Reset Challenge', difficulty: 'Advanced', objective: 'Reset the circuit to a known state before simulation', reward: 710, answer: 'reset', type: 'simulation' },
      { id: 'waveform-detective', name: 'Waveform Detective', difficulty: 'Advanced', objective: 'Identify the output transition between two time steps', reward: 820, answer: 'rising', type: 'simulation' },
      { id: 'verification-boss-battle', name: 'Verification Boss Battle', difficulty: 'Boss', objective: 'Pass the assertion set for the full design', reward: 1010, answer: 'pass', type: 'simulation' },
    ],
  },
  {
    id: 'fpga-planet',
    name: 'FPGA Planet',
    theme: 'Programmable logic hardware',
    color: '#F59E0B',
    description: 'A programmable hardware world powered by LUTs, IO blocks, and synthesis flow.',
    topics: ['FPGA', 'LUT', 'CLB', 'IO blocks', 'Synthesis'],
    missions: [
      { id: 'fpga-architecture-explorer', name: 'FPGA Architecture Explorer', difficulty: 'Beginner', objective: 'Learn how LUTs map logic functions', reward: 520, answer: 'lut', type: 'hardware' },
      { id: 'configure-lut', name: 'Configure a LUT', difficulty: 'Intermediate', objective: 'Select the output pattern for the function table', reward: 610, answer: '1010', type: 'hardware' },
      { id: 'fpga-io-challenge', name: 'FPGA I/O Challenge', difficulty: 'Intermediate', objective: 'Map a switch to the correct LED output', reward: 700, answer: 'led', type: 'hardware' },
      { id: 'hardware-implementation', name: 'Hardware Implementation', difficulty: 'Advanced', objective: 'Place and route the programmable fabric', reward: 840, answer: 'route', type: 'hardware' },
      { id: 'fpga-master-challenge', name: 'FPGA Master Challenge', difficulty: 'Boss', objective: 'Complete the programming challenge for a working FPGA', reward: 1100, answer: 'program', type: 'hardware' },
    ],
  },
  {
    id: 'silicon-factory',
    name: 'Silicon Factory',
    theme: 'Semiconductor manufacturing and device physics',
    color: '#94A3B8',
    description: 'A crystal-clear production colony where transistors and wafers are born.',
    topics: ['Silicon', 'PN junction', 'CMOS', 'Wafer fabrication', 'Photolithography'],
    missions: [
      { id: 'silicon-discovery', name: 'Silicon Discovery', difficulty: 'Beginner', objective: 'Identify the dominant semiconductor material in modern chips', reward: 560, answer: 'silicon', type: 'hardware' },
      { id: 'pn-junction-laboratory', name: 'PN Junction Laboratory', difficulty: 'Intermediate', objective: 'Explain how a depletion region forms', reward: 680, answer: 'depletion', type: 'hardware' },
      { id: 'mosfet-builder', name: 'MOSFET Builder', difficulty: 'Advanced', objective: 'Construct a correct NMOS/PMOS explanation', reward: 780, answer: 'gate', type: 'hardware' },
      { id: 'photolithography-factory', name: 'Photolithography Factory', difficulty: 'Advanced', objective: 'Match light exposure to mask pattern transfer', reward: 890, answer: 'mask', type: 'hardware' },
      { id: 'silicon-manufacturing-boss-battle', name: 'Silicon Manufacturing Boss Battle', difficulty: 'Boss', objective: 'Complete a full wafer process summary', reward: 1200, answer: 'etch', type: 'hardware' },
    ],
  },
  {
    id: 'physical-design-world',
    name: 'Physical Design World',
    theme: 'Floorplanning, placement, routing, and timing',
    color: '#A855F7',
    description: 'A massive chip fabrication floor where placement and clocks become a tactical challenge.',
    topics: ['Floorplanning', 'Placement', 'Routing', 'Clock tree', 'STA'],
    missions: [
      { id: 'logic-synthesis-challenge', name: 'Logic Synthesis Challenge', difficulty: 'Intermediate', objective: 'Translate logic into a mapped netlist structure', reward: 720, answer: 'netlist', type: 'simulation' },
      { id: 'floorplan-your-chip', name: 'Floorplan Your Chip', difficulty: 'Intermediate', objective: 'Assign regions to optimize area and timing', reward: 830, answer: 'macro', type: 'simulation' },
      { id: 'standard-cell-placement', name: 'Standard Cell Placement', difficulty: 'Advanced', objective: 'Arrange cells to minimize wire lengths', reward: 920, answer: 'placement', type: 'simulation' },
      { id: 'clock-tree-routing', name: 'Clock Tree and Routing', difficulty: 'Advanced', objective: 'Balance the clock network across the floorplan', reward: 1040, answer: 'clock', type: 'simulation' },
      { id: 'physical-design-boss-battle', name: 'Physical Design Boss Battle', difficulty: 'Boss', objective: 'Finish the simplified chip layout with timing in range', reward: 1310, answer: 'timing', type: 'simulation' },
    ],
  },
  {
    id: 'chipverse-core',
    name: 'ChipVerse Core',
    theme: 'Master chip architecture and system integration',
    color: '#00D9FF',
    description: 'The epic final processor core where all disciplines merge into a single master design.',
    topics: ['Processor architecture', 'ALU', 'Register file', 'CPU integration', 'System design'],
    missions: [
      { id: 'processor-architecture-design', name: 'Processor Architecture Design', difficulty: 'Intermediate', objective: 'Define the central processing path for a simple CPU', reward: 850, answer: 'cpu', type: 'hardware' },
      { id: 'alu-construction', name: 'ALU Construction', difficulty: 'Advanced', objective: 'Build a minimal arithmetic and logic unit', reward: 980, answer: 'alu', type: 'hardware' },
      { id: 'register-file-design', name: 'Register File Design', difficulty: 'Advanced', objective: 'Organize read and write operations for fast data access', reward: 1120, answer: 'register', type: 'hardware' },
      { id: 'cpu-integration', name: 'CPU Integration', difficulty: 'Boss', objective: 'Connect the control plane, datapath, and memory interface', reward: 1280, answer: 'datapath', type: 'hardware' },
      { id: 'master-chip-architect-final-battle', name: 'MASTER CHIP ARCHITECT FINAL BATTLE', difficulty: 'Boss', objective: 'Integrate the full processor to win the final challenge', reward: 1800, answer: 'architect', type: 'hardware' },
    ],
  },
]

export const featureCards = [
  '3D universe exploration',
  'Mission-driven VLSI learning',
  'Interactive logic and circuit labs',
  'Responsive desktop and mobile play',
  'Progress persistence with local save data',
  'Achievement and rank progression',
]

export const rankSteps = [
  { cap: 499, name: 'Silicon Rookie' },
  { cap: 1499, name: 'Logic Explorer' },
  { cap: 2999, name: 'Circuit Engineer' },
  { cap: 4999, name: 'RTL Designer' },
  { cap: 7499, name: 'Verification Expert' },
  { cap: 9999, name: 'VLSI Architect' },
  { cap: Number.POSITIVE_INFINITY, name: 'Master Chip Architect' },
]

export const defaultProfile = {
  name: 'Engineer',
  avatar: 'AI',
  suit: 'Neon Pulse',
  playerId: null,
  xp: 0,
  completedMissions: [] as string[],
  unlockedWorlds: ['logic-land'],
  achievements: ['First Steps'],
  collectibles: [] as string[],
  settings: {
    sound: true,
    music: true,
    graphics: 'medium' as 'low' | 'medium' | 'high',
  },
}

export const labOptions = [
  { id: 'logic-simulator', title: 'Logic Gate Simulator', description: 'Drag gates, toggle inputs, and emulate Boolean outputs in real time.' },
  { id: 'circuit-builder', title: 'Digital Circuit Builder', description: 'Build adders and multiplexers while testing live outputs.' },
  { id: 'verilog-editor', title: 'Verilog Coding Arena', description: 'Write and validate HDL snippets with guided educational checks.' },
  { id: 'waveform-viewer', title: 'Waveform Viewer', description: 'Inspect signals, time slices, and waveform transitions.' },
  { id: 'fpga-lab', title: 'FPGA Virtual Board', description: 'Prototype circuit behavior on a simplified programmable board.' },
  { id: 'physical-design', title: 'Physical Design Studio', description: 'Explore floorplans, placement, routing, and timing simplifications.' },
]
