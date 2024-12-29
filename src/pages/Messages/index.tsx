import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiEdit, FiMessageCircle, FiX } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import PageTransition from '../../components/shared/PageTransition'
import { useNavigate } from 'react-router-dom'
import WarScene from '../../components/scenes/WarScene'
import { AnimatedBackground, ParticlesBackground, WavesBackground } from '../../components/backgrounds'
import { patterns } from '../../utils/patterns'
import { BackgroundType } from '../../types'
import {  Pattern } from '../../utils/patterns'
import { colorSchemes, ColorScheme } from '../../utils/colorSchemes'

interface Conversation {
  id: string
  type: 'direct' | 'group'
  participant_ids: string[]
  created_at: string
  metadata?: {
    created_by: string
    name?: string
    description?: string
  }
  last_message?: {
    content: string
    sender_id: string
    created_at: string
    type: 'text' | 'image' | 'gif' | 'file' | 'voice'
  }
  participants?: {
    id: string
    username: string
    avatar_url: string | null
    online?: boolean
  }[]
}


// Add this interface for reply state
interface ReplyTo {
  id: string
  username: string
  content: string
  timestamp: string
}

// Add this helper function near the top of the file, after the interfaces
const formatMessageTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  // If less than a minute ago
  if (seconds < 60) {
    return 'Just now'
  }
  
  // If less than an hour ago
  if (minutes < 60) {
    return `${minutes}m ago`
  }
  
  // If less than 24 hours ago
  if (hours < 24) {
    return `${hours}h ago`
  }

  // If today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // If yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  // If within last 7 days
  if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  
  // Otherwise show date
  return date.toLocaleDateString([], { 
    month: 'short',
    day: 'numeric'
  })
}

export default function Messages() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  // @ts-expect-error: //
  const [activePattern, setActivePattern] = useState<Pattern | null>(null)
  const backgroundRef = useRef(null)

  // Add theme state inside component
  const [themeState, setThemeState] = useState({
    backgroundType: 'saturn' as BackgroundType,
    primaryColor: '#00ff88',
    pattern: null as Pattern | null,
    patternIntensity: 100,
    colorScheme: null as ColorScheme | null,
    customColors: {
      primary: '#00ff88',
      background: '#1a1a2e'
    }
  });

  // Update useEffect to load theme
  useEffect(() => {
    const loadTheme = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme')
          .eq('id', user.id)
          .single();

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

          // Set active pattern if exists
          if (theme.pattern) {
            const pattern = patterns.find(p => p.id === theme.pattern);
            setActivePattern(pattern || null);
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [user]);
  if (isLoading) return null

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        {/* Background Layer - Negative z-index */}
        <div className="fixed inset-0" style={{ zIndex: -1 }}>
          {themeState.backgroundType === 'scene3d-war' ? (
            <WarScene primaryColor={themeState.customColors.primary} />
          ) : themeState.backgroundType === 'particles' ? (
            <ParticlesBackground 
              color={themeState.customColors.primary}
              count={50}
              speed={1}
            />
          ) : themeState.backgroundType === 'pattern' && themeState.pattern ? (
            <AnimatedBackground 
              ref={backgroundRef}
              sceneType="pattern"
              pattern={{css: {
                backgroundColor: themeState.customColors.primary,
                backgroundImage: themeState.pattern.css.backgroundImage,
                backgroundSize: themeState.pattern.css.backgroundSize
              }}}
              userColor={themeState.customColors.primary}
            />
          ) : themeState.backgroundType === 'waves' ? (
            <WavesBackground
              color={themeState.customColors.primary}
              speed={1}
              amplitude={50}
            />
          ) : (
            <AnimatedBackground
              sceneType={themeState.backgroundType}
              showTitle={false}
              userColor={themeState.customColors.primary}
            />
          )}
        </div>

        {/* Content Layer - Positive z-index */}
        <div className="relative z-10">
          <MessagesContent primaryColor={themeState.customColors.primary} />
        </div>
      </div>
    </PageTransition>
  )
}

function MessagesContent({ primaryColor }: { primaryColor: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null)

  // Fetch conversations
  useEffect(() => {
    if (!user) return

    const fetchConversations = async () => {
      try {
        // First get conversations
        const { data: convs, error: convsError } = await supabase
          .from('conversations')
          .select(`
            *,
            messages:messages(
              id,
              content,
              sender_id,
              created_at,
              type,
              metadata
            )
          `)
          .contains('participant_ids', [user.id])
          .order('created_at', { ascending: false })

        if (convsError) throw convsError

        // Then fetch participant details for each conversation
        const conversationsWithDetails = await Promise.all(convs.map(async (conv) => {
          const otherParticipantIds = conv.participant_ids.filter(id => id !== user.id)
          
          const { data: participants } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', otherParticipantIds)

          // Get last message
          const lastMessage = conv.messages?.[0]

          return {
            ...conv,
            participants,
            last_message: lastMessage ? {
              content: lastMessage.content,
              sender_id: lastMessage.sender_id,
              created_at: lastMessage.created_at,
              type: lastMessage.type
            } : undefined
          }
        }))

        setConversations(conversationsWithDetails)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching conversations:', error)
        setLoading(false)
      }
    }

    fetchConversations()

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchConversations()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const handleConversationClick = (conversationId: string) => {
    navigate(`/messages/${conversationId}`)
  }

  return (
    <>
      {/* Header - Higher z-index */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Full Width Header */}
        <div 
          className="fixed top-0 left-0 right-0 z-30 flex flex-col"
        >
          {/* Main Header */}
          <div 
            className="bg-black/40 backdrop-blur-xl border-b h-16"
            style={{ borderColor: `${primaryColor}20` }}
          >
            <div className="max-w-7xl mx-auto h-full px-4 md:px-8">
              <div className="flex items-center justify-between gap-4 h-full">
                <div className="flex items-center gap-4">
                  <h1 
                    className="text-2xl font-bold flex items-center gap-2" 
                    style={{ color: primaryColor }}
                  >
                    <FiMessageCircle className="w-7 h-7" />
                    Messages
                  </h1>
                  
                  <div 
                    className="hidden md:block w-px h-8"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  />
                  
                  <span className="hidden md:block text-gray-400">
                    Chat with your connections
                  </span>
                </div>
                
                {/* Search and New Message */}
                <div className="flex gap-2 flex-1 max-w-xl">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/30 text-white rounded-lg pl-10 pr-4 py-2.5
                               border focus:outline-none placeholder:text-gray-500 transition-colors focus:border-opacity-40"
                      style={{ 
                        borderColor: `${primaryColor}20`
                      }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 rounded-lg transition-colors flex items-center gap-2"
                    style={{ 
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                  >
                    <FiEdit className="w-5 h-5" />
                    <span className="hidden sm:inline">New Message</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Reply Header - Animated */}
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-black/40 backdrop-blur-xl border-b overflow-hidden"
                style={{ borderColor: `${primaryColor}20` }}
              >
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-1 h-8 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            Replying to
                          </span>
                          <span 
                            className="text-sm font-medium"
                            style={{ color: primaryColor }}
                          >
                            {replyTo.username}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-1">
                          {replyTo.content}
                        </p>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setReplyTo(null)}
                      className="p-1 hover:bg-white/5 rounded-full"
                    >
                      <FiX className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content - Adjust padding and z-index */}
      <div 
        className={`relative pt-${replyTo ? '28' : '16'} pb-6 min-h-screen z-40`}
        style={{ 
          transition: 'padding-top 0.2s ease-in-out',
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div 
            className="bg-black/40 backdrop-blur-xl rounded-xl border h-[calc(100vh-7rem)]
                     overflow-hidden flex shadow-xl"
            style={{ 
              borderColor: `${primaryColor}20`,
              boxShadow: `0 4px 30px rgba(0, 0, 0, 0.1)`
            }}
          >
            {/* Conversations List - Fixed Width */}
            <div 
              className="w-full md:w-[380px] border-r flex flex-col" 
              style={{ borderColor: `${primaryColor}20` }}
            >
              {/* Online Users */}
              <div 
                className="p-4 border-b shrink-0"
                style={{ borderColor: `${primaryColor}20` }}
              >
                <h3 className="text-sm font-medium text-gray-400 mb-3">Online Now</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {/* Add online users avatars here */}
                </div>
              </div>

              {/* Conversations */}
              <div 
                className="flex-1 overflow-y-auto divide-y scrollbar-thin scrollbar-thumb-white/10
                         hover:scrollbar-thumb-white/20" 
                style={{ borderColor: `${primaryColor}10` }}
              >
                {loading ? (
                  <LoadingState primaryColor={primaryColor} />
                ) : conversations.length === 0 ? (
                  <EmptyState 
                    onExplore={() => navigate('/explore')} 
                    primaryColor={primaryColor}
                  />
                ) : (
                  conversations.map((conversation) => (
                    <ConversationItem 
                      key={conversation.id}
                      conversation={conversation}
                      onClick={() => handleConversationClick(conversation.id)}
                      primaryColor={primaryColor}
                      onReply={(reply) => setReplyTo(reply)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Empty State for Chat Area - Flexible Width */}
            <div className="hidden md:flex flex-1 items-center justify-center p-12 text-center">
              <div className="space-y-4 max-w-md">
                <div 
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <FiMessageCircle 
                    className="w-10 h-10"
                    style={{ color: primaryColor }}
                  />
                </div>
                <h3 className="text-2xl font-medium text-white">Your Messages</h3>
                <p className="text-gray-400">
                  Send private messages to your friends and start conversations in a secure environment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function EmptyState({ onExplore, primaryColor }: { onExplore: () => void, primaryColor: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <div className="text-gray-400 text-center">
        <p className="mb-2">No conversations yet</p>
        <p className="text-sm text-gray-500">Start chatting with other users!</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 rounded-lg text-sm font-medium"
        style={{ backgroundColor: `${primaryColor}20` }}
        onClick={onExplore}
      >
        Find People
      </motion.button>
    </div>
  )
}

function ConversationItem({ 
  conversation, 
  onClick, 
  primaryColor,
//  onReply
}: { 
  conversation: Conversation
  onClick: () => void
  primaryColor: string
  onReply?: (reply: ReplyTo) => void
}) {
  const { user } = useAuth()
  const otherParticipant = conversation.participants?.[0]
  const lastMessage = conversation.last_message
  const isOwnMessage = lastMessage?.sender_id === user?.id

  return (
    <motion.button
      onClick={onClick}
      className="w-full p-4 flex items-center gap-4 transition-all hover:bg-white/5"
      whileHover={{ 
        backgroundColor: `${primaryColor}10`,
        transform: 'translateX(4px)'
      }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-12 h-12"
        >
          <img
            src={otherParticipant?.avatar_url || '/default-avatar.png'}
            alt={otherParticipant?.username}
            className="w-full h-full rounded-full object-cover border-2"
            style={{ borderColor: `${primaryColor}40` }}
          />
        </motion.div>
      </div>

      {/* Message Preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span 
            className="font-medium truncate"
            style={{ color: primaryColor }}
          >
            {otherParticipant?.username}
          </span>
          {lastMessage && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatMessageTime(new Date(lastMessage.created_at))}
            </span>
          )}
        </div>
        
        {lastMessage && (
          <p className="text-sm text-gray-300 truncate flex items-center gap-1">
            {isOwnMessage && (
              <span className="text-xs text-gray-400">You:</span>
            )}
            {lastMessage.type === 'text' ? lastMessage.content :
             lastMessage.type === 'image' ? '📷 Image' :
             lastMessage.type === 'gif' ? '🖼️ GIF' :
             lastMessage.type === 'file' ? '📎 File' :
             lastMessage.type === 'voice' ? '🎤 Voice message' :
             'Message'}
          </p>
        )}
      </div>
    </motion.button>
  )
}

function LoadingState({ primaryColor }: { primaryColor: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div 
        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: primaryColor }}
      />
    </div>
  )
} 