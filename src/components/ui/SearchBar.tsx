'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Home, DollarSign, X, Sparkles, TrendingUp, Mic, MicOff } from 'lucide-react'
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
  const [priceRange, setPriceRange] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Debounced search suggestions
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

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'cs-CZ'

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setTranscript(transcript)
        setIsListening(false)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Web Speech API není v tomto prohlížeči podporována.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // Debounce effect
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

    // Build search URL with params
    const params = new URLSearchParams()
    params.set('q', query)
    if (priceRange) params.set('price', priceRange)

    router.push(`/search?${params.toString()}`)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.text)
    setShowSuggestions(false)

    // Immediate search with suggestion
    const params = new URLSearchParams()
    params.set('q', suggestion.text)
    if (priceRange) params.set('price', priceRange)

    router.push(`/search?${params.toString()}`)
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
    <motion.form
      onSubmit={handleSearch}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="relative w-full max-w-4xl mx-auto"
    >
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 60px rgba(212, 175, 55, 0.4), 0 0 100px rgba(124, 58, 237, 0.2)'
            : '0 0 30px rgba(212, 175, 55, 0.2)',
        }}
        className={cn(
          'relative rounded-2xl transition-all duration-500',
          focused ? 'gradient-border' : 'glass'
        )}
      >
        <div className="flex items-center p-2 gap-2">
          <div className="flex-1 flex items-center gap-3 px-4">
            <motion.div
              animate={{ rotate: focused ? 360 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <Search className="w-6 h-6 text-[var(--gold)]" />
            </motion.div>
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
              placeholder="Hledejte lokalitu, typ nemovitosti... (např. 'Brno 2+kk do 7M')"
              className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-white/40 py-4"
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              aria-label={isListening ? 'Zastavit nahrávání' : 'Spustit hlasové vyhledávání'}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500/20 text-red-400' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </motion.button>
            {query && (
              <motion.button
                type="button"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuery('')}
                aria-label="Vymazat"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 border-l border-white/10">
            <DollarSign className="w-5 h-5 text-white/50" />
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              aria-label="Cenové rozpětí"
              className="bg-transparent border-none outline-none text-white/70 cursor-pointer"
            >
              <option value="">Cena</option>
              <option value="0-5000000">Do 5M Kč</option>
              <option value="5000000-15000000">5M - 15M Kč</option>
              <option value="15000000-999999999">15M+ Kč</option>
            </select>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--gold)] via-[var(--purple-light)] to-[var(--cyan)] text-white font-bold flex items-center gap-2 glow-gold"
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline">Hledat</span>
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-4 glass rounded-2xl overflow-hidden z-50"
          >
            {loading ? (
              <div className="px-6 py-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {suggestions.map((suggestion, i) => {
                  const Icon = getIcon(suggestion.type)
                  return (
                    <motion.button
                      key={`${suggestion.text}-${i}`}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/10 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--purple-light)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 text-[var(--gold)]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{suggestion.text}</p>
                        <p className="text-white/50 text-sm capitalize">
                          {suggestion.type === 'city' ? 'Lokalita' : 'Typ nemovitosti'}
                        </p>
                      </div>
                    </motion.button>
                  )
                })}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  )
}
