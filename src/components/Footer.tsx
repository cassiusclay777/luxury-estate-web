'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Phone, Globe, MapPin, Building, Heart, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Footer() {
  const photoUrl = "https://www.jitkajedlickova.cz/wp-content/uploads/2023/05/jitka-jedlickova.jpg"
  
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-navy border-t border-white/10">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Expert Section */}
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl p-8 border border-white/10">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Photo */}
                <div className="relative flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500/30">
                    <Image
                      src={photoUrl}
                      alt="Jitka Jedličková – Odborný garant LuxEstate"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold whitespace-nowrap">
                      Od 2012
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm text-white/60 uppercase tracking-wider">Odborný garant</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Jitka Jedličková
                  </h3>
                  
                  <p className="text-white/70 mb-4">
                    Srdce LuxEstate a specialistka na Jihomoravský kraj od roku 2012. 
                    Partnerka REALITY PRORADOST s.r.o. s osobním, empatickým přístupem.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    <a
                      href="mailto:jitka@realityproradost.cz"
                      className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      jitka@realityproradost.cz
                    </a>
                    <a
                      href="tel:+420123456789"
                      className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      +420 123 456 789
                    </a>
                  </div>
                  
                  <Link
                    href="/expert/jitka-jedlickova"
                    className={cn(
                      'group inline-flex items-center gap-2 py-3 px-6 rounded-xl',
                      'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold',
                      'hover:from-indigo-700 hover:to-purple-700 transition-all duration-300'
                    )}
                  >
                    <span>Spolupracuj s Jitkou – pro developery i makléře</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Rychlé odkazy</h4>
            <ul className="space-y-3">
              {[
                { label: 'Domů', href: '/' },
                { label: 'Nemovitosti', href: '/properties' },
                { label: 'Vyhledávání', href: '/search' },
                { label: 'AI Staging', href: '/ai-staging' },
                { label: 'O nás', href: '/#o-nas' },
                { label: 'Kontakt', href: 'mailto:jitka@realityproradost.cz' },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <div className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Kontakt & Právní informace</h4>
            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-sm mb-1">REALITY PRORADOST s.r.o.</p>
                <p className="text-white/80">Partner LuxEstate</p>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/80">Jihomoravský kraj</p>
                  <p className="text-white/60 text-sm">Brno a okolí</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <a
                    href="https://www.jitkajedlickova.cz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    jitkajedlickova.cz
                  </a>
                  <p className="text-white/60 text-sm">Osobní web Jitky</p>
                </div>
              </div>
            </div>
            
            {/* Social/Trust badges */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs">
                  📞 24/7 dostupnost
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs">
                  🔒 Důvěra & diskrétnost
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs">
                  💫 Osobní přístup
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-white/60 text-sm">
                © {new Date().getFullYear()} LuxEstate. Všechna práva vyhrazena.
              </p>
              <p className="text-white/40 text-xs mt-1">
                Prezentace luxusních nemovitostí s AI stagingem a 3D vizualizacemi.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <Link
                href="/expert/jitka-jedlickova"
                className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                Odborný garant
              </Link>
              <a
                href="mailto:jitka@realityproradost.cz"
                className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                Kontakt
              </a>
              <Link
                href="/expert/jitka-jedlickova"
                className={cn(
                  'px-4 py-2 rounded-lg',
                  'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-300',
                  'hover:from-indigo-600/30 hover:to-purple-600/30 transition-all',
                  'border border-indigo-500/20'
                )}
              >
                Spolupráce s Jitkou
              </Link>
            </div>
          </div>
          
          {/* Schema.org microdata */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-white/30 text-xs">
              <span>🏠</span>
              <span>Realitní makléřka Jihomoravský kraj | Specialistka od 2012</span>
              <span>•</span>
              <span>Jitka Jedličková – srdce LuxEstate</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
