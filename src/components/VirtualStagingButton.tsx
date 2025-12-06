/**
 * =============================================================================
 * VIRTUAL STAGING BUTTON + MODAL
 * =============================================================================
 * AI-powered room staging with 5 styles
 * Uses Replicate SDXL-LCM for < 6 second generation
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, 
  X, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Sparkles
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface StagingStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface StagedResult {
  original: string;
  staged: string;
  style: string;
}

interface VirtualStagingButtonProps {
  imageUrl: string;
  propertyId?: string;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STYLES: StagingStyle[] = [
  { id: 'modern', name: 'Moderní', description: 'Čisté linie, minimalistický design', icon: '🏢' },
  { id: 'scandinavian', name: 'Skandinávský', description: 'Světlé dřevo, útulná atmosféra', icon: '🌲' },
  { id: 'industrial', name: 'Industriální', description: 'Cihly, kov, loftový styl', icon: '🏭' },
  { id: 'bohemian', name: 'Bohémský', description: 'Barevné textilie, eklektický mix', icon: '🎨' },
  { id: 'luxury', name: 'Luxusní', description: 'Mramor, zlato, prémiové materiály', icon: '✨' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function VirtualStagingButton({ 
  imageUrl, 
  propertyId,
  className = '' 
}: VirtualStagingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<StagedResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate staged image via API
   */
  const handleGenerate = useCallback(async (styleId: string) => {
    setIsGenerating(true);
    setError(null);
    setSelectedStyle(styleId);

    try {
      const response = await fetch('/api/ai-staging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          style: styleId,
          propertyId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      // Add to results
      const newResult: StagedResult = {
        original: imageUrl,
        staged: data.imageUrl,
        style: styleId,
      };

      setResults(prev => [...prev, newResult]);
      setCurrentIndex(results.length); // Show newest

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Něco se pokazilo');
    } finally {
      setIsGenerating(false);
    }
  }, [imageUrl, propertyId, results.length]);

  /**
   * Navigate carousel
   */
  const handlePrev = () => setCurrentIndex(i => Math.max(0, i - 1));
  const handleNext = () => setCurrentIndex(i => Math.min(results.length - 1, i + 1));

  /**
   * Download current image
   */
  const handleDownload = async () => {
    if (!results[currentIndex]) return;
    
    const response = await fetch(results[currentIndex].staged);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `staged-${results[currentIndex].style}-${Date.now()}.jpg`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          inline-flex items-center gap-2 px-4 py-2 
          bg-gradient-to-r from-indigo-600 to-purple-600 
          hover:from-indigo-500 hover:to-purple-500
          text-white font-medium rounded-lg
          transition-all duration-200 hover:scale-105
          shadow-lg shadow-indigo-500/25
          ${className}
        `}
      >
        <Wand2 className="w-4 h-4" />
        <span>Zařídit tento pokoj</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-bg-surface rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">AI Virtual Staging</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Style Selection */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Vyberte styl</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => handleGenerate(style.id)}
                        disabled={isGenerating}
                        className={`
                          p-3 rounded-xl border transition-all duration-200
                          ${selectedStyle === style.id && isGenerating
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <div className="text-2xl mb-1">{style.icon}</div>
                        <div className="text-sm font-medium text-white">{style.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{style.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loading State */}
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <p className="text-white font-medium">Generuji {STYLES.find(s => s.id === selectedStyle)?.name.toLowerCase()} design...</p>
                    <p className="text-gray-400 text-sm mt-1">Obvykle trvá méně než 6 sekund</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                {/* Results Carousel */}
                {results.length > 0 && !isGenerating && (
                  <div className="relative">
                    {/* Images Comparison */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Originál</p>
                        <img
                          src={results[currentIndex].original}
                          alt="Original"
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                          {STYLES.find(s => s.id === results[currentIndex].style)?.name}
                        </p>
                        <img
                          src={results[currentIndex].staged}
                          alt="Staged"
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Navigation */}
                    {results.length > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <button
                          onClick={handlePrev}
                          disabled={currentIndex === 0}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-sm text-gray-400">
                          {currentIndex + 1} / {results.length}
                        </span>
                        <button
                          onClick={handleNext}
                          disabled={currentIndex === results.length - 1}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    )}

                    {/* Download Button */}
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Stáhnout obrázek
                      </button>
                    </div>
                  </div>
                )}

                {/* Initial State - Show Original */}
                {results.length === 0 && !isGenerating && (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Original room"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <p className="text-white text-lg">Vyberte styl výše pro začátek</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default VirtualStagingButton;
