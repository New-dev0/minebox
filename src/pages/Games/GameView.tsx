import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { AnimatedBackground, ParticlesBackground, WavesBackground } from '../../components/backgrounds'
import WarScene from '../../components/scenes/WarScene'
import { BackgroundType } from '../../types'
import MainNav from '../../components/navigation/MainNav'
import BottomNav from '../../components/navigation/BottomNav'
import HTML5Game from '../../games/html5/HTML5Game'

interface GameDetails {
  id: string
  title: string
  description: string
  published: string
  platform: string
  size: string
  isMobile: boolean
  controls: string
  thumbnail: string
  categories: Array<{ id: string; name: string }>
  embed: {
    code: string
    url: string
    width: number
    height: number
  }
}

export default function GameView() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { backgroundType, customColors, pattern } = useTheme()
  const [game, setGame] = useState<GameDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGameDetails()
  }, [gameId])

  const fetchGameDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/games/${gameId}`)
      if (!response.ok) throw new Error('Game not found')
      const data = await response.json()
      setGame(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load game')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center text-white mt-20">Loading...</div>
  if (error) return <div className="text-center text-red-500 mt-20">{error}</div>
  if (!game) return null

  return (
    <div className="min-h-screen">
      <div className="relative">
        {/* Background Layer */}
        <div className="fixed inset-0" style={{ zIndex: 0 }}>
          {backgroundType === 'scene3d-war' ? (
            <WarScene primaryColor={customColors.primary} />
          ) : backgroundType === 'particles' ? (
            <ParticlesBackground color={customColors.primary} count={50} speed={1} />
          ) : backgroundType === 'pattern' && pattern ? (
            <AnimatedBackground sceneType="pattern" pattern={pattern} userColor={customColors.primary} />
          ) : backgroundType === 'waves' ? (
            <WavesBackground color={customColors.primary} speed={1} amplitude={50} />
          ) : (
            <AnimatedBackground sceneType={backgroundType as BackgroundType} showTitle={false} userColor={customColors.primary} />
          )}
        </div>

        {/* Content Layer */}
        <div className="relative z-10 min-h-screen pt-16 md:pt-0 md:pl-20">
          <MainNav />
          
          <div className="w-full px-4 py-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <button
                  onClick={() => navigate('/games')}
                  className="text-white hover:text-primary transition-colors"
                >
                  ← Back to Games
                </button>

                <div className="bg-black/40 rounded-xl border overflow-hidden"
                     style={{ borderColor: `${customColors.primary}20` }}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-white mb-4">{game.title}</h1>
                    
                    <div className="aspect-video w-full mb-6">
                      <HTML5Game
                        url={game.embed.url}
                        title={game.title}
                        onError={() => setError('Failed to load game')}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h2 className="text-xl text-white mb-4">About</h2>
                        <p className="text-gray-300 mb-4">{game.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            {game.categories.map(category => (
                              <span
                                key={category.id}
                                className="px-3 py-1 rounded-full text-sm"
                                style={{ backgroundColor: `${customColors.primary}20`, color: customColors.primary }}
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-white font-semibold mb-2">Published</h3>
                          <p className="text-gray-300">{game.published}</p>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-2">Platform</h3>
                          <p className="text-gray-300">{game.platform}</p>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-2">Controls</h3>
                          <p className="text-gray-300">{game.controls}</p>
                        </div>
                        {game.isMobile && (
                          <div className="inline-block px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
                            Mobile Ready
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <BottomNav />
        </div>
      </div>
    </div>
  )
} 