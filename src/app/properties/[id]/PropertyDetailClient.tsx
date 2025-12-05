'use client'
import { useState, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import Image from 'next/image'
import Link from 'next/link'
import * as THREE from 'three'
import {
  ArrowLeft, Heart, Share2, Bed, Bath, Maximize, MapPin,
  Sparkles, ChevronLeft, ChevronRight, Play, Box,
  Wand2, Calendar, Phone, Mail, Star, Eye
} from 'lucide-react'
import { formatPrice, cn } from '@/lib/utils'

interface Property {
  id: string
  title: string
  description: string | null
  price: number
  address: string
  city: string
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  images: string[]
  features: string[] | null
  property_type: string | null
}

// 3D Floor Plan Component
function FloorPlan3D() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
      <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 2.2} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[0, 5, 0]} color="#D4AF37" intensity={1} />

      <group ref={groupRef}>
        {/* Floor */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[8, 0.2, 6]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Walls */}
        <mesh position={[-4, 1.5, 0]} castShadow>
          <boxGeometry args={[0.2, 3, 6]} />
          <meshStandardMaterial color="#2d2d44" transparent opacity={0.8} />
        </mesh>
        <mesh position={[4, 1.5, 0]} castShadow>
          <boxGeometry args={[0.2, 3, 6]} />
          <meshStandardMaterial color="#2d2d44" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 1.5, -3]} castShadow>
          <boxGeometry args={[8, 3, 0.2]} />
          <meshStandardMaterial color="#2d2d44" transparent opacity={0.8} />
        </mesh>

        {/* Room dividers */}
        <mesh position={[-1, 1.5, 0]} castShadow>
          <boxGeometry args={[0.1, 3, 3]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[2, 1.5, -1]} castShadow>
          <boxGeometry args={[0.1, 3, 2]} />
          <meshStandardMaterial color="#7C3AED" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Furniture indicators */}
        <mesh position={[-2.5, 0.3, 1]} castShadow>
          <boxGeometry args={[2, 0.4, 1.5]} />
          <meshStandardMaterial color="#06B6D4" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[1, 0.3, 1.5]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      <fog attach="fog" args={['#0A1628', 15, 30]} />
    </>
  )
}

// Photo Gallery Component
function PhotoGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAR, setShowAR] = useState(false)

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)

  return (
    <>
      <div className="relative rounded-3xl overflow-hidden glass">
        {/* Main image */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-[16/10] cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        >
          <Image
            src={images[currentIndex]}
            alt="Property"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </motion.div>

        {/* Navigation */}
        <button
          type="button"
          onClick={prevImage}
          aria-label="Předchozí obrázek"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={nextImage}
          aria-label="Další obrázek"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Thumbnails */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Zobrazit obrázek ${i + 1}`}
              className={cn(
                'w-16 h-12 rounded-lg overflow-hidden border-2 transition-all',
                i === currentIndex ? 'border-[var(--gold)] scale-110' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <Image src={images[i]} alt="" width={64} height={48} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>

        {/* 360 View & AR buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-white font-bold flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            360° Prohlídka
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAR(true)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[var(--cyan)] to-[var(--purple-light)] text-white font-bold flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            AR prohlídka
          </motion.button>
        </div>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            <Image
              src={images[currentIndex]}
              alt=""
              fill
              className="object-contain"
            />
            <button className="absolute top-4 right-4 text-white text-xl">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AR Modal */}
      <AnimatePresence>
        {showAR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={() => setShowAR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-3xl max-w-4xl w-full p-8 border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-['Syne'] flex items-center gap-3">
                  <Eye className="w-7 h-7 text-[var(--cyan)]" />
                  AR prohlídka (model-viewer.dev)
                </h2>
                <button
                  onClick={() => setShowAR(false)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20"
                >
                  ✕
                </button>
              </div>

              <p className="text-white/70 mb-6">
                Naskenujte QR kód nebo otevřete na mobilu pro AR prohlídku nemovitosti. Používáme <a href="https://model-viewer.dev" className="text-[var(--cyan)] underline">model-viewer.dev</a> pro WebXR.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Jak to funguje</h3>
                  <ul className="space-y-2 text-white/70">
                    <li>1. Otevřete stránku na mobilním zařízení</li>
                    <li>2. Klepněte na tlačítko "AR prohlídka"</li>
                    <li>3. Namiřte kameru na rovnou plochu</li>
                    <li>4. 3D model nemovitosti se zobrazí ve vašem okolí</li>
                  </ul>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--navy)] to-[var(--purple)]">
                    <p className="text-sm text-white/80">
                      <strong>Tip:</strong> Pro nejlepší zážitek použijte zařízení s podporou ARCore (Android) nebo ARKit (iOS).
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">QR kód pro mobil</h3>
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--cyan)] flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-white font-bold">Scan for AR</p>
                      <p className="text-white/70 text-sm">luxestate.vercel.app/ar</p>
                    </div>
                  </div>
                  <button className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-white font-bold">
                    Otevřít AR prohlídku
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowAR(false)}
                  className="px-6 py-3 rounded-full glass hover:bg-white/20 transition-colors"
                >
                  Zavřít
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Virtual Staging Button with AI Demo
function VirtualStagingButton({ propertyId }: { propertyId: string }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/ai-staging?propertyId=${propertyId}`}>
      <motion.button
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full py-4 rounded-2xl overflow-hidden group"
      >
        <motion.div
          animate={{
            background: isHovered
              ? 'linear-gradient(90deg, var(--gold), var(--purple-light), var(--cyan), var(--gold))'
              : 'linear-gradient(90deg, var(--gold), var(--purple-light))',
            backgroundSize: isHovered ? '200% 100%' : '100% 100%',
          }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{ backgroundPosition: isHovered ? '100% 0' : '0 0' }}
        />

        <motion.div
          animate={{ x: isHovered ? [0, 5, -5, 0] : 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center justify-center gap-3 text-white font-bold text-lg"
        >
          <Wand2 className="w-6 h-6" />
          Virtuální staging s AI (Replicate)
          <Sparkles className="w-5 h-5" />
        </motion.div>

        {/* Particles on hover */}
        <AnimatePresence>
          {isHovered && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    scale: 0,
                    x: '50%',
                    y: '50%',
                    opacity: 1
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    y: `${50 + (Math.random() - 0.5) * 100}%`,
                    opacity: [1, 1, 0]
                  }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="absolute w-2 h-2 rounded-full bg-white"
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.button>
    </Link>
  )
}

export default function PropertyDetailClient({ property }: { property: Property }) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
            Zpět na přehled
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <PhotoGallery images={property.images} />

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold font-['Syne'] mb-4 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-[var(--gold)]" />
                Popis nemovitosti
              </h2>
              <p className="text-white/70 leading-relaxed text-lg">
                {property.description || 'Žádný popis k dispozici.'}
              </p>
            </motion.div>

            {/* 3D Floor Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <Box className="w-6 h-6 text-[var(--gold)]" />
                <h2 className="text-2xl font-bold font-['Syne']">Interaktivní 3D půdorys</h2>
              </div>
              <div className="h-[400px]">
                <Canvas shadows>
                  <Suspense fallback={null}>
                    <FloorPlan3D />
                  </Suspense>
                </Canvas>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Price card */}
            <div className="glass rounded-3xl p-6 gradient-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[var(--gold)] text-sm font-medium uppercase tracking-wider">
                    {property.property_type || 'Nemovitost'}
                  </span>
                  <h1 className="text-2xl font-bold font-['Syne'] mt-1">{property.title}</h1>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setLiked(!liked)}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                      liked ? 'bg-red-500' : 'glass'
                    )}
                  >
                    <Heart className={cn('w-5 h-5', liked && 'fill-white')} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full glass flex items-center justify-center"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <p className="flex items-center gap-2 text-white/60 mb-6">
                <MapPin className="w-4 h-4" />
                {property.address}, {property.city}
              </p>

              <div className="text-4xl font-bold text-gradient mb-6">
                {formatPrice(property.price)}
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white/5">
                <div className="text-center">
                  <Bed className="w-5 h-5 mx-auto mb-1 text-[var(--gold)]" />
                  <p className="text-xl font-bold">{property.bedrooms || '-'}</p>
                  <p className="text-xs text-white/50">Ložnice</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <Bath className="w-5 h-5 mx-auto mb-1 text-[var(--gold)]" />
                  <p className="text-xl font-bold">{property.bathrooms || '-'}</p>
                  <p className="text-xs text-white/50">Koupelny</p>
                </div>
                <div className="text-center">
                  <Maximize className="w-5 h-5 mx-auto mb-1 text-[var(--gold)]" />
                  <p className="text-xl font-bold">{property.sqft || '-'}</p>
                  <p className="text-xs text-white/50">m²</p>
                </div>
              </div>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="glass rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-[var(--gold)]" />
                  Vybavení
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1.5 rounded-full bg-white/5 text-sm text-white/80 border border-white/10"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Virtual staging */}
            <VirtualStagingButton propertyId={property.id} />

            {/* Contact */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4">Kontaktovat makléře</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--purple-light)] flex items-center justify-center text-xl font-bold">
                  PJ
                </div>
                <div>
                  <p className="font-semibold">Patrik Jedlička</p>
                  <p className="text-white/50 text-sm">Senior makléř</p>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-white font-bold flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Naplánovat prohlídku
                </motion.button>
                <a href="mailto:patrikjedlicka7@gmail.com" className="block">
                  <button className="w-full py-3 rounded-xl glass flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
