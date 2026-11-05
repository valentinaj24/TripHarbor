
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Clock3,
  RefreshCw,
  Users,
  X,
} from 'lucide-react'
import {
  getTripRegistrations,
  reviewTripRegistration,
  type OrganizerRegistration,
  type TripRegistrationManagement,
  type RegistrationStatus,
} from '../services/api'

const statusStyles: Record<RegistrationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  ACCEPTED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default function TripRegistrationsPage() {
  const { id } = useParams<{ id: string }>()

  const [data, setData] = useState<TripRegistrationManagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<'ALL' | RegistrationStatus>('ALL')

  const loadRegistrations = useCallback(async (initial = false) => {
    if (!id) {
      setError('Invalid trip ID.')
      setLoading(false)
      return
    }

    if (initial) setLoading(true)
    else setRefreshing(true)

    setError('')

    try {
      const response = await getTripRegistrations(id)
      setData(response.data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load registrations.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id])

  useEffect(() => {
    void loadRegistrations(true)
  }, [loadRegistrations])

  async function handleReview(
    registration: OrganizerRegistration,
    status: 'ACCEPTED' | 'REJECTED'
  ) {
    if (!id || savingId) return

    const action = status === 'ACCEPTED' ? 'accept' : 'reject'

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${registration.user.firstName} ${registration.user.lastName}'s registration?`
    )

    if (!confirmed) return

    setSavingId(registration.id)
    setError('')
    setSuccess('')

    try {
      const response = await reviewTripRegistration(
        id,
        registration.id,
        status
      )

      setSuccess(response.message)

      // Reload from the backend to update capacity and statuses.
      await loadRegistrations()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update registration.'
      )
    } finally {
      setSavingId(null)
    }
  }

  const registrations = data?.registrations ?? []

  const filteredRegistrations =
    filter === 'ALL'
      ? registrations
      : registrations.filter((item) => item.status === filter)

  const filters: Array<{
    label: string
    value: 'ALL' | RegistrationStatus
  }> = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ]

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/organizer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
              Organizer Workspace
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              Trip Registrations
            </h1>

            {data && (
              <p className="mt-2 text-slate-500">
                {data.trip.title}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void loadRegistrations()}
            disabled={loading || refreshing || savingId !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {success}
          </div>
        )}

        {loading ? (
          <div className="mt-10 rounded-2xl bg-white p-16 text-center text-slate-500">
            Loading registrations...
          </div>
        ) : data ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Total Registrations',
                  value: registrations.length,
                  icon: Users,
                },
                {
                  label: 'Pending Approval',
                  value: data.trip.pendingCount,
                  icon: Clock3,
                },
                {
                  label: 'Accepted',
                  value: data.trip.acceptedCount,
                  icon: Check,
                },
                {
                  label: 'Available Spots',
                  value: data.trip.availableSpots,
                  icon: Users,
                },
              ].map((stat) => {
                const Icon = stat.icon

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <Icon size={22} />
                    </div>
                    <p className="text-sm text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                )
              })}
            </div>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Manage Applications
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Review requests to join your trip.
                </p>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      filter === item.value
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {filteredRegistrations.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-5 py-14 text-center text-slate-500">
                  No registrations found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRegistrations.map((registration) => (
                    <article
                      key={registration.id}
                      className="flex flex-col gap-5 rounded-2xl border border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                          {registration.user.firstName.charAt(0)}
                          {registration.user.lastName.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900">
                            {registration.user.firstName}{' '}
                            {registration.user.lastName}
                          </h3>

                          <p className="break-all text-sm text-slate-500">
                            {registration.user.email}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Applied {formatDate(registration.registeredAt)}
                          </p>

                          <span
                            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusStyles[registration.status]}`}
                          >
                            {registration.status}
                          </span>
                        </div>
                      </div>

                      {registration.status === 'PENDING' && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleReview(registration, 'ACCEPTED')
                            }
                            disabled={
                              savingId !== null ||
                              data.trip.availableSpots === 0 ||
                              data.trip.status !== 'PUBLISHED'
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check size={17} />
                            {savingId === registration.id
                              ? 'Processing...'
                              : 'Accept'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleReview(registration, 'REJECTED')
                            }
                            disabled={
                              savingId !== null ||
                              data.trip.status !== 'PUBLISHED'
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            <X size={17} />
                            Reject
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  )
}
