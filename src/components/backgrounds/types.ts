export interface BackgroundProps {
  children?: React.ReactNode
  color?: string
  speed?: number
  amplitude?: number
  count?: number
  pattern?: {
    backgroundColor: string
    backgroundImage?: string
    backgroundSize?: string
    backgroundPosition?: string
  }
  sceneType?: 'saturn' | 'scene3d-war' | 'particles' | 'waves' | 'heartbeat' | 'racing'
  hideScene?: boolean
}

export interface SceneProps {
  primaryColor?: string
} 