
import { useCallback, useEffect, useState } from 'react'
import {
  BarChart3,
  MapPinned,
  RefreshCw,
  TicketCheck,
  Users,
} from 'lucide-react'
import { getAdminAnalytics, type AdminAnalytics } from '../services/api'

const palettes = [
  'bg-teal-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-slate-500',
]

type DistributionItem = {
  name: string
  count: number
}

function getTotal(items: DistributionItem[]) {
  return items.reduce((sum, item) => sum + item.count, 0)
}

function Distribution({
  title,
  items,
}: {
  title: string
  items: DistributionItem[]
}) {
  const total = getTotal(items)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mb-7 text-sm text-slate-500">
        {total.toLocaleString('en-US')} total
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          No data available yet.
        </p>
      ) : (
        <div className="space-y-5">
          {items.map((item, index) => {
            const percentage =
              total > 0 ? (item.count / total) * 100 : 0

            return (
              <div key={item.name}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-700">
                    {item.name}
                  </span>

                  <span className="text-slate-500">
                    {item.count} ({Math.round(percentage)}%)
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      palettes[index % palettes.length]
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAdminAnalytics()
      setData(response.data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load analytics.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const cards = data
    ? [
        {
          label: 'Total Users',
          value: getTotal(data.users),
          icon: Users,
        },
        {
          label: 'Total Trips',
          value: getTotal(data.trips),
          icon: MapPinned,
        },
        {
          label: 'Registrations',
          value: getTotal(data.registrations),
          icon: TicketCheck,
        },
        {
          label: 'Destinations with Trips',
          value: data.destinations.length,
          icon: BarChart3,
        },
      ]
    : []

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            Platform Insights
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Analytics
          </h1>

          <p className="mt-3 text-slate-500">
            Explore TripHarbor activity and platform growth.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh Data
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {loading && !data ? (
        <p className="rounded-2xl bg-white p-16 text-center text-slate-500">
          Loading analytics...
        </p>
      ) : data ? (
        <>
          <div className="mb-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <Icon
                  className="mb-5 text-teal-700"
                  size={24}
                />

                <p className="text-sm text-slate-500">
                  {label}
                </p>

                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {value.toLocaleString('en-US')}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Distribution
              title="Users by Role"
              items={data.users}
            />

            <Distribution
              title="Trips by Status"
              items={data.trips}
            />

            <Distribution
              title="Registration Status"
              items={data.registrations}
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Top Destinations
              </h2>

              <p className="mb-6 mt-1 text-sm text-slate-500">
                Ranked by number of trips
              </p>

              {data.destinations.length === 0 ? (
                <p className="text-slate-500">
                  No trips available yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.destinations.map((place, index) => (
                    <div
                      key={place.id}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 font-bold text-teal-700">
                          {index + 1}
                        </span>

                        <div>
                          <p className="font-bold text-slate-900">
                            {place.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {place.country}
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-slate-800">
                        {place.count} trips
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Recently Joined Users
            </h2>

            <div className="mt-5 divide-y divide-slate-100">
              {data.recentUsers.length === 0 ? (
                <p className="text-slate-500">
                  No users yet.
                </p>
              ) : (
                data.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {user.role}
                      </p>
                    </div>

                    <span className="text-sm text-slate-500">
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString('en-US')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      ) : null}
    </main>
  )
}
