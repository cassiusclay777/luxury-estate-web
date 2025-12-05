'use client'

import { Download, Sparkles, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface ResultPreviewProps {
  originalImage: string
  generatedImage: string
  onDownload: () => void
}

export function ResultPreview({ originalImage, generatedImage, onDownload }: ResultPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success message */}
      <div className="p-4 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <div>
            <p className="text-white font-bold">Úspěšně vygenerováno!</p>
            <p className="text-sm text-white/70">Vaše virtuální návrhová fotka je připravena</p>
          </div>
        </div>
      </div>

      {/* Comparison view */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/50" />
            Původní fotka
          </h3>
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/10">
            <Image
              src={originalImage}
              alt="Původní pokoj"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Generated */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white/90 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            AI návrhové řešení
          </h3>
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20">
            <Image
              src={generatedImage}
              alt="Vygenerovaný pokoj"
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2">
              <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-center">
        <button
          onClick={onDownload}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 rounded-xl font-bold text-white transition-all duration-300 flex items-center gap-2 shadow-lg shadow-cyan-500/30"
        >
          <Download className="w-5 h-5" />
          Stáhnout výsledek
        </button>
      </div>

      {/* Info */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
        <p className="text-xs text-white/60 text-center">
          Vygenerovaný obrázek můžete použít pro prezentaci nemovitosti.
          AI může občas dělat nepřesnosti v detailech.
        </p>
      </div>
    </motion.div>
  )
}
