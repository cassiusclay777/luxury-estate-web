// /src/components/property/PropertyCardWithLoading.tsx
'use client'
import { PropertyCard } from './PropertyCard'
import { PropertyCardSkeleton } from './PropertyCardSkeleton'
import type { Database } from 'types/database.types'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyCardWithLoadingProps {
  property?: Property
  isLoading?: boolean
}

export function PropertyCardWithLoading({ property, isLoading = false }: PropertyCardWithLoadingProps) {
  if (isLoading || !property) {
    return <PropertyCardSkeleton />
  }

  return <PropertyCard property={property} />
}
