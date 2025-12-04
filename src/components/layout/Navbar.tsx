// /src/components/layout/Navbar.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, Heart, User, Menu, X, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled ? 'glass py-3' : 'py-6'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--purple-light)] flex items-center justify-center glow-gold"
            >
              <Home className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold font-['Syne']">
              <span className="text-gradient">Lux</span>
              <span className="text-white">Estate</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Nemovitosti', 'Mapa', 'O nás', 'Kontakt'].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -2 }}
                className="relative text-white/70 hover:text-white transition-colors group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--gold)] to-[var(--cyan)] group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full glass flex items-center justify-center"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full glass flex items-center justify-center relative"
            >
              <Heart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--gold)] rounded-full text-xs flex items-center justify-center text-[var(--navy)] font-bold">
                3
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-white font-semibold flex items-center gap-2 glow-gold"
            >
              <User className="w-4 h-4" />
              Přihlásit se
            </motion.button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Otevřít menu"
            className="md:hidden w-10 h-10 rounded-full glass flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] md:hidden"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-80 glass border-l border-white/10 p-6"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Zavřít menu"
                className="absolute top-6 right-6 w-10 h-10 rounded-full glass flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mt-20 flex flex-col gap-6">
                {['Nemovitosti', 'Mapa', 'O nás', 'Kontakt'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-2xl font-semibold text-white/80 hover:text-white hover:translate-x-2 transition-all"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}