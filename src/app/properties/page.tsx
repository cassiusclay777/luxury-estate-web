// /src/app/properties/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AdvancedSearch } from '../../components/search/AdvancedSearch'
import { PropertyMap } from '../../components/map/PropertyMap'
import { PropertyCard } from '../../components/property/PropertyCard'
import { getAllProperties } from '../actions/properties'
import type { Database } from 'types/database.types'
import { Loader2 } from 'lucide-react'

type Property = Database['public']['Tables']['properties']['Row']

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [isLoading, setIsLoading] = useState(true)

  // Load initial properties
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      const { properties: data } = await getAllProperties(100)
      setProperties(data)
      setIsLoading(false)
    }
    loadProperties()
  }, [])

  const handleSearchResults = (results: Property[]) => {
    setProperties(results)
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Všechny</span>
            <span className="text-white"> nemovitosti</span>
          </h1>
          <p className="text-white/60 text-lg">
            Objevte {properties.length} exkluzivních nemovitostí v Brně a okolí
          </p>
        </motion.div>

        {/* Search Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <AdvancedSearch
            onResults={handleSearchResults}
            onViewModeChange={setViewMode}
            viewMode={viewMode}
          />
        </motion.div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--gold)]" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property, i) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                ))}
              </div>
            ) : (
              // Map View
              <div className="h-[calc(100vh-400px)] min-h-[600px]">
                <PropertyMap properties={properties} />
              </div>
            )}

            {/* No Results */}
            {properties.length === 0 && !isLoading && (
              <div className="text-center py-32">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Žádné nemovitosti nenalezeny
                </h3>
                <p className="text-white/60">
                  Zkuste upravit filtry nebo vyhledávací kritéria
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
