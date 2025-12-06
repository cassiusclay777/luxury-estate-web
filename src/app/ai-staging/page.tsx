'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Wand2, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { InteriorStyle } from '@/lib/types/ai-staging'
import { ImageUpload } from './components/ImageUpload'
import { StyleSelector } from './components/StyleSelector'
import { ResultPreview } from './components/ResultPreview'
import { SampleRooms } from './components/SampleRooms'

function AIStagingContent() {
  const searchParams = useSearchParams()
  const [imageUrl, setImageUrl] = useState<string>('')
  const [style, setStyle] = useState<InteriorStyle>('modern')
  const [prompt, setPrompt] = useState<string>('')
  const [generatedImage, setGeneratedImage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  // Handle propertyId from URL params (for future property image integration)
  useEffect(() => {
    const propertyId = searchParams.get('propertyId')
    if (propertyId) {
      // TODO: Fetch property images and pre-populate
      console.log('Property ID:', propertyId)
    }
  }, [searchParams])

  const handleSelectSample = (sampleUrl: string) => {
    setImageUrl(sampleUrl)
    setGeneratedImage('')
    setError(undefined)
  }

  const handleGenerate = async () => {
    if (!imageUrl) {
      setError('Prosím nahrajte fotku pokoje')
      return
    }

    setError(undefined)
    setLoading(true)
    setGeneratedImage('')

    try {
      const response = await fetch('/api/ai-staging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          style,
          prompt: prompt || undefined,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Chyba při generování')
      }

      setGeneratedImage(data.imageUrl)
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Neočekávaná chyba při generování')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-staging-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      alert('Chyba při stahování obrázku')
    }
  }

  const handleReset = () => {
    setImageUrl('')
    setGeneratedImage('')
    setPrompt('')
    setStyle('modern')
    setError(undefined)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy to-navy/90">
      {/* Header */}
      <div className="border-b border-white/10 bg-navy/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Zpět na hlavní stránku</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Virtual Staging</h1>
                <p className="text-sm text-white/60">Navrhněte vybavení bytu pomocí AI</p>
              </div>
            </div>

            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Hero section */}
          {!generatedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white/90 font-medium">Powered by AI</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Navrhnout vybavení bytu
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Nahrajte fotku prázdného pokoje a AI vám vygeneruje profesionální návrh
                vybavení v požadovaném stylu
              </p>
            </motion.div>
          )}

          {!generatedImage ? (
            /* Input form */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl"
            >
              <div className="space-y-8">
                {/* Image upload */}
                <ImageUpload
                  currentImage={imageUrl}
                  onImageSelect={setImageUrl}
                />

                {/* Sample rooms - only show if no image uploaded */}
                {!imageUrl && (
                  <SampleRooms onSelectSample={handleSelectSample} />
                )}

                {/* Style selector */}
                <StyleSelector
                  selectedStyle={style}
                  onStyleChange={setStyle}
                />

                {/* Custom prompt */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/90">
                    Vlastní požadavky (volitelné)
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Např.: pracovna pro dva, hodně úložného prostoru, tmavé dřevo..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-white/50">
                    Popište konkrétní požadavky na vybavení nebo atmosféru pokoje
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-200">Chyba</p>
                      <p className="text-sm text-red-200/80">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Generate button */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!imageUrl || loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/30"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generuji návrh...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>Vygenerovat návrh vybavení</span>
                    </>
                  )}
                </button>

                {/* Info */}
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <p className="text-sm text-cyan-200/80 text-center">
                    Generování trvá přibližně 30-60 sekund. AI vytvoří fotorealistický
                    návrh vybavení pokoje ve vybraném stylu.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Result preview */
            <div className="space-y-6">
              <ResultPreview
                originalImage={imageUrl}
                generatedImage={generatedImage}
                onDownload={handleDownload}
              />

              {/* New staging button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-white transition-all"
                >
                  Vytvořit další návrh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-3">Jak to funguje?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-white">
                  1
                </div>
                <h4 className="font-bold text-white/90">Nahrajte fotku</h4>
                <p className="text-sm text-white/60">
                  Vyberte fotku prázdného pokoje z vaší nemovitosti
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-white">
                  2
                </div>
                <h4 className="font-bold text-white/90">Vyberte styl</h4>
                <p className="text-sm text-white/60">
                  Zvolte styl vybavení a případně upřesněte požadavky
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-white">
                  3
                </div>
                <h4 className="font-bold text-white/90">Stáhněte výsledek</h4>
                <p className="text-sm text-white/60">
                  AI vygeneruje profesionální návrh, který můžete stáhnout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AIStagingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-navy to-navy/90 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Načítám...</p>
        </div>
      </div>
    }>
      <AIStagingContent />
    </Suspense>
  )
}
