import { motion } from 'framer-motion'
import { FiSmile } from 'react-icons/fi'
import ReactEmojis from '@souhaildev/reactemojis'
import { ProfileData } from '../../pages/Profile'
// import { SUPPORTED_EMOJIS } from '../../pages/Profile'

interface ProfileAvatarProps {
  profile: ProfileData
  isOwnProfile?: boolean
  avatarPreview?: string | null
  handleAvatarUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square' | 'rounded' | 'hexagon' | 'octagon' | 'double-circle'
  primaryColor?: string
  onEmojiClick?: () => void
  showEmoji?: boolean
}

export default function ProfileAvatar({
  profile,
  isOwnProfile,
  avatarPreview,
  handleAvatarUpload,
  size = 'md',
  shape = 'circle',
  primaryColor = '#8B5CF6',
  onEmojiClick,
  showEmoji = true
}: ProfileAvatarProps) {
  const avatarUrl = avatarPreview || profile?.avatar_url
  const username = profile?.username || 'User'
  const avatarShape = profile?.avatar_shape || shape

  const sizeClasses = {
    xs: 'w-10 h-10',
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  }

  // Define shape styles with proper clip paths and borders
  const shapeStyles = {
    'circle': {
      wrapper: 'rounded-full',
      container: 'rounded-full',
      clipPath: undefined
    },
    'square': {
      wrapper: 'rounded-none',
      container: 'rounded-none',
      clipPath: undefined
    },
    'rounded': {
      wrapper: 'rounded-2xl',
      container: 'rounded-2xl',
      clipPath: undefined
    },
    'hexagon': {
      wrapper: '',
      container: '',
      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
    },
    'octagon': {
      wrapper: '',
      container: '',
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
    }
  }

  const currentShape = shapeStyles[avatarShape as keyof typeof shapeStyles] || shapeStyles.circle

  const mapVibeToEmoji = (vibe: string): string => {
    const emojiMap: Record<string, string> = {
      '😊': 'grinning',
      '😎': 'cool',
      '🤔': 'monocle',
      '😴': 'sleep-face',
      '🎮': 'rocket',
      '📚': 'star',
      '🎵': 'sparkles',
      '🎨': 'gem',
      // Add more mappings as needed
    }
    return emojiMap[vibe] || 'slight-smile' // Default fallback
  }

  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: isOwnProfile ? 1.05 : 1 }}
        className={`relative ${sizeClasses[size]} overflow-hidden border-2 transition-colors duration-200
                   ${currentShape.wrapper}`}
        style={{ 
          borderColor: `${primaryColor}40`,
          clipPath: currentShape.clipPath,
          WebkitClipPath: currentShape.clipPath
        }}
      >
        {/* Avatar Image */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="w-full h-full object-cover"
            height={416}
            width={416}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ 
              background: `linear-gradient(45deg, ${primaryColor}20, ${primaryColor}40)` 
            }}
          >
            <span className="text-2xl font-bold text-white">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Upload Overlay */}
        {isOwnProfile && handleAvatarUpload && (
          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                         flex items-center justify-center cursor-pointer transition-opacity">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <span className="text-white text-sm">Change</span>
          </label>
        )}
      </motion.div>

      {/* Emoji Status Button/Display */}
      {showEmoji && (isOwnProfile || profile?.status_emoji || profile?.vibe) && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -bottom-3 -right-3"
        >
          {isOwnProfile ? (
            <button
              onClick={onEmojiClick}
              className="group flex items-center justify-center w-10 h-10 rounded-full
                       bg-black/50 backdrop-blur-sm border hover:bg-black/70
                       transition-colors"
              style={{ borderColor: `${primaryColor}30` }}
            >
              {profile?.status_emoji ? (
                <ReactEmojis
                  // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                  emoji={profile.status_emoji }
                  emojiStyle="1"
                  style={{ height: 34, width: 34 }}
                />
              ) : profile?.vibe?.split(' ')[0] ? (
                <ReactEmojis
                // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                  emoji={mapVibeToEmoji(profile.vibe.split(' ')[0])}
                  emojiStyle="1"
                  style={{ height: 34, width: 34 }}
                />
              ) : (
                <FiSmile className="w-5 h-5 text-gray-400 group-hover:text-white" />
              )}
            </button>
          ) : (
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-full
                       bg-black/50 backdrop-blur-sm border"
              style={{ borderColor: `${primaryColor}30` }}
            >
              {profile?.status_emoji ? (
                <ReactEmojis
                  // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                  emoji={profile.status_emoji}
                  emojiStyle="1"
                  style={{ height: 24, width: 24 }}
                />
              ) : profile?.vibe?.split(' ')[0] && (
                <ReactEmojis
                  // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                  emoji={mapVibeToEmoji(profile.vibe.split(' ')[0])}
                  emojiStyle="1"
                  style={{ height: 24, width: 24 }}
                />
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
} 