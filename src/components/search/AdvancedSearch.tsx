// /src/components/search/AdvancedSearch.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { searchProperties, searchNearbyProperties, getSearchSuggestions, type SearchFilters } from '@/app/actions/properties'
import type { Database } from '@/types/database.types'

type Property = Database['public']['Tables']['properties']['Row']

interface AdvancedSearchProps {
  onResults?: (properties: Property[]) => void
  onViewModeChange?: (mode: 'grid' | 'map') => void
  viewMode?: 'grid' | 'map'
}

export function AdvancedSearch({ onResults, onViewModeChange, viewMode = 'grid' }: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false)

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    propertyType: undefined,
    city: undefined,
  })

  const [radiusKm, setRadiusKm] = useState(50)

  // Debounced search suggestions
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      const { suggestions: results } = await getSearchSuggestions(query)
      setSuggestions(results)
      setShowSuggestions(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Perform search
  const handleSearch = useCallback(async () => {
    setIsSearching(true)
    try {
      const { properties, error } = await searchProperties({
        ...filters,
        query: query || undefined,
      })

      if (!error && onResults) {
        onResults(properties)
      }
    } finally {
      setIsSearching(false)
    }
  }, [filters, query, onResults])

  // Geolocation search
  const handleGeolocationSearch = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('Geolokace není v tomto prohlížeči podporována')
      return
    }

    setIsGeolocationLoading(true)
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { properties, error } = await searchNearbyProperties({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radiusKm,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            bedrooms: filters.bedrooms,
            bathrooms: filters.bathrooms,
            propertyType: filters.propertyType,
          })

          if (!error && onResults) {
            onResults(properties)
          }
          setIsGeolocationLoading(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Nepodařilo se získat vaši polohu')
          setIsGeolocationLoading(false)
        }
      )
    } catch (error) {
      console.error('Geolocation error:', error)
      setIsGeolocationLoading(false)
    }
  }, [radiusKm, filters, onResults])

  // Trigger search on Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false)
      handleSearch()
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Hledat podle města, typu nemovitosti..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl glass text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            />

            {/* Autocomplete Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-50"
                >
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(suggestion)
                        setShowSuggestions(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 rounded-2xl glass flex items-center gap-2 ${
              showFilters ? 'bg-[var(--gold)]/20 ring-2 ring-[var(--gold)]' : ''
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Filtry</span>
          </motion.button>

          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            disabled={isSearching}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-white font-semibold flex items-center gap-2 glow-gold disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">Hledám...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Hledat</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Pokročilé filtry</h3>
              <button
                onClick={() => {
                  setFilters({
                    query: '',
                    minPrice: undefined,
                    maxPrice: undefined,
                    bedrooms: undefined,
                    bathrooms: undefined,
                    propertyType: undefined,
                    city: undefined,
                  })
                }}
                className="text-sm text-white/60 hover:text-white flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Vymazat filtry
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Minimální cena</label>
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Kč"
                  className="w-full px-4 py-3 rounded-xl glass text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Maximální cena</label>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Kč"
                  className="w-full px-4 py-3 rounded-xl glass text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Počet ložnic</label>
                <select
                  value={filters.bedrooms || ''}
                  onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-3 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                >
                  <option value="">Jakýkoliv</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Počet koupelen</label>
                <select
                  value={filters.bathrooms || ''}
                  onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-3 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                >
                  <option value="">Jakýkoliv</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Typ nemovitosti</label>
                <select
                  value={filters.propertyType || ''}
                  onChange={(e) => setFilters({ ...filters, propertyType: e.target.value || undefined })}
                  className="w-full px-4 py-3 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                >
                  <option value="">Všechny typy</option>
                  <option value="Byt">Byt</option>
                  <option value="Rodinný dům">Rodinný dům</option>
                  <option value="Vila">Vila</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Loft">Loft</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Město</label>
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value || undefined })}
                  placeholder="Např. Brno"
                  className="w-full px-4 py-3 rounded-xl glass text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Geolocation & View Mode Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Geolocation Search */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGeolocationSearch}
          disabled={isGeolocationLoading}
          className="px-6 py-3 rounded-xl glass flex items-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {isGeolocationLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <MapPin className="w-5 h-5" />
          )}
          <span>Hledat v okolí</span>
        </motion.button>

        {/* Radius Selector */}
        <select
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          className="px-4 py-3 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
        >
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="25">25 km</option>
          <option value="50">50 km</option>
        </select>

        {/* View Mode Toggle */}
        {onViewModeChange && (
          <div className="ml-auto flex gap-2 glass rounded-xl p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Mřížka
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Mapa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
