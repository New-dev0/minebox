import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration, 
  HueSaturation 
} from '@react-three/postprocessing'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  useGLTF, 
  Text, 
  Float, 
  Environment,
  useAnimations 
} from '@react-three/drei'

interface SpaceSceneProps {
  primaryColor?: string
  children?: React.ReactNode
  username?: string
}

function Portal({ color }: { color: string }) {
  const portalRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  // Portal ring shader
  const portalShader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(color) }
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
        float pulse = sin(time * 2.0) * 0.5 + 0.5;
        float ring = 1.0 - length(vUv - 0.5) * 2.0;
        ring = smoothstep(0.3, 0.5, ring);
        
        vec3 finalColor = color * (ring + pulse * 0.5);
        float alpha = ring * (0.8 + pulse * 0.2);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  }), [color])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (portalRef.current) {
      portalRef.current.rotation.z = time * 0.2
    }
    if (ringRef.current?.material) {
      (ringRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time
    }
  })

  return (
    <group ref={portalRef}>
      {/* Portal Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[5, 0.2, 32, 100]} />
        <shaderMaterial 
          {...portalShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Portal Energy Field */}
      <mesh>
        <circleGeometry args={[4.8, 64]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Energy Particles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Float
          key={i}
          speed={2}
          rotationIntensity={2}
          floatIntensity={2}
          position={[
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 2
          ]}
        >
          <mesh scale={0.1}>
            <octahedronGeometry />
            <meshBasicMaterial 
              color={color}
              transparent
              opacity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function PikachuModel() {
  const groupRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/models/pikachu.glb', true)
  const { actions } = useAnimations(animations, scene)

  useEffect(() => {
    Object.values(actions).forEach(action => action?.play())
  }, [actions])

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.getElapsedTime()
    groupRef.current.position.y = Math.sin(time * 0.3) * 0.5
    groupRef.current.rotation.y = time * 0.15
  })

  return (
    <group ref={groupRef} position={[0, -2, 0]} scale={8}>
      {/* Add focused lights for Pikachu */}
      <spotLight
        position={[5, 10, 5]}
        angle={0.4}
        penumbra={0.5}
        intensity={3}
        color="#ffffff"
        castShadow
      />
      <spotLight
        position={[-5, 10, 5]}
        angle={0.4}
        penumbra={0.5}
        intensity={3}
        color="#ffffff"
        castShadow
      />
      <spotLight
        position={[0, 10, -5]}
        angle={0.4}
        penumbra={0.5}
        intensity={3}
        color="#ffffff"
        castShadow
      />
      {/* Add point light for bottom illumination */}
      <pointLight
        position={[0, -5, 0]}
        intensity={2}
        color="#ffffff"
        distance={10}
      />
      <primitive object={scene} />
    </group>
  )
}

function Pokeball({ position }: { position: THREE.Vector3 }) {
  const groupRef = useRef<THREE.Group>(null)
  const ballRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!ballRef.current) return

    // Create Pokeball parts
    const ball = new THREE.Group()

    // Top half (red)
    const topGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2)
    const topMaterial = new THREE.MeshStandardMaterial({
      color: '#FF0000',
      metalness: 0.7,
      roughness: 0.2,
    })
    const topHalf = new THREE.Mesh(topGeometry, topMaterial)
    ball.add(topHalf)

    // Bottom half (white)
    const bottomGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)
    const bottomMaterial = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.7,
      roughness: 0.2,
    })
    const bottomHalf = new THREE.Mesh(bottomGeometry, bottomMaterial)
    ball.add(bottomHalf)

    // Middle band (black)
    const bandGeometry = new THREE.TorusGeometry(1, 0.1, 16, 100)
    const bandMaterial = new THREE.MeshStandardMaterial({
      color: '#000000',
      metalness: 0.8,
      roughness: 0.2,
    })
    const band = new THREE.Mesh(bandGeometry, bandMaterial)
    band.rotation.x = Math.PI / 2
    ball.add(band)

    // Center button
    const buttonGeometry = new THREE.CircleGeometry(0.25, 32)
    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.9,
      roughness: 0.1,
    })
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial)
    button.position.z = 1
    ball.add(button)

    // Black ring around button
    const ringGeometry = new THREE.RingGeometry(0.25, 0.35, 32)
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: '#000000',
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.position.z = 1.01
    ball.add(ring)

    ballRef.current.add(ball)

    return () => {
      // Cleanup geometries and materials
      [topGeometry, bottomGeometry, bandGeometry, buttonGeometry, ringGeometry].forEach(g => g.dispose())
      ;[topMaterial, bottomMaterial, bandMaterial, buttonMaterial, ringMaterial].forEach(m => m.dispose())
    }
  }, [])

  useFrame((state) => {
    if (!groupRef.current || !ballRef.current) return
    const time = state.clock.getElapsedTime()
    
    // Floating animation
    groupRef.current.position.y = position.y + Math.sin(time * 0.5 + position.x) * 0.5
    
    // Rotation animation
    ballRef.current.rotation.y = time * 0.2
    ballRef.current.rotation.x = Math.sin(time * 0.3) * 0.1
  })

  return (
    <group ref={groupRef} position={position}>
      <group ref={ballRef}>
        <pointLight intensity={0.5} distance={3} color="#FF0000" />
      </group>
    </group>
  )
}

function Scene({ primaryColor = '#8B5CF6', username = 'User' }: SpaceSceneProps) {
  const { scene } = useThree()
  const platformRef = useRef<THREE.Group>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useEffect(() => {
    scene.fog = null
    scene.background = new THREE.Color(0x000000)

    // Create platform
    const platform = new THREE.Group()
    
    // Platform base
    const baseGeometry = new THREE.CylinderGeometry(6, 8, 0.5, 32)
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: primaryColor,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    platform.add(base)

    // Platform grid
    const gridHelper = new THREE.GridHelper(16, 16, primaryColor, primaryColor)
    gridHelper.position.y = 0.26
    platform.add(gridHelper)

    scene.add(platform)
    platformRef.current = platform

    return () => {
      scene.remove(platform)
      baseGeometry.dispose()
      baseMaterial.dispose()
    }
  }, [scene, primaryColor])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (platformRef.current) {
      platformRef.current.rotation.y = time * 0.1
    }

    if (cameraRef.current) {
      cameraRef.current.position.y = 8 + Math.sin(time * 0.5) * 0.5
    }
  })

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 8, 20]}
        fov={50}
        near={0.1}
        far={1000}
      />
      <OrbitControls 
        enableZoom
        enablePan={false}
        enableRotate
        maxPolarAngle={Math.PI * 0.6}
        minPolarAngle={Math.PI * 0.3}
        maxDistance={30}
        minDistance={10}
        target={[0, 5, 0]}
        enableDamping
        dampingFactor={0.05}
      />
      
      <Environment preset="night" />
      
      {/* Main lighting */}
      <ambientLight intensity={0.2} />
      <spotLight
        position={[10, 20, 10]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        castShadow
      />

      {/* Portal */}
      <Portal color={primaryColor} />

      {/* Pikachu in Portal */}
      <group position={[0, 8, 0]}>
        <PikachuModel />
      </group>

      {/* Username Display */}
      <Float
        position={[0, 20, 0]}
        rotation={[0, Math.PI, 0]}
        rotationIntensity={0.2}
        floatIntensity={0.5}
      >
        <Text
          color={primaryColor}
          fontSize={2}
          maxWidth={200}
          lineHeight={1}
          letterSpacing={0.02}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          {username}
          <meshStandardMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Text>
      </Float>

      {/* Add Pokeballs around the edges */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 25
        return (
          <Pokeball
            key={i}
            position={new THREE.Vector3(
              Math.cos(angle) * radius,
              Math.random() * 10 + 5,
              Math.sin(angle) * radius
            )}
          />
        )
      })}
    </>
  )
}

export default function SpaceScene({ primaryColor = '#8B5CF6', username }: SpaceSceneProps) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        shadows
      >
        <Scene primaryColor={primaryColor} username={username} />
        <EffectComposer>
          <Bloom 
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            radius={0.8}
          />
          <ChromaticAberration 
            offset={new THREE.Vector2(0.002, 0.002)}
            radialModulation={true}
            modulationOffset={0.5}
          />
          <HueSaturation
            saturation={0.3}
            hue={0}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
} 