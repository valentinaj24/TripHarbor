import { useEffect, useMemo, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Compass, MapPin, Search, Users, X } from 'lucide-react'
import type { Trip } from '../services/api'

interface TripMapProps { trips: Trip[] }

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value))
}

function validCoordinates(trip: Trip): [number, number] | null {
  const longitude = Number(trip.destination.longitude)
  const latitude = Number(trip.destination.latitude)
  return Number.isFinite(longitude) && Number.isFinite(latitude) && longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90
    ? [longitude, latitude] : null
}

// Curated illustrative photographs. Replace these with actual trip cover URLs when available.
// If an image fails, the popup keeps a clean text-only layout.
const destinationPhotos: Record<string, string> = {
  barcelona: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=350&fit=crop&auto=format',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=350&fit=crop&auto=format',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=350&fit=crop&auto=format',
  amsterdam: 'https://images.unsplash.com/photo-1534351590666-13e3e5b50175?w=600&h=350&fit=crop&auto=format',
  prague: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&h=350&fit=crop&auto=format',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=350&fit=crop&auto=format',
  'new york': 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=350&fit=crop&auto=format',
  dubrovnik: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=350&fit=crop&auto=format',
  marrakech: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&h=350&fit=crop&auto=format',
  iceland: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&h=350&fit=crop&auto=format',
  dolomites: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=350&fit=crop&auto=format',
  bled: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=600&h=350&fit=crop&auto=format',
}

function photoFor(trip: Trip): string | undefined {
  const key = `${trip.destination.name} ${trip.destination.country} ${trip.title}`.toLowerCase()
  return Object.entries(destinationPhotos).find(([name]) => key.includes(name))?.[1]
}

maplibregl.setWorkerUrl(maplibreWorkerUrl)

export default function TripMap({ trips }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const popupsRef = useRef<maplibregl.Popup[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const visibleTrips = useMemo(() => {
    const search = query.trim().toLowerCase()
    return trips.filter(trip => `${trip.title} ${trip.destination.name} ${trip.destination.country}`.toLowerCase().includes(search))
  }, [trips, query])
  const selectedTrip = visibleTrips.find(trip => trip.id === selectedId) ?? visibleTrips[0] ?? null

  useEffect(() => {
    const container = mapContainer.current
    if (!container || mapRef.current) return
    const map = new maplibregl.Map({
      container,
      // Liberty is the map style previously working in TripHarbor.
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [15, 30],
      zoom: 1.5,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.on('load', () => map.resize())
    map.on('error', event => console.error('TripHarbor map error:', event.error))
    const observer = new ResizeObserver(() => map.resize())
    observer.observe(container)
    return () => {
      observer.disconnect()
      popupsRef.current.forEach(p => p.remove())
      markersRef.current.forEach(m => m.remove())
      popupsRef.current = []
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    popupsRef.current.forEach(p => p.remove())
    markersRef.current.forEach(m => m.remove())
    popupsRef.current = []
    markersRef.current = []
    const bounds = new maplibregl.LngLatBounds()

    for (const trip of visibleTrips) {
      const coords = validCoordinates(trip)
      if (!coords) continue

      const wrapper = document.createElement('div')
      const button = document.createElement('button')
      button.type = 'button'
      button.title = `${trip.title} — ${trip.destination.name}`
      button.setAttribute('aria-label', `Select ${trip.title}`)
      button.className = 'flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-[3px] border-white bg-teal-700 text-white shadow-lg transition-colors hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200'
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>'
      wrapper.appendChild(button)

      const content = document.createElement('div')
      content.style.width = '240px'
      content.style.maxWidth = '65vw'
      const photo = photoFor(trip)
      if (photo) {
        const img = document.createElement('img')
        img.src = photo
        img.alt = `Illustrative photo for ${trip.destination.name}`
        img.loading = 'lazy'
        img.style.cssText = 'display:block;width:100%;height:125px;object-fit:cover;border-radius:9px;margin-bottom:10px'
        img.onerror = () => img.remove()
        content.appendChild(img)
      }
      const title = document.createElement('div')
      title.style.cssText = 'font-size:14px;font-weight:700;color:#0f172a;line-height:1.4'
      title.textContent = trip.title
      const location = document.createElement('div')
      location.style.cssText = 'font-size:12px;color:#64748b;margin-top:5px'
      location.textContent = `${trip.destination.name}, ${trip.destination.country}`
      const footer = document.createElement('div')
      footer.style.cssText = 'font-size:12px;color:#0f766e;margin-top:9px;font-weight:600'
      footer.textContent = `${formatDate(trip.startDate)}  ·  ${trip.availableSpots} spots`
      content.append(title, location, footer)
      const popup = new maplibregl.Popup({ offset: 28, closeButton: false, closeOnClick: false, maxWidth: '280px' }).setDOMContent(content)
      popupsRef.current.push(popup)
      button.addEventListener('mouseenter', () => popup.setLngLat(coords).addTo(map))
      button.addEventListener('mouseleave', () => popup.remove())
      button.addEventListener('focus', () => popup.setLngLat(coords).addTo(map))
      button.addEventListener('blur', () => popup.remove())
      button.addEventListener('click', event => {
        event.preventDefault()
        event.stopPropagation()
        setSelectedId(trip.id)
        popup.remove()
      })
      const marker = new maplibregl.Marker({ element: wrapper, anchor: 'center' }).setLngLat(coords).addTo(map)
      markersRef.current.push(marker)
      bounds.extend(coords)
    }
    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 65, maxZoom: 8, duration: 650 })
    return () => {
      popupsRef.current.forEach(p => p.remove())
      markersRef.current.forEach(m => m.remove())
      popupsRef.current = []
      markersRef.current = []
    }
  }, [visibleTrips])

  function chooseTrip(trip: Trip) {
    setSelectedId(trip.id)
    const coords = validCoordinates(trip)
    if (coords) mapRef.current?.flyTo({ center: coords, zoom: 7, essential: true, duration: 900 })
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
        <div>
          <div className="flex items-center gap-2 text-teal-700">
            <Compass size={20} />
            <h3 className="text-xl font-extrabold text-slate-900">Explore Trips on the Map</h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">Choose a trip to explore its destination and details.</p>
        </div>
        <span className="rounded-full bg-teal-50 px-4 py-2 text-xs font-bold text-teal-700">
          {visibleTrips.length} {visibleTrips.length === 1 ? 'Trip' : 'Trips'}
        </span>
      </div>
      <div className="grid min-w-0 lg:grid-cols-[minmax(230px,0.85fr)_minmax(0,1.65fr)] xl:grid-cols-[minmax(230px,0.9fr)_minmax(0,1.7fr)_minmax(250px,0.95fr)]">
        <aside className="flex min-h-0 min-w-0 flex-col border-b border-slate-100 bg-white lg:h-[620px] lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-100 p-4">
            <h4 className="mb-3 text-sm font-bold text-slate-900">Destinations</h4>
            <div className="relative">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a trip or destination" aria-label="Search map destinations" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-9 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear map search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X size={16} /></button>}
            </div>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto p-3 lg:max-h-none lg:flex-1">
            {visibleTrips.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500">No matching destinations.</p>
            ) : visibleTrips.map(trip => {
              const active = selectedTrip?.id === trip.id
              return (
                <button key={trip.id} type="button" onClick={() => chooseTrip(trip)} aria-pressed={active} className={`w-full rounded-2xl border p-4 text-left transition ${active ? 'border-teal-300 bg-teal-50 shadow-sm' : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <span className={`mt-0.5 rounded-lg p-2 ${active ? 'bg-teal-700 text-white' : 'bg-slate-100 text-teal-700'}`}><MapPin size={16} /></span>
                      <div className="min-w-0"><p className="font-bold text-slate-900">{trip.destination.name}</p><p className="text-xs text-slate-500">{trip.destination.country}</p></div>
                    </div>
                    <ArrowRight size={16} className={active ? 'shrink-0 text-teal-700' : 'shrink-0 text-slate-300'} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-700">{trip.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500"><span>{formatDate(trip.startDate)}</span><span>·</span><span>{trip.availableSpots} spots</span></div>
                </button>
              )
            })}
          </div>
        </aside>
        <div className="relative h-[450px] min-w-0 overflow-hidden bg-slate-100 lg:h-[620px]">
          <div ref={mapContainer} className="absolute inset-0 h-full w-full" aria-label="Interactive map of trip destinations" />
          <div className="pointer-events-none absolute bottom-5 left-5 rounded-xl border border-white/80 bg-white/90 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
            <MapPin size={14} className="mr-1 inline text-teal-700" /> Click a marker to select a trip
          </div>
        </div>
        <aside className="min-w-0 border-t border-slate-100 bg-white p-5 lg:col-span-2 xl:col-span-1 xl:h-[620px] xl:overflow-y-auto xl:border-l xl:border-t-0">
          {selectedTrip ? (
            <>
              <span className="inline-flex rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">{selectedTrip.category}</span>
              <h4 className="mt-4 text-2xl font-extrabold leading-tight text-slate-900">{selectedTrip.title}</h4>
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MapPin size={17} className="shrink-0 text-teal-700" />{selectedTrip.destination.name}, {selectedTrip.destination.country}</p>
              <p className="mt-5 line-clamp-5 text-sm leading-7 text-slate-600">{selectedTrip.description}</p>
              <div className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start gap-3 text-sm text-slate-700"><CalendarDays size={18} className="mt-0.5 shrink-0 text-teal-700" /><span>{formatDate(selectedTrip.startDate)} – {formatDate(selectedTrip.endDate)}</span></div>
                <div className="flex items-center gap-3 text-sm text-slate-700"><Users size={18} className="shrink-0 text-teal-700" /><span>{selectedTrip.availableSpots} of {selectedTrip.maxParticipants} spots available</span></div>
                <div className="flex items-center gap-3 text-sm text-slate-700"><Compass size={18} className="shrink-0 text-teal-700" /><span>{selectedTrip.difficulty}</span></div>
              </div>
              <div className="mt-6 border-t border-slate-100 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Organized by</p><p className="mt-2 font-semibold text-slate-800">{selectedTrip.organizer.firstName} {selectedTrip.organizer.lastName}</p></div>
              <Link to={`/trips/${encodeURIComponent(selectedTrip.id)}`} className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-teal-800">View Trip Details <ArrowRight size={17} /></Link>
            </>
          ) : <div className="py-12 text-center text-sm text-slate-500">No trip selected. Try adjusting your search.</div>}
        </aside>
      </div>
    </section>
  )
}
