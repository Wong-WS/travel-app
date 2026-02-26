'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Globe, Map, Rss, Trophy, User, LogOut, Menu, X } from 'lucide-react'
import clsx from 'clsx'
import type { UserProfile } from '@/types'

export default function Navbar() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) setProfile(data as UserProfile)
      }
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/map', label: 'Map', icon: Map },
    { href: '/feed', label: 'Feed', icon: Rss },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-bold text-white">Wandermark</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400 transition hover:bg-blue-500/30"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  (profile?.username?.charAt(0) || 'U').toUpperCase()
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-700 bg-slate-800 py-1 shadow-lg">
                  {profile && (
                    <Link
                      href={`/profile/${profile.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Sign in
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 sm:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 px-4 py-2 sm:hidden">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
