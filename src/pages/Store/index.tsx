import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { AnimatedBackground, ParticlesBackground, WavesBackground } from '../../components/backgrounds'
import WarScene from '../../components/scenes/WarScene'
import MainNav from '../../components/navigation/MainNav'
import BottomNav from '../../components/navigation/BottomNav'
import { PETS, type Pet } from '../../store/pets/constants'
import PetCard from '../../store/pets/components/PetCard'
import PetDialog from '../../store/pets/components/PetDialog'
import { BackgroundType } from '../../types'

export default function Store() {
  const { 
    backgroundType, 
    customColors, 
    pattern 
  } = useTheme()

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  const handlePurchase = (pet: Pet) => {
    // TODO: Implement purchase logic
    console.log('Purchasing:', pet)
  }

  return (
    <div className="min-h-screen">
      <div className="relative">
        {/* Background Layer */}
        <div className="fixed inset-0" style={{ zIndex: 0 }}>
          {backgroundType === 'scene3d-war' ? (
            <WarScene primaryColor={customColors.primary} />
          ) : backgroundType === 'particles' ? (
            <ParticlesBackground 
              color={customColors.primary}
              count={50}
              speed={1}
            />
          ) : backgroundType === 'pattern' && pattern ? (
            <AnimatedBackground 
              sceneType="pattern"
              pattern={pattern}
              userColor={customColors.primary}
            />
          ) : backgroundType === 'waves' ? (
            <WavesBackground
              color={customColors.primary}
              speed={1}
              amplitude={50}
            />
          ) : (
            <AnimatedBackground
              sceneType={backgroundType as BackgroundType}
              showTitle={false}
              userColor={customColors.primary}
            >
              <div className="min-h-screen relative">
                <div className="fixed inset-0">
                  <WarScene primaryColor={customColors.primary} />
                </div>
              </div>
            </AnimatedBackground>
          )}
        </div>

        {/* Content Layer */}
        <div className="relative z-10 min-h-screen pt-16 md:pt-0 md:pl-20">
          <MainNav />
          
          {/* Dialog Container - Make it full height */}
          <div className="relative min-h-[calc(100vh-4rem)] md:min-h-screen">
            {/* Content */}
            <div className="w-full px-4 py-8">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-white">Pet Store</h1>
                      <p className="text-gray-400">Adopt your digital companion</p>
                    </div>
                    <div 
                      className="px-4 py-2 rounded-lg font-medium"
                      style={{ backgroundColor: `${customColors.primary}20` }}
                    >
                      <span className="text-white">Balance: </span>
                      <span style={{ color: customColors.primary }}>1000 💎</span>
                    </div>
                  </div>
                  
                  {/* Pets Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PETS.map(pet => (
                      <PetCard
                        key={pet.id}
                        pet={pet}
                        onSelect={setSelectedPet}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Dialog */}
            {selectedPet && (
              <div className="absolute inset-0 flex items-center justify-center">
                <PetDialog
                  pet={selectedPet}
                  isOpen={selectedPet !== null}
                  onClose={() => setSelectedPet(null)}
                  onPurchase={handlePurchase}
                />
              </div>
            )}
          </div>

          <BottomNav />
        </div>
      </div>
    </div>
  )
} 