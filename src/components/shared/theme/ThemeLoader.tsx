import { motion } from 'framer-motion'

interface ThemeLoaderProps {
  primaryColor?: string
}

export default function ThemeLoader({ primaryColor = '#8B5CF6' }: ThemeLoaderProps) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-12 h-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
          style={{ borderColor: primaryColor }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 text-sm"
        >
          Loading theme...
        </motion.p>
      </div>
    </div>
  )
} 