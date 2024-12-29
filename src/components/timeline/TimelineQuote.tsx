import { motion } from 'framer-motion'
import { FiMessageSquare } from 'react-icons/fi'

interface TimelineQuoteProps {
  content: {
    quote: string
    author: string
  }
  date: string
  primaryColor?: string
}

export default function TimelineQuote({ content, date, primaryColor = '#8B5CF6' }: TimelineQuoteProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-sm rounded-lg p-6 hover:bg-black/50 transition-all duration-300"
      style={{ 
        borderColor: `${primaryColor}20`,
        borderWidth: '1px',
        boxShadow: `0 4px 20px ${primaryColor}20`
      }}
    >
      <div className="flex items-start gap-6">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center transform hover:scale-105 transition-transform"
          style={{ 
            backgroundColor: `${primaryColor}20`,
            boxShadow: `0 2px 8px ${primaryColor}30`
          }}
        >
          <FiMessageSquare 
            className="w-6 h-6" 
            style={{ color: primaryColor }} 
          />
        </div>
        <div className="flex-1">
          <blockquote 
            className="text-2xl text-white italic leading-relaxed"
            style={{ textShadow: `0 2px 10px ${primaryColor}30` }}
          >
            "{content.quote}"
          </blockquote>
          <div className="mt-6 flex items-center justify-between text-sm">
            <span 
              className="font-semibold tracking-wide"
              style={{ color: `${primaryColor}ee` }}
            >
              — {content.author}
            </span>
            <span 
              className="text-sm bg-black/30 px-3 py-1 rounded-full"
              style={{ color: `${primaryColor}cc` }}
            >
              {date}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}