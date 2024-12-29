import { motion } from 'framer-motion'
import { FiCheck, FiClock } from 'react-icons/fi'

interface SetupTimelineProps {
  steps: {
    id: string
    label: string
    points: number
    completed: boolean
  }[]
  currentStep: number
  primaryColor: string
}

export default function SetupTimeline({ steps, currentStep, primaryColor }: SetupTimelineProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative flex items-center gap-4 p-4 rounded-lg border
                     ${index === currentStep 
                       ? 'bg-black/40 border-purple-500/30' 
                       : 'bg-black/20 border-purple-500/10'}`}
        >
          {/* Status Icon */}
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center
                     ${step.completed 
                       ? 'bg-green-500/20 text-green-400' 
                       : index === currentStep 
                         ? 'bg-purple-500/20 text-purple-400'
                         : 'bg-gray-500/20 text-gray-400'}`}
          >
            {step.completed ? (
              <FiCheck className="w-5 h-5" />
            ) : (
              <FiClock className="w-5 h-5" />
            )}
          </div>

          {/* Step Info */}
          <div className="flex-1">
            <h3 className="font-medium text-white">{step.label}</h3>
            <p className="text-sm text-gray-400">+{step.points} XP</p>
          </div>

          {/* Progress Line */}
          {index < steps.length - 1 && (
            <div 
              className="absolute left-7 top-12 w-0.5 h-8 -z-10"
              style={{ 
                backgroundColor: step.completed ? primaryColor : '#374151',
                opacity: step.completed ? 0.2 : 0.1
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
} 