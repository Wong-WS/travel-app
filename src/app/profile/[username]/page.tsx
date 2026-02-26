import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { UserProfile, Visit } from '@/types'
import ProfileClient from './ProfileClient'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Fetch visits
  const { data: visits } = await supabase
    .from('visits')
    .select('*')
    .eq('user_id', profile.id)
    .order('visited_at', { ascending: false })

  // Fetch current user to check follow status
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isFollowing = false
  let isOwnProfile = false
  if (user) {
    isOwnProfile = user.id === profile.id
    if (!isOwnProfile) {
      const { data: follow } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .single()
      isFollowing = !!follow
    }
  }

  return (
    <ProfileClient
      profile={profile as UserProfile}
      visits={(visits as Visit[]) || []}
      isFollowing={isFollowing}
      isOwnProfile={isOwnProfile}
      currentUserId={user?.id || null}
    />
  )
}
