// /src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validation
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase credentials!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Check for placeholder values
const isPlaceholder = supabaseUrl.includes('placeholder');
if (isPlaceholder) {
  console.warn('⚠️ Using placeholder Supabase URL - database operations will fail');
}

// Create typed Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// =============================================================================
// TYPE EXPORTS (derived from database.types.ts)
// =============================================================================

export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

// Extended types for common use cases
export interface PropertyWithImages extends Property {
  staged_images?: StagedImage[];
}

export interface PropertyFilters {
  city?: string;
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  published?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Staged images type (if table exists)
export interface StagedImage {
  id: string;
  property_id: string;
  original_url: string;
  staged_url: string;
  style: string;
  room_type?: string;
  created_at: string;
}

// =============================================================================
// PROPERTY CRUD OPERATIONS
// =============================================================================

/**
 * Get all properties with optional filters and pagination
 */
export async function getProperties(
  filters?: PropertyFilters,
  page = 1,
  pageSize = 12
): Promise<PaginatedResult<Property>> {
  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters) {
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.minBedrooms !== undefined) {
      query = query.gte('bedrooms', filters.minBedrooms);
    }
    if (filters.minBathrooms !== undefined) {
      query = query.gte('bathrooms', filters.minBathrooms);
    }
    if (filters.minArea !== undefined) {
      query = query.gte('area', filters.minArea);
    }
    if (filters.maxArea !== undefined) {
      query = query.lte('area', filters.maxArea);
    }
    if (filters.published !== undefined) {
      query = query.eq('published', filters.published);
    }
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Get single property by ID or slug
 */
export async function getProperty(idOrSlug: string): Promise<Property | null> {
  // Try by ID first (UUID format)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq(isUUID ? 'id' : 'slug', idOrSlug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching property:', error);
    throw error;
  }

  return data;
}

/**
 * Create new property
 */
export async function createProperty(property: PropertyInsert): Promise<Property> {
  // Generate slug if not provided
  if (!property.slug) {
    property.slug = generateSlug(property.title, property.city);
  }

  const { data, error } = await supabase
    .from('properties')
    .insert(property)
    .select()
    .single();

  if (error) {
    console.error('Error creating property:', error);
    throw error;
  }

  return data;
}

/**
 * Update property
 */
export async function updateProperty(
  id: string,
  updates: PropertyUpdate
): Promise<Property> {
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating property:', error);
    throw error;
  }

  return data;
}

/**
 * Delete property
 */
export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
}

/**
 * Get properties for map display (minimal data)
 */
export async function getPropertiesForMap(filters?: PropertyFilters): Promise<
  Pick<Property, 'id' | 'title' | 'price' | 'lat' | 'lng' | 'slug' | 'main_image'>[]
> {
  let query = supabase
    .from('properties')
    .select('id, title, price, lat, lng, slug, main_image')
    .not('lat', 'is', null)
    .not('lng', 'is', null);

  if (filters?.published !== undefined) {
    query = query.eq('published', filters.published);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching map properties:', error);
    throw error;
  }

  return data || [];
}

/**
 * Search properties using full-text search
 */
export async function searchProperties(searchQuery: string): Promise<Property[]> {
  const { data, error } = await supabase.rpc('search_properties', {
    search_query: searchQuery,
  });

  if (error) {
    console.error('Error searching properties:', error);
    // Fallback to simple ILIKE search
    const { data: fallbackData } = await supabase
      .from('properties')
      .select('*')
      .or(`title.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
      .limit(20);

    return fallbackData || [];
  }

  return (data as unknown as Property[]) || [];
}

/**
 * Get nearby properties
 */
export async function getNearbyProperties(
  lat: number,
  lng: number,
  radiusKm = 10
): Promise<Property[]> {
  const { data, error } = await supabase.rpc('nearby_properties', {
    user_lat: lat,
    user_lng: lng,
    radius_km: radiusKm,
  });

  if (error) {
    console.error('Error fetching nearby properties:', error);
    return [];
  }

  return (data as unknown as Property[]) || [];
}

// =============================================================================
// STAGED IMAGES
// =============================================================================

/**
 * Save staged image to database
 */
export async function saveStagedImage(
  propertyId: string,
  originalUrl: string,
  stagedUrl: string,
  style: string,
  roomType?: string
): Promise<StagedImage | null> {
  // Check if staged_images table exists
  const { data, error } = await supabase
    .from('staged_images' as any)
    .insert({
      property_id: propertyId,
      original_url: originalUrl,
      staged_url: stagedUrl,
      style,
      room_type: roomType,
    })
    .select()
    .single();

  if (error) {
    // Table might not exist yet
    console.warn('Could not save staged image:', error.message);
    return null;
  }

  return data as unknown as StagedImage;
}

/**
 * Get staged images for property
 */
export async function getStagedImages(propertyId: string): Promise<StagedImage[]> {
  const { data, error } = await supabase
    .from('staged_images' as any)
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Could not fetch staged images:', error.message);
    return [];
  }

  return (data as unknown as StagedImage[]) || [];
}

// =============================================================================
// STORAGE HELPERS
// =============================================================================

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  file: File | Blob,
  bucket = 'property-images',
  folder = 'uploads'
): Promise<string | null> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const ext = file instanceof File ? file.name.split('.').pop() : 'jpg';
  const filename = `${folder}/${timestamp}-${random}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate URL-friendly slug
 */
export function generateSlug(title: string, city: string): string {
  const base = `${title}-${city}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${random}`;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder')
  );
}
