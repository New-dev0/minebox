import { FiClock } from 'react-icons/fi'

interface EmptyTimelineProps {
  isOwnProfile: boolean
}

export default function EmptyTimeline({ isOwnProfile }: EmptyTimelineProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <FiClock className="w-12 h-12 mb-4" />
      <h3 className="text-xl font-medium mb-2">No Timeline Events Yet</h3>
      <p className="text-sm text-gray-500">
        {isOwnProfile 
          ? 'Start adding moments to your timeline'
          : 'No moments have been shared yet'}
      </p>
    </div>
  )
} 