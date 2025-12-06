/**
 * =============================================================================
 * AR VIEWER - Augmented Reality Property View
 * =============================================================================
 * Mobile AR experience using:
 * - <model-viewer> Web Component
 * - USDZ (iOS) / GLB (Android) formats
 * - Fallback 3D view for desktop
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Maximize2, X, RotateCcw, ZoomIn, Box, Download } from 'lucide-react';
import Script from 'next/script';

// =============================================================================
// TYPES
// =============================================================================

interface ARViewerProps {
  /** GLB model URL */
  glbUrl?: string;
  /** USDZ model URL (iOS) */
  usdzUrl?: string;
  /** Fallback image if no 3D model */
  posterUrl?: string;
  /** Property title for alt text */
  title?: string;
  /** Property ID for analytics */
  propertyId?: string;
  className?: string;
}

// Extend HTMLElement for model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          'ios-src'?: string;
          poster?: string;
          alt?: string;
          ar?: boolean;
          'ar-modes'?: string;
          'camera-controls'?: boolean;
          'touch-action'?: string;
          'auto-rotate'?: boolean;
          'shadow-intensity'?: string;
          exposure?: string;
          'environment-image'?: string;
          loading?: 'auto' | 'lazy' | 'eager';
        },
        HTMLElement
      >;
    }
  }
}

// =============================================================================
// PLACEHOLDER 3D MODEL (simple room)
// =============================================================================

// Base64 placeholder GLB (tiny cube)
const PLACEHOLDER_GLB = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

// =============================================================================
// COMPONENT
// =============================================================================

export function ARViewer({
  glbUrl,
  usdzUrl,
  posterUrl,
  title = 'Nemovitost',
  propertyId,
  className = '',
}: ARViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [arSupported, setArSupported] = useState(false);
  const modelRef = useRef<HTMLElement>(null);

  // Detect mobile and AR support
  useEffect(() => {
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Check WebXR support
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported?.('immersive-ar').then((supported: boolean) => {
        setArSupported(supported || checkMobile); // iOS doesn't report XR but supports QuickLook
      });
    } else {
      setArSupported(checkMobile); // Assume mobile devices support AR
    }
  }, []);

  const modelSrc = glbUrl || PLACEHOLDER_GLB;
  const iosSrc = usdzUrl;

  const handleARClick = () => {
    // Track AR view
    if (propertyId) {
      console.log(`[AR] Viewing property ${propertyId}`);
    }
  };

  return (
    <>
      {/* Load model-viewer script */}
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
        strategy="lazyOnload"
      />

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          inline-flex items-center gap-2 px-4 py-2
          bg-gradient-to-r from-purple-600 to-pink-600
          hover:from-purple-500 hover:to-pink-500
          text-white font-medium rounded-lg
          transition-all duration-200 hover:scale-105
          shadow-lg shadow-purple-500/25
          ${className}
        `}
      >
        <Box className="w-4 h-4" />
        <span>Zobrazit v AR</span>
        {isMobile && <Smartphone className="w-4 h-4 opacity-60" />}
      </button>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95"
            onClick={() => setIsOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Model Viewer */}
            <div 
              className="w-full h-full flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <model-viewer
                ref={modelRef as any}
                src={modelSrc}
                ios-src={iosSrc}
                poster={posterUrl}
                alt={`3D model: ${title}`}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                touch-action="pan-y"
                auto-rotate
                shadow-intensity="1"
                exposure="1"
                loading="eager"
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '1200px',
                  maxHeight: '800px',
                  backgroundColor: 'transparent',
                }}
                onLoad={() => setIsLoaded(true)}
              >
                {/* AR Button (auto-shown on supported devices) */}
                <button
                  slot="ar-button"
                  onClick={handleARClick}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Box className="w-5 h-5" />
                  Spustit AR
                </button>

                {/* Loading Progress */}
                <div slot="progress-bar" className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: isLoaded ? '100%' : '0%' }} />
                </div>

                {/* Poster */}
                {posterUrl && !isLoaded && (
                  <div slot="poster" className="absolute inset-0 flex items-center justify-center bg-bg-surface">
                    <img src={posterUrl} alt={title} className="max-w-full max-h-full object-contain opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                    </div>
                  </div>
                )}
              </model-viewer>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={() => {
                  const mv = modelRef.current as any;
                  if (mv?.resetTurntableRotation) mv.resetTurntableRotation();
                }}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title="Reset pohledu"
              >
                <RotateCcw className="w-5 h-5 text-white" />
              </button>
              <button
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title="Přiblížit"
              >
                <ZoomIn className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
              <h3 className="text-white font-semibold">{title}</h3>
              <p className="text-gray-400 text-sm">
                {arSupported 
                  ? 'Klikněte na "Spustit AR" pro zobrazení ve vašem prostoru'
                  : '3D prohlídka • Táhněte pro otočení'
                }
              </p>
            </div>

            {/* AR Instructions (mobile only) */}
            {isMobile && arSupported && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-24 left-4 right-4 bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 text-center"
              >
                <p className="text-purple-200 text-sm">
                  📱 Namiřte telefon na podlahu a klepněte pro umístění modelu
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// =============================================================================
// SIMPLE AR BADGE (for property cards)
// =============================================================================

export function ARBadge({ hasModel = false }: { hasModel?: boolean }) {
  if (!hasModel) return null;
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full">
      <Box className="w-3 h-3" />
      AR
    </span>
  );
}

export default ARViewer;
