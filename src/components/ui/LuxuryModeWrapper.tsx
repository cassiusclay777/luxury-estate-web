/**
 * =============================================================================
 * LUXURY MODE WRAPPER
 * =============================================================================
 * Automatic luxury styling for properties > 20M CZK:
 * - Golden accents (#d4af37)
 * - Darker background
 * - Premium feel
 *
 * @author LuxEstate Team 2025
 * @license MIT
 */

'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

// =============================================================================
// TYPES
// =============================================================================

interface LuxuryModeWrapperProps {
  price: number;
  children: ReactNode;
  className?: string;
  /** Threshold for luxury mode (default: 20M CZK) */
  luxuryThreshold?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_LUXURY_THRESHOLD = 20_000_000; // 20 million CZK

// =============================================================================
// COMPONENT
// =============================================================================

export function LuxuryModeWrapper({
  price,
  children,
  className = '',
  luxuryThreshold = DEFAULT_LUXURY_THRESHOLD,
}: LuxuryModeWrapperProps) {
  const isLuxury = price >= luxuryThreshold;

  if (!isLuxury) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`luxury-mode ${className}`}
      style={{
        '--luxury-accent': '#d4af37',
        '--luxury-bg': '#0a0a0a',
        '--luxury-surface': '#0d0d0d',
      } as React.CSSProperties}
    >
      {/* Golden corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-golden-500/20 to-transparent rotate-45 translate-x-16 -translate-y-16" />
      </div>

      {/* Content with luxury styling */}
      <div className="relative luxury-content">
        {children}
      </div>

      {/* Luxury badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-golden-600 to-golden-500 text-black font-semibold text-xs rounded-full shadow-lg">
          <span className="text-sm">✨</span>
          LUXURY
        </span>
      </div>

      {/* Global luxury styles */}
      <style jsx global>{`
        .luxury-mode {
          position: relative;
          background: linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 100%);
        }

        /* Golden accents for borders */
        .luxury-mode .border,
        .luxury-mode [class*="border-"] {
          border-color: rgba(212, 175, 55, 0.2) !important;
        }

        /* Golden accents for text highlights */
        .luxury-mode .text-indigo-500,
        .luxury-mode .text-indigo-400 {
          color: #d4af37 !important;
        }

        /* Golden accents for backgrounds */
        .luxury-mode .bg-indigo-500,
        .luxury-mode .bg-indigo-600 {
          background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%) !important;
        }

        /* Golden shadows */
        .luxury-mode .shadow-indigo-500,
        .luxury-mode [class*="shadow-indigo"] {
          box-shadow: 0 0 30px -5px rgba(212, 175, 55, 0.3) !important;
        }

        /* Darker surfaces */
        .luxury-mode .bg-bg-surface {
          background-color: #0d0d0d !important;
        }

        .luxury-mode .bg-white\\/5 {
          background-color: rgba(212, 175, 55, 0.05) !important;
        }

        .luxury-mode .bg-white\\/10 {
          background-color: rgba(212, 175, 55, 0.1) !important;
        }

        /* Premium typography - subtle serif for headings */
        .luxury-mode h1,
        .luxury-mode h2,
        .luxury-mode h3 {
          font-family: 'Georgia', 'Times New Roman', serif;
          letter-spacing: 0.01em;
        }

        /* Golden hover states */
        .luxury-mode button:hover,
        .luxury-mode a:hover {
          color: #d4af37 !important;
        }

        /* Animated golden shimmer effect */
        @keyframes luxury-shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .luxury-mode .luxury-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(212, 175, 55, 0.1) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: luxury-shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
}

/**
 * Luxury price badge component
 */
export function LuxuryPriceBadge({ price }: { price: number }) {
  const isLuxury = price >= DEFAULT_LUXURY_THRESHOLD;

  if (!isLuxury) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-golden-600 to-golden-500 text-black font-bold text-xs rounded-full">
      <span>✨</span>
      LUXURY ESTATE
    </span>
  );
}

/**
 * Check if price qualifies for luxury mode
 */
export function isLuxuryProperty(price: number, threshold = DEFAULT_LUXURY_THRESHOLD): boolean {
  return price >= threshold;
}

export default LuxuryModeWrapper;
