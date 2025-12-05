'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface SampleRoomsProps {
  onSelectSample: (imageUrl: string) => void
}

// Ukázkové fotky prázdných místností (použijeme Unsplash)
const SAMPLE_ROOMS = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
    name: 'Prázdný obývací pokoj',
    description: 'Světlý prostor s velkými okny',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&q=80',
    name: 'Prázdná ložnice',
    description: 'Prostorná místnost s parketami',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    name: 'Prázdná jídelna',
    description: 'Moderní prostor s betonem',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    name: 'Prázdná kuchyně',
    description: 'Minimalistický design',
  },
]

export function SampleRooms({ onSelectSample }: SampleRoomsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white/90">
        <ImageIcon className="w-5 h-5 text-cyan-400" />
        <h3 className="font-bold">Nebo vyzkoušejte s ukázkovými místnostmi</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SAMPLE_ROOMS.map((room) => (
          <motion.button
            key={room.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectSample(room.url)}
            className="group relative aspect-square rounded-xl overflow-hidden border-2 border-white/10 hover:border-cyan-500/50 transition-all"
          >
            <Image
              src={room.url}
              alt={room.name}
              fill
              className="object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs font-bold text-white">{room.name}</p>
                <p className="text-xs text-white/70">{room.description}</p>
              </div>
            </div>
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-white/50 text-center">
        Klikněte na fotku pro okamžité použití v AI staging
      </p>
    </div>
  )
}
