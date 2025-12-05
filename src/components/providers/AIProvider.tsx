'use client'

import { AIChat } from '@/components/ai/AIChat'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Property } from '@/lib/supabase'

export function AIProvider() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .limit(20)

        if (error) {
          console.error('Error fetching properties:', error)
          return
        }

        setProperties(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  if (loading) {
    return null
  }

  return <AIChat properties={properties} />
}
