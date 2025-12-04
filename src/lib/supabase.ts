// /src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Missing Supabase credentials!')
  console.error('Please create .env.local file with:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
)

export type Property = {
  id: string
  title: string
  description: string | null
  price: number
  address: string
  city: string
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  images: string[]
  lat: number | null
  lng: number | null
  features: string[] | null
  property_type: string | null
  created_at: string
}