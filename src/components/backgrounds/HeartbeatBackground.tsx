import { useEffect, useRef } from 'react'
import BaseBackground from './BaseBackground'
import { BackgroundProps } from './types'

export default function HeartbeatBackground({ 
  children,
  color = '#00ff88',
  speed = 1,
  amplitude = 50
}: BackgroundProps) {
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

    let offset = 0
    const animate = () => {
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw multiple heartbeat lines
      for (let i = 0; i < canvas.height; i += 100) {
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, i)

        // Draw the heartbeat pattern
        for (let x = 0; x < canvas.width; x += 200) {
          const currentX = x + offset

          // Base line
          ctx.lineTo(currentX, i)
          
          // P wave
          ctx.quadraticCurveTo(
            currentX + 25, i - 10,
            currentX + 50, i
          )

          // QRS complex (the main spike)
          ctx.lineTo(currentX + 60, i)
          ctx.lineTo(currentX + 70, i - 30)
          ctx.lineTo(currentX + 80, i + 30)
          ctx.lineTo(currentX + 90, i - 5)
          ctx.lineTo(currentX + 100, i)

          // T wave
          ctx.quadraticCurveTo(
            currentX + 150, i + 15,
            currentX + 200, i
          )
        }

        ctx.stroke()

        // Add glow effect
        ctx.save()
        ctx.filter = 'blur(4px)'
        ctx.strokeStyle = `${color}44`
        ctx.lineWidth = 4
        ctx.stroke()
        ctx.restore()
      }

      // Move the pattern
      offset -= speed
      if (offset < -200) offset = 0

      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [color, speed, amplitude])

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