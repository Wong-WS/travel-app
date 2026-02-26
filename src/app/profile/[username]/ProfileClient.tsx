'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import WorldMap from '@/app/map/WorldMap'
import VisitCard from '@/components/VisitCard'
import type { UserProfile, Visit } from '@/types'
import { MapPin, Globe, UserPlus, UserMinus } from 'lucide-react'

interface ProfileClientProps {
  profile: UserProfile
  visits: Visit[]
  isFollowing: boolean
  isOwnProfile: boolean
  currentUserId: string | null
}

export default function ProfileClient({
  profile,
  visits,
  isFollowing: initialFollowing,
  isOwnProfile,
  currentUserId,
}: ProfileClientProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleFollow() {
    if (!currentUserId) {
      router.push('/login')
      return
    }
    setLoading(true)
    try {
      if (following) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.id)
      } else {
        await supabase.from('follows').insert({
          follower_id: currentUserId,
          following_id: profile.id,
        })
      }
      setFollowing(!following)
    } catch (err) {
      console.error('Follow error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-2xl font-bold text-blue-400">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            profile.username.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
          {profile.full_name && (
            <p className="text-slate-400">{profile.full_name}</p>
          )}
          {profile.bio && (
            <p className="mt-1 text-sm text-slate-400">{profile.bio}</p>
          )}
          <div className="mt-3 flex items-center justify-center gap-6 sm:justify-start">
            <div className="flex items-center gap-1.5 text-sm">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-white">
                {profile.country_count}
              </span>
              <span className="text-slate-400">countries</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-white">
                {profile.city_count}
              </span>
              <span className="text-slate-400">cities</span>
            </div>
          </div>
        </div>
        {!isOwnProfile && currentUserId && (
          <button
            onClick={toggleFollow}
            disabled={loading}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition ${
              following
                ? 'border border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {following ? (
              <>
                <UserMinus className="h-4 w-4" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Follow
              </>
            )}
          </button>
        )}
      </div>

      {/* Map */}
      <div className="mb-8 overflow-hidden rounded-xl border border-slate-800">
        <div className="h-[400px]">
          <WorldMap visits={visits} interactive={false} />
        </div>
      </div>

      {/* Recent Visits */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-white">Recent Visits</h2>
        {visits.length === 0 ? (
          <p className="text-slate-500">No visits yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visits.map((visit) => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
