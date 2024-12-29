import { motion } from 'framer-motion'
// import { useTheme } from '../../../contexts/ThemeContext'
import { TETROMINO_COLORS } from '../constants'

interface GameBoardProps {
  board: number[][]
  currentPiece: {
    shape: number[][]
    position: { x: number; y: number }
    type: keyof typeof TETROMINO_COLORS
  }
}

export default function GameBoard({ board, currentPiece }: GameBoardProps) {
//  const { customColors } = useTheme()
  
  // Create a merged board with current piece
  const mergedBoard = board.map(row => [...row])
  currentPiece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== 0) {
        const boardY = y + currentPiece.position.y
        const boardX = x + currentPiece.position.x
        if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
          mergedBoard[boardY][boardX] = cell
        }
      }
    })
  })

  return (
    <div className="w-full h-full grid grid-cols-10 gap-px bg-black/20">
      {mergedBoard.map((row, y) => 
        row.map((cell, x) => (
          <motion.div
            key={`${x}-${y}`}
            className="aspect-square"
            style={{
              backgroundColor: cell 
                ? `${TETROMINO_COLORS[currentPiece.type]}40`
                : 'rgba(0,0,0,0.3)',
              boxShadow: cell 
                ? `0 0 10px ${TETROMINO_COLORS[currentPiece.type]}40 inset`
                : 'none'
            }}
          />
        ))
      )}
    </div>
  )
} 