// /src/components/property/PropertyCard.tsx
'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Bed, Bath, Maximize, MapPin, Heart } from 'lucide-react'
import type { Database } from 'types/database.types'
import { useState } from 'react'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group glass rounded-2xl overflow-hidden"
    >
      <Link href={`/properties/${property.id}`}>
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={property.images[0] || '/placeholder.jpg'}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Type Badge */}
          {property.type && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full glass text-sm font-semibold">
              {property.type}
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFavorite(!isFavorite)
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-[var(--gold)] text-[var(--gold)]' : 'text-white'
              }`}
            />
          </button>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title & Location */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{property.address}, {property.city}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-white/80">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4" />
                <span>{property.area} m²</span>
              </div>
            )}
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {property.features?.slice(0, 3).map((feature: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/60"
                >
                  {feature}
                </span>
              ))}
              {property.features.length > 3 && (
                <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/60">
                  +{property.features.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <div className="text-sm text-white/60 mb-1">Cena</div>
              <div className="text-2xl font-bold text-gradient">
                {(property.price / 1000000).toFixed(2)}M Kč
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-white font-semibold glow-gold"
            >
              Detail
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
