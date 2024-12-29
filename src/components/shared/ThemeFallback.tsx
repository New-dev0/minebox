import { motion } from 'framer-motion'
import { FiRefreshCw } from 'react-icons/fi'

interface ThemeFallbackProps {
  onRetry: () => void
  primaryColor?: string
}

export default function ThemeFallback({ onRetry, primaryColor = '#8B5CF6' }: ThemeFallbackProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/60 backdrop-blur-md rounded-lg border p-6 max-w-md text-center"
        style={{ borderColor: `${primaryColor}20` }}
      >
        <FiRefreshCw className="w-12 h-12 mx-auto mb-4" style={{ color: primaryColor }} />
        <h2 className="text-xl font-bold text-white mb-2">Theme Not Available</h2>
        <p className="text-gray-300 mb-4">
          The selected theme couldn't be loaded. Try a different theme or retry.
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-white text-sm"
          style={{ backgroundColor: primaryColor }}
        >
          Try Again
        </button>
      </motion.div>
    </div>
  )
} 