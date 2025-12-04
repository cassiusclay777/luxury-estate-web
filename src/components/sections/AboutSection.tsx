'use client'
import { motion } from 'framer-motion'
import { Sparkles, Code, Palette, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AboutSection() {
  return (
    <section id="o-nas" className="relative py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[var(--purple-light)]/10 blur-[200px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[var(--gold)]/10 blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-[var(--gold)]" />
            <span className="text-[var(--gold)] font-medium uppercase tracking-wider text-sm">
              O nás
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold font-['Syne'] mb-6">
            <span className="text-white">Ilustrační </span>
            <span className="text-gradient">web</span>
            <span className="text-white"> budoucnosti</span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Tento web je ukázkou moderního přístupu k prezentaci nemovitostí s využitím nejnovějších technologií.
          </p>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Illustration info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="glass rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--purple-light)] flex items-center justify-center">
                  <Palette className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-['Syne']">Ilustrativní koncept</h3>
                  <p className="text-white/50">Ukázka možností moderního webdesignu</p>
                </div>
              </div>
              <p className="text-white/70 leading-relaxed text-lg">
                Tato webová prezentace slouží jako <strong>ilustrační příklad</strong> toho, jak může vypadat moderní realitní portál. Všechny zobrazené nemovitosti jsou generovány uměle pro demonstrační účely.
              </p>
              <p className="text-white/70 leading-relaxed text-lg mt-4">
                Cílem tohoto projektu je předvést integraci <strong>3D vizualizací, interaktivních map a pokročilých animací</strong> do realitního webu, což vytváří jedinečný uživatelský zážitek.
              </p>
            </div>

            {/* Services */}
            <div className="glass rounded-3xl p-8">
              <h3 className="text-2xl font-bold font-['Syne'] mb-6 flex items-center gap-3">
                <Code className="w-6 h-6 text-[var(--gold)]" />
                Co mohu pro vás vytvořit?
              </h3>
              <ul className="space-y-4">
                {[
                  'Moderní realitní portály na míru',
                  'E‑commerce řešení s pokročilými funkcemi',
                  'Firemní weby s důrazem na design a UX',
                  'Webové aplikace s 3D vizualizacemi',
                  'Mobilní aplikace pro iOS a Android',
                  'Komplexní digitální strategie'
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--gold)]" />
                    <span className="text-white/80">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right column - About me */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Profile card */}
            <div className="glass rounded-3xl p-8 gradient-border">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[var(--gold)] via-[var(--purple-light)] to-[var(--cyan)] flex items-center justify-center text-4xl font-bold text-white">
                    PN
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[var(--navy)] border-4 border-[var(--navy-dark)] flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[var(--gold)]" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold font-['Syne']">Patrik Jedlička</h3>
                  <p className="text-[var(--gold)] font-medium mt-1">Full‑stack vývojář & UX designér</p>
                  <p className="text-white/60 mt-4">
                    Specializuji se na vytváření moderních webových aplikací s důrazem na uživatelský zážitek a technologickou inovaci. S více než 8 lety zkušeností přináším komplexní řešení od návrhu po implementaci.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
                {[
                  { value: '50+', label: 'Dokončených projektů' },
                  { value: '8 let', label: 'Zkušeností' },
                  { value: '100%', label: 'Spokojenost klientů' }
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-gradient">{stat.value}</p>
                    <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-8 bg-gradient-to-br from-white/5 to-transparent"
            >
              <h3 className="text-2xl font-bold font-['Syne'] mb-4">Chcete podobný web?</h3>
              <p className="text-white/70 mb-6">
                Pokud vás tento koncept zaujal a přemýšlíte o vlastním moderním webu, rád vám pomůžu. Společně vytvoříme řešení přesně na míru vašim potřebám.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="mailto:patrikjedlicka7@gmail.com"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex-1 py-3 px-6 rounded-xl text-center font-semibold',
                    'bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-white'
                  )}
                >
                  Kontaktovat e‑mailem
                </motion.a>
              </div>
              <p className="text-white/40 text-sm mt-6 text-center">
                Odpovídám do 24 hodin • První konzultace zdarma
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
