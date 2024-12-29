export type HTML5Game = {
  id: string
  title: string
  url: string
  thumbnail?: string
  description?: string
  category?: string
  gameId?: string // GameDistribution specific ID
}

export const HTML5_GAMES: HTML5Game[] = [
  {
    id: 'slope',
    title: 'Slope',
    url: 'https://html5.gamedistribution.com/rvvASMiM/bf1268dccb5d43e7970bb3edaa54afc8/',
    gameId: 'bf1268dccb5d43e7970bb3edaa54afc8',
    thumbnail: 'https://img.gamedistribution.com/bf1268dccb5d43e7970bb3edaa54afc8-512x512.jpeg',
    category: 'Racing',
    description: '3D endless running game with a ball on a slope'
  },
  {
    id: 'subway-surfers',
    title: 'Subway Surfers',
    url: 'https://html5.gamedistribution.com/rvvASMiM/f804d079d19f44d3b951ead4588e974a/',
    gameId: 'f804d079d19f44d3b951ead4588e974a',
    thumbnail: 'https://img.gamedistribution.com/f804d079d19f44d3b951ead4588e974a-512x512.jpeg',
    category: 'Runner',
    description: 'Help Jake escape from the grumpy inspector and his dog!'
  },
  {
    id: 'temple-run-2',
    title: 'Temple Run 2',
    url: 'https://html5.gamedistribution.com/rvvASMiM/49258a0e58d54106a3a6e22d7a73004c/',
    gameId: '49258a0e58d54106a3a6e22d7a73004c',
    thumbnail: 'https://img.gamedistribution.com/49258a0e58d54106a3a6e22d7a73004c-512x512.jpeg',
    category: 'Runner',
    description: 'Run and escape with the cursed idol through temples and cliffs'
  }
] 