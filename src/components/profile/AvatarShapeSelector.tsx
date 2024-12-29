import { motion } from 'framer-motion'

interface AvatarShapeOption {
  id: string
  label: string
  shape: 'circle' | 'square' | 'rounded' | 'hexagon' | 'octagon' | 'double-circle'
  preview: string
}

interface AvatarShapeSelectorProps {
  selectedShape: string
  onShapeSelect: (shape: string) => void
  primaryColor: string
}

export default function AvatarShapeSelector({ 
  selectedShape, 
  onShapeSelect,
  primaryColor 
}: AvatarShapeSelectorProps) {
  const shapeOptions: AvatarShapeOption[] = [
    {
      id: 'circle',
      label: 'Circle',
      shape: 'circle',
      preview: '...'
    },
    {
      id: 'square',
      label: 'Square',
      shape: 'square',
      preview: '...'
    },
    {
      id: 'rounded',
      label: 'Rounded Square',
      shape: 'rounded',
      preview: '...'
    },
    {
      id: 'hexagon',
      label: 'Hexagon',
      shape: 'hexagon',
      preview: '...'
    },
    {
      id: 'octagon',
      label: 'Octagon',
      shape: 'octagon',
      preview: '...'
    },
    {
      id: 'double-circle',
      label: 'Double Circle',
      shape: 'double-circle',
      preview: '...'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {shapeOptions.map((shape) => (
        <motion.button
          key={shape.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onShapeSelect(shape.id)}
          className={`relative p-4 rounded-xl border transition-all duration-200
                     ${selectedShape === shape.id 
                       ? 'border-purple-500 bg-gradient-to-br ' + primaryColor
                       : 'border-purple-500/20 hover:border-purple-500/50 bg-black/30'}`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                 style={{ backgroundColor: `${primaryColor}20` }}>
            </div>
            <div className="text-left flex-1">
              <h3 className="font-bold text-white">{shape.label}</h3>
            </div>
            {selectedShape === shape.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full
                         flex items-center justify-center"
              >
                <svg 
                  className="w-4 h-4 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </motion.div>
            )}
          </div>

          {/* Shape Preview */}
          <div className="mt-4 w-full h-16 bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
            <div 
              className={`w-12 h-12 bg-gradient-to-br from-white/20 to-white/10
                         ${shape.id === 'double-circle' ? 'ring-4 ring-offset-2 ring-white/10 ring-offset-black/40' : ''}`}
              style={{ 
                border: `2px solid ${primaryColor}40`
              }}
            />
          </div>
        </motion.button>
      ))}
    </div>
  )
} 