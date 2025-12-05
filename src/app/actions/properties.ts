'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from 'types/database.types'

type Property = Database['public']['Tables']['properties']['Row']
type SearchResult = Database['public']['Functions']['search_properties']['Returns'][0]
type NearbyResult = Database['public']['Functions']['nearby_properties']['Returns'][0]

export interface SearchFilters {
  query?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
  city?: string
}

export interface GeolocationFilters {
  lat: number
  lng: number
  radiusKm?: number
}

/**
 * Full-text search s fuzzy matching
 */
export async function searchProperties(filters: SearchFilters) {
  const supabase = await createServerSupabaseClient()

  try {
    let query = supabase.from('properties').select('*')

    // Full-text search pokud je zadaný query
    if (filters.query) {
      const { data, error } = await supabase.rpc('search_properties', {
        search_query: filters.query
      })

      if (error) throw error
      
      let results = data as SearchResult[]

      // Apply additional filters
      if (filters.minPrice) {
        results = results.filter(p => p.price >= filters.minPrice!)
      }
      if (filters.maxPrice) {
        results = results.filter(p => p.price <= filters.maxPrice!)
      }
      if (filters.bedrooms) {
        results = results.filter(p => p.bedrooms && p.bedrooms >= filters.bedrooms!)
      }
      if (filters.bathrooms) {
        results = results.filter(p => p.bathrooms && p.bathrooms >= filters.bathrooms!)
      }
      if (filters.propertyType) {
        results = results.filter(p => p.property_type === filters.propertyType)
      }
      if (filters.city) {
        results = results.filter(p => p.city.toLowerCase().includes(filters.city!.toLowerCase()))
      }

      return { properties: results, error: null }
    }

    // Bez query - použij normální filtrování
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice)
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }
    if (filters.bedrooms) {
      query = query.gte('bedrooms', filters.bedrooms)
    }
    if (filters.bathrooms) {
      query = query.gte('bathrooms', filters.bathrooms)
    }
    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType)
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(50)

    if (error) throw error

    return { properties: data, error: null }
  } catch (error) {
    console.error('Search error:', error)
    return { properties: [], error: 'Failed to search properties' }
  }
}

/**
 * Geolocation search - najdi nemovitosti v okolí
 */
export async function searchNearbyProperties(filters: GeolocationFilters) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase.rpc('nearby_properties', {
      user_lat: filters.lat,
      user_lng: filters.lng,
      radius_km: filters.radiusKm || 50
    })

    if (error) throw error

    return { properties: data as NearbyResult[], error: null }
  } catch (error) {
    console.error('Nearby search error:', error)
    return { properties: [], error: 'Failed to search nearby properties' }
  }
}

/**
 * Získej všechny nemovitosti (s filtrováním)
 */
export async function getAllProperties(limit: number = 50) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { properties: data, error: null }
  } catch (error) {
    console.error('Get all properties error:', error)
    return { properties: [], error: 'Failed to fetch properties' }
  }
}

/**
 * Získej detail nemovitosti
 */
export async function getPropertyById(id: string) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { property: data, error: null }
  } catch (error) {
    console.error('Get property error:', error)
    return { property: null, error: 'Property not found' }
  }
}

/**
 * Získej autocomplete suggestions pro search
 */
export async function getSearchSuggestions(query: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Hledej v městech
    const { data: cities } = await supabase
      .from('properties')
      .select('city')
      .ilike('city', `%${query}%`)
      .limit(5)

    // Hledej v typech nemovitostí
    const { data: types } = await supabase
      .from('properties')
      .select('property_type')
      .ilike('property_type', `%${query}%`)
      .limit(5)

    const suggestions = [
      ...new Set([
        ...(cities?.map(c => c.city) || []),
        ...(types?.map(t => t.property_type).filter(Boolean) || [])
      ])
    ].slice(0, 5)

    return { suggestions, error: null }
  } catch (error) {
    console.error('Get suggestions error:', error)
    return { suggestions: [], error: 'Failed to get suggestions' }
  }
}
