import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Globe, MapPin, Calendar } from 'lucide-react'

export default async function FeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get IDs of users the current user follows
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = following?.map((f) => f.following_id) || []

  // Fetch recent visits from followed users
  let feedVisits: Array<{
    id: string
    country_code: string
    country_name: string
    city: string | null
    visited_at: string
    notes: string | null
    created_at: string
    profiles: {
      username: string
      full_name: string | null
      avatar_url: string | null
    }
  }> = []

  if (followingIds.length > 0) {
    const { data } = await supabase
      .from('visits')
      .select(
        '*, profiles!visits_user_id_fkey(username, full_name, avatar_url)'
      )
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(30)

    feedVisits = (data as typeof feedVisits) || []
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Feed</h1>

      {followingIds.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-8 text-center">
          <Globe className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          <p className="text-slate-400">
            You&apos;re not following anyone yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Check out the{' '}
            <Link href="/leaderboard" className="text-blue-500 hover:text-blue-400">
              leaderboard
            </Link>{' '}
            to find travelers to follow.
          </p>
        </div>
      ) : feedVisits.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-8 text-center">
          <p className="text-slate-400">
            No recent activity from people you follow.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedVisits.map((item) => {
            const profile = item.profiles
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-800/30 p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Link href={`/profile/${profile.username}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        profile.username.charAt(0).toUpperCase()
                      )}
                    </div>
                  </Link>
                  <div>
                    <Link
                      href={`/profile/${profile.username}`}
                      className="font-medium text-white hover:text-blue-400 transition"
                    >
                      {profile.username}
                    </Link>
                    <p className="text-xs text-slate-500">
                      visited a new place
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900/50 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-white">
                      {item.country_name}
                    </span>
                    {item.city && (
                      <>
                        <span className="text-slate-600">&middot;</span>
                        <MapPin className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-slate-300">{item.city}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.visited_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  {item.notes && (
                    <p className="mt-2 text-sm text-slate-400">
                      {item.notes.length > 200
                        ? item.notes.slice(0, 200) + '...'
                        : item.notes}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
