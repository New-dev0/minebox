import { motion, AnimatePresence } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF } from '@react-three/drei'
import { RARITY_COLORS, type Pet } from '../constants'
import { useTheme } from '../../../contexts/ThemeContext'
import { FiX, FiHeart, FiShoppingCart } from 'react-icons/fi'
import { Suspense } from 'react'

interface PetDialogProps {
  pet: Pet
  isOpen: boolean
  onClose: () => void
  onPurchase: (pet: Pet) => void
}

function PetModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  useGLTF.preload(url)
  return <primitive object={scene} />
}

function LoadingSpinner() {
  const { customColors } = useTheme()
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-8 h-8 border-2 border-t-transparent rounded-full"
        style={{ borderColor: customColors.primary }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  )
}

export default function PetDialog({ pet, isOpen, onClose, onPurchase }: PetDialogProps) {
  const { customColors } = useTheme()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-[calc(100%-2rem)] md:w-[90vw] md:max-w-[800px] h-[90vh] md:max-h-[600px] 
                     bg-black/40 backdrop-blur-xl border rounded-2xl z-50 flex flex-col overflow-hidden"
            style={{ borderColor: `${RARITY_COLORS[pet.rarity]}40` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b"
                 style={{ borderColor: `${customColors.primary}20` }}>
              <div>
                <h2 className="text-2xl font-bold text-white">{pet.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: RARITY_COLORS[pet.rarity] }}
                  >
                    {pet.rarity}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: customColors.primary }}
                  >
                    {pet.price} 💎
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <FiX className="w-6 h-6 text-gray-400" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 overflow-y-auto">
              {/* 3D Model */}
              <div className="h-[300px] md:h-auto relative rounded-xl border overflow-hidden"
                   style={{ borderColor: `${customColors.primary}20` }}>
                <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
                  <Suspense fallback={null}>
                    <Stage
                      environment="city"
                      intensity={0.5}
                    >
                      <PetModel url={pet.model} />
                    </Stage>
                    <OrbitControls 
                      autoRotate
                      autoRotateSpeed={4}
                      enableZoom={false}
                      enablePan={false}
                      minPolarAngle={Math.PI / 2}
                      maxPolarAngle={Math.PI / 2}
                    />
                  </Suspense>
                </Canvas>
                <LoadingSpinner />
              </div>

              {/* Details */}
              <div className="space-y-4 md:space-y-6 overflow-y-auto">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                  <p className="text-gray-400">{pet.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(pet.stats).map(([stat, value]) => (
                      <div 
                        key={stat}
                        className="p-3 rounded-xl border"
                        style={{ borderColor: `${customColors.primary}20` }}
                      >
                        <div className="text-sm text-gray-400 capitalize">{stat}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <div 
                            className="h-1 flex-1 rounded-full overflow-hidden bg-black/20"
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${value}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: customColors.primary }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t mt-auto flex gap-4"
                 style={{ borderColor: `${customColors.primary}20` }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl border flex items-center justify-center gap-2"
                style={{ borderColor: `${customColors.primary}40` }}
              >
                <FiHeart className="w-5 h-5" style={{ color: customColors.primary }} />
                <span className="font-medium text-white">Add to Wishlist</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPurchase(pet)}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-black"
                style={{ backgroundColor: customColors.primary }}
              >
                <FiShoppingCart className="w-5 h-5" />
                <span className="font-medium">Purchase Now</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 