import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Save uploaded file to public/uploads directory
 * Returns the public URL of the saved file
 */
export async function saveUploadedFile(
  file: File
): Promise<{ url: string; path: string }> {
  try {
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.name);
    const filename = `staging-${timestamp}-${random}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${filename}`;

    console.log('File saved:', publicUrl);

    return {
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save uploaded file');
  }
}

/**
 * Validate uploaded image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Soubor je příliš velký. Maximum je 10MB.',
    };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Nepodporovaný formát. Povolené jsou: JPG, PNG, WEBP.',
    };
  }

  return { valid: true };
}

/**
 * Get full URL from relative path
 * Used to convert /uploads/xyz.jpg to http://localhost:3000/uploads/xyz.jpg
 */
export function getFullImageUrl(relativePath: string, baseUrl?: string): string {
  if (relativePath.startsWith('http')) {
    return relativePath;
  }

  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${base}${relativePath}`;
}
