import { FiMessageCircle } from 'react-icons/fi'

interface QuoteInputProps {
  value: string
  onChange: (value: string) => void
  primaryColor: string
}

export default function QuoteInput({ value, onChange, primaryColor }: QuoteInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        What's on your mind?
      </label>
      <div className="relative">
        <FiMessageCircle className="absolute top-3 left-3 w-5 h-5 text-purple-400" />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write something meaningful..."
          className={`w-full h-32 bg-black/30 text-white rounded-lg border p-4 
                   placeholder-gray-500 focus:outline-none transition-colors
                   border-[${primaryColor}30] focus:border-[${primaryColor}]`}
        />
      </div>
    </div>
  )
} 