import { motion } from 'framer-motion'

interface LogoProps {
  size?: number
  primaryColor?: string
}

export default function Logo({ size = 40, primaryColor = '#8B5CF6' }: LogoProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.1" />
        </linearGradient>
        {/* Glow Effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background Box */}
      <motion.path
        d="M20 30L50 15L80 30L80 70L50 85L20 70L20 30Z"
        fill="url(#boxGradient)"
        stroke={primaryColor}
        strokeWidth="0.5"
        strokeOpacity="0.3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      />

      {/* 3D Text Group */}
      <g filter="url(#glow)">
        {/* M */}
        <motion.path
          d="M35 45L40 42L45 45L45 60M35 45L35 60M45 60L50 57L55 60L55 45L50 42L45 45"
          stroke={primaryColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />

        {/* B */}
        <motion.path
          d="M60 45L65 42L70 45C70 48 65 50 65 50C65 50 70 52 70 55L70 60L65 63L60 60L60 45Z"
          stroke={primaryColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Connecting Lines */}
        <motion.g
          stroke={primaryColor}
          strokeWidth="0.5"
          strokeOpacity="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <path d="M30 65L70 65" />
          <path d="M35 40L65 40" />
          <path d="M50 35L50 70" />
        </motion.g>

        {/* Glowing Points */}
        {[
          [35, 45], [45, 45], [55, 45], [65, 45],
          [35, 60], [45, 60], [55, 60], [65, 60]
        ].map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="1"
            fill={primaryColor}
            initial={{ scale: 0 }}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </g>

      {/* Animated Border Effect */}
      <motion.path
        d="M20 30L50 15L80 30M50 85L50 15"
        stroke={primaryColor}
        strokeWidth="1"
        strokeOpacity="0.8"
        strokeDasharray="5,5"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.3, 0.8, 0.3],
          strokeDashoffset: [0, -10]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        fill="none"
      />
    </motion.svg>
  )
} 