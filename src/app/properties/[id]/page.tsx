import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PropertyDetailClient from './PropertyDetailClient'

async function getProperty(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function PropertyDetail({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id)

  if (!property) {
    notFound()
  }

  return <PropertyDetailClient property={property} />
}
