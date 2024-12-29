import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, Reorder } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { 
  FiImage, 
  FiSettings, FiCamera, FiMessageSquare, FiLayout, FiFeather, FiSave, FiArrowLeft, 
  FiDroplet, FiBox, FiGrid, FiCircle, FiActivity,  FiUser, FiPlay, FiBook, FiDollarSign, FiVideo
} from 'react-icons/fi'
import { TbSteeringWheel } from 'react-icons/tb'
import { patterns, Pattern } from '../../utils/patterns'
import { ColorScheme, colorSchemes } from '../../utils/colorSchemes'
import ColorSchemeView from '../../components/patterns/ColorSchemeView'
import BannerView, { Banner } from '../../components/patterns/BannerView'
import QuoteDialog from '../../components/quotes/QuoteDialog'
import TimelineEvent from '../../components/timeline/TimelineEvent'
import AvatarShapeSelector from '../../components/profile/AvatarShapeSelector'
import SocialLinksCard from '../../components/profile/SocialLinksCard'
import MainNav from '../../components/navigation/MainNav'
import MetaTags from '../../components/shared/MetaTags'
import ThemedBackground from '../../components/shared/ThemedBackground'
import ProfileHeader from '../../components/profile/ProfileHeader'
import TimelineList from '../../components/timeline/TimelineList'
import { BackgroundType, Book, Video } from '../../types'
import PatternsView from '../../components/patterns/PatternsView'
import BottomSheet from '../../components/shared/BottomSheet'
import ReactEmojis from '@souhaildev/reactemojis'
import BlogsBox, { BlogPost } from '../../components/profile/BlogsBox'
import DraggableSection from '../../components/profile/DraggableSection'
import BookshelfBox from '../../components/profile/BookshelfBox'
import AddBookDialog from '../../components/profile/AddBookDialog'
import VideoBox from '../../components/profile/VideoBox'
import AddVideoDialog from '../../components/profile/AddVideoDialog'
import EditVideoDialog from '../../components/profile/EditVideoDialog'


interface TimelineEvent {
  id: string
  type: string
  title: string
  description?: string
  content: string
  icon?: string
  created_at: string
  event_date?: string
  metadata?: {
    achievementType?: string
    icon?: string
    color?: string
    rarity?: string
    points?: number
    [key: string]: string | number | undefined
  }
}

interface Achievement {
  id: string
  type: string
  title: string
  description: string
  icon: string
  awarded_at: string
  metadata: {
    color: string
    rarity: string
    points: number
  }
}

interface SocialLink {
  id: string
  platform: string
  url: string
  label?: string
}

export interface ProfileData {
  id: string
  username: string
  email: string
  avatar_url: string | null
  bio: string | null
  theme: string | null
  setup_completed: boolean
  created_at: string
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
  stats?: {
    posts: number
    friends: number
    achievements: number
  }
  timeline_events?: TimelineEvent[]
  main_image_url: string | null
  left_image_url: string | null
  right_image_url: string | null
  achievements?: Achievement[]
  avatar_shape: string
  show_social_links: boolean
  social_links?: SocialLink[]
  vibe?: string
  status_emoji?: string
  show_blogs_box: boolean
  section_order: string[]
  show_bookshelf: boolean
  favorite_books?: Book[],
}


export const SUPPORTED_EMOJIS = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '🥰',
  '😍',
  '🥳',
  '🤑',
  '🔥',
  '👀', 
  '👍',
  '😎',
  '😉',
  '🤩',
  '🤤',
  '🧐',
  '🙄',
  '😛',
  '😴',
  '😇',
  '😏',
  '😲',
  '😌',
  '🥺',
  '🙂',
  '��',
  '🚀',
  '💯',
  '⚡',
  '⭐',
  '💎',
  '💪'
]

const PostOption = ({ 
  icon: Icon, 
  label, 
  onClick 
}: { 
  icon: typeof FiCamera
  label: string
  onClick: () => void 
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-purple-500/10 
             border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
  >
    <Icon className="w-8 h-8 text-purple-400" />
    <span className="text-sm font-medium text-white">{label}</span>
  </motion.button>
)

// Update the background options to include gameEnabled flag
const backgroundOptions = [
  { 
    id: 'saturn', 
    label: 'Saturn', 
    description: '3D space scene with rotating planets',
    category: '3D Scenes',
    icon: FiBox,
    gameEnabled: false
  },
  { 
    id: 'cyber-world', 
    label: 'Cyber World', 
    description: 'Cyberpunk themed background',
    category: '3D Scenes',
    icon: FiBox,
    gameEnabled: false
  },
  { 
    id: 'scene3d-war', 
    label: 'War Scene', 
    description: 'Dynamic 3D battlefield environment',
    category: '3D Scenes',
    icon: FiActivity,
    gameEnabled: false
  },
  { 
    id: 'pattern', 
    label: 'Pattern', 
    description: 'Customizable geometric patterns',
    category: 'Abstract',
    icon: FiGrid,
    gameEnabled: false
  },
  { 
    id: 'particles', 
    label: 'Particles', 
    description: 'Interactive particle system',
    category: 'Abstract',
    icon: FiDroplet,
    gameEnabled: false
  },
  { 
    id: 'pixels', 
    label: 'Meteors',
    description: 'Dynamic meteor shower animation',
    category: 'Abstract',
    icon: FiGrid,
    gameEnabled: false
  },
  { 
    id: 'waves', 
    label: 'Waves', 
    description: 'Animated wave patterns',
    category: 'Abstract',
    icon: FiActivity,
    gameEnabled: false
  },
  { 
    id: 'heartbeat', 
    label: 'Heartbeat', 
    description: 'Pulsing rhythm visualization',
    category: 'Interactive',
    icon: FiActivity,
    gameEnabled: false
  },
  { 
    id: 'racing', 
    label: 'Racing', 
    description: 'High-speed racing environment',
    category: 'Interactive',
    icon: TbSteeringWheel,
    gameEnabled: true
  },
  { 
    id: 'minecraft', 
    label: 'Minecraft', 
    description: 'Blocky terrain with moving clouds',
    category: 'Interactive',
    icon: FiBox,
    gameEnabled: false
  },
  { 
    id: 'ai-coin', 
    label: 'AI Coin', 
    description: '3D rotating coin with AI symbol',
    category: '3D Scenes',
    icon: FiDollarSign,
    gameEnabled: false
  },
  {
    id: 'space-pikachu',
    label: 'Pikachu Space',
    description: '3D space scene with Pikachu',
    category: '3D Scenes',
    icon: FiBox,
    gameEnabled: false
  },
  {
    id: 'fantasy',
    label: 'Fantasy',
    description: 'Fantasy background with crystals',
    category: 'Abstract',
    icon: FiBox,
    gameEnabled: false
  }
]

interface ProfileProps {
  isGameMode: boolean
  setIsGameMode: (mode: boolean) => void
}

// Update the default section order
const DEFAULT_SECTION_ORDER = ['blogs', 'social', 'timeline', 'bookshelf', 'videos']

export default function Profile({ isGameMode, setIsGameMode }: ProfileProps) {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const isOwnProfile = user?.user_metadata.username === username
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [isCustomizeSheetOpen, setIsCustomizeSheetOpen] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null)
  const [activePattern, setActivePattern] = useState<Pattern | null>(null)
  const [patternIntensity, setPatternIntensity] = useState<number>(100)
  const [customizationView, setCustomizationView] = useState<'menu' | 'patterns' | 'colors' | 'banners' | 'backgrounds' | 'avatar-shape' | 'widgets'>('menu')
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme | null>(null)
  const [customColors, setCustomColors] = useState({
    primary: '#8B5CF6',
    background: '#1a1a2e'
  })
  const [banners, setBanners] = useState<Banner[]>([])
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false)
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('saturn' as BackgroundType)
//  const [avatarShape, setAvatarShape] = useState('circle')
  const [isFollowing, setIsFollowing] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showBlogsBox, setShowBlogsBox] = useState(profile?.show_blogs_box ?? true)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [showBookshelf, setShowBookshelf] = useState(profile?.show_bookshelf ?? true)
  const [books, setBooks] = useState<Book[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false)
  const [showVideoBox, setShowVideoBox] = useState(() => {
    // @ts-expect-error: temporary type fix
    return profile?.show_videos_box ?? true
  })
  const [videos, setVideos] = useState<Video[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [isEditVideoDialogOpen, setIsEditVideoDialogOpen] = useState(false)

  // Add theme state
  const [themeState, setThemeState] = useState({
    backgroundType: 'saturn' as BackgroundType,
    primaryColor: '#00ff88',
    pattern: null as Pattern | null,
    patternIntensity: 100,
    colorScheme: null as ColorScheme | null,
    customColors: {
      primary: '#00ff88',
      secondary: '#ff00ff',
      accent: '#00ffff',
      background: '#1a1a2e'
    }
  });

  // Update the section order state initialization
  const [sectionOrder, setSectionOrder] = useState<string[]>([])

  // Update useEffect to initialize section order from profile
  useEffect(() => {
    if (profile) {
      setSectionOrder(profile.section_order || DEFAULT_SECTION_ORDER)
    }
  }, [profile])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return

      console.log('Fetching profile for username:', username)

      // Update the query to include all necessary data
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url,
          bio,
          theme,
          setup_completed,
          created_at,
          points,
          show_social_links,
          vibe,
          status_emoji,
          avatar_shape,
          show_bookshelf,
          section_order,
          social_links (
            id,
            platform,
            url,
            label
          ),
          timeline_events (
            id,
            type,
            title,
            content,
            created_at,
            event_date
          ),
          achievements (
            id,
            type,
            title,
            description,
            icon,
            awarded_at,
            metadata
          ),
          show_blogs_box,
          show_videos_box
        `)
        .eq('username', username)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        console.log('Fetched profile data:', data)
        // Transform the data to match expected format
        const transformedData = {
          ...data,
          social_links: data.social_links || [],
          timeline_events: data.timeline_events || [],
          achievements: data.achievements || [],
          section_order: data.section_order || DEFAULT_SECTION_ORDER
        }
        // @ts-expect-error: This is a temporary fix to allow the form data to be updated
        setProfile(transformedData)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [username])

  useEffect(() => {
    async function loadBanners() {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setBanners(data || [])
      } catch (error) {
        console.error('Error loading banners:', error)
      }
    }

    loadBanners()
  }, [])

  // Check follow status on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user?.id || !profile?.id || isOwnProfile) return

      try {
        const { data, error } = await supabase
          .from('follows')
          .select()
          .match({
            follower_id: user.id,
            following_id: profile.id
          })
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking follow status:', error)
          return
        }

        setIsFollowing(!!data)
      } catch (err) {
        console.error('Failed to check follow status:', err)
      }
    }

    checkFollowStatus()
  }, [user?.id, profile?.id, isOwnProfile])


  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      // Show preview immediately
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)

      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-avatar.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id)

      if (updateError) throw updateError

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      // Reset preview on error
      setAvatarPreview(null)
    }
  }
  const handleCaptureNow = () => {
    setIsBottomSheetOpen(false)
    // TODO: Implement capture functionality
  }

  const handleShareAlbum = () => {
    setIsBottomSheetOpen(false)
    // TODO: Implement album sharing
  }

  const handleWriteQuote = () => {
    setIsBottomSheetOpen(false)
    setIsQuoteDialogOpen(true)
  }


  const handlePatternSelect = async (pattern: Pattern | null) => {
    setSelectedPattern(pattern)
    if (pattern) {
      setPatternIntensity(pattern.intensity?.default || 100)
      setActivePattern({
        ...pattern,
        css: {
          ...pattern.css,
          backgroundSize: pattern.css.backgroundSize?.replace(
            /\d+px/g, 
            `${pattern.intensity?.default || 100}${pattern.intensity?.unit || 'px'}`
          )
        }
      })
    } else {
      setActivePattern(null)
      setPatternIntensity(100)
    }
  }

  const handleIntensityChange = (value: number) => {
    if (!selectedPattern) return
    
    setPatternIntensity(value)
    const updatedPattern = {
      ...selectedPattern,
      css: {
        ...selectedPattern.css,
        backgroundSize: selectedPattern.css.backgroundSize?.replace(
          /\d+px/g, 
          `${value}${selectedPattern.intensity?.unit || 'px'}`
        )
      }
    }
    setActivePattern(updatedPattern)
  }

  const handleApplyPattern = async () => {
    try {
      const updatedTheme = {
        ...themeState,
        backgroundType: 'pattern',
        pattern: selectedPattern?.id || null,
        patternIntensity
      };

      const { error } = await supabase
        .from('profiles')
        .update({ 
          theme: updatedTheme,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Update local state
      setThemeState({
        ...themeState,
        backgroundType: 'pattern',
        pattern: selectedPattern,
        patternIntensity
      });
      setActivePattern(selectedPattern);
      setBackgroundType('pattern');
      setIsCustomizeSheetOpen(false);
    } catch (error) {
      console.error('Error applying pattern:', error);
    }
  };

  const handleSchemeSelect = (scheme: ColorScheme) => {
    setSelectedScheme(scheme)
    // Immediately update the theme state with the new colors
    setThemeState(prev => ({
      ...prev,
      customColors: {
        primary: scheme.colors.primary,
        secondary: scheme.colors.secondary,
        accent: scheme.colors.accent,
        background: scheme.colors.background
      }
    }))
  }

  const handleApplyColorScheme = async () => {
    if (!selectedScheme || !user) return

    try {
      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update({
          theme: {
            // @ts-expect-error: This is a temporary fix to allow the form data to be updated
            ...profile?.theme,
            colorScheme: selectedScheme.id,
            customColors: selectedScheme.colors
          }
        })
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        theme: {
          // @ts-expect-error: This is a temporary fix to allow the form data to be updated
          ...prev.theme,
          colorScheme: selectedScheme.id,
          customColors: selectedScheme.colors
        }
      } : null)

      // Close the customization sheet
      setIsCustomizeSheetOpen(false)
    } catch (error) {
      console.error('Error applying color scheme:', error)
    }
  };

  const handleCustomColorChange = (type: 'primary' | 'background', color: string) => {
    setCustomColors(prev => ({
      ...prev,
      [type]: color
    }))

    // Update active pattern if exists
    if (activePattern) {
      const updatedPattern = {
        ...activePattern,
        css: {
          ...activePattern.css,
          backgroundColor: type === 'background' ? color : activePattern.css.backgroundColor,
          backgroundImage: type === 'primary' 
            ? activePattern.css.backgroundImage?.replace(/#[0-9A-F]{6}/gi, color)
            : activePattern.css.backgroundImage
        }
      }
      setActivePattern(updatedPattern)
    }
  }
/*
  const handleBannerUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`
      const filePath = fileName

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath)

      // Add to banners array
      const newBanner: Banner = {
        id: fileName,
        url: publicUrl,
        position: 'top'
      }

      const updatedBanners = [...banners, newBanner]
      setBanners(updatedBanners)

      // Save to profile
      await supabase
        .from('profiles')
        .update({ 
          theme: {
             @ts-expect-error: This is a temporary fix to allow the form data to be updated
            ...profile?.theme,
            banners: updatedBanners
          }
        })
        .eq('id', user?.id)

    } catch (error) {
      console.error('Error uploading banner:', error)
    }
  }*/

  const handleQuoteSubmit = async ({ text }: { text: string }) => {
    try {
      const event = {
        type: 'quote',
        title: 'Shared a Quote',
        description: text,
        content: {
          quote: text,
          author: profile.username
        },
        event_date: new Date().toISOString()
      }

      const { error } = await supabase
        .from('timeline_events')
        .insert([{
          ...event,
          user_id: user?.id,
          profile_id: user?.id
        }])

      if (error) throw error

      // Update local state
      // @ts-expect-error: This is a temporary fix to allow the form data to be updated
      setProfile(prev => prev ? {
        ...prev,
        timeline_events: [
          { id: Date.now().toString(), ...event },
          ...(prev.timeline_events || [])
        ]
      } : null)

    } catch (error) {
      console.error('Error posting quote:', error)
    }
  }


  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any active game or WebGL context
      if (backgroundType === 'racing' || backgroundType === 'fantasy') {
        setIsGameMode(false)
      }
    }
  }, [])

  const handleSocialLinksChange = (newLinks: SocialLink[]) => {
    setProfile(prev => prev ? { ...prev, social_links: newLinks } : null)
  }

  const handleFollowAction = async () => {
    if (!user?.id || !profile?.id) return
    setLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({
            follower_id: user.id,
            following_id: profile.id
          })

        if (error) throw error
        setIsFollowing(false)
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id
          })

        if (error) throw error
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Follow action error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageAction = async () => {
    if (!user?.id || !profile?.id) return

    try {
      // Check if conversation exists
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'direct')
        .contains('participant_ids', [user.id, profile.id])

      if (existingConvs && existingConvs.length > 0) {
        navigate(`/messages/${existingConvs[0].id}`)
        return
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          participant_ids: [user.id, profile.id],
          metadata: {
            created_by: user.id,
            created_at: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (error) throw error
      if (!newConv) throw new Error('No conversation created')

      navigate(`/messages/${newConv.id}`)
    } catch (error) {
      console.error('Message action error:', error)
    }
  }

  const handleSetEmoji = async (emoji: string) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status_emoji: emoji,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, status_emoji: emoji } : null)
      setShowEmojiPicker(false)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Add this function to handle avatar shape updates
  const handleAvatarShapeChange = async (newShape: string) => {
    if (!user || !isOwnProfile) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_shape: newShape,
        })
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_shape: newShape } : null)
      // setAvatarShape(newShape)
      setCustomizationView('menu')
    } catch (error) {
      console.error('Error updating avatar shape:', error)
    }
  }

  const GameModeToggle = () => (
    (backgroundType === 'racing' || backgroundType === 'fantasy') ? (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsGameMode(!isGameMode)}
        className="fixed bottom-20 right-6 z-50 p-4 rounded-full shadow-lg 
                 backdrop-blur-sm flex items-center gap-2"
        style={{ 
          backgroundColor: `${selectedScheme?.colors?.primary || customColors.primary}20`,
          border: `1px solid ${selectedScheme?.colors?.primary || customColors.primary}40`
        }}
      >
        {isGameMode ? (
          <>
            <FiUser className="w-5 h-5" style={{ color: selectedScheme?.colors?.primary || customColors.primary }} />
            <span className="text-white">View Profile</span>
          </>
        ) : (
          <>
            <FiPlay className="w-5 h-5" style={{ color: selectedScheme?.colors?.primary || customColors.primary }} />
            <span className="text-white">Play Game</span>
          </>
        )}
      </motion.button>
    ) : null
  )

  // Update theme loading effect
  useEffect(() => {
    const loadTheme = async () => {
      if (!user?.id) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('theme')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile?.theme) {
          const theme = profile.theme;
          
          // Update theme state
          setThemeState(prev => ({
            ...prev,
            backgroundType: theme.background || 'saturn',
            pattern: theme.pattern ? patterns.find(p => p.id === theme.pattern) || null : null,
            patternIntensity: theme.patternIntensity || 100,
            colorScheme: theme.colorScheme ? colorSchemes.find(s => s.id === theme.colorScheme) || null : null,
            customColors: theme.customColors || prev.customColors,
            primaryColor: theme.customColors?.primary || prev.primaryColor
          }));

          // Update related states
          setBackgroundType(theme.background || 'saturn');
          if (theme.pattern) {
            const pattern = patterns.find(p => p.id === theme.pattern);
            setSelectedPattern(pattern || null);
            setActivePattern(pattern || null);
            setPatternIntensity(theme.patternIntensity || 100);
          }
          if (theme.colorScheme) {
            const scheme = colorSchemes.find(s => s.id === theme.colorScheme);
            setSelectedScheme(scheme || null);
          }
          if (theme.customColors) {
            setCustomColors(theme.customColors);
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, [user?.id]);

  // Add effect to initialize avatar shape when profile loads
  useEffect(() => {
    if (profile?.avatar_shape) {
//      setAvatarShape(profile.avatar_shape)
    }
  }, [profile])

  const handleBlogsBoxToggle = async () => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          show_blogs_box: !showBlogsBox,
        })
        .eq('id', user.id)

      if (error) throw error
      setShowBlogsBox(!showBlogsBox)
      setProfile(prev => prev ? { ...prev, show_blogs_box: !showBlogsBox } : null)
    } catch (error) {
      console.error('Error updating blogs box visibility:', error)
    }
  }

  // Add effect to fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      if (!profile?.id) return
      
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('id, title, content, created_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) throw error
        setBlogPosts(data || [])
      } catch (error) {
        console.error('Error fetching blog posts:', error)
      } finally {
        setLoadingPosts(false)
      }
    }

    fetchBlogPosts()
  }, [profile?.id])

  /*
  // Add handler for order changes
  const handleOrderChange = async (newOrder: string[]) => {
    if (!user?.id || !isOwnProfile) return
    
    try {
      // Ensure bookshelf is included in the order
      const updatedOrder = newOrder.includes('bookshelf') 
        ? newOrder 
        : [...newOrder, 'bookshelf']

      // First update local state for immediate UI update
      setSectionOrder(updatedOrder)
      
      // Convert array to JSONB format for Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          section_order: updatedOrder // Supabase will automatically handle the conversion
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating section order:', error)
        // Revert to previous order if update fails
        setSectionOrder(profile?.section_order || DEFAULT_SECTION_ORDER)
        return
      }

      // Update profile state
      setProfile(prev => prev ? {
        ...prev,
        section_order: updatedOrder
      } : null)

    } catch (error) {
      console.error('Error updating section order:', error)
      // Revert to previous order if update fails
      setSectionOrder(profile?.section_order || DEFAULT_SECTION_ORDER)
    }
  }
  */

  // Add effect to fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      if (!profile?.id) return
      
      try {
        const { data, error } = await supabase
          .from('favorite_books')
          .select('*')
          .eq('user_id', profile.id)
          .order('added_at', { ascending: false })

        if (error) throw error
        setBooks(data || [])
      } catch (error) {
        console.error('Error fetching books:', error)
      } finally {
        setLoadingBooks(false)
      }
    }

    fetchBooks()
  }, [profile?.id])

  // Add handler for bookshelf toggle
  const handleBookshelfToggle = async () => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          show_bookshelf: !showBookshelf,
        })
        .eq('id', user.id)

      if (error) throw error
      setShowBookshelf(!showBookshelf)
      setProfile(prev => prev ? { ...prev, show_bookshelf: !showBookshelf } : null)
    } catch (error) {
      console.error('Error updating bookshelf visibility:', error)
    }
  }

  // Add handler for adding books
  const handleAddBook = async (bookData: Omit<Book, 'id' | 'added_at'>) => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('favorite_books')
        .insert({
          user_id: user.id,
          ...bookData
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      setBooks(prev => [data, ...prev])
    } catch (error) {
      console.error('Error adding book:', error)
    }
  }

  // Add effect to load saved theme on profile load
  useEffect(() => {
    if (profile?.theme) {
      const theme = profile.theme
      // @ts-expect-error: This is a temporary fix to allow the form data to be updated
      if (theme.colorScheme ) {
        // @ts-expect-error: This is a temporary fix to allow the form data to be updated
        const savedScheme = colorSchemes.find(s => s.id === theme.colorScheme)
        if (savedScheme) {
          setSelectedScheme(savedScheme)
          // @ts-expect-error: This is a temporary fix to allow the form data to be updated
          setThemeState(prev => ({
            ...prev,
            customColors: customColors || savedScheme.colors
          }))
        }
      }
    }
  }, [profile?.theme])

  // Add handler for video box toggle
  const handleVideoBoxToggle = async () => {
    try {
      const newShowVideoBox = !showVideoBox
      setShowVideoBox(newShowVideoBox)

      const { error } = await supabase
        .from('profiles')
        .update({ 
          widgets: {
            // @ts-expect-error: temporary type fix
            ...profile?.widgets,
            showVideoBox: newShowVideoBox
          }
        })
        .eq('id', user?.id)

      if (error) throw error

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        widgets: {
          // @ts-expect-error: temporary type fix
          ...prev.widgets,
          showVideoBox: newShowVideoBox
        }
      } : null)

    } catch (error) {
      console.error('Error updating video box visibility:', error)
      setShowVideoBox(!showVideoBox) // Revert on error
    }
  }

  // Add effect to fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      if (!profile?.id) return
      
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', profile.id)
          .order('added_at', { ascending: false })

        if (error) throw error
        setVideos(data || [])
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoadingVideos(false)
      }
    }

    fetchVideos()
  }, [profile?.id])

  // Add video handler function
  const handleAddVideo = async (videoData: Omit<Video, 'id' | 'user_id' | 'added_at'>) => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          ...videoData
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      setVideos(prev => [data, ...prev])
      setIsAddVideoDialogOpen(false)
    } catch (error) {
      console.error('Error adding video:', error)
    }
  }

  // Add handlers for video operations
  const handleEditVideo = (video: Video) => {
    setEditingVideo(video)
    setIsEditVideoDialogOpen(true)
  }

  const handleUpdateVideo = async (videoId: string, data: Partial<Video>) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update(data)
        .eq('id', videoId)

      if (error) throw error

      // Update local state
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, ...data } : v
      ))
      setIsEditVideoDialogOpen(false)
      setEditingVideo(null)
    } catch (error) {
      console.error('Error updating video:', error)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (error) throw error

      // Update local state
      setVideos(prev => prev.filter(v => v.id !== videoId))
    } catch (error) {
      console.error('Error deleting video:', error)
    }
  }

  // Add handler for reorder
  const handleReorder = async (newOrder: string[]) => {
    setSectionOrder(newOrder)
    
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            section_order: newOrder,
            theme: {
                // @ts-expect-error: This is a temporary fix to allow the form data to be updated
              ...profile?.theme,
              section_order: newOrder
            }
          })
          .eq('id', user.id)

        if (error) throw error
      } catch (err) {
        console.error('Error saving section order:', err)
        // Revert to previous order on error
        setSectionOrder(profile?.section_order || DEFAULT_SECTION_ORDER)
      }
    }
  }

  // Helper function to render section content
  const renderSection = (section: string) => {
    switch(section) {
      case 'blogs':
        return (profile?.show_blogs_box && (isOwnProfile || (blogPosts.length > 0))) && (
          <DraggableSection 
            value="blogs" 
            isOwnProfile={isOwnProfile}
            isDraggable={false}
          >
                        <BlogsBox
                          posts={blogPosts}
                          isLoading={loadingPosts}
                          primaryColor={themeState.customColors.primary}
                          username={profile.username}
                        />
                      </DraggableSection>
        )

      case 'social':
        return (profile?.show_social_links || isOwnProfile) && profile?.id && (
          <DraggableSection 
            value="social" 
            isOwnProfile={isOwnProfile}
            isDraggable={false}
          >
                        <SocialLinksCard
                          links={profile.social_links || []}
                          isEditable={isOwnProfile}
                          userId={profile.id}
                          primaryColor={themeState.customColors.primary}
                          onLinksChange={handleSocialLinksChange}
                        />
                      </DraggableSection>
        )

      case 'timeline':
        return (
          <DraggableSection 
            value="timeline" 
            isOwnProfile={isOwnProfile}
            isDraggable={false}
          >
                        <TimelineList
                          authorName={profile?.username}
              // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                          events={[
                            // Only show registration achievement if there are no other achievements
                            ...(profile?.achievements?.length === 0 ? [{
                              id: 'registration',
                              type: 'achievement',
                              title: 'MineBox Pioneer',
                              description: 'Joined the MineBox universe and started your journey',
                              content: 'Joined the MineBox universe and started your journey',
                              icon: '🏆',
                              created_at: profile.created_at,
                              metadata: {
                                achievementType: 'registration',
                                color: 'purple',
                                rarity: 'common',
                                points: 35
                              }
                            }] : []),
                            
                            // Map achievements
                            ...(profile?.achievements || []).map(achievement => ({
                              id: achievement.id,
                              type: 'achievement',
                              title: achievement.title,
                              description: achievement.description,
                              content: achievement.description || achievement.title,
                              icon: achievement.icon,
                              created_at: achievement.awarded_at,
                              metadata: {
                                ...achievement.metadata,
                                achievementType: achievement.type,
                                icon: achievement.icon
                              }
                            })),

                            // Map timeline events
                            ...(profile?.timeline_events || []).map(event => ({
                              id: event.id,
                              type: event.type,
                              title: event.title,
                              description: event.description,
                              // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                              content: (event.content !== null && typeof event.content === 'object' && 'text' in event.content || 'quote' in event.content) 
                              // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                                ? event.content.text || event.content.quote || event.description 
                                : event.content,
                              created_at: event.created_at,
                              event_date: event.event_date,
                              metadata: event.metadata
                            }))
              ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())}
                          primaryColor={themeState.customColors.primary}
                          isOwnProfile={isOwnProfile}
                          points={profile?.points || 0}
                        />
                      </DraggableSection>
        )

      case 'bookshelf':
        return (profile?.show_bookshelf && ( isOwnProfile || (books.length > 0))) && (
          <DraggableSection 
            value="bookshelf" 
            isOwnProfile={isOwnProfile}
            isDraggable={false}
          >
                        <BookshelfBox
                          books={books}
                          isLoading={loadingBooks}
                          primaryColor={themeState.customColors.primary}
                          isOwnProfile={isOwnProfile}
                          onAddBook={() => setIsAddBookDialogOpen(true)}
                        />
                      </DraggableSection>
        )

      case 'videos':
        return showVideoBox && (
          <DraggableSection 
            value="videos" 
            isOwnProfile={isOwnProfile}
            isDraggable={false}
          >
            <VideoBox
              videos={videos}
              isLoading={loadingVideos}
              primaryColor={themeState.customColors.primary}
              isOwnProfile={isOwnProfile}
              onEditVideo={handleEditVideo}
              onDeleteVideo={handleDeleteVideo}
              onAddVideo={() => setIsAddVideoDialogOpen(true)}
            />
          </DraggableSection>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <>
        <MetaTags title="Loading..." />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <MetaTags title="Profile Not Found" description="This profile doesn't exist or has been removed." />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-2xl">Profile not found</div>
        </div>
      </>
    )
  }

  return (
    <>
      <MetaTags 
        title={`${profile.username}'s Profile`}
        description={profile.bio || `Check out ${profile.username}'s profile on MineBox`}
        image={profile.avatar_url || '/default-avatar.png'}
        username={profile.username}
      />
      
      {/* Hide MainNav in game mode */}
      {!isGameMode && <MainNav />}
      
      <div className="min-h-screen md:pl-20">
        <ThemedBackground
          type={themeState.backgroundType as BackgroundType}
          pattern={{
            backgroundColor: themeState.customColors.primary,
            backgroundImage: themeState.pattern?.css.backgroundImage,
            backgroundSize: themeState.pattern?.css.backgroundSize,
          }}
          userColor={themeState.customColors.primary}
          isGameMode={isGameMode}
        >
          {/* Main profile content - hidden in game mode */}
          <div 
            className={`transition-all duration-300 ${
              isGameMode 
                ? 'opacity-0 pointer-events-none' 
                : 'opacity-100'
            }`}
          >
            <div className="container mx-auto px-4 pt-8 md:pt-12 pb-24 md:pb-12">
              <ProfileHeader 
                // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                profile={profile}
                isOwnProfile={isOwnProfile}
                avatarPreview={avatarPreview}
                handleAvatarUpload={handleAvatarUpload}
                setIsBottomSheetOpen={setIsBottomSheetOpen}
                primaryColor={themeState.customColors.primary}
                secondaryColor={themeState.customColors.secondary}
                accentColor={themeState.customColors.accent}
                onFollowAction={handleFollowAction}
                onMessageAction={handleMessageAction}
                isFollowing={isFollowing}
                loading={loading}
                onEmojiClick={() => setShowEmojiPicker(true)}
              />

              {isOwnProfile ? (
                <Reorder.Group 
                  axis="y" 
                  values={sectionOrder} 
                  onReorder={handleReorder}
                  className="space-y-6 mt-6"
                  as="div"
                >
                  {sectionOrder.map((section) => (
                    <Reorder.Item
                      key={section}
                      value={section}
                      as="div"
                    >
                      {renderSection(section)}
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              ) : (
                // Regular div for non-owners
                <div className="space-y-6 mt-6">
                  {sectionOrder.map((section) => (
                    <div key={section}>
                      {renderSection(section)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isOwnProfile && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCustomizeSheetOpen(true)}
          className="fixed right-6 bottom-20 md:bottom-6 w-14 h-14 rounded-full
                   shadow-lg flex items-center justify-center transition-colors z-40"
          style={{
            backgroundColor: themeState.customColors.primary,
            boxShadow: `0 10px 15px -3px ${themeState.customColors.primary}20`
          }}
        >
          <FiSettings className="w-6 h-6 text-white" />
        </motion.button>
      )}          {/* Game Mode Toggle */}
          <GameModeToggle />

          {/* Game UI */}
          {isGameMode && (themeState.backgroundType !== 'fantasy') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-40"
            >
              {/* Game HUD */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 
                           bg-black/50 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4">
                <div className="text-white">
                  <div className="text-sm opacity-60">High Score</div>
                  <div className="text-2xl font-bold">0</div>
                </div>
                <div className="text-white">
                  <div className="text-sm opacity-60">Current Score</div>
                  <div className="text-2xl font-bold">0</div>
                </div>
              </div>

              {/* Game Controls Help */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 
                           bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white text-center">
                <p className="font-medium mb-2">Controls</p>
                <p className="text-sm opacity-70">
                  ↑ or W: Accelerate<br />
                  ↓ or S: Brake<br />
                  ← or A: Turn Left<br />
                  �� or D: Turn Right
                </p>
              </div>
            </motion.div>
          )}

          {/* Bottom sheets and other UI elements */}
          <BottomSheet 
            isOpen={isBottomSheetOpen}
            height="50vh"
            onClose={() => setIsBottomSheetOpen(false)}
          >
            <div className="grid grid-cols-4 gap-4">
              <PostOption 
                icon={FiCamera} 
                label="Capture Now" 
                onClick={handleCaptureNow} 
              />
              <PostOption 
                icon={FiImage} 
                label="Share Album" 
                onClick={handleShareAlbum} 
              />
              <PostOption 
                icon={FiMessageSquare} 
                label="Write Quote" 
                onClick={handleWriteQuote} 
              />
              <PostOption 
                icon={FiFeather} 
                label="Write Blog" 
                onClick={() => navigate('/blog/new')} 
              />
            </div>
          </BottomSheet>

          <BottomSheet 
            isOpen={isCustomizeSheetOpen} 
            onClose={() => {
              setIsCustomizeSheetOpen(false)
              setCustomizationView('menu')
              // @ts-expect-error: This is a temporary fix to allow the form data to be updated
              if (profile?.theme?.pattern) {
                // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                const savedPattern = patterns.find(p => p.id === profile.theme.pattern)
                setActivePattern(savedPattern || null)
                setPatternIntensity(savedPattern?.intensity?.default || 100)
              } else {
                setActivePattern(null)
              }
            }}
            className="md:max-w-[70%] mx-auto"
          >
            {customizationView === 'menu' ? (
              <>
                <h3 className="text-xl font-bold text-white mb-6 text-center">
                  Customize Your Box
                </h3>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCustomizationView('backgrounds')}
                    className="w-full p-4 bg-black/30 rounded-lg border 
                             hover:bg-opacity-20 transition-colors flex items-center justify-between"
                    style={{ 
                      borderColor: `${themeState.customColors.primary}20`,
                      backgroundColor: `${themeState.customColors.primary}10`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <FiBox 
                        className="w-5 h-5"
                        style={{ color: themeState.customColors.primary }}
                      />
                      <span className="text-white font-medium">Set Background Type</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {themeState.backgroundType === 'saturn' as BackgroundType ? 'Saturn' : 
                       themeState.backgroundType === 'scene3d-war' as BackgroundType ? 'War Scene' :
                       themeState.backgroundType === 'pattern' as BackgroundType ? 'Pattern' :
                       themeState.backgroundType === 'particles' as BackgroundType ? 'Particles' : 
                       themeState.backgroundType === 'waves' as BackgroundType ? 'Waves' :
                       themeState.backgroundType === 'heartbeat' as BackgroundType ? 'Heartbeat' :
                       themeState.backgroundType === 'space' as BackgroundType ? 'Space' :
                       themeState.backgroundType === 'fantasy' as BackgroundType ? 'Fantasy' :
                       themeState.backgroundType === 'racing' as BackgroundType ? 'Racing' : 'Default'}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCustomizationView('banners')}
                    className="w-full p-4 bg-black/30 rounded-lg border 
                             hover:bg-opacity-20 transition-colors flex items-center justify-between"
                    style={{ 
                      borderColor: `${themeState.customColors.primary}20`,
                      backgroundColor: `${themeState.customColors.primary}10`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <FiLayout 
                        className="w-5 h-5"
                        style={{ color: themeState.customColors.primary }}
                      />
                      <span className="text-white font-medium">Set Profile Banner</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {/* @ts-expect-error: This is a temporary fix to allow the form data to be updated */}
                      {profile?.banner_id ? 'Custom' : 'Default'}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCustomizationView('colors')}
                    className="w-full p-4 bg-black/30 rounded-lg border 
                             hover:bg-opacity-20 transition-colors flex items-center justify-between"
                    style={{ 
                      borderColor: `${themeState.customColors.primary}20`,
                      backgroundColor: `${themeState.customColors.primary}10`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <FiDroplet 
                        className="w-5 h-5"
                        style={{ color: themeState.customColors.primary }}
                      />
                      <span className="text-white font-medium">Set Color Scheme</span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCustomizationView('avatar-shape')}
                    className="w-full p-4 bg-black/30 rounded-lg border 
                             hover:bg-opacity-20 transition-colors flex items-center justify-between"
                    style={{ 
                      borderColor: `${themeState.customColors.primary}20`,
                      backgroundColor: `${themeState.customColors.primary}10`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <FiCircle 
                        className="w-5 h-5"
                        style={{ color: themeState.customColors.primary }}
                      />
                      <span className="text-white font-medium">Set Avatar Shape</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {profile?.avatar_shape || 'Circle'}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCustomizationView('widgets')}
                    className="w-full p-4 bg-black/30 rounded-lg border 
                              hover:bg-opacity-20 transition-colors flex items-center justify-between"
                    style={{ 
                      borderColor: `${themeState.customColors.primary}20`,
                      backgroundColor: `${themeState.customColors.primary}10`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <FiLayout 
                        className="w-5 h-5"
                        style={{ color: themeState.customColors.primary }}
                      />
                      <span className="text-white font-medium">Customize Widgets</span>
                    </div>
                  </motion.button>
                </div>
              </>
            ) : customizationView === 'patterns' ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setCustomizationView('menu')}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiArrowLeft className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold text-white text-center flex-1">
                    Choose Pattern
                  </h3>
                </div>
                
                <PatternsView 
                  backgroundType='pattern'
                  selectedPattern={selectedPattern}
                  onPatternSelect={handlePatternSelect}
                  patternIntensity={patternIntensity}
                  onIntensityChange={handleIntensityChange}
                />
                
                {selectedPattern ? (
                  <div className="mt-6 flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleApplyPattern()
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium
                               hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <FiSave className="w-4 h-4" />
                      Save Pattern
                    </motion.button>
                  </div>
                ) : (
                  <div className="mt-6 flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleApplyPattern()
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium
                               hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <FiSave className="w-4 h-4" />
                      Remove Pattern
                    </motion.button>
                  </div>
                )}
              </>
            ) : customizationView === 'banners' ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setCustomizationView('menu')}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiArrowLeft className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold text-white text-center flex-1">
                    Choose Banner
                  </h3>
                </div>
                
                <BannerView 
                  // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                  selectedBanner={banners.find(b => b.id === profile?.banner_id)}
                  onBannerSelect={async (banner) => {
                    try {
                      // Update profile in database
                      const { error } = await supabase
                      .from('profiles')
                      .update({ 
                          banner_id: banner.id
                      })
                      .eq('id', user?.id)

                      if (error) throw error

                      // Update local state
                      setProfile(prev => prev ? {
                        ...prev,
                        banner_id: banner.id
                      } : null)
                      
                      setCustomizationView('menu')
                    } catch (error) {
                      console.error('Error updating banner:', error)
                    }
                  }}
                  primaryColor={themeState.customColors.primary}
                />
              </>
            ) : customizationView === 'avatar-shape' ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setCustomizationView('menu')}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiArrowLeft className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold text-white text-center flex-1">
                    Choose Avatar Shape
                  </h3>
                </div>
                
                <AvatarShapeSelector
                  selectedShape={profile?.avatar_shape || 'circle'}
                  onShapeSelect={handleAvatarShapeChange}
                  primaryColor={themeState.customColors.primary}
                />
              </>
            ) : customizationView === 'widgets' ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setCustomizationView('menu')}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiArrowLeft className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold text-white text-center flex-1">
                    Customize Widgets
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border"
                       style={{ borderColor: `${themeState.customColors.primary}20` }}>
                    <div className="flex items-center gap-3">
                      <FiFeather 
                        className="w-5 h-5"
                        style={{ color: themeState.customColors.primary }}
                      />
                      <span className="text-white font-medium">Show Blogs Box</span>
                    </div>
                    <button
                      onClick={handleBlogsBoxToggle}
                      className={`w-12 h-6 rounded-full transition-colors relative
                                 ${showBlogsBox ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all
                                      ${showBlogsBox ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border"
                       style={{ borderColor: `${themeState.customColors.primary}20` }}>
                    <div className="flex items-center gap-3">
                      <FiBook 
                        className="w-5 h-5"
                        style={{ color: themeState.customColors.primary }}
                      />
                      <span className="text-white font-medium">Show Bookshelf</span>
                    </div>
                    <button
                      onClick={handleBookshelfToggle}
                      className={`w-12 h-6 rounded-full transition-colors relative
                                 ${showBookshelf ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all
                                      ${showBookshelf ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border"
                       style={{ borderColor: `${themeState.customColors.primary}20` }}>
                    <div className="flex items-center gap-3">
                      <FiVideo 
                        className="w-5 h-5"
                        style={{ color: themeState.customColors.primary }}
                      />
                      <span className="text-white font-medium">Show Video Box</span>
                    </div>
                    <button
                      onClick={handleVideoBoxToggle}
                      className={`w-12 h-6 rounded-full transition-colors relative
                                 ${showVideoBox ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all
                                      ${showVideoBox ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </>
            ) : customizationView === 'backgrounds' ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setCustomizationView('menu')}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiArrowLeft className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold text-white text-center flex-1">
                    Choose Background
                  </h3>
                </div>

                {/* Group backgrounds by category */}
                {['3D Scenes', 'Abstract', 'Interactive'].map(category => (
                  <div key={category} className="mb-8">
                    <h4 className="text-sm font-medium text-gray-400 mb-4">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {backgroundOptions
                        .filter(option => option.category === category)
                        .map(option => (
                          <motion.button
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setThemeState(prev => ({
                                ...prev,
                                backgroundType: option.id as BackgroundType
                              }))
                              if (user) {
                                supabase
                                  .from('profiles')
                                  .update({
                                    theme: {
                                      // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                                      ...(profile?.theme as ThemeState || {}),
                                      background: option.id
                                    }
                                  })
                                  .eq('id', user.id)
                                  .then(({ error }) => {
                                    if (error) console.error('Error updating background:', error)
                                  })
                              }
                            }}
                            className={`relative rounded-xl overflow-hidden p-4 
                                      transition-all duration-200 bg-black/20 backdrop-blur-sm
                                      border ${
                      themeState.backgroundType === option.id 
                        ? 'border-2 border-white ring-2 ring-white/20' 
                        : 'border-white/10 hover:border-white/30'
                    }`}
                            style={{ 
                              background: themeState.backgroundType === option.id
                                ? `linear-gradient(45deg, 
                                    ${themeState.customColors.primary}20, 
                                    ${themeState.customColors.secondary}20
                                  )`
                                : 'rgba(0,0,0,0.2)',
                              boxShadow: themeState.backgroundType === option.id 
                                ? `0 0 20px ${themeState.customColors.primary}40` 
                                : 'none'
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                themeState.backgroundType === option.id
                                  ? 'bg-white/10'
                                  : 'bg-black/20'
                              }`}>
                                <option.icon 
                                  className="w-6 h-6"
                                  style={{ 
                                    color: themeState.backgroundType === option.id
                                      ? themeState.customColors.primary
                                      : '#fff' 
                                  }}
                                />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="text-sm font-medium text-white block">
                                  {option.label}
                                </span>
                                <span className="text-xs text-gray-400 mt-1 block">
                                  {option.description}
                                </span>
                              </div>
                            </div>

                            {themeState.backgroundType === option.id && (
                              <div className="absolute top-2 right-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
                              </div>
                            )}

                          </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : customizationView === 'colors' ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setCustomizationView('menu')}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiArrowLeft className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold text-white text-center flex-1">
                    Choose Color Scheme
                  </h3>
                </div>
                
                <ColorSchemeView 
                  selectedScheme={selectedScheme}
                  onSchemeSelect={handleSchemeSelect}
                  customColors={themeState.customColors}
                  onCustomColorChange={handleCustomColorChange}
                />
                
                {selectedScheme && (
                  <div className="mt-6 flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleApplyColorScheme}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium
                               hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <FiSave className="w-4 h-4" />
                      Apply Colors
                    </motion.button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setCustomizationView('menu')}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiArrowLeft className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold text-white text-center flex-1">
                    Choose Color Scheme
                  </h3>
                </div>
                
                <ColorSchemeView 
                  selectedScheme={selectedScheme}
                  onSchemeSelect={handleSchemeSelect}
                  customColors={themeState.customColors}
                  onCustomColorChange={handleCustomColorChange}
                />
                
                {selectedScheme && (
                  <div className="mt-6 flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleApplyColorScheme}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium
                               hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <FiSave className="w-4 h-4" />
                      Apply Colors
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </BottomSheet>

          <QuoteDialog 
            isOpen={isQuoteDialogOpen}
            onClose={() => setIsQuoteDialogOpen(false)}
            onSubmit={handleQuoteSubmit}
            primaryColor={themeState.customColors.primary}
          />

          <BottomSheet
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
          >
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-4">Set Status Emoji</h3>
              <div className="grid grid-cols-6 gap-3">
                {SUPPORTED_EMOJIS.map(emoji => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSetEmoji(emoji)}
                    className="p-2 rounded-lg hover:bg-white/5 flex items-center justify-center
                             bg-black/20 backdrop-blur-sm"
                  >
                    <ReactEmojis
                      // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                      emoji={emoji}
                      emojiStyle="1"
                      style={{ height: 32, width: 32 }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          </BottomSheet>

          <AddBookDialog
            isOpen={isAddBookDialogOpen}
            onClose={() => setIsAddBookDialogOpen(false)}
            onAddBook={handleAddBook}
            primaryColor={themeState.customColors.primary}
          />

          <AddVideoDialog
            isOpen={isAddVideoDialogOpen}
            onClose={() => setIsAddVideoDialogOpen(false)}
            onAddVideo={handleAddVideo}
            primaryColor={themeState.customColors.primary}
          />

          <EditVideoDialog
            isOpen={isEditVideoDialogOpen}
            onClose={() => {
              setIsEditVideoDialogOpen(false)
              setEditingVideo(null)
            }}
            onSave={handleUpdateVideo}
            video={editingVideo}
            primaryColor={themeState.customColors.primary}
          />
        </ThemedBackground>
      </div>
    </>
  )
} 