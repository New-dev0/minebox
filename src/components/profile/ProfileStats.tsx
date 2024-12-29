import { motion } from 'framer-motion'
import { FiEdit3, FiUsers, FiAward } from 'react-icons/fi'

interface ProfileStatsProps {
  stats?: {
    posts: number
    friends: number
    achievements: number
  }
  primaryColor: string
}

export default function ProfileStats({ stats, primaryColor }: ProfileStatsProps) {
  const statItems = [
    { 
      label: 'Posts', 
      value: stats?.posts ?? 0,
      icon: FiEdit3
    },
    { 
      label: 'Friends', 
      value: stats?.friends ?? 0,
      icon: FiUsers
    },
    { 
      label: 'Achievements', 
      value: stats?.achievements ?? 0,
      icon: FiAward
    }
  ]

  return (
    <div className="flex justify-between sm:justify-start sm:gap-12">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          whileHover={{ scale: 1.05 }}
          className="text-center flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div 
            className="text-xl sm:text-2xl font-bold flex items-center gap-2"
            style={{ color: primaryColor }}
          >
            <stat.icon className="w-5 h-5" />
            {stat.value}
          </div>
        </motion.div>
      ))}
    </div>
  )
} 