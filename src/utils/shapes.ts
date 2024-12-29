export function getAvatarShape(shape?: string) {
  switch (shape) {
    case 'hexagon':
      return 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
    case 'octagon':
      return 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
    case 'square':
      return 'none'
    case 'rounded':
      return 'none' // Will use borderRadius instead
    case 'double-circle':
      return 'circle(50% at 50% 50%)'
    case 'circle':
    default:
      return 'circle(50% at 50% 50%)'
  }
} 