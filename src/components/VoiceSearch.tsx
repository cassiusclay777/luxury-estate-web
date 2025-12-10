/**
 * =============================================================================
 * VOICE SEARCH - Czech Speech Recognition
 * =============================================================================
 * Natural language property search:
 * - Web Speech API with Czech (cs-CZ)
 * - AI parsing via Groq
 * - Examples: "Najdi mi tři plus jedna v Líšni do sedmi milionů"
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, Search, X, Sparkles } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface VoiceSearchProps {
  onSearch: (filters: SearchFilters) => void;
  className?: string;
}

interface SearchFilters {
  type?: string;
  rooms?: number;
  city?: string;
  district?: string;
  maxPrice?: number;
  minPrice?: number;
  minArea?: number;
  maxArea?: number;
  query?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

// Extend Window interface for Speech API
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
  }
}

// =============================================================================
// VOICE PARSER (Client-side, fallback)
// =============================================================================

function parseVoiceQueryLocal(query: string): SearchFilters {
  const filters: SearchFilters = { query };
  const lower = query.toLowerCase();

  // Parse rooms (e.g., "tři plus jedna", "3+1", "čtyři pokoje")
  const roomPatterns = [
    { pattern: /(\d)\s*\+\s*(\d)/, calc: (m: RegExpMatchArray) => parseInt(m[1]) + parseInt(m[2]) + 1 },
    { pattern: /(\d)\s*plus\s*(\d)/, calc: (m: RegExpMatchArray) => parseInt(m[1]) + parseInt(m[2]) + 1 },
    { pattern: /jedno\s*plus\s*jedna|jedna\s*plus\s*jedna|1\+1/, calc: () => 2 },
    { pattern: /dvě\s*plus\s*jedna|dva\s*plus\s*jedna|2\+1/, calc: () => 3 },
    { pattern: /tři\s*plus\s*jedna|3\+1/, calc: () => 4 },
    { pattern: /čtyři\s*plus\s*jedna|4\+1/, calc: () => 5 },
    { pattern: /(\d+)\s*poko/, calc: (m: RegExpMatchArray) => parseInt(m[1]) },
    { pattern: /jeden\s*pokoj/, calc: () => 1 },
    { pattern: /dva\s*pokoje|dvou\s*pokojov/, calc: () => 2 },
    { pattern: /tři\s*pokoje|třípokojov/, calc: () => 3 },
    { pattern: /čtyři\s*pokoje|čtyřpokojov/, calc: () => 4 },
  ];

  for (const { pattern, calc } of roomPatterns) {
    const match = lower.match(pattern);
    if (match) {
      filters.rooms = calc(match);
      break;
    }
  }

  // Parse price (e.g., "do pěti milionů", "pod 10 mil", "max 5000000")
  const pricePatterns = [
    { pattern: /do\s*(\d+)\s*milion/, mult: 1000000 },
    { pattern: /pod\s*(\d+)\s*mil/, mult: 1000000 },
    { pattern: /max(?:imálně)?\s*(\d+)\s*mil/, mult: 1000000 },
    { pattern: /do\s*(\d+)\s*mil/, mult: 1000000 },
    { pattern: /do\s*(\d+)\s*000\s*000/, mult: 1 },
    { pattern: /(\d+)\s*milion/, mult: 1000000 },
  ];

  // Czech number words
  const numberWords: Record<string, number> = {
    'jeden': 1, 'jedna': 1, 'jedno': 1,
    'dva': 2, 'dvě': 2, 'dvou': 2,
    'tři': 3, 'třech': 3,
    'čtyři': 4, 'čtyřech': 4,
    'pět': 5, 'pěti': 5,
    'šest': 6, 'šesti': 6,
    'sedm': 7, 'sedmi': 7,
    'osm': 8, 'osmi': 8,
    'devět': 9, 'devíti': 9,
    'deset': 10, 'deseti': 10,
    'patnáct': 15,
    'dvacet': 20,
  };

  // Replace Czech number words with digits
  let processedQuery = lower;
  for (const [word, num] of Object.entries(numberWords)) {
    processedQuery = processedQuery.replace(new RegExp(word, 'gi'), num.toString());
  }

  for (const { pattern, mult } of pricePatterns) {
    const match = processedQuery.match(pattern);
    if (match) {
      filters.maxPrice = parseInt(match[1]) * mult;
      break;
    }
  }

  // Parse cities/districts
  const locations = [
    'Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'České Budějovice',
    'Hradec Králové', 'Pardubice', 'Zlín', 'Jihlava', 'Karlovy Vary',
    // Brno districts
    'Líšeň', 'Bystrc', 'Žabovřesky', 'Královo Pole', 'Černovice', 'Vinohrady',
    'Kohoutovice', 'Bohunice', 'Starý Lískovec', 'Nový Lískovec', 'Komín',
    // Praha districts
    'Vinohrady', 'Žižkov', 'Smíchov', 'Dejvice', 'Holešovice', 'Karlín',
    'Vršovice', 'Nusle', 'Podolí', 'Braník', 'Modřany', 'Krč',
  ];

  for (const loc of locations) {
    if (lower.includes(loc.toLowerCase())) {
      // Check if it's a district (smaller location within a city)
      const districts = ['Líšeň', 'Bystrc', 'Žabovřesky', 'Vinohrady', 'Žižkov', 'Smíchov'];
      if (districts.some(d => d.toLowerCase() === loc.toLowerCase())) {
        filters.district = loc;
      } else {
        filters.city = loc;
      }
      break;
    }
  }

  // Parse property type
  if (lower.includes('byt')) filters.type = 'byt';
  else if (lower.includes('dům') || lower.includes('rodinný')) filters.type = 'dům';
  else if (lower.includes('vila')) filters.type = 'vila';
  else if (lower.includes('penthouse')) filters.type = 'penthouse';

  return filters;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function VoiceSearch({ onSearch, className = '' }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'cs-CZ';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        handleFinalResult(text);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(getErrorMessage(event.error));
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'not-allowed':
        return 'Přístup k mikrofonu byl zamítnut. Povolte mikrofon v nastavení prohlížeče.';
      case 'no-speech':
        return 'Nebyla detekována žádná řeč. Zkuste to znovu.';
      case 'audio-capture':
        return 'Mikrofon není dostupný.';
      default:
        return 'Nastala chyba při rozpoznávání řeči.';
    }
  };

  const handleFinalResult = useCallback(async (text: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Try AI parsing first
      const response = await fetch('/api/voice-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });

      let filters: SearchFilters;

      if (response.ok) {
        const data = await response.json();
        filters = data.filters || parseVoiceQueryLocal(text);
      } else {
        // Fallback to local parsing
        filters = parseVoiceQueryLocal(text);
      }

      onSearch(filters);
    } catch (err) {
      // Fallback to local parsing on any error
      const filters = parseVoiceQueryLocal(text);
      onSearch(filters);
    } finally {
      setIsProcessing(false);
    }
  }, [onSearch]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setError(null);
    setTranscript('');
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  if (!isSupported) {
    return (
      <div className={`text-center text-gray-400 text-sm ${className}`}>
        Hlasové vyhledávání není v tomto prohlížeči podporováno.
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className={`
          relative flex items-center justify-center w-14 h-14 rounded-full
          transition-all duration-300 shadow-lg
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-indigo-500 hover:bg-indigo-600'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}

        {/* Pulse Animation */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
            <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-50" />
          </>
        )}
      </button>

      {/* Transcript Popup */}
      <AnimatePresence>
        {(isListening || transcript || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72"
          >
            <div className="bg-bg-surface border border-white/10 rounded-2xl p-4 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-white">
                  {isListening ? 'Poslouchám...' : isProcessing ? 'Zpracovávám...' : 'Rozpoznáno'}
                </span>
              </div>

              {/* Transcript */}
              {transcript && (
                <p className="text-gray-300 text-sm mb-3 min-h-[40px]">
                  "{transcript}"
                </p>
              )}

              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex items-center gap-2 text-indigo-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzuji váš dotaz...
                </div>
              )}

              {/* Hint */}
              {isListening && !transcript && (
                <p className="text-gray-500 text-xs">
                  Zkuste: "Najdi mi tři plus jedna v Brně do pěti milionů"
                </p>
              )}
            </div>

            {/* Arrow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
              <div className="w-3 h-3 bg-bg-surface border-r border-b border-white/10 transform rotate-45 -mt-1.5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72"
          >
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
              <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VoiceSearch;
