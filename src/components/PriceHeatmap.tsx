/**
 * =============================================================================
 * PRICE HEATMAP - Interactive Price per m² Map
 * =============================================================================
 * MapLibre GL layer showing price distribution:
 * - GeoJSON data for Jihomoravský kraj
 * - Color scale: blue (low) → red (high)
 * - Turf.js for spatial analysis
 * - Click to see detailed stats
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info, Layers, X } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// =============================================================================
// TYPES
// =============================================================================

interface PriceHeatmapProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

interface DistrictData {
  name: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
  trend: number;
}

// =============================================================================
// SAMPLE DATA - Jihomoravský kraj districts
// =============================================================================

const DISTRICTS_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Brno-město', avgPrice: 95000, minPrice: 65000, maxPrice: 180000, count: 523, trend: 4.2 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[16.55, 49.17], [16.70, 49.17], [16.70, 49.23], [16.55, 49.23], [16.55, 49.17]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Brno-venkov', avgPrice: 65000, minPrice: 45000, maxPrice: 95000, count: 312, trend: 3.8 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[16.35, 49.10], [16.75, 49.10], [16.75, 49.35], [16.35, 49.35], [16.35, 49.10]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Blansko', avgPrice: 45000, minPrice: 30000, maxPrice: 65000, count: 156, trend: 2.1 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[16.55, 49.30], [16.85, 49.30], [16.85, 49.50], [16.55, 49.50], [16.55, 49.30]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Břeclav', avgPrice: 42000, minPrice: 28000, maxPrice: 60000, count: 189, trend: 1.5 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[16.75, 48.70], [17.05, 48.70], [17.05, 48.95], [16.75, 48.95], [16.75, 48.70]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Hodonín', avgPrice: 38000, minPrice: 25000, maxPrice: 55000, count: 134, trend: 0.8 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[17.00, 48.80], [17.35, 48.80], [17.35, 49.05], [17.00, 49.05], [17.00, 48.80]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Vyškov', avgPrice: 48000, minPrice: 32000, maxPrice: 68000, count: 98, trend: 2.5 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[16.85, 49.15], [17.15, 49.15], [17.15, 49.35], [16.85, 49.35], [16.85, 49.15]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Znojmo', avgPrice: 40000, minPrice: 26000, maxPrice: 58000, count: 167, trend: 1.2 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[15.95, 48.75], [16.35, 48.75], [16.35, 49.00], [15.95, 49.00], [15.95, 48.75]]]
      }
    },
  ]
};

// Price ranges for color scale
const PRICE_RANGES = [
  { min: 0, max: 40000, color: '#3b82f6' },      // Blue - lowest
  { min: 40000, max: 55000, color: '#22c55e' },  // Green
  { min: 55000, max: 70000, color: '#eab308' },  // Yellow
  { min: 70000, max: 90000, color: '#f97316' },  // Orange
  { min: 90000, max: Infinity, color: '#ef4444' }, // Red - highest
];

function getPriceColor(price: number): string {
  for (const range of PRICE_RANGES) {
    if (price >= range.min && price < range.max) {
      return range.color;
    }
  }
  return PRICE_RANGES[PRICE_RANGES.length - 1].color;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PriceHeatmap({
  className = '',
  initialCenter = [16.6, 49.2],
  initialZoom = 8.5,
}: PriceHeatmapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [isLayerVisible, setIsLayerVisible] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || 'get_your_key';
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${mapTilerKey}`,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add districts source
      map.current.addSource('districts', {
        type: 'geojson',
        data: DISTRICTS_GEOJSON,
      });

      // Add fill layer with data-driven colors
      map.current.addLayer({
        id: 'districts-fill',
        type: 'fill',
        source: 'districts',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'avgPrice'],
            30000, '#3b82f6',
            50000, '#22c55e',
            70000, '#eab308',
            90000, '#f97316',
            120000, '#ef4444',
          ],
          'fill-opacity': 0.6,
        },
      });

      // Add border layer
      map.current.addLayer({
        id: 'districts-border',
        type: 'line',
        source: 'districts',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1,
          'line-opacity': 0.5,
        },
      });

      // Add hover effect
      map.current.on('mouseenter', 'districts-fill', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'districts-fill', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      // Add click handler
      map.current.on('click', 'districts-fill', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties as DistrictData;
          setSelectedDistrict(props);
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialCenter, initialZoom]);

  // Toggle layer visibility
  const toggleLayer = useCallback(() => {
    if (!map.current) return;
    
    const visibility = isLayerVisible ? 'none' : 'visible';
    map.current.setLayoutProperty('districts-fill', 'visibility', visibility);
    map.current.setLayoutProperty('districts-border', 'visibility', visibility);
    setIsLayerVisible(!isLayerVisible);
  }, [isLayerVisible]);

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-[500px] rounded-2xl overflow-hidden"
      />

      {/* Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button
          onClick={toggleLayer}
          className={`
            p-2 rounded-lg backdrop-blur-sm transition-colors
            ${isLayerVisible ? 'bg-indigo-500/80 text-white' : 'bg-black/50 text-gray-300'}
          `}
          title="Přepnout heatmapu"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl p-3">
        <p className="text-xs text-gray-400 mb-2">Cena za m²</p>
        <div className="flex items-center gap-1">
          {PRICE_RANGES.map((range, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-8 h-3 rounded-sm" 
                style={{ backgroundColor: range.color }}
              />
              <span className="text-[10px] text-gray-400 mt-1">
                {index === 0 ? '<40k' : 
                 index === PRICE_RANGES.length - 1 ? '>90k' : 
                 `${range.min/1000}k`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected District Info */}
      {selectedDistrict && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-4 right-14 bg-black/80 backdrop-blur-sm rounded-xl p-4 min-w-[250px]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <h4 className="font-semibold text-white">{selectedDistrict.name}</h4>
            </div>
            <button
              onClick={() => setSelectedDistrict(null)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Průměrná cena</span>
              <span className="text-sm font-medium text-white">
                {selectedDistrict.avgPrice.toLocaleString('cs-CZ')} Kč/m²
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Rozsah</span>
              <span className="text-sm text-gray-300">
                {(selectedDistrict.minPrice/1000).toFixed(0)}k - {(selectedDistrict.maxPrice/1000).toFixed(0)}k Kč/m²
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Nabídek</span>
              <span className="text-sm text-gray-300">{selectedDistrict.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Trend (12M)</span>
              <span className={`text-sm font-medium ${
                selectedDistrict.trend > 0 ? 'text-green-400' : 
                selectedDistrict.trend < 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
                {selectedDistrict.trend > 0 ? '+' : ''}{selectedDistrict.trend}%
              </span>
            </div>
          </div>

          {/* Mini Price Bar */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${Math.min(100, (selectedDistrict.avgPrice / 120000) * 100)}%`,
                  backgroundColor: getPriceColor(selectedDistrict.avgPrice),
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Badge */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Jihomoravský kraj
        </p>
      </div>
    </div>
  );
}

export default PriceHeatmap;
