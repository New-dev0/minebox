import { useEffect, useRef } from 'react'
import BaseBackground from './BaseBackground'
import { BackgroundProps } from './types'

interface ParticleBackgroundProps extends BackgroundProps {
  secondaryColor?: string
  accentColor?: string
}

export default function ParticlesBackground({ 
  children,
  color = '#00ff88',
  secondaryColor,
  accentColor,
  count = 50,
  speed = 1
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Get colors array
    const colors = [
      color,
      secondaryColor || color,
      accentColor || secondaryColor || color
    ]

    // Create particles
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * speed,
      speedY: (Math.random() - 0.5) * speed,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2, // Random opacity between 0.2 and 0.7
      pulse: Math.random() * Math.PI // Random starting phase for size pulsing
    }))

    // Animation loop
    let animationFrame: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        // Move particle
        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.pulse += 0.02 // Increment pulse phase

        // Pulse size
        const pulsedSize = particle.size * (1 + Math.sin(particle.pulse) * 0.2)

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle with glow effect
        ctx.save()
        ctx.globalAlpha = particle.alpha
        ctx.fillStyle = particle.color
        ctx.shadowBlur = 15
        ctx.shadowColor = particle.color

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, pulsedSize, 0, Math.PI * 2)
        ctx.fill()

        // Draw connecting lines to nearby particles
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.strokeStyle = particle.color
            ctx.globalAlpha = (1 - distance / 100) * 0.2 * particle.alpha
            ctx.lineWidth = 0.5
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
          }
        })

        ctx.restore()
      })

      animationFrame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [color, secondaryColor, accentColor, count, speed])

  return (
    <BaseBackground>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 bg-black"
      />
      {children}
    </BaseBackground>
  )
} 