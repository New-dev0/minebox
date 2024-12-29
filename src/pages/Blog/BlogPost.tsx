import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'
import { FiArrowLeft, FiShare2, FiClock, FiEdit3 } from 'react-icons/fi'
import MDEditor from '@uiw/react-md-editor'
import { AnimatedBackground, ParticlesBackground, WavesBackground } from '../../components/backgrounds'
import MainNav from '../../components/navigation/MainNav'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'
import WarScene from '../../components/scenes/WarScene'
import MetaTags from '../../components/shared/MetaTags'
import { BackgroundType } from '../../types'
import { patterns } from '../../utils/patterns'


type BlogPost = {
  id: string
  title: string
  content: string
  cover_image: string | null
  tags: string[]
  created_at: string
  user_id: string
  author: {
    username: string
    avatar_url: string | null
  }
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

export default function BlogPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { customColors } = useTheme()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [userTheme, setUserTheme] = useState<UserTheme>()
  const [isLoading, setIsLoading] = useState(true)

  // Add theme fetching
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

  // Get background type from theme
  const backgroundType = userTheme?.background
  const activePattern = userTheme?.pattern ? patterns.find(p => p.id === userTheme.pattern) : null
  const primaryColor = userTheme?.customColors?.primary || '#8B5CF6'

  const isOwnBlog = user?.id === blog?.user_id

  useEffect(() => {
    async function fetchBlog() {
      try {
        // First get the blog post
        const { data: blogData, error: blogError } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', id)
          .single()

        if (blogError) throw blogError

        // Then get the author's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', blogData.user_id)
          .single()

        if (profileError) throw profileError

        // Combine the data
        setBlog({
          ...blogData,
          author: {
            username: profileData.username,
            avatar_url: profileData.avatar_url
          }
        })
      } catch (error) {
        console.error('Error fetching blog:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
             style={{ borderColor: customColors.primary }} />
      </div>
    )
  }

  if (!blog) return null
  if (isLoading) return null

  return (
    <div className="min-h-screen">
      <MetaTags title={blog?.title || 'Blog Post'} />
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
                  backgroundImage: activePattern.css.backgroundImage,
                  backgroundSize: activePattern.css.backgroundSize,
                  backgroundColor: activePattern.css.backgroundColor
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
          style={{ 
            zIndex: 1,
          }} 
        />

        {/* Content Layer */}
        <div className="relative" style={{ zIndex: 10 }}>
          <MainNav />
          <div className="max-w-5xl mx-auto pt-24 px-4 pb-20">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-4">
                {isOwnBlog && (
                  <button
                    onClick={() => navigate(`/blog/edit/${id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: `${customColors.primary}20`,
                      color: customColors.primary
                    }}
                  >
                    <FiEdit3 className="w-4 h-4" />
                    <span>Edit Post</span>
                  </button>
                )}
                <button
                  onClick={() => navigator.share({
                    title: blog.title,
                    text: blog.content.substring(0, 100) + '...',
                    url: window.location.href
                  })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: `${customColors.primary}20`,
                    color: customColors.primary
                  }}
                >
                  <FiShare2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 bg-black/60 rounded-2xl p-6 border"
              style={{ borderColor: `${customColors.primary}20` }}
            >
              {/* Cover Image */}
              {blog.cover_image && (
                <div 
                  className="h-80 rounded-xl overflow-hidden bg-center bg-cover"
                  style={{ 
                    backgroundImage: `url(${blog.cover_image})`,
                  }}
                />
              )}

              {/* Title */}
              <h1 className="text-4xl font-bold text-white mt-6">
                {blog.title}
              </h1>

              {/* Meta Info */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <a 
                  href={`/${blog.author.username}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <img 
                    src={blog.author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author.username}`}
                    alt={blog.author.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{blog.author.username}</span>
                </a>
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(blog.created_at))} ago</span>
                </div>
              </div>

              {/* Tags */}
              {blog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: `${customColors.primary}20`,
                        color: customColors.primary
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <div data-color-mode="dark" className="mt-8">
                <MDEditor.Markdown 
                  source={blog.content} 
                  className="!bg-transparent prose prose-invert max-w-none"
                />
              </div>

              {/* Add floating edit button for mobile */}
              {isOwnBlog && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => navigate(`/blog/edit/${id}`)}
                  className="fixed bottom-20 right-4 p-4 rounded-full shadow-lg sm:hidden"
                  style={{ 
                    backgroundColor: customColors.primary,
                    color: 'white'
                  }}
                >
                  <FiEdit3 className="w-6 h-6" />
                </motion.button>
              )}
            </motion.article>
          </div>
        </div>
      </div>
    </div>
  )
} 