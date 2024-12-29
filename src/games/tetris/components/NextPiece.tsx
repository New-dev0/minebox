import { motion } from 'framer-motion'
import { useTheme } from '../../../contexts/ThemeContext'
import { TETROMINO_COLORS, TetrominoType } from '../constants'

interface NextPieceProps {
  piece: {
    shape: number[][]
    type: TetrominoType
  }
}

export default function NextPiece({ piece }: NextPieceProps) {
  const { customColors } = useTheme()

  return (
    <div 
      className="p-4 rounded-xl border backdrop-blur-xl"
      style={{ borderColor: `${customColors.primary}20` }}
    >
      <div className="text-sm text-gray-400 mb-2">Next Piece</div>
      <div className="grid grid-cols-4 gap-px bg-black/20">
        {piece.shape.map((row, y) => 
          row.map((cell, x) => (
            <motion.div
              key={`${x}-${y}`}
              className="aspect-square"
              style={{
                backgroundColor: cell 
                  ? `${TETROMINO_COLORS[piece.type]}40`
                  : 'transparent',
                boxShadow: cell 
                  ? `0 0 10px ${TETROMINO_COLORS[piece.type]}40 inset`
                  : 'none'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (x + y) * 0.05 }}
            />
          ))
        )}
      </div>
    </div>
  )
} 