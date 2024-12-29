import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Diamond } from './Diamond'

export const RainController: React.FC = () => {
  const diamondCount = 500
  const patternRef = useRef(0)

  const diamondPositions = useMemo(() => {
    return Array.from({ length: diamondCount }, () => [
      (Math.random() - 0.5) * 100,
      Math.random() * 200 - 100,
      (Math.random() - 0.5) * 100
    ] as [number, number, number])
  }, [])

  useFrame(() => {
    patternRef.current = (patternRef.current + 0.001) % (Math.PI * 2)
  })

  return (
    <>
      {diamondPositions.map((position, index) => (
        <Diamond
          key={index}
          index={index}
          position={[
            position[0] + Math.sin(patternRef.current + index * 0.01) * 5,
            position[1],
            position[2] + Math.cos(patternRef.current + index * 0.01) * 5
          ]}
        />
      ))}
    </>
  )
} 