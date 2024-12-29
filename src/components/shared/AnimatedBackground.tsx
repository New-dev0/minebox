import Scene3D from '../../pages/LandingPage/components/Scene3D'
import PixelsBackground from '../backgrounds/PixelsBackground'
import { BackgroundType } from '../../types'

interface AnimatedBackgroundProps {
  children?: React.ReactNode
  hideScene?: boolean
  pattern?: {
    backgroundColor: string
    backgroundImage?: string
    backgroundSize?: string
    backgroundPosition?: string
  }
  sceneType: BackgroundType
  userColor?: string
}

export default function AnimatedBackground({ 
  children, 
  hideScene = false,
  pattern,
  sceneType,
  userColor = '#00ff88'
}: AnimatedBackgroundProps) {
  const renderBackground = () => {
    switch(sceneType) {
      case 'pixels':
        return (
          <div className="fixed inset-0">
            <PixelsBackground
              color={userColor}
              speed={1}
              density={15}
              pixelSize={30}
              glowIntensity={5}
            />
          </div>
        )
      case 'pattern':
        return pattern && (
          <div 
            className="absolute inset-0" 
            style={pattern}
          />
        )
      case 'saturn':
        return !hideScene && <Scene3D />
      default:
        return !hideScene && <Scene3D />
    }
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0">
        {renderBackground()}
      </div>

      {/* Gradient Overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/10 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
} 