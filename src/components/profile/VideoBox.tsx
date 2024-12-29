import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiVideo, FiPlus, FiYoutube, FiInstagram, FiPlay, FiEdit2, FiTrash2, FiPlayCircle, FiX } from 'react-icons/fi'
import { Video } from '../../types'

interface VideoBoxProps {
  videos: Video[]
  isLoading: boolean
  primaryColor: string
  isOwnProfile: boolean
  onAddVideo?: () => void
  onEditVideo?: (video: Video) => void
  onDeleteVideo?: (videoId: string) => void
}

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  video: Video | null
  primaryColor: string
}

const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function VideoModal({ isOpen, onClose, video }: VideoModalProps) {
  if (!video) return null

  const getEmbedUrl = (video: Video) => {
    switch (video.provider) {
      case 'youtube':{
        const videoId = getYouTubeVideoId(video.url)
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
      }
      case 'instagram':{
        if (video.url.includes('/reel/')) {
          const reelId = video.url.split('/reel/')[1]?.split('/')[0]
          return `https://www.instagram.com/p/${reelId}/embed`
        }
        return video.url
      }
      default:
        return video.url
    }
  }

  const isReel = video.meta?.isReel || video.url.includes('/reel/')
  const isVerticalVideo = isReel || video.provider === 'tiktok'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative w-full h-full flex items-center justify-center ${
              isVerticalVideo ? 'max-w-[500px]' : 'max-w-[90vw]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 
                       backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
            
            <div className={`w-full ${
              isVerticalVideo 
                ? 'h-[80vh] max-h-[80vh]' 
                : 'aspect-video'
            } bg-black rounded-xl overflow-hidden`}>
              <iframe
                src={getEmbedUrl(video)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                title={`${video.provider} video player`}
                style={{ border: 'none' }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function VideoBox({ 
  videos, 
  isLoading, 
  primaryColor,
  isOwnProfile,
  onAddVideo,
  onEditVideo,
  onDeleteVideo 
}: VideoBoxProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border p-6 max-w-3xl mx-auto w-full"
           style={{ borderColor: `${primaryColor}20` }}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-white/10 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-video bg-white/10 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'youtube':
        return FiYoutube
      case 'instagram':
        return FiInstagram
      default:
        return FiPlay
    }
  }

  const handleVideoClick = (video: Video) => {
    switch (video.provider) {
      case 'youtube':
        setSelectedVideo(video)
        break
      case 'instagram':
        // For Instagram reels, open in a new tab
        if (video.meta?.isReel) {
          window.open(video.url, '_blank', 'noopener,noreferrer')
        } else {
          // For regular Instagram videos, try to embed (if possible)
          setSelectedVideo(video)
        }
        break
      case 'tiktok':
        // TikTok always opens in new tab for now
        window.open(video.url, '_blank', 'noopener,noreferrer')
        break
      default:
        window.open(video.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border overflow-hidden max-w-3xl mx-auto w-full"
           style={{ borderColor: `${primaryColor}20` }}>
        <div className="p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FiVideo className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: primaryColor }} />
              Videos
            </h2>
            {isOwnProfile && onAddVideo && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddVideo}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <FiPlus className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="text-white">Add Video</span>
              </motion.button>
            )}
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiVideo className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No videos added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {videos.map((video, index) => {
                const ProviderIcon = getProviderIcon(video.provider)
                
                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative ${
                      video.meta?.isReel 
                        ? 'aspect-[9/16]'
                        : 'aspect-video'
                    } rounded-lg overflow-hidden bg-black/20 cursor-pointer`}
                    onClick={() => handleVideoClick(video)}
                  >
                    {video.thumbnail_url && (
                      <img 
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300
                                 group-hover:scale-110"
                      />
                    )}
                    
                    <div className={`absolute inset-0 bg-gradient-to-t 
                                    ${video.meta?.isReel 
                                      ? 'from-black/90 via-black/50 to-black/50' 
                                      : 'from-black/90 via-black/40 to-transparent'} 
                                    flex flex-col justify-end p-3`}>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 
                                    group-hover:opacity-100 transition-opacity">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleVideoClick(video)
                          }}
                          className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center rounded-full 
                                    bg-black/30 backdrop-blur-sm border border-white/20
                                    hover:bg-black/50 cursor-pointer transform hover:scale-110
                                    transition-all duration-200"
                        >
                          <FiPlayCircle 
                            className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" 
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                          />
                        </motion.div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <ProviderIcon 
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          style={{ color: primaryColor }}
                        />
                        <span className="text-[10px] sm:text-xs text-gray-300">
                          {video.provider.charAt(0).toUpperCase() + video.provider.slice(1)}
                          {video.meta?.isReel && ' Reel'}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-medium text-white line-clamp-2">
                        {video.title}
                      </h3>
                    </div>

                    {isOwnProfile && (
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 
                                    transition-opacity duration-200 scale-90 group-hover:scale-100 z-10">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onEditVideo?.(video)
                          }}
                          className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 
                                    transition-colors border border-white/20 shadow-lg"
                          style={{ color: primaryColor }}
                        >
                          <FiEdit2 className="w-4 h-4 drop-shadow" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onDeleteVideo?.(video.id)
                          }}
                          className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 
                                    transition-colors border border-white/20 shadow-lg"
                          style={{ color: '#ef4444' }}
                        >
                          <FiTrash2 className="w-4 h-4 drop-shadow" />
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        video={selectedVideo}
        primaryColor={primaryColor}
      />
    </>
  )
} 