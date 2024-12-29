import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei'

interface WarSceneProps {
  primaryColor?: string
  children?: React.ReactNode
}


function FloatingObject({ position, color }: { position: THREE.Vector3; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const rotationSpeed = useMemo(() => Math.random() * 0.002 + 0.001, [])
  const floatSpeed = useMemo(() => Math.random() * 0.001 + 0.0005, [])
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    meshRef.current.rotation.y += rotationSpeed
    meshRef.current.position.y = position.y + Math.sin(time * floatSpeed + phase) * 2
  })

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.1} 
        wireframe
      />
      <lineSegments>
        <edgesGeometry args={[new THREE.OctahedronGeometry(1, 0)]} />
        <lineBasicMaterial color={color} transparent opacity={0.8} />
      </lineSegments>
    </mesh>
  )
}

function Scene({ primaryColor = '#8B5CF6' }: WarSceneProps) {
  const { scene } = useThree()
  const gridRef = useRef<THREE.Mesh>(null)
  const towersRef = useRef<THREE.Group>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const targetPositionRef = useRef(new THREE.Vector3(0, 25, 90))
//  const initialPositionRef = useRef(new THREE.Vector3(0, 25, 90))
//  const distanceMarkersRef = useRef<THREE.Group>(null)

  // Enhanced distance markers with more points
  const markers = useMemo(() => [
    // Forward markers
    ...Array.from({ length: 10 }).map((_, i) => ({
      position: new THREE.Vector3(0, 0, -(i + 1) * 100),
      distance: (i + 1) * 100
    })),
    // Side markers - Left
    ...Array.from({ length: 10 }).map((_, i) => ({
      position: new THREE.Vector3(-(i + 1) * 100, 0, 0),
      distance: (i + 1) * 100
    })),
    // Side markers - Right
    ...Array.from({ length: 10 }).map((_, i) => ({
      position: new THREE.Vector3((i + 1) * 100, 0, 0),
      distance: (i + 1) * 100
    })),
    // Diagonal markers
    ...Array.from({ length: 5 }).map((_, i) => ({
      position: new THREE.Vector3((i + 1) * 100, 0, -(i + 1) * 100),
      distance: Math.floor(Math.sqrt(2) * (i + 1) * 100)
    })),
    ...Array.from({ length: 5 }).map((_, i) => ({
      position: new THREE.Vector3(-(i + 1) * 100, 0, -(i + 1) * 100),
      distance: Math.floor(Math.sqrt(2) * (i + 1) * 100)
    }))
  ], [])

  // Ground grid shader
  const gridShader = useMemo(() => ({
        uniforms: {
          time: { value: 0 },
      color: { value: new THREE.Color(primaryColor) }
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vElevation;
          void main() {
            vUv = uv;
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vElevation = modelPosition.y;
        gl_Position = projectionMatrix * viewMatrix * modelPosition;
          }
        `,
        fragmentShader: `
      uniform vec3 color;
          uniform float time;
          varying vec2 vUv;
          varying float vElevation;

      float grid(vec2 uv, float size) {
        vec2 p = uv * size;
        return max(
          smoothstep(0.98, 0.99, abs(sin(p.x))), // Thinner lines
          smoothstep(0.98, 0.99, abs(sin(p.y)))  // Thinner lines
        );
      }
          
          void main() {
        vec2 uv = vUv;
        uv.y = pow(uv.y, 1.8);
        
        // Main grid with thinner lines
        float mainGrid = grid(uv, 60.0) * 0.4;
        
        // Secondary grid with thinner lines
        float secondaryGrid = grid(uv, 12.0) * 0.2;
        
        float finalGrid = mainGrid + secondaryGrid;
        
        // Enhanced distance fade
        float fade = 1.0 - pow(vUv.y, 2.2);
        
        // Enhanced pulse effect
        float pulse = sin(time * 0.5) * 0.15 + 0.85;
        
        // Add energy flow
        float energy = sin((uv.x + uv.y) * 30.0 + time) * 0.15 + 0.85;
        
        vec3 finalColor = color * finalGrid * fade * pulse * energy;
        
        // Add glow effect
        float glow = finalGrid * 0.5;
        finalColor += color * glow * fade * 0.5;
        
        gl_FragColor = vec4(finalColor, finalGrid * fade * 0.8);
      }
    `
  }), [primaryColor])

  // Add createTower function
  const createTower = (x: number, z: number, height: number) => {
    const geometry = new THREE.BoxGeometry(3, height, 3)
    const material = new THREE.MeshBasicMaterial({
      color: primaryColor,
        transparent: true,
      opacity: 0.05
    })
    
    const tower = new THREE.Mesh(geometry, material)
    tower.position.set(x, height/2 - 2, z)
    
    // Glowing edges
    const edgesGeometry = new THREE.EdgesGeometry(geometry)
    const edgesMaterial = new THREE.LineBasicMaterial({ 
      color: primaryColor,
      transparent: true,
      opacity: 0.9
    })
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
    tower.add(edges)
    
    // Inner glow
    const innerGeometry = new THREE.BoxGeometry(2.9, height * 0.98, 2.9)
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: primaryColor,
        transparent: true,
      opacity: 0.02
    })
    const innerGlow = new THREE.Mesh(innerGeometry, innerMaterial)
    tower.add(innerGlow)
    
    return tower
  }

  useEffect(() => {
    scene.fog = null
    scene.background = new THREE.Color(0x000000)

    // Create infinite grid
    const gridGeometry = new THREE.PlaneGeometry(2000, 2000, 1, 1) // Much larger grid
    const gridMaterial = new THREE.ShaderMaterial({
      ...gridShader,
      transparent: true,
      side: THREE.DoubleSide,
    })

    const grid = new THREE.Mesh(gridGeometry, gridMaterial)
    grid.rotation.x = -Math.PI / 2.5
    grid.position.y = -2
    scene.add(grid)
    gridRef.current = grid

    // Create infinite towers
    const towersGroup = new THREE.Group()
    
    // Generate towers in a spiral pattern for infinite look
    for (let i = 0; i < 50; i++) {
      const angle = i * 0.5
      const radius = i * 50
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius - 100 // Offset to start from view
      const height = 100 + Math.sin(angle) * 100 // Varying heights
      
      towersGroup.add(createTower(x, z, height))
    }

    scene.add(towersGroup)
    towersRef.current = towersGroup

    // Add infinite floating objects
    const floatingObjects = new THREE.Group()
    for (let i = 0; i < 100; i++) { // More floating objects
      const radius = Math.random() * 1000 + 100 // Spread further
      const angle = Math.random() * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = Math.random() * 200 + 20 // Higher altitude range
      
      const object = new THREE.Group()
      const geometry = new THREE.OctahedronGeometry(1 + Math.random() * 2, 0) // Varying sizes
      const material = new THREE.MeshBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: 0.1,
        wireframe: true
      })
      const mesh = new THREE.Mesh(geometry, material)
      
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ 
          color: primaryColor, 
          transparent: true, 
          opacity: 0.8 - (radius / 2000) // Fade with distance
        })
      )
      
      object.add(mesh, edges)
      object.position.set(x, y, z)
      floatingObjects.add(object)
    }
    scene.add(floatingObjects)

    return () => {
      scene.remove(grid)
      scene.remove(towersGroup)
      gridGeometry.dispose()
      gridMaterial.dispose()
    }
  }, [scene, gridShader, primaryColor, markers])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // Smooth camera motion
    if (cameraRef.current) {
      // Lerp camera position
      cameraRef.current.position.lerp(targetPositionRef.current, 0.001)
      
      // Add slight floating motion
      const floatY = Math.sin(time * 0.5) * 0.5
      cameraRef.current.position.y += floatY * 0.01

      // Add subtle rotation
      const rotationAngle = Math.sin(time * 0.2) * 0.05
      cameraRef.current.rotation.z = rotationAngle
    }

    // Animate grid
    if (gridRef.current?.material) {
      (gridRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time
    }

    // Enhanced tower animations
    if (towersRef.current) {
      towersRef.current.children.forEach((tower, i) => {
        // Subtle tower glow animation
    //    const edges = tower.children[0] as THREE.LineSegments
//        edges.material.opacity = 0.5 + Math.sin(time + i) * 0.3
  //      tower.material.opacity = 0.1 + Math.sin(time + i) * 0.05

        // Add slight tower movement
        const originalY = tower.position.y
        tower.position.y = originalY + Math.sin(time * 0.5 + i) * 0.2
        tower.rotation.y = Math.sin(time * 0.2 + i) * 0.05
      })
    }
  })

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 50, 150]}
        fov={60}
        near={0.1}
        far={5000} // Extended far plane for infinite view
      />
      <OrbitControls 
        enableZoom
        enablePan
        enableRotate
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 6}
        maxDistance={2000} // Allow much further zoom out
        minDistance={30}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
      />
      {/* Distance markers with fade effect */}
      {markers.map((marker, i) => (
        <group key={i} position={marker.position}>
          <Text
            color={primaryColor}
            fontSize={2}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.1}
            outlineColor="#000000"
          >
            {`${marker.distance}m`}
          </Text>
        </group>
      ))}
      {/* Infinite floating objects */}
      {Array.from({ length: 100 }).map((_, i) => {
        const radius = Math.random() * 1000 + 100
        const angle = Math.random() * Math.PI * 2
        return (
          <FloatingObject 
            key={i}
            position={new THREE.Vector3(
              Math.cos(angle) * radius,
              Math.random() * 200 + 20,
              Math.sin(angle) * radius
            )}
            color={primaryColor}
          />
        )
      })}
    </>
  )
} 

export default function WarScene({ primaryColor = '#8B5CF6' }: WarSceneProps) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        gl={{ 
          antialias: true,
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <Scene primaryColor={primaryColor} />
        <EffectComposer>
          <Bloom 
            intensity={1.2}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            radius={0.8}
          />
          <ChromaticAberration 
            offset={new THREE.Vector2(0.002, 0.002)}
            radialModulation={true}
            modulationOffset={0.001}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
} 