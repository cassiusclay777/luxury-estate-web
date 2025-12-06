export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          address: string
          city: string
          bedrooms: number | null
          bathrooms: number | null
          area: number | null
          images: string[]
          lat: number | null
          lng: number | null
          features: string[] | null
          type: string | null
          status: string | null
          published: boolean | null
          slug: string | null
          main_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          address: string
          city: string
          bedrooms?: number | null
          bathrooms?: number | null
          area?: number | null
          images?: string[]
          lat?: number | null
          lng?: number | null
          features?: string[] | null
          type?: string | null
          status?: string | null
          published?: boolean | null
          slug?: string | null
          main_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          address?: string
          city?: string
          bedrooms?: number | null
          bathrooms?: number | null
          area?: number | null
          images?: string[]
          lat?: number | null
          lng?: number | null
          features?: string[] | null
          type?: string | null
          status?: string | null
          published?: boolean | null
          slug?: string | null
          main_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_properties: {
        Args: {
          search_query: string
        }
        Returns: {
          id: string
          title: string
          description: string | null
          price: number
          address: string
          city: string
          bedrooms: number | null
          bathrooms: number | null
          area: number | null
          images: string[]
          lat: number | null
          lng: number | null
          features: string[] | null
          type: string | null
          status: string | null
          published: boolean | null
          slug: string | null
          main_image: string | null
          created_at: string
          updated_at: string
          rank: number
        }[]
      }
      nearby_properties: {
        Args: {
          user_lat: number
          user_lng: number
          radius_km?: number
        }
        Returns: {
          id: string
          title: string
          description: string | null
          price: number
          address: string
          city: string
          bedrooms: number | null
          bathrooms: number | null
          area: number | null
          images: string[]
          lat: number | null
          lng: number | null
          features: string[] | null
          type: string | null
          status: string | null
          published: boolean | null
          slug: string | null
          main_image: string | null
          created_at: string
          updated_at: string
          distance_km: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
