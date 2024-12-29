// import { motion } from 'framer-motion'
import { useTheme } from '../../../contexts/ThemeContext'

interface ScorePanelProps {
  score: number
  level: number
  lines: number
}

export default function ScorePanel({ score, level, lines }: ScorePanelProps) {
  const { customColors } = useTheme()

  return (
    <div 
      className="p-4 rounded-xl border backdrop-blur-xl"
      style={{ borderColor: `${customColors.primary}20` }}
    >
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-400">Score</div>
          <div 
            className="text-2xl font-bold"
            style={{ color: customColors.primary }}
          >
            {score}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400">Level</div>
          <div className="text-xl font-bold text-white">
            {level}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400">Lines</div>
          <div className="text-xl font-bold text-white">
            {lines}
          </div>
        </div>
      </div>
    </div>
  )
} 