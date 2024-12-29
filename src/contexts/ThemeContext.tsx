import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

type BackgroundType = 
  | 'saturn' 
  | 'scene3d-war' 
  | 'pattern' 
  | 'particles' 
  | 'waves' 
  | 'pixels'
  | 'heartbeat'
  | 'racing'
  | 'space-pikachu'
  | 'ai-coin'
  | 'fantasy'
  | 'cyber-world'

interface ThemeContextType {
  backgroundType: BackgroundType
  setBackgroundType: (type: BackgroundType) => void
  customColors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  setCustomColors: (colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }) => void
  pattern?: {
    css: {
      backgroundColor: string
      backgroundImage?: string
      backgroundSize?: string
      backgroundPosition?: string
    }
  }
}

const defaultColors = {
  primary: '#00ff88',
  secondary: '#ff00ff',
  accent: '#00ffff',
  background: '#1a1a2e'
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [customColors, setCustomColors] = useState(defaultColors)
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('saturn')

  // Fetch theme from profile
  useEffect(() => {
    if (!user) return

    const fetchTheme = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching theme:', error)
        return
      }

      if (profile?.theme) {
        // Update theme state from profile
        const theme = profile.theme as any
        if (theme.customColors) {
          setCustomColors(theme.customColors)
        }
        if (theme.background) {
          setBackgroundType(theme.background as BackgroundType)
        }
      }
    }

    fetchTheme()

    // Subscribe to realtime profile changes
    const channel = supabase
      .channel('theme_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, () => {
        fetchTheme()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  // Save theme changes to profile
  useEffect(() => {
    if (!user) return

    const saveTheme = async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          theme: {
            customColors,
            background: backgroundType
          }
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error saving theme:', error)
      }
    }

    // Debounce theme saves to prevent too many updates
    const timeoutId = setTimeout(saveTheme, 500)
    return () => clearTimeout(timeoutId)
  }, [user, customColors, backgroundType])

  const value = {
    customColors,
    setCustomColors,
    backgroundType,
    setBackgroundType
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 