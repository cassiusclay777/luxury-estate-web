'use client'

import { InteriorStyle } from '@/lib/types/ai-staging'
import { Home, Sparkles, Building2, Coffee, Crown, Warehouse, TreePine, Palette } from 'lucide-react'

interface StyleSelectorProps {
  selectedStyle: InteriorStyle
  onStyleChange: (style: InteriorStyle) => void
}

const STYLES: Array<{
  id: InteriorStyle
  label: string
  description: string
  icon: React.ReactNode
}> = [
  {
    id: 'modern',
    label: 'Moderní',
    description: 'Čisté linie, neutrální barvy',
    icon: <Home className="w-5 h-5" />
  },
  {
    id: 'minimalist',
    label: 'Minimalistický',
    description: 'Jednoduchost, světlé prostory',
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: 'industrial',
    label: 'Industriální',
    description: 'Odhalené cihly, kov',
    icon: <Building2 className="w-5 h-5" />
  },
  {
    id: 'scandinavian',
    label: 'Skandinávský',
    description: 'Světlé dřevo, hygge',
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 'classic',
    label: 'Klasický',
    description: 'Elegance, tradiční nábytek',
    icon: <Crown className="w-5 h-5" />
  },
  {
    id: 'loft',
    label: 'Loft',
    description: 'Otevřený prostor, vysoké stropy',
    icon: <Warehouse className="w-5 h-5" />
  },
  {
    id: 'rustic',
    label: 'Rustikální',
    description: 'Přírodní dřevo, teplé tóny',
    icon: <TreePine className="w-5 h-5" />
  },
  {
    id: 'contemporary',
    label: 'Současný',
    description: 'Módní, umělecké akcenty',
    icon: <Palette className="w-5 h-5" />
  }
]

export function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/90">
        Vyberte styl
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STYLES.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => onStyleChange(style.id)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200
              ${selectedStyle === style.id
                ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`
                ${selectedStyle === style.id ? 'text-cyan-400' : 'text-white/60'}
              `}>
                {style.icon}
              </div>
              <div>
                <div className={`
                  text-sm font-bold
                  ${selectedStyle === style.id ? 'text-white' : 'text-white/80'}
                `}>
                  {style.label}
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {style.description}
                </div>
              </div>
            </div>
            {selectedStyle === style.id && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
