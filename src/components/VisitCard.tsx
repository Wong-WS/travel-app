'use client'

import { useState } from 'react'
import type { Visit } from '@/types'
import { Globe, MapPin, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

// Simple country code to flag emoji mapping
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return ''
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

interface VisitCardProps {
  visit: Visit
  compact?: boolean
}

export default function VisitCard({ visit, compact = false }: VisitCardProps) {
  const [expanded, setExpanded] = useState(false)
  const flag = countryFlag(visit.country_code)

  if (compact) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-800/30 p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {visit.country_name}
              {visit.city && (
                <span className="text-slate-400"> &middot; {visit.city}</span>
              )}
            </p>
            <p className="text-xs text-slate-500">
              {new Date(visit.visited_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
              })}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{flag}</span>
          <div>
            <h3 className="font-semibold text-white">{visit.country_name}</h3>
            {visit.city && (
              <div className="mt-0.5 flex items-center gap-1 text-sm text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-amber-500" />
                {visit.city}
              </div>
            )}
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              {new Date(visit.visited_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
        {(visit.notes || (visit.photos && visit.photos.length > 0)) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-700 hover:text-white"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 border-t border-slate-800 pt-3">
          {visit.notes && (
            <p className="text-sm text-slate-400">{visit.notes}</p>
          )}
          {visit.photos && visit.photos.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {visit.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.caption || 'Travel photo'}
                  className="h-24 w-24 shrink-0 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
