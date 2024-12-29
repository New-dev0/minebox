import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiX, FiPlus } from 'react-icons/fi'
import { Book } from '../../types'

interface AddBookDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddBook: (book: Omit<Book, 'id' | 'added_at'>) => Promise<void>
  primaryColor: string
}

export default function AddBookDialog({
  isOpen,
  onClose,
  onAddBook,
  primaryColor
}: AddBookDialogProps) {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleSearch = async () => {
    if (!search.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(search)}`
      )
      const data = await response.json()
      setResults(data.items || [])
    } catch (error) {
      console.error('Error searching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBook = async (book: any) => {
    try {
      await onAddBook({
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors?.[0] || 'Unknown',
        cover_url: book.volumeInfo.imageLinks?.thumbnail
      })
      onClose()
    } catch (error) {
      console.error('Error adding book:', error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-black/80 backdrop-blur-xl 
                     border rounded-xl p-6 space-y-4"
            style={{ borderColor: `${primaryColor}20` }}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Add Book</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search books..."
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2
                         text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2
                         transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <FiSearch className="w-4 h-4" />
                Search
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-6 h-6 border-2 border-purple-500 border-t-transparent 
                             rounded-full mx-auto"
                  />
                </div>
              ) : results.length > 0 ? (
                results.map((book: any) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 p-3 rounded-lg bg-white/5 group"
                  >
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <img
                        src={book.volumeInfo.imageLinks.thumbnail}
                        alt={book.volumeInfo.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-black/30 rounded flex items-center 
                                  justify-center text-gray-500">
                        No Cover
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">
                        {book.volumeInfo.title}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {book.volumeInfo.authors?.[0] || 'Unknown author'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {book.volumeInfo.publishedDate?.split('-')[0]}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddBook(book)}
                      className="self-center opacity-0 group-hover:opacity-100 
                               transition-opacity"
                      style={{ color: primaryColor }}
                    >
                      <FiPlus className="w-6 h-6" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {search ? 'No results found' : 'Search for books to add'}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 