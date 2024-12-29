import { motion, AnimatePresence } from 'framer-motion'
import ProfileAvatar from './ProfileAvatar'
import ProfileStats from './ProfileStats'
// import ProfileActions from './ProfileActions'
import { ProfileData } from '../../types/index'
import { FiUserCheck, FiUserPlus, FiMessageCircle, FiPlus, FiShare2, FiX } from 'react-icons/fi'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

interface ProfileHeaderProps {
  profile: ProfileData | null
  isOwnProfile: boolean
  avatarPreview: string | null
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  setIsBottomSheetOpen: (open: boolean) => void
  primaryColor: string
  onFollowAction: () => void
  onMessageAction: () => void
  isFollowing: boolean
  loading: boolean
  onEmojiClick?: () => void
  secondaryColor: string
  accentColor: string
}

function LoginDialog({ isOpen, onClose, primaryColor }: { 
  isOpen: boolean
  onClose: () => void
  primaryColor: string 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-black/90 rounded-xl p-6 border"
            style={{ borderColor: `${primaryColor}20` }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
              Join the Community
            </h2>
            <p className="text-gray-300 mb-6">
              Create an account to follow other users, message them, and share your own content.
            </p>

            <div className="space-y-4">
              <Link
                to="/register"
                className="w-full py-3 rounded-lg font-medium text-black
                         flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: primaryColor }}
                onClick={onClose}
              >
                <FiUserPlus className="w-5 h-5" />
                Get Started
              </Link>
              
              <Link
                to="/login"
                className="w-full py-3 rounded-lg font-medium
                         flex items-center justify-center gap-2 transition-colors
                         border hover:bg-white/5"
                style={{ 
                  color: primaryColor,
                  borderColor: `${primaryColor}20`
                }}
                onClick={onClose}
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  avatarPreview,
  handleAvatarUpload,
  setIsBottomSheetOpen,
  primaryColor,
  onFollowAction,
  onMessageAction,
  isFollowing,
  loading,
  onEmojiClick,
  secondaryColor,
  accentColor
}: ProfileHeaderProps) {
  const { user } = useAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showShareFeedback, setShowShareFeedback] = useState(false)

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.username}'s Profile`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setShowShareFeedback(true)
        setTimeout(() => setShowShareFeedback(false), 2000)
      }
    } catch (err) {
      console.error('Failed to share:', err)
    }
  }

  const handleAction = (action: () => void) => {
    if (!user) {
      setShowLoginDialog(true)
    } else {
      action()
    }
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border overflow-hidden"
         style={{ borderColor: `${primaryColor}20` }}>
      {/* Cover/Banner Area */}
      <div className="h-32 bg-gradient-to-r relative overflow-hidden">
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              `linear-gradient(45deg, ${primaryColor}20, ${secondaryColor}20)`,
              `linear-gradient(45deg, ${secondaryColor}20, ${accentColor}20)`,
              `linear-gradient(45deg, ${accentColor}20, ${primaryColor}20)`
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Animated particles */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: i % 3 === 0 ? primaryColor : i % 3 === 1 ? secondaryColor : accentColor,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>

      {/* Profile Info Area */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 -mt-12">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <ProfileAvatar
              // @ts-expect-error: This is a temporary fix to allow the form data to be updated
              profile={profile}
              isOwnProfile={isOwnProfile}
              avatarPreview={avatarPreview}
              handleAvatarUpload={handleAvatarUpload}
              primaryColor={primaryColor}
              onEmojiClick={onEmojiClick}
            />
          </div>

          {/* Info & Actions Section */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Profile Info & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Profile Info */}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {profile?.username || 'Loading...'}
                </h1>
                <p className="text-gray-400 mt-1 whitespace-pre-line">
                  {profile?.bio || 'No bio yet'}
                </p>
              </div>

              {/* Profile Actions */}
              {!isOwnProfile && profile?.id && (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction(onFollowAction)}
                    disabled={loading}
                    className="px-6 py-2 rounded-lg text-white text-sm font-medium
                             transition-colors flex items-center justify-center gap-2
                             hover:brightness-110 disabled:opacity-50"
                    style={{ 
                      background: isFollowing 
                        ? 'transparent' 
                        : `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                      borderColor: isFollowing ? `${primaryColor}30` : 'transparent',
                      borderWidth: isFollowing ? '1px' : '0'
                    }}
                  >
                    {isFollowing ? (
                      <>
                        <FiUserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction(onMessageAction)}
                    className="px-6 py-2 text-white rounded-lg text-sm font-medium 
                             transition-colors flex items-center justify-center gap-2 
                             hover:bg-opacity-40 backdrop-blur-sm"
                    style={{ 
                      background: `linear-gradient(45deg, ${secondaryColor}20, ${accentColor}20)`,
                      borderColor: `${primaryColor}30`,
                      borderWidth: '1px'
                    }}
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    className="px-6 sm:px-6 py-2 text-white rounded-lg text-sm font-medium 
                             transition-colors flex items-center justify-center gap-2 
                             hover:bg-opacity-40 backdrop-blur-sm"
                    style={{ 
                      background: `linear-gradient(45deg, ${secondaryColor}20, ${accentColor}20)`,
                      borderColor: `${primaryColor}30`,
                      borderWidth: '1px'
                    }}
                  >
                    <FiShare2 className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {showShareFeedback ? 'Copied!' : 'Share'}
                    </span>
                  </motion.button>
                </div>
              )}

              {/* Add Post Button for Own Profile */}
              {isOwnProfile && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsBottomSheetOpen(true)}
                  className="relative group px-6 py-2 rounded-lg text-white text-sm font-medium
                             transition-all flex items-center justify-center gap-2
                             overflow-hidden backdrop-blur-sm"
                  style={{ 
                    background: `linear-gradient(45deg, ${primaryColor}20, ${secondaryColor}20)`,
                    borderColor: `${primaryColor}30`,
                    borderWidth: '1px',
                    boxShadow: `inset 0 0 15px ${primaryColor}10`
                  }}
                >
                  {/* Hover effect overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ 
                      background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                      opacity: 0.1
                    }}
                  />
                  
                  {/* Button content */}
                  <div className="relative flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                      }}
                    >
                      <FiPlus className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium" style={{ color: primaryColor }}>
                      Add New Post
                    </span>
                  </div>
                </motion.button>
              )}
            </div>

            {/* Profile Stats - Moved below actions */}
            <div className="border-t border-gray-800 pt-4">
              <ProfileStats 
                stats={{
                  posts: profile?.timeline_events?.length || 0,
                  friends: profile?.stats?.friends || 0,
                  achievements: profile?.achievements?.length || 0
                }}
                primaryColor={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        primaryColor={primaryColor}
      />
    </div>
  )
} 