'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface AddVisitModalProps {
  countryName: string
  countryCode: string
  onClose: () => void
}

export default function AddVisitModal({
  countryName,
  countryCode,
  onClose,
}: AddVisitModalProps) {
  const [city, setCity] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [visitedAt, setVisitedAt] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Insert the visit
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .insert({
          user_id: user.id,
          country_code: countryCode,
          country_name: countryName,
          city: city || null,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          visited_at: visitedAt,
          notes: notes || null,
        })
        .select()
        .single()

      if (visitError) throw visitError

      // Upload photos if any
      if (photos && photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const file = photos[i]
          const fileExt = file.name.split('.').pop()
          const filePath = `${user.id}/${visit.id}/${crypto.randomUUID()}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, file)

          if (uploadError) {
            console.error('Photo upload error:', uploadError)
            continue
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from('photos').getPublicUrl(filePath)

          await supabase.from('photos').insert({
            visit_id: visit.id,
            url: publicUrl,
            caption: null,
          })
        }
      }

      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save visit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Add visit to {countryName}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Country
            </label>
            <input
              type="text"
              value={countryName}
              disabled
              className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              City (optional)
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Tokyo"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Latitude (optional)
              </label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                placeholder="35.6762"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Longitude (optional)
              </label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                placeholder="139.6503"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Date visited
            </label>
            <input
              type="date"
              value={visitedAt}
              onChange={(e) => setVisitedAt(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              placeholder="What did you love about this place?"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Photos (optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPhotos(e.target.files)}
              className="w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 font-medium text-slate-300 transition hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition',
                loading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-500'
              )}
            >
              {loading ? 'Saving...' : 'Save visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
