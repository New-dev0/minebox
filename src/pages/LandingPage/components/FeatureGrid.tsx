import { motion } from 'framer-motion'
import { 
  MdViewInAr,
  MdPeople,
  MdEmojiEvents,
  MdDashboard,
  MdTimeline,
  MdInventory2
} from 'react-icons/md'

const features = [
  {
    title: '3D Space',
    description: 'Design your personal space in 3D with customizable rooms, galleries, and interactive areas',
    icon: <MdViewInAr className="w-8 h-8" />,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Social Layers',
    description: 'Control who sees what with customizable visibility layers for different social circles',
    icon: <MdPeople className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Achievement Gallery',
    description: 'Showcase your accomplishments in an interactive 3D trophy room',
    icon: <MdEmojiEvents className="w-8 h-8" />,
    color: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Portfolio Rooms',
    description: 'Create themed spaces for different aspects of your life and work',
    icon: <MdDashboard className="w-8 h-8" />,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Project Timeline',
    description: 'Display your journey with an immersive 3D timeline of projects and milestones',
    icon: <MdTimeline className="w-8 h-8" />,
    color: 'from-rose-500 to-red-500',
  },
  {
    title: 'Collection Boxes',
    description: 'Organize and showcase your work, memories, and interests in interactive 3D boxes',
    icon: <MdInventory2 className="w-8 h-8" />,
    color: 'from-violet-500 to-purple-500',
  },
]

export default function FeatureGrid() {
  return (
    <section id="features" className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto"
      >
        <h2 className="text-4xl font-bold text-white mb-16 gradient-text">
          Your Story, Your Way
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function FeatureCard({ 
  title, 
  description, 
  icon, 
  color,
  index 
}: { 
  title: string
  description: string
  icon: React.ReactNode
  color: string
  index: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      className={`glass-panel p-6 rounded-xl relative overflow-hidden
                 before:absolute before:inset-0 before:bg-gradient-to-br ${color} before:opacity-0
                 hover:before:opacity-10 before:transition-opacity`}
    >
      <div className="relative z-10">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
      
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-30">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent transform rotate-45" />
      </div>
    </motion.div>
  )
} 