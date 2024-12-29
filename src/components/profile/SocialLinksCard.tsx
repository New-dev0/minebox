import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGithub, FiTwitter, FiLinkedin, FiInstagram, FiGlobe, FiPlus, FiTrash2, FiEdit2, FiLink } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'

interface SocialLink {
  id: string
  platform: string
  url: string
  label?: string
}

interface SocialLinksCardProps {
  links: SocialLink[]
  isEditable: boolean
  userId: string
  primaryColor: string
  onLinksChange: (links: SocialLink[]) => void
}

const PLATFORM_ICONS = {
  github: FiGithub,
  twitter: FiTwitter,
  linkedin: FiLinkedin,
  instagram: FiInstagram,
  website: FiGlobe
}

const PLATFORM_OPTIONS = [
  { id: 'github', label: 'GitHub', icon: FiGithub },
  { id: 'twitter', label: 'Twitter', icon: FiTwitter },
  { id: 'linkedin', label: 'LinkedIn', icon: FiLinkedin },
  { id: 'instagram', label: 'Instagram', icon: FiInstagram },
  { id: 'website', label: 'Website', icon: FiGlobe }
]

export default function SocialLinksCard({ links, isEditable, userId, primaryColor, onLinksChange }: SocialLinksCardProps) {

  const [isAdding, setIsAdding] = useState(false)
  const [newLink, setNewLink] = useState({
    platform: 'github',
    url: '',
    label: ''
  })

  const handleAddLink = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .insert([{
          profile_id: userId,
          platform: newLink.platform,
          url: newLink.url,
          label: newLink.label || undefined
        }])
        .select()
        .single()

      if (error) throw error

      onLinksChange([...links, data])
      setIsAdding(false)
      setNewLink({ platform: 'github', url: '', label: '' })
    } catch (error) {
      console.error('Error adding social link:', error)
    }
  }

  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id)

      if (error) throw error

      onLinksChange(links.filter(link => link.id !== id))
    } catch (error) {
      console.error('Error deleting social link:', error)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-black/60 backdrop-blur-md rounded-lg p-6"
      style={{ 
        borderColor: `${primaryColor}20`,
        borderWidth: '1px'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <FiLink className="w-5 h-5 sm:w-6 sm:h-6" />
          Social Links
        </h2>
        {isEditable && !isAdding && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{ 
              backgroundColor: `${primaryColor}20`,
              borderColor: `${primaryColor}40`,
              borderWidth: '1px'
            }}
          >
            <FiPlus className="w-4 h-4" style={{ color: primaryColor }} />
            <span className="text-white">Add Link</span>
          </motion.button>
        )}
      </div>

      <div className="space-y-4">
        {links.map(link => {
          const Icon = PLATFORM_ICONS[link.platform as keyof typeof PLATFORM_ICONS] || FiGlobe
          return (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border
                       transition-colors group hover:bg-opacity-20 hover:border-opacity-50"
              style={{ 
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}30`
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                <span className="text-white capitalize">{link.label || link.platform}</span>
              </div>
              {isEditable && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteLink(link.id)
                    }}
                    className="p-1 rounded-lg border hover:bg-red-500/20"
                    style={{
                      borderColor: 'rgb(239 68 68 / 0.3)', // red-500/30
                    }}
                  >
                    <FiTrash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}
            </motion.a>
          )
        })}

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 rounded-lg"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <div className="relative">
                <select
                  value={newLink.platform}
                  onChange={(e) => setNewLink(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full bg-black/30 text-white rounded-lg border p-3 pl-11 appearance-none cursor-pointer
                           focus:outline-none focus:border-opacity-100 transition-colors"
                  style={{ 
                    borderColor: `${primaryColor}30`,
                    backgroundImage: `linear-gradient(45deg, transparent 50%, ${primaryColor}80 50%), linear-gradient(135deg, ${primaryColor}80 50%, transparent 50%)`,
                    backgroundPosition: 'calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)',
                    backgroundSize: '5px 5px, 5px 5px',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {PLATFORM_OPTIONS.map(platform => {
                    return (
                      <option 
                        key={platform.id} 
                        value={platform.id}
                        className="bg-black/90 py-2"
                      >
                        {platform.label}
                      </option>
                    )
                  })}
                </select>
                {(() => {
                  const selectedPlatform = PLATFORM_OPTIONS.find(p => p.id === newLink.platform)
                  const Icon = selectedPlatform?.icon || FiGlobe
                  return (
                    <Icon 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" 
                      style={{ color: primaryColor }}
                    />
                  )
                })()}
              </div>
              <input
                type="url"
                placeholder="Enter URL"
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                className="w-full bg-black/30 text-white rounded-lg border p-3 pl-11
                         focus:outline-none focus:border-opacity-100 transition-colors"
                style={{ borderColor: `${primaryColor}30` }}
              />
              <div className="relative">
                <FiLink 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: primaryColor }}
                />
              </div>
              <input
                type="text"
                placeholder="Display Label (optional)"
                value={newLink.label}
                onChange={(e) => setNewLink(prev => ({ ...prev, label: e.target.value }))}
                className="w-full bg-black/30 text-white rounded-lg border p-3 pl-11
                         focus:outline-none focus:border-opacity-100 transition-colors"
                style={{ borderColor: `${primaryColor}30` }}
              />
              <div className="relative">
                <FiEdit2 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: primaryColor }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLink}
                  className="px-3 py-1.5 rounded-lg text-sm text-white"
                  style={{ backgroundColor: primaryColor }}
                  disabled={!newLink.url}
                >
                  Add Link
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!links.length && !isAdding && (
          <div className="text-center py-8 text-gray-400">
            {isEditable ? (
              <div className="space-y-4">
                <FiLink className="w-8 h-8 mx-auto opacity-50" />
                <div>
                  <p className="text-sm">No social links added yet</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAdding(true)}
                    className="mt-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 mx-auto"
                    style={{ backgroundColor: `${primaryColor}30` }}
                  >
                    <FiPlus className="w-4 h-4" style={{ color: primaryColor }} />
                    <span className="text-white">Add Your First Link</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <p className="text-sm">No social links added yet</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
} 