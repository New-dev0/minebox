import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiMessageCircle, FiUserPlus, FiUserCheck, FiLogIn, FiShare2 } from 'react-icons/fi'
import { Dialog } from '@headlessui/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface ProfileActionsProps {
  isOwnProfile: boolean
  profileId: string
  setIsBottomSheetOpen: (open: boolean) => void
  primaryColor: string
  isFollowing?: boolean
  onFollowAction?: () => void
}

export default function ProfileActions({ 
  isOwnProfile, 
  profileId,
  setIsBottomSheetOpen,
  primaryColor,
  isFollowing,
  onFollowAction
}: ProfileActionsProps) {
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showShareFeedback, setShowShareFeedback] = useState(false)
  // Check follow status on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user?.id || !profileId || isOwnProfile) return

      try {
        const {  error } = await supabase
          .from('follows')
          .select()
          .match({
            follower_id: user.id,
            following_id: profileId
          })
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking follow status:', error)
          return
        }
      } catch (err) {
        console.error('Failed to check follow status:', err)
      }
    }

    checkFollowStatus()
  }, [user?.id, profileId, isOwnProfile])

  const handleUnauthorizedAction = () => {
    if (!user) {
      setShowLoginDialog(true)
      return true
    }
    return false
  }

  const handleFollowAction = async () => {
    if (handleUnauthorizedAction()) return
    if (!user?.id || !profileId) return

    setLoading(true)
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({
            follower_id: user.id,
            following_id: profileId
          })

        if (error) throw error
        onFollowAction?.()
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profileId
          })

        if (error) throw error
        onFollowAction?.()
      }
    } catch (err) {
      console.error('Follow action error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageAction = async () => {
    if (handleUnauthorizedAction()) return
    if (!user?.id || !profileId) return

    try {
      // Check if conversation exists
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'direct')
        .contains('participant_ids', [user.id, profileId])

      if (existingConvs && existingConvs.length > 0) {
        navigate(`/messages/${existingConvs[0].id}`)
        return
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          participant_ids: [user.id, profileId],
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
    } catch (err) {
      console.error('Message action error:', err)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShowShareFeedback(true)
      setTimeout(() => setShowShareFeedback(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  return (
    <div className="flex gap-3">
      {isOwnProfile ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsBottomSheetOpen(true)}
          className="px-6 py-2 rounded-lg text-white text-sm font-medium
                   transition-colors flex items-center justify-center gap-2
                   hover:brightness-110"
          style={{ backgroundColor: primaryColor }}
        >
          <FiPlus className="w-4 h-4" />
          Add New Post
        </motion.button>
      ) : (
        <>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFollowAction}
            disabled={loading}
            className="px-6 py-2 rounded-lg text-white text-sm font-medium
                     transition-colors flex items-center justify-center gap-2
                     hover:brightness-110 disabled:opacity-50"
            style={{ 
              backgroundColor: isFollowing ? 'transparent' : primaryColor,
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
            onClick={handleMessageAction}
            className="px-6 py-2 bg-black/30 text-white rounded-lg 
                     text-sm font-medium transition-colors flex items-center 
                     justify-center gap-2 hover:bg-opacity-40 backdrop-blur-sm"
            style={{ 
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
            className="px-6 py-2 bg-black/30 text-white rounded-lg 
                     text-sm font-medium transition-colors flex items-center 
                     justify-center gap-2 hover:bg-opacity-40 backdrop-blur-sm
                     relative"
            style={{ 
              borderColor: `${primaryColor}30`,
              borderWidth: '1px'
            }}
          >
            <FiShare2 className="w-4 h-4" />
            <span>{showShareFeedback ? 'Copied!' : 'Share'}</span>
          </motion.button>
        </>
      )}

      <Dialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel 
            className="bg-black/90 rounded-xl border p-6 max-w-sm w-full backdrop-blur-xl"
            style={{ borderColor: `${primaryColor}20` }}
          >
            <Dialog.Title 
              className="text-2xl font-bold mb-4"
              style={{ color: primaryColor }}
            >
              Join the Journey
            </Dialog.Title>
            <Dialog.Description className="text-gray-300 mb-6">
              Create an account to connect with other explorers and share your story.
            </Dialog.Description>

            <div className="space-y-4">
              <Link
                to="/register"
                className="w-full py-3 rounded-lg font-medium
                         flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: primaryColor, color: 'black' }}
                onClick={() => setShowLoginDialog(false)}
              >
                <FiUserPlus className="w-5 h-5" />
                Get Started
              </Link>
              
              <Link
                to="/login"
                className="w-full py-3 bg-transparent rounded-lg font-medium
                         flex items-center justify-center gap-2 transition-colors"
                style={{ 
                  color: primaryColor,
                  borderColor: `${primaryColor}20`,
                  borderWidth: '1px'
                }}
                onClick={() => setShowLoginDialog(false)}
              >
                <FiLogIn className="w-5 h-5" />
                Sign In
              </Link>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
} 