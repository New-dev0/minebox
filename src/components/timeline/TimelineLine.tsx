interface TimelineLineProps {
  primaryColor?: string
}

export default function TimelineLine({ primaryColor = '#8B5CF6' }: TimelineLineProps) {
  return (
    <div 
      className="w-0.5 absolute h-full top-6 -z-10"
      style={{ 
        background: `linear-gradient(to bottom, ${primaryColor}30, ${primaryColor}10)`,
        boxShadow: `0 0 8px ${primaryColor}20`
      }}
    />
  )
} 