// /src/components/three/Map3D.tsx
'use client'
import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

function Building({ position, height, delay }: { position: [number, number, number]; height: number; delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        visible ? height / 2 : -5,
        0.05
      )
      if (hovered) {
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, 1.2, 0.1)
      } else {
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, 1, 0.1)
      }
    }
  })

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay * 200)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={[position[0], -5, position[2]]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial
          color={hovered ? '#D4AF37' : '#7C3AED'}
          emissive={hovered ? '#D4AF37' : '#4C1D95'}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        color="#0A1628"
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  )
}

function Scene() {
  const buildings = [
    { position: [-3, 0, -2] as [number, number, number], height: 3 },
    { position: [-1, 0, -3] as [number, number, number], height: 5 },
    { position: [1, 0, -2] as [number, number, number], height: 4 },
    { position: [3, 0, -3] as [number, number, number], height: 6 },
    { position: [-2, 0, 1] as [number, number, number], height: 2 },
    { position: [0, 0, 0] as [number, number, number], height: 7 },
    { position: [2, 0, 1] as [number, number, number], height: 3 },
    { position: [-4, 0, -4] as [number, number, number], height: 4 },
    { position: [4, 0, -4] as [number, number, number], height: 5 },
  ]

  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 4}
      />
      
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 10, 0]} color="#D4AF37" intensity={2} />
      <pointLight position={[-5, 5, 5]} color="#7C3AED" intensity={1} />
      <pointLight position={[5, 5, -5]} color="#06B6D4" intensity={1} />

      <Ground />
      
      {buildings.map((b, i) => (
        <Building key={i} position={b.position} height={b.height} delay={i} />
      ))}

      <fog attach="fog" args={['#0A1628', 10, 30]} />
    </>
  )
}

export function Map3D() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 -z-10"
    >
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--navy)]/50 to-[var(--navy)]" />
    </motion.div>
  )
}