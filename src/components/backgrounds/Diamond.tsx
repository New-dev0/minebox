import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

interface DiamondProps {
  position: [number, number, number]
  index: number
}

// Adjust constants
const MIN_Y = -100
const MAX_Y = 100
const DIAMOND_SCALE = 2.5  // Increase base size of diamonds

export const Diamond: React.FC<DiamondProps> = ({ position, index }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const rotationSpeed = Math.random() * 0.1 + 0.05
  const FALL_SPEED = 0.1 + Math.random() * 0.05
  
  // Now we can use MAX_Y and MIN_Y safely
  const initialY = useMemo(() => 
    MAX_Y + (index * (MAX_Y - MIN_Y) / 50), 
    [index]
  )

  const diamondGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 1)
    shape.lineTo(0.5, 0)
    shape.lineTo(0, -1)
    shape.lineTo(-0.5, 0)
    shape.lineTo(0, 1)

    const extrudeSettings = {
      steps: 2,
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 1
    }

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed * delta
      meshRef.current.rotation.y += rotationSpeed * delta
      meshRef.current.position.y -= FALL_SPEED
      
      if (meshRef.current.position.y < MIN_Y) {
        meshRef.current.position.y = MAX_Y
        meshRef.current.position.x = (Math.random() - 0.5) * 40
        meshRef.current.position.z = (Math.random() - 0.5) * 40
      }
    }
  })

  return (
    <group position={[position[0], initialY, position[2]]} scale={DIAMOND_SCALE}>
      <mesh ref={meshRef} geometry={diamondGeometry}>
        <meshStandardMaterial 
          color="#00e5ff"
          metalness={1}           // Full metallic
          roughness={0.05}        // More shiny
          emissive="#00e5ff"
          emissiveIntensity={0.6} // Increased glow
          envMapIntensity={2}     // More reflective
        />
      </mesh>
      <Text
        position={[0, 0, 0.3]}
        fontSize={0.2}            // Adjusted for new scale
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        AI
      </Text>
    </group>
  )
} 