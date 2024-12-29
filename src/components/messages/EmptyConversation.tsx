import { motion } from 'framer-motion'
import { FiMessageSquare } from 'react-icons/fi'

interface EmptyConversationProps {
  primaryColor: string
}

export default function EmptyConversation({ primaryColor }: EmptyConversationProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${primaryColor}10` }}
      >
        <FiMessageSquare className="w-8 h-8" style={{ color: primaryColor }} />
      </motion.div>
      <h3 className="text-xl font-medium" style={{ color: primaryColor }}>
        No Messages Yet
      </h3>
      <p className="text-center text-gray-400 max-w-sm">
        Start a conversation by selecting a user from your network or use the search 
        to find someone new.
      </p>
    </div>
  )
} 