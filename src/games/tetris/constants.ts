// Define tetromino shapes
export const TETROMINOS = {
  I: [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0]
  ],
  J: [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0]
  ],
  L: [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ]
} as const

// Define tetromino colors with neon effect
export const TETROMINO_COLORS = {
  I: '#00f0f0', // Cyan
  J: '#0000f0', // Blue
  L: '#f0a000', // Orange
  O: '#f0f000', // Yellow
  S: '#00f000', // Green
  T: '#a000f0', // Purple
  Z: '#f00000'  // Red
} as const

// Game scoring system
export const SCORING = {
  SOFT_DROP: 1,
  HARD_DROP: 2,
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  BACK_TO_BACK_MULTIPLIER: 1.5
} as const

// Level progression
export const LEVEL_REQUIREMENTS = {
  LINES_PER_LEVEL: 10,
  MAX_LEVEL: 20,
  SPEED_INCREASE: 50 // ms decrease per level
} as const

// Board dimensions
export const BOARD = {
  WIDTH: 10,
  HEIGHT: 20,
  VISIBLE_HEIGHT: 20
} as const

// Ghost piece opacity
export const GHOST_OPACITY = 0.3

// Animation durations (ms)
export const ANIMATIONS = {
  LINE_CLEAR: 200,
  PIECE_LOCK: 100,
  GAME_OVER: 500
} as const

// Define types
export type TetrominoType = keyof typeof TETROMINOS
export type TetrominoShape = number[][]
export type TetrominoColor = typeof TETROMINO_COLORS[TetrominoType] 