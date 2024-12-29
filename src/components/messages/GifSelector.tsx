import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiTrendingUp, FiX } from 'react-icons/fi'
import debounce from 'lodash/debounce'

interface GifSelectorProps {
  onSelect: (gif: { url: string, id: string }) => void
  onClose: () => void
  primaryColor: string
}

interface GifData {
  id: string
  title: string
  images: {
    fixed_height: {
      url: string
      width: string
      height: string
    }
    preview_gif: {
      url: string
    }
  }
}

export default function GifSelector({ onSelect, onClose, primaryColor }: GifSelectorProps) {
  const [search, setSearch] = useState('')
  const [gifs, setGifs] = useState<GifData[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'trending' | 'search'>('trending')
  const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY

  if (!GIPHY_API_KEY) {
    console.error('GIPHY API key is missing. Please add VITE_GIPHY_API_KEY to your .env file')
  }

  // Fetch trending GIFs on mount
  useEffect(() => {
    fetchTrendingGifs()
  }, [])

  const fetchTrendingGifs = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`
      )
      const data = await response.json()
      setGifs(data.data)
    } catch (error) {
      console.error('Error fetching trending GIFs:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchGifs = debounce(async (query: string) => {
    if (!query) {
      fetchTrendingGifs()
      return
    }

    try {
      setLoading(true)
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=20`
      )
      const data = await response.json()
      setGifs(data.data)
    } catch (error) {
      console.error('Error searching GIFs:', error)
    } finally {
      setLoading(false)
    }
  }, 500)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearch(query)
    setActiveTab('search')
    searchGifs(query)
  }

  return (
    <div className="h-full flex flex-col w-full md:max-w-[50%] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Select GIF</h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center
                   hover:bg-white/10 transition-colors"
        >
          <FiX className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search GIFs..."
          className="w-full bg-black/30 text-white rounded-xl pl-10 pr-4 py-3
                   border border-gray-800 focus:outline-none focus:border-gray-700
                   placeholder:text-gray-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setActiveTab('trending')
            fetchTrendingGifs()
          }}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors
                    ${activeTab === 'trending' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-black/20 text-gray-400 hover:bg-white/10'}`}
        >
          <FiTrendingUp className="w-4 h-4" />
          <span>Trending</span>
        </motion.button>

        {search && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors
                      ${activeTab === 'search' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-black/20 text-gray-400 hover:bg-white/10'}`}
          >
            <FiSearch className="w-4 h-4" />
            <span>Search</span>
          </motion.button>
        )}
      </div>

      {/* GIFs Grid */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div 
                className="w-8 h-8 border-2 border-transparent border-t-white rounded-full animate-spin"
                style={{ borderTopColor: primaryColor }}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            >
              {gifs.map((gif) => (
                <motion.button
                  key={gif.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect({
                    url: gif.images.fixed_height.url,
                    id: gif.id
                  })}
                  className="relative aspect-video rounded-lg overflow-hidden
                           bg-black/20 hover:ring-2 transition-all"
                  style={{ borderColor: primaryColor }}
                >
                  <img
                    src={gif.images.preview_gif.url}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Powered by GIPHY */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Powered by GIPHY
      </div>
    </div>
  )
} 