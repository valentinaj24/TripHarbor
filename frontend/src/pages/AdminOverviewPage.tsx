
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Compass,
  FileText,
  MapPinned,
  RefreshCw,
  TicketCheck,
  Users,
  UserRoundCheck,
  UserRoundPlus,
} from 'lucide-react'
import {
  getAdminStats,
  type AdminStats,
  type TripStatus,
} from '../services/api'

const statusStyles: Record<TripStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-amber-100 text-amber-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAdminStats()
      setStats(response.data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load dashboard statistics.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  
const cards = [
  {
    label: 'Total Users',
    value: stats?.users.total ?? 0,
    description: 'Registered platform users',
    icon: Users,
    color: 'bg-blue-50 text-blue-700',
    href: '/admin/users',
  },
  {
    label: 'Published Trips',
    value: stats?.trips.published ?? 0,
    description: 'Available to travelers',
    icon: MapPinned,
    color: 'bg-emerald-50 text-emerald-700',
    href: '/admin/trips',
  },
  {
    label: 'Pending Trip Approvals',
    value: stats?.trips.pending ?? 0,
    description: 'Trips waiting for review',
    icon: Clock3,
    color: 'bg-amber-50 text-amber-700',
    href: '/admin/trips/pending',
  },
  {
    label: 'Pending Organizer Requests',
    value: stats?.pendingOrganizerRequests ?? 0,
    description: 'Organizer applications awaiting review',
    icon: UserRoundPlus,
    color: 'bg-orange-50 text-orange-700',
    href: '/admin/organizers',
  },
  {
    label: 'Total Registrations',
    value: stats?.registrations.total ?? 0,
    description: 'All trip registrations',
    icon: TicketCheck,
    color: 'bg-violet-50 text-violet-700',
    href: '/admin/analytics',
  },
]


  const tripDistribution = [
    {
      label: 'Published',
      value: stats?.trips.published ?? 0,
      color: 'bg-emerald-500',
    },
    {
      label: 'Pending',
      value: stats?.trips.pending ?? 0,
      color: 'bg-amber-500',
    },
    {
      label: 'Drafts',
      value: stats?.trips.drafts ?? 0,
      color: 'bg-slate-400',
    },
    {
      label: 'Rejected',
      value: stats?.trips.rejected ?? 0,
      color: 'bg-red-500',
    },
    {
      label: 'Cancelled',
      value: Math.max(
        0,
        (stats?.trips.total ?? 0) -
          (stats?.trips.published ?? 0) -
          (stats?.trips.pending ?? 0) -
          (stats?.trips.drafts ?? 0) -
          (stats?.trips.rejected ?? 0)
      ),
      color: 'bg-slate-700',
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            Platform Overview
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Dashboard Overview
          </h1>

          <p className="mt-3 text-slate-500">
            Monitor platform activity, manage trips, and review pending requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-7 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-slate-500">
          Loading dashboard statistics...
        </div>
      ) : stats ? (
        <>
          
<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
  {cards.map(
    ({ label, value, description, icon: Icon, color, href }) => (
      <Link
        key={label}
        to={href}
        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
          >
            <Icon size={23} />
          </div>

          <ArrowRight
            size={18}
            className="text-slate-300 transition group-hover:text-teal-700"
          />
        </div>

        <p className="mt-5 text-sm font-semibold text-slate-500">
          {label}
        </p>

        <p className="mt-2 text-3xl font-extrabold text-slate-900">
          {value.toLocaleString('en-US')}
        </p>

        <p className="mt-2 text-xs text-slate-400">
          {description}
        </p>
      </Link>
    )
  )}
</div>


          <div className="mt-7 grid gap-6 xl:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Trip Status Distribution
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Overview of all trips by publication status
                  </p>
                </div>
                <Activity size={21} className="text-teal-700" />
              </div>

              <div className="space-y-6">
                {tripDistribution.map((item) => {
                  const percentage =
                    stats.trips.total > 0
                      ? Math.round((item.value / stats.trips.total) * 100)
                      : 0

                  return (
                    <div key={item.label}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-semibold text-slate-700">
                          {item.label}
                        </span>
                        <span className="text-slate-500">
                          {item.value} ({percentage}%)
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Platform Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Key operational numbers
              </p>

              <div className="mt-7 space-y-6">
                {[
                  {
                    label: 'Organizers',
                    value: stats.users.organizers,
                    icon: UserRoundCheck,
                  },
                  {
                    label: 'Participants',
                    value: stats.users.participants,
                    icon: Users,
                  },
                  {
                    label: 'Total Trips',
                    value: stats.trips.total,
                    icon: Compass,
                  },
                  {
                    label: 'Accepted Registrations',
                    value: stats.registrations.accepted,
                    icon: CheckCircle2,
                  },
                  {
                    label: 'Pending Registrations',
                    value: stats.registrations.pending,
                    icon: Clock3,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Icon size={19} />
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        {label}
                      </span>
                    </div>

                    <span className="text-lg font-extrabold text-slate-900">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recent Trips
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest trips created on the platform
                </p>
              </div>

              <Link
                to="/admin/trips"
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900"
              >
                View All Trips <ArrowRight size={17} />
              </Link>
            </div>

            {stats.recentTrips.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <FileText size={35} className="mx-auto mb-3 text-slate-300" />
                No trips have been created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Trip</th>
                      <th className="px-6 py-4 font-semibold">Organizer</th>
                      <th className="px-6 py-4 font-semibold">Created</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {stats.recentTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-slate-50">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-900">{trip.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {trip.destination.name}, {trip.destination.country}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-slate-600">
                          {trip.organizer.firstName} {trip.organizer.lastName}
                        </td>

                        <td className="px-6 py-5 text-slate-600">
                          {formatDate(trip.createdAt)}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[trip.status]}`}
                          >
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </main>
  )
}
