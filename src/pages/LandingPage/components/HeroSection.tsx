import { motion } from 'framer-motion'


export default function HeroSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 text-center">
      <motion.h1 
        className="text-6xl md:text-8xl font-bold mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="gradient-text">MineBox</span>
      </motion.h1>
      
      <motion.p 
        className="text-xl md:text-2xl text-gray-300 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Your Interactive 3D Portfolio Universe
      </motion.p>

      <motion.p 
        className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Create stunning 3D spaces to showcase your work, connect with others, 
        and build your personal brand in an immersive social experience
      </motion.p>

      <div className="flex gap-4 justify-center">
        <motion.button
          className="px-8 py-3 bg-primary-600 text-white rounded-lg text-lg font-semibold
                     hover:bg-primary-500 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Create Your Space
        </motion.button>

        <motion.button
          className="px-8 py-3 bg-transparent text-white rounded-lg text-lg font-semibold
                     border border-white/20 hover:border-white/40 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Explore Spaces
        </motion.button>
      </div>

      {/* Stats Section */}
      <div className="mt-24 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
        {[
          { value: '10K+', label: 'Active Creators' },
          { value: '50K+', label: '3D Spaces' },
          { value: '100K+', label: 'Daily Visitors' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-primary-400">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 