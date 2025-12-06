// /src/components/property/PropertyCardSkeleton.tsx
'use client'
import { motion } from 'framer-motion'

export function PropertyCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Image Skeleton */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-r from-white/5 via-white/10 to-white/5">
        <div className="absolute top-4 left-4 w-20 h-8 rounded-full bg-white/10" />
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10" />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title & Location */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 rounded bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-white/10" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-white/10" />
            <div className="h-4 w-8 rounded bg-white/10" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-white/10" />
            <div className="h-4 w-8 rounded bg-white/10" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-white/10" />
            <div className="h-4 w-12 rounded bg-white/10" />
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 rounded-full bg-white/10" />
          <div className="h-6 w-20 rounded-full bg-white/10" />
          <div className="h-6 w-14 rounded-full bg-white/10" />
        </div>

        {/* Price */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-4 w-12 rounded bg-white/10" />
            <div className="h-8 w-32 rounded bg-white/10" />
          </div>
          <div className="h-10 w-24 rounded-full bg-white/10" />
        </div>
      </div>
    </motion.div>
  )
}
