import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import AuthLayout from '../../components/auth/AuthLayout'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'invalid' | null>(null)

  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username.length < 3) {
        setUsernameStatus('invalid')
        return
      }

      setIsCheckingUsername(true)
      try {
        const { data: existingUsers, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', formData.username)
          .single()

        if (error && error.code === 'PGRST116') {
          setUsernameStatus('available')
        } else if (existingUsers) {
          setUsernameStatus('taken')
        }
      } catch (error) {
        console.error('Error checking username:', error)
      } finally {
        setIsCheckingUsername(false)
      }
    }

    const timeoutId = setTimeout(checkUsername, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    // Validate username status
    if (usernameStatus !== 'available') {
      setError('Please choose a valid username')
      return
    }

    try {
      setLoading(true)

      // Create the user account first
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
          emailRedirectTo: `${window.location.origin}/setup`
        }
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        try {
          // Create profile record with the new user's ID
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              username: formData.username,
              email: formData.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              setup_completed: false,
              theme: {
                backgroundType: 'saturn',
                customColors: {
                  primary: '#8B5CF6',
                  background: '#030014'
                }
              }
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            })

          if (profileError) throw profileError

          // Set session data
          const { data: session } = await supabase.auth.getSession()
          if (session) {
            // Navigate to profile setup
            navigate('/setup', { 
              replace: true,
              state: { 
                newUser: true,
                username: formData.username 
              }
            })
          }
        } catch (profileError) {
          // If profile creation fails, delete the auth user
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw profileError
        }
      }
    } catch (err) {
      console.error('Registration error:', err)
      if (err instanceof Error) {
        if (err.message.includes('duplicate key')) {
          setError('This email is already registered')
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to register. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-[#00ff88]/20"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Create Account
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className={`w-full bg-black/30 text-white rounded-lg pl-10 pr-12 py-3
                            border focus:outline-none placeholder:text-gray-600
                            ${usernameStatus === 'available' ? 'border-green-500/40' : 
                              usernameStatus === 'taken' ? 'border-red-500/40' : 
                              'border-[#00ff88]/20'}`}
                  placeholder="Choose a username"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isCheckingUsername ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-5 h-5 border-2 border-t-transparent rounded-full"
                      style={{ borderColor: '#00ff88' }}
                    />
                  ) : usernameStatus === 'available' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500"
                    >
                      <FiCheck className="w-5 h-5" />
                    </motion.div>
                  ) : usernameStatus === 'taken' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-red-500"
                    >
                      <FiX className="w-5 h-5" />
                    </motion.div>
                  ) : null}
                </div>
              </div>
              {usernameStatus && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-1 text-sm ${
                    usernameStatus === 'available' ? 'text-green-500' :
                    usernameStatus === 'taken' ? 'text-red-500' :
                    'text-gray-400'
                  }`}
                >
                  {usernameStatus === 'available' ? 'Username is available!' :
                   usernameStatus === 'taken' ? 'Username is already taken' :
                   usernameStatus === 'invalid' ? 'Username must be at least 3 characters' : ''}
                </motion.p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full bg-black/30 text-white rounded-lg pl-10 pr-4 py-3
                           border border-[#00ff88]/20 focus:border-[#00ff88]/40
                           focus:outline-none placeholder:text-gray-600"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="w-full bg-black/30 text-white rounded-lg pl-10 pr-12 py-3
                           border border-[#00ff88]/20 focus:border-[#00ff88]/40
                           focus:outline-none placeholder:text-gray-600"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                           hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="w-full bg-black/30 text-white rounded-lg pl-10 pr-12 py-3
                           border border-[#00ff88]/20 focus:border-[#00ff88]/40
                           focus:outline-none placeholder:text-gray-600"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || usernameStatus !== 'available'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#00ff88] text-black rounded-lg py-3 font-medium
                       hover:bg-[#00ff99] transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00ff88] hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  )
} 