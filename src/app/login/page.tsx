'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Globe } from 'lucide-react'
import clsx from 'clsx'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
      router.push('/map')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/map`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-800/50 p-8">
        <div className="mb-6 flex flex-col items-center">
          <Globe className="mb-2 h-10 w-10 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isSignUp
              ? 'Start tracking your travels today'
              : 'Sign in to continue your journey'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isSignUp}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="wanderer42"
              />
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Min 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              'w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition',
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
            )}
          >
            {loading
              ? 'Loading...'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs text-slate-500">OR</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 py-2.5 font-medium text-white transition hover:bg-slate-800"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="font-medium text-blue-500 hover:text-blue-400"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
