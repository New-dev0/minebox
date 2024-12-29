import { motion } from 'framer-motion'
import AuthBackground from '../../components/auth/AuthBackground'

export default function Register() {
  return (
    <div className="relative min-h-screen bg-black">
      <AuthBackground />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Your existing register form content */}
        </motion.div>
      </div>
    </div>
  )
} 