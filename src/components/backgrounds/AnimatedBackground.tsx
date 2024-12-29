import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import Scene3D from '../../pages/LandingPage/components/Scene3D'
import WarScene from '../scenes/WarScene'
import BattleScene from '../scenes/GameScene'
import ParticlesBackground from './ParticlesBackground'
import WavesBackground from './WavesBackground'
import HeartbeatBackground from './HeartbeatBackground'
import RacingBackground from './RacingBackground'
import PixelsBackground from './PixelsBackground'
import BaseBackground from './BaseBackground'
import { BackgroundType } from '../../types'
import MinecraftBackground from './MinecraftBackground'
import AiCoinBackground from './AICoinBackground'
import SpaceScene from '../scenes/SpaceScene'
import FantasyBackground from './FantasyBackground'

interface AnimatedBackgroundProps {
  sceneType?: BackgroundType
  pattern?: {
    css: {
      backgroundImage?: string
      backgroundSize?: string
      backgroundColor: string
    }
  }
  showTitle?: boolean
  userColor?: string
  hideScene?: boolean
  children?: React.ReactNode
}

// Add type for background components
const backgroundComponents: Record<BackgroundType, React.ComponentType<{ children: React.ReactNode }>> = {
  'saturn': Scene3D,
   'space-pikachu': SpaceScene,
//  'scene3d': Scene3D,
  'scene3d-war': WarScene,
  'cyber-world': BattleScene,
  'particles': ParticlesBackground,
  'waves': WavesBackground,
  'heartbeat': HeartbeatBackground,
  'racing': RacingBackground,
  'pixels': PixelsBackground,
  'pattern': BaseBackground,
  'minecraft': MinecraftBackground,
  'ai-coin': AiCoinBackground,
  'fantasy': FantasyBackground
}

export const AnimatedBackground = forwardRef<{ cleanup: () => void, children: React.ReactNode }, AnimatedBackgroundProps>(
  ({ sceneType = 'scene3d', pattern, showTitle = false, userColor = '#00ff88', hideScene = false, children }, ref) => {
    const cleanupRef = useRef<(() => void) | null>(null)

    // @ts-expect-error: build error
    useImperativeHandle(ref, () => ({ 
      cleanup: () => {
        if (cleanupRef.current) {
          cleanupRef.current()
          cleanupRef.current = null
        }
      }
    }))

    useEffect(() => {
      return () => {
        if (cleanupRef.current) {
          cleanupRef.current()
          cleanupRef.current = null
        }
      }
    }, [sceneType])

    const backgroundStyle = pattern ? {
      backgroundImage: pattern.css.backgroundImage,
      backgroundSize: pattern.css.backgroundSize,
      backgroundColor: 'transparent'
    } : {
      background: `linear-gradient(45deg, ${userColor}20, transparent)`
    }
    const BackgroundComponent = backgroundComponents[sceneType]

    if (!BackgroundComponent || (hideScene && sceneType !== 'pixels')) return null

    return (
      <div 
        className="absolute inset-0 transition-all duration-500"
        style={backgroundStyle}
      >
        <BackgroundComponent 
          pattern={pattern}
          userColor={userColor}
          showTitle={showTitle}
          onCleanup={(cleanup) => {
            cleanupRef.current = cleanup
          }}
        />
        {children}
      </div>
    )
  }
)

AnimatedBackground.displayName = 'AnimatedBackground'

export default AnimatedBackground 