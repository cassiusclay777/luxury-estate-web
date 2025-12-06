'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UploadImagesProps {
  onSuccess: () => void;
}

export function UploadImages({ onSuccess }: UploadImagesProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [propertyId, setPropertyId] = useState<string>('');
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, address')
        .order('title');

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      alert('Chyba při načítání nemovitostí');
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Filter only image files
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)
    );

    if (imageFiles.length !== files.length) {
      alert('Některé soubory nejsou obrázky. Podporované formáty: JPEG, PNG, WebP, GIF');
    }

    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `property-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Vyberte prosím alespoň jeden obrázek');
      return;
    }

    if (!propertyId) {
      alert('Vyberte prosím nemovitost');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const uploaded: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const url = await uploadToSupabase(file);
        uploaded.push(url);
        
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      // Update property with new images
      const { data: property } = await supabase
        .from('properties')
        .select('images')
        .eq('id', propertyId)
        .single();

      const currentImages = property?.images || [];
      const updatedImages = [...currentImages, ...uploaded];

      const { error: updateError } = await supabase
        .from('properties')
        .update({ 
          images: updatedImages,
          main_image: updatedImages[0] || null
        })
        .eq('id', propertyId);

      if (updateError) throw updateError;

      setUploadedUrls(uploaded);
      alert(`Úspěšně nahráno ${uploaded.length} obrázků`);
      setSelectedFiles([]);
      onSuccess();
      
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Chyba při nahrávání obrázků');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      {/* Property Selection */}
      <div>
        <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-2">
          Vyberte nemovitost *
        </label>
        <div className="flex space-x-4">
          <select
            id="property"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            onFocus={loadProperties}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="">-- Vyberte nemovitost --</option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.title} - {property.address}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadProperties}
            disabled={loadingProperties}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loadingProperties ? 'Načítání...' : 'Obnovit seznam'}
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Vybrat soubory
            </button>
            <p className="mt-2 text-sm text-gray-600">
              nebo přetáhněte obrázky sem
            </p>
          </div>
          
          <p className="text-xs text-gray-500">
            Podporované formáty: JPEG, PNG, WebP, GIF. Maximální velikost: 5MB na soubor.
          </p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Vybráno {selectedFiles.length} souborů
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">📄</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Odstranit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Nahrávání...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploaded URLs */}
      {uploadedUrls.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Nahrané URL adresy
          </h3>
          <div className="space-y-2">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-3 bg-green-50 rounded-md p-3">
                <div className="h-10 w-10 flex-shrink-0">
                  <img
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                </div>
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 text-sm bg-transparent border-none focus:ring-0"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(url)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Kopírovat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setSelectedFiles([]);
            setUploadedUrls([]);
          }}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Vyčistit
        </button>
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0 || !propertyId}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {uploading ? 'Nahrávání...' : 'Nahrát obrázky'}
        </button>
      </div>

      {/* Instructions */}
      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Jak nahrát obrázky</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Vyberte nemovitost, ke které chcete obrázky přidat</li>
                <li>Vyberte nebo přetáhněte obrázky (max. 5MB na soubor)</li>
                <li>Klikněte na "Nahrát obrázky"</li>
                <li>Obrázky budou automaticky přidány k vybrané nemovitosti</li>
                <li>První nahraný obrázek se stane hlavním obrázkem nemovitosti</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
