import { useEffect, useRef } from 'react'
import BaseBackground from './BaseBackground'
import { BackgroundProps } from './types'

export default function WavesBackground({ 
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

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()

      // Draw multiple waves
      for (let i = 0; i < 3; i++) {
        const phase = i * Math.PI / 3
        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)

        for (let x = 0; x < canvas.width; x++) {
          const y = Math.sin(x * 0.01 + offset + phase) * amplitude + canvas.height / 2
          ctx.lineTo(x, y)
        }

        ctx.stroke()
      }

      offset += 0.02 * speed
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
        className="fixed inset-0"
      />
      {children}
    </BaseBackground>
  )
} 