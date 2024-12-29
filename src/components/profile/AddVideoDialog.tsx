import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiYoutube, FiInstagram, FiPlay } from 'react-icons/fi'
import { Video } from '../../types'

interface AddVideoDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddVideo: (video: Omit<Video, 'id' | 'user_id' | 'added_at'>) => void
  primaryColor: string
}

export default function AddVideoDialog({
  isOpen,
  onClose,
  onAddVideo,
  primaryColor
}: AddVideoDialogProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [provider, setProvider] = useState<'youtube' | 'instagram' | 'tiktok'>('youtube')
  const [thumbnailUrl, setThumbnailUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onAddVideo({
      title,
      url,
      provider,
      thumbnail_url: thumbnailUrl,
      meta: {}
    })

    // Reset form
    setTitle('')
    setUrl('')
    setProvider('youtube')
    setThumbnailUrl('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-black/80 backdrop-blur-xl 
                     rounded-2xl shadow-xl overflow-hidden border"
            style={{ borderColor: `${primaryColor}20` }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Add Video</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 
                             text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    placeholder="Enter video title"
                    required
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 
                             text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    placeholder="Enter video URL"
                    required
                  />
                </div>

                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Platform
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['youtube', 'instagram', 'tiktok'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setProvider(p as typeof provider)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg 
                                  border transition-colors ${
                          provider === p
                            ? 'border-2 border-white bg-white/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        {p === 'youtube' && <FiYoutube className="w-5 h-5" />}
                        {p === 'instagram' && <FiInstagram className="w-5 h-5" />}
                        {p === 'tiktok' && <FiPlay className="w-5 h-5" />}
                        <span className="text-sm text-white capitalize">
                          {p}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thumbnail URL (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Thumbnail URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 
                             text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    placeholder="Enter thumbnail URL"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 rounded-lg font-medium text-white mt-6"
                  style={{ backgroundColor: primaryColor }}
                >
                  Add Video
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 