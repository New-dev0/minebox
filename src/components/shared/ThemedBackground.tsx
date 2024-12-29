import { useEffect, useRef } from 'react'
import { AnimatedBackground } from '../backgrounds'
import { BackgroundType } from '../../types'
// import AICoinBackground from '../backgrounds/AICoinBackground'

interface ThemedBackgroundProps {
  type: BackgroundType
  pattern?: {
    backgroundColor: string
    backgroundImage?: string
    backgroundSize?: string
    backgroundPosition?: string
  }
  userColor?: string
  children: React.ReactNode
  isGameMode?: boolean
}

export default function ThemedBackground({ 
  type = 'saturn',
  pattern,
  userColor = '#00ff88',
  children,
  isGameMode = false
}: ThemedBackgroundProps) {
  // Keep track of the current background for cleanup
  const backgroundRef = useRef<{ cleanup?: () => void }>({})

  // Cleanup effect for background animations
  useEffect(() => {
    return () => {
      if (backgroundRef.current?.cleanup) {
        backgroundRef.current.cleanup()
      }
    }
  }, [type])

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Layer */}
      <div 
        className="fixed inset-0" 
        style={{ 
          zIndex: -1,
          backgroundColor: type === 'pixels' ? 'black' : undefined 
        }}
      >
        <AnimatedBackground
          sceneType={type}
          pattern={{
            css: {
              backgroundColor: pattern?.backgroundColor || 'black',
              backgroundImage: pattern?.backgroundImage || undefined,
              backgroundSize: pattern?.backgroundSize || 'cover',
            }
          }}
          userColor={userColor}
          hideScene={isGameMode}
        />
      </div>

      {/* Content Layer */}
      <div className="relative w-full min-h-screen">
        {children}
      </div>

      {/* Game Mode Overlay */}
      {isGameMode && (
        <div className="fixed inset-0 bg-black/50 pointer-events-none" />
      )}
    </div>
  )
} 