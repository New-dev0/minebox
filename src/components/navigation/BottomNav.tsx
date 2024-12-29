import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiMessageSquare, FiUser, FiCompass, FiPlay } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

export default function BottomNav() {
  const location = useLocation()
  const { user } = useAuth()
  const { customColors } = useTheme();
  const primaryColor = customColors?.primary || '#00ff88';
  
  if (!user || location.pathname.startsWith('/messages/')) return null

  const navItems = [
    { id: 'feed', icon: FiCompass, label: 'Feed', path: '/feeds' },
    { id: 'search', icon: FiSearch, label: 'Search', path: '/search' },
    { id: 'messages', icon: FiMessageSquare, label: 'Messages', path: '/messages' },
    { id: 'games', icon: FiPlay, label: 'Games', path: '/games' },
    { 
      id: 'profile',
      icon: FiUser, 
      label: 'Profile', 
      path: `/${user.user_metadata.username}`,
      isProfile: true
    }
  ]

  const isActive = (path: string, isProfile?: boolean) => {
    if (path === '/search' || path === '/network' || path === '/messages') {
      return location.pathname === path
    }
    if (isProfile) {
      return location.pathname === path && location.state?.fromProfile
    }
    return location.pathname === path
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl 
                 border-t border-gray-800 z-50 md:hidden"
      style={{ borderTop: `1px solid ${primaryColor}20` }}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const active = isActive(item.path, item.isProfile)
          
          return (
            <Link 
              key={item.id}
              to={item.path}
              state={{ fromProfile: item.isProfile }}
              className="flex flex-col items-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center p-1 rounded-lg transition-colors"
                style={{ 
                  color: active ? primaryColor : '#9CA3AF',
                  backgroundColor: active ? `${primaryColor}10` : 'transparent'
                }}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 