import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'
import { RARITY_COLORS, type Pet } from '../constants'
import { useTheme } from '../../../contexts/ThemeContext'

interface PetCardProps {
  pet: Pet
  onSelect: (pet: Pet) => void
}

function PetModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

export default function PetCard({ pet, onSelect }: PetCardProps) {
  const { customColors } = useTheme()
  const [isHovered, setIsHovered] = useState(true)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative aspect-square rounded-xl border backdrop-blur-xl overflow-hidden"
      style={{ 
        borderColor: `${RARITY_COLORS[pet.rarity]}40`,
        backgroundColor: 'rgba(0,0,0,0.3)'
      }}
    >
      {/* 3D Model View */}
      <div className="absolute inset-0">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
          <Suspense fallback={null}>
            <Stage
              environment="city"
              intensity={0.5}
              castShadow={false}
              shadows={false}
            >
              <PetModel url={pet.model} />
            </Stage>
          </Suspense>
          <OrbitControls 
            autoRotate={isHovered}
            autoRotateSpeed={4}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Info Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
        className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">{pet.name}</h3>
            <span 
              className="text-sm font-medium"
              style={{ color: RARITY_COLORS[pet.rarity] }}
            >
              {pet.rarity}
            </span>
          </div>
          
          <p className="text-sm text-gray-400">{pet.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {Object.entries(pet.stats).map(([stat, value]) => (
                <div 
                  key={stat}
                  className="px-2 py-1 rounded-lg text-xs"
                  style={{ backgroundColor: `${customColors.primary}20` }}
                >
                  {stat}: {value}
                </div>
              ))}
            </div>
            <span 
              className="font-bold"
              style={{ color: customColors.primary }}
            >
              {pet.price} 💎
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(pet)}
            className="w-full py-2 rounded-lg font-medium text-black mt-2"
            style={{ backgroundColor: customColors.primary }}
          >
            View Details
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
} 