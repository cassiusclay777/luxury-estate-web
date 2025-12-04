import { supabase } from './supabase'
import type { Property } from './supabase'

export interface SearchFilters {
  query?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
  city?: string
}

export interface SearchResult {
  properties: Property[]
  total: number
}

/**
 * Smart fulltext search using Supabase PostgreSQL
 * Supports fuzzy matching and typo tolerance
 */
export async function searchProperties(filters: SearchFilters): Promise<SearchResult> {
  let query = supabase.from('properties').select('*', { count: 'exact' })

  // Fulltext search with trigram similarity
  if (filters.query && filters.query.length > 0) {
    const searchTerm = filters.query.trim()

    // Use the custom search function from SQL
    const { data, error, count } = await supabase
      .rpc('search_properties', { search_query: searchTerm })

    if (error) {
      console.error('Search error:', error)
      return { properties: [], total: 0 }
    }

    return {
      properties: (data as Property[]) || [],
      total: count || 0
    }
  }

  // Price filters
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice)
  }

  // Bedroom filter
  if (filters.bedrooms !== undefined) {
    query = query.eq('bedrooms', filters.bedrooms)
  }

  // Bathroom filter
  if (filters.bathrooms !== undefined) {
    query = query.gte('bathrooms', filters.bathrooms)
  }

  // Property type filter
  if (filters.propertyType) {
    query = query.ilike('property_type', `%${filters.propertyType}%`)
  }

  // City filter
  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  // Execute query
  const { data, error, count } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Filter error:', error)
    return { properties: [], total: 0 }
  }

  return {
    properties: (data as Property[]) || [],
    total: count || 0
  }
}

/**
 * Get properties by location proximity
 */
export async function searchNearby(
  lat: number,
  lng: number,
  radiusKm: number = 5,
  limit: number = 20
): Promise<Property[]> {
  // Using Haversine formula via PostgreSQL
  const { data, error } = await supabase.rpc('nearby_properties', {
    lat_input: lat,
    lng_input: lng,
    radius_km: radiusKm,
    limit_count: limit
  })

  if (error) {
    console.error('Nearby search error:', error)
    return []
  }

  return (data as Property[]) || []
}

/**
 * Get autocomplete suggestions
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return []

  const { data: cities } = await supabase
    .from('properties')
    .select('city')
    .ilike('city', `%${query}%`)
    .limit(5)

  const { data: types } = await supabase
    .from('properties')
    .select('property_type')
    .ilike('property_type', `%${query}%`)
    .limit(5)

  const suggestions: string[] = []

  if (cities) {
    cities.forEach(c => {
      if (c.city && !suggestions.includes(c.city)) {
        suggestions.push(c.city)
      }
    })
  }

  if (types) {
    types.forEach(t => {
      if (t.property_type && !suggestions.includes(t.property_type)) {
        suggestions.push(t.property_type)
      }
    })
  }

  return suggestions.slice(0, 8)
}
