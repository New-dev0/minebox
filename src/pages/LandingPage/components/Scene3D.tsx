import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, Center } from '@react-three/drei'
import { Suspense, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Stats } from '@react-three/drei'

interface Scene3DProps {
  isLanding?: boolean
  showTitle?: boolean
  userColor?: string
  children?: React.ReactNode
}

interface SaturnProps {
  showTitle?: boolean
  userColor: string
  isLanding?: boolean,
  children?: React.ReactNode
}

function Saturn({ showTitle = true, userColor, isLanding }: SaturnProps) {
  const groupRef = useRef<THREE.Group>(null)
  const rotationRef = useRef({ y: 0, z: THREE.MathUtils.degToRad(25) })
  
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor
  }

  const getRGBColor = (hex: string) => {
    const color = new THREE.Color(hex)
    return [color.r, color.g, color.b]
  }

  const planetColor = isLanding ? "#00ff88" : userColor
  getRGBColor(planetColor) // Used for color conversion

  useFrame((state) => {
    if (groupRef.current) {
      const targetRotationY = state.clock.elapsedTime * 0.1
      rotationRef.current.y = lerp(
        rotationRef.current.y,
        targetRotationY,
        0.03
      )

      groupRef.current.rotation.y = rotationRef.current.y
      groupRef.current.rotation.z = rotationRef.current.z

      const floatY = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      groupRef.current.position.y = showTitle ? 2 + floatY : floatY

      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.3) * 0.02
      groupRef.current.scale.set(scale, scale, scale)
    }
  })

  // Use preloaded textures
  const texture = textures.moonSurface;
  const normalMap = textures.moonNormal;
  const roughnessMap = textures.moonRoughness;

  // Configure texture repeats
  useEffect(() => {
    [texture, normalMap, roughnessMap].forEach(map => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping
      map.repeat.set(2, 1)
    })
  }, [texture, normalMap, roughnessMap])

  // Define ring configurations based on showTitle
  const ringConfigs = showTitle 
    ? [3.5, 4, 4.5] 
    : [3.2, 3.6, 4.0, 4.4, 4.8, 5.2]

  return (
    <group 
      ref={groupRef} 
      position={[0, showTitle ? 2 : 0, -5]}
    >
      {/* Planet */}
      <mesh castShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          color={planetColor}
          metalness={0.5}
          roughness={1}
          map={texture}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          emissive={planetColor}
          emissiveIntensity={isLanding ? 0.2 : 0.1}
        />
      </mesh>

      {/* Neon border for landing page */}
      {isLanding && (
        <>
          {/* Outer glow */}
          <mesh>
            <sphereGeometry args={[2.15, 32, 32]} />
            <meshBasicMaterial
              color="#00ff88"
              transparent
              opacity={0.1}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Sharp neon line */}
          <mesh>
            <sphereGeometry args={[2.05, 64, 64]} />
            <meshBasicMaterial
              color="#00ff88"
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
              wireframe
              wireframeLinewidth={2}
            />
          </mesh>

          {/* Inner glow */}
          <mesh>
            <sphereGeometry args={[2.02, 32, 32]} />
            <meshBasicMaterial
              color="#00ff88"
              transparent
              opacity={0.15}
              blending={THREE.AdditiveBlending}
              side={THREE.FrontSide}
            />
          </mesh>
        </>
      )}

      {/* Green glow for landing page */}
      {isLanding && (
        <mesh>
          <sphereGeometry args={[2.1, 32, 32]} />
          <meshBasicMaterial
            color="#00ff88"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Rings */}
      {ringConfigs.map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius + 0.2, 128]} />
          <meshPhongMaterial
            color={planetColor}
            transparent
            opacity={0.4 - (i * 0.03)}
            side={THREE.DoubleSide}
            shininess={100}
            emissive={planetColor}
            emissiveIntensity={isLanding ? 0.3 : 0.2}
            depthWrite={true}
            flatShading={false}
          />
        </mesh>
      ))}

      {/* Additional green point lights for landing page */}
      {isLanding && (
        <>
          <pointLight
            position={[0, 0, 2]}
            distance={5}
            intensity={1.2}
            color="#00ff88"
          />
          <pointLight
            position={[2, 2, 2]}
            distance={4}
            intensity={0.8}
            color="#00ff88"
          />
          <pointLight
            position={[-2, -2, 2]}
            distance={4}
            intensity={0.8}
            color="#00ff88"
          />
        </>
      )}

      {/* Outer decorative rings with solid fill */}
      {!showTitle && (
    <group>
          {[6, 7, 8].map((radius, i) => (
            <mesh key={`outer-${i}`} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius, radius + 0.1, 128]} />
              <meshPhongMaterial
                color={planetColor}
                transparent
                opacity={0.2 - (i * 0.03)}
                  side={THREE.DoubleSide}
                shininess={100}
                emissive={planetColor}
                emissiveIntensity={0.3}
                depthWrite={true}
                flatShading={false}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Enhanced glow effects */}
      <pointLight
        position={[0, 0, 2]}
        distance={5}
        intensity={0.8}
        color={planetColor}
      />

      {!showTitle && (
        <>
          <pointLight
            position={[0, 0, 3]}
            distance={8}
            intensity={1.2}
            color={planetColor}
          />
          <pointLight
            position={[0, 3, 0]}
            distance={6}
            intensity={0.8}
            color={planetColor}
          />
        </>
      )}
    </group>
  )
}

function FloatingRings({ userColor }: { userColor: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const rotationRef = useRef(0)
  const ringColor = userColor

  // Add lerp function for smooth interpolation
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor
  }

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth rotation
      const targetRotation = state.clock.elapsedTime * 0.1
      rotationRef.current = lerp(rotationRef.current, targetRotation, 0.03)
      groupRef.current.rotation.z = rotationRef.current

      // Add floating motion
      const floatY = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      groupRef.current.position.y = floatY
    }
  })

  return (
    <group ref={groupRef}>
      {[12, 16, 20].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.1, 16, 100]} />
          <meshStandardMaterial
            color={ringColor}
            emissive={ringColor}
            emissiveIntensity={1}
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      ))}
    </group>
  )
}

function Title3D() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  // Create high-res text texture with sharp edges
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = 2048
  canvas.height = 512
  
  if (context) {
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    
    context.imageSmoothingEnabled = false
    
    // Use green color for stroke and fill
    context.strokeStyle = "#00ff88"
    context.lineWidth = 4
    context.lineJoin = 'miter'
    context.miterLimit = 2
    
    context.fillStyle = "#00ff88"
    context.font = 'bold 240px Inter'
    
    const text = 'MineBox'
    const x = canvas.width / 2
    const y = canvas.height / 2

    context.strokeText(text, x, y)
    context.fillText(text, x, y)
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false

  return (
    <group ref={groupRef} position={[0, 2, 5]}>
      <mesh position={[0, 0, -0.1]} renderOrder={1}>
        <planeGeometry args={[5, 1.5]} />
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthTest={false}
        />
      </mesh>
      
      <Center>
        <mesh renderOrder={2}>
          <planeGeometry args={[4, 1]} />
          <meshPhysicalMaterial
            map={texture}
            transparent
            emissive="#00ff88"
            emissiveIntensity={1.5}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            toneMapped={false}
            depthWrite={true}
            depthTest={true}
          />
        </mesh>
      </Center>

      <pointLight
        position={[0, 0, 1]}
        distance={2}
        intensity={1.5}
        color="#00ff88"
      />

      {/* Particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Float
          key={i}
          speed={1} 
          rotationIntensity={2} 
          floatIntensity={2}
            position={[
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5 + 5
          ]}
        >
          <mesh renderOrder={3}>
            <sphereGeometry args={[0.03]} />
            <meshBasicMaterial
              color="#00ff88"
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// Add texture preloading
const textureLoader = new THREE.TextureLoader();
const textures = {
  moonSurface: textureLoader.load('/textures/moon-surface.jpg'),
  moonNormal: textureLoader.load('/textures/moon-normal.jpg'),
  moonRoughness: textureLoader.load('/textures/moon-roughness.jpg')
};

export default function Scene3D({ 
//  isLanding = true, 
  showTitle = true, 
  userColor = '#00ff88' 
}: Scene3DProps) {
  const [show, setShow] = useState(true);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  
  useEffect(() => {
    setShow(['/login', '/register', '/'].includes(window.location.pathname));
  }, []);

  // Determine the color to use
  const sceneColor = (!userColor || userColor === '#00ff88') ? "#00ff88" : userColor;

  // Cleanup WebGL context on unmount
  useEffect(() => {
    return () => {
      // @ts-expect-error: This is a temporary fix to allow the form data to be updated
      if (rendererRef.current?.userData?.cleanup) {
        // @ts-expect-error: This is a temporary fix to allow the form data to be updated
        rendererRef.current.userData.cleanup();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
      }
    };
  }, []);

  // Handle renderer creation and context
  const handleCreated = ({ gl, scene, camera }: { 
    gl: THREE.WebGLRenderer, 
    scene: THREE.Scene,
    camera: THREE.Camera
  }) => {
    rendererRef.current = gl;
    sceneRef.current = scene;
    
    // Basic renderer config
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.2;

    // Simple resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      gl.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Simple cleanup
    const cleanup = () => {
      window.removeEventListener('resize', handleResize);
    };

    if (rendererRef.current) {
      // @ts-expect-error: This is a temporary fix to allow the form data to be updated
      rendererRef.current.userData = {
        // @ts-expect-error: This is a temporary fix to allow the form data to be updated
        ...rendererRef.current.userData,
        cleanup
      };
    }
  };

  return (
    <div className="absolute inset-0 min-h-screen w-full">
      <Canvas
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: -1 }}
        camera={{ 
          position: [0, 0, showTitle ? 8 : 12], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: 'high-performance'
        }}
        onCreated={handleCreated}
      >
        <color attach="background" args={['#000000']} />
        
        <Suspense fallback={null}>
          {showTitle && show && <Title3D />}
          <Saturn 
            showTitle={showTitle} 
            userColor={userColor} 
            isLanding={!userColor || userColor === '#00ff88'} 
          />
          <FloatingRings userColor={sceneColor} />
          <Stars
            radius={100}
            depth={50}
            count={3000}
            factor={2}
            fade
            speed={0.5}
          />
        </Suspense>

        {/* Add performance monitoring */}
        <Stats showPanel={0} className="stats" />
      </Canvas>
      <div className="relative w-full min-h-screen">
        {/* Content goes here */}
      </div>
    </div>
  )
}