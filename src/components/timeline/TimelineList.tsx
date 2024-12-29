import TimelineEvent from './TimelineEvent'
import EmptyTimeline from './EmptyTimeline'
import TimelineContainer from './TimelineContainer'
import { TimelineEvent as TimelineEventType } from '../../types/index'
import { useState } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import BottomSheet from '../shared/BottomSheet'
import { Achievement } from '../../types/index'


interface TimelineListProps {
  events: Array<TimelineEventType | Achievement>
  primaryColor: string
  isOwnProfile: boolean
  points?: number
  authorName?: string
}

interface TimelineItemAction {
  id: string
  type: 'achievement' | 'post'
}

export default function TimelineList({ events, primaryColor, isOwnProfile, points = 0,
  authorName
 }: TimelineListProps) {
  const [selectedItem, setSelectedItem] = useState<TimelineItemAction | null>(null)
  const [showActions, setShowActions] = useState(false)

  const handleDelete = async () => {
    if (!selectedItem) return
    
    try {
      const { error } = await supabase
        .from(selectedItem.type === 'achievement' ? 'achievements' : 'posts')
        .delete()
        .eq('id', selectedItem.id)

      if (error) throw error
      setShowActions(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const sortedEvents = events
    .map(event => ({
      ...event,
      event_date: 'awarded_at' in event ? event.awarded_at : event.event_date
    }))
    // @ts-expect-error: This is a temporary fix to allow the form data to be updated
    .sort((a, b) => new Date(b.event_date || b.created_at).getTime() - 
    // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                    new Date(a.event_date || a.created_at).getTime())

  return (
    <>
      <TimelineContainer primaryColor={primaryColor} points={points}>
        {!events.length ? (
          <EmptyTimeline isOwnProfile={isOwnProfile} />
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((item) => (
              <TimelineEvent 
                key={item.id} 
                item={item}
                primaryColor={primaryColor}
                isOwnProfile={isOwnProfile}
                authorName={authorName}
                onMoreClick={() => {

                  setSelectedItem({
                    id: item.id,
                    type: item.type as 'achievement' | 'post'
                  })
                  setShowActions(true)
                }}
              />
            ))}
          </div>
        )}
      </TimelineContainer>

      <BottomSheet
        isOpen={showActions}
        onClose={() => {
          setShowActions(false)
          setSelectedItem(null)
        }}
      >
        <div className="p-4 space-y-4">
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                     bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
          >
            <FiTrash2 className="w-5 h-5" />
            <span>Delete {selectedItem?.type === 'achievement' ? 'Achievement' : 'Post'}</span>
          </button>
        </div>
      </BottomSheet>
    </>
  )
} 