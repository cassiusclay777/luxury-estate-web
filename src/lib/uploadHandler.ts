/**
 * Upload Handler for Supabase Storage
 * Production-ready file upload utilities
 */

import { supabase } from './supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
}

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate uploaded image file
 */
export function validateImageFile(
  file: File,
  options: { maxSizeMB?: number; allowedTypes?: string[] } = {}
): { valid: boolean; error?: string } {
  const { 
    maxSizeMB = 10, 
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] 
  } = options;

  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Soubor je příliš velký. Maximum je ${maxSizeMB}MB.`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const formats = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
    return {
      valid: false,
      error: `Nepodporovaný formát. Povolené jsou: ${formats}.`,
    };
  }

  return { valid: true };
}

// =============================================================================
// UPLOAD FUNCTIONS
// =============================================================================

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File | Blob,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { 
    bucket = 'property-images', 
    folder = 'uploads',
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  } = options;

  // Validate if File (not Blob)
  if (file instanceof File) {
    const validation = validateImageFile(file, { maxSizeMB, allowedTypes });
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  }

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = file instanceof File 
    ? file.name.split('.').pop() || 'jpg'
    : 'jpg';
  const filename = `${folder}/${timestamp}-${random}.${ext}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Nahrávání selhalo: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return {
    url: urlData.publicUrl,
    path: filename,
    bucket,
  };
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const result = await uploadFile(file, options);
      results.push(result);
    } catch (error) {
      errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (errors.length > 0 && results.length === 0) {
    throw new Error(`Všechna nahrávání selhala: ${errors.join(', ')}`);
  }

  return results;
}

/**
 * Delete file from storage
 */
export async function deleteFile(
  path: string,
  bucket = 'property-images'
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Mazání selhalo: ${error.message}`);
  }
}

/**
 * Get signed URL for temporary access
 */
export async function getSignedUrl(
  path: string,
  bucket = 'property-images',
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Signed URL error: ${error.message}`);
  }

  return data.signedUrl;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get full URL from relative path
 */
export function getFullImageUrl(relativePath: string, baseUrl?: string): string {
  if (relativePath.startsWith('http')) {
    return relativePath;
  }

  // Check if it's a Supabase storage path
  if (relativePath.includes('supabase')) {
    return relativePath;
  }

  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${base}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
}

/**
 * Convert base64 to Blob
 */
export function base64ToBlob(base64: string, mimeType = 'image/jpeg'): Blob {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Compress image client-side before upload
 */
export async function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<Blob> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Save uploaded file to public/uploads directory
 * For AI staging demo purposes
 */
export async function saveUploadedFile(file: File): Promise<{ url: string }> {
  // For demo purposes, we'll create a mock URL
  // In production, you would save to a proper storage
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${timestamp}-${random}.${ext}`;
  
  // Return a mock URL - in a real implementation, you would save the file
  // to disk or cloud storage and return the actual URL
  return {
    url: `/uploads/${filename}`
  };
}
