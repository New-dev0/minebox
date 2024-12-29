import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '../../contexts/ThemeContext'
import html2canvas from 'html2canvas'

type RotatingCardProps = {
  children: React.ReactNode
  width?: number
  height?: number
}

export default function RotatingCard({ children, width = 800, height = 400 }: RotatingCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const { customColors } = useTheme()
  
  useEffect(() => {
    if (!containerRef.current || !cardRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    })
    
    renderer.setSize(width, height)
    containerRef.current.appendChild(renderer.domElement)

    // Create card geometry
    const geometry = new THREE.PlaneGeometry(4, 2.5)
    
    // Create material with placeholder texture
    const texture = new THREE.Texture()
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      shininess: 50
    })

    // Create mesh
    const card = new THREE.Mesh(geometry, material)
    scene.add(card)

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // Add point light
    const pointLight = new THREE.PointLight(customColors.primary, 1)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    camera.position.z = 5

    // Update texture from HTML
    const updateTexture = async () => {
      if (!cardRef.current) return
      
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2, // Higher resolution
          logging: false,
          useCORS: true
        })
        
        texture.image = canvas
        texture.needsUpdate = true
      } catch (error) {
        console.error('Failed to update texture:', error)
      }
    }

    // Initial texture update
    updateTexture()

    // Animation
    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0

    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      mouseX = (event.clientX - rect.left) / rect.width * 2 - 1
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1

      targetRotationY = mouseX * 0.5
      targetRotationX = mouseY * 0.5
    }

    // Add touch support
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault()
      const touch = event.touches[0]
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect || !touch) return

      mouseX = (touch.clientX - rect.left) / rect.width * 2 - 1
      mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1

      targetRotationY = mouseX * 0.5
      targetRotationX = mouseY * 0.5
    }

    containerRef.current.addEventListener('mousemove', handleMouseMove)
    containerRef.current.addEventListener('touchmove', handleTouchMove, { passive: false })

    // Auto rotation when no interaction
    const autoRotationSpeed = 0.005
    const lastInteractionTime = 0
    const AUTO_ROTATION_DELAY = 2000 // 2 seconds

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      const now = Date.now()
      if (now - lastInteractionTime > AUTO_ROTATION_DELAY) {
        // Auto rotation
        card.rotation.y += autoRotationSpeed
      } else {
        // Interactive rotation
        card.rotation.y += (targetRotationY - card.rotation.y) * 0.05
        card.rotation.x += (targetRotationX - card.rotation.x) * 0.05
      }

      renderer.render(scene, camera)
    }

    animate()

    // Update texture periodically for any content changes
    const textureInterval = setInterval(updateTexture, 1000)

    return () => {
      clearInterval(textureInterval)
      containerRef.current?.removeEventListener('mousemove', handleMouseMove)
      containerRef.current?.removeEventListener('touchmove', handleTouchMove)
      containerRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [width, height, customColors.primary])

  return (
    <div className="relative">
      <div ref={containerRef} className="absolute inset-0" />
      <div 
        ref={cardRef} 
        className="opacity-100 absolute"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {children}
      </div>
    </div>
  )
} 