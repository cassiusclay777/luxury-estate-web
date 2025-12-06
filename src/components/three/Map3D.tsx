'use client'
import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Property } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

interface Map3DProps {
  properties?: Property[]
  onPropertyClick?: (property: Property) => void
  center?: [number, number]
  zoom?: number
}

export function Map3D({ 
  properties = [], 
  onPropertyClick, 
  center = [14.4378, 50.0755], 
  zoom = 12 
}: Map3DProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map with satellite style
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // Dark style as fallback
      center: center,
      zoom: zoom,
      pitch: 0,
      bearing: 0,
    })

    // Try to load satellite style (requires Mapbox token or alternative)
    // For open-source alternative, using CartoDB dark style
    map.current.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      map.current?.remove()
      map.current = null
      }
  }, [center, zoom])

  // Add property markers
  useEffect(() => {
    if (!map.current || !mapLoaded || !properties.length) return

    const markers: maplibregl.Marker[] = []

    properties.forEach((property) => {
      if (!property.lat || !property.lng || !map.current) return

      // Create custom marker - white circle with indigo dot
      const el = document.createElement('div')
      el.className = 'property-marker'
      el.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: white;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      `

      // Indigo dot inside
      const dot = document.createElement('div')
      dot.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #6366f1;
      `
      el.appendChild(dot)

      // Price bubble (hidden by default)
      const priceEl = document.createElement('div')
      priceEl.className = 'property-price-bubble'
      priceEl.textContent = formatPrice(property.price)
      priceEl.style.cssText = `
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-8px);
        background: white;
        color: #0a0a0a;
        padding: 6px 12px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease, transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
      `
      el.appendChild(priceEl)

      // Hover effects
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)'
        el.style.zIndex = '1000'
        priceEl.style.opacity = '1'
        priceEl.style.transform = 'translateX(-50%) translateY(-12px)'
        setHoveredProperty(property)
        
        // Smooth zoom to property
        map.current?.easeTo({
          center: [property.lng!, property.lat!],
          zoom: Math.min(map.current.getZoom() + 1, 18),
          duration: 500,
        })
      })

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.zIndex = '1'
        priceEl.style.opacity = '0'
        priceEl.style.transform = 'translateX(-50%) translateY(-8px)'
        setHoveredProperty(null)
      })

      // Click handler
      el.addEventListener('click', () => {
        if (onPropertyClick) {
          onPropertyClick(property)
        }

        map.current?.flyTo({
          center: [property.lng!, property.lat!],
          zoom: 15,
          duration: 2000,
        })
      })

      // Create marker
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([property.lng, property.lat])
        .addTo(map.current)

      markers.push(marker)
    })

    return () => {
      markers.forEach(marker => marker.remove())
}
  }, [mapLoaded, properties, onPropertyClick])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-full rounded-2xl overflow-hidden bg-[#111111]"
    >
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[#a0a0a0]">Načítání mapy...</p>
          </div>
        </div>
      )}

      {/* Hovered property info */}
      <AnimatePresence>
        {hoveredProperty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 left-4 bg-[#161616] rounded-2xl p-4 max-w-xs border border-[#111111]"
          >
            <p className="text-[#f5f5f5] font-bold mb-1">{hoveredProperty.title}</p>
            <p className="text-[#a0a0a0] text-sm">{hoveredProperty.address}</p>
            <p className="text-indigo-400 font-semibold mt-2">
              {formatPrice(hoveredProperty.price)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
