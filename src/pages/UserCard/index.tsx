import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { AnimatedBackground, ParticlesBackground, WavesBackground } from '../../components/backgrounds'
import { useState, useEffect } from 'react'
import RotatingCard from '../../components/cards/RotatingCard'
import { supabase } from '../../lib/supabase'
import html2canvas from 'html2canvas'
import { patterns } from '../../utils/patterns'
import WarScene from '../../components/scenes/WarScene'
import { getAvatarShape } from '../../utils/shapes'
import { BackgroundType } from '../../types'

type ProfileTheme = {
  backgroundType?: string
  pattern?: string | null
  patternIntensity?: number
  colorScheme?: string | null
  customColors?: {
    primary: string
    background: string
  }
}

type UserProfile = {
  id: string
  username: string
  email: string
  avatar_url: string | null
  full_name?: string
  bio: string | null
  theme: string | null
  setup_completed: boolean
  vibe: string | null
  music: string[]
  aesthetic: string[]
  relationship_status: string | null
  looking_for: string[]
  favorite_emojis: string[]
  energy_level: string | null
  social_battery: string | null
  red_flags: string[]
  green_flags: string[]
  points: number
  created_at: string
  social_links?: {
    twitter?: string
    discord?: string
    github?: string
  }
  status_emoji?: string
  pets_count?: number
  stats?: {
    level: number
    achievements: number
    games_played: number
  }
  avatar_shape?: string
  parsedTheme?: ProfileTheme
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

export default function UserCard() {
  const { username } = useParams()
  const { customColors: defaultColors } = useTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userTheme, setUserTheme] = useState<UserTheme | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            email,
            avatar_url,
            avatar_shape,
            bio,
            theme,
            setup_completed,
            vibe,
            music,
            aesthetic,
            relationship_status,
            looking_for,
            favorite_emojis,
            energy_level,
            social_battery,
            red_flags,
            green_flags,
            points,
            created_at,
            status_emoji
          `)
          .eq('username', username)
          .single()

        if (userError) throw userError

        let parsedTheme = null
        if (userData.theme) {
          try {
            parsedTheme = JSON.parse(userData.theme)
            setUserTheme(parsedTheme)
          } catch (error) {
            console.error('Error parsing theme:', error)
          }
        }

        const { count: petsCount } = await supabase
          .from('user_pets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userData.id)

        const { data: statsData } = await supabase
          .from('user_stats')
          .select('level, achievements, games_played')
          .eq('user_id', userData.id)
          .single()

        setProfile({
          ...userData,
          pets_count: petsCount || 0,
          stats: statsData || { level: 0, achievements: 0, games_played: 0 }
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username])

  const backgroundType = userTheme?.background || 'gradient'
  const activePattern = userTheme?.pattern ? patterns.find(p => p.id === userTheme.pattern) : null
  const primaryColor = userTheme?.customColors?.primary || defaultColors.primary

  const handleDownloadCard = async () => {
    const cardElement = document.querySelector('.card-content')
    if (!cardElement) return

    try {
      const canvas = await html2canvas(cardElement as HTMLElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true
      })

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) return

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${profile?.username}-card.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (error) {
      console.error('Error downloading card:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
             style={{ borderColor: primaryColor }} />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen">
      <div className="relative">
        {/* Background Layer */}
        <div className="fixed inset-0" style={{ zIndex: 0 }}>
          {backgroundType === 'scene3d-war' ? (
            <WarScene primaryColor={primaryColor} />
          ) : backgroundType === 'particles' ? (
            <ParticlesBackground 
              color={primaryColor}
              count={50}
              speed={1}
            />
          ) : backgroundType === 'pattern' && activePattern ? (
            <AnimatedBackground 
              sceneType="pattern"
              pattern={{
                css: {
                  backgroundImage: activePattern.css.backgroundImage as string,
                  backgroundSize: activePattern.css.backgroundSize as string,
                  backgroundColor: activePattern.css.backgroundColor as string
                }
              }}
              userColor={primaryColor}
            />
          ) : backgroundType === 'waves' ? (
            <WavesBackground
              color={primaryColor}
              speed={1}
              amplitude={50}
            />
          ) : (
            <AnimatedBackground
              sceneType={backgroundType as BackgroundType}
              showTitle={false}
              userColor={primaryColor}
            />
          )}
        </div>

        {/* Translucent Overlay */}
        <div 
          className="fixed inset-0 bg-black/40" 
          style={{ zIndex: 1 }} 
        />

        {/* Content Layer */}
        <div className="relative flex items-center justify-center p-4 min-h-screen" style={{ zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl h-[400px]"
          >
            <RotatingCard width={800} height={400}>
              <div className="w-full h-full relative backdrop-blur-xl bg-black/40 rounded-2xl overflow-hidden border card-content"
                   style={{ borderColor: `${primaryColor}30` }}>
                {/* Header Pattern */}
                <div className="absolute inset-x-0 top-0 h-32 opacity-50"
                     style={{ 
                       background: `linear-gradient(45deg, ${primaryColor}20, transparent)`,
                       backgroundSize: '10px 10px' 
                     }} />

                {/* Content */}
                <div className="relative p-8 flex gap-8 h-full">
                  {/* Left Side - Avatar & Main Info */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-4">
                    <div 
                      className="relative p-1.5 bg-black/40 backdrop-blur-xl"
                      style={{ 
                        clipPath: getAvatarShape(profile.avatar_shape),
                        border: `2px solid ${primaryColor}`,
                        borderRadius: profile.avatar_shape === 'circle' ? '100%' : '0'
                      }}
                    >
                      <img 
                        src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                        alt={profile.username}
                        className="w-32 h-32 bg-black/20"
                        style={{ 
                          clipPath: getAvatarShape(profile.avatar_shape),
                          borderRadius: profile.avatar_shape === 'circle' ? '100%' : '0'
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-white mb-1">
                        {profile.username}
                      </h1>
                      {profile.full_name && (
                        <h2 className="text-lg text-gray-300 mb-2">{profile.full_name}</h2>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Stats & Details */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      {/* Bio Section */}
                      <div className="space-y-2 mb-6">
                        <p className="text-lg text-gray-300">{profile.bio}</p>
                        {profile.vibe && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Vibe:</span>
                            <span className="text-white">{profile.vibe}</span>
                          </div>
                        )}
                        {profile.status_emoji && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Mood:</span>
                            <span className="text-2xl">{profile.status_emoji}</span>
                          </div>
                        )}
                        {profile.energy_level && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Energy:</span>
                            <span className="text-white">{profile.energy_level}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        {[
                          { label: 'Level', value: profile.stats?.level || 0 },
                          { label: 'Achievements', value: profile.stats?.achievements || 0 },
                          { label: 'Games Played', value: profile.stats?.games_played || 0 },
                          { label: 'Pets', value: profile.pets_count || 0 }
                        ].map(({ label, value }) => (
                          <div 
                            key={label}
                            className="text-center p-4 rounded-lg transition-colors"
                            style={{ 
                              backgroundColor: `${primaryColor}10`,
                              border: `1px solid ${primaryColor}20`
                            }}
                          >
                            <div className="text-3xl font-bold text-white">{value}</div>
                            <div className="text-sm text-gray-400">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      {/* Social Links */}
                      {profile.social_links && (
                        <div className="flex gap-6">
                          {profile.social_links.twitter && (
                            <a 
                              href={profile.social_links.twitter} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="transition-colors hover:text-white"
                              style={{ 
                                color: `${primaryColor}80`
                              }}
                            >
                              <i className="fab fa-twitter text-2xl" />
                            </a>
                          )}
                          {profile.social_links.discord && (
                            <div className="text-gray-400 cursor-pointer hover:text-white"
                                 onClick={() => navigator.clipboard.writeText(profile.social_links?.discord || '')}>
                              <i className="fab fa-discord text-2xl" />
                            </div>
                          )}
                          {profile.social_links.github && (
                            <a href={profile.social_links.github}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-gray-400 hover:text-white">
                              <i className="fab fa-github text-2xl" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Join Date */}
                      <div className="text-sm text-gray-500">
                        Member since {new Date(profile.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </RotatingCard>
          </motion.div>

          <div className="absolute bottom-4 right-4 flex items-center gap-4">
            <button
              onClick={handleDownloadCard}
              className="text-sm flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg"
              style={{ 
                backgroundColor: `${primaryColor}20`,
                border: `1px solid ${primaryColor}40`,
                color: primaryColor
              }}
            >
              <i className="fas fa-download" />
              <span>Download Card</span>
            </button>

            <a
              href={`/${profile.username}`}
              className="text-sm flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg"
              style={{ 
                backgroundColor: `${primaryColor}20`,
                border: `1px solid ${primaryColor}40`,
                color: primaryColor
              }}
            >
              <span>View Full Profile</span>
              <i className="fas fa-arrow-right" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 