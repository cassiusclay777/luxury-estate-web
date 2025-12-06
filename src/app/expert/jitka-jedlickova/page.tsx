import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Phone, Globe, MapPin, Calendar, Award, Users, Heart, Shield, Star, Quote } from 'lucide-react'
import { ExpertHero } from '@/components/ExpertHero'

export const metadata: Metadata = {
  title: 'Jitka Jedličková – Realitní makléřka JMK | LuxEstate',
  description: 'Specialistka od 2012 s osobním přístupem. Kontakt pro prodej/koupě/spolupráci s nemovitostmi v Jihomoravském kraji.',
  keywords: ['realitní makléřka Brno', 'nemovitosti Jihomoravský kraj', 'prodej bytů Brno', 'koupě domu JMK', 'realitní služby', 'Jitka Jedličková'],
  openGraph: {
    title: 'Jitka Jedličková – Realitní makléřka JMK | LuxEstate',
    description: 'Specialistka od 2012 s osobním přístupem. Kontakt pro prodej/koupě/spolupráci.',
    type: 'profile',
    images: ['https://www.jitkajedlickova.cz/wp-content/uploads/2023/05/jitka-jedlickova.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const fullBio = `
Jsem Jitka Jedličková, realitní makléřka se specializací na Jihomoravský kraj od roku 2012. Mým posláním je pomáhat lidem najít nebo prodat jejich vysněný domov s láskou, pokorou a maximální profesionalitou.

Můj přístup je založen na třech pilířích:

1. **Naslouchání** – Každý klient má svůj jedinečný příběh, sny a potřeby. Nikdy nic nevynucuji, ale pečlivě naslouchám, abych pochopila, co skutečně hledáte.

2. **Důvěra** – Realitní transakce jsou často největší finanční rozhodnutí v životě. Buduji vztah založený na transparentnosti, poctivosti a vzájemném respektu.

3. **Komplexní služba** – Od prvního kontaktu až po předání klíčů vás provázím celým procesem. Zajistím právní poradenství, odhad ceny, marketing nemovitosti a vyjednávání.

Věřím, že "Co dáváš, se vrátí". Proto ke každému klientovi přistupuji s empatií a snahou skutečně pomoci, ne jen prodat. Mými klienty jsou jak jednotlivci hledající první byt, tak developeři s rozsáhlými projekty a investoři.

Jsem hrdou partnerkou REALITY PRORADOST s.r.o., kde spojujeme tradiční hodnoty s moderními technologiemi. Společně vytváříme prostředí, kde se klienti cítí bezpečně a komfortně.

Vaše vysněný domov čeká – pojďme ho najít společně.
`

const testimonials = [
  {
    name: 'Petr Novák',
    role: 'Klient – prodej bytu',
    content: 'Jitka mi prodala byt za 3 týdny a o 15% nad očekávanou cenou. Její profesionalita a lidský přístup jsou neuvěřitelné.',
    rating: 5,
  },
  {
    name: 'Marie Svobodová',
    role: 'Klientka – koupě domu',
    content: 'Po roce hledání jsem s Jitkou našla dům snů. Naslouchala mým potřebám a našla řešení, které jsem si neuměla představit.',
    rating: 5,
  },
  {
    name: 'Jan Development s.r.o.',
    role: 'Developer – spolupráce',
    content: 'Spolupracujeme s Jitkou na prodeji našich projektů. Její znalost lokálního trhu a marketingové schopnosti jsou výjimečné.',
    rating: 5,
  },
]

const services = [
  {
    title: 'Prodej nemovitostí',
    description: 'Komplexní marketing, vyhodnocení tržní hodnoty, vyjednávání a právní servis.',
    icon: '🏠',
  },
  {
    title: 'Nákup nemovitostí',
    description: 'Hledání podle vašich kritérií, due diligence, vyjednávání ceny a financování.',
    icon: '🔍',
  },
  {
    title: 'Pro developery',
    description: 'Prodej developerských projektů, marketingová strategie, poradenství.',
    icon: '🏗️',
  },
  {
    title: 'Investiční poradenství',
    description: 'Analýza investičního potenciálu, dlouhodobá strategie, správa portfolia.',
    icon: '📈',
  },
]

export default function JitkaJedlickovaPage() {
  const photoUrl = "https://www.jitkajedlickova.cz/wp-content/uploads/2023/05/jitka-jedlickova.jpg"
  
  return (
    <>
      {/* Schema.org markup for Person */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Jitka Jedličková",
            "jobTitle": "Realitní makléřka",
            "worksFor": {
              "@type": "Organization",
              "name": "REALITY PRORADOST s.r.o."
            },
            "description": "Specialistka na nemovitosti v Jihomoravském kraji od roku 2012.",
            "image": photoUrl,
            "email": "jitka@realityproradost.cz",
            "telephone": "+420123456789",
            "url": "https://luxestate.cz/expert/jitka-jedlickova",
            "sameAs": [
              "https://www.jitkajedlickova.cz"
            ],
            "knowsAbout": [
              "Realitní trh Jihomoravský kraj",
              "Prodej nemovitostí",
              "Nákup nemovitostí",
              "Developerské projekty",
              "Investice do nemovitostí"
            ],
            "memberOf": {
              "@type": "Organization",
              "name": "LuxEstate"
            }
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-navy">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <ExpertHero />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Bio & Contact */}
            <div className="lg:col-span-2 space-y-12">
              {/* Main Bio */}
              <section className="glass rounded-3xl p-8 border border-white/10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
                  <Heart className="w-8 h-8 text-indigo-400" />
                  <span className="text-white">Jitka Jedličková – Srdce LuxEstate</span>
                </h2>
                
                <h3 className="text-2xl text-indigo-300 font-semibold mb-4">
                  Od 2012 specialistka na Jihomoravský kraj
                </h3>
                
                <h4 className="text-xl text-white/80 font-medium mb-6">
                  Osobní přístup, který buduje důvěru
                </h4>

                <div className="prose prose-lg prose-invert max-w-none">
                  {fullBio.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-white/70 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-10 border-t border-white/10">
                  {[
                    { value: '13+', label: 'Let na trhu', icon: <Calendar className="w-6 h-6" /> },
                    { value: '500+', label: 'Spokojených klientů', icon: <Users className="w-6 h-6" /> },
                    { value: '98%', label: 'Úspěšnost transakcí', icon: <Award className="w-6 h-6" /> },
                    { value: '24h', label: 'Rychlá odpověď', icon: <Shield className="w-6 h-6" /> },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-3">
                        <div className="text-indigo-300">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-white/60 text-sm mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Services */}
              <section>
                <h2 className="text-3xl font-bold text-white mb-8">Co pro vás mohu udělat</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service, index) => (
                    <div
                      key={index}
                      className="glass rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{service.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                          <p className="text-white/60">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Testimonials */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">Co říkají klienti</h2>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-white/60 ml-2">5.0/5.0</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="glass rounded-2xl p-6 border border-white/10"
                    >
                      <Quote className="w-8 h-8 text-indigo-400/50 mb-4" />
                      <p className="text-white/80 italic mb-6">"{testimonial.content}"</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{testimonial.name}</div>
                          <div className="text-white/50 text-sm">{testimonial.role}</div>
                        </div>
                        <div className="flex">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - Contact & Info */}
            <div className="space-y-8">
              {/* Contact Card */}
              <div className="glass rounded-3xl p-8 border border-white/10 sticky top-8">
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/30">
                      <Image
                        src={photoUrl}
                        alt="Jitka Jedličková"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-6">Jitka Jedličková</h3>
                  <p className="text-indigo-300 font-medium">Realitní makléřka JMK</p>
                  <p className="text-white/60 text-sm mt-2">Partner REALITY PRORADOST s.r.o.</p>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <a
                    href="mailto:jitka@realityproradost.cz"
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                      <Mail className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white/60">E-mail</div>
                      <div className="text-white font-medium">jitka@realityproradost.cz</div>
                    </div>
                  </a>

                  <a
                    href="tel:+420123456789"
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                      <Phone className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white/60">Telefon</div>
                      <div className="text-white font-medium">+420 123 456 789</div>
                    </div>
                  </a>

                  <a
                    href="https://www.jitkajedlickova.cz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                      <Globe className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white/60">Osobní web</div>
                      <div className="text-white font-medium">jitkajedlickova.cz</div>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white/60">Lokalita</div>
                      <div className="text-white font-medium">Jihomoravský kraj</div>
                      <div className="text-white/50 text-sm">Brno a okolí</div>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8">
                  <a
                    href="mailto:jitka@realityproradost.cz?subject=Dotaz%20na%20spolupráci%20-%20LuxEstate&body=Dobrý%20den%20Jitko,%0A%0Arád/a%20bych%20s%20Vámi%20probral/a%20možnost%20spolupráce."
                    className="block w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-center text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  >
                    Napiš Jitce – tvá cesta k vysněnému domovu začíná tady
                  </a>
                  <p className="text-white/40 text-sm text-center mt-4">
                    Odpovídám do 24 hodin • Konzultace zdarma • Osobní přístup
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
