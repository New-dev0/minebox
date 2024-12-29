import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiRefreshCw, FiTrendingUp, FiVideo, FiBookOpen, FiGlobe, FiUser, FiClock, FiHeart, FiEdit3, FiPlus, FiCamera, FiImage, FiMessageSquare, FiFeather } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import MainNav from '../../components/navigation/MainNav'
import BottomNav from '../../components/navigation/BottomNav'
// import { AnimatedBackground, ParticlesBackground, WavesBackground } from '../../components/backgrounds'
//import WarScene from '../../components/scenes/WarScene'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
// import { patterns } from '../../utils/patterns'
import MetaTags from '../../components/shared/MetaTags'
import { User } from '@supabase/supabase-js'
import BottomSheet from '../../components/shared/BottomSheet'
import QuoteDialog from '../../components/quotes/QuoteDialog'
import { useTheme } from '../../contexts/ThemeContext'

type FeedTab = 'for-you' | 'trending' | 'videos' | 'blogs' | 'news'

type FeedItem = {
  id: string
  type: string
  title: string
  content: {
    title: string
    preview: string
    cover_image: string
  }
  metadata?: {
    blog_id?: string
    tags?: string[]
  }
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
  likes_count?: number
}

interface UserTheme {
  background?: string
  pattern?: string
  patternIntensity?: number
  colorScheme?: string
  customColors?: {
    primary: string
    background: string
    secondary: string
    accent: string
  }
}

// Add PostOption component
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

const tabs = [
  { id: 'for-you', label: 'For You', icon: FiUser },
  { id: 'trending', label: 'Trending', icon: FiTrendingUp },
  { id: 'videos', label: 'Videos', icon: FiVideo },
  { id: 'blogs', label: 'Blogs', icon: FiBookOpen },
  { id: 'news', label: 'News', icon: FiGlobe }
]

export default function FeedsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { customColors } = useTheme()
  const [userTheme, setUserTheme] = useState<UserTheme>()
  const [isLoading, setIsLoading] = useState(true)
  const [feeds, setFeeds] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FeedTab>('blogs')
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false)

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
    if (!user) return
    loadFeeds(activeTab)
  }, [user, activeTab])

  const loadFeeds = async (tab: FeedTab) => {
    try {
      setLoading(true)

      if (tab === 'blogs') {
        // Fetch blogs with author information
        const { data: blogs, error } = await supabase
          .from('blogs')
          .select(`
            id,
            title,
            content,
            cover_image,
            created_at,
            user_id,
            tags
          `)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        // Get unique user IDs from blogs
        const userIds = [...new Set(blogs.map(blog => blog.user_id))]

        // Fetch profiles for all authors in one query
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds)

        // Create a map of user_id to profile data
        const profileMap = profiles?.reduce((acc, profile) => ({
          ...acc,
          [profile.id]: profile
        }), {})

        // Transform blogs into timeline events format
        const blogEvents = blogs.map(blog => ({
          id: blog.id,
          type: 'blog',
          title: 'Published a new blog post',
          content: {
            title: blog.title,
            preview: blog.content.substring(0, 150) + '...',
            cover_image: blog.cover_image
          },
          metadata: {
            blog_id: blog.id,
            tags: blog.tags
          },
          created_at: blog.created_at,
          user_id: blog.user_id,
          profiles: profileMap[blog.user_id]
        }))

        setFeeds(blogEvents)
      } else {
        // Original feed loading logic for other tabs
        let query = supabase
          .from('timeline_events')
          .select('*, profiles(*)')
          .order('created_at', { ascending: false })

        switch (tab) {
          case 'trending':
            query = query.gte('likes_count', 10)
            break
          case 'videos':
            query = query.eq('type', 'video')
            break
          case 'news':
            query = query.eq('type', 'news')
            break
          default:
            // For You tab - personalized feed logic
            break
        }

        const { data, error } = await query.limit(20)
        if (error) throw error
        setFeeds(data || [])
      }
    } catch (error) {
      console.error('Error loading feeds:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add handlers for post options
  const handleCaptureNow = async () => {
    setIsBottomSheetOpen(false)

    try {
      // Create a new timeline event for the capture
      const { error } = await supabase
        .from('timeline_events')
        .insert({
          type: 'capture',
          title: 'Shared a moment',
          content: {
            type: 'capture',
            text: '',
            media_url: '' // This would be filled after media upload
          },
          user_id: user?.id
        })

      if (error) throw error

      // Refresh feeds after posting
      loadFeeds(activeTab)
    } catch (err) {
      console.error('Error creating capture:', err)
    }
  }

  const handleShareAlbum = async () => {
    setIsBottomSheetOpen(false)

    try {
      // Create a new timeline event for the album
      const { error } = await supabase
        .from('timeline_events')
        .insert({
          type: 'album',
          title: 'Shared an album',
          content: {
            type: 'album',
            title: '',
            description: '',
            images: [] // This would be filled after media upload
          },
          user_id: user?.id
        })

      if (error) throw error

      // Refresh feeds after posting
      loadFeeds(activeTab)
    } catch (err) {
      console.error('Error creating album:', err)
    }
  }

  const handleWriteQuote = () => {
    setIsBottomSheetOpen(false)
    setIsQuoteDialogOpen(true)
  }

  const handleQuoteSubmit = async (quote: { text: string, author?: string }) => {
    try {
      const { error } = await supabase
        .from('timeline_events')
        .insert({
          type: 'quote',
          title: 'Shared a quote',
          content: {
            type: 'quote',
            quote: quote.text,
            author: quote.author || 'Unknown'
          },
          user_id: user?.id
        })

      if (error) throw error

      // Close dialog and refresh feeds
      setIsQuoteDialogOpen(false)
      loadFeeds(activeTab)
    } catch (err) {
      console.error('Error posting quote:', err)
    }
  }

  const primaryColor = userTheme?.customColors?.primary || '#8B5CF6'
  const secondaryColor = userTheme?.customColors?.secondary || primaryColor
  const accentColor = userTheme?.customColors?.accent || secondaryColor
//  const backgroundType = userTheme?.background
 // const activePattern = userTheme?.pattern ? patterns.find(p => p.id === userTheme.pattern) : null

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
  return <>
    <MetaTags title="Feed" description="Your personalized feed" />
    <FeedsContent feeds={feeds} loading={loading} activeTab={activeTab} setActiveTab={setActiveTab} loadFeeds={loadFeeds} primaryColor={primaryColor} secondaryColor={secondaryColor} accentColor={accentColor} tabs={tabs} user={user} navigate={navigate} isBottomSheetOpen={isBottomSheetOpen} setIsBottomSheetOpen={setIsBottomSheetOpen} handleCaptureNow={handleCaptureNow} handleShareAlbum={handleShareAlbum} handleWriteQuote={handleWriteQuote} isQuoteDialogOpen={isQuoteDialogOpen} setIsQuoteDialogOpen={setIsQuoteDialogOpen} handleQuoteSubmit={handleQuoteSubmit} customColors={customColors} />
  </>
}
function FeedsContent({
  feeds,
  loading,
  activeTab,
  setActiveTab,
  loadFeeds,
  primaryColor,
  navigate,
  isBottomSheetOpen,
  setIsBottomSheetOpen,
  handleCaptureNow,
  handleShareAlbum,
  handleWriteQuote,
  isQuoteDialogOpen,
  setIsQuoteDialogOpen,
  handleQuoteSubmit,
  customColors
}: {
  feeds: FeedItem[]
  loading: boolean
  activeTab: FeedTab
  setActiveTab: (tab: FeedTab) => void
  loadFeeds: (tab: FeedTab) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  tabs: { id: string; label: string; icon: React.ElementType }[]
  user: User
  navigate: (path: string) => void
  isBottomSheetOpen: boolean
  setIsBottomSheetOpen: (open: boolean) => void
  handleCaptureNow: () => void
  handleShareAlbum: () => void
  handleWriteQuote: () => void
  isQuoteDialogOpen: boolean
  setIsQuoteDialogOpen: (open: boolean) => void
  handleQuoteSubmit: (quote: { text: string, author?: string }) => void
  customColors: { primary: string, secondary: string, accent: string }
}) {
  const {user} = useAuth();
  
  const renderFeedItem = (item: FeedItem) => {
    if (item.type === 'blog') {
      const isOwnBlog = user?.id === item.user_id

      return (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl rounded-2xl border overflow-hidden flex flex-col md:flex-row"
          style={{ borderColor: `${primaryColor}20` }}
        >
          {/* Cover Image */}
          {item.content.cover_image && (
            <div className="w-full md:w-1/3 aspect-[2/1] md:aspect-auto relative">
              <img
                src={item.content.cover_image}
                alt={item.content.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 absolute inset-0"
              />
            </div>
          )}

          <div className="flex-1 p-6 flex flex-col">
            {/* Author Info with Edit Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profiles.username}`}
                  alt={item.profiles.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <a
                    href={`/${item.profiles.username}`}
                    className="font-medium text-white hover:underline"
                  >
                    {item.profiles.username}
                  </a>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FiClock className="w-4 h-4" />
                    {formatDistanceToNow(new Date(item.created_at))} ago
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Preview */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">
                {item.content.title}
              </h2>
              <p className="text-gray-400 line-clamp-3 mb-4">
                {item.content.preview}
              </p>
            </div>

            {/* Bottom Section */}
            <div className="space-y-4">
              {/* Tags */}
              {item.metadata?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.metadata.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: `${primaryColor}20`,
                        color: primaryColor
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t"
                style={{ borderColor: `${primaryColor}10` }}>
                <div className="flex items-center gap-2 text-gray-400">
                  <FiHeart className="w-5 h-5" />
                  <span>{item.likes_count || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isOwnBlog && (
                    <button
                      onClick={() => navigate(`/blog/edit/${item.metadata?.blog_id}`)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors sm:hidden"
                      style={{
                        backgroundColor: `${primaryColor}20`,
                        color: primaryColor
                      }}
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                  )}
                  <a
                    href={`/blog/${item.metadata?.blog_id}`}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor
                    }}
                  >
                    Read More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.article>
      )
    }
    return null
  }

  return (
    <div className="relative z-10 min-h-screen pt-16 md:pt-0 md:pl-20">
      <MainNav />

      <div className="w-full px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Updated Header with Plus Button */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Feed</h1>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsBottomSheetOpen(true)}
                  className="relative group p-2 rounded-lg"
                  style={{
                    background: `linear-gradient(45deg, ${primaryColor}20, ${primaryColor}40)`,
                    boxShadow: `0 0 20px ${primaryColor}10`
                  }}
                >
                  {/* Animated background */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(45deg, ${primaryColor}, ${primaryColor}80)`
                    }}
                  />

                  {/* Icon */}
                  <FiPlus className="w-5 h-5 text-white relative z-10" />

                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 blur-xl transition-opacity"
                    style={{
                      background: primaryColor
                    }}
                  />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => loadFeeds(activeTab)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <FiRefreshCw className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Tabs - Full width with centered content */}
            <div className="w-full">
              <div
                className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar relative"
                style={{ borderBottom: `1px solid ${primaryColor}20` }}
              >
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as FeedTab)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap relative"
                    style={{
                      backgroundColor: activeTab === tab.id ? `${primaryColor}20` : 'transparent',
                      color: activeTab === tab.id ? primaryColor : '#9CA3AF'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: primaryColor }}
                        layoutId="activeTab"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Feed List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                  style={{ borderColor: primaryColor }} />
              </div>
            ) : (
              <div className="space-y-6">
                {feeds.map(item => renderFeedItem(item))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add Post Bottom Sheet */}
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
            onClick={() => {
              navigate('/blog/new')
              setIsBottomSheetOpen(false)
            }}
          />
        </div>
      </BottomSheet>

      {/* Quote Dialog */}
      <QuoteDialog
        isOpen={isQuoteDialogOpen}
        onClose={() => setIsQuoteDialogOpen(false)}
        onSubmit={handleQuoteSubmit}
        primaryColor={customColors.primary}
      />

      <BottomNav />
    </div>
  )
} 