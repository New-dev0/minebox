import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiUser, FiX } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import MainNav from '../../components/navigation/MainNav'
import { useAuth } from '../../contexts/AuthContext'
import WarScene from '../../components/scenes/WarScene'
import { AnimatedBackground, ParticlesBackground, WavesBackground } from '../../components/backgrounds'
import { patterns } from '../../utils/patterns'
import MetaTags from '../../components/shared/MetaTags'
import { BackgroundType } from '../../types'

interface SearchResult {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
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

interface SearchResultWithScore extends SearchResult {
  score: number
}

export default function Search() {
  const { user } = useAuth()
  const [userTheme, setUserTheme] = useState<UserTheme>()
  const [isLoading, setIsLoading] = useState(true)

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

  const primaryColor = userTheme?.customColors?.primary || '#8B5CF6'

  // Get background type from theme
  const backgroundType = userTheme?.background
  const activePattern = userTheme?.pattern ? patterns.find(p => p.id === userTheme.pattern) : null

  // Show loading overlay while fetching theme
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <>
      <MetaTags title="Search" description="Find people on MineBox" />
      {backgroundType ? (
        // Only show specific backgrounds if user has set one
        backgroundType === 'scene3d-war' ? (
          <div className="min-h-screen relative">
            <div className="fixed inset-0">
              <WarScene primaryColor={primaryColor} />
            </div>
            <SearchContent primaryColor={primaryColor} />
          </div>
        ) : backgroundType === 'pattern' && activePattern ? (
          <AnimatedBackground 
          
            sceneType={backgroundType as BackgroundType}
            hideScene={true} 
            pattern={{
              css: {
                backgroundImage: activePattern.css.backgroundImage as string,
                backgroundSize: activePattern.css.backgroundSize as string,
                backgroundColor: activePattern.css.backgroundColor as string
              }
            }}
          >
            <SearchContent primaryColor={primaryColor} />
          </AnimatedBackground>
        ) : backgroundType === 'particles' ? (
          <ParticlesBackground 
            color={primaryColor}
            count={50}
            speed={1}
          >
            <SearchContent primaryColor={primaryColor} />
          </ParticlesBackground>
        ) : backgroundType === 'waves' ? (
          <WavesBackground
            color={primaryColor}
            speed={1}
            amplitude={50}
          >
            <SearchContent primaryColor={primaryColor} />
          </WavesBackground>
        ) : (
          // Default black background if no valid background type
          <div className="min-h-screen bg-black">
            <SearchContent primaryColor={primaryColor} />
          </div>
        )
      ) : (
        // Default black background if no theme set
        <div className="min-h-screen bg-black">
          <SearchContent primaryColor={primaryColor} />
        </div>
      )}
    </>
  )
}

function SearchContent({ primaryColor }: { primaryColor: string }) {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
//  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])

  // Fetch user's theme preferences
//  const [userTheme, setUserTheme] = useState<UserTheme>()

  useEffect(() => {
    const fetchUserTheme = async () => {
      if (!user?.id) return
      
      const { data, error } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.id)
        .single()

      if (!error && data?.theme) {
//        setUserTheme(data.theme)
      }
    }

    fetchUserTheme()
  }, [user])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .ilike('username', `%${searchQuery}%`)
        .limit(20)

      if (error) throw error

      // Calculate match scores and sort results
      const scoredResults = (data || []).map(profile => {
        const username = profile.username.toLowerCase()
        const query = searchQuery.toLowerCase()
        let score = 0

        // Exact match gets highest score
        if (username === query) {
          score = 100
        }
        // Starts with query gets high score
        else if (username.startsWith(query)) {
          score = 75
        }
        // Contains query as whole word gets medium score
        else if (new RegExp(`\\b${query}\\b`).test(username)) {
          score = 50
        }
        // Contains query gets lower score
        else if (username.includes(query)) {
          score = 25
        }
        // Levenshtein distance for fuzzy matching
        const distance = levenshteinDistance(username, query)
        score += Math.max(0, 20 - distance)

        return { ...profile, score }
      }) as SearchResultWithScore[]

      // Sort by score descending
      const sortedResults = scoredResults
        .sort((a, b) => b.score - a.score)
        .map(({ score, ...profile }) => {
          return { ...profile, score }
        }) // Remove score before setting state
        .slice(0, 10) // Limit to top 10 results

      setResults(sortedResults)
    } catch (error) {
      console.error('Error searching profiles:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null)
    )
    
    for (let i = 0; i <= str1.length; i++) track[0][i] = i
    for (let j = 0; j <= str2.length; j++) track[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        )
      }
    }

    return track[str2.length][str1.length]
  }

  return (
    <div className="min-h-screen md:pl-20">
      <MainNav />
      
      {/* Search Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/60 backdrop-blur-md z-40 md:left-20 border-b"
           style={{ borderColor: `${primaryColor}20` }}>
        <div className="container mx-auto px-4 py-4">
          <div className="relative">
            <FiSearch 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
              style={{ color: primaryColor }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              placeholder="Search users..."
              className="w-full bg-black/40 text-white rounded-lg pl-12 pr-4 py-3 
                       border transition-colors duration-200 placeholder-gray-500
                       focus:border-[color:var(--primary-color)]"
              style={{ 
                borderColor: `${primaryColor}20`
              }}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  setResults([])
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-white transition-colors"
                style={{ color: primaryColor }}
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="container mx-auto px-4 pt-24 pb-24 md:pb-8">
        <AnimatePresence mode="wait">
          {query ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {isSearching ? (
                // Loading state
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-6 h-6 border-2 border-t-transparent rounded-full"
                    style={{ borderColor: primaryColor }}
                  />
                </div>
              ) : results.length > 0 ? (
                // Results list
                results.map(profile => (
                  <motion.a
                    key={profile.id}
                    href={`/${profile.username}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="block bg-black/40 backdrop-blur-sm rounded-lg border p-4
                             transition-all duration-200 hover:bg-opacity-10 hover:border-opacity-40"
                    style={{ 
                      borderColor: `${primaryColor}20`,
                      backgroundColor: 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="w-12 h-12 rounded-full object-cover border-2"
                          style={{ borderColor: `${primaryColor}40` }}
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                          style={{ 
                            backgroundColor: `${primaryColor}20`,
                            borderColor: `${primaryColor}40`
                          }}
                        >
                          <FiUser className="w-6 h-6" style={{ color: primaryColor }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{profile.username}</h3>
                        {profile.bio && (
                          <p className="text-gray-400 text-sm truncate">{profile.bio}</p>
                        )}
                      </div>
                    </div>
                  </motion.a>
                ))
              ) : (
                // No results
                <div className="text-center py-8">
                  <FiSearch className="w-8 h-8 mx-auto mb-2" style={{ color: primaryColor }} />
                  <p className="text-gray-400">No users found</p>
                </div>
              )}
            </motion.div>
          ) : (
            // Empty state
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <FiSearch 
                className="w-12 h-12 mx-auto mb-4" 
                style={{ color: primaryColor }}
              />
              <p className="text-gray-400">Search for users by username</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 