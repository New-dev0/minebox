import { useEffect, useRef } from 'react'
import BaseBackground from './BaseBackground'
import { BackgroundProps } from './types'

interface PixelsBackgroundProps extends BackgroundProps {
  density?: number
  pixelSize?: number
  glowIntensity?: number
}

interface Asteroid {
  x: number
  y: number
  z: number
  speed: number
  size: number
  rotation: number
  rotationSpeed: number
  trail: { x: number; y: number }[]
  heat: number
}

export default function PixelsBackground({ 
  children,
  color = '#0088ff',
  speed = 1,
  density = 35,
  pixelSize = 15,
  glowIntensity = 12
}: PixelsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const displayWidth = window.innerWidth
      const displayHeight = window.innerHeight
      
      canvas.width = displayWidth * dpr
      canvas.height = displayHeight * dpr
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`
      
      ctx.scale(dpr, dpr)
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize corner pixels
    const cols = Math.ceil(canvas.width / pixelSize)
    const rows = Math.ceil(canvas.height / pixelSize)
    const pixels = Array(cols * rows).fill(false)
    
    // Create corner blocks
    const createCornerBlock = (startX: number, startY: number, width: number, height: number) => {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (startY + y) * cols + (startX + x)
          if ((x + y) % 2 === 0 || x === 0 || y === 0 || x === width-1 || y === height-1) {
            pixels[i] = true
          }
        }
      }
    }

    const cornerSize = Math.floor(Math.min(cols, rows) * 0.12)
    createCornerBlock(0, 0, cornerSize, cornerSize)
    createCornerBlock(cols - cornerSize, 0, cornerSize, cornerSize)
    createCornerBlock(0, rows - cornerSize, cornerSize, cornerSize)
    createCornerBlock(cols - cornerSize, rows - cornerSize, cornerSize, cornerSize)

    // Initialize asteroids with trail properties
    const asteroids: Asteroid[] = []
    const maxAsteroids = 8 // Fewer, but more dramatic asteroids

    const createAsteroid = () => {
      const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.25 // Angle between 45° and 135°
      const distance = canvas.width * 0.8 // Start further out
      
      return {
        x: canvas.width / 2 + Math.cos(angle) * distance,
        y: -100,
        z: Math.random() * 0.5 + 0.75, // More consistent depth
        speed: Math.random() * 2 + 3, // Faster speed
        size: Math.random() * 35 + 25, // Larger size
        rotation: angle,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        trail: [], // Store trail positions
        heat: 1.0 // Heat factor for color variation
      }
    }

    // Add initial asteroids
    for (let i = 0; i < maxAsteroids; i++) {
      asteroids.push(createAsteroid())
    }

    const drawTrail = (asteroid: Asteroid) => {
      if (asteroid.trail.length < 2) return

      ctx.beginPath()
      ctx.moveTo(asteroid.trail[0].x, asteroid.trail[0].y)
      
      for (let i = 1; i < asteroid.trail.length; i++) {
        ctx.lineTo(asteroid.trail[i].x, asteroid.trail[i].y)
      }

      // Blue comet trail
      const gradient = ctx.createLinearGradient(
        asteroid.trail[0].x, asteroid.trail[0].y,
        asteroid.trail[asteroid.trail.length - 1].x, asteroid.trail[asteroid.trail.length - 1].y
      )
      gradient.addColorStop(0, 'rgba(0, 136, 255, 0)')
      gradient.addColorStop(0.4, 'rgba(0, 196, 255, 0.3)')
      gradient.addColorStop(1, 'rgba(200, 255, 255, 0.8)')
      
      ctx.strokeStyle = gradient
      ctx.lineWidth = asteroid.size / 2
      ctx.lineCap = 'round'
      ctx.stroke()

      // Add blue glow to trail
      ctx.shadowColor = 'rgba(0, 150, 255, 0.5)'
      ctx.shadowBlur = 30
      ctx.stroke()
    }

    const drawAsteroid = (asteroid: Asteroid) => {
      ctx.save()
      
      const scale = 1 / asteroid.z
      const size = asteroid.size * scale
      
      ctx.translate(asteroid.x, asteroid.y)
      ctx.rotate(asteroid.rotation)
      ctx.scale(scale, scale)

      // Draw fiery glow
      ctx.shadowColor = `rgba(255, ${100 + asteroid.heat * 100}, 0, ${asteroid.heat})`
      ctx.shadowBlur = glowIntensity * scale * asteroid.heat

      // Create meteor shape
      ctx.beginPath()
      const aspectRatio = 2 // More elongated shape
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
        const xRadius = size * (1 + Math.cos(angle) * 0.5) // More pointed front
        const yRadius = size * aspectRatio
        const x = Math.cos(angle) * xRadius
        const y = Math.sin(angle) * yRadius
        
        if (angle === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()

      // Gradient fill for the meteor
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * aspectRatio)
      gradient.addColorStop(0, '#ffffff')
      gradient.addColorStop(0.2, '#ffaa00')
      gradient.addColorStop(0.4, '#ff4400')
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)')
      ctx.fillStyle = gradient
      ctx.fill()

      // Add bright core
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()

      // Add blue space glow
      ctx.shadowColor = `rgba(0, 136, 255, ${asteroid.heat * 0.5})`
      ctx.shadowBlur = glowIntensity * scale * 1.5

      ctx.restore()
    }

    let animationFrame: number

    const animate = () => {
      // Clear with slight persistence
      ctx.fillStyle = 'rgba(0, 0, 0, 0.98)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw asteroids
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i]
        
        // Update trail
        asteroid.trail.unshift({ x: asteroid.x, y: asteroid.y })
        if (asteroid.trail.length > 25) asteroid.trail.pop() // Longer trails

        // Update position with more fluid movement
        asteroid.x += Math.sin(asteroid.rotation) * asteroid.speed * 0.3
        asteroid.y += asteroid.speed * asteroid.z * speed
        asteroid.rotation += asteroid.rotationSpeed * 0.5
        asteroid.heat = Math.max(0.2, 1 - asteroid.y / canvas.height)

        drawTrail(asteroid)
        drawAsteroid(asteroid)

        if (asteroid.y > canvas.height + 50) {
          asteroids[i] = createAsteroid()
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [color, speed, density, pixelSize, glowIntensity])

  return (
    <BaseBackground>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 bg-black"
        style={{ 
          filter: 'brightness(1.3) contrast(1.3)', // Increased brightness
          backgroundColor: '#000'
        }}
      />
      {children}
    </BaseBackground>
  )
} 