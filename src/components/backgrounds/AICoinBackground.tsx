import { Canvas } from '@react-three/fiber'
import { Environment, Stars } from '@react-three/drei'
import BaseBackground from './BaseBackground'
import { BackgroundProps } from './types'
import { RainController } from './RainController'

interface AICoinBackgroundProps extends BackgroundProps {
  userColor?: string,
}

export default function AICoinBackground({ 
  children
}: AICoinBackgroundProps) {
  return (
    <BaseBackground>
      <div className="fixed inset-0 bg-black">
        <Canvas 
          camera={{ 
            position: [0, 0, 100],
            fov: 75
          }}
        >
          <color attach="background" args={['#000000']} />
          <fog attach="fog" args={['#000000', 50, 150]} />
          <Environment preset="night" />
          <ambientLight intensity={0.4} />
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.3}
            penumbra={1} 
            intensity={3}
            castShadow
          />
          <RainController />
          <Stars 
            radius={100} 
            depth={50} 
            count={2000}
            factor={4} 
            saturation={0} 
            fade
          />
        </Canvas>
      </div>
      {children}
    </BaseBackground>
  )
} 