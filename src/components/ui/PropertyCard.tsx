// /src/components/ui/PropertyCard.tsx
'use client'
import { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Bed, Bath, Maximize, MapPin, Eye, Sparkles } from 'lucide-react'
import { formatPrice, cn } from '@/lib/utils'
import { Property } from '@/lib/supabase'

type PropertyCardProps = {
  property: Property
  index: number
}

export function PropertyCard({ property, index }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [liked, setLiked] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="relative group cursor-pointer"
    >
      <motion.div
        animate={{
          y: isHovered ? -20 : 0,
          boxShadow: isHovered
            ? '0 50px 100px -20px rgba(0,0,0,0.5), 0 0 60px rgba(212, 175, 55, 0.3)'
            : '0 20px 40px -20px rgba(0,0,0,0.3)',
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden glass"
      >
        {/* Gradient border on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 rounded-3xl gradient-border -z-10"
        />

        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)] via-transparent to-transparent" />

          {/* Floating particles on hover */}
          <AnimatedParticles isVisible={isHovered} />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-xs font-bold text-white"
            >
              {property.property_type || 'Premium'}
            </motion.span>
          </div>

          {/* Like button */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault()
              setLiked(!liked)
            }}
            className={cn(
              'absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              liked ? 'bg-red-500' : 'glass'
            )}
          >
            <Heart className={cn('w-5 h-5', liked ? 'fill-white' : '')} />
          </motion.button>

          {/* Quick view on hover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            className="absolute bottom-4 left-4 right-4 flex gap-2"
          >
            <Link
              href={`/properties/${property.id}`}
              className="flex-1 py-2 rounded-xl glass flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/20 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Zobrazit detail
            </Link>
            <button className="py-2 px-4 rounded-xl bg-[var(--gold)] text-[var(--navy)] flex items-center justify-center gap-2 text-sm font-bold">
              <Sparkles className="w-4 h-4" />
              3D
            </button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold font-['Syne'] text-white mb-1 line-clamp-1">
                {property.title}
              </h3>
              <p className="flex items-center gap-1 text-white/60 text-sm">
                <MapPin className="w-4 h-4" />
                {property.address}, {property.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-white/70">
            {property.bedrooms && (
              <span className="flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                {property.bathrooms}
              </span>
            )}
            {property.sqft && (
              <span className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4" />
                {property.sqft} m²
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <p className="text-2xl font-bold text-gradient">
              {formatPrice(property.price)}
            </p>
            <motion.div
              animate={{ scale: isHovered ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0, repeatDelay: 1 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--purple-light)] flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AnimatedParticles({ isVisible }: { isVisible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: '100%', x: `${Math.random() * 100}%`, opacity: 0 }}
          animate={isVisible ? {
            y: '-100%',
            opacity: [0, 1, 0],
            transition: {
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              ease: 'linear'
            }
          } : {}}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: ['var(--gold)', 'var(--purple-light)', 'var(--cyan)'][i % 3],
            boxShadow: `0 0 10px ${['var(--gold)', 'var(--purple-light)', 'var(--cyan)'][i % 3]}`
          }}
        />
      ))}
    </motion.div>
  )
}