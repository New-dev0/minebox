import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

/*
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
*/

export default function NavBar() {
  const { user } = useAuth()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
//  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
         // setProfile(profile)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
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

//  const primaryColor = profile?.theme?.customColors?.primary || '#8B5CF6'
if (isLoading) {
  return <div>Loading...</div>
}
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-sm z-50"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <motion.div 
              className="text-2xl font-bold text-white hover:text-purple-400 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              MineBox
            </motion.div>
          </Link>
          <div className="flex items-center space-x-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#about">About</NavLink>
            {user ? <></> : (
              <NavLink href="/login" className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700">
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

function NavLink({ href, children, className = '' }: { 
  href: string
  children: React.ReactNode
  className?: string 
}) {
  return (
    <motion.a
      href={href}
      className={`text-white hover:text-purple-400 font-medium transition-colors ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  )
} 