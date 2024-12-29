import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { format } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'
import { 
  FiCornerUpLeft as FiReply, 
  FiTrash2, 
  FiPlay, 
  FiPause, 
  FiDownload, 
  FiMaximize2, 
  FiSmile, 
  FiHeart, 
  FiThumbsUp, 
  FiStar, 
  FiFrown 
} from 'react-icons/fi'
import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

interface Message {
  id: string
  sender_id: string
  content: string
  type: 'text' | 'gif' | 'image' | 'file' | 'voice'
  created_at: string
  is_read: boolean
  reply_to?: {
    id: string
    content: string
    type: string
  }
  metadata?: {
    gif_id?: string
    file_name?: string
    file_size?: number
    duration?: number
    mime_type?: string
    width?: number
    height?: number
  }
  reactions?: {
    user_id: string
    emoji: string
    created_at: string
  }[]
}

interface MessagesListProps {
  messages: Message[]
  primaryColor: string
  onReply: (message: Message) => void
  onDelete: (messageId: string) => void
}

interface Reaction {
  emoji: string
  icon: typeof FiHeart
  label: string
}

const REACTIONS: Reaction[] = [
  { emoji: '❤️', icon: FiHeart, label: 'Love' },
  { emoji: '👍', icon: FiThumbsUp, label: 'Like' },
  { emoji: '🔥', icon: FiStar, label: 'Fire' },
  { emoji: '😂', icon: FiSmile, label: 'Haha' },
  { emoji: '😮', icon: FiFrown, label: 'Wow' },
]

export default function MessagesList({ 
  messages, 
  primaryColor,
  onReply,
  onDelete 
}: MessagesListProps) {
  const { user } = useAuth()
//  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({})
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})
  const [swipingMessageId, setSwipingMessageId] = useState<string | null>(null)

  const handleImageClick = (url: string) => {
    setImagePreview(url)
  }

  const handleAudioPlay = (messageId: string) => {
    const audio = audioRefs.current[messageId]
    if (!audio) return

    if (isPlaying[messageId]) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(prev => ({ ...prev, [messageId]: !prev[messageId] }))
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return

    try {
      // First try to delete existing reaction
      const { data: existingReaction } = await supabase
        .from('message_reactions')
        .select('emoji')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .single()

      if (existingReaction?.emoji === emoji) {
        // If same reaction exists, remove it
        const { error: deleteError } = await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError
      } else {
        // Otherwise upsert new reaction
        const { error } = await supabase
          .from('message_reactions')
          .upsert({
            message_id: messageId,
            user_id: user.id,
            emoji: emoji
          }, {
            onConflict: 'message_id,user_id'
          })

        if (error) throw error
      }
    } catch (error) {
      console.error('Error handling reaction:', error)
    }
  }

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'gif':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg overflow-hidden bg-black/20 group relative w-full"
            style={{ 
              maxWidth: '280px',
              minWidth: window.innerWidth >= 1024 ? '400px' : '200px'
            }}
          >
            <div 
              className="relative" 
              style={{ 
                minHeight: '150px',
                paddingTop: '75%'
              }}
            >
              <img 
                src={message.content}
                alt="GIF"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  console.error('Error loading GIF:', e)
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=GIF+Error'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
            </div>
            <motion.div 
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                       transition-opacity flex items-center justify-center"
              initial={false}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleImageClick(message.content)}
                className="p-2 rounded-full bg-black/40 backdrop-blur-sm"
              >
                <FiMaximize2 className="w-5 h-5 text-white" />
              </motion.button>
            </motion.div>
          </motion.div>
        )

      case 'image':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg overflow-hidden bg-black/20 group relative"
            style={{ 
              maxWidth: '300px',
              aspectRatio: message.metadata?.width && message.metadata?.height 
                ? `${message.metadata.width}/${message.metadata.height}`
                : undefined
            }}
          >
            <img 
              src={message.content}
              alt="Image"
              className="w-full h-full object-cover"
              loading="lazy"
              onClick={() => handleImageClick(message.content)}
            />
            <motion.div 
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                       transition-opacity flex items-center justify-center gap-2"
              initial={false}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleImageClick(message.content)}
                className="p-2 rounded-full bg-black/40 backdrop-blur-sm"
              >
                <FiMaximize2 className="w-5 h-5 text-white" />
              </motion.button>
              <motion.a
                href={message.content}
                download
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-black/40 backdrop-blur-sm"
              >
                <FiDownload className="w-5 h-5 text-white" />
              </motion.a>
            </motion.div>
          </motion.div>
        )

      case 'file':
        const fileIcon = getFileIcon(message.metadata?.mime_type || '')

        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-black/20 
                     hover:bg-black/30 transition-colors max-w-[300px] group"
          >
            <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center">
              {fileIcon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {message.metadata?.file_name || 'File'}
              </div>
              <div className="text-xs text-gray-400">
                {formatFileSize(message.metadata?.file_size || 0)}
              </div>
            </div>
            <motion.a
              href={message.content}
              download
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-black/40 backdrop-blur-sm opacity-0 
                       group-hover:opacity-100 transition-opacity"
            >
              <FiDownload className="w-4 h-4 text-white" />
            </motion.a>
          </motion.div>
        )

      case 'voice':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-black/20 min-w-[250px] max-w-[300px]"
          >
            <audio
              ref={el => {
                if (el) audioRefs.current[message.id] = el
              }}
              src={message.content}
              onEnded={() => setIsPlaying(prev => ({ ...prev, [message.id]: false }))}
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAudioPlay(message.id)}
              className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center"
            >
              {isPlaying[message.id] ? (
                <FiPause className="w-4 h-4 text-white" />
              ) : (
                <FiPlay className="w-4 h-4 text-white" />
              )}
            </motion.button>
            <div className="flex-1">
              <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ 
                    width: isPlaying[message.id] ? '100%' : '0%',
                    backgroundColor: primaryColor
                  }}
                  animate={{ width: isPlaying[message.id] ? '100%' : '0%' }}
                  transition={{ duration: message.metadata?.duration || 0 }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {formatDuration(message.metadata?.duration || 0)}
              </div>
            </div>
          </motion.div>
        )
      default:
        return (
          <span className="text-white whitespace-pre-wrap break-words">
            {message.content}
          </span>
        )
    }
  }

  const ReplyPreview = ({ message }: { message: Message }) => {
    if (!message.reply_to) return null

    return (
      <div className="mb-2 p-2 rounded bg-black/20 text-sm">
        <div className="text-gray-400 text-xs mb-1">Replying to message</div>
        {message.reply_to.type === 'text' ? (
          <div className="truncate text-gray-300">{message.reply_to.content}</div>
        ) : (
          <div className="text-gray-300">{message.reply_to.type} message</div>
        )}
      </div>
    )
  }

  const MessageActions = ({ message, isOwnMessage }: { message: Message, isOwnMessage: boolean }) => {
    const [showActions, setShowActions] = useState(false)

    return (
      <motion.div 
        className="absolute top-0 right-0 -translate-y-1/2 flex items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: showActions ? 1 : 0 }}
        onHoverStart={() => setShowActions(true)}
        onHoverEnd={() => setShowActions(false)}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onReply(message)}
          className="p-2 rounded-full bg-black/40 backdrop-blur-sm
                   hover:bg-black/60 transition-colors"
        >
          <FiReply className="w-4 h-4 text-white" />
        </motion.button>

        {isOwnMessage && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(message.id)}
            className="p-2 rounded-full bg-black/40 backdrop-blur-sm
                     hover:bg-red-500/20 transition-colors"
          >
            <FiTrash2 className="w-4 h-4 text-white" />
          </motion.button>
        )}
      </motion.div>
    )
  }

  const ImagePreviewModal = () => {
    if (!imagePreview) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center"
        onClick={() => setImagePreview(null)}
      >
        <motion.img
          src={imagePreview}
          alt="Preview"
          className="max-w-[90vw] max-h-[90vh] object-contain"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        />
      </motion.div>
    )
  }

  const ReactionDisplay = ({ message }: { message: Message }) => {
    if (!message.reactions?.length) return null

    const reactionGroups = message.reactions.reduce((acc, r) => ({
      ...acc,
      [r.emoji]: {
        count: (acc[r.emoji]?.count || 0) + 1,
        users: [...(acc[r.emoji]?.users || []), r.user_id]
      }
    }), {} as Record<string, { count: number, users: string[] }>)

    const userReacted = (emoji: string) => 
      message.reactions?.some(r => r.user_id === user?.id && r.emoji === emoji)

    return (
      <div className="absolute -bottom-6 right-0 flex items-center gap-1
                     bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5
                     border border-white/10">
        {Object.entries(reactionGroups).map(([emoji, { count }]) => (
          <motion.div 
            key={emoji} 
            className={`flex items-center gap-1 px-1 py-0.5 rounded-full
                       ${userReacted(emoji) ? 'bg-white/10' : ''}`}
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-sm">{emoji}</span>
            <span className="text-xs text-gray-400">{count}</span>
          </motion.div>
        ))}
      </div>
    )
  }

  const MessageBubble = ({ message, isOwnMessage }: { message: Message, isOwnMessage: boolean }) => {
    const x = useMotionValue(0)
    const swipeAmount = useTransform(x, [-100, 0, 100], [-1, 0, 1])
    const scale = useTransform(swipeAmount, [-1, 0, 1], [0.95, 1, 0.95])
    const [showReactions, setShowReactions] = useState(false)
    
    const handleDragEnd = (_: any, info: any) => {
      const offset = info.offset.x
      if (Math.abs(offset) > 50) { // Threshold for triggering reply
        onReply(message)
      }
      setSwipingMessageId(null)
    }

    return (
      <motion.div 
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragStart={() => setSwipingMessageId(message.id)}
        onDragEnd={handleDragEnd}
        style={{ x, scale }}
        className="relative"
      >
        <div 
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage 
              ? 'bg-gradient-to-br rounded-tr-sm' 
              : 'bg-black/20 rounded-tl-sm'
          }`}
          style={isOwnMessage ? { 
            background: `linear-gradient(to bottom right, ${primaryColor}40, ${primaryColor}20)`
          } : undefined}
        >
          <ReplyPreview message={message} />
          {renderMessageContent(message)}
          
          {/* Footer with timestamp and reactions */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-400">
              {format(new Date(message.created_at), 'HH:mm')}
            </span>
            
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowReactions(!showReactions)}
                className="p-1.5 rounded-full hover:bg-black/20 transition-colors
                         opacity-0 group-hover:opacity-100"
              >
                <FiSmile className="w-4 h-4 text-gray-400" />
              </motion.button>

              {/* Reactions Tooltip */}
              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="absolute bottom-full right-0 mb-2
                             bg-black/90 backdrop-blur-xl rounded-full
                             border border-white/10 shadow-xl px-1.5 py-1"
                    style={{ 
                      transformOrigin: 'bottom right',
                      zIndex: 50
                    }}
                  >
                    <div className="flex items-center gap-0.5">
                      {REACTIONS.map((reaction) => (
                        <motion.button
                          key={reaction.label}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            handleReaction(message.id, reaction.emoji)
                            setShowReactions(false)
                          }}
                          className="relative group"
                        >
                          <div className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                            <span className="text-xl leading-none">{reaction.emoji}</span>
                          </div>
                          
                          {/* Tooltip label */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                                           opacity-0 group-hover:opacity-100 transition-opacity
                                           pointer-events-none">
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <ReactionDisplay message={message} />
            </div>
          </div>
        </div>

        {/* Swipe indicator */}
        {swipingMessageId === message.id && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ 
              opacity: useTransform(x, [-100, -50, 0, 50, 100], [1, 0.5, 0, 0.5, 1]),
              x: useTransform(x, [-100, 0, 100], [
                isOwnMessage ? '100%' : '-120%',
                isOwnMessage ? '120%' : '-100%',
                isOwnMessage ? '140%' : '-80%'
              ])
            }}
          >
            <FiReply 
              className={`w-6 h-6 text-white transform ${isOwnMessage ? 'rotate-180' : ''}`}
            />
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-4 w-full max-w-full">
        {messages.map((message, index) => {
          const isOwnMessage = message.sender_id === user?.id
          const showTimestamp = index === 0 || 
            new Date(message.created_at).getDate() !== 
            new Date(messages[index - 1].created_at).getDate()

          return (
            <div key={message.id} className="flex flex-col w-full">
              {/* Timestamp separator */}
              {showTimestamp && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-gray-400 bg-black/20 px-3 py-1 rounded-full">
                    {format(new Date(message.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`relative group max-w-[85%] sm:max-w-[70%] md:max-w-[60%]
                           ${isOwnMessage ? 'items-end' : 'items-start'}`}
                >
                  <MessageBubble message={message} isOwnMessage={isOwnMessage} />
                  <MessageActions message={message} isOwnMessage={isOwnMessage} />
                </div>
              </motion.div>
            </div>
        )
      })}
    </div>
      <AnimatePresence>
        {imagePreview && <ImagePreviewModal />}
      </AnimatePresence>
    </>
  )
}

// Utility functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎥'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word')) return '📝'
  if (mimeType.includes('excel')) return '📊'
  return '📁'
} 