import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Consolas', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#0a0a0a',
          surface: '#111111',
          elevated: '#161616',
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#a0a0a0',
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
        },
      },
      boxShadow: {
        'indigo-glow': '0 0 20px -5px rgba(99, 102, 241, 0.15)',
        'indigo-glow-lg': '0 0 40px -5px rgba(99, 102, 241, 0.25)',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        counter: 'counter 2s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        counter: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
