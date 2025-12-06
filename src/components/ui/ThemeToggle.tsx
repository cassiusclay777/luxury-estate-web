'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const sunVariants = {
  moon: {
    scale: 0,
    rotate: -180,
    opacity: 0,
  },
  sun: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
}

const moonVariants = {
  sun: {
    scale: 0,
    rotate: 180,
    opacity: 0,
  },
  moon: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
  }

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative w-12 h-12 rounded-full bg-[#161616] flex items-center justify-center hover:bg-[#1f1f1f] transition-colors"
      aria-label={theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
    >
      {/* Sun icon */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute text-indigo-400"
        variants={sunVariants}
        initial={theme === 'dark' ? 'moon' : 'sun'}
        animate={theme === 'dark' ? 'moon' : 'sun'}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </motion.svg>

      {/* Moon icon */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute text-indigo-400"
        variants={moonVariants}
        initial={theme === 'dark' ? 'moon' : 'sun'}
        animate={theme === 'dark' ? 'moon' : 'sun'}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </motion.svg>
    </motion.button>
  )
}
