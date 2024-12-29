import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black">
      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">MineBox</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                {user?.user_metadata.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                         transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 backdrop-blur-sm rounded-lg border border-purple-500/20 p-6"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to Your Space</h1>
          <p className="text-gray-300">
            This is your personal dashboard. Here you can:
          </p>
          <ul className="mt-4 space-y-2 text-gray-300">
            <li className="flex items-center space-x-2">
              <span className="text-purple-400">•</span>
              <span>Customize your 3D space</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-purple-400">•</span>
              <span>Manage your timeline</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-purple-400">•</span>
              <span>Connect with friends</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-purple-400">•</span>
              <span>Track your achievements</span>
            </li>
          </ul>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { label: 'Timeline Events', value: '0' },
            { label: 'Connections', value: '0' },
            { label: 'Achievements', value: '0' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/30 backdrop-blur-sm rounded-lg border border-purple-500/20 p-6"
            >
              <div className="text-2xl font-bold text-purple-400">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            'Create Event',
            'Edit Profile',
            'View Timeline',
            'Browse Friends',
          ].map((action, index) => (
            <motion.button
              key={action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg
                       border border-purple-500/30 text-white transition-colors"
            >
              {action}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
} 