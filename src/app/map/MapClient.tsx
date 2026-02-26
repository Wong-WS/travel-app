'use client'

import { useState } from 'react'
import WorldMap from './WorldMap'
import AddVisitModal from './AddVisitModal'
import VisitCard from '@/components/VisitCard'
import type { Visit } from '@/types'
import { Plus, MapPin } from 'lucide-react'

interface MapClientProps {
  visits: Visit[]
}

export default function MapClient({ visits }: MapClientProps) {
  const [selectedCountry, setSelectedCountry] = useState<{
    name: string
    code: string
  } | null>(null)

  const [sidebarOpen, setSidebarOpen] = useState(true)

  function handleCountryClick(name: string, code: string) {
    setSelectedCountry({ name, code })
  }

  const uniqueCountries = new Set(visits.map((v) => v.country_code)).size

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="flex w-80 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800 p-4">
            <div>
              <h2 className="text-lg font-bold text-white">My Visits</h2>
              <p className="text-sm text-slate-400">
                {uniqueCountries} countries &middot; {visits.length} visits
              </p>
            </div>
            <button
              onClick={() =>
                setSelectedCountry({ name: '', code: '' })
              }
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {visits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MapPin className="mb-3 h-10 w-10 text-slate-600" />
                <p className="text-sm text-slate-500">
                  No visits yet. Click a country on the map to add your first
                  visit!
                </p>
              </div>
            ) : (
              visits.map((visit) => (
                <VisitCard key={visit.id} visit={visit} compact />
              ))
            )}
          </div>
        </div>
      )}

      {/* Map area */}
      <div className="relative flex-1">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-3 top-3 z-10 rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-300 shadow transition hover:bg-slate-700"
        >
          {sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        </button>
        <WorldMap visits={visits} onCountryClick={handleCountryClick} />
      </div>

      {/* Add Visit Modal */}
      {selectedCountry && (
        <AddVisitModal
          countryName={selectedCountry.name || 'Unknown'}
          countryCode={selectedCountry.code || ''}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  )
}
