import { useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { 
  Text,
  Sparkles,
  Sky,
  Html,
  Float,
  Line,
  Stars
} from '@react-three/drei'
// import confetti from 'canvas-confetti'
import { Effect } from 'postprocessing'

// Add game interfaces
interface PlayerState {
  position: THREE.Vector3
  rotation: THREE.Euler
  health: number
  ammo: number
  score: number
  mana: number
  stamina: number
}

/*// Add these new interfaces
interface GameControls {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
  sprint: boolean
  attack: boolean
  dodge: boolean
  interact: boolean
}

interface PlayerStats {
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  stamina: number
  maxStamina: number
  level: number
  experience: number
  gold: number
}
*/

// Add these new interfaces for the RPG system
interface Character {
  level: number
  experience: number
  class: 'Technomancer' | 'NetRunner' | 'BioHacker'
  stats: {
    health: number
    mana: number
    stamina: number
    techAffinity: number
    hacking: number
    combat: number
    attack: number
    critChance: number
    critMultiplier: number
    speed: number
    defense: number
    magicResist: number
    magicAttack: number
    magicCritChance: number
    magicCritMultiplier: number
    damage: number
  }
  skills: {
    [key: string]: {
      level: number
      experience: number
      cooldown: number
    }
  }
  inventory: InventoryItem[]
  equipment: Equipment
  activeQuests: Quest[]
  completedQuests: string[]
  reputation: {
    [faction: string]: number
  }
}

interface InventoryItem {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'consumable' | 'quest' | 'tech'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  stats: { [key: string]: number }
  effects: Effect[]
}

interface Equipment {
  weapon: InventoryItem | null
  armor: InventoryItem | null
  implants: InventoryItem[]
  accessories: InventoryItem[]
}
interface QuestObjective {
  id: string
  description: string
  type: 'kill' | 'collect' | 'interact' | 'explore'
  target: string
  count: number
  progress: number
  completed: boolean
}

interface QuestReward {
  type: 'experience' | 'item' | 'currency' | 'reputation'
  amount: number
  itemId?: string
  faction?: string
}

interface Quest {
  id: string
  title: string
  description: string
  type: 'main' | 'side' | 'faction'
  objectives: QuestObjective[]
  rewards: QuestReward[]
  requiredLevel: number
  faction?: string
}


// Add this new hook for pointer lock management
function usePointerLock() {
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement !== null)
    }

    document.addEventListener('pointerlockchange', handleLockChange)
    document.addEventListener('mozpointerlockchange', handleLockChange)
    document.addEventListener('webkitpointerlockchange', handleLockChange)

    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange)
      document.removeEventListener('mozpointerlockchange', handleLockChange)
      document.removeEventListener('webkitpointerlockchange', handleLockChange)
    }
  }, [])

  const lockPointer = useCallback((element: HTMLElement) => {
      element.requestPointerLock()
    }, [])

  const unlockPointer = useCallback(() => {
    document.exitPointerLock()
  }, [])

  return { isLocked, lockPointer, unlockPointer }
}



interface ResourceBarProps {
  current: number
  max: number
  color: 'red' | 'blue' | 'green' | 'yellow'
  label: string
  tooltip: string
}

// Add this component definition before the main component
const ResourceBar = ({ current, max, color, label, tooltip }: ResourceBarProps) => {
  const colorMap = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600'
  }

  const percentage = Math.min(Math.max((current / max) * 100, 0), 100)

  return (
    <div className="group relative">
      <div className="w-32 h-3 bg-gray-900/50 rounded overflow-hidden backdrop-blur-sm">
        <div 
          className={`h-full ${colorMap[color]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Label */}
      <div className="absolute -top-4 left-0 text-xs text-white/80">
        {label}
      </div>
      
      {/* Values */}
      <div className="absolute -bottom-4 right-0 text-xs text-white/60">
        {current}/{max}
      </div>

      {/* Tooltip */}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-black/90 backdrop-blur-sm rounded
                    text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {tooltip}
      </div>
    </div>
  )
}

function PlayerControls({ character }: { isLocked: boolean, character: Character }): JSX.Element {
  return (
    <div>
      {/* Player controls UI */}
      <p>{character.class}</p>
      {/* ... other controls */}
    </div>
  )
}

// Add weapon component
function Weapon() {
  const { camera } = useThree()
  const gunRef = useRef<THREE.Group>()
  const [isShooting, setIsShooting] = useState(false)

  useEffect(() => {
    const handleShoot = () => {
      setIsShooting(true)
      setTimeout(() => setIsShooting(false), 100)
      // Add shooting logic here
    }

    document.addEventListener('click', handleShoot)
    return () => document.removeEventListener('click', handleShoot)
  }, [])

  useFrame(() => {
    if (gunRef.current) {
      // Position gun in front of camera
      gunRef.current.position.copy(camera.position)
      gunRef.current.rotation.copy(camera.rotation)
      gunRef.current.translateZ(-2)
      gunRef.current.translateY(-0.5)
      gunRef.current.translateX(0.5)
    }
  })

  return (
    <group ref={gunRef}>
      <mesh>
        <boxGeometry args={[0.2, 0.2, 1]} />
        <meshStandardMaterial color={isShooting ? '#ff0000' : '#444444'} />
      </mesh>
      {/* Gun barrel */}
      <mesh position={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  )
}


// Ground component with collision detection
function Ground() {
  return (
    <group>
      {/* Main ground plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.2}
          roughness={0.8}
          />
        </mesh>
        
      {/* Add some terrain features for cover */}
      {[...Array(20)].map((_, i) => {
        const position = [
          Math.random() * 100 - 50,
          1,
          Math.random() * 100 - 50
        ] as [number, number, number]
        
        return (
          <group key={i} position={position}>
            {/* Barrier block */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial
                color="#2a2a2a"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>

            {/* Add some detail to the barriers */}
            <mesh 
              position={[0, 1.1, 0]}
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[2.2, 0.2, 2.2]} />
          <meshStandardMaterial
                color="#3a3a3a"
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      </group>
        )
      })}

      {/* Add some ramps and elevation changes */}
      {[...Array(10)].map((_, i) => {
        const position = [
          Math.random() * 80 - 40,
          0.5,
          Math.random() * 80 - 40
        ] as [number, number, number]
        
        return (
          <mesh 
            key={`ramp-${i}`}
            position={position}
            rotation={[
              0,
              Math.random() * Math.PI * 2,
              Math.PI / 6
            ]}
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[4, 0.2, 8]} />
          <meshStandardMaterial
              color="#2d2d2d"
              metalness={0.3}
              roughness={0.7}
          />
        </mesh>
        )
      })}

      {/* Add some decorative elements */}
      {[...Array(30)].map((_, i) => {
        const position = [
          Math.random() * 120 - 60,
          0.1,
          Math.random() * 120 - 60
        ] as [number, number, number]

  return (
          <mesh 
            key={`decor-${i}`}
            position={position}
            rotation={[0, Math.random() * Math.PI * 2, 0]}
            castShadow 
            receiveShadow
          >
            <cylinderGeometry args={[0.2, 0.2, 0.4, 8]} />
          <meshStandardMaterial
              color="#3f3f3f"
              metalness={0.4}
              roughness={0.6}
              emissive="#1a1a1a"
              emissiveIntensity={0.2}
          />
        </mesh>
        )
      })}

      {/* Add boundary walls */}
      {[...Array(4)].map((_, i) => {
        const size = 1000
        const height = 20
        const positions = [
          [0, height/2, -size/2],
          [0, height/2, size/2],
          [-size/2, height/2, 0],
          [size/2, height/2, 0]
        ]
        const rotations = [
          [0, 0, 0],
          [0, 0, 0],
          [0, Math.PI/2, 0],
          [0, Math.PI/2, 0]
  ]

  return (
          <mesh
            key={`wall-${i}`}
            position={positions[i] as [number, number, number]}
            rotation={rotations[i] as [number, number, number]}
            receiveShadow
          >
            <boxGeometry args={[size, height, 1]} />
                <meshStandardMaterial
              color="#1a1a1a"
              metalness={0.3}
              roughness={0.7}
              transparent
              opacity={0.5}
                />
              </mesh>
        )
      })}
    </group>
  )
}

// Add MagicalSky component that was also referenced but missing
function MagicalSky() {
  return (
    <>
      <Sky 
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />

      {/* Add stars for atmosphere */}
      <Stars 
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Add some atmospheric fog */}
      <fog attach="fog" args={['#1a1a1a', 30, 100]} />
    </>
  )
}

/*
// Update GameHUD to show more stats
function GameHUD({ playerState }: { playerState: PlayerState }) {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="fixed top-4 left-4 bg-black/50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-32 h-4 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${playerState.health}%` }}
              />
            </div>
            <span className="text-red-400 text-sm">HP</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-32 h-4 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(playerState.mana / 100) * 100}%` }}
              />
            </div>
            <span className="text-blue-400 text-sm">MP</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-32 h-4 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${(playerState.stamina / 100) * 100}%` }}
              />
            </div>
            <span className="text-green-400 text-sm">SP</span>
          </div>
        </div>
      </div>

      <div className="fixed top-4 right-4 bg-black/50 p-4 rounded-lg">
        <div className="text-yellow-400">Score: {playerState.score}</div>
        <div className="text-white">Ammo: {playerState.ammo}/30</div>
      </div>

      <div className="fixed bottom-4 right-4 flex gap-2">
        {['Q', 'E', 'R', 'F'].map(key => (
          <div 
            key={key}
            className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center
                     border border-white/20"
          >
            <span className="text-white/80">{key}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
  */


// Add fantasy assets
function FantasyAssets() {
  return (
    <group>
      {/* Magic Crystals */}
      {[...Array(15)].map((_, i) => (
        <Float
          key={`crystal-${i}`}
          speed={1} 
          rotationIntensity={1} 
          floatIntensity={2}
          position={[
            Math.random() * 100 - 50,
            Math.random() * 3 + 1,
            Math.random() * 100 - 50
          ]}
        >
          <mesh castShadow>
            <octahedronGeometry args={[0.5]} />
            <meshStandardMaterial
              color={`hsl(${Math.random() * 360}, 70%, 50%)`}
              emissive={`hsl(${Math.random() * 360}, 70%, 50%)`}
              emissiveIntensity={0.5}
              metalness={1}
              roughness={0}
              />
            </mesh>
          <pointLight intensity={1} distance={5} color={`hsl(${Math.random() * 360}, 70%, 50%)`} />
        </Float>
      ))}

      {/* Floating Runes */}
      {[...Array(20)].map((_, i) => (
        <Float
          key={`rune-${i}`}
          speed={2}
          rotationIntensity={2}
          floatIntensity={1}
          position={[
            Math.random() * 80 - 40,
            Math.random() * 4 + 2,
            Math.random() * 80 - 40
          ]}
        >
          <Text
            color={`hsl(${Math.random() * 360}, 70%, 50%)`}
            fontSize={1}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign="left"
//            font="https://fonts.gstatic.com/s/raleway/v14/1Ptsg8zYS_SKggPNwE44TYFqL_KWxQ.woff"
            anchorX="center"
            anchorY="middle"
          >
            ⚡
          </Text>
          <pointLight intensity={0.5} distance={3} color={`hsl(${Math.random() * 360}, 70%, 50%)`} />
        </Float>
      ))}

      {/* Magic Portals */}
      {[...Array(5)].map((_, i) => {
        const position = [
          Math.random() * 80 - 40,
          0,
          Math.random() * 80 - 40
        ] as [number, number, number]

  return (
          <group key={`portal-${i}`} position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2, 0.2, 16, 100]} />
              <meshStandardMaterial
                  color={`hsl(${Math.random() * 360}, 70%, 50%)`}
                  emissive={`hsl(${Math.random() * 360}, 70%, 50%)`}
                emissiveIntensity={2}
                transparent
                  opacity={0.7}
              />
            </mesh>
      </Float>
      <Sparkles
        count={50}
              scale={4}
        size={0.4}
        speed={0.3}
        opacity={0.7}
              color={`hsl(${Math.random() * 360}, 70%, 50%)`}
      />
    </group>
  )
      })}

      {/* Floating Islands */}
      {[...Array(8)].map((_, i) => {
        const position = [
          Math.random() * 100 - 50,
          Math.random() * 10 + 5,
          Math.random() * 100 - 50
        ] as [number, number, number]

  return (
          <Float
            key={`island-${i}`}
            speed={1}
            rotationIntensity={0.2}
            floatIntensity={0.5}
            position={position}
          >
            <group>
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[3, 4, 2, 6]} />
          <meshStandardMaterial
                  color="#2d3436"
                  metalness={0.4}
                  roughness={0.6}
          />
        </mesh>
              {/* Add vegetation */}
              {[...Array(5)].map((_, j) => (
                <mesh
                  key={j}
            position={[
                    Math.sin(j * Math.PI * 0.4) * 2,
                    1,
                    Math.cos(j * Math.PI * 0.4) * 2
                  ]}
                  castShadow
                >
                  <coneGeometry args={[0.6, 1.5, 5]} />
              <meshStandardMaterial
                    color="#00b894"
                    metalness={0.2}
                    roughness={0.8}
              />
            </mesh>
        ))}
            </group>
      </Float>
        )
      })}
    </group>
  )
}

/*
// Update the snake confetti effect with falling snakes
function createSnakeConfetti() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD']
  const end = Date.now() + 3000 // 3 seconds

  // Create multiple snake paths
  const snakePaths = Array.from({ length: 5 }, () => ({
    x: Math.random(),
    y: 1.2, // Start above screen
    vx: (Math.random() - 0.5) * 0.02,
    vy: -0.01,
    color: colors[Math.floor(Math.random() * colors.length)],
    length: 10 + Math.floor(Math.random() * 10), // Random snake length
    segments: [] as { x: number, y: number }[]
  }))

  const snakeConfetti = () => {
    const timeLeft = end - Date.now()
    if (timeLeft <= 0) return

    snakePaths.forEach(snake => {
      // Update snake position with sinusoidal movement
      snake.x += snake.vx
      snake.y += snake.vy
      snake.vy -= 0.001 // Gravity effect

      // Add new segment at current position
      snake.segments.unshift({ x: snake.x, y: snake.y })

      // Keep only recent segments for trail effect
      if (snake.segments.length > snake.length) {
        snake.segments.pop()
      }

      // Create confetti particles along the snake
      snake.segments.forEach((segment, i) => {
        const fadeOpacity = 1 - (i / snake.length)
        const particleSize = 1 - (i / snake.length) * 0.5

        confetti({
          particleCount: 1,
          startVelocity: 0,
          ticks: 20,
          origin: {
            x: segment.x,
            y: segment.y
          },
          colors: [snake.color],
          shapes: ['circle'],
          scalar: particleSize,
          drift: 0,
          gravity: 0,
          opacity: fadeOpacity,
          zIndex: 100 + i
        })

        // Add glowing trail effect
        if (i % 2 === 0) {
          confetti({
            particleCount: 1,
            startVelocity: 0,
            ticks: 10,
            origin: {
              x: segment.x,
              y: segment.y
            },
            colors: ['#ffffff'],
            shapes: ['circle'],
            scalar: particleSize * 1.5,
            drift: 0,
            gravity: 0,
            opacity: fadeOpacity * 0.3,
            zIndex: 99 + i
          })
        }
      })

      // Add sparkle effects randomly
      if (Math.random() < 0.2) {
        const sparklePos = snake.segments[0]
        confetti({
          particleCount: 3,
          startVelocity: 10,
          spread: 360,
          origin: {
            x: sparklePos.x,
            y: sparklePos.y
          },
          colors: ['#ffffff'],
          shapes: ['circle'],
          scalar: 0.5,
          drift: 0,
          gravity: 0.1,
          ticks: 20,
          opacity: 0.8,
          zIndex: 150
        })
      }
    })

    requestAnimationFrame(snakeConfetti)
  }

  snakeConfetti()
}*/

// Add lighting system
function EnvironmentLighting() {
  return (
    <>
      {/* Main ambient light */}
      <ambientLight intensity={0.4} color="#b4c6ff" />
      
      {/* Dynamic sun/moon light */}
      <directionalLight
        position={[50, 100, 50]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={300}
        shadow-camera-near={0.5}
        color="#ffd4b4"
      />

      {/* Add volumetric light beams */}
      {[...Array(5)].map((_, i) => (
        <group key={i} position={[
          Math.sin(i / 5 * Math.PI * 2) * 30,
          15,
          Math.cos(i / 5 * Math.PI * 2) * 30
        ]}>
          <pointLight
            intensity={2}
            distance={30}
            color="#4f9fff"
            castShadow
          />
          <Sparkles
            count={50}
            scale={[1, 10, 1]}
            size={2}
            speed={0.3}
            opacity={0.2}
            color="#4f9fff"
          />
        </group>
      ))}
    </>
  )
}

// Add interactive objects system
function InteractiveObjects({ onCollect }: { onCollect: (type: string) => void }) {
  const objects = useRef<{
    type: string
    position: THREE.Vector3
    collected: boolean
    ref: THREE.Mesh | null
  }[]>([])

  // Initialize objects
  useEffect(() => {
    objects.current = [
      // Power crystals
      ...[...Array(10)].map(() => ({
        type: 'crystal',
        position: new THREE.Vector3(
          Math.random() * 80 - 40,
          Math.random() * 3 + 2,
          Math.random() * 80 - 40
        ),
        collected: false,
        ref: null
      })),
      // Health orbs
      ...[...Array(5)].map(() => ({
        type: 'health',
        position: new THREE.Vector3(
          Math.random() * 60 - 30,
          Math.random() * 3 + 2,
          Math.random() * 60 - 30
        ),
        collected: false,
        ref: null
      }))
    ]
  }, [])

  // Check for collisions
  useFrame(({ camera }) => {
    objects.current.forEach(obj => {
      if (!obj.collected && obj.ref) {
        const distance = camera.position.distanceTo(obj.position)
        if (distance < 2) {
          obj.collected = true
          onCollect(obj.type)
          // Play collection sound
//          playSound('collect')
        }
      }
    })
  })

  return (
    <group>
      {objects.current.map((obj, i) => !obj.collected && (
        <Float
          key={i}
          speed={2}
          rotationIntensity={1}
          floatIntensity={1}
          position={obj.position}
        >
          <mesh
            ref={mesh => obj.ref = mesh}
            onClick={() => {
              if (!obj.collected) {
                obj.collected = true
                onCollect(obj.type)
              }
            }}
          >
            {obj.type === 'crystal' ? (
              <octahedronGeometry args={[0.5]} />
            ) : (
              <sphereGeometry args={[0.4]} />
            )}
            <meshStandardMaterial
              color={obj.type === 'crystal' ? '#4f9fff' : '#ff4f4f'}
              emissive={obj.type === 'crystal' ? '#4f9fff' : '#ff4f4f'}
              emissiveIntensity={0.5}
              metalness={1}
              roughness={0}
            />
          </mesh>
          <pointLight
            intensity={1}
            distance={3}
            color={obj.type === 'crystal' ? '#4f9fff' : '#ff4f4f'}
          />
        </Float>
      ))}
    </group>
  )
}
// Add enhanced HUD with tooltips
function EnhancedHUD({ playerState, character }: { playerState: PlayerState, character: Character }) {
  const objects = useRef([
    {
      id: 'crystal1',
      type: 'crystal',
      position: new THREE.Vector3(-10, 1, -10),
      collected: false,
      value: 10,
      ref: null
    },
    {
      id: 'health1', 
      type: 'health',
      position: new THREE.Vector3(10, 1, 10),
      collected: false,
      value: 25,
      ref: null
    },
    {
      id: 'powerup1',
      type: 'powerup',
      position: new THREE.Vector3(0, 1, -15),
      collected: false,
      value: 0,
      ref: null
    }
  ])

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Main stats */}
      <div className="fixed top-4 left-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg space-y-4">
        {/* Level and class info */}
        <div className="text-white mb-4">
          <div className="text-sm opacity-70">Level {character.level}</div>
          <div className="text-lg font-bold">{character.class}</div>
        </div>

        {/* Resource bars */}
        <ResourceBar
          current={playerState.health}
          max={100}
          color="red"
          label="Health"
          tooltip="Your current health. Don't let it reach zero!"
        />
        
        <ResourceBar
          current={playerState.mana}
          max={100}
          color="blue"
          label="Mana"
          tooltip="Magical energy used for spells and abilities"
        />
        
        <ResourceBar
          current={playerState.stamina}
          max={100}
          color="green"
          label="Stamina"
          tooltip="Energy for running and special moves"
        />
      </div>

      {/* Minimap */}
      <div className="fixed top-4 right-4 w-48 h-48 bg-black/50 backdrop-blur-sm rounded-lg overflow-hidden">
        <div className="relative w-full h-full">
          {/* Player marker */}
          <div className="absolute w-2 h-2 bg-white rounded-full"
               style={{
                 left: `${((playerState.position.x + 50) / 100) * 100}%`,
                 top: `${((playerState.position.z + 50) / 100) * 100}%`
               }}
          />
          {/* Object markers */}
          {objects.current.map((obj, i) => !obj.collected && (
            <div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full ${
                obj.type === 'crystal' ? 'bg-blue-400' : 'bg-red-400'
              }`}
              style={{
                left: `${((obj.position.x + 50) / 100) * 100}%`,
                top: `${((obj.position.z + 50) / 100) * 100}%`
              }}
            />
          ))}
        </div>
      </div>

      {/* Quick tutorial */}
      <div className="fixed bottom-4 left-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg">
        <div className="text-white space-y-2">
          <div className="text-sm font-bold">Controls</div>
          <div className="text-xs opacity-70">
            <div>WASD - Move</div>
            <div>SPACE - Jump</div>
            <div>SHIFT - Sprint</div>
            <div>E - Interact</div>
            <div>Left Click - Attack</div>
            <div>Right Click - Block</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add this new component for observer controls
function ObserverControls() {
  const { camera } = useThree()
  const [isObserving, setIsObserving] = useState(false)
  const startPos = useRef(new THREE.Vector3())
  const startRot = useRef(new THREE.Euler())

  // Handle observer mode toggle
  useEffect(() => {
    const handleToggle = (e: KeyboardEvent) => {
      if (e.code === 'KeyO') {
        setIsObserving(prev => !prev)
        if (!isObserving) {
          // Store current position/rotation
          startPos.current.copy(camera.position)
          startRot.current.copy(camera.rotation)
          // Move camera up and back
          camera.position.y += 20
          camera.position.z += 20
        } else {
          // Restore position/rotation
          camera.position.copy(startPos.current)
          camera.rotation.copy(startRot.current)
        }
      }
    }

    window.addEventListener('keydown', handleToggle)
    return () => window.removeEventListener('keydown', handleToggle)
  }, [camera, isObserving])

  // Observer movement controls
  useFrame((state) => {
    if (!isObserving) return

    const speed = 0.5
    const keys = {
      forward: !!state.get().events.connected['ArrowUp'],
      backward: !!state.get().events.connected['ArrowDown'], 
      left: !!state.get().events.connected['ArrowLeft'],
      right: !!state.get().events.connected['ArrowRight'],
      up: !!state.get().events.connected['PageUp'],
      down: !!state.get().events.connected['PageDown']
    }

    if (keys.forward) camera.translateZ(-speed)
    if (keys.backward) camera.translateZ(speed)
    if (keys.left) camera.translateX(-speed)
    if (keys.right) camera.translateX(speed)
    if (keys.up) camera.position.y += speed
    if (keys.down) camera.position.y -= speed
  })

  return null
}

// Add this component for interaction pointers
function InteractionPointers() {
  const { camera } = useThree()
  const [pointers, setPointers] = useState<{
    id: string
    position: THREE.Vector3
    type: 'interact' | 'collect' | 'danger'
    label: string
  }[]>([])
  const objects = useRef([
    {
      id: 'crystal1',
      position: new THREE.Vector3(5, 1, 5),
      type: 'crystal',
      collected: false
    },
    {
      id: 'health1', 
      position: new THREE.Vector3(-5, 1, 5),
      type: 'health',
      collected: false
    },
    {
      id: 'crystal2',
      position: new THREE.Vector3(5, 1, -5), 
      type: 'crystal',
      collected: false
    }
  ])

  // Update pointers based on nearby objects
  useFrame(() => {
    const newPointers = []
    const maxDistance = 15 // Maximum distance to show pointers

    // Check interactive objects
    objects.current.forEach(obj => {
      if (!obj.collected) {
        const distance = camera.position.distanceTo(obj.position)
        if (distance < maxDistance) {
          newPointers.push({
            id: `object-${obj.id}`,
            position: obj.position,
            type: obj.type === 'crystal' ? 'collect' : 'interact',
            label: obj.type === 'crystal' ? 'Collect Crystal' : 'Health Orb'
          })
        }
      }
    })

    // Add pointers for other game elements
    setPointers(newPointers)
  })
  return (
    <group>
      {pointers.map(pointer => (
        <group key={pointer.id} position={pointer.position}>
          {/* Floating arrow */}
          <Float
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={0.5}
          >
            <mesh position={[0, 2, 0]}>
              <coneGeometry args={[0.2, 0.4, 4]} />
              <meshStandardMaterial 
                color={
                  pointer.type === 'collect' ? '#4f9fff' :
                  pointer.type === 'danger' ? '#ff4f4f' :
                  '#4fff4f'
                }
                emissive={
                  pointer.type === 'collect' ? '#4f9fff' :
                  pointer.type === 'danger' ? '#ff4f4f' :
                  '#4fff4f'
                }
                emissiveIntensity={0.5}
              />
            </mesh>
          </Float>

          {/* Label */}
          <Html
            position={[0, 2.5, 0]}
            center
            className="pointer-events-none"
          >
            <div className="px-2 py-1 rounded bg-black/50 text-white text-sm whitespace-nowrap">
              {pointer.label}
            </div>
          </Html>

          {/* Distance line */}
          <Line
            points={[
              [0, 0, 0],
              [0, 2, 0]
            ]}
            color={
              pointer.type === 'collect' ? '#4f9fff' :
              pointer.type === 'danger' ? '#ff4f4f' :
              '#4fff4f'
            }
            lineWidth={1}
            dashed
          />
        </group>
      ))}
    </group>
  )
}

// Add after the existing interfaces
interface GameObject {
  id: string
  type: 'crystal' | 'health' | 'powerup'
  position: THREE.Vector3
  collected: boolean
  value?: number
  effect?: string
  model?: THREE.Mesh
}

// Add before the main component
const createGameObject = (type: GameObject['type'], position: THREE.Vector3): GameObject => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    position,
    collected: false,
    value: type === 'crystal' ? Math.floor(Math.random() * 20) + 10 : undefined,
    effect: type === 'powerup' ? ['speed', 'shield', 'damage'][Math.floor(Math.random() * 3)] : undefined
  }
}

// Replace the simple objects reference with a proper manager
const GameObjectManager = () => {
  const objects = useRef<GameObject[]>([])
  
  const addObject = useCallback((type: GameObject['type'], position: THREE.Vector3) => {
    const newObject = createGameObject(type, position)
    objects.current.push(newObject)
    return newObject
  }, [])

  const removeObject = useCallback((id: string) => {
    objects.current = objects.current.filter(obj => obj.id !== id)
  }, [])

  const collectObject = useCallback((id: string) => {
    const object = objects.current.find(obj => obj.id === id)
    if (object) {
      object.collected = true
      return object
    }
    return null
  }, [])

  const getVisibleObjects = useCallback(() => {
    return objects.current.filter(obj => !obj.collected)
  }, [])

  return {
    objects,
    addObject,
    removeObject,
    collectObject,
    getVisibleObjects
  }
}

// Add missing state and refs
function FantasyBackground({ userColor, children, isGameMode = false }): JSX.Element {
  const objectManager = GameObjectManager()

  const [playerState, setPlayerState] = useState<PlayerState>({
    position: new THREE.Vector3(0, 2, 5),
    rotation: new THREE.Euler(0, 0, 0),
    health: 100,
    mana: 100,
    stamina: 100,
    ammo: 30,
    score: 0
  })

  const [isGameStarted, setIsGameStarted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isLocked, lockPointer, unlockPointer } = usePointerLock()

  // Add Scene component back
  const Scene = ({ isGameMode }: { userColor: string, isGameMode: boolean }) => {
    useEffect(() => {
      if (isGameMode && !isGameStarted) {
        setIsGameStarted(true)
        if (canvasRef.current && !isLocked) {
          lockPointer(canvasRef.current)
        }
      } else if (!isGameMode && isGameStarted) {
        setIsGameStarted(false)
        if (isLocked) {
          unlockPointer()
        }
      }
    }, [isGameMode])
    const character: Character = {
      level: 1,
      experience: 0,
      class: 'Technomancer',
      stats: {
        health: 100,
        mana: 100,
        stamina: 100,
        techAffinity: 10,
        hacking: 8,
        combat: 5,
        attack: 10,
        critChance: 0.05,
        critMultiplier: 1.5,
        speed: 10,
        defense: 5,
        magicResist: 8,
        magicAttack: 12,
        magicCritChance: 0.08,
        magicCritMultiplier: 1.8,
        damage: 10
      },
      skills: {
        techBolt: { level: 1, experience: 0, cooldown: 0 },
        hackShield: { level: 1, experience: 0, cooldown: 0 }
      },
      inventory: [],
      equipment: {
        weapon: null,
        armor: null,
        implants: [],
        accessories: []
      },
      activeQuests: [],
      completedQuests: [],
      reputation: {}
    }
    return (
      <>
        {isGameStarted ? (
          <>
            <PlayerControls isLocked={isLocked} character={character} />
            <ObserverControls />
            <InteractionPointers />
            <Weapon />
            <EnvironmentLighting />
            <InteractiveObjects onCollect={handleCollect} />
            <Html fullscreen>
              <EnhancedHUD 
                playerState={playerState}
                character={character}
              />
              {!isLocked && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
                  <button
                    onClick={() => canvasRef.current && lockPointer(canvasRef.current)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                  >
                    Click to Play
                  </button>
                </div>
              )}
            </Html>
            <FantasyAssets />
            <Ground />
            <MagicalSky />
          </>
        ) : (
          <>
            <FantasyAssets />
            <Ground />
            <MagicalSky />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
          </>
        )}
      </>
    )
  }

  // Fix handleCollect function
  const handleCollect = useCallback((id: string) => {
    const collected = objectManager.collectObject(id)
    if (collected) {
      switch (collected.type) {
        case 'crystal':
          setPlayerState(prev => ({
            ...prev,
            score: prev.score + (collected.value || 0)
          }))
          break
        case 'health':
          setPlayerState(prev => ({
            ...prev,
            health: Math.min(prev.health + 25, 100)
          }))
          break
        case 'powerup':
          // Handle powerup effects
          break
      }
    }
  }, [objectManager])

  return (
    <div className="relative min-h-screen w-full">
      {/* Game canvas - always visible */}
      <div className="fixed inset-0" style={{ zIndex: isGameMode ? 0 : -1 }}>
        <Canvas
          ref={canvasRef}
          shadows
          camera={{ position: [0, 2, 5], fov: 75 }}
          gl={{ 
            antialias: true,
            powerPreference: "high-performance",
          }}
        >
          <Scene userColor={userColor} isGameMode={isGameMode} />
        </Canvas>
      </div>

      {/* Profile content */}
      <div 
        className="relative w-full min-h-screen transition-all duration-300"
        style={{
          opacity: isGameMode ? 0 : 1,
          visibility: isGameMode ? 'hidden' : 'visible',
          pointerEvents: isGameMode ? 'none' : 'auto',
          zIndex: 1
        }}
      >
        {children}
      </div>

      {/* Game UI overlay */}
      {isGameMode && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10000 }}>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 
                       bg-black/50 backdrop-blur-sm rounded-lg p-4">
            <div className="text-white text-center">
              <p className="text-sm opacity-70 mb-1">Controls</p>
              <p className="text-xs">
                WASD - Move | SPACE - Jump | SHIFT - Run | CLICK - Shoot
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Update main component
export default function RPGGame({
  userColor = '#ff69b4',
  children,
  isGameMode = false
}: {
  userColor?: string
  children?: React.ReactNode
  isGameMode?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  return (
    <div className="relative min-h-screen w-full">
      {/* Game canvas - always visible */}
      <div className="fixed inset-0" style={{ zIndex: isGameMode ? 0 : -1 }}>
        <Canvas
          ref={canvasRef}
          shadows
          camera={{ position: [0, 2, 5], fov: 75 }}
          gl={{ 
            antialias: true,
            powerPreference: "high-performance",
          }}
        >
          <FantasyBackground userColor={userColor} isGameMode={isGameMode}>
            {children}
          </FantasyBackground>
        </Canvas>
      </div>

      {/* Profile content */}
      <div 
        className="relative w-full min-h-screen transition-all duration-300"
        style={{
          opacity: isGameMode ? 0 : 1,
          visibility: isGameMode ? 'hidden' : 'visible',
          pointerEvents: isGameMode ? 'none' : 'auto',
          zIndex: 1
        }}
      >
        {children}
      </div>

      {/* Game UI overlay */}
      {isGameMode && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10000 }}>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 
                       bg-black/50 backdrop-blur-sm rounded-lg p-4">
            <div className="text-white text-center">
              <p className="text-sm opacity-70 mb-1">Controls</p>
              <p className="text-xs">
                WASD - Move | SPACE - Jump | SHIFT - Run | CLICK - Shoot
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

