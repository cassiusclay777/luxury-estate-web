'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Phone, Globe, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ExpertHero() {
  const photoUrl = "https://www.jitkajedlickova.cz/wp-content/uploads/2023/05/jitka-jedlickova.jpg"
  
  const bioSnippet = "Od 2012 pomáhám s láskou a pokorou – naslouchám příběhům, nevnucuji, věřím v 'Co dáváš, se vrátí'. Empatická, spolehlivá, profesionální i přátelská."

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-navy to-gray-950">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Photo with glassmorphism */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            <div className="relative group">
              {/* Glassmorphism frame */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              
              {/* Main photo container */}
              <div className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl group-hover:shadow-indigo-500/20 transition-all duration-500">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="aspect-[4/5] relative"
                >
                  <Image
                    src={photoUrl}
                    alt="Jitka Jedličková – realitní makléřka Jihomoravský kraj"
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  {/* Indigo overlay on hover */}
                  <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-all duration-500" />
                </motion.div>
                
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold backdrop-blur-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Od 2012 v realitách</span>
                  </motion.div>
                </div>
              </div>

              {/* Floating contact info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5"
              >
                <div className="glass rounded-2xl p-4 border border-white/10 shadow-lg">
                  <div className="flex items-center justify-center gap-6">
                    <a 
                      href="mailto:jitka@realityproradost.cz" 
                      className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <span className="text-sm">jitka@realityproradost.cz</span>
                    </a>
                    <div className="h-6 w-px bg-white/20" />
                    <a 
                      href="tel:+420123456789" 
                      className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <span className="text-sm">+420 123 456 789</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right column - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-sm text-white/60">REALITY PRORADOST partner</span>
            </motion.div>

            {/* Main heading */}
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
                <span className="text-white">Za LuxEstate stojí </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Jitka Jedličková
                </span>
                <span className="text-white"> – tvá expertka od 2012</span>
              </h1>
              
              <div className="flex items-center gap-3 mt-4">
                <div className="w-12 h-px bg-gradient-to-r from-indigo-500 to-transparent" />
                <span className="text-lg text-indigo-300 font-medium">Specialistka na Jihomoravský kraj</span>
              </div>
            </div>

            {/* Bio snippet */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💫</span>
                </div>
                <div>
                  <p className="text-xl text-white/80 leading-relaxed italic">
                    "{bioSnippet}"
                  </p>
                  <p className="text-white/50 text-sm mt-4">– Jitka Jedličková, srdce LuxEstate</p>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "13+", label: "Let zkušeností", color: "from-indigo-500 to-blue-500" },
                { value: "500+", label: "Spokojených klientů", color: "from-purple-500 to-pink-500" },
                { value: "100%", label: "Osobní přístup", color: "from-cyan-500 to-emerald-500" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-sm mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-6"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-70 group-hover:opacity-100 transition-opacity" />
                  <Link
                    href="/expert/jitka-jedlickova"
                    className={cn(
                      'relative py-4 px-8 rounded-2xl text-center font-bold text-lg',
                      'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
                      'flex items-center justify-center gap-3'
                    )}
                  >
                    <span>Kontaktuj Jitku pro spolupráci</span>
                    <span className="text-xl">→</span>
                  </Link>
                </motion.div>

                <motion.a
                  href="https://www.jitkajedlickova.cz"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'py-4 px-8 rounded-2xl text-center font-semibold',
                    'bg-white/5 border border-white/10 text-white',
                    'flex items-center justify-center gap-3 hover:bg-white/10 transition-colors'
                  )}
                >
                  <Globe className="w-5 h-5" />
                  <span>Navštívit osobní web</span>
                </motion.a>
              </div>
              
              <p className="text-white/40 text-sm mt-6 text-center">
                Odpovídá do 24 hodin • První konzultace zdarma • Osobní přístup zaručen
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-sm">Scrollovat dolů</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
