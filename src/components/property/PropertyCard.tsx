'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Bed, Bath, Maximize, MapPin, Heart, Sparkles } from 'lucide-react'
import type { Database } from 'types/database.types'
import { useState } from 'react'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyCardProps {
  property: Property
  index?: number
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const isNew = property.created_at && new Date(property.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const isExclusive = property.price > 20000000

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      }}
      className="group relative bg-[#161616] rounded-2xl shadow-sm overflow-hidden hover:shadow-indigo-glow"
    >
      <Link href={`/properties/${property.id}`} className="block">
        {/* Image with parallax effect */}
        <div className="relative h-64 overflow-hidden bg-[#111111]">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}
          <motion.div
            className="relative h-full w-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <Image
              src={property.images?.[0] || '/placeholder.jpg'}
              alt={property.title}
              fill
              className="object-cover"
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>

          {/* Badges with fade-in animation */}
          <div className="absolute top-4 left-4 flex gap-2">
            {isNew && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-3 py-1.5 rounded-full bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                Novinka
              </motion.div>
            )}
            {isExclusive && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold"
              >
                Exkluzivní
              </motion.div>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFavorite(!isFavorite)
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform z-10"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-indigo-500 text-indigo-500' : 'text-white'
              }`}
            />
          </button>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title & Location */}
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <MapPin className="w-4 h-4" />
              <span>{property.address}, {property.city}</span>
            </div>
          </div>

          {/* Stats */}
          {(property.bedrooms || property.bathrooms || property.area) && (
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              {property.bedrooms && (
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4" />
                  <span className="tabular-nums">{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4" />
                  <span className="tabular-nums">{property.bathrooms}</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-1.5">
                  <Maximize className="w-4 h-4" />
                  <span className="tabular-nums">{property.area} m²</span>
                </div>
              )}
            </div>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {property.features?.slice(0, 3).map((feature: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-[#111111] text-xs text-text-secondary"
                >
                  {feature}
                </span>
              ))}
              {property.features.length > 3 && (
                <span className="px-3 py-1 rounded-full bg-[#111111] text-xs text-text-secondary">
                  +{property.features.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <div className="text-sm text-text-secondary mb-1">Cena</div>
              <motion.div
                className="text-2xl font-bold text-text-primary tabular-nums group-hover:text-indigo-400 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                {(property.price / 1000000).toFixed(2)}M Kč
              </motion.div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition-colors"
            >
              Detail
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
