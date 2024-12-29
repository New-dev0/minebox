import { motion } from 'framer-motion'
import { ColorScheme, colorSchemes } from '../../utils/colorSchemes'
import { HexColorPicker } from 'react-colorful'

interface ColorSchemeViewProps {
  selectedScheme: ColorScheme | null
  onSchemeSelect: (scheme: ColorScheme) => void
  customColors: {
    primary: string
    background: string
  }
  onCustomColorChange: (color: string, type: 'primary' | 'background') => void
}

export default function ColorSchemeView({
  selectedScheme,
  onSchemeSelect,
  customColors,
  onCustomColorChange
}: ColorSchemeViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {colorSchemes.map((scheme) => (
          <motion.button
            key={scheme.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSchemeSelect(scheme)}
            className={`relative rounded-xl overflow-hidden aspect-square p-4 
                        transition-all duration-200 ${
              selectedScheme?.id === scheme.id 
                ? 'border-2 border-white ring-2 ring-white/20' 
                : 'border border-white/10'
            }`}
            style={{ 
              background: `linear-gradient(45deg, 
                ${scheme.colors.primary}20, 
                ${scheme.colors.secondary}20, 
                ${scheme.colors.accent}20
              )`,
              boxShadow: selectedScheme?.id === scheme.id 
                ? `0 0 20px ${scheme.colors.primary}40` 
                : 'none'
            }}
          >
            {/* Color Preview Circles */}
            <div className="absolute bottom-4 left-4 flex -space-x-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-black/20"
                style={{ backgroundColor: scheme.colors.primary }}
              />
              <div 
                className="w-6 h-6 rounded-full border-2 border-black/20"
                style={{ backgroundColor: scheme.colors.secondary }}
              />
              <div 
                className="w-6 h-6 rounded-full border-2 border-black/20"
                style={{ backgroundColor: scheme.colors.accent }}
              />
            </div>

            {/* Scheme Name */}
            <span className="text-sm font-medium text-white">
              {scheme.name}
            </span>

            {/* Description */}
            <span className="text-xs text-gray-400 mt-1 block">
              {scheme.description}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Custom Color Pickers */}
      <div className="mt-8 space-y-6">
        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Primary Color
          </label>
          <HexColorPicker 
            color={customColors.primary} 
            onChange={(color) => onCustomColorChange(color, 'primary')} 
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Background Color
          </label>
          <HexColorPicker 
            color={customColors.background} 
            onChange={(color) => onCustomColorChange(color, 'background')} 
          />
        </div>
      </div>
    </div>
  )
} 