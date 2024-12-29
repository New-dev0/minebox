import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatedBackground } from '../../components/backgrounds'
import { FiBox, FiUsers, FiAward, FiGlobe, FiLayers, FiCpu } from 'react-icons/fi'
import ConnectingLines from './components/ConnectingLines'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/navigation/BottomNav'

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[#00ff88] font-bold text-lg sm:text-2xl whitespace-nowrap tracking-wide"
          >
            MineBox
          </motion.div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <motion.a
            href="#features"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-300 hover:text-[#00ff88] transition-colors"
          >
            Features
          </motion.a>
          <motion.a
            href="#about"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 hover:text-[#00ff88] transition-colors"
          >
            About
          </motion.a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/login"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-[#00ff88] border border-[#00ff88]/20 rounded-lg
                       hover:bg-[#00ff88]/10 transition-colors backdrop-blur-sm text-sm sm:text-base"
            >
              Sign In
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/register"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00ff88] text-black rounded-lg
                       hover:bg-[#00ff99] transition-colors text-sm sm:text-base"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>
    </header>
  )
}

const features = [
  {
    icon: FiBox,
    title: "Digital Universe",
    description: "Create your own digital space with customizable themes and interactive 3D environments",
    color: "#00ff88",
    bgPattern: "radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.15) 0%, transparent 50%)"
  },
  {
    icon: FiUsers,
    title: "Connect & Share",
    description: "Build meaningful connections and share your journey with like-minded individuals",
    color: "#00ffcc",
    bgPattern: "radial-gradient(circle at 30% 70%, rgba(0, 255, 204, 0.15) 0%, transparent 50%)"
  },
  {
    icon: FiAward,
    title: "Achievements",
    description: "Unlock achievements and showcase your milestones in your personal timeline",
    color: "#00ccff",
    bgPattern: "radial-gradient(circle at 70% 30%, rgba(0, 204, 255, 0.15) 0%, transparent 50%)"
  },
  {
    icon: FiGlobe,
    title: "Global Community",
    description: "Join a worldwide community of creators, innovators, and storytellers",
    color: "#00ff88",
    bgPattern: "radial-gradient(circle at 20% 80%, rgba(0, 255, 136, 0.15) 0%, transparent 50%)"
  },
  {
    icon: FiLayers,
    title: "Rich Content",
    description: "Share moments, stories, and experiences with immersive multimedia content",
    color: "#00ffcc",
    bgPattern: "radial-gradient(circle at 80% 20%, rgba(0, 255, 204, 0.15) 0%, transparent 50%)"
  },
  {
    icon: FiCpu,
    title: "Smart Integration",
    description: "Seamlessly integrate your digital presence across multiple platforms",
    color: "#00ccff",
    bgPattern: "radial-gradient(circle at 40% 60%, rgba(0, 204, 255, 0.15) 0%, transparent 50%)"
  }
]

function FeatureSection({ icon: Icon, title, description, color, bgPattern }: any) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ background: bgPattern }}
      />
      
      <ConnectingLines />

      {/* Translucent Box */}
      <div 
        className="absolute inset-x-4 md:inset-x-12 top-1/2 -translate-y-1/2 h-[80vh]
                   backdrop-blur-xl rounded-3xl"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          border: `1px solid ${color}20`,
          boxShadow: `0 0 40px ${color}10`
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8"
        >
          {/* Icon Side */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block relative"
            >
              {/* Icon Glow Effect */}
              <div 
                className="absolute inset-0 blur-2xl opacity-50"
                style={{ backgroundColor: color }}
              />
              <Icon className="w-32 h-32 relative z-10" style={{ color }} />
            </motion.div>
          </div>

          {/* Content Side */}
          <div className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold"
              style={{ color }}
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-gray-300"
            >
              {description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                className="px-8 py-3 rounded-lg font-medium text-lg
                         transition-all duration-300 backdrop-blur-md"
                style={{ 
                  backgroundColor: `${color}20`,
                  color,
                  border: `1px solid ${color}40`,
                  boxShadow: `0 0 20px ${color}20`
                }}
              >
                Learn More
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div 
        className="absolute bottom-0 left-0 w-32 h-32 rounded-tr-full"
        style={{ 
          background: `linear-gradient(135deg, ${color}20, transparent)`,
          backdropFilter: 'blur(10px)'
        }}
      />
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-bl-full"
        style={{ 
          background: `linear-gradient(315deg, ${color}20, transparent)`,
          backdropFilter: 'blur(10px)'
        }}
      />
    </div>
  )
}

interface RecentUser {
  id: string
  username: string
  avatar_url: string
  created_at: string
  bio: string
}

function RecentUsers() {
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchRecentUsers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, created_at, bio')
        .order('created_at', { ascending: false })
        .limit(6)

      if (!error && data) {
        setRecentUsers(data)
      }
    }

    fetchRecentUsers()
  }, [])

  const handleProfileClick = (username: string) => {
    navigate(`/${username}`)
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center text-[#00ff88]"
        >
          Recently Joined Explorers
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recentUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Card Background with Glow */}
              <div className="absolute -inset-0.5 bg-[#00ff88] opacity-20 blur-lg
                           group-hover:opacity-30 transition duration-300 rounded-xl" />
              
              {/* Card Content */}
              <div className="relative bg-black/40 backdrop-blur-xl p-6 rounded-xl
                           border border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-colors">
                {/* Make the profile section clickable */}
                <motion.div 
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => handleProfileClick(user.username)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="absolute -inset-1 bg-[#00ff88] rounded-full opacity-75 blur-sm
                                 group-hover:opacity-100 transition duration-300" />
                    <img
                      src={user.avatar_url || '/default-avatar.png'}
                      alt={user.username}
                      className="w-20 h-20 rounded-full border-2 border-[#00ff88] relative"
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h4 className="text-[#00ff88] font-medium text-xl mb-1">{user.username}</h4>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {user.bio || 'New Explorer'}
                    </p>
                  </div>
                </motion.div>

                {/* Follow Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-6 py-3 bg-[#00ff88]/10 text-[#00ff88] rounded-lg
                           border border-[#00ff88]/20 hover:bg-[#00ff88]/20
                           transition-colors font-medium"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering profile click
                    // Handle follow logic here
                  }}
                >
                  Follow Journey
                </motion.button>

                {/* Time Joined */}
                <div className="absolute top-6 right-6 text-sm text-[#00ff88]/60">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="relative bg-black overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-screen">
        <div className="absolute inset-0 z-0">
          <AnimatedBackground sceneType="saturn" showTitle={true} />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          <div className="max-w-4xl w-full text-center space-y-16 mt-32">

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#00ff99' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-[#00ff88] text-black rounded-lg font-medium
                         text-lg shadow-[0_0_20px_rgba(0,255,136,0.3)]
                         hover:shadow-[0_0_30px_rgba(0,255,136,0.5)]
                         transition-all duration-300"
              >
              Start Your Story
            </motion.button>
            <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  borderColor: '#00ff99'
                }}
              whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-transparent text-[#00ff88] rounded-lg font-medium
                         text-lg border border-[#00ff88] backdrop-blur-sm
                         hover:border-[#00ff99] transition-all duration-300"
              >
                Continue Journey
            </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Recent Users Section */}
      <RecentUsers />

      {/* Feature Sections */}
      {features.map((feature, index) => (
        <FeatureSection key={index} {...feature} index={index} />
      ))}

      {/* Footer Section */}
      <div className="min-h-screen relative flex items-center justify-center p-4 pb-20 md:pb-4">
        <ConnectingLines />
        <div className="relative z-10 text-center space-y-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-5xl md:text-6xl font-bold text-[#00ff88]"
          >
            Ready to Begin?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-8 py-3 bg-[#00ff88] text-black rounded-lg font-medium
                           text-lg shadow-[0_0_20px_rgba(0,255,136,0.3)]">
              Start Your Story
            </button>
          </motion.div>
        </div>
      </div>

      {/* Add Bottom Navigation */}
      <BottomNav />
    </div>
  )
} 