import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js'

interface GameObject {
  id: string
  type: 'car' | 'obstacle' | 'powerup'
  position: THREE.Vector3
  velocity: THREE.Vector3
  model: THREE.Object3D
}

interface GameState {
  score: number
  lives: number
  gameStarted: boolean
  gameOver: boolean
  playerPosition: THREE.Vector3
  obstacles: GameObject[]
  powerups: GameObject[]
  checkpoints: number
  coins: number
  boost: number
  shield: boolean
  lastCheckpointTime: number
  baseSpeed: number
  autoMove: boolean
  opponents: OpponentCar[]
}

interface OpponentCar {
  model: THREE.Group
  position: THREE.Vector3
  speed: number
  lane: number
  direction: THREE.Vector3
}

interface RacingBackgroundProps {
  userColor?: string
  onCleanup?: (cleanup: () => void) => void
  children: React.ReactNode
  isGameMode?: boolean
}

const INITIAL_GAME_STATE: GameState = {
  score: 0,
  lives: 3,
  gameStarted: true,
  gameOver: false,
  playerPosition: new THREE.Vector3(0, 0.5, 8),
  obstacles: [],
  powerups: [],
  checkpoints: 0,
  coins: 0,
  boost: 0,
  shield: false,
  lastCheckpointTime: 0,
  baseSpeed: 2,
  autoMove: false,
  opponents: []
}

const ROAD_CONFIG = {
  width: 12,
  length: 10000,
  laneCount: 3,
  laneWidth: 4,
  segmentLength: 50,
  trackCurveIntensity: 0.3,
  checkpointInterval: 500,
  maxHeight: 15,
  heightFrequency: 0.01,
  terrainWidth: 200,
  terrainDetail: 128,
  mountainHeight: 30,
  valleyDepth: -10,
  biomeSize: 1000
}

const CAR_CONFIG = {
  width: 2,
  length: 4,
  height: 1.2,
  acceleration: 0.015,
  deceleration: 0.992,
  maxSpeed: 0.5,
  minSpeed: 0.08,
  turnSpeed: 0.015,
  tiltAmount: 0.25,
  gripFactor: 0.92,
  groundOffset: 0.4,
  suspensionStrength: 0.4,
  suspensionDamping: 0.7,
  collisionRadius: 1.8,
  steeringDamping: 0.93,
  maxSteeringAngle: 0.4,
  brakingForce: 0.95,
  rotationSpeed: 0.02,
  maxRotationSpeed: 0.08,
  driftFactor: 0.93,
  airControl: 0.5,
  recoverySpeed: 0.05,
  maxTiltAngle: Math.PI / 3,
  crashThreshold: 0.8,
  crashRecoveryTime: 1500,
  wheelRotationSpeed: 15,
  inertiaFactor: 0.92,
  speedIncreaseRate: 0.0001,
  jumpForce: 0.35
}

// Add coin configuration
const COIN_CONFIG = {
  radius: 0.5,
  rotationSpeed: 0.02,
  hoverAmplitude: 0.2,
  hoverSpeed: 2,
  spacing: 15,
  lanes: [-6, 0, 6],
  value: 10,
  collectDistance: 2.5
}

// Add obstacle configuration
const OBSTACLE_CONFIG = {
  types: ['ramp', 'barrier', 'gap'] as const,
  rampHeight: 1.5,
  rampLength: 4,
  barrierHeight: 1.2,
  gapWidth: 6,
  minSpacing: 30,
  maxSpacing: 60
}

// Add ScoreUI component with 3D style
const ScoreUI = ({ score, coins, lives }: { score: number; coins: number; lives: number }) => {
  return (
    <div className="fixed top-6 left-6 flex flex-col gap-4 ml-30">
      {/* Score Panel */}
      <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 transform-gpu hover:scale-105 transition-transform shadow-2xl border border-white/10">
        <div className="text-white text-sm font-medium mb-1 opacity-80">SCORE</div>
        <div className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
          {score.toLocaleString()}
        </div>
      </div>
      
      {/* Coins Panel */}
      <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 transform-gpu hover:scale-105 transition-transform shadow-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50" />
          <div className="text-2xl font-bold text-white">
            {coins.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Lives Panel */}
      <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 transform-gpu hover:scale-105 transition-transform shadow-2xl border border-white/10">
        <div className="flex gap-2">
          {[...Array(lives)].map((_, i) => (
            <div 
              key={i}
              className="w-6 h-6 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Update Speedometer for 25km/h max display
const Speedometer = ({ velocity }: { velocity: number }) => {
  const speed = Math.round(velocity * 50) // Convert to km/h
  const maxSpeed = 25 // New max speed at 25km/h
  const percentage = (speed / maxSpeed) * 100

  return (
    <div className="fixed top-6 right-6 bg-black/30 backdrop-blur-md rounded-xl p-4 transform-gpu hover:scale-105 transition-transform shadow-2xl border border-white/10">
      <div className="text-white text-sm font-medium mb-1 opacity-80">SPEED</div>
      <div className="text-3xl font-bold text-white mb-2">{speed} km/h</div>
      <div className="h-2 bg-black/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Add texture loader
const textureLoader = new THREE.TextureLoader()

// Add ground texture creation
const createGroundTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // Create more vibrant grass pattern
  ctx.fillStyle = '#3a8c3f' // Brighter base green
  ctx.fillRect(0, 0, 512, 512)
  
  // Add more detailed grass texture
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const size = Math.random() * 4 + 1
    
    // Vary grass colors for more natural look
    const green = Math.random() * 60 + 40
    const brightness = Math.random() * 0.4 + 0.6
    ctx.fillStyle = `rgba(${green * 0.7}, ${green}, ${green * 0.5}, ${brightness})`
    ctx.fillRect(x, y, size, size * 2) // Longer grass blades
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

// Update createTerrain with texture
const createTerrain = () => {
  const geometry = new THREE.PlaneGeometry(
    ROAD_CONFIG.terrainWidth,
    ROAD_CONFIG.length,
    ROAD_CONFIG.terrainDetail,
    ROAD_CONFIG.terrainDetail
  )

  // Generate terrain height using noise with more variation
  const noise2D = createNoise2D()
  const vertices = geometry.attributes.position.array as Float32Array
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i]
    const z = vertices[i + 2]
    // Add more height variation and smaller noise scale
    vertices[i + 1] = noise2D(x * 0.2, z * 0.2) * ROAD_CONFIG.mountainHeight * 0.5
  }

  geometry.computeVertexNormals()

  const groundTexture = createGroundTexture()
  groundTexture.repeat.set(50, 50) // Increased texture repeat
  const material = new THREE.MeshStandardMaterial({
    map: groundTexture,
    roughness: 0.8,
    metalness: 0.2,
    normalScale: new THREE.Vector2(2, 2) // Increased normal mapping
  })

  const terrain = new THREE.Mesh(geometry, material)
  terrain.rotation.x = -Math.PI / 2
  terrain.position.y = -2 // Raised terrain position
  terrain.receiveShadow = true

  return terrain
}

// Add sun glow effect
const createSunGlow = (position: THREE.Vector3) => {
  const spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture((() => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const ctx = canvas.getContext('2d')!
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      )
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.2, 'rgba(253, 184, 19, 0.5)')
      gradient.addColorStop(0.5, 'rgba(253, 184, 19, 0.1)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return canvas
    })()),
      transparent: true,
    blending: THREE.AdditiveBlending
  })

  const sprite = new THREE.Sprite(spriteMaterial)
  sprite.scale.set(100, 100, 1)
  sprite.position.copy(position)
  return sprite
}

// Update createSky function
const createSky = (scene: THREE.Scene) => {
  // Create sky dome
  const skyGeometry = new THREE.SphereGeometry(500, 32, 32)
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color('#87CEEB') },
      bottomColor: { value: new THREE.Color('#E0F6FF') },
      offset: { value: 400 },
      exponent: { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide
  })

  const sky = new THREE.Mesh(skyGeometry, skyMaterial)
  scene.add(sky)

  // Create sun with enhanced glow
  const sunGeometry = new THREE.CircleGeometry(20, 32)
  const sunMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color('#FDB813') }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vUv, center);
        
        // Core glow
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        
        // Pulsating outer glow
        float glow = 0.3 * sin(time * 2.0) + 0.7;
        float outerGlow = smoothstep(0.5, 1.0, 1.0 - dist) * glow;
        
        // Combine core and outer glow
        alpha = max(alpha, outerGlow);
        
        // Add color variation
        vec3 finalColor = mix(color, vec3(1.0), 1.0 - dist);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  })

  const sun = new THREE.Mesh(sunGeometry, sunMaterial)
  sun.position.set(-100, 150, -200)
  sun.lookAt(0, 0, 0)
  scene.add(sun)

  // Add sun glow sprite
  const sunGlow = createSunGlow(sun.position)
  scene.add(sunGlow)

  // Add lens flare
  const lensflare = new Lensflare()
  const mainFlare = new LensflareElement(
    textureLoader.load('/lens-flare.png'),
    700,
    0,
    new THREE.Color('#FDB813')
  )
  lensflare.addElement(mainFlare)
  lensflare.addElement(new LensflareElement(textureLoader.load('/lens-flare.png'), 100, 0.6))
  lensflare.addElement(new LensflareElement(textureLoader.load('/lens-flare.png'), 120, 0.8))
  lensflare.position.copy(sun.position)
  scene.add(lensflare)

  return { sky, sun, sunGlow, lensflare }
}

const createEnvironmentObjects = (scene: THREE.Scene, terrain: THREE.Mesh) => {
  const group = new THREE.Group()

  // Get terrain vertices for proper tree placement
  const vertices = (terrain.geometry as THREE.PlaneGeometry).attributes.position.array
  const treePositions: [number, number, number][] = []

  // Sample terrain points for tree placement
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i]
    const y = vertices[i + 1]
    const z = vertices[i + 2]
    
    // Place trees away from the road
    if (Math.abs(x) > ROAD_CONFIG.width * 0.75 && Math.random() < 0.1) {
      treePositions.push([x, y, z])
    }
  }

  // Create trees at sampled positions
  const treeGeometry = new THREE.ConeGeometry(1, 2, 8)
  const treeMaterial = new THREE.MeshStandardMaterial({ color: '#2d5a27' })
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1)
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#3d2817' })

  treePositions.forEach(([x, y, z]) => {
    const tree = new THREE.Group()
    
    const leaves = new THREE.Mesh(treeGeometry, treeMaterial)
    leaves.position.y = 1.5
    leaves.castShadow = true
    tree.add(leaves)

    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 0.5
    trunk.castShadow = true
    tree.add(trunk)

    tree.position.set(x, y, z)
    group.add(tree)
  })

  scene.add(group)
  return group
}

const createParticleSystem = (scene: THREE.Scene) => {
  const particleCount = 1000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 100
    positions[i + 1] = Math.random() * 50
    positions[i + 2] = (Math.random() - 0.5) * 100
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    size: 0.1,
    color: '#ffffff',
    transparent: true,
    opacity: 0.6
  })

  const particles = new THREE.Points(geometry, material)
  scene.add(particles)
  return particles
}

const createRoad = (scene: THREE.Scene) => {
  const group = new THREE.Group()

  // Create road surface
  const roadGeometry = new THREE.PlaneGeometry(ROAD_CONFIG.width, ROAD_CONFIG.length, 1, 100)
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: '#202020',
    roughness: 0.6,
          metalness: 0.2
        })

  const road = new THREE.Mesh(roadGeometry, roadMaterial)
  road.rotation.x = -Math.PI / 2
  road.receiveShadow = true
  group.add(road)

  // Add lane markings
  const laneWidth = ROAD_CONFIG.width / ROAD_CONFIG.laneCount
  for (let i = 1; i < ROAD_CONFIG.laneCount; i++) {
    const lineGeometry = new THREE.PlaneGeometry(0.2, ROAD_CONFIG.length)
    const lineMaterial = new THREE.MeshBasicMaterial({
          color: '#ffffff',
      transparent: true,
      opacity: 0.8
    })

    const line = new THREE.Mesh(lineGeometry, lineMaterial)
    line.position.x = (i * laneWidth) - (ROAD_CONFIG.width / 2)
    line.position.y = 0.01
    line.rotation.x = -Math.PI / 2
    group.add(line)
  }

  scene.add(group)
  return group
}

// Add touch control component
const TouchControls = ({ onSteeringChange }: { onSteeringChange: (value: number) => void }) => {
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const element = e.currentTarget
    const rect = element.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const center = rect.width / 2
    const steering = (x - center) / center // -1 to 1
    onSteeringChange(steering * CAR_CONFIG.maxSteeringAngle)
  }

  const handleTouchEnd = () => {
    onSteeringChange(0)
  }

  return (
    <div 
      className="fixed left-0 top-0 bottom-0 w-1/3 bg-black/10 backdrop-blur-sm touch-none"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border-2 border-white/50 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md" />
        </div>
      </div>
    </div>
  )
}

// Update wheel creation to avoid geometry.merge
const createWheel = () => {
  const wheelGroup = new THREE.Group()
  
  // Tire
  const tireGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32, 4)
  const tireMaterial = new THREE.MeshPhongMaterial({ 
    color: '#1a1a1a',
    shininess: 30
  })
  const tire = new THREE.Mesh(tireGeometry, tireMaterial)
  tire.rotation.x = Math.PI / 2
  wheelGroup.add(tire)

  // Tread pattern
  const treadMaterial = new THREE.MeshPhongMaterial({ color: '#222222' })
  for (let i = 0; i < 8; i++) {
    const treadGeometry = new THREE.BoxGeometry(0.1, 0.41, 0.05)
    const tread = new THREE.Mesh(treadGeometry, treadMaterial)
    tread.rotation.z = (i / 8) * Math.PI * 2
    tire.add(tread)
  }

  // Rim
  const rimGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 8)
  const rimMaterial = new THREE.MeshPhysicalMaterial({ 
    color: '#dddddd',
    metalness: 1,
    roughness: 0.2,
    clearcoat: 1.0
  })
  const rim = new THREE.Mesh(rimGeometry, rimMaterial)
  rim.rotation.x = Math.PI / 2
  wheelGroup.add(rim)

  // Spokes
  const spokeGeometry = new THREE.BoxGeometry(0.25, 0.05, 0.02)
  for (let i = 0; i < 8; i++) {
    const spoke = new THREE.Mesh(spokeGeometry, rimMaterial)
    spoke.rotation.z = (i / 8) * Math.PI * 2
    rim.add(spoke)
  }

  // Brake disc
  const discGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 32)
  const discMaterial = new THREE.MeshPhysicalMaterial({
    color: '#666666',
        metalness: 0.8,
        roughness: 0.5
        })
        const disc = new THREE.Mesh(discGeometry, discMaterial)
        disc.rotation.x = Math.PI / 2
  wheelGroup.add(disc)

  // Brake caliper
  const caliperGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.2)
  const caliperMaterial = new THREE.MeshPhysicalMaterial({
    color: '#ff0000',
    metalness: 0.8,
    roughness: 0.2
  })
  const caliper = new THREE.Mesh(caliperGeometry, caliperMaterial)
  caliper.position.y = 0.15
  wheelGroup.add(caliper)

  return wheelGroup
}

// Update car creation to use new wheel function
const createCar = (scene: THREE.Scene, color: string) => {
  const group = new THREE.Group()

  // Main body - more aerodynamic shape
  const bodyShape = new THREE.Shape()
  const width = CAR_CONFIG.width
  const length = CAR_CONFIG.length
  const height = CAR_CONFIG.height

  // Front curve
  bodyShape.moveTo(-width/2, -length/2)
  bodyShape.quadraticCurveTo(0, -length/2 - 1, width/2, -length/2)
  
  // Right side
  bodyShape.lineTo(width/2, length/3)
  bodyShape.quadraticCurveTo(width/2, length/2, width/3, length/2)
  
  // Back
  bodyShape.lineTo(-width/3, length/2)
  bodyShape.quadraticCurveTo(-width/2, length/2, -width/2, length/3)
  
  // Close shape
  bodyShape.lineTo(-width/2, -length/2)

  const extrudeSettings = {
    steps: 2,
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.2,
    bevelSegments: 5
  }

  // Create body with modern material
  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings)
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: color,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.0
  })

  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.castShadow = true
  body.rotation.x = Math.PI / 2
  group.add(body)

  // Add hood scoop
  const scoopGeometry = new THREE.BoxGeometry(width * 0.4, height * 0.1, length * 0.2)
  const scoop = new THREE.Mesh(scoopGeometry, bodyMaterial)
  scoop.position.set(0, height * 0.5, -length * 0.2)
  group.add(scoop)

  // Position wheels
  const wheelPositions = [
    [-CAR_CONFIG.width/2 - 0.1, -0.4, CAR_CONFIG.length/3],
    [CAR_CONFIG.width/2 + 0.1, -0.4, CAR_CONFIG.length/3],
    [-CAR_CONFIG.width/2 - 0.1, -0.4, -CAR_CONFIG.length/3],
    [CAR_CONFIG.width/2 + 0.1, -0.4, -CAR_CONFIG.length/3]
  ]

  wheelPositions.forEach((position, index) => {
    const wheel = createWheel()
    wheel.position.set(position[0], position[1], position[2])
    
    // Add suspension
    const suspension = new THREE.Group()
    suspension.add(wheel)
    
    // Spring visualization
    const springGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3)
    const springMaterial = new THREE.MeshPhongMaterial({ color: '#666666' })
    const spring = new THREE.Mesh(springGeometry, springMaterial)
    spring.position.y = 0.2
    suspension.add(spring)
    
    // Store wheel reference for rotation animation
    suspension.userData.wheel = wheel
    suspension.userData.wheelIndex = index
    
    group.add(suspension)
  })

  // Add windows with better glass material
  const glassGeometry = new THREE.BoxGeometry(width * 0.8, height * 0.4, 0.05)
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#000000',
    metalness: 0,
    roughness: 0,
    transmission: 0.9,
    transparent: true,
    opacity: 0.7,
    envMapIntensity: 1.0
  })

  // Windshield
  const windshield = new THREE.Mesh(glassGeometry, glassMaterial)
  windshield.position.set(0, height * 0.6, length * 0.1)
  windshield.rotation.x = Math.PI * 0.2
  group.add(windshield)

  // Rear window
  const rearWindow = new THREE.Mesh(glassGeometry, glassMaterial)
  rearWindow.position.set(0, height * 0.6, -length * 0.1)
  rearWindow.rotation.x = -Math.PI * 0.2
  group.add(rearWindow)

  // Add headlights
  const headlightGeometry = new THREE.CircleGeometry(0.15, 16)
  const headlightMaterial = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    emissive: '#ffffff',
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.9
  })

  const headlightPositions = [
    [-width/3, height * 0.3, length/2] as const,
    [width/3, height * 0.3, length/2] as const
  ]

  headlightPositions.forEach(position => {
    const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial)
    headlight.position.set(position[0], position[1], position[2])
    headlight.rotation.y = Math.PI
    group.add(headlight)

    // Add headlight glow
    const light = new THREE.PointLight('#ffffff', 1, 10)
    light.position.set(position[0], position[1], position[2])
    group.add(light)
  })

  scene.add(group)
  return group
}

const createCoins = (scene: THREE.Scene) => {
  const group = new THREE.Group()
  const coinGeometry = new THREE.CylinderGeometry(COIN_CONFIG.radius, COIN_CONFIG.radius, 0.1, 32)
  const coinMaterial = new THREE.MeshPhongMaterial({
    color: '#ffd700',
    shininess: 100,
    emissive: '#ffaa00',
    emissiveIntensity: 0.5
  })

  // Create coins along the path starting closer to the car
  for (let z = 0; z > -ROAD_CONFIG.length; z -= COIN_CONFIG.spacing) {
    const laneIndex = Math.floor(Math.random() * COIN_CONFIG.lanes.length)
    const x = COIN_CONFIG.lanes[laneIndex]

    const coin = new THREE.Mesh(coinGeometry, coinMaterial)
    coin.position.set(x, 1.5, z) // Raised height
    coin.rotation.x = Math.PI / 2
    coin.castShadow = true
    group.add(coin)
  }

  scene.add(group)
  return group
}

// Create obstacles function with fixed declarations
const createObstacles = (scene: THREE.Scene) => {
  const group = new THREE.Group()
  
  // Pre-create materials to avoid duplicates
  const rampMaterial = new THREE.MeshPhongMaterial({ 
    color: '#ff4444',
    shininess: 100
  })
  
  const barrierMaterial = new THREE.MeshPhongMaterial({ 
    color: '#ff0000',
    shininess: 100
  })
  
  const warningMaterial = new THREE.MeshBasicMaterial({ 
    color: '#ffff00',
    side: THREE.DoubleSide
  })

  // Create obstacles along the path
  let currentZ = -50
  while (currentZ > -ROAD_CONFIG.length) {
    const type = OBSTACLE_CONFIG.types[Math.floor(Math.random() * OBSTACLE_CONFIG.types.length)]
    const x = (Math.random() - 0.5) * (ROAD_CONFIG.width - 2)
    
    let obstacle: THREE.Mesh | THREE.Group
    
    if (type === 'ramp') {
      const rampShape = new THREE.Shape()
      rampShape.moveTo(-2, 0)
      rampShape.lineTo(2, 0)
      rampShape.lineTo(0, OBSTACLE_CONFIG.rampHeight)
      rampShape.lineTo(-2, 0)

      const extrudeSettings = {
        steps: 1,
        depth: OBSTACLE_CONFIG.rampLength,
        bevelEnabled: false
      }

      const rampGeometry = new THREE.ExtrudeGeometry(rampShape, extrudeSettings)
      obstacle = new THREE.Mesh(rampGeometry, rampMaterial)
      obstacle.rotation.y = Math.PI / 2
      obstacle.userData.type = 'ramp'
    } else if (type === 'barrier') {
      const barrierGeometry = new THREE.BoxGeometry(4, OBSTACLE_CONFIG.barrierHeight, 0.5)
      obstacle = new THREE.Mesh(barrierGeometry, barrierMaterial)
      obstacle.userData.type = 'barrier'
    } else {
      // Gap
      const gapGroup = new THREE.Group()
      const warningGeometry = new THREE.PlaneGeometry(OBSTACLE_CONFIG.gapWidth, 0.5)
      
      const warning1 = new THREE.Mesh(warningGeometry, warningMaterial)
      warning1.position.z = 0
      warning1.rotation.x = Math.PI / 2
      
      const warning2 = warning1.clone()
      warning2.position.z = -OBSTACLE_CONFIG.gapWidth
      
      gapGroup.add(warning1, warning2)
      obstacle = gapGroup
      obstacle.userData.type = 'gap'
      obstacle.userData.width = OBSTACLE_CONFIG.gapWidth
    }

    obstacle.position.set(x, 0, currentZ)
    obstacle.castShadow = true
    group.add(obstacle)

    currentZ -= OBSTACLE_CONFIG.minSpacing + Math.random() * (OBSTACLE_CONFIG.maxSpacing - OBSTACLE_CONFIG.minSpacing)
  }

  scene.add(group)
  return group
}

export default function RacingBackground({ 
  userColor = '#00ff88',
  onCleanup,
  children,
  isGameMode = false
}: RacingBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const composerRef = useRef<EffectComposer | null>(null)
  const terrainRef = useRef<THREE.Mesh | null>(null)
  const objectsRef = useRef<THREE.Group | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const roadRef = useRef<THREE.Group | null>(null)
  const carRef = useRef<THREE.Group | null>(null)
  const coinsRef = useRef<THREE.Group | null>(null)
  const obstaclesRef = useRef<THREE.Group | null>(null)

//   const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)
  const gameState = INITIAL_GAME_STATE;
  const physics = {
    velocity: 0,
    acceleration: 0,
    steering: 0,
    tilt: 0,
    verticalVelocity: 0,
    isGrounded: true,
    lastJumpTime: 0
  };

  // Add touch steering state
//  const [touchSteering, setTouchSteering] = useState(0)

  // Update physics effect with improved grip handling
  useEffect(() => {
    const keys = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      Space: false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code in keys) {
        keys[e.code as keyof typeof keys] = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code in keys) {
        keys[e.code as keyof typeof keys] = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    const updateGame = () => {
      if (!gameState.gameStarted || gameState.gameOver || !carRef.current) return

      const newPhysics = { ...physics }
//      const car = carRef.current

      // Only auto-move in game mode
      if (isGameMode) {
        // Auto-move logic
        newPhysics.velocity = Math.max(
          CAR_CONFIG.minSpeed,
          newPhysics.velocity * CAR_CONFIG.deceleration
        )
      } else {
        // Manual control logic
        if (keys.ArrowUp) {
          newPhysics.acceleration = Math.min(
            CAR_CONFIG.acceleration,
            newPhysics.acceleration + CAR_CONFIG.acceleration
          )
          newPhysics.velocity = Math.min(
            CAR_CONFIG.maxSpeed,
            newPhysics.velocity + newPhysics.acceleration
          )
        } else {
          newPhysics.acceleration *= CAR_CONFIG.deceleration
          newPhysics.velocity = Math.max(
            0, // Allow complete stop when not in game mode
            newPhysics.velocity * CAR_CONFIG.deceleration
          )
        }
      }

      // Rest of physics code...
    }

    const gameLoop = setInterval(updateGame, 1000 / 60)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearInterval(gameLoop)
    }
  }, [gameState, isGameMode])

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup with morning sky
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#87CEEB')
    scene.fog = new THREE.Fog('#87CEEB', 20, 100)
    sceneRef.current = scene

    // Create sky and sun with enhanced effects
    const { sun, sunGlow } = createSky(scene)

    // Camera setup with opposite view
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 3, -12) // Move camera to opposite side
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Morning sunlight setup
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.6)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight('#FDB813', 1.2) // Warm sunlight
    sunLight.position.set(-10, 15, -5)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 50
    sunLight.shadow.camera.left = -20
    sunLight.shadow.camera.right = 20
    sunLight.shadow.camera.top = 20
    sunLight.shadow.camera.bottom = -20
    scene.add(sunLight)

    // Add subtle hemisphere light for sky reflection
    const hemiLight = new THREE.HemisphereLight('#87CEEB', '#2E8B57', 0.5)
    scene.add(hemiLight)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

    // Post-processing setup
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    )
    composer.addPass(bloomPass)
    composerRef.current = composer

    // Create game environment
    const terrain = createTerrain()
    scene.add(terrain)
    terrainRef.current = terrain

    const road = createRoad(scene)
    roadRef.current = road

    // Create and position car
    const car = createCar(scene, userColor)
    carRef.current = car
    car.position.set(0, CAR_CONFIG.groundOffset, 0)
    car.rotation.y = 0 // Changed from Math.PI to 0 to face opposite direction

    const objects = createEnvironmentObjects(scene, terrain)
    objectsRef.current = objects

    const particles = createParticleSystem(scene)
    particlesRef.current = particles

    const coins = createCoins(scene)
    coinsRef.current = coins

    const obstacles = createObstacles(scene)
    obstaclesRef.current = obstacles

    // Handle resize
    const handleResize = () => {
      if (!renderer || !camera || !composer) return
      
      const width = window.innerWidth
      const height = window.innerHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      
      renderer.setSize(width, height)
      composer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Update camera follow logic
    const updateCamera = () => {
      if (!cameraRef.current || !carRef.current) return
      
      const car = carRef.current
      // Position camera behind car in opposite direction
      const idealOffset = new THREE.Vector3(0, 3, -8) // Changed from 8 to -8
      const idealLookat = new THREE.Vector3(0, 1, 4) // Changed from -4 to 4
      
      // Transform ideal offset and lookat based on car's position/rotation
      const matrix = new THREE.Matrix4()
      matrix.extractRotation(car.matrix)
      
      const currentOffset = new THREE.Vector3()
      currentOffset.copy(idealOffset).applyMatrix4(matrix)
      currentOffset.add(car.position)
      
      const currentLookat = new THREE.Vector3()
      currentLookat.copy(idealLookat).applyMatrix4(matrix)
      currentLookat.add(car.position)
      
      // Smoothly move camera
      cameraRef.current.position.lerp(currentOffset, 0.1)
      cameraRef.current.lookAt(currentLookat)
    }

    // Update animation loop
    const animate = () => {
      if (!scene || !camera || !composer) return
      
      // Update sun shader time
      if (sun.material instanceof THREE.ShaderMaterial) {
        sun.material.uniforms.time.value += 0.01
      }

      // Update sun glow scale with pulsating effect
      if (sunGlow) {
        const scale = 100 + Math.sin(Date.now() * 0.001) * 10
        sunGlow.scale.set(scale, scale, 1)
      }
      
      updateCamera()
      
      // Animate coins
      if (coinsRef.current) {
        coinsRef.current.children.forEach((coin, index) => {
          if (coin.visible) {
            coin.rotation.y += COIN_CONFIG.rotationSpeed
            coin.position.y = 1 + Math.sin(Date.now() * 0.001 * COIN_CONFIG.hoverSpeed + index) * COIN_CONFIG.hoverAmplitude
          }
        })
      }

      composer.render()
      requestAnimationFrame(animate)
    }

    animate()

    // Cleanup function
    const cleanup = () => {
      window.removeEventListener('resize', handleResize)
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
        rendererRef.current.forceContextLoss()
        rendererRef.current.domElement.remove()
      }

      if (composerRef.current) {
        composerRef.current.passes.forEach(pass => {
          if (pass.dispose) pass.dispose()
        })
      }

      if (sceneRef.current) {
        sceneRef.current.traverse(object => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose()
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        })
      }

      // Clear refs
      sceneRef.current = null
      cameraRef.current = null
      rendererRef.current = null
      composerRef.current = null
      terrainRef.current = null
      objectsRef.current = null
      particlesRef.current = null
      roadRef.current = null
      carRef.current = null
      coinsRef.current = null
      obstaclesRef.current = null
    }

    // Provide cleanup to parent
    onCleanup?.(cleanup)

    return cleanup
  }, [userColor, onCleanup, isGameMode])

  return (
    <div className="relative min-h-screen w-full">
      <div ref={containerRef} className="fixed inset-0" style={{ zIndex: -1 }} />
          {gameState.gameStarted && !gameState.gameOver && (
            <>
          <TouchControls  onSteeringChange={() => {}}/>
              <Speedometer velocity={physics.velocity} />
          <ScoreUI 
            score={gameState.score}
            coins={gameState.coins}
            lives={gameState.lives}
          />
          <button
            className="fixed right-6 bottom-20 w-16 h-16 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center transform-gpu hover:scale-110 transition-transform shadow-2xl"
            onTouchStart={() => {
              const event = new KeyboardEvent('keydown', { code: 'Space' })
              window.dispatchEvent(event)
            }}
            onTouchEnd={() => {
              const event = new KeyboardEvent('keyup', { code: 'Space' })
              window.dispatchEvent(event)
            }}
          >
            <span className="text-white text-2xl">↑</span>
          </button>
            </>
          )}
      <div className="relative w-full min-h-screen">
      {children}
      </div>
    </div>
  )
}

