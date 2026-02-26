import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Visit } from '@/types'
import MapClient from './MapClient'

export default async function MapPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: visits, error } = await supabase
    .from('visits')
    .select('*')
    .eq('user_id', user.id)
    .order('visited_at', { ascending: false })

  if (error) {
    console.error('Error fetching visits:', error)
  }

  return <MapClient visits={(visits as Visit[]) || []} />
}
