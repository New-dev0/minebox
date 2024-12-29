export const PETS = [
  {
    id: 'cyber-dragon',
    name: 'Cyber Dragon',
    description: 'A mechanical dragon with neon accents',
    price: 1000,
    model: '/models/pets/cyber-dragon.glb',
    rarity: 'legendary',
    stats: {
      speed: 90,
      power: 85,
      intelligence: 75
    }
  },
/*  {
    id: 'neon-fox',
    name: 'Neon Fox',
    description: 'A mystical fox with glowing patterns',
    price: 800,
    model: '/models/pets/neon-fox.glb',
    rarity: 'epic',
    stats: {
      speed: 95,
      power: 65,
      intelligence: 85
    }
  },*/
  {
    id: 'quantum-cat',
    name: 'Quantum Cat',
    description: 'A cat that exists in multiple dimensions',
    price: 750,
    model: '/models/pets/quantum-cat.glb',
    rarity: 'epic',
    stats: {
      speed: 80,
      power: 70,
      intelligence: 90
    }
  },
  {
    id: 'holo-pup',
    name: 'Holo Pup',
    description: 'A holographic puppy that changes colors',
    price: 600,
    model: '/models/pets/holo-pup.glb',
    rarity: 'rare',
    stats: {
      speed: 75,
      power: 65,
      intelligence: 80
    }
  }
] as const

export const RARITY_COLORS = {
  common: '#a5a5a5',
  rare: '#4287f5',
  epic: '#9c42f5',
  legendary: '#f5a742'
} as const

export type Pet = typeof PETS[number]
export type PetRarity = 'common' | 'rare' | 'epic' | 'legendary' 