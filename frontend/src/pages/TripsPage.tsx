
import { useEffect, useState } from 'react'
import {
  Search,
  MapPin,
  CalendarDays,
  Users,
  ArrowRight,
  SlidersHorizontal,
  Compass,
  Mountain,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserRound,
  LayoutGrid,
  Map as MapIcon,
} from 'lucide-react'
import {
  getTrips,
  type Trip,
  type TripFilters,
} from '../services/api'
import { Link } from 'react-router-dom'
import TripMap from '../components/TripMap'

const categories = [
  'City Break',
  'Culture',
  'Nature',
  'Hiking',
]

const difficulties = ['Easy', 'Moderate', 'Hard']

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function TripCard({ trip }: { trip: Trip }) {
  const spots = trip.availableSpots
  const full = spots === 0

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-48 flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-6 text-white">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full border border-white/15" />
        <div className="absolute -bottom-16 right-12 h-40 w-40 rounded-full border border-white/10" />

        <div className="relative flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
            {trip.category}
          </span>

          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-teal-800">
            {trip.difficulty}
          </span>
        </div>

        <div className="relative">
          <MapPin size={22} className="mb-2 text-teal-200" />
          <p className="text-2xl font-extrabold tracking-tight">
            {trip.destination.name}
          </p>
          <p className="mt-1 text-sm text-teal-100">
            {trip.destination.country}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-slate-900 transition group-hover:text-teal-700">
          {trip.title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
          {trip.description}
        </p>

        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
          <div className="flex items-start gap-3 text-sm text-slate-600">
            <CalendarDays
              size={18}
              className="mt-0.5 shrink-0 text-teal-700"
            />
            <span>
              {formatDate(trip.startDate)} –{' '}
              {formatDate(trip.endDate)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Users size={18} className="text-teal-700" />
            <span>
              {full
                ? 'Fully booked'
                : `${spots} spots available`}
              <span className="text-slate-400">
                {' '}/ {trip.maxParticipants} total
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <UserRound size={18} className="text-teal-700" />
            <span>
              Organized by {trip.organizer.firstName}{' '}
              {trip.organizer.lastName}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                full
                  ? 'bg-red-50 text-red-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {full ? 'No spots left' : 'Spots available'}
            </span>

            <Link
                to={`/trips/${trip.id}`}
                className="flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-900"
                >
                View Details
                <ArrowRight size={16} />
                </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function TripsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sort, setSort] = useState<
    'date_asc' | 'date_desc' | 'title_asc'
  >('date_asc')
  const [page, setPage] = useState(1)

  const [trips, setTrips] = useState<Trip[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>(() => {
  const saved = localStorage.getItem('tripharbor-view-mode')

    return saved === 'grid' || saved === 'map'
        ? saved
        : 'map'
    })
    useEffect(() => {
    localStorage.setItem('tripharbor-view-mode', viewMode)
    }, [viewMode])
  const [mapTrips, setMapTrips] = useState<Trip[]>([])
  const [mapLoading, setMapLoading] = useState(false)
  const [mapError, setMapError] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let active = true

    async function loadTrips() {
      setLoading(true)
      setError('')

      const filters: TripFilters = {
        search: debouncedSearch,
        category,
        difficulty,
        startDate,
        endDate,
        sort,
        page,
        limit: 9,
      }

      try {
        const response = await getTrips(filters)

        if (!active) return

        setTrips(response.data)
        setTotal(response.pagination.total)
        setTotalPages(response.pagination.totalPages)
      } catch (err) {
        if (!active) return

        setTrips([])
        setTotal(0)
        setTotalPages(0)
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load trips.'
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadTrips()

    return () => {
      active = false
    }
  }, [
    debouncedSearch,
    category,
    difficulty,
    startDate,
    endDate,
    sort,
    page,
    reloadKey,
  ])

  useEffect(() => {
    if (viewMode !== 'map') return

    let active = true

    async function loadMapTrips() {
      setMapLoading(true)
      setMapError('')

      const filters: TripFilters = {
        search: debouncedSearch,
        category,
        difficulty,
        startDate,
        endDate,
        sort,
        limit: 20,
      }

      try {
        const first = await getTrips({ ...filters, page: 1 })
        const allTrips = [...first.data]

        for (let current = 2; current <= first.pagination.totalPages; current++) {
          const result = await getTrips({ ...filters, page: current })
          if (!active) return
          allTrips.push(...result.data)
        }

        if (active) setMapTrips(allTrips)
      } catch (err) {
        if (!active) return
        setMapTrips([])
        setMapError(err instanceof Error ? err.message : 'Unable to load map destinations.')
      } finally {
        if (active) setMapLoading(false)
      }
    }

    void loadMapTrips()

    return () => {
      active = false
    }
  }, [viewMode, debouncedSearch, category, difficulty, startDate, endDate, sort, reloadKey])

  function updateSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function resetFilters() {
    setSearch('')
    setDebouncedSearch('')
    setCategory('')
    setDifficulty('')
    setStartDate('')
    setEndDate('')
    setSort('date_asc')
    setPage(1)
  }

  const hasFilters = Boolean(
    search ||
      category ||
      difficulty ||
      startDate ||
      endDate ||
      sort !== 'date_asc'
  )

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-50">
      <section className="relative overflow-hidden bg-slate-900 px-6 py-20 text-white sm:py-24">
        <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-teal-600/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-teal-700/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
            <Compass size={17} />
            Explore the World
          </span>

          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Discover Your Next{' '}
            <span className="text-teal-300">Adventure</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Find unforgettable group trips, explore new destinations
            and connect with fellow travelers.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200">
              <MapPin size={15} className="mr-2 inline text-teal-300" />
              Worldwide Destinations
            </span>

            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200">
              <Users size={15} className="mr-2 inline text-teal-300" />
              Group Adventures
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Find Your Perfect Trip
          </h2>
          <p className="mt-2 text-slate-500">
            Search destinations and filter trips to match your
            interests.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal size={19} className="text-teal-700" />
            <h3 className="font-bold text-slate-900">
              Search & Filters
            </h3>
          </div>

          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                updateSearch(event.target.value)
              }
              placeholder="Search trips, destinations, countries..."
              aria-label="Search trips"
              className={`${inputClass} py-4 pl-12`}
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Category
              </span>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value)
                  setPage(1)
                }}
                className={inputClass}
              >
                <option value="">All Categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Difficulty
              </span>
              <select
                value={difficulty}
                onChange={(event) => {
                  setDifficulty(event.target.value)
                  setPage(1)
                }}
                className={inputClass}
              >
                <option value="">All Levels</option>
                {difficulties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                From Date
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value)
                  setPage(1)
                }}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                To Date
              </span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => {
                  setEndDate(event.target.value)
                  setPage(1)
                }}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-500">
              Discover experiences tailored to you
            </p>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilters}
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mb-7 mt-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Available Trips
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {loading
                ? 'Finding your next adventure...'
                : `${total} ${total === 1 ? 'trip' : 'trips'} found`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1" aria-label="Trip view">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid size={16} />
                Grid View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                aria-pressed={viewMode === 'map'}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  viewMode === 'map'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapIcon size={16} />
                Map View
              </button>
            </div>
            <label className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500">
                Sort by
            </span>

            <select
              value={sort}
              onChange={(event) => {
                setSort(
                  event.target.value as
                    | 'date_asc'
                    | 'date_desc'
                    | 'title_asc'
                )
                setPage(1)
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-teal-600"
            >
              <option value="date_asc">Date: Earliest</option>
              <option value="date_desc">Date: Latest</option>
              <option value="title_asc">Name: A to Z</option>
            </select>
            </label>
          </div>
        </div>

        {viewMode === 'map' ? (
          mapLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center text-slate-500">
              Loading map destinations...
            </div>
          ) : mapError ? (
            <div className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center">
              <h3 className="text-xl font-bold text-slate-900">We couldn't load the map</h3>
              <p className="mt-3 text-sm text-slate-500">{mapError}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <RefreshCw size={17} />
                Try Again
              </button>
            </div>
          ) : (
            <TripMap trips={mapTrips} />
          )
        ) : (
          <>
        {loading ? (
          <div
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            role="status"
            aria-label="Loading trips"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
              >
                <div className="h-48 animate-pulse bg-slate-200" />
                <div className="space-y-4 p-6">
                  <div className="h-6 w-3/4 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center">
            <h3 className="text-xl font-bold text-slate-900">
              We couldn't load the trips
            </h3>

            <p className="mt-3 text-sm text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
              <Mountain size={36} />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              No Trips Found
            </h3>

            <p className="mx-auto mt-3 max-w-md text-slate-500">
              Try changing your search or filters to discover
              more adventures.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-7 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <span className="text-sm font-semibold text-slate-600">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              disabled={page >= totalPages}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        )}

          </>
        )}

        <div className="mt-16 rounded-3xl bg-teal-800 px-7 py-10 text-white sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-extrabold">
                Your next adventure starts here.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-teal-100">
                Explore destinations, discover new experiences
                and find a group trip that inspires you.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold">
              Keep Exploring
              <ArrowRight size={17} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
