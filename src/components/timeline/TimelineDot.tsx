import { motion } from "framer-motion"

interface TimelineDotProps {
  primaryColor?: string
}

export default function TimelineDot({ primaryColor = '#8B5CF6' }: TimelineDotProps) {
  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="w-2 h-2 rounded-full border z-10 mt-2"
      style={{ 
        borderColor: `${primaryColor}50`,
        backgroundColor: `${primaryColor}20`,
        boxShadow: `0 0 10px ${primaryColor}30`
      }}
    />
  )
} 