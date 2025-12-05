'use client'

import { useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void
  currentImage?: string
}

export function ImageUpload({ onImageSelect, currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(undefined)
    setUploading(true)

    try {
      // Upload file to API
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ai-staging/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Chyba při nahrávání')
      }

      onImageSelect(data.url)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Chyba při nahrávání souboru')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    onImageSelect('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/90">
        Nahrajte fotku prázdného pokoje
      </label>

      {!currentImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-cyan-500/50 hover:bg-white/5 transition-all cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              {uploading ? (
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-white/60 group-hover:text-cyan-400 transition-colors" />
              )}
            </div>

            <div>
              <p className="text-white/80 font-medium mb-1">
                {uploading ? 'Nahrávám...' : 'Klikněte pro nahrání fotky'}
              </p>
              <p className="text-sm text-white/50">
                JPG, PNG nebo WEBP (max 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-cyan-500/30">
            <Image
              src={currentImage}
              alt="Nahraný obrázek"
              fill
              className="object-cover"
            />
          </div>

          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-white/90">Obrázek nahrán</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}
    </div>
  )
}
