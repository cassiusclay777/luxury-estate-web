'use client'
import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Property } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'
import { motion } from 'framer-motion'

interface MapViewProps {
  properties: Property[]
  onPropertyClick?: (property: Property) => void
  center?: [number, number]
  zoom?: number
}

export function MapView({ properties, onPropertyClick, center = [16.6068, 49.1951], zoom = 11 }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: center,
      zoom: zoom,
      pitch: 45,
      bearing: 0
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    // Map loaded event
    map.current.on('load', () => {
      setMapLoaded(true)

      if (!map.current) return

      // Add 3D buildings layer (for supported tiles)
      map.current.addLayer({
        id: '3d-buildings',
        source: 'osm',
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6
        }
      })
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

      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'property-marker'
      el.style.cssText = `
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #D4AF37, #7C3AED);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
        cursor: pointer;
        transition: all 0.3s ease;
      `

      // Price label
      const priceEl = document.createElement('div')
      priceEl.className = 'property-price'
      priceEl.textContent = formatPrice(property.price)
      priceEl.style.cssText = `
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        background: rgba(10, 22, 40, 0.95);
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `
      el.appendChild(priceEl)

      // Hover effects
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'rotate(-45deg) scale(1.3)'
        el.style.zIndex = '1000'
        priceEl.style.opacity = '1'
      })

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'rotate(-45deg) scale(1)'
        el.style.zIndex = '1'
        priceEl.style.opacity = '0'
      })

      // Click handler
      el.addEventListener('click', () => {
        if (onPropertyClick) {
          onPropertyClick(property)
        }

        // Fly to property
        map.current?.flyTo({
          center: [property.lng!, property.lat!],
          zoom: 15,
          duration: 2000
        })
      })

      // Create marker
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([property.lng, property.lat])
        .addTo(map.current)

      markers.push(marker)
    })

    // Cleanup
    return () => {
      markers.forEach(marker => marker.remove())
    }
  }, [mapLoaded, properties, onPropertyClick])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-full"
    >
      <div ref={mapContainer} className="w-full h-full rounded-3xl overflow-hidden" />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--navy)] rounded-3xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/70">Načítání mapy...</p>
          </div>
        </div>
      )}

      {/* Map overlay info */}
      <div className="absolute top-4 left-4 glass rounded-2xl p-4 max-w-xs">
        <p className="text-white font-bold mb-1">🗺️ Interaktivní mapa</p>
        <p className="text-white/60 text-sm">
          {properties.length} nemovitostí v okolí
        </p>
      </div>
    </motion.div>
  )
}
