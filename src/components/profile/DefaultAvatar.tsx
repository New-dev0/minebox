import { useMemo } from 'react'

interface DefaultAvatarProps {
  username: string
  size?: number
  primaryColor?: string
  shape?: 'circle' | 'square' | 'rounded' | 'hexagon' | 'octagon' | 'double-circle'
}

export default function DefaultAvatar({ 
  username = 'User',
  size = 128,
//  primaryColor = '#8B5CF6',
  shape = 'circle'
}: DefaultAvatarProps) {
  const initials = useMemo(() => {
    return username.charAt(0).toUpperCase()
  }, [username])

  const shapeClasses = {
    'circle': 'rounded-full',
    'square': 'rounded-none',
    'rounded': 'rounded-2xl',
    'hexagon': '',
    'octagon': '',
    'double-circle': 'rounded-full'
  }

  return (
    <div 
      className={`flex items-center justify-center bg-black/20 ${shapeClasses[shape]}`}
      style={{
        width: size,
        height: size,
        clipPath: shape === 'hexagon' 
          ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
          : shape === 'octagon'
          ? 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
          : undefined
      }}
    >
      <span className="text-2xl font-bold text-white">
        {initials}
      </span>
    </div>
  )
} 