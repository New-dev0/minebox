import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'

interface Position {
  x: number
  y: number
}

interface GameState {
  snake: Position[]
  food: Position
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  score: number
  isGameOver: boolean
  isPaused: boolean
}

interface DifficultyLevel {
  id: 'easy' | 'medium' | 'hard'
  label: string
  speed: number
  speedIncrease: number
  description: string
}

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  {
    id: 'easy',
    label: 'Easy',
    speed: 200,
    speedIncrease: 2,
    description: 'Perfect for beginners'
  },
  {
    id: 'medium',
    label: 'Medium',
    speed: 150,
    speedIncrease: 5,
    description: 'For experienced players'
  },
  {
    id: 'hard',
    label: 'Hard',
    speed: 100,
    speedIncrease: 8,
    description: 'For snake masters'
  }
]

const GRID_SIZE = 20
const CELL_SIZE = 20
// const INITIAL_SPEED = 150
// const SPEED_INCREASE = 5

export default function SnakeGame() {
  const { customColors } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showGame, setShowGame] = useState(false)
  const [showDifficultySelect, setShowDifficultySelect] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(DIFFICULTY_LEVELS[0])
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: 'RIGHT',
    score: 0,
    isGameOver: false,
    isPaused: false
  })

  // Generate random food position
  const generateFood = useCallback((): Position => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
  }, [])

  // Initialize game
  const initGame = useCallback(() => {
    setGameState({
      snake: [{ x: 10, y: 10 }],
      food: generateFood(),
      direction: 'RIGHT',
      score: 0,
      isGameOver: false,
      isPaused: false
    })
  }, [generateFood])

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return

      switch (e.key) {
        case 'ArrowUp':
          if (gameState.direction !== 'DOWN') {
            setGameState(prev => ({ ...prev, direction: 'UP' }))
          }
          break
        case 'ArrowDown':
          if (gameState.direction !== 'UP') {
            setGameState(prev => ({ ...prev, direction: 'DOWN' }))
          }
          break
        case 'ArrowLeft':
          if (gameState.direction !== 'RIGHT') {
            setGameState(prev => ({ ...prev, direction: 'LEFT' }))
          }
          break
        case 'ArrowRight':
          if (gameState.direction !== 'LEFT') {
            setGameState(prev => ({ ...prev, direction: 'RIGHT' }))
          }
          break
        case ' ':
          setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState.direction, gameState.isGameOver])

  // Game loop
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) return

    const moveSnake = () => {
      const newSnake = [...gameState.snake]
      const head = { ...newSnake[0] }

      switch (gameState.direction) {
        case 'UP':
          head.y -= 1
          break
        case 'DOWN':
          head.y += 1
          break
        case 'LEFT':
          head.x -= 1
          break
        case 'RIGHT':
          head.x += 1
          break
      }

      // Check collisions
      if (
        head.x < 0 || head.x >= GRID_SIZE ||
        head.y < 0 || head.y >= GRID_SIZE ||
        newSnake.some(segment => segment.x === head.x && segment.y === head.y)
      ) {
        setGameState(prev => ({ ...prev, isGameOver: true }))
        return
      }

      // Check food collision
      if (head.x === gameState.food.x && head.y === gameState.food.y) {
        setGameState(prev => ({
          ...prev,
          food: generateFood(),
          score: prev.score + 10
        }))
      } else {
        newSnake.pop()
      }

      newSnake.unshift(head)
      setGameState(prev => ({ ...prev, snake: newSnake }))
    }

    const speed = Math.max(
      selectedDifficulty.speed - (gameState.score * selectedDifficulty.speedIncrease), 
      50
    )
    const gameLoop = setInterval(moveSnake, speed)

    return () => clearInterval(gameLoop)
  }, [gameState, generateFood, selectedDifficulty])

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw snake
    gameState.snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 
        ? customColors.primary 
        : `${customColors.primary}80`
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      )
    })

    // Draw food
    ctx.fillStyle = '#ff4444'
    ctx.fillRect(
      gameState.food.x * CELL_SIZE,
      gameState.food.y * CELL_SIZE,
      CELL_SIZE - 1,
      CELL_SIZE - 1
    )
  }, [gameState, customColors.primary])

  // Add function to start game with selected difficulty
  const startGame = (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty)
    setShowDifficultySelect(false)
    setShowGame(true)
    initGame()
  }

  // Update return JSX
  if (!showGame) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        {!showDifficultySelect ? (
          // Game Card
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative aspect-square rounded-xl border backdrop-blur-xl overflow-hidden"
            style={{ borderColor: `${customColors.primary}20` }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Snake</h2>
              <p className="text-gray-400 mb-8">
                Classic snake game with a modern twist. Collect food, grow longer, and avoid collisions!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDifficultySelect(true)}
                className="px-8 py-3 rounded-lg font-medium text-black"
                style={{ backgroundColor: customColors.primary }}
              >
                Play Now
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // Difficulty Selection
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Select Difficulty</h2>
              <p className="text-gray-400">Choose your challenge level</p>
            </div>

            <div className="grid gap-4">
              {DIFFICULTY_LEVELS.map((difficulty) => (
                <motion.button
                  key={difficulty.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startGame(difficulty)}
                  className="p-4 rounded-xl border backdrop-blur-xl flex items-center justify-between"
                  style={{ 
                    borderColor: `${customColors.primary}20`,
                    backgroundColor: 'rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="text-left">
                    <h3 className="font-medium text-white">{difficulty.label}</h3>
                    <p className="text-sm text-gray-400">{difficulty.description}</p>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${customColors.primary}20` }}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: customColors.primary }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDifficultySelect(false)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Back to Game Card
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  // Existing game JSX
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Snake</h2>
            <p className="text-sm text-gray-400">
              {selectedDifficulty.label} Mode
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: customColors.primary }}>
              {gameState.score}
            </div>
            <div className="text-sm text-gray-400">Score</div>
          </div>
        </div>

        {/* Game Canvas */}
        <div 
          className="relative aspect-square rounded-xl border backdrop-blur-xl overflow-hidden"
          style={{ borderColor: `${customColors.primary}20` }}
        >
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="w-full h-full"
          />

          {/* Game Over Overlay */}
          {gameState.isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm
                       flex flex-col items-center justify-center"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Game Over</h3>
              <p className="text-gray-400 mb-6">Final Score: {gameState.score}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={initGame}
                className="px-6 py-2 rounded-lg font-medium"
                style={{ backgroundColor: customColors.primary }}
              >
                Play Again
              </motion.button>
            </motion.div>
          )}

          {/* Pause Overlay */}
          {gameState.isPaused && !gameState.isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm
                       flex items-center justify-center"
            >
              <h3 className="text-2xl font-bold text-white">Paused</h3>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="text-center text-sm text-gray-400">
          Press <span className="text-white">Space</span> to pause/resume
        </div>
      </div>
    </div>
  )
} 