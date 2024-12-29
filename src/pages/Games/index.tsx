import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AnimatedBackground, ParticlesBackground, WavesBackground } from '../../components/backgrounds'
import WarScene from '../../components/scenes/WarScene'
import MainNav from '../../components/navigation/MainNav'
import BottomNav from '../../components/navigation/BottomNav'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { patterns } from '../../utils/patterns'
import MetaTags from '../../components/shared/MetaTags'

interface Game {
  id: string
  title: string
  description: string
  thumbnail: string
  url: string
  isMobile: boolean
  embed?: {
    code: string
    url: string
    width: number
    height: number
  }
}

interface Category {
  id: string
  name: string
  count?: string
}

interface UserTheme {
  background?: string
  pattern?: string
  patternIntensity?: number
  colorScheme?: string
  customColors?: {
    primary: string
    background: string
  }
}

export default function Games() {
  const { user } = useAuth();
  const [userTheme, setUserTheme] = useState<UserTheme>()
  const [isLoading, setIsLoading] = useState(true)
  const [games, setGames] = useState<Game[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Fetch user's theme preferences
  useEffect(() => {
    const fetchUserTheme = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme')
          .eq('id', user.id)
          .single()

        if (!error && data?.theme) {
          setUserTheme(data.theme)
        }
      } catch (error) {
        console.error('Error fetching theme:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserTheme()
  }, [user])

  useEffect(() => {
    fetchCategories()
    fetchGames(1)
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchGamesByCategory(selectedCategory, 1)
    } else {
      fetchGames(1)
    }
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/games?page=${page}`);
      const data = await response.json();
      
      // Ensure we have games array and pagination
      setGames(data.games || []);
      setCurrentPage(data.pagination?.currentPage || 1);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchGamesByCategory = async (categoryId: string, page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${categoryId}?page=${page}`);
      const data = await response.json();
      
      // Ensure we have games array and pagination
      setGames(data.games || []);
      setCurrentPage(data.pagination?.currentPage || 1);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching category games:', error);
      setGames([]);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (selectedCategory) {
      fetchGamesByCategory(selectedCategory, page)
    } else {
      fetchGames(page)
    }
    setCurrentPage(page)
  }

  const primaryColor = userTheme?.customColors?.primary || '#8B5CF6'
  const backgroundType = userTheme?.background
  const activePattern = userTheme?.pattern ? patterns.find(p => p.id === userTheme.pattern) : null

  // Show loading overlay while fetching theme
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-8 h-8 border-2 border-t-transparent rounded-full"
          style={{ borderColor: primaryColor }}
        />
      </div>
    )
  }

  return (
    <>
      <MetaTags title="Games" description="Play HTML5 Games" />
      {backgroundType ? (
        backgroundType === 'scene3d-war' ? (
          <div className="min-h-screen relative">
            <div className="fixed inset-0">
              <WarScene primaryColor={primaryColor} />
            </div>
            <GamesContent 
              games={games}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              currentPage={currentPage}
              totalPages={totalPages}
              loading={loading}
              handlePageChange={handlePageChange}
              primaryColor={primaryColor}
            />
          </div>
        ) : backgroundType === 'pattern' && activePattern ? (
          <AnimatedBackground 
            hideScene={true} 
            pattern={{css: {
              backgroundColor: activePattern.css.backgroundColor,
              backgroundImage: activePattern.css.backgroundImage,
              backgroundSize: activePattern.css.backgroundSize,
            }}}
            userColor={primaryColor}
          >
            <GamesContent 
              games={games}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              currentPage={currentPage}
              totalPages={totalPages}
              loading={loading}
              handlePageChange={handlePageChange}
              primaryColor={primaryColor}
            />
          </AnimatedBackground>
        ) : backgroundType === 'particles' ? (
          <ParticlesBackground 
            color={primaryColor}
            count={50}
            speed={1}
          >
            <GamesContent 
              games={games}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              currentPage={currentPage}
              totalPages={totalPages}
              loading={loading}
              handlePageChange={handlePageChange}
              primaryColor={primaryColor}
            />
          </ParticlesBackground>
        ) : backgroundType === 'waves' ? (
          <WavesBackground
            color={primaryColor}
            speed={1}
            amplitude={50}
          >
            <GamesContent 
              games={games}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              currentPage={currentPage}
              totalPages={totalPages}
              loading={loading}
              handlePageChange={handlePageChange}
              primaryColor={primaryColor}
            />
          </WavesBackground>
        ) : (
          <div className="min-h-screen bg-black">
            <GamesContent 
              games={games}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              currentPage={currentPage}
              totalPages={totalPages}
              loading={loading}
              handlePageChange={handlePageChange}
              primaryColor={primaryColor}
            />
          </div>
        )
      ) : (
        <div className="min-h-screen bg-black">
          <GamesContent 
            games={games}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            currentPage={currentPage}
            totalPages={totalPages}
            loading={loading}
            handlePageChange={handlePageChange}
            primaryColor={primaryColor}
          />
        </div>
      )}
    </>
  )
}

function GamesContent({
  games,
  categories,
  selectedCategory,
  setSelectedCategory,
  currentPage,
  totalPages,
  loading,
  handlePageChange,
  primaryColor
}) {
  const navigate = useNavigate()

  return (
    <div className="relative z-10 min-h-screen pt-16 md:pt-0 md:pl-20">
      <MainNav />
      
      <div className="w-full px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Games</h1>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-black/40 text-white rounded-lg px-4 py-2 border"
                  style={{ borderColor: `${primaryColor}20` }}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} {category.count ? `(${category.count})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Games Grid */}
            {loading ? (
              <div className="text-center text-white">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map((game) => (
                  <motion.div
                    key={game.id}
                    whileHover={{ scale: 1.02 }}
                    className="group relative bg-black/40 rounded-xl overflow-hidden cursor-pointer backdrop-blur-sm"
                    onClick={() => navigate(`/games/${game.id}`)}
                  >
                    {/* Translucent border effect */}
                    <div 
                      className="absolute inset-0 rounded-xl border-2 border-white/10 transition-colors duration-200"
                      style={{ 
                        borderColor: `${primaryColor}20`,
                        boxShadow: `inset 0 0 15px ${primaryColor}10`,
                      }} 
                    />

                    <div className="relative">
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    <div className="relative p-4">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-200"
                          style={{ color: 'white' }}>
                        {game.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{game.description}</p>
                      {game.isMobile && (
                        <span 
                          className="mt-2 inline-block px-2 py-1 text-xs rounded"
                          style={{ 
                            backgroundColor: `${primaryColor}20`,
                            color: primaryColor 
                          }}
                        >
                          Mobile Ready
                        </span>
                      )}
                    </div>

                    {/* Hover effect overlay */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
                      style={{ 
                        boxShadow: `inset 0 0 30px ${primaryColor}20`,
                        background: `linear-gradient(45deg, ${primaryColor}05, transparent)`
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'bg-black/40 text-white hover:bg-primary/20'
                    }`}
                    style={{
                      backgroundColor:
                        currentPage === page ? primaryColor : undefined,
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
} 