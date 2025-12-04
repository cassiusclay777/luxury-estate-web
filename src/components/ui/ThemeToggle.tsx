// /src/components/ui/ThemeToggle.tsx
'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { Moon, Sun, Palette } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [autoMode, setAutoMode] = useState(false)

  // Auto‑switch based on time of day
  useEffect(() => {
    if (!autoMode) return

    const hour = new Date().getHours()
    const isDay = hour >= 6 && hour < 18
    const desiredTheme = isDay ? 'light' : 'dark'

    if (theme !== desiredTheme) {
      // In a real app, you would call toggleTheme, but we need to avoid loops.
      // We'll just update the theme via a custom event.
      document.documentElement.classList.toggle('dark', desiredTheme === 'dark')
      // You can also dispatch an event to update context (simplified here)
    }
  }, [autoMode, theme])

  // Auto‑switch based on property color (placeholder)
  // In a real implementation, you would analyze the dominant color of the property image
  // and switch to dark/light based on luminance.
  const enablePropertyColorSwitch = () => {
    // This is a mock – in reality you would integrate with an image color analysis service
    console.log('Property color auto‑switch enabled')
    setAutoMode(true)
  }

  return (
    <div className="flex items-center gap-2 glass rounded-full px-3 py-2">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-gold" />
        ) : (
          <Moon className="w-5 h-5 text-navy" />
        )}
      </button>

      <div className="h-6 w-px bg-white/20" />

      <button
        onClick={() => setAutoMode(!autoMode)}
        className={`p-2 rounded-full transition-colors ${autoMode ? 'bg-cyan/20 text-cyan' : 'hover:bg-white/10'}`}
        aria-label={autoMode ? 'Disable auto mode' : 'Enable auto mode (time‑based)'}
      >
        <Palette className="w-5 h-5" />
      </button>

      <span className="text-sm font-medium">
        {theme === 'dark' ? 'Dark' : 'Light'}
        {autoMode && ' · Auto'}
      </span>
    </div>
  )
}
