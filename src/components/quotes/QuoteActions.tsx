import { motion } from 'framer-motion'

interface QuoteActionsProps {
  onCancel: (e: React.FormEvent<HTMLButtonElement>) => void
  onSubmit: (e: React.FormEvent<HTMLButtonElement>) => void
  primaryColor: string
}

export default function QuoteActions({ onCancel, onSubmit, primaryColor }: QuoteActionsProps) {
  return (
    <div className="flex justify-end gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCancel}
        className="px-4 py-2 bg-black/30 text-white rounded-lg 
                 text-sm sm:text-base transition-colors duration-200 hover:bg-opacity-20"
        style={{
          borderColor: `${primaryColor}30`,
          borderWidth: '1px'
        }}
      >
        Cancel
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSubmit}
        className="px-4 py-2 text-white rounded-lg 
                 text-sm sm:text-base transition-colors duration-200 hover:opacity-80"
        style={{
          backgroundColor: primaryColor
        }}
      >
        Share Quote
      </motion.button>
    </div>
  )
} 