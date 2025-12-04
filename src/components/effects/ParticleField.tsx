// /src/components/effects/ParticleField.tsx
'use client'
import { useEffect, useState } from 'react'

export function ParticleField() {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: string; size: string }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      size: `${2 + Math.random() * 4}px`,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: '-10px',
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
            background: Math.random() > 0.5 
              ? 'var(--gold)' 
              : Math.random() > 0.5 
                ? 'var(--purple-light)' 
                : 'var(--cyan)',
          }}
        />
      ))}
    </div>
  )
}