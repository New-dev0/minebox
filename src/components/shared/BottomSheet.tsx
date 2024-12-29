import React, { useState } from 'react'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  height?: string
  className?: string
}

export default function BottomSheet({ isOpen, onClose, children, height = '50vh', className }: BottomSheetProps) {
  const [isFullHeight, setIsFullHeight] = useState(false)
  const dragY = useMotionValue(0)

  const handleDragEnd = (_, info: { offset: { y: number } }) => {
    if (info.offset.y < -100) {
      setIsFullHeight(true)
    } else if (info.offset.y > 100) {
      setIsFullHeight(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
          />

          {/* Sheet content */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ 
              height: isFullHeight ? '100vh' : height,
              y: dragY 
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 bg-black/90 
                     border-t border-gray-800 rounded-t-2xl z-[9999]
                     overflow-y-auto flex flex-col
                     md:left-[15%] md:right-[15%] ${className}`}
          >
            {/* Handle/Pill */}
            <div className="sticky top-0 pt-3 pb-2 bg-black/90 backdrop-blur-xl">
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto" />
            </div>

            {/* Content */}
            <div className="flex-1 p-6 pb-20 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 