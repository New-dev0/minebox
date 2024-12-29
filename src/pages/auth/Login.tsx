import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import AuthLayout from '../../components/auth/AuthLayout'
//import { THEME } from '../../constants/colors'

export default function Login() {
//  const navigate = useNavigate()
//  const [searchParams] = useSearchParams()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      setLoading(true)
      const { error } = await signIn(email, password)
      if (error) throw error
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout showTitle={true}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-black/30 backdrop-blur-xl p-8 rounded-2xl
                 border border-[#00ff88]/20"
      >
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <p className="text-red-400 text-sm text-center">{error}</p>
          </motion.div>
        )}

        <h2 className="text-3xl font-bold mb-6 text-center text-[#00ff88]">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-gray-300">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-[#00ff88]/20 rounded-lg 
                       text-white focus:outline-none focus:border-[#00ff88]/40 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-300">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-[#00ff88]/20 rounded-lg 
                       text-white focus:outline-none focus:border-[#00ff88]/40 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00ff88] text-black rounded-lg font-medium
                     hover:bg-[#00ff99] transition-all duration-300"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-400">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-[#00ff88] hover:text-[#00ff99] transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
} 