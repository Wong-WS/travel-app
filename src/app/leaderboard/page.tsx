import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Globe, MapPin } from 'lucide-react'
import type { UserProfile } from '@/types'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('country_count', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching leaderboard:', error)
  }

  const leaders = (profiles as UserProfile[]) || []

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-500" />
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <p className="mt-1 text-slate-400">
          Top travelers ranked by countries visited
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                Traveler
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                <span className="flex items-center justify-end gap-1">
                  <Globe className="h-3.5 w-3.5" /> Countries
                </span>
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                <span className="flex items-center justify-end gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Cities
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {leaders.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  No travelers yet. Be the first!
                </td>
              </tr>
            ) : (
              leaders.map((profile, index) => (
                <tr
                  key={profile.id}
                  className="border-b border-slate-800/50 transition hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold ${
                        index === 0
                          ? 'text-amber-400'
                          : index === 1
                            ? 'text-slate-300'
                            : index === 2
                              ? 'text-amber-600'
                              : 'text-slate-500'
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/profile/${profile.username}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.username}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          profile.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-white group-hover:text-blue-400 transition">
                          {profile.username}
                        </span>
                        {profile.full_name && (
                          <p className="text-xs text-slate-500">
                            {profile.full_name}
                          </p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-400">
                    {profile.country_count}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    {profile.city_count}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
