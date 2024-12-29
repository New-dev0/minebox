import { motion } from 'framer-motion'
import { Book } from '../../types'
import { FiBook, FiPlus } from 'react-icons/fi'

interface BookshelfBoxProps {
  books: Book[]
  isLoading: boolean
  primaryColor: string
  isOwnProfile: boolean
  onAddBook?: () => void
}

export default function BookshelfBox({ 
  books, 
  isLoading, 
  primaryColor,
  isOwnProfile,
  onAddBook 
}: BookshelfBoxProps) {
  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border p-6"
           style={{ borderColor: `${primaryColor}20` }}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-white/10 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-white/10 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border overflow-hidden max-w-3xl mx-auto w-full"
         style={{ borderColor: `${primaryColor}20` }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiBook className="w-5 h-5" style={{ color: primaryColor }} />
            Bookshelf
          </h2>
          {isOwnProfile && onAddBook && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddBook}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <FiPlus className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="text-white">Add Book</span>
            </motion.button>
          )}
        </div>

        {books.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FiBook className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No books added yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Wooden shelf background */}
            <div 
              className="absolute inset-x-0 h-full bg-gradient-to-b from-[#3c2a21] to-[#2c1810] rounded-lg"
              style={{
                transform: 'perspective(1000px) rotateX(10deg)',
                transformOrigin: 'center bottom',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.2)'
              }}
            />
            
            {/* Books grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 relative pt-4 pb-8">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ rotateY: -15, x: -20, opacity: 0 }}
                  animate={{ rotateY: 0, x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ 
                    rotateY: 15,
                    scale: 1.05,
                    z: 20,
                    transition: { duration: 0.3 }
                  }}
                  className="relative aspect-[2/3] rounded-lg overflow-hidden group transform-gpu"
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3), -5px 5px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Book spine effect */}
                  <div 
                    className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-r"
                    style={{ 
                      background: `linear-gradient(to right, ${primaryColor}40, transparent)`,
                    }}
                  />
                  
                  {/* Book content */}
                  {book.cover_url ? (
                    <img 
                      src={book.cover_url} 
                      alt={book.title}
                      className="w-full h-full object-cover transform-gpu transition-transform duration-300
                               group-hover:scale-110"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center bg-black/30"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      <span className="text-white text-sm text-center p-2">
                        {book.title}
                      </span>
                    </div>
                  )}
                  
                  {/* Book info overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                flex flex-col justify-end p-3 backdrop-blur-sm">
                    <h3 className="text-white font-medium text-sm">{book.title}</h3>
                    <p className="text-gray-300 text-xs">{book.author}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Shelf shadow */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-black/40 to-transparent"
              style={{
                transform: 'translateY(100%)',
                filter: 'blur(4px)'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
} 