
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Compass,
  MapPin,
  Users,
} from 'lucide-react'
import {
  getMyTripRegistrations,
  type MyTripRegistration,
  type MyTripRegistrationStatus,
} from '../services/api'

type Filter = 'ALL' | 'UPCOMING' | 'PENDING' | 'PAST' | 'HISTORY'

const statusStyles: Record<MyTripRegistrationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  ACCEPTED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function dateOnly(value: string) {
  return value.slice(0, 10)
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10)
}

export default function MyTripsPage() {
  const [registrations, setRegistrations] = useState<MyTripRegistration[]>([])
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const response = await getMyTripRegistrations()
        if (active) setRegistrations(response.data)
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load your trips.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const today = todayUTC()

  const upcoming = registrations.filter(
    (item) =>
      item.status === 'ACCEPTED' &&
      dateOnly(item.trip.endDate) >= today
  )

  const pending = registrations.filter(
    (item) => item.status === 'PENDING'
  )

  const past = registrations.filter(
    (item) =>
      item.status === 'ACCEPTED' &&
      dateOnly(item.trip.endDate) < today
  )

  const history = registrations.filter(
    (item) =>
      item.status === 'REJECTED' ||
      item.status === 'CANCELLED'
  )

  const filtered = registrations.filter((item) => {
    if (filter === 'UPCOMING') {
      return (
        item.status === 'ACCEPTED' &&
        dateOnly(item.trip.endDate) >= today
      )
    }

    if (filter === 'PENDING') return item.status === 'PENDING'

    if (filter === 'PAST') {
      return (
        item.status === 'ACCEPTED' &&
        dateOnly(item.trip.endDate) < today
      )
    }

    if (filter === 'HISTORY') {
      return (
        item.status === 'REJECTED' ||
        item.status === 'CANCELLED'
      )
    }

    return true
  })

  const filters: { label: string; value: Filter }[] = [
    { label: 'All Trips', value: 'ALL' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Past Trips', value: 'PAST' },
    { label: 'History', value: 'HISTORY' },
  ]

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
            Your Travel Journey
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-slate-900">
            My Trips
          </h1>
          <p className="mt-3 text-slate-500">
            Keep track of your adventures and registrations in one place.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-14 text-center text-slate-500">
            Loading your trips...
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Upcoming', value: upcoming.length, icon: CalendarDays },
                { label: 'Pending', value: pending.length, icon: Users },
                { label: 'Past Trips', value: past.length, icon: Compass },
                { label: 'History', value: history.length, icon: MapPin },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon size={23} />
                  </div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    filter === item.value
                      ? 'bg-teal-700 text-white'
                      : 'bg-white text-slate-600 hover:bg-teal-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
                <Compass size={36} className="mx-auto text-teal-700" />
                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  No trips found
                </h2>
                <p className="mt-2 text-slate-500">
                  Your trips will appear here when you join an adventure.
                </p>
                <Link
                  to="/trips"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
                >
                  Explore Trips <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((registration) => (
                  <article
                    key={registration.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
                  >
                    <div className="relative h-48 bg-slate-200">
                      {registration.trip.coverUrl ? (
                        <img
                          src={registration.trip.coverUrl}
                          alt={registration.trip.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <Compass size={45} />
                        </div>
                      )}
                      <span
                        className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[registration.status]}`}
                      >
                        {registration.status}
                      </span>
                    </div>

                    <div className="p-6">
                      <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                        {registration.trip.category}
                      </p>
                      <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                        {registration.trip.title}
                      </h2>

                      <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={16} />
                        {registration.trip.destination.name},{' '}
                        {registration.trip.destination.country}
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays size={16} />
                        {formatDate(registration.trip.startDate)} –{' '}
                        {formatDate(registration.trip.endDate)}
                      </p>

                      <p className="mt-3 text-sm text-slate-500">
                        Organizer: {registration.trip.organizer.firstName}{' '}
                        {registration.trip.organizer.lastName}
                      </p>

                      <Link
                        to={`/trips/${registration.trip.id}`}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800"
                      >
                        View Trip Details <ArrowRight size={18} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
