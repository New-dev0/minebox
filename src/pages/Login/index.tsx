import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AuthBackground from '../../components/auth/AuthBackground'

export default function Login() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background */}
      <AuthBackground />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-black/30 backdrop-blur-xl p-8 rounded-2xl
                   border border-[#00ff88]/20"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Welcome Back
          </h2>

          <form className="space-y-6">
            {/* Your form fields */}
            <div className="space-y-2">
              <label className="text-gray-300">Email</label>
              <input 
                type="email"
                className="w-full px-4 py-3 bg-black/50 border border-[#00ff88]/20
                         rounded-lg text-white focus:outline-none focus:border-[#00ff88]/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-300">Password</label>
              <input 
                type="password"
                className="w-full px-4 py-3 bg-black/50 border border-[#00ff88]/20
                         rounded-lg text-white focus:outline-none focus:border-[#00ff88]/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00ff88] text-black rounded-lg font-medium
                       hover:bg-[#00ff99] transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="mt-4 text-center text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00ff88] hover:text-[#00ff99]">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
} 