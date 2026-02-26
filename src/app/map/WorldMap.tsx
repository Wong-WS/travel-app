'use client'

import { useState, useEffect, useRef, memo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Sphere,
  Graticule,
} from 'react-simple-maps'
import type { Visit } from '@/types'

// Natural Earth 110m GeoJSON — includes ISO_A2 on every feature
const GEO_URL =
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_admin_0_countries.geojson'

interface WorldMapProps {
  visits: Visit[]
  onCountryClick?: (countryName: string, countryCode: string) => void
  interactive?: boolean
}

function getCountryCode(geo: { properties: Record<string, string> }): string {
  if (geo.properties.ISO_A2 && geo.properties.ISO_A2 !== '-99') {
    return geo.properties.ISO_A2
  }
  return ''
}

function getCountryName(geo: { properties: Record<string, string> }): string {
  return geo.properties.NAME || geo.properties.name || geo.properties.ADMIN || 'Unknown'
}

function WorldMap({ visits, onCountryClick, interactive = true }: WorldMapProps) {
  const [rotation, setRotation] = useState<[number, number, number]>([-10, -20, 0])
  const [scale, setScale] = useState(200)
  const [tooltipContent, setTooltipContent] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const visitedCodes = new Set(visits.map((v) => v.country_code))
  const cityPins = visits.filter((v) => v.city && v.lat != null && v.lng != null)

  // Non-passive wheel listener so we can preventDefault and zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el || !interactive) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setScale((s) => Math.max(120, Math.min(700, s - e.deltaY * 0.3)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [interactive])

  function handleMouseDown(e: React.MouseEvent) {
    if (!interactive) return
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!interactive || !isDragging.current || !lastPos.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    setRotation(([lon, lat, roll]) => [
      lon + dx * 0.4,
      Math.max(-90, Math.min(90, lat - dy * 0.4)),
      roll,
    ])
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  function handleMouseUp() {
    isDragging.current = false
    lastPos.current = null
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full select-none${interactive ? ' cursor-grab active:cursor-grabbing' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {tooltipContent && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white shadow-lg">
          {tooltipContent}
        </div>
      )}
      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ rotate: rotation, scale }}
        className="h-full w-full"
        style={{ backgroundColor: '#0f172a' }}
      >
        <Sphere id="rsm-sphere" fill="#0c1a2e" stroke="#334155" strokeWidth={0.5} />
        <Graticule stroke="#1e293b" strokeWidth={0.4} />
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code = getCountryCode(geo)
              const name = getCountryName(geo)
              const isVisited = code ? visitedCodes.has(code) : false

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isVisited ? '#3B82F6' : '#1e293b'}
                  stroke="#334155"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: {
                      fill: isVisited ? '#60a5fa' : '#334155',
                      outline: 'none',
                      cursor: interactive ? 'pointer' : 'default',
                    },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={() => setTooltipContent(isVisited ? `${name} (visited)` : name)}
                  onMouseLeave={() => setTooltipContent('')}
                  onClick={() => {
                    if (interactive && onCountryClick) {
                      onCountryClick(name, code)
                    }
                  }}
                />
              )
            })
          }
        </Geographies>

        {cityPins.map((visit) => (
          <Marker key={visit.id} coordinates={[Number(visit.lng), Number(visit.lat)]}>
            <circle r={3} fill="#f59e0b" stroke="#fff" strokeWidth={0.5} />
            <text
              textAnchor="middle"
              y={-8}
              style={{ fontSize: '8px', fill: '#f59e0b', fontWeight: 600 }}
            >
              {visit.city}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  )
}

export default memo(WorldMap)
