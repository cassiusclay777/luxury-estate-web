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
        sans: ['Space Grotesk', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        gold: '#D4AF37',
        navy: '#0A1628',
        purple: {
          DEFAULT: '#4C1D95',
          light: '#7C3AED',
        },
        cyan: '#06B6D4',
      },
      animation: {
        'gradient-rotate': 'gradient-rotate 4s linear infinite',
        'float': 'float 15s infinite',
      },
    },
  },
  plugins: [],
}

export default config
