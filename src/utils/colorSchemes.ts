export interface ColorScheme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  description?: string
}

export const colorSchemes: ColorScheme[] = [
  {
    id: 'cyber',
    name: 'Cyberpunk',
    colors: {
      primary: '#00ff88',
      secondary: '#ff00ff',
      accent: '#00ffff',
      background: '#1a1a2e'
    },
    description: 'Neon-inspired futuristic theme'
  },
  {
    id: 'sunset',
    name: 'Sunset Vibes',
    colors: {
      primary: '#ff6b6b',
      secondary: '#ffd93d',
      accent: '#ff8e3c',
      background: '#2d142c'
    },
    description: 'Warm sunset colors'
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    colors: {
      primary: '#00b4d8',
      secondary: '#90e0ef',
      accent: '#48cae4',
      background: '#03045e'
    },
    description: 'Calming ocean blues'
  },
  {
    id: 'forest',
    name: 'Mystic Forest',
    colors: {
      primary: '#80ed99',
      secondary: '#57cc99',
      accent: '#38a3a5',
      background: '#22577a'
    },
    description: 'Natural forest tones'
  },
  {
    id: 'galaxy',
    name: 'Galaxy Dreams',
    colors: {
      primary: '#c77dff',
      secondary: '#9d4edd',
      accent: '#7b2cbf',
      background: '#240046'
    },
    description: 'Cosmic purple hues'
  },
  {
    id: 'retro',
    name: 'Retro Wave',
    colors: {
      primary: '#ff2a6d',
      secondary: '#05d9e8',
      accent: '#d1f7ff',
      background: '#1d1135'
    },
    description: '80s retro aesthetics'
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    colors: {
      primary: '#f72585',
      secondary: '#4cc9f0',
      accent: '#7209b7',
      background: '#15024b'
    },
    description: 'Vibrant neon colors'
  },
  {
    id: 'mint',
    name: 'Mint Dream',
    colors: {
      primary: '#00ffa3',
      secondary: '#00c9ff',
      accent: '#92fe9d',
      background: '#1a2634'
    },
    description: 'Fresh mint tones'
  }
] 