import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js'
// import { TextureLoader } from 'three'

// Add color props to WarScene
interface WarSceneProps {
  primaryColor?: string  // Optional color from color scheme
  children?: React.ReactNode
}

export default function BattleScene({ primaryColor = '#00ffaa' }: WarSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const composerRef = useRef<EffectComposer>()
  const tanksRef = useRef<THREE.Group[]>([])
//   const explosionsRef = useRef<THREE.Mesh[]>([])
  const dustParticlesRef = useRef<THREE.Points>()

  // Convert hex to THREE.Color
  const themeColor = new THREE.Color(primaryColor)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup - Cyberpunk night theme
    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.fog = new THREE.FogExp2(0x000014, 0.0015) // Softer fog
    scene.background = new THREE.Color(0x000014) // Slight blue tint

    // Camera setup - Lower to ground level for immersive feel
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    cameraRef.current = camera
    camera.position.set(0, 2, 10) // Ground level
    camera.lookAt(0, 1, 0)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    rendererRef.current = renderer
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    containerRef.current.appendChild(renderer.domElement)

    // Post-processing
    const composer = new EffectComposer(renderer)
    composerRef.current = composer
    
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // Enhanced post-processing for neon effect
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.0, // Reduced from 1.5 for less overwhelming bloom
      0.5,
      0.85
    )
    composer.addPass(bloomPass)

    const smaaPass = new SMAAPass(
      window.innerWidth * renderer.getPixelRatio(),
      window.innerHeight * renderer.getPixelRatio()
    )
    composer.addPass(smaaPass)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.3) // Increased from 0.1 to 0.3
    scene.add(ambientLight)

    // Add subtle hemisphere light for better overall visibility
    const hemisphereLight = new THREE.HemisphereLight(0x000000, 0x0033ff, 0.3)
    scene.add(hemisphereLight)

    // Add secondary rim light for dramatic effect
    const rimLight = new THREE.DirectionalLight(0x342dff, 0.8)
    rimLight.position.set(50, 20, 50)
    scene.add(rimLight)

    // Add volumetric spotlights
    const createSpotlight = (position: THREE.Vector3) => {
      const spotlight = new THREE.SpotLight(themeColor.getHex(), 3) // Increased intensity from 2 to 3
      spotlight.position.copy(position)
      spotlight.angle = Math.PI / 4 // Wider angle
      spotlight.penumbra = 0.3
      spotlight.decay = 1.5
      spotlight.distance = 150 // Increased from 100
      spotlight.castShadow = true
      scene.add(spotlight)
      return spotlight
    }

    const spotlights = [
      createSpotlight(new THREE.Vector3(-20, 30, -20)),
      createSpotlight(new THREE.Vector3(20, 30, -20)),
      createSpotlight(new THREE.Vector3(0, 40, 0)) // Additional overhead light
    ]

    // Metaverse grid ground
    const gridHelper = new THREE.GridHelper(1000, 100, themeColor, themeColor)
    gridHelper.position.y = -0.1
    gridHelper.material.opacity = 0.4 // Increased base opacity
    scene.add(gridHelper)

    // Add neon lines
    const createNeonLine = (start: THREE.Vector3, end: THREE.Vector3) => {
      const points = [start, end]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ 
        color: themeColor,
        transparent: true,
        opacity: 0.9,
      })
      return new THREE.Line(geometry, material)
    }

    // Create vertical neon lines
    for (let i = -20; i <= 20; i += 5) {
      const height = Math.random() * 10 + 5
      const line = createNeonLine(
        new THREE.Vector3(i, 0, -20),
        new THREE.Vector3(i, height, -20)
      )
      scene.add(line)
    }

    // Create textured ground
    const createGround = () => {
//      const textureLoader = new TextureLoader()
      const size = 1000
      const geometry = new THREE.PlaneGeometry(size, size, 128, 128)
      
      // Create heightmap for terrain variation
      const heightMap = new Float32Array(129 * 129)
      for (let i = 0; i < 129; i++) {
        for (let j = 0; j < 129; j++) {
          const index = i * 129 + j
          heightMap[index] = Math.sin(i * 0.5) * Math.cos(j * 0.5) * 2
          // Add noise for more natural look
          heightMap[index] += Math.random() * 0.5
        }
      }

      // Apply height map to geometry
      const vertices = geometry.attributes.position.array
      for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 1] = heightMap[i / 3] || 0
      }
      geometry.computeVertexNormals()

      // Create material with procedural texture
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: themeColor },
          gridSize: { value: 50.0 },
          glowIntensity: { value: 0.5 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying float vElevation;
          
          void main() {
            vUv = uv;
            vNormal = normal;
            vElevation = position.y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          uniform float gridSize;
          uniform float glowIntensity;
          
          varying vec2 vUv;
          varying vec3 vNormal;
          varying float vElevation;
          
          void main() {
            // Grid pattern
            vec2 grid = abs(fract(vUv * gridSize - 0.5) - 0.5) / fwidth(vUv * gridSize);
            float line = min(grid.x, grid.y);
            float gridPattern = 1.0 - min(line, 1.0);
            
            // Elevation-based color
            vec3 baseColor = mix(
              color * 0.2,
              color,
              smoothstep(-2.0, 2.0, vElevation)
            );
            
            // Add glow effect
            float glow = pow(dot(vNormal, vec3(0.0, 1.0, 0.0)), 3.0) * glowIntensity;
            
            // Pulse effect
            float pulse = sin(time * 2.0) * 0.5 + 0.5;
            
            // Combine effects
            vec3 finalColor = mix(
              baseColor,
              color,
              gridPattern * 0.5 + glow * pulse
            );
            
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
        side: THREE.DoubleSide
      })

      const ground = new THREE.Mesh(geometry, material)
      ground.rotation.x = -Math.PI / 2
      ground.position.y = -2
      ground.receiveShadow = true
      scene.add(ground)
      return { mesh: ground, material }
    }

    const ground = createGround()

    // Add hexagonal platforms with 3D effect
    const createHexPlatform = (position: THREE.Vector3) => {
      const shape = new THREE.Shape()
      const size = 2
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const x = size * Math.cos(angle)
        const y = size * Math.sin(angle)
        if (i === 0) shape.moveTo(x, y)
        else shape.lineTo(x, y)
      }
      shape.closePath()

      const extrudeSettings = {
        steps: 1,
        depth: 0.5,
        bevelEnabled: true,
        bevelThickness: 0.2,
        bevelSize: 0.2,
        bevelSegments: 3
      }

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
      const material = new THREE.MeshPhongMaterial({
        color: 0x000000,
        emissive: themeColor,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.95,
        shininess: 100
      })

      const platform = new THREE.Mesh(geometry, material)
      platform.position.copy(position)
      platform.castShadow = true
      platform.receiveShadow = true
      scene.add(platform)
      return platform
    }

    // Create floating hex platforms
    const hexPlatforms = [
      createHexPlatform(new THREE.Vector3(-10, 2, -15)),
      createHexPlatform(new THREE.Vector3(10, 4, -20)),
      createHexPlatform(new THREE.Vector3(0, 6, -25))
    ]

    // Add holographic effects
    const createHologram = (position: THREE.Vector3) => {
      const geometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 32, 1, true)
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
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
          varying vec2 vUv;
          void main() {
            float scan = sin(vUv.y * 30.0 + time * 5.0) * 0.5 + 0.5;
            vec3 color = vec3(0.0, 1.0, 0.8) * scan;
            float alpha = 0.3 * (1.0 - vUv.y);
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
      
      const hologram = new THREE.Mesh(geometry, material)
      hologram.position.copy(position)
      scene.add(hologram)
      return hologram
    }

    const holograms = [
      createHologram(new THREE.Vector3(-5, 1, -10)),
      createHologram(new THREE.Vector3(5, 1, -15))
    ]

    // Add floating particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 5000
    const positions = new Float32Array(particlesCount * 3)
    const colors = new Float32Array(particlesCount * 3)
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100
      positions[i + 1] = Math.random() * 50
      positions[i + 2] = (Math.random() - 0.5) * 100
      
      // Random colors between cyan and purple
      colors[i] = Math.random() * 0.2
      colors[i + 1] = 0.5 + Math.random() * 0.5
      colors[i + 2] = 0.8 + Math.random() * 0.2
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15, // Increased from 0.1
      vertexColors: true,
      transparent: true,
      opacity: 0.8, // Increased from 0.6
      blending: THREE.AdditiveBlending
    })
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)
    dustParticlesRef.current = particles

    // Add volumetric light beams
    const createLightBeam = (position: THREE.Vector3) => {
      const geometry = new THREE.CylinderGeometry(0, 2, 20, 32)
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: themeColor }
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
            float intensity = pow(1.0 - vUv.y, 2.0);
            intensity *= (sin(vUv.y * 40.0 + time * 2.0) * 0.1 + 0.9);
            gl_FragColor = vec4(color, intensity * 0.3);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      })
      
      const beam = new THREE.Mesh(geometry, material)
      beam.position.copy(position)
      beam.rotation.x = Math.PI
      scene.add(beam)
      return beam
    }

    // Create multiple light beams
    const lightBeams = [
      createLightBeam(new THREE.Vector3(-15, 20, -20)),
      createLightBeam(new THREE.Vector3(15, 20, -20)),
      createLightBeam(new THREE.Vector3(0, 20, -30))
    ]

    // Add floating hexagons
    const createHexagon = () => {
      const geometry = new THREE.CircleGeometry(1, 6)
      const material = new THREE.MeshBasicMaterial({
        color: themeColor,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      })
      const hex = new THREE.Mesh(geometry, material)
      hex.position.set(
        (Math.random() - 0.5) * 40,
        Math.random() * 20 + 5,
        (Math.random() - 0.5) * 40
      )
      hex.rotation.x = Math.PI / 2
      scene.add(hex)
      return hex
    }

    const hexagons = Array(20).fill(null).map(() => createHexagon())

    // Animation loop
    let frame = 0
    const animate = () => {
      frame++
      requestAnimationFrame(animate)

      // Smooth camera movement
      const time = frame * 0.001
      camera.position.x = Math.sin(time * 0.5) * 15
      camera.position.z = Math.cos(time * 0.5) * 15 + 10
      camera.position.y = 2 + Math.sin(time) * 0.5
      camera.lookAt(0, 1, 0)

      // Update ground shader
      if (ground.material.uniforms) {
        ground.material.uniforms.time.value = time
      }

      // Animate hex platforms
      hexPlatforms.forEach((platform, i) => {
        platform.position.y += Math.sin(time + i) * 0.005
        platform.rotation.z = Math.sin(time * 0.5 + i) * 0.02
      })

      // Animate holograms
      holograms.forEach((hologram) => {
        if (hologram.material.uniforms) {
          hologram.material.uniforms.time.value = time
        }
        hologram.rotation.y = time * 0.5
      })

      // Animate particles
      if (dustParticlesRef.current) {
        const positions = dustParticlesRef.current.geometry.attributes.position.array
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += 0.02
          if (positions[i + 1] > 50) positions[i + 1] = 0
          positions[i] += Math.sin(time + i) * 0.01
          positions[i + 2] += Math.cos(time + i) * 0.01
        }
        dustParticlesRef.current.geometry.attributes.position.needsUpdate = true
      }

      // Grid pulse effect
      gridHelper.material.opacity = 0.4 + Math.sin(time * 2) * 0.2 // Increased base opacity

      // Animate searchlights
      spotlights.forEach((spotlight, i) => {
        const angle = frame * 0.001 + i * Math.PI
        const radius = 30
        
        spotlight.position.x = Math.sin(angle) * radius
        spotlight.position.z = Math.cos(angle) * radius
        spotlight.target.position.set(
          Math.sin(angle + Math.PI) * 20,
          0,
          Math.cos(angle + Math.PI) * 20
        )
        spotlight.target.updateMatrixWorld()
      })

      // Update tank glow
      tanksRef.current.forEach(tank => {
        // @ts-expect-error: //
        const glow = tank.children.find(child => child?.material?.type === 'ShaderMaterial')
        // @ts-expect-error: //
        if (glow?.material.uniforms) {
            // @ts-expect-error: //
          glow.material.uniforms.time.value = frame * 0.001
        }
      })

      // Animate light beams
      lightBeams.forEach((beam, i) => {
        if (beam.material.uniforms) {
          beam.material.uniforms.time.value = time
          beam.rotation.y = Math.sin(time * 0.5 + i) * 0.2
        }
      })

      // Animate hexagons
      hexagons.forEach((hex, i) => {
        hex.position.y += Math.sin(time + i) * 0.01
        hex.rotation.z = time * 0.2
        hex.material.opacity = 0.3 + Math.sin(time * 2 + i) * 0.1
      })

      composer.render()
    }
    animate()

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
      composer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [primaryColor])

  /*
  // Function to create explosion effect
  const createExplosion = (x: number, y: number, z: number) => {
    const geometry = new THREE.SphereGeometry(1, 32, 32)
    const material = new THREE.MeshPhongMaterial({
      color: 0xff2200,
      emissive: 0xff4400,
      emissiveIntensity: 4,
      transparent: true,
      opacity: 1
    })
    const explosion = new THREE.Mesh(geometry, material)
    explosion.position.set(x, y - 15, z)
    explosion.scale.set(0.1, 0.1, 0.1)
    sceneRef.current?.add(explosion)
    explosionsRef.current.push(explosion)
  }*/

  return (
    <>
      {/* 3D Scene Container - Lower z-index */}
      <div 
        ref={containerRef} 
        className="fixed inset-0 z-0"
        style={{
          pointerEvents: 'none'
        }}
      />
    </>
  )
} 