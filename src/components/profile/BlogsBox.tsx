import { motion } from 'framer-motion'
import { FiFeather, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export interface BlogPost {
  id: string
  title: string
  content: string
  created_at: string
}

interface BlogsBoxProps {
  posts: BlogPost[]
  isLoading?: boolean
  primaryColor: string
  username: string
}

export default function BlogsBox({ posts, isLoading, primaryColor, username }: BlogsBoxProps) {
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto w-full bg-black/40 backdrop-blur-xl rounded-2xl border p-8"
           style={{ borderColor: `${primaryColor}20` }}>
        <div className="animate-pulse space-y-6">
          <div className="h-7 bg-white/10 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <div className="h-5 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
                <div className="h-3 bg-white/10 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto w-full bg-black/40 backdrop-blur-xl rounded-2xl border overflow-hidden"
         style={{ borderColor: `${primaryColor}20` }}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <FiFeather className="w-6 h-6" style={{ color: primaryColor }} />
            Blog Posts
          </h2>
          <Link 
            to={`/${username}?tab=blogs`}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: primaryColor }}
          >
            View All
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map(post => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <Link 
                  to={`/blog/${post.id}`}
                  className="block p-4 -mx-4 rounded-xl transition-colors hover:bg-white/5"
                >
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 
                               transition-colors mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3 group-hover:text-gray-300
                               transition-colors">
                    {post.content}
                  </p>
                  <div className="text-xs font-medium" style={{ color: primaryColor }}>
                    {new Date(post.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                 style={{ backgroundColor: `${primaryColor}10` }}>
              <FiFeather className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <p className="text-lg font-medium text-white mb-2">No blog posts yet</p>
            <p className="text-sm text-gray-400">
              Share your thoughts and experiences with the world
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 