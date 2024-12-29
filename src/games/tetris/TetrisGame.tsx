import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { TETROMINOS } from './constants'
import { GameBoard, NextPiece, ScorePanel } from './components'

interface Position {
  x: number
  y: number
}

interface GameState {
  board: number[][]
  currentPiece: {
    shape: number[][]
    position: Position
    rotation: number
    type: keyof typeof TETROMINOS
  }
  nextPiece: {
    shape: number[][]
    type: keyof typeof TETROMINOS
  }
  score: number
  level: number
  lines: number
  isGameOver: boolean
  isPaused: boolean
}

interface DifficultyLevel {
  id: 'easy' | 'medium' | 'hard'
  label: string
  speed: number
  description: string
}

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  {
    id: 'easy',
    label: 'Easy',
    speed: 800,
    description: 'Perfect for beginners'
  },
  {
    id: 'medium',
    label: 'Medium',
    speed: 500,
    description: 'For experienced players'
  },
  {
    id: 'hard',
    label: 'Hard',
    speed: 300,
    description: 'For Tetris masters'
  }
]

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

export default function TetrisGame() {
  const { customColors } = useTheme()
  const [showGame, setShowGame] = useState(false)
  const [showDifficultySelect, setShowDifficultySelect] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(DIFFICULTY_LEVELS[0])
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_HEIGHT).fill(Array(BOARD_WIDTH).fill(0)),
    currentPiece: {
      // @ts-expect-error: This is a temporary fix to allow the form data to be updated
      shape: TETROMINOS.I,
      position: { x: 4, y: 0 },
      rotation: 0,
      type: 'I'
    },
    nextPiece: {
      // @ts-expect-error: This is a temporary fix to allow the form data to be updated
      shape: TETROMINOS.O,
      type: 'O'
    },
    score: 0,
    level: 1,
    lines: 0,
    isGameOver: false,
    isPaused: false
  })

  // Fix board initialization
  const createEmptyBoard = () => 
    Array.from({ length: BOARD_HEIGHT }, () => 
      Array.from({ length: BOARD_WIDTH }, () => 0)
    )

  // Update initGame function
  const initGame = useCallback(() => {
    const randomPiece = () => {
      const pieces = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>
      return pieces[Math.floor(Math.random() * pieces.length)]
    }

    const firstPiece = randomPiece()
    const secondPiece = randomPiece()

    setGameState({
      board: createEmptyBoard(),  // Use the new function
      currentPiece: {
        // @ts-expect-error: This is a temporary fix to allow the form data to be updated
        shape: TETROMINOS[firstPiece],
        position: { x: 4, y: 0 },
        rotation: 0,
        type: firstPiece
      },
      nextPiece: {
        // @ts-expect-error: This is a temporary fix to allow the form data to be updated
        shape: TETROMINOS[secondPiece],
        type: secondPiece
      },
      score: 0,
      level: 1,
      lines: 0,
      isGameOver: false,
      isPaused: false
    })
  }, [])

  // Add collision detection
  const checkCollision = useCallback((piece: number[][], position: Position) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x] !== 0) {
          const newX = position.x + x
          const newY = position.y + y

          if (
            newX < 0 || newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && gameState.board[newY][newX] !== 0)
          ) {
            return true
          }
        }
      }
    }
    return false
  }, [gameState.board])

  // Add piece rotation
  const rotatePiece = useCallback((piece: number[][]) => {
    const newPiece = piece[0].map((_, i) => 
      piece.map(row => row[i]).reverse()
    )
    return newPiece
  }, [])

  // Add game controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.isGameOver || gameState.isPaused) return

      switch (e.key) {
        case 'ArrowLeft': {
          // Move left
          const newPosLeft = { 
            ...gameState.currentPiece.position, 
            x: gameState.currentPiece.position.x - 1 
          }
          if (!checkCollision(gameState.currentPiece.shape, newPosLeft)) {
            setGameState(prev => ({
              ...prev,
              currentPiece: {
                ...prev.currentPiece,
                position: newPosLeft
              }
            }))
          }
          break
        }
        case 'ArrowRight': {
          // Move right
          const newPosRight = { 
            ...gameState.currentPiece.position, 
            x: gameState.currentPiece.position.x + 1 
          }
          if (!checkCollision(gameState.currentPiece.shape, newPosRight)) {
            setGameState(prev => ({
              ...prev,
              currentPiece: {
                ...prev.currentPiece,
                position: newPosRight
              }
            }))
          }
          break
        }
        case 'ArrowDown': {
          // Move down
          const newPosDown = { 
            ...gameState.currentPiece.position, 
            y: gameState.currentPiece.position.y + 1 
          }
          if (!checkCollision(gameState.currentPiece.shape, newPosDown)) {
            setGameState(prev => ({
              ...prev,
              currentPiece: {
                ...prev.currentPiece,
                position: newPosDown
              }
            }))
          }
          break
        }
        case 'ArrowUp': {
          const rotated = rotatePiece(gameState.currentPiece.shape);
          if (!checkCollision(rotated, gameState.currentPiece.position)) {
            setGameState(prev => ({
              ...prev,
              currentPiece: {
                ...prev.currentPiece,
                shape: rotated
              }
            }));
          }
          break
        }
        case ' ': {
          let dropPos = gameState.currentPiece.position.y;
          while (!checkCollision(gameState.currentPiece.shape, { 
            x: gameState.currentPiece.position.x, 
            y: dropPos + 1 
          })) {
            dropPos++
          }
          if (dropPos !== gameState.currentPiece.position.y) {
            setGameState(prev => ({
              ...prev,
              currentPiece: {
                ...prev.currentPiece,
                position: { ...prev.currentPiece.position, y: dropPos }
              }
            }))
          }
          break
        }
        case 'p': {
          setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, checkCollision, rotatePiece])

  // Update game loop with piece movement
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) return

    const moveDown = () => {
      const newPos = { 
        ...gameState.currentPiece.position, 
        y: gameState.currentPiece.position.y + 1 
      }

      if (!checkCollision(gameState.currentPiece.shape, newPos)) {
        setGameState(prev => ({
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: newPos
          }
        }))
      } else {
        // Lock piece and generate new one
        const newBoard = gameState.board.map(row => [...row])  // Create proper copy
        gameState.currentPiece.shape.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell !== 0) {
              const boardY = y + gameState.currentPiece.position.y
              const boardX = x + gameState.currentPiece.position.x
              if (boardY >= 0 && boardY < BOARD_HEIGHT) {
                newBoard[boardY][boardX] = gameState.currentPiece.type === 'I' ? 1 : 
                  gameState.currentPiece.type === 'J' ? 2 :
                  gameState.currentPiece.type === 'L' ? 3 :
                  gameState.currentPiece.type === 'O' ? 4 :
                  gameState.currentPiece.type === 'S' ? 5 :
                  gameState.currentPiece.type === 'T' ? 6 : 7
              }
            }
          })
        })

        // Check for completed lines
        let linesCleared = 0
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
          if (newBoard[y].every(cell => cell !== 0)) {
            linesCleared++
            newBoard.splice(y, 1)
            newBoard.unshift(Array(BOARD_WIDTH).fill(0))
          }
        }

        // Generate next piece
        const randomPiece = () => {
          const pieces = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>
          return pieces[Math.floor(Math.random() * pieces.length)]
        }

        const nextType = randomPiece()
        // @ts-expect-error: This is a temporary fix to allow the form data to be updated
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          currentPiece: {
            shape: prev.nextPiece.shape,
            position: { x: 4, y: 0 },
            rotation: 0,
            type: prev.nextPiece.type
          },
          nextPiece: {
            shape: TETROMINOS[nextType],
            type: nextType
          },
          score: prev.score + (linesCleared * 100),
          lines: prev.lines + linesCleared,
          level: Math.floor((prev.lines + linesCleared) / 10) + 1,
          isGameOver: newBoard[0].some(cell => cell !== 0)
        }))
      }
    }

    const speed = Math.max(selectedDifficulty.speed - (gameState.level * 50), 100)
    const gameLoop = setInterval(moveDown, speed)

    return () => clearInterval(gameLoop)
  }, [gameState, selectedDifficulty, checkCollision])

  // Add function to start game with selected difficulty
  const startGame = (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty)
    setShowDifficultySelect(false)
    setShowGame(true)
    initGame()
  }

  // Update UI rendering for difficulty selection
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
              <h2 className="text-2xl font-bold text-white mb-2">Tetris</h2>
              <p className="text-gray-400 mb-8">
                Classic block-stacking puzzle game with a neon twist!
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

  // Game UI
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Tetris</h2>
            <p className="text-sm text-gray-400">
              {selectedDifficulty.label} Mode
            </p>
          </div>
          <ScorePanel 
            score={gameState.score}
            level={gameState.level}
            lines={gameState.lines}
          />
        </div>

        {/* Game Area */}
        <div className="flex gap-6">
          {/* Game Board */}
          <div 
            className="flex-1 relative aspect-[1/2] rounded-xl border backdrop-blur-xl overflow-hidden"
            style={{ borderColor: `${customColors.primary}20` }}
          >
            <GameBoard 
              board={gameState.board}
              currentPiece={gameState.currentPiece}
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
                  onClick={() => {
                    setShowGame(false)
                    setShowDifficultySelect(false)
                  }}
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

          {/* Side Panel */}
          <div className="w-48 space-y-4">
            <NextPiece piece={gameState.nextPiece} />
          </div>
        </div>

        {/* Controls */}
        <div className="text-center text-sm text-gray-400">
          Press <span className="text-white">Space</span> for hard drop, 
          <span className="text-white">P</span> to pause
        </div>
      </div>
    </div>
  )
} 