/**
 * Get the image URL for a property
 * Prefers local images in public/images/properties/ over external URLs
 */
export function getPropertyImageUrl(
  propertyId: string,
  imageUrl: string | null | undefined,
  index: number = 0
): string {
  // Default fallback image
  const fallbackImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'

  // If no image URL provided, try local image first
  if (!imageUrl) {
    return `/images/properties/${propertyId}_${index === 0 ? 'main' : index - 1}.jpg`
  }

  // If image URL is already local, return it
  if (imageUrl.startsWith('/')) {
    return imageUrl
  }

  // Check if it's a Supabase storage URL - use it directly
  if (imageUrl.includes('supabase')) {
    return imageUrl
  }

  // For external URLs (like Sreality), prefer local cached version
  // The download script saves images as: {propertyId}_main.jpg or {propertyId}_0.jpg, etc.
  return `/images/properties/${propertyId}_${index === 0 ? 'main' : index - 1}.jpg`
}

/**
 * Get all image URLs for a property
 */
export function getPropertyImages(
  propertyId: string,
  images: (string | null)[] | null,
  mainImage: string | null
): string[] {
  const result: string[] = []

  // Add main image first
  if (mainImage) {
    result.push(getPropertyImageUrl(propertyId, mainImage, 0))
  }

  // Add other images
  if (images && Array.isArray(images)) {
    images.forEach((img, index) => {
      if (img) {
        result.push(getPropertyImageUrl(propertyId, img, index + 1))
      }
    })
  }

  // If no images at all, return fallback
  if (result.length === 0) {
    result.push('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800')
  }

  return result
}
