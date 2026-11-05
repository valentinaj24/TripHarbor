
import { useEffect, useId, useRef, useState } from 'react'
import {
  CheckCircle2,
  Globe2,
  Loader2,
  MapPin,
  Search,
  X,
} from 'lucide-react'
import * as maplibregl from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  searchDestinations,
  type DestinationSuggestion,
} from '../services/api'

maplibregl.setWorkerUrl(maplibreWorkerUrl)

type Place = DestinationSuggestion & {
  state?: string | null
}

interface Props {
  value: DestinationSuggestion | null
  onChange: (value: DestinationSuggestion | null) => void
}

function DestinationMap({ place }: { place: Place }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY

        const map = new maplibregl.Map({
        container: containerRef.current,
        style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${encodeURIComponent(apiKey)}`,
        center: [place.longitude, place.latitude],
        zoom: 12,
        attributionControl: false,
        })

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right'
    )

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    )

    const marker = new maplibregl.Marker({ color: '#0f766e' })
      .setLngLat([place.longitude, place.latitude])
      .addTo(map)

    return () => {
      marker.remove()
      map.remove()
    }
  }, [place])

  return (
    <div
      ref={containerRef}
      className="h-64 w-full sm:h-72"
      aria-label={`Map showing ${place.name}, ${place.country}`}
    />
  )
}

export default function DestinationPicker({
  value,
  onChange,
}: Props) {
  const listId = useId()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)

  const requestId = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value || !focused || query.trim().length < 3) {
      setResults([])
      setLoading(false)
      setOpen(false)
      return
    }

    let cancelled = false
    const currentRequest = ++requestId.current

    setLoading(true)
    setError('')

    const timer = window.setTimeout(async () => {
      try {
        const response = await searchDestinations(query.trim())

        if (!cancelled && currentRequest === requestId.current) {
          setResults(response.data)
          setOpen(true)
          setActiveIndex(-1)
        }
      } catch (err) {
        if (!cancelled && currentRequest === requestId.current) {
          setResults([])
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to search destinations.'
          )
          setOpen(true)
        }
      } finally {
        if (!cancelled && currentRequest === requestId.current) {
          setLoading(false)
        }
      }
    }, 650)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query, value, focused])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        setFocused(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  function selectPlace(place: Place) {
    onChange(place)
    setQuery(place.displayName)
    setResults([])
    setOpen(false)
    setFocused(false)
    setError('')
    setActiveIndex(-1)
  }

  function clearSelection() {
    ++requestId.current
    onChange(null)
    setQuery('')
    setResults([])
    setOpen(false)
    setError('')
    setFocused(false)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (event.key === 'Escape') setOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      selectPlace(results[activeIndex])
    }

    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const showDropdown =
    open &&
    !value &&
    query.trim().length >= 3

  return (
    <div className="space-y-5">
      <div ref={containerRef} className="relative">
        <label
          htmlFor="trip-destination"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Search Destination *
        </label>

        <div className="relative">
          <Search
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="trip-destination"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls={listId}
            aria-activedescendant={
              showDropdown && activeIndex >= 0
                ? `${listId}-${activeIndex}`
                : undefined
            }
            autoComplete="off"
            value={query}
            onChange={(event) => {
              ++requestId.current
              setQuery(event.target.value)
              onChange(null)
              setResults([])
              setActiveIndex(-1)
              setOpen(false)
            }}
            onFocus={() => {
              setFocused(true)
              if (results.length > 0) setOpen(true)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search cities worldwide..."
            className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
          />

          {loading ? (
            <Loader2
              size={19}
              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-teal-600"
            />
          ) : query ? (
            <button
              type="button"
              onClick={clearSelection}
              aria-label="Clear destination"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={17} />
            </button>
          ) : null}
        </div>

        {showDropdown && (
          <div
            id={listId}
            role="listbox"
            aria-label="Destination suggestions"
            className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
          >
            {results.length > 0 ? (
              <>
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Suggested destinations
                </div>

                {results.map((place, index) => (
                  <button
                    key={`${place.externalPlaceId}-${index}`}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={activeIndex === index}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectPlace(place)}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                      activeIndex === index
                        ? 'bg-teal-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <MapPin size={19} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-slate-900">
                        {place.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {place.state
                          ? `${place.state}, ${place.country}`
                          : place.country}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-400">
                        {place.displayName}
                      </span>
                    </span>
                  </button>
                ))}
              </>
            ) : !loading ? (
              <p className="px-4 py-5 text-sm text-slate-500">
                {error || 'No matching destinations. Try another name.'}
              </p>
            ) : null}

            <div className="border-t border-slate-100 px-3 py-2 text-right text-xs text-slate-400">
              Search powered by Geoapify
            </div>
          </div>
        )}

        {error && !showDropdown && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {!value && query.length < 3 && (
          <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <Globe2 size={14} />
            Enter at least 3 characters to search worldwide.
          </p>
        )}
      </div>

      {value && (
        <div className="overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-3 bg-teal-50 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700">
                <MapPin size={22} />
              </span>

              <div>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal-700">
                  <CheckCircle2 size={14} />
                  Destination confirmed
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {value.name}, {value.country}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {value.displayName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="shrink-0 rounded-lg border border-teal-200 bg-white px-3 py-2 text-xs font-bold text-teal-800 transition hover:bg-teal-100"
            >
              Change
            </button>
          </div>

          <DestinationMap place={value} />

          <div className="flex items-center justify-between gap-2 px-5 py-3 text-xs text-slate-500">
            <span>Interactive destination preview</span>
            <span className="font-medium text-teal-700">
              Location selected
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
