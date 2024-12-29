import { FiMoreVertical } from 'react-icons/fi'

interface DraggableSectionProps {
  value: string
  isOwnProfile: boolean
  isDraggable?: boolean
  children: React.ReactNode
}

export default function DraggableSection({ 
  isOwnProfile,
  isDraggable = true,
  children 
}: DraggableSectionProps) {
  return (
    <div className="relative group">
      {isOwnProfile && isDraggable && (
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 
                     group-hover:opacity-100 transition-opacity">
          <FiMoreVertical className="w-5 h-5 text-gray-400" />
        </div>
      )}
      {children}
    </div>
  )
} 