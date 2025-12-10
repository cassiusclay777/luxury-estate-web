/**
 * =============================================================================
 * LUXESTIMATE - Zestimate-style Price Estimation
 * =============================================================================
 * AI-powered property valuation showing:
 * - Estimated market value
 * - Price per m² comparison
 * - Market position indicator (above/below market)
 * 
 * Simple model: price/m² in area ± size ± year built
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info, MapPin, Ruler, Calendar } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface LuxEstimateProps {
  propertyPrice: number;
  propertyArea: number;
  city: string;
  yearBuilt?: number;
  propertyType?: string;
  className?: string;
}

interface MarketData {
  avgPricePerM2: number;
  minPricePerM2: number;
  maxPricePerM2: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

// =============================================================================
// MARKET DATA (Simulated - in production, fetch from API)
// =============================================================================

const MARKET_DATA: Record<string, MarketData> = {
  'Praha': { avgPricePerM2: 125000, minPricePerM2: 85000, maxPricePerM2: 250000, trend: 'up', trendPercent: 3.2 },
  'Brno': { avgPricePerM2: 85000, minPricePerM2: 55000, maxPricePerM2: 150000, trend: 'up', trendPercent: 4.5 },
  'Ostrava': { avgPricePerM2: 45000, minPricePerM2: 25000, maxPricePerM2: 80000, trend: 'stable', trendPercent: 0.8 },
  'Plzeň': { avgPricePerM2: 65000, minPricePerM2: 40000, maxPricePerM2: 110000, trend: 'up', trendPercent: 2.1 },
  'Liberec': { avgPricePerM2: 55000, minPricePerM2: 35000, maxPricePerM2: 95000, trend: 'up', trendPercent: 1.8 },
  'Olomouc': { avgPricePerM2: 60000, minPricePerM2: 38000, maxPricePerM2: 100000, trend: 'up', trendPercent: 2.5 },
  'default': { avgPricePerM2: 55000, minPricePerM2: 30000, maxPricePerM2: 90000, trend: 'stable', trendPercent: 1.0 },
};

// =============================================================================
// HELPERS
// =============================================================================

function getMarketData(city: string): MarketData {
  // Find matching city (case-insensitive, partial match)
  const normalizedCity = city.toLowerCase();
  
  for (const [key, data] of Object.entries(MARKET_DATA)) {
    if (key.toLowerCase() === normalizedCity || normalizedCity.includes(key.toLowerCase())) {
      return data;
    }
  }
  
  return MARKET_DATA.default;
}

function calculateEstimate(
  area: number,
  city: string,
  yearBuilt?: number,
  propertyType?: string
): { estimate: number; confidence: number } {
  const market = getMarketData(city);
  let basePrice = market.avgPricePerM2;

  // Adjust for property age
  if (yearBuilt) {
    const age = new Date().getFullYear() - yearBuilt;
    if (age < 5) basePrice *= 1.1; // New construction premium
    else if (age < 20) basePrice *= 1.0;
    else if (age < 50) basePrice *= 0.95;
    else basePrice *= 0.85; // Older buildings discount
  }

  // Adjust for property type
  if (propertyType) {
    const type = propertyType.toLowerCase();
    if (type.includes('penthouse') || type.includes('vila')) basePrice *= 1.3;
    else if (type.includes('byt')) basePrice *= 1.0;
    else if (type.includes('dům')) basePrice *= 0.95;
  }

  // Size adjustment (smaller = higher price/m², larger = lower)
  if (area < 50) basePrice *= 1.15;
  else if (area < 100) basePrice *= 1.0;
  else if (area < 200) basePrice *= 0.95;
  else basePrice *= 0.9;

  const estimate = basePrice * area;
  
  // Confidence based on data availability
  let confidence = 70;
  if (yearBuilt) confidence += 10;
  if (propertyType) confidence += 10;
  if (MARKET_DATA[city]) confidence += 10;

  return { estimate, confidence: Math.min(confidence, 95) };
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} mil. Kč`;
  }
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value);
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LuxEstimate({
  propertyPrice,
  propertyArea,
  city,
  yearBuilt,
  propertyType,
  className = '',
}: LuxEstimateProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading for dramatic effect
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate estimate and comparison
  const { estimate, analysis } = useMemo(() => {
    const { estimate, confidence } = calculateEstimate(area || 1, city, yearBuilt, propertyType);
    const market = getMarketData(city);
    
    const actualPricePerM2 = propertyPrice / propertyArea;
    const difference = propertyPrice - estimate;
    const differencePercent = ((propertyPrice - estimate) / estimate) * 100;
    
    const isAboveMarket = difference > 0;
    const isSignificant = Math.abs(differencePercent) > 5;

    return {
      estimate,
      analysis: {
        confidence,
        market,
        actualPricePerM2,
        difference,
        differencePercent,
        isAboveMarket,
        isSignificant,
      },
    };
  }, [propertyPrice, propertyArea, city, yearBuilt, propertyType]);

  const area = propertyArea;

  // Determine indicator color and icon
  const getIndicator = () => {
    if (!analysis.isSignificant) {
      return { icon: Minus, color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Na úrovni trhu' };
    }
    if (analysis.isAboveMarket) {
      return { icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Nad tržní cenou' };
    }
    return { icon: TrendingDown, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Pod tržní cenou' };
  };

  const indicator = getIndicator();
  const Icon = indicator.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      className={`bg-bg-surface border border-white/10 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-lg">🏠</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">LuxEstimate™</h3>
            <p className="text-xs text-gray-400">Odhad tržní hodnoty</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Estimated Value */}
        <div className="text-center py-2">
          <p className="text-xs text-gray-400 mb-1">Odhadovaná hodnota</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(estimate)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Spolehlivost: {analysis.confidence}%
          </p>
        </div>

        {/* Market Position Indicator */}
        <div className={`flex items-center justify-between p-3 rounded-xl ${indicator.bg}`}>
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${indicator.color}`} />
            <span className={`font-medium ${indicator.color}`}>{indicator.label}</span>
          </div>
          <span className={`text-lg font-bold ${indicator.color}`}>
            {analysis.differencePercent >= 0 ? '+' : ''}{analysis.differencePercent.toFixed(1)}%
          </span>
        </div>

        {/* Price Comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <Ruler className="w-3 h-3" />
              Cena za m²
            </div>
            <p className="text-white font-semibold">
              {Math.round(analysis.actualPricePerM2).toLocaleString('cs-CZ')} Kč
            </p>
            <p className="text-xs text-gray-500">
              Průměr: {analysis.market.avgPricePerM2.toLocaleString('cs-CZ')} Kč
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <MapPin className="w-3 h-3" />
              Trh v {city}
            </div>
            <div className="flex items-center gap-1">
              {analysis.market.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
              {analysis.market.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
              {analysis.market.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
              <span className={`font-semibold ${
                analysis.market.trend === 'up' ? 'text-green-400' : 
                analysis.market.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {analysis.market.trend === 'up' ? '+' : ''}{analysis.market.trendPercent}%
              </span>
            </div>
            <p className="text-xs text-gray-500">za posledních 12 měsíců</p>
          </div>
        </div>

        {/* Price Range Visualization */}
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-2">Cenové rozpětí v lokalitě</p>
          <div className="relative h-2 bg-white/10 rounded-full">
            {/* Gradient bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full opacity-60" />
            
            {/* Position marker */}
            <motion.div
              initial={{ left: '50%' }}
              animate={{
                left: `${Math.min(100, Math.max(0, 
                  ((analysis.actualPricePerM2 - analysis.market.minPricePerM2) / 
                   (analysis.market.maxPricePerM2 - analysis.market.minPricePerM2)) * 100
                ))}%`
              }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-indigo-500"
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{(analysis.market.minPricePerM2 / 1000).toFixed(0)}k/m²</span>
            <span>{(analysis.market.maxPricePerM2 / 1000).toFixed(0)}k/m²</span>
          </div>
        </div>

        {/* Factors */}
        {(yearBuilt || propertyType) && (
          <div className="flex flex-wrap gap-2">
            {yearBuilt && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                {yearBuilt}
              </span>
            )}
            {propertyType && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400">
                {propertyType}
              </span>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          LuxEstimate je automatický odhad založený na tržních datech. Pro přesné ocenění kontaktujte odborníka.
        </p>
      </div>
    </motion.div>
  );
}

export default LuxEstimate;
