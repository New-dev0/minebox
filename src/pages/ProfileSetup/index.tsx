import { useState, useEffect } from 'react'
import {  useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { FiGlobe, FiMusic, FiHeart, FiStar, FiBattery } from 'react-icons/fi'
import { Dialog } from '@headlessui/react'
import { Link } from 'react-router-dom'
import ProfileStats from '../../components/profile/ProfileStats'

interface ProfileField {
  id: string
  label: string
  points: number
  type: 'text' | 'textarea' | 'select' | 'tags' | 'music' | 'emoji-select' | 'country-select' | 'card-select' | 'emoji-grid' | 'slider'
  options?: string[]
  placeholder: string
  completed: boolean
  description?: string
  icon?: typeof FiGlobe
  visualType?: 'country-select' | 'card-select' | 'emoji-grid' | 'slider'
}

const CountrySelector = ({ 
  value, 
  onChange,
  dateOfBirth,
  isDateOfBirthPublic,
  onDateOfBirthChange,
  onDateOfBirthPublicChange
}: { 
  value: string
  onChange: (value: string) => void
  dateOfBirth: string
  isDateOfBirthPublic: boolean
  onDateOfBirthChange: (value: string) => void
  onDateOfBirthPublicChange: (value: boolean) => void
}) => {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  
  const popularCountries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' }
  ]

  return (
    <div className="space-y-6">
      <div className="relative">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-3 bg-black/30 text-white rounded-lg 
                   border border-purple-500/30 p-4 hover:bg-purple-500/10 transition-colors"
        >
          {value ? (
            <>
              <span className="text-2xl">{popularCountries.find(c => c.code === value)?.flag}</span>
              <span>{popularCountries.find(c => c.code === value)?.name}</span>
            </>
          ) : (
            <>
              <FiGlobe className="w-6 h-6 text-purple-400" />
              <span className="text-gray-400">Select your country</span>
            </>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute top-full mt-2 w-full bg-black/90 rounded-lg border 
                         border-purple-500/20 p-4 z-50 backdrop-blur-sm"
              >
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/30 text-white rounded-lg border border-purple-500/30 
                           p-3 mb-4 focus:outline-none focus:border-purple-500"
                />
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {popularCountries
                    .filter(country => 
                      country.name.toLowerCase().includes(search.toLowerCase())
                    )
                    .map(country => (
                      <motion.button
                        key={country.code}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onChange(country.code)
                          setIsOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                                  ${value === country.code 
                                    ? 'bg-purple-500/20 text-white' 
                                    : 'hover:bg-purple-500/10 text-gray-300'}`}
                      >
                        <span className="text-2xl">{country.flag}</span>
                        <span>{country.name}</span>
                      </motion.button>
                    ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Date of Birth Section */}
      <div className="mt-8 p-4 bg-black/20 rounded-xl border border-purple-500/20">
        <h3 className="text-lg font-medium text-white mb-4">Date of Birth (Optional)</h3>
        
        <div className="space-y-4">
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => onDateOfBirthChange(e.target.value)}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
            className="w-full bg-black/30 text-white rounded-lg border border-purple-500/30 
                     p-4 focus:outline-none focus:border-purple-500"
          />
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isDateOfBirthPublic}
                onChange={(e) => onDateOfBirthPublicChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-black/30 rounded-full peer 
                           peer-checked:bg-purple-500/50 peer-focus:ring-2 
                           peer-focus:ring-purple-500/30"
              />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full 
                           transition-all duration-200 peer-checked:translate-x-4"
              />
            </div>
            <span className="text-gray-300 group-hover:text-white transition-colors">
              Show age on profile
            </span>
          </label>
          
          <p className="text-xs text-gray-500">
            Your birth date helps us provide age-appropriate content and features.
            You can choose whether to display your age on your profile.
          </p>
        </div>
      </div>
    </div>
  )
}

const VibeSelector = ({ value, onChange }: {
  value: string,
  onChange: (value: string) => void
}) => {
  const vibeOptions = [
    { 
      id: 'main-character',
      label: 'Main Character',
      icon: '✨',
      description: 'Living life like you\'re the star of the show',
      color: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      id: 'side-character',
      label: 'Side Character',
      icon: '🌟',
      description: 'Supporting others while living your best life',
      color: 'from-blue-500/20 to-purple-500/20'
    },
    { 
      id: 'villain-era',
      label: 'Villain Era',
      icon: '😈',
      description: 'Being unapologetically yourself',
      color: 'from-red-500/20 to-purple-500/20'
    },
    { 
      id: 'npc',
      label: 'NPC',
      icon: '🤖',
      description: 'Going with the flow, drama-free',
      color: 'from-gray-500/20 to-slate-500/20'
    },
    {
      id: 'protagonist',
      label: 'Protagonist in Training',
      icon: '🦋',
      description: 'Growing and evolving every day',
      color: 'from-green-500/20 to-emerald-500/20'
    },
    { 
      id: 'final-boss',
      label: 'Final Boss',
      icon: '👑',
      description: 'Already achieved your final form',
      color: 'from-purple-500/20 to-pink-500/20'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {vibeOptions.map((option) => (
        <motion.button
          key={option.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(option.label)}
          className={`relative p-4 rounded-xl border transition-all duration-200
                     ${value === option.label 
                       ? 'border-purple-500 bg-gradient-to-br ' + option.color
                       : 'border-purple-500/20 hover:border-purple-500/50 bg-black/30'}`}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">{option.icon}</span>
            <div className="text-left">
              <h3 className="font-bold text-white">{option.label}</h3>
              <p className="text-sm text-gray-400 mt-1">{option.description}</p>
            </div>
            {value === option.label && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full
                         flex items-center justify-center"
              >
                <svg 
                  className="w-4 h-4 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </motion.div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  )
}

const RelationshipSelector = ({ value, onChange }: {
  value: string,
  onChange: (value: string) => void
}) => {
  const relationshipOptions = [
    {
      id: 'single',
      label: 'Single',
      icon: '💫',
      description: 'Living your best solo life',
      color: 'from-blue-500/20 to-purple-500/20'
    },
    {
      id: 'talking',
      label: 'Talking Stage',
      icon: '💬',
      description: 'Getting to know someone special',
      color: 'from-pink-500/20 to-purple-500/20'
    },
    {
      id: 'situationship',
      label: 'Situationship',
      icon: '🤔',
      description: 'It\'s complicated but it works',
      color: 'from-yellow-500/20 to-red-500/20'
    },
    {
      id: 'taken',
      label: 'Taken',
      icon: '💝',
      description: 'Happily committed',
      color: 'from-red-500/20 to-pink-500/20'
    },
    {
      id: 'self-partnered',
      label: 'Self-Partnered',
      icon: '🦋',
      description: 'Focused on personal growth',
      color: 'from-green-500/20 to-teal-500/20'
    },
    {
      id: 'not-looking',
      label: 'Not Looking',
      icon: '✨',
      description: 'Here for the vibes only',
      color: 'from-purple-500/20 to-indigo-500/20'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {relationshipOptions.map((option) => (
        <motion.button
          key={option.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(option.label)}
          className={`relative p-4 rounded-xl border transition-all duration-200
                     ${value === option.label 
                       ? 'border-purple-500 bg-gradient-to-br ' + option.color
                       : 'border-purple-500/20 hover:border-purple-500/50 bg-black/30'}`}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">{option.icon}</span>
            <div className="text-left">
              <h3 className="font-bold text-white">{option.label}</h3>
              <p className="text-sm text-gray-400 mt-1">{option.description}</p>
            </div>
            {value === option.label && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full
                         flex items-center justify-center"
              >
                <svg 
                  className="w-4 h-4 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </motion.div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  )
}

const EnergySelector = ({ value, onChange }: {
  value: string,
  onChange: (value: string) => void
}) => {
  const energyOptions = [
    {
      id: 'social-butterfly',
      label: 'Social Butterfly',
      icon: '🦋',
      description: 'Always ready to hang out and meet new people',
      color: 'from-blue-500/20 to-purple-500/20',
      battery: '100%'
    },
    {
      id: 'balanced',
      label: 'Balanced',
      icon: '⚖️',
      description: 'Equal parts social and me-time',
      color: 'from-green-500/20 to-teal-500/20',
      battery: '75%'
    },
    {
      id: 'selective',
      label: 'Selective Socializer',
      icon: '🎭',
      description: 'Social with my circle, reserved with others',
      color: 'from-yellow-500/20 to-orange-500/20',
      battery: '50%'
    },
    {
      id: 'recharge',
      label: 'Needs Recharge',
      icon: '🔋',
      description: 'Social in small doses, needs recovery time',
      color: 'from-red-500/20 to-pink-500/20',
      battery: '25%'
    },
    {
      id: 'introvert',
      label: 'Cozy Introvert',
      icon: '🏡',
      description: 'Prefers quiet moments and small gatherings',
      color: 'from-indigo-500/20 to-purple-500/20',
      battery: '15%'
    },
    {
      id: 'hermit',
      label: 'Digital Hermit',
      icon: '🌙',
      description: 'Thrives in solitude, connects digitally',
      color: 'from-gray-500/20 to-slate-500/20',
      battery: '5%'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {energyOptions.map((option) => (
        <motion.button
          key={option.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(option.label)}
          className={`relative p-4 rounded-xl border transition-all duration-200
                     ${value === option.label 
                       ? 'border-purple-500 bg-gradient-to-br ' + option.color
                       : 'border-purple-500/20 hover:border-purple-500/50 bg-black/30'}`}
        >
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1">
            <span className="text-3xl">{option.icon}</span>
              <div 
                className="w-8 h-2 bg-black/30 rounded-full overflow-hidden"
                style={{ 
                  boxShadow: 'inset 0 0 4px rgba(0,0,0,0.3)' 
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: option.battery }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>
            <div className="text-left flex-1">
              <h3 className="font-bold text-white">{option.label}</h3>
              <p className="text-sm text-gray-400 mt-1">{option.description}</p>
            </div>
            {value === option.label && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full
                         flex items-center justify-center"
              >
                <svg 
                  className="w-4 h-4 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </motion.div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  )
}

export default function ProfileSetup() {
  const { user } = useAuth()
  const {customColors} = useTheme();
  const primaryColor = customColors?.primary;

  const maxPoints = 100;
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
//  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [formData, setFormData] = useState({
    bio: '',
    vibe: '',
    interests: [] as string[],
    music: [] as string[],
    relationship_status: '',
    looking_for: [] as string[],
    aesthetic: [] as string[],
    favorite_emojis: [] as string[],
    energy_level: '',
    social_battery: '',
    red_flags: [] as string[],
    green_flags: [] as string[],
    country: '',
    dateOfBirth: '',
    isDateOfBirthPublic: false,
  })

  const profileFields: ProfileField[] = [
    {
      id: 'country',
      label: 'Where are you from?',
      points: 15,
      type: 'country-select',
      icon: FiGlobe,
      placeholder: 'Select your country',
      completed: !!formData.country,
      description: 'Help us personalize your experience'
    },
    {
      id: 'vibe',
      label: 'What\'s your vibe?',
      icon: FiStar,
      visualType: 'card-select',
      points: 15,
      type: 'select',
      options: ['Main Character', 'Side Character', 'Villain Era', 'NPC', 'Protagonist in Training', 'Final Boss'],
      placeholder: 'Choose your character type...',
      completed: !!formData.vibe,
      description: 'How do you see yourself in your story?'
    },
    {
      id: 'music',
      label: 'Your top music picks',
      icon: FiMusic,
      visualType: 'card-select',
      points: 20,
      type: 'tags',
      options: [
        'Taylor Swift', 'Drake', 'The Weeknd', 'Bad Bunny', 'BTS', 
        'SZA', 'Travis Scott', 'Olivia Rodrigo', 'Lana Del Rey',
        'Tyler, the Creator', 'Frank Ocean', 'Kendrick Lamar'
      ],
      placeholder: 'Select your fav artists',
      completed: formData.music.length > 0,
      description: 'Who\'s on your playlist rn?'
    },
    {
      id: 'aesthetic',
      label: 'Your aesthetic',
      points: 15,
      type: 'tags',
      options: [
        'Y2K', 'Cottagecore', 'Dark Academia', 'Grunge', 
        'Soft Girl', 'E-Girl/Boy', 'Minimalist', 'Vintage',
        'Cyberpunk', 'Kawaii', 'Indie', 'Alt'
      ],
      placeholder: 'Pick your vibes',
      completed: formData.aesthetic.length > 0
    },
    {
      id: 'relationship_status',
      label: 'Relationship Status',
      points: 10,
      type: 'select',
      visualType: 'card-select',
      icon: FiHeart,
      options: [
        'Single', 'Talking Stage', 'Situationship', 
        'Taken', 'Self-Partnered', 'Not Looking'
      ],
      placeholder: 'What\'s your status?',
      completed: !!formData.relationship_status
    },
    {
      id: 'looking_for',
      label: 'Looking for',
      points: 15,
      type: 'tags',
      options: [
        'Friends', 'Gaming Buddy', 'Study Group', 
        'Project Collab', 'Gym Partner', 'Concert Buddy',
        'Travel Squad', 'Meme Exchange'
      ],
      placeholder: 'What connections are you seeking?',
      completed: formData.looking_for.length > 0
    },
    {
      id: 'favorite_emojis',
      label: 'Your mood in emojis',
      points: 10,
      type: 'tags',
      options: ['😌', '💅', '🤡', '✨', '💀', '🥺', '😭', '🤪', '', '🤪', '😤', '🌟'],
      placeholder: 'Pick your most used emojis',
      completed: formData.favorite_emojis.length > 0
    },
    {
      id: 'energy_level',
      label: 'Energy Level',
      points: 10,
      type: 'select',
      visualType: 'card-select',
      icon: FiBattery,
      options: [
        'Charging... (0%)', 
        'Low Battery Mode (25%)',
        'Half Tank (50%)',
        'Pretty Charged (75%)',
        'Fully Charged (100%)',
        'Overclocked (>9000%)'
      ],
      placeholder: 'How\'s your energy usually?',
      completed: !!formData.energy_level,
      description: 'Let others know your typical energy level'
    },
    {
      id: 'social_battery',
      label: 'Social Battery Type',
      points: 10,
      type: 'select',
      visualType: 'card-select',
      icon: FiBattery,
      options: [
        'Social Butterfly',
        'Balanced',
        'Selective Socializer',
        'Needs Recharge',
        'Cozy Introvert',
        'Digital Hermit'
      ],
      placeholder: 'Choose your social energy level...',
      completed: !!formData.social_battery,
      description: 'How do you manage your social energy?'
    },
    {
      id: 'red_flags',
      label: 'Your Red Flags',
      points: 15,
      type: 'tags',
      options: [
        'Always Late', 'Bad Texter', 'Chronically Online',
        'Overthinks Everything', 'Netflix Cheater', 
        'Pineapple on Pizza', 'Main Character Syndrome',
        'Can\'t Cook', 'Workaholic', 'Shopaholic'
      ],
      placeholder: 'We all have them...',
      completed: formData.red_flags.length > 0
    },
    {
      id: 'green_flags',
      label: 'Your Green Flags',
      points: 15,
      type: 'tags',
      options: [
        'Good Listener', 'Has Spotify Premium', 
        'Waters Plants', 'Reads Books', 'Goes to Therapy',
        'Has a Skincare Routine', 'Votes', 'Tips Well',
        'Respects Boundaries', 'Pet Lover'
      ],
      placeholder: 'What makes you a catch?',
      completed: formData.green_flags.length > 0
    },
    {
      id: 'bio',
      label: 'Your Bio',
      points: 20,
      type: 'textarea',
      placeholder: 'Write your story (keep it real, keep it you)',
      completed: !!formData.bio,
      description: 'This is your chance to shine! No pressure though 😌'
    }
  ]

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        navigate('/login')
        return
      }

      try {
        const { data, error: fetchError } = await supabase
        .from('profiles')
          .select('*')
        .eq('id', user.id)
          .single()

        if (fetchError) throw fetchError

        // If profile exists and setup is complete, redirect to profile
        if (data && data.setup_completed) {
          navigate(`/${data.username}`)
          return
        }

//        setProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, navigate])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div 
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: primaryColor }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div 
          className="text-red-500 p-4 rounded-lg border"
          style={{ borderColor: `${primaryColor}20` }}
        >
          {error}
        </div>
      </div>
    )
  }

  const handleInputChange = (field: string, value) => {
    console.log(`Updating ${field}:`, value)
    
    // Update form data
    setFormData(prev => {
      const newData = { ...prev };
      // @ts-expect-error: This is a temporary fix to allow the form data to be updated
      newData[field as keyof typeof formData] = value;
      console.log('New form data:', newData)
      return newData
    })

    // Reset points and recalculate total
    setTotalPoints(() => {
      let points = 0
      profileFields.forEach(field => {
        const fieldValue = formData[field.id as keyof typeof formData]
        const isValid = Array.isArray(fieldValue) 
          ? fieldValue.length > 0 
          : Boolean(fieldValue && fieldValue !== 'default')
        if (isValid) {
          points += field.points
        }
      })
      return points
    })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (!user?.id) {
        throw new Error('User not found')
      }

      console.log('Starting profile update...')

      // Prepare the update payload with individual columns
      const updatePayload = {
        bio: formData.bio,
        vibe: formData.vibe,
        music: formData.music,
        aesthetic: formData.aesthetic,
        relationship_status: formData.relationship_status,
        looking_for: formData.looking_for,
        favorite_emojis: formData.favorite_emojis,
        energy_level: formData.energy_level,
        social_battery: formData.social_battery,
        red_flags: formData.red_flags,
        green_flags: formData.green_flags,
        points: totalPoints,
        setup_completed: true
      }

      console.log('Update payload:', updatePayload)

      const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Profile update failed:', error)
        setError(error.message)
        return
      }

      console.log('Profile updated successfully:', data)
      navigate(`/${user.user_metadata.username}`, { replace: true })
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleNext = async () => {
    if (currentStep === profileFields.length - 1) {
      // On last step, submit the form
      await handleSubmit()
    } else {
      // Move to next step
      setCurrentStep(prev => prev + 1)
    }
  }

  // Move renderField inside the component
  const renderField = (field: ProfileField) => {
    switch (field.type) {
      case 'text':
      case 'textarea':
  return (
          <textarea
            value={formData[field.id as keyof typeof formData] as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full bg-black/30 text-white rounded-lg p-4 border border-white/10
                     focus:border-purple-500/50 focus:outline-none placeholder:text-gray-600
                     min-h-[120px]"
          />
        )

      case 'select':
        if (field.id === 'relationship_status') {
          return (
            <RelationshipSelector
              value={formData.relationship_status}
              onChange={(value) => handleInputChange('relationship_status', value)}
            />
          )
        }
        if (field.id === 'social_battery') {
          return (
            <EnergySelector
              value={formData.social_battery}
              onChange={(value) => handleInputChange('social_battery', value)}
            />
          )
        }
        if (field.id === 'vibe') {
          return (
            <VibeSelector
              value={formData.vibe}
              onChange={(value) => handleInputChange('vibe', value)}
            />
          )
        }
        return (
          <select
            value={formData[field.id as keyof typeof formData] as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full bg-black/30 text-white rounded-lg p-4 border border-white/10
                     focus:border-purple-500/50 focus:outline-none"
          >
            <option value="default">{field.placeholder}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'tags':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData[field.id as keyof typeof formData] &&
                (formData[field.id as keyof typeof formData] as string[]).map((tag) => (
                  <motion.span
                    key={tag}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300
                             flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => {
                        const currentTags = formData[field.id as keyof typeof formData] as string[]
                        handleInputChange(
                          field.id,
                          currentTags.filter(t => t !== tag)
                        )
                      }}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {field.options?.map(option => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const currentTags = formData[field.id as keyof typeof formData] as string[]
                    if (!currentTags.includes(option)) {
                      handleInputChange(field.id, [...currentTags, option])
                    }
                  }}
                  disabled={(formData[field.id as keyof typeof formData] as string[]).includes(option)}
                  className="px-3 py-2 rounded-lg bg-black/30 border border-white/10
                           hover:border-purple-500/50 disabled:opacity-50
                           disabled:cursor-not-allowed text-sm"
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'country-select':
        return (
          <CountrySelector
            dateOfBirth={formData.dateOfBirth}
            isDateOfBirthPublic={formData.isDateOfBirthPublic}
            onDateOfBirthChange={(value) => handleInputChange('dateOfBirth', value)}
            onDateOfBirthPublicChange={(value) => handleInputChange('isDateOfBirthPublic', value)}
            
            value={formData.country}
            onChange={(value) => handleInputChange('country', value)}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black/95">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-400">
            Let's make your profile stand out! The more you share, the more points you'll earn.
          </p>
        </div>

        {/* Progress and Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Progress Bar */}
          <div className="md:col-span-2">
        <motion.div 
              className="bg-black/30 p-4 rounded-lg backdrop-blur-sm border"
              style={{ borderColor: `${primaryColor}20` }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Profile Completion</span>
                <span 
                  className="font-bold"
                  style={{ color: primaryColor }}
                >
                  {totalPoints} / {maxPoints} XP
                </span>
          </div>
          <div className="h-2 bg-black/50 rounded-full overflow-hidden">
            <motion.div
                  className="h-full"
                  style={{ backgroundColor: primaryColor }}
              initial={{ width: 0 }}
              animate={{ width: `${(totalPoints / maxPoints) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
          </div>

          {/* Stats Card */}
          <div>
          <ProfileStats 
            stats={{
              posts: 0,
              friends: 0,
                achievements: 1
              }}
            primaryColor={primaryColor}
          />
          </div>
        </div>

        {/* Current Field Form */}
        <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
            className="bg-black/30 p-6 rounded-lg backdrop-blur-sm border"
            style={{ borderColor: `${primaryColor}20` }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                  {profileFields[currentStep].label}
                </h2>
                {profileFields[currentStep].description && (
                <p className="text-gray-400">
                  {profileFields[currentStep].description}
                </p>
                )}
          </div>

            {/* Field Input */}
            {renderField(profileFields[currentStep])}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-6 py-2 rounded-lg text-white bg-black/30 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg text-black"
                style={{ backgroundColor: primaryColor }}
              >
                {currentStep === profileFields.length - 1 ? (
                  isSubmitting ? 'Saving...' : 'Complete Setup'
                ) : (
                  'Next'
                )}
              </motion.button>
          </div>
        </motion.div>
        </AnimatePresence>

        {/* Login Dialog */}
      <Dialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black/80" />
            <div className="relative bg-black/90 p-6 rounded-lg border max-w-md w-full mx-4">
              <Dialog.Title className="text-xl font-bold text-white mb-4">
                Sign in to continue
            </Dialog.Title>
              <p className="text-gray-400 mb-6">
                You need to be signed in to complete your profile setup.
              </p>
              <div className="flex gap-4">
              <Link
                  to="/login"
                  className="flex-1 px-4 py-2 rounded-lg text-white bg-black/30 
                           hover:bg-black/50 transition-colors text-center"
                >
                  Sign In
              </Link>
              <Link
                  to="/register"
                  className="flex-1 px-4 py-2 rounded-lg text-black text-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  Create Account
              </Link>
            </div>
            </div>
        </div>
      </Dialog>
      </div>
    </div>
  )
} 