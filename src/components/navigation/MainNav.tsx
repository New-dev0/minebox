import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiSearch, FiMessageSquare, FiUser,
  FiChevronRight, FiChevronLeft, FiCompass,
  FiZap, FiShoppingCart,
} from 'react-icons/fi'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import ProfileAvatar from '../profile/ProfileAvatar'
import { supabase } from '../../lib/supabase'
import MineBoxIcon from '../shared/MineBoxIcon'

interface Profile {
  id: string
  username: string
  avatar_url: string | null
  avatar_shape?: 'circle' | 'square' | 'rounded'
  theme?: {
    customColors?: {
      primary: string
    }
  }
}

interface NavItem {
  icon: typeof FiSearch
  label: string
  path: string
}

export default function MainNav() {
  const [isExpanded, setIsExpanded] = useState(false)
  const location = useLocation()
  const { customColors } = useTheme();
  const primaryColor = customColors?.primary || '#00ff88';

  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
      }
    }

    fetchProfile()

    // Subscribe to realtime profile changes
    const channel = supabase
      .channel('profile_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, () => {
        fetchProfile()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  if (!user) return null

  const navItems: NavItem[] = [
    { icon: FiCompass, label: 'Feed', path: '/feeds' },
    { icon: FiSearch, label: 'Search', path: '/search' },
    {icon: FiZap  , label: 'Games', path: '/games'},
//    { icon: FiUsers, label: 'Network', path: '/network' },
    { icon: FiMessageSquare, label: 'Messages', path: '/messages' }
  ]

  const desktopNavItems: NavItem[] = [
    ...navItems,
//    { icon: FiZap, label: 'Games', path: '/games' },
    { icon: FiShoppingCart, label: 'Pet Store', path: '/store' },
    { icon: FiUser, label: 'Profile', path: `/${user?.user_metadata.username}` }
  ]

  const mobileNavItems: NavItem[] = [
    ...navItems,
    { icon: FiUser, label: 'Profile', path: `/${user?.user_metadata.username}` }
  ]

  return (
    <>
      {/* Mobile Top Nav */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-xl border-b border-white/10 z-30 md:hidden">
        <div className="flex items-center justify-center h-full px-4">
          
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-xl border-t border-white/10 z-30 md:hidden">
        <div className="flex items-center justify-around h-full px-4">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg
                         transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Side Nav */}
      <motion.nav 
        className="fixed left-0 top-0 h-full bg-black/40 backdrop-blur-xl z-50 
                  transition-all duration-300 hidden md:flex flex-col"
        style={{ 
          width: isExpanded ? '16rem' : '5rem',
          borderRight: `1px solid ${primaryColor}10`
        }}
        initial={false}
      >
        {/* Toggle Button */}
        <motion.button
          className="absolute -right-3 top-8 w-6 h-6 rounded-full
                     flex items-center justify-center text-black hover:scale-110 transition-transform"
          style={{ backgroundColor: primaryColor }}
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? <FiChevronLeft /> : <FiChevronRight />}
        </motion.button>

        {/* Logo */}
        <Link 
          to="/"
          className={`p-5 flex items-center gap-3 ${
            isExpanded ? 'justify-start' : 'justify-center'
          }`}
          style={{ borderBottom: `1px solid ${primaryColor}10` }}
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <MineBoxIcon className="w-6 h-6" />
          </div>
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium text-lg"
              style={{ color: primaryColor }}
            >
              MineBox
            </motion.span>
          )}
        </Link>

        {/* Nav Items */}
        <div className="flex-1 py-8 space-y-2">
          {desktopNavItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-3 transition-colors relative
                         ${isExpanded ? 'mx-3 rounded-xl' : 'justify-center'}`}
                style={{
                  color: isActive ? primaryColor : '#9CA3AF',
                  backgroundColor: isActive ? `${primaryColor}10` : 'transparent'
                }}
              >
                <item.icon className="w-6 h-6" />
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
                {!isExpanded && isActive && (
                  <motion.div
                    className="absolute left-0 w-1 h-8 rounded-r-full"
                    style={{ backgroundColor: primaryColor }}
                    layoutId="activeIndicator"
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* User Profile */}
        <div 
          className={`p-5 flex items-center gap-3 ${
            isExpanded ? 'justify-start' : 'justify-center'
          }`}
          style={{ borderTop: `1px solid ${primaryColor}10` }}
        >
          <div className="relative">
            <ProfileAvatar
              // @ts-expect-error: This is a temporary fix to allow the profile data to be updated
              profile={profile}
              size="xs"
              shape={profile?.avatar_shape || 'circle'}
              primaryColor={primaryColor}
              showEmoji={false}
            />
            <div 
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1"
            >
              <div className="font-medium" style={{ color: primaryColor }}>
                {profile?.username || user.user_metadata.username}
              </div>
              <div className="text-xs text-gray-400">View Profile</div>
            </motion.div>
          )}
        </div>
      </motion.nav>
    </>
  )
} 