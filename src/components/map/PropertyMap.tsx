'use client'
import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import type { Database } from 'types/database.types'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Navigation, Home, Bed, Bath, Maximize } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyMapProps {
  properties: Property[]
  center?: [number, number]
  zoom?: number
  onPropertyClick?: (property: Property) => void
}

export function PropertyMap({ properties, center, zoom = 13, onPropertyClick }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markers = useRef<maplibregl.Marker[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  // Initialize map with satellite style
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const defaultCenter: [number, number] = center || [16.6068, 49.1951] // Brno

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // Satellite style - using CARTO Voyager as a cleaner alternative
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: defaultCenter,
      zoom: zoom,
      attributionControl: false,
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [center, zoom])

  // Update markers when properties change
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove())
    markers.current = []

    // Add new markers with white circle + indigo dot design
    properties.forEach((property) => {
      if (!property.lat || !property.lng) return

      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'property-marker'
      el.innerHTML = `
        <div class="marker-pin">
          <div class="marker-pin-inner"></div>
        </div>
        <div class="marker-price-bubble">${(property.price / 1000000).toFixed(1)}M Kč</div>
      `

      el.style.cssText = `
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      `

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.15) translateY(-4px)'
        const bubble = el.querySelector('.marker-price-bubble') as HTMLElement
        if (bubble) {
          bubble.style.opacity = '1'
          bubble.style.transform = 'translateY(-8px) scale(1)'
        }
      })

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1) translateY(0)'
        const bubble = el.querySelector('.marker-price-bubble') as HTMLElement
        if (bubble && (!selectedProperty || selectedProperty.id !== property.id)) {
          bubble.style.opacity = '0'
          bubble.style.transform = 'translateY(0) scale(0.9)'
        }
      })

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat([property.lng, property.lat])
        .addTo(map.current!)

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedProperty(property)
        if (onPropertyClick) {
          onPropertyClick(property)
        }

        // Fly to property
        map.current?.flyTo({
          center: [property.lng!, property.lat!],
          zoom: 15,
          duration: 1000,
        })
      })

      markers.current.push(marker)
    })

    // Fit bounds to show all properties
    if (properties.length > 0 && !center) {
      const bounds = new maplibregl.LngLatBounds()
      properties.forEach((property) => {
        if (property.lat && property.lng) {
          bounds.extend([property.lng, property.lat])
        }
      })
      map.current.fitBounds(bounds, { padding: 50, duration: 1000 })
    }
  }, [properties, center, onPropertyClick])

  // Get user location
  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokace není v tomto prohlížeči podporována')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ]
        setUserLocation(coords)

        // Add user location marker
        const el = document.createElement('div')
        el.innerHTML = `
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #6366f1;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
          "></div>
        `

        new maplibregl.Marker({
          element: el,
          anchor: 'center',
        })
          .setLngLat(coords)
          .addTo(map.current!)

        // Fly to user location
        map.current?.flyTo({
          center: coords,
          zoom: 14,
          duration: 1000,
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Nepodařilo se získat vaši polohu')
      }
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-2xl overflow-hidden" />

      {/* Custom CSS for markers */}
      <style jsx global>{`
        .property-marker {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .marker-pin {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 1;
        }

        .marker-pin-inner {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #6366f1;
        }

        .marker-price-bubble {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(0) scale(0.9);
          background: white;
          color: #0a0a0a;
          padding: 8px 14px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 13px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 8px;
        }

        .marker-price-bubble::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid white;
        }
      `}</style>

      {/* User Location Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGetUserLocation}
        className="absolute top-4 left-4 z-10 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:shadow-indigo-glow transition-shadow"
      >
        <Navigation className="w-5 h-5 text-gray-900" />
      </motion.button>

      {/* Selected Property Card */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 z-10"
          >
            <div className="bg-[#161616] rounded-2xl overflow-hidden shadow-xl">
              {/* Property Image */}
              <div className="relative h-48">
                <Image
                  src={selectedProperty.images?.[0] || '/placeholder.jpg'}
                  alt={selectedProperty.title}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedProperty(null)}
                  aria-label="Zavřít detail nemovitosti"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Property Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-1">
                    {selectedProperty.title}
                  </h3>
                  <p className="text-text-secondary text-sm">{selectedProperty.address}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  {selectedProperty.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{selectedProperty.bedrooms}</span>
                    </div>
                  )}
                  {selectedProperty.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{selectedProperty.bathrooms}</span>
                    </div>
                  )}
                  {selectedProperty.area && (
                    <div className="flex items-center gap-1">
                      <Maximize className="w-4 h-4" />
                      <span>{selectedProperty.area} m²</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div>
                    <div className="text-sm text-text-secondary">Cena</div>
                    <div className="text-2xl font-bold text-text-primary tabular-nums">
                      {(selectedProperty.price / 1000000).toFixed(2)}M Kč
                    </div>
                  </div>
                  <Link
                    href={`/properties/${selectedProperty.id}`}
                    className="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-semibold flex items-center gap-2 hover:bg-indigo-400 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
