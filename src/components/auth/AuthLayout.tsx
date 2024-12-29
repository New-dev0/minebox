import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiBox } from 'react-icons/fi'
import { AnimatedBackground } from '../backgrounds'

interface AuthLayoutProps {
  children: React.ReactNode
  showTitle?: boolean
}

export default function AuthLayout({ children, showTitle = true }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatedBackground sceneType="saturn" showTitle={showTitle} />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <nav className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <FiBox className="w-8 h-8 text-[#00ff88]" />
              <span className="font-bold text-2xl text-[#00ff88]">
                MineBox
              </span>
            </motion.div>
          </Link>
        </nav>
      </header>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  )
} 