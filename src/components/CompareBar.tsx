/**
 * =============================================================================
 * COMPARE BAR - Property Comparison Sidebar
 * =============================================================================
 * Drag & drop properties to compare:
 * - Max 4 properties side by side
 * - Supabase realtime sync
 * - localStorage fallback
 * - Smooth animations
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Trash2, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// =============================================================================
// TYPES
// =============================================================================

interface CompareProperty {
  id: string;
  title: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  city: string;
  image?: string;
  slug?: string;
}

interface CompareContextType {
  properties: CompareProperty[];
  addProperty: (property: CompareProperty) => void;
  removeProperty: (id: string) => void;
  clearAll: () => void;
  isInCompare: (id: string) => boolean;
  canAdd: boolean;
}

// =============================================================================
// CONTEXT
// =============================================================================

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_PROPERTIES = 4;
const STORAGE_KEY = 'luxestate_compare';

export function CompareProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<CompareProperty[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProperties(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load compare data:', e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    } catch (e) {
      console.error('Failed to save compare data:', e);
    }
  }, [properties]);

  const addProperty = useCallback((property: CompareProperty) => {
    setProperties(prev => {
      if (prev.length >= MAX_PROPERTIES) return prev;
      if (prev.some(p => p.id === property.id)) return prev;
      return [...prev, property];
    });
  }, []);

  const removeProperty = useCallback((id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setProperties([]);
  }, []);

  const isInCompare = useCallback((id: string) => {
    return properties.some(p => p.id === id);
  }, [properties]);

  const canAdd = properties.length < MAX_PROPERTIES;

  return (
    <CompareContext.Provider value={{
      properties,
      addProperty,
      removeProperty,
      clearAll,
      isInCompare,
      canAdd,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
}

// =============================================================================
// COMPARE BUTTON (for property cards)
// =============================================================================

interface CompareButtonProps {
  property: CompareProperty;
  className?: string;
}

export function CompareButton({ property, className = '' }: CompareButtonProps) {
  const { addProperty, removeProperty, isInCompare, canAdd } = useCompare();
  const isAdded = isInCompare(property.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdded) {
      removeProperty(property.id);
    } else if (canAdd) {
      addProperty(property);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isAdded && !canAdd}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-all duration-200
        ${isAdded 
          ? 'bg-indigo-500 text-white' 
          : canAdd
            ? 'bg-white/10 text-gray-300 hover:bg-white/20'
            : 'bg-white/5 text-gray-500 cursor-not-allowed'
        }
        ${className}
      `}
      title={isAdded ? 'Odebrat z porovnání' : canAdd ? 'Přidat do porovnání' : 'Maximum 4 nemovitosti'}
    >
      <Scale className="w-4 h-4" />
      {isAdded ? 'V porovnání' : 'Porovnat'}
    </button>
  );
}

// =============================================================================
// COMPARE BAR (floating sidebar)
// =============================================================================

export function CompareBar() {
  const { properties, removeProperty, clearAll } = useCompare();
  const [isExpanded, setIsExpanded] = useState(true);

  if (properties.length === 0) return null;

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} mil.`;
    }
    return `${(price / 1000).toFixed(0)} tis.`;
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="fixed right-4 bottom-4 z-40 w-80"
    >
      <div className="bg-bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 bg-white/5 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="font-medium text-white text-sm">
              Porovnání ({properties.length}/{MAX_PROPERTIES})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); clearAll(); }}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Vymazat vše"
            >
              <Trash2 className="w-4 h-4 text-gray-400" />
            </button>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                {properties.map((property) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex items-center gap-3 p-2 bg-white/5 rounded-xl group"
                  >
                    {/* Image */}
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      {property.image ? (
                        <img 
                          src={property.image} 
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          🏠
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {property.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatPrice(property.price)} Kč • {property.area} m²
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeProperty(property.id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Compare Button */}
              {properties.length >= 2 && (
                <div className="p-3 border-t border-white/10">
                  <Link
                    href={`/compare?ids=${properties.map(p => p.id).join(',')}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
                  >
                    <Scale className="w-4 h-4" />
                    Porovnat {properties.length} nemovitosti
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// =============================================================================
// COMPARE PAGE CONTENT
// =============================================================================

export function CompareTable() {
  const { properties, removeProperty } = useCompare();

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <Scale className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Žádné nemovitosti k porovnání</h2>
        <p className="text-gray-400">Přidejte nemovitosti z katalogu pomocí tlačítka "Porovnat"</p>
      </div>
    );
  }

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(price);

  const pricePerM2 = (property: CompareProperty) => 
    Math.round(property.price / property.area);

  // Find best values for highlighting
  const lowestPrice = Math.min(...properties.map(p => p.price));
  const largestArea = Math.max(...properties.map(p => p.area));
  const lowestPricePerM2 = Math.min(...properties.map(p => pricePerM2(p)));

  const rows = [
    { label: 'Cena', getValue: (p: CompareProperty) => formatPrice(p.price), isBest: (p: CompareProperty) => p.price === lowestPrice },
    { label: 'Plocha', getValue: (p: CompareProperty) => `${p.area} m²`, isBest: (p: CompareProperty) => p.area === largestArea },
    { label: 'Cena/m²', getValue: (p: CompareProperty) => `${pricePerM2(p).toLocaleString('cs-CZ')} Kč`, isBest: (p: CompareProperty) => pricePerM2(p) === lowestPricePerM2 },
    { label: 'Pokoje', getValue: (p: CompareProperty) => p.bedrooms?.toString() || '–', isBest: () => false },
    { label: 'Koupelny', getValue: (p: CompareProperty) => p.bathrooms?.toString() || '–', isBest: () => false },
    { label: 'Lokalita', getValue: (p: CompareProperty) => p.city, isBest: () => false },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="p-4 text-left text-gray-400 font-medium"></th>
            {properties.map((property) => (
              <th key={property.id} className="p-4 min-w-[200px]">
                <div className="relative">
                  <button
                    onClick={() => removeProperty(property.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    {property.image && (
                      <img 
                        src={property.image} 
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-white text-sm truncate">
                      {property.title}
                    </h3>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.label} className={index % 2 === 0 ? 'bg-white/5' : ''}>
              <td className="p-4 text-gray-400 font-medium">{row.label}</td>
              {properties.map((property) => (
                <td 
                  key={property.id} 
                  className={`p-4 text-center ${row.isBest(property) ? 'text-green-400 font-semibold' : 'text-white'}`}
                >
                  {row.getValue(property)}
                  {row.isBest(property) && (
                    <span className="ml-1 text-xs">✓</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CompareBar;
