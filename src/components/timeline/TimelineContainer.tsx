import { motion } from 'framer-motion'
import { FiClock, FiAward } from 'react-icons/fi'

interface TimelineContainerProps {
  children: React.ReactNode
  primaryColor: string
  points?: number
}

export default function TimelineContainer({ children, primaryColor, points }: TimelineContainerProps) {
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
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <FiClock className="w-5 h-5 sm:w-6 sm:h-6" />
          Timeline
        </h2>
        {points > 0 && (
          <div 
            className="font-bold flex items-center gap-2 text-sm sm:text-base"
            style={{ color: primaryColor }}
          >
            <FiAward className="w-4 h-4 sm:w-5 sm:h-5" />
            {points} XP
          </div>
        )}
      </div>

      {/* Timeline Content */}
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  )
} 