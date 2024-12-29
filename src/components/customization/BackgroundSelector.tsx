import { FiBox, FiActivity, FiGrid, FiDroplet } from 'react-icons/fi'
import { TbSteeringWheel } from 'react-icons/tb'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'
import { BackgroundType } from '../../types'

const backgroundOptions: { id: BackgroundType, label: string, icon: React.ElementType }[] = [
  { id: 'saturn', label: 'Saturn', icon: FiBox },
  { id: 'scene3d-war', label: 'War', icon: FiActivity },
  { id: 'pattern', label: 'Pattern', icon: FiGrid },
  { id: 'particles', label: 'Particles', icon: FiDroplet },
  { id: 'waves', label: 'Waves', icon: FiActivity },
  { id: 'pixels', label: 'Pixels', icon: FiGrid },
  { id: 'racing', label: 'Racing', icon: TbSteeringWheel }
]

export default function BackgroundSelector() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const { backgroundType, setBackgroundType, pattern } = useTheme()

  const handleBackgroundChange = async (type: string) => {
    if (!user) return
    setSaving(true)

    try {
      // First update local state
      // @ts-expect-error: type is not in the   enum
      setBackgroundType(type as BackgroundType);

      // Get current theme first
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.id)
        .single()

      // Merge with existing theme
      const updatedTheme = {
        ...currentProfile?.theme,
        backgroundType: type,
        customColors: {
          ...(currentProfile?.theme?.customColors || {}),
          primary: pattern?.css?.backgroundColor || '#00e5ff',
          background: '#030014'
        }
      }

      // Save merged theme
      const { error } = await supabase
        .from('profiles')
        .update({
          theme: updatedTheme,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error saving background:', error)
      // Revert local state on error
      setBackgroundType(backgroundType)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {backgroundOptions.map(option => (
          <button
            key={option.id}
            onClick={() => handleBackgroundChange(option.id)}
            disabled={saving}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                     ${backgroundType === option.id 
                       ? 'bg-white/10 border-2' 
                       : 'bg-black/30 hover:bg-white/5 border border-white/10'}`}
            style={{ 
              borderColor: backgroundType === option.id ? pattern?.css?.backgroundColor : undefined,
              color: backgroundType === option.id ? pattern?.css?.backgroundColor : 'white' 
            }}
          >
            <option.icon className="w-5 h-5" />
            <span>{option.label}</span>
            {saving && backgroundType === option.id && (
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                   style={{ borderColor: `${pattern?.css?.backgroundColor}40`, borderTopColor: 'transparent' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
} 