'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Home, X, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSearchSuggestions } from '@/lib/search'
import { useRouter } from 'next/navigation'

interface Suggestion {
  text: string
  type: 'city' | 'property_type' | 'recent'
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const results = await getSearchSuggestions(searchQuery)
      const formatted: Suggestion[] = results.map(text => ({
        text,
        type: text.includes('Brno') || text.includes('Praha') ? 'city' : 'property_type'
      }))
      setSuggestions(formatted)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query && focused) {
        fetchSuggestions(query)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, focused, fetchSuggestions])

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return

    router.push(`/search?q=${encodeURIComponent(query)}`)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.text)
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(suggestion.text)}`)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'city':
        return MapPin
      case 'property_type':
        return Home
      default:
        return TrendingUp
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <motion.div
          animate={{
            boxShadow: focused
              ? '0 10px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 2px #6366f1'
              : '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
          }}
          transition={{ duration: 0.2 }}
          className="relative rounded-2xl transition-all duration-200 bg-white shadow-lg"
        >
          <div className="flex items-center px-6 py-5 gap-4">
            <Search className="w-6 h-6 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setFocused(true)
                setShowSuggestions(true)
              }}
              onBlur={() => {
                setFocused(false)
                setTimeout(() => setShowSuggestions(false), 200)
              }}
              placeholder="Hledejte lokalitu, typ nemovitosti..."
              className="flex-1 text-lg text-gray-900 placeholder:text-gray-400 outline-none"
            />
            {query && (
              <motion.button
                type="button"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuery('')}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-600" />
              </motion.button>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition-colors flex-shrink-0"
            >
              Hledat
            </motion.button>
          </div>
        </motion.div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && (suggestions.length > 0 || loading) && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden z-50 border border-gray-100"
            >
              {loading ? (
                <div className="px-6 py-8 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="py-2">
                  {suggestions.map((suggestion, i) => {
                    const Icon = getIcon(suggestion.type)
                    return (
                      <motion.button
                        key={`${suggestion.text}-${i}`}
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                          <Icon className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{suggestion.text}</p>
                          <p className="text-gray-500 text-sm capitalize">
                            {suggestion.type === 'city' ? 'Lokalita' : 'Typ nemovitosti'}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  )
}
