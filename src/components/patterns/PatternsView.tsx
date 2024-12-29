import { motion } from 'framer-motion'
import { Pattern, patterns } from '../../utils/patterns'
import { BackgroundType } from '../../types'

interface PatternsViewProps {
  selectedPattern: Pattern | null
  onPatternSelect: (pattern: Pattern) => void
  patternIntensity: number
  onIntensityChange: (value: number) => void
  backgroundType: BackgroundType
}

export default function PatternsView({
  selectedPattern,
  onPatternSelect,
  patternIntensity,
  onIntensityChange,
  backgroundType
}: PatternsViewProps) {
  if (backgroundType === 'pixels') {
    return (
      <div className="text-center py-8 text-gray-400">
        Pattern selection is not available with Pixels background
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
        {patterns.map(pattern => (
          <motion.button
            key={pattern.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPatternSelect(pattern)}
            className={`aspect-square rounded-lg border transition-all duration-200 overflow-hidden ${
              selectedPattern?.id === pattern.id
                ? 'border-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.3)] scale-105'
                : 'border-white/5 hover:border-white/20'
            }`}
            title={pattern.name}
          >
            <div 
              className="w-full h-full rounded-lg transform hover:scale-110 transition-transform duration-300"
              style={{ 
                background:  pattern.css.backgroundColor,
                backgroundImage: pattern.css.backgroundImage,
                backgroundSize: pattern.css.backgroundSize,
                backgroundPosition: pattern.css.backgroundPosition
              }}
            />
          </motion.button>
        ))}
      </div>

      {selectedPattern?.intensity && (
        <div className="space-y-2 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <label className="text-gray-400">Pattern Intensity</label>
            <span className="text-[#00ff88] font-medium">{selectedPattern.name}</span>
          </div>
          <input
            type="range"
            min={selectedPattern.intensity.min}
            max={selectedPattern.intensity.max}
            value={patternIntensity}
            onChange={(e) => onIntensityChange(Number(e.target.value))}
            className="w-full accent-[#00ff88]"
          />
        </div>
      )}
    </div>
  )
} 