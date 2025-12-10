'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Bed, Bath, Maximize, MapPin } from 'lucide-react'
import { formatPrice, cn } from '../../lib/utils'
import { Property } from '../../lib/supabase'
import { LuxuryModeWrapper } from './LuxuryModeWrapper'

type PropertyCardProps = {
  property: Property
  index: number
}

export function PropertyCard({ property, index }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [liked, setLiked] = useState(false)

  return (
    <LuxuryModeWrapper price={property.price}>
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group cursor-pointer"
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.05 : 1,
          y: isHovered ? -8 : 0,
          boxShadow: isHovered
            ? '0 0 20px -5px rgba(99, 102, 241, 0.15)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative rounded-2xl overflow-hidden bg-[#161616] shadow-sm"
      >
        {/* Image with parallax */}
        <div className="relative h-64 overflow-hidden">
          <motion.div
            animate={{
              scale: isHovered ? 1.08 : 1,
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full h-full"
          >
          <Image
            src={property.main_image || property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
            alt={property.title}
            fill
            className="object-cover"
          />
          </motion.div>
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badge - fade in on hover */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : -10,
            }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 left-4"
          >
            <span className="px-3 py-1 rounded-full bg-indigo-500/90 backdrop-blur-sm text-xs font-semibold text-white">
              {property.type === 'apartment' ? 'Novinka' : 'Exkluzivní'}
            </span>
          </motion.div>

          {/* Like button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault()
              setLiked(!liked)
            }}
            className={cn(
              'absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              liked
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-[#161616]/80 backdrop-blur-sm hover:bg-[#1f1f1f]'
            )}
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-colors',
                liked ? 'fill-white text-white' : 'text-[#a0a0a0]'
              )}
            />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-[#f5f5f5] mb-1 line-clamp-1">
                {property.title}
              </h3>
            <p className="flex items-center gap-1 text-[#a0a0a0] text-sm">
                <MapPin className="w-4 h-4" />
                {property.address}, {property.city}
              </p>
          </div>

          <div className="flex items-center gap-4 mb-4 text-[#a0a0a0]">
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
            {property.area && (
              <span className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4" />
                {property.area} m²
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#111111]">
            <motion.p
              animate={{
                fontSize: isHovered ? '1.5rem' : '1.25rem',
                color: isHovered ? '#818cf8' : '#f5f5f5',
              }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold font-mono tabular-nums"
            >
              {formatPrice(property.price)}
            </motion.p>
          </div>

          {/* Sreality.cz Attribution */}
          <div className="flex items-center gap-2 pt-3 pb-1">
            <span className="text-xs text-[#6b6b6b] flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Via Sreality.cz
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
    </LuxuryModeWrapper>
  )
}
