import { motion } from 'framer-motion'
import { TimelineEvent as TimelineEventType, Achievement} from '../../types/index';
import { FiMoreVertical, FiArrowRight } from 'react-icons/fi'
import { ReactNode } from 'react';

interface TimelineEventProps {
  item: TimelineEventType | Achievement 
  primaryColor: string
  isOwnProfile?: boolean
  onMoreClick?: () => void,
  authorName?: string
}

export default function TimelineEvent({ 
  item, 
  primaryColor, 
  isOwnProfile,
  onMoreClick ,
  authorName
}: TimelineEventProps) {
  const isAchievement = 'awarded_at' in item
  const date = new Date(isAchievement ? item.awarded_at : item.created_at)
  
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric'
  });
//  console.log(item)

  // Handle rendering of different event types
  const renderContent = () => {
    if (isAchievement) {
      return item.description
    }

    if (item.type === 'quote') {
        let quoteContent = item.content;
        let quote = item.content;
        let author = authorName;
        if (typeof item.content === 'object') {
          quoteContent = item.content as { quote: string; author: string }
          quote = quoteContent.quote
          author = quoteContent.author;
        }
        return (
          <div className="mt-6 pl-6 border-l-4 border-purple-500/30 relative">
          <div className="absolute -left-3 top-0 text-4xl text-purple-500/30">"</div>
          <p className="text-xl font-light text-white/90 leading-relaxed tracking-wide">
            {quote as string}
          </p>
          <p className="text-sm text-gray-400 mt-4 font-medium tracking-wider">
            — {author}
          </p>
        </div>
      )
    }

    if (item.type === 'blog' && typeof item.content === 'object' && 'cover_image' in item.content && 'title' in item.content && 'preview' in item.content) {
      return (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {item.content.cover_image && (
              <img 
                src={item.content.cover_image} 
                alt={item.content.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">
                {item.content.title}
              </h3>
              <p className="text-gray-400 line-clamp-2">
                {item.content.preview}
              </p>
            </div>
          </div>
          {/* @ts-expect-error: This is a temporary fix to allow the form data to be updated */}
          {item.metadata?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {/* @ts-expect-error: This is a temporary fix to allow the form data to be updated */}
              {item.metadata.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full"
                  style={{ 
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <a
          // @ts-expect-error: This is a temporary fix to allow the form data to be updated
            href={`/blog/${item.metadata.blog_id}`}
            className="inline-flex items-center gap-2 text-sm hover:underline"
            style={{ color: primaryColor }}
          >
            Read more
            <FiArrowRight className="w-4 h-4" />
          </a>
        </div>
      )
    }

    return item.content
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex pb-8 group"
    >
      {/* Left side - Date */}
      <div className="w-16 flex-shrink-0 text-right pt-1 pr-3">
        <div className="text-xs font-medium text-gray-300">
          {formattedDate}
        </div>
        <div className="text-[10px] text-gray-500/70">
          {date.toLocaleTimeString('en-US', { 
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Center - Timeline line and dot */}
      <div className="relative flex flex-col items-center flex-shrink-0 mr-4">
        <div className="w-0.5 bg-purple-500/20 absolute h-full top-6 -z-10" />
        <div 
          className={`w-2 h-2 rounded-full border z-10 mt-2`}
          style={{
            borderColor: `${primaryColor}50`,
            backgroundColor: isAchievement ? `${primaryColor}20` : `${primaryColor}40`
          }}
        />
      </div>

      {/* Right side - Content */}
      <div className="flex-1 min-w-0">
        <div 
          className="bg-black/40 backdrop-blur-sm rounded-lg border p-4 relative
                   hover:bg-black/50 transition-colors duration-200"
          style={{ borderColor: `${primaryColor}20` }}
        >
          {/* Add more options button */}
          {isOwnProfile && onMoreClick && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMoreClick()
              }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/5
                       transition-colors"
            >
              <FiMoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          )}

          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-1 flex-wrap">
                {item.title}
                {isAchievement && item.metadata?.rarity && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ 
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor
                    }}
                  >
                    {item.metadata.rarity}
                  </span>
                )}
              </h3>
              <div className="text-sm text-gray-400 break-words">
                {renderContent() as ReactNode}
              </div>
            </div>
            {isAchievement && item.metadata?.points && (
              <div 
                className="font-bold whitespace-nowrap text-xs"
                style={{ color: primaryColor }}
              >
                +{item.metadata.points} XP
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 