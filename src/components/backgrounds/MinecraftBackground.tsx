import { useEffect, useRef, useState } from 'react'
import * as BABYLON from '@babylonjs/core'
import BaseBackground from './BaseBackground'
import { BackgroundProps } from './types'

interface MinecraftBackgroundProps extends BackgroundProps {
  isInteractive?: boolean
  onScoreChange?: (score: number) => void
}

// Add new interfaces for game objects
interface Collectible {
  mesh: BABYLON.Mesh
  collected: boolean
  value: number
  rotationSpeed: number
}

interface Animal {
  mesh: BABYLON.TransformNode
  type: 'sheep' | 'chicken'
  animationTime: number
}

interface AnimationState {
  bobTime: number
  jumpVelocity: number
  isJumping: boolean
}

export default function MinecraftBackground({ 
  children,
  isInteractive = true,
  onScoreChange
}: MinecraftBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chunksRef = useRef<BABYLON.Mesh[]>([])
  const lastChunkPositionRef = useRef(0)
  const characterRef = useRef<BABYLON.Mesh | null>(null)
  const collectiblesRef = useRef<Collectible[]>([])
  const animalsRef = useRef<Animal[]>([])
  const [score, setScore] = useState(0)
  const animationStateRef = useRef<AnimationState>({
    bobTime: 0,
    jumpVelocity: 0,
    isJumping: false
  })
  
  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new BABYLON.Engine(canvasRef.current, true)
    const scene = new BABYLON.Scene(engine)

    // Camera setup for wide view
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.8,
      80,
      new BABYLON.Vector3(0, 0, 0),
      scene
    )
    camera.lowerRadiusLimit = 60
    camera.upperRadiusLimit = 120
    camera.lowerBetaLimit = Math.PI / 4
    camera.upperBetaLimit = Math.PI / 2.2

    // Lighting
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      scene
    )
    light.intensity = 0.9
    light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5)

    // Materials
    const materials = {
      path: new BABYLON.StandardMaterial("pathMat", scene),
      grass: new BABYLON.StandardMaterial("grassMat", scene),
      mountain: new BABYLON.StandardMaterial("mountainMat", scene),
      decoration: new BABYLON.StandardMaterial("decorationMat", scene),
      skin: new BABYLON.StandardMaterial("skinMat", scene),
      clothes: new BABYLON.StandardMaterial("clothesMat", scene),
      wool: new BABYLON.StandardMaterial("woolMat", scene),
      chicken: new BABYLON.StandardMaterial("chickenMat", scene),
      gold: new BABYLON.StandardMaterial("goldMat", scene),
      ground: new BABYLON.StandardMaterial("groundMat", scene),
      cloud: new BABYLON.StandardMaterial("cloudMat", scene),
      sun: new BABYLON.StandardMaterial("sunMat", scene),
      dirt: new BABYLON.StandardMaterial("dirtMat", scene),
      stone: new BABYLON.StandardMaterial("stoneMat", scene),
      wood: new BABYLON.StandardMaterial("woodMat", scene),
      leaves: new BABYLON.StandardMaterial("leavesMat", scene),
      trunk: new BABYLON.StandardMaterial("trunkMat", scene),
      pathEdge: new BABYLON.StandardMaterial("pathEdgeMat", scene),
    }

    materials.path.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.5)
    materials.grass.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.2)  // Minecraft grass green
    materials.mountain.diffuseColor = new BABYLON.Color3(0.35, 0.85, 0.25)
    materials.decoration.diffuseColor = new BABYLON.Color3(0.3, 0.7, 0.3)
    materials.skin.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.6)  // Skin tone
    materials.clothes.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8) // Blue clothes
    materials.wool.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9)
    materials.chicken.diffuseColor = new BABYLON.Color3(1, 0.8, 0.6)
    materials.gold.diffuseColor = new BABYLON.Color3(1, 0.84, 0)
    materials.gold.emissiveColor = new BABYLON.Color3(0.4, 0.3, 0)
    materials.dirt.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2)   // Minecraft dirt brown
    materials.stone.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5)  // Minecraft stone gray
    materials.wood.diffuseColor = new BABYLON.Color3(0.6, 0.5, 0.3)   // Minecraft oak wood
    materials.leaves.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.1) // Dark green leaves
    materials.trunk.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2) // Brown trunk
    materials.pathEdge.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4) // Dark gray for edges

    // Create ground texture
    const groundTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/grass.png", scene)
    groundTexture.uScale = 50
    groundTexture.vScale = 50
    materials.ground.diffuseTexture = groundTexture
    materials.ground.specularColor = new BABYLON.Color3(0, 0, 0)

    // Add after materials definitions
    materials.cloud.diffuseColor = new BABYLON.Color3(1, 1, 1)
    materials.cloud.alpha = 0.8
    materials.sun.emissiveColor = new BABYLON.Color3(1, 0.7, 0)


    const createCollectible = (position: BABYLON.Vector3) => {
      const box = BABYLON.MeshBuilder.CreateBox(
        "collectible",
        { size: 1 },
        scene
      )
      box.position = position
      box.material = materials.gold

      const collectible: Collectible = {
        mesh: box,
        collected: false,
        value: Math.floor(Math.random() * 20) + 10,
        rotationSpeed: 0.02 + Math.random() * 0.02
      }
      
      collectiblesRef.current.push(collectible)
      return collectible
    }

    // Add tree creation function
    const createTree = (position: BABYLON.Vector3) => {
      const tree = new BABYLON.TransformNode("tree", scene)
      
      // Create trunk
      const height = 4 + Math.floor(Math.random() * 3)
      const trunk = BABYLON.MeshBuilder.CreateBox(
        "trunk",
        { height: height, width: 1, depth: 1 },
        scene
      )
      trunk.position.y = height / 2
      trunk.material = materials.trunk
      trunk.parent = tree

      // Create leaf blocks
      const leafSize = 3 + Math.floor(Math.random() * 2)
      for (let y = 0; y < leafSize; y++) {
        for (let x = -2; x <= 2; x++) {
          for (let z = -2; z <= 2; z++) {
            if (Math.random() > 0.3) { // Random gaps in leaves
              const leaf = BABYLON.MeshBuilder.CreateBox(
                "leaf",
                { size: 1 },
                scene
              )
              leaf.position = new BABYLON.Vector3(
                x,
                height + y,
                z
              )
              leaf.material = materials.leaves
              leaf.parent = tree
            }
          }
        }
      }

      tree.position = position
      return tree
    }

    // Now define createPathChunk after the helper functions are defined
    const createPathChunk = (position: number) => {
      const chunk = new BABYLON.TransformNode(`chunk_${position}`, scene)
      
      // Create base terrain grid
      const gridSize = 20
      const terrainHeight = new Array(gridSize * 2 + 1).fill(0)
        .map(() => new Array(gridSize * 2 + 1).fill(0)
        .map(() => Math.floor(Math.random() * 3)))

      // Create terrain blocks
      for (let x = -gridSize; x <= gridSize; x++) {
        for (let z = -gridSize; z <= gridSize; z++) {
          const height = terrainHeight[x + gridSize][z + gridSize]
          
          // Create dirt/grass stack
          for (let y = 0; y <= height; y++) {
            const block = BABYLON.MeshBuilder.CreateBox(
              y === height ? "grass" : "dirt",
              { size: 2 },
              scene
            )
            block.position = new BABYLON.Vector3(
              x * 2,
              y * 2 - 2,
              position + z * 2
            )
            block.material = y === height ? materials.grass : materials.dirt
            block.parent = chunk
            block.metadata = { isTerrain: true }
          }

          // Add trees randomly
          if (height > 0 && Math.random() < 0.05 && 
              Math.abs(x) > 3) { // Don't place trees on path
            createTree(new BABYLON.Vector3(
              x * 2,
              height * 2 - 2,
              position + z * 2
            )).parent = chunk
          }
        }
      }

      // Create Temple Run style path
      const createPathSection = () => {
        // Main path (slightly lowered)
        const path = BABYLON.MeshBuilder.CreateBox(
          "pathBase",
          { width: 10, height: 1, depth: 50 },
          scene
        )
        path.position = new BABYLON.Vector3(0, -1.5, position)
        path.material = materials.stone
        path.parent = chunk

        // Left edge (raised)
        const leftEdge = BABYLON.MeshBuilder.CreateBox(
          "pathEdge",
          { width: 2, height: 2, depth: 50 },
          scene
        )
        leftEdge.position = new BABYLON.Vector3(-6, -1, position)
        leftEdge.material = materials.pathEdge
        leftEdge.parent = chunk

        // Right edge (raised)
        const rightEdge = BABYLON.MeshBuilder.CreateBox(
          "pathEdge",
          { width: 2, height: 2, depth: 50 },
          scene
        )
        rightEdge.position = new BABYLON.Vector3(6, -1, position)
        rightEdge.material = materials.pathEdge
        rightEdge.parent = chunk

        // Add decorative elements on the path
        for (let z = 0; z < 10; z++) {
          // Add path patterns
          if (z % 2 === 0) {
            const pattern = BABYLON.MeshBuilder.CreateBox(
              "pathPattern",
              { width: 8, height: 0.1, depth: 2 },
              scene
            )
            pattern.position = new BABYLON.Vector3(
              0,
              -1.4,
              position + z * 5 - 20
            )
            pattern.material = materials.wood
            pattern.parent = chunk
          }

          // Add occasional obstacles on edges
          if (Math.random() < 0.3) {
            const side = Math.random() < 0.5 ? -6 : 6
            const obstacle = BABYLON.MeshBuilder.CreateBox(
              "pathObstacle",
              { width: 2, height: 3, depth: 2 },
              scene
            )
            obstacle.position = new BABYLON.Vector3(
              side,
              0,
              position + z * 5 - 20
            )
            obstacle.material = materials.stone
            obstacle.parent = chunk
          }
        }

        // Add torches or lanterns on edges
        for (let z = 0; z < 5; z++) {
          [-6, 6].forEach(x => {
            if (Math.random() < 0.4) {
              const torch = BABYLON.MeshBuilder.CreateBox(
                "torch",
                { width: 0.4, height: 1.5, depth: 0.4 },
                scene
              )
              torch.position = new BABYLON.Vector3(
                x,
                0.5,
                position + z * 10 - 20
              )
              torch.material = materials.wood
              torch.parent = chunk

              // Add glowing tip
              const flame = BABYLON.MeshBuilder.CreateBox(
                "flame",
                { size: 0.3 },
                scene
              )
              flame.position = new BABYLON.Vector3(
                x,
                1.5,
                position + z * 10 - 20
              )
              const flameMaterial = new BABYLON.StandardMaterial("flameMat", scene)
              flameMaterial.emissiveColor = new BABYLON.Color3(1, 0.5, 0)
              flame.material = flameMaterial
              flame.parent = chunk
            }
          })
        }
      }

      createPathSection()

      // Add animals randomly
      if (Math.random() < 0.3) {
   //     const offset = (Math.random() - 0.5) * 10
/*        const animalPos = new BABYLON.Vector3(
          offset,
          0,
          position + Math.random() * 40
        )
        const animal = Math.random() < 0.6 ? createSheep(animalPos) : createChicken(animalPos)
*/      }

      // Add collectibles
      if (Math.random() < 0.4) {
        const offset = (Math.random() - 0.5) * 8
        createCollectible(new BABYLON.Vector3(
          offset,
          3,
          position + Math.random() * 40
        ))
      }

      chunksRef.current.push(chunk as BABYLON.Mesh) 
      return chunk
    }

    // Initialize first chunks
    for (let i = 0; i < 4; i++) {
      createPathChunk(i * 50)
      lastChunkPositionRef.current = i * 50
    }

    // Sky and fog setup
    scene.clearColor = new BABYLON.Color4(0.7, 0.85, 1, 1)
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2
    scene.fogColor = new BABYLON.Color3(0.6, 0.8, 1)
    scene.fogDensity = 0.003

    // Post-processing
//    const pipeline = new BABYLON.DefaultRenderingPipeline(
  //    "defaultPipeline", true, scene, [camera]
   // )
    
    // Create Minecraft character
    const createCharacter = () => {
      // Create character group
      const character = new BABYLON.Mesh("character", scene)

      // Add collision box
      const collisionBox = BABYLON.MeshBuilder.CreateBox(
        "characterCollision",
        { height: 6, width: 2, depth: 2 },
        scene
      )
      collisionBox.isVisible = false
      collisionBox.parent = character

      // Head
      const head = BABYLON.MeshBuilder.CreateBox(
        "head",
        { size: 2 },
        scene
      )
      head.position.y = 5
      head.material = materials.skin
      head.parent = character

      // Body
      const body = BABYLON.MeshBuilder.CreateBox(
        "body",
        { height: 3, width: 2, depth: 1 },
        scene
      )
      body.position.y = 3
      body.material = materials.clothes
      body.parent = character

      // Arms
      const leftArm = BABYLON.MeshBuilder.CreateBox(
        "leftArm",
        { height: 3, width: 1, depth: 1 },
        scene
      )
      leftArm.position = new BABYLON.Vector3(-1.5, 3, 0)
      leftArm.material = materials.clothes
      leftArm.parent = character

      const rightArm = BABYLON.MeshBuilder.CreateBox(
        "rightArm",
        { height: 3, width: 1, depth: 1 },
        scene
      )
      rightArm.position = new BABYLON.Vector3(1.5, 3, 0)
      rightArm.material = materials.clothes
      rightArm.parent = character

      // Legs
      const leftLeg = BABYLON.MeshBuilder.CreateBox(
        "leftLeg",
        { height: 3, width: 1, depth: 1 },
        scene
      )
      leftLeg.position = new BABYLON.Vector3(-0.5, 0.5, 0)
      leftLeg.material = materials.clothes
      leftLeg.parent = character

      const rightLeg = BABYLON.MeshBuilder.CreateBox(
        "rightLeg",
        { height: 3, width: 1, depth: 1 },
        scene
      )
      rightLeg.position = new BABYLON.Vector3(0.5, 0.5, 0)
      rightLeg.material = materials.clothes
      rightLeg.parent = character

      // Position character on path
      character.position = new BABYLON.Vector3(0, -0.5, 0)
      characterRef.current = character

      return character
    }

    // Create character
    createCharacter()

    // Create sun
    const sun = BABYLON.MeshBuilder.CreateBox(
      "sun",
      { size: 20 },
      scene
    )
    sun.position = new BABYLON.Vector3(100, 80, 0)
    sun.material = materials.sun

    // Create clouds
    const createCloud = (position: BABYLON.Vector3) => {
      const cloud = new BABYLON.TransformNode("cloud", scene)
      
      // Create multiple boxes for blocky cloud effect
      const sizes = [
        { w: 8, h: 3, d: 6 },
        { w: 6, h: 4, d: 8 },
        { w: 7, h: 3, d: 7 }
      ]
      
      sizes.forEach((size, i) => {
        const block = BABYLON.MeshBuilder.CreateBox(
          `cloudBlock${i}`,
          { width: size.w, height: size.h, depth: size.d },
          scene
        )
        block.position.x = (Math.random() - 0.5) * 4
        block.position.z = (Math.random() - 0.5) * 4
        block.material = materials.cloud
        block.parent = cloud
      })

      cloud.position = position
      return cloud
    }

    // Create initial clouds
    const clouds: BABYLON.TransformNode[] = []
    for (let i = 0; i < 8; i++) {
      const cloud = createCloud(new BABYLON.Vector3(
        (Math.random() - 0.5) * 200,
        60 + Math.random() * 20,
        (Math.random() - 0.5) * 200
      ))
      clouds.push(cloud)
    }

    // Animation loop
    let time = 0
    engine.runRenderLoop(() => {
      time += engine.getDeltaTime() / 1000

      // Move camera and character forward
      const moveSpeed = 0.2
      camera.target.z += moveSpeed
      camera.position.z += moveSpeed

      if (characterRef.current) {
        const deltaTime = engine.getDeltaTime() * 0.001
        const state = animationStateRef.current
        
        // Smooth character movement
        const targetZ = camera.position.z - 10
        characterRef.current.position.z += (targetZ - characterRef.current.position.z) * 0.1

        // Improved walking animation
        state.bobTime += deltaTime * 5
        const walkCycle = Math.sin(state.bobTime)
        const walkIntensity = 0.3
        
        // Smooth leg animations
        const leftLeg = scene.getMeshByName("leftLeg")
        const rightLeg = scene.getMeshByName("rightLeg")
        if (leftLeg && rightLeg) {
          const targetLeftRotation = Math.sin(state.bobTime) * walkIntensity
          const targetRightRotation = -Math.sin(state.bobTime) * walkIntensity
          
          leftLeg.rotation.x += (targetLeftRotation - leftLeg.rotation.x) * 0.3
          rightLeg.rotation.x += (targetRightRotation - rightLeg.rotation.x) * 0.3
        }

        // Smooth arm animations
        const leftArm = scene.getMeshByName("leftArm")
        const rightArm = scene.getMeshByName("rightArm")
        if (leftArm && rightArm) {
          const targetLeftRotation = -Math.sin(state.bobTime) * walkIntensity
          const targetRightRotation = Math.sin(state.bobTime) * walkIntensity
          
          leftArm.rotation.x += (targetLeftRotation - leftArm.rotation.x) * 0.3
          rightArm.rotation.x += (targetRightRotation - rightArm.rotation.x) * 0.3
        }

        // Smooth vertical motion
        const targetY = 1 + Math.abs(walkCycle) * 0.15
        characterRef.current.position.y += (targetY - characterRef.current.position.y) * 0.2
      }

      // Check if we need to create new chunks
      if (camera.position.z > lastChunkPositionRef.current - 100) {
        createPathChunk(lastChunkPositionRef.current + 50)
        lastChunkPositionRef.current += 50

        // Remove old chunks
        if (chunksRef.current.length > 5) {
          const oldChunk = chunksRef.current.shift()
          if (oldChunk) {
            oldChunk.dispose()
          }
        }
      }

      // Animate animals
      animalsRef.current.forEach(animal => {
        if (!animal.mesh.isDisposed()) {
          const deltaTime = engine.getDeltaTime() * 0.001
          animal.animationTime += deltaTime * 2
          
          // Smoother bobbing motion
          const targetY = animal.type === 'chicken' ? 
            Math.sin(animal.animationTime * 6) * 0.15 : 
            Math.sin(animal.animationTime * 3) * 0.25
          
          animal.mesh.position.y += (targetY - (animal.mesh.position.y % 1)) * 0.1

          // Smoother chicken rotation
          if (animal.type === 'chicken') {
            const shouldTurn = Math.sin(animal.animationTime) > 0.95
            if (shouldTurn) {
              const targetRotation = animal.mesh.rotation.y + 0.2
              animal.mesh.rotation.y += (targetRotation - animal.mesh.rotation.y) * 0.1
            }
          }
        }
      })

      // Animate and check collectibles
      collectiblesRef.current.forEach(collectible => {
        if (!collectible.collected && !collectible.mesh.isDisposed()) {
          // Smooth rotation
          collectible.mesh.rotation.y += collectible.rotationSpeed * 0.5
          
          // Smooth hover motion
          const targetY = 3 + Math.sin(time * 2) * 0.3
          collectible.mesh.position.y += (targetY - collectible.mesh.position.y) * 0.1

          // Collection check with smooth fade out
          if (characterRef.current) {
            const distance = BABYLON.Vector3.Distance(
              collectible.mesh.position,
              characterRef.current.position
            )
            if (distance < 3) {
              collectible.collected = true
              // Fade out animation
              const fadeOut = new BABYLON.Animation(
                "fadeOut",
                "scaling",
                30,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
              )
              
              const keys = [
                { frame: 0, value: collectible.mesh.scaling.clone() },
                { frame: 10, value: new BABYLON.Vector3(1.5, 1.5, 1.5) },
                { frame: 20, value: new BABYLON.Vector3(0, 0, 0) }
              ]
              
              fadeOut.setKeys(keys)
              collectible.mesh.animations.push(fadeOut)
              
              scene.beginAnimation(collectible.mesh, 0, 20, false, 1, () => {
                collectible.mesh.dispose()
                setScore(prev => {
                  const newScore = prev + collectible.value
                  onScoreChange?.(newScore)
                  return newScore
                })
              })
            }
          }
        }
      })

      // Animate clouds
      clouds.forEach(cloud => {
        // Smooth cloud movement
        const targetX = cloud.position.x + 0.05
        cloud.position.x += (targetX - cloud.position.x) * 0.01
        
        if (cloud.position.x > 150) {
          cloud.position.x = -150
          cloud.position.z = (Math.random() - 0.5) * 200
          // Add slight vertical movement
          const targetY = 60 + Math.sin(time) * 5
          cloud.position.y += (targetY - cloud.position.y) * 0.01
        }
      })

      // Animate sun
      sun.position.x = camera.position.x + 100
      sun.position.z = camera.position.z + 50
      sun.rotation.y += 0.001

      // Only animate decorative grass
      scene.meshes.forEach(mesh => {
        if (mesh.name === "decorativeGrass") { // Change the name when creating decorative grass
          mesh.position.y = Math.sin(time + mesh.position.x + mesh.position.z * 0.1) * 0.5
        }
      })

      scene.meshes.forEach(mesh => {
        if (mesh.name === "grass" && !mesh.metadata?.isTerrain) {
          mesh.position.y = Math.sin(time + mesh.position.x + mesh.position.z * 0.1) * 0.5
        }
      })

      scene.render()
    })

    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      engine.dispose()
    }
  }, [isInteractive])

  return (
    <BaseBackground>
      <canvas
        ref={canvasRef}
        className="fixed inset-0"
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)'
        }}
      />
      {isInteractive && (
        <div className="fixed top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          Score: {score}
        </div>
      )}
      {children}
    </BaseBackground>
  )
} 