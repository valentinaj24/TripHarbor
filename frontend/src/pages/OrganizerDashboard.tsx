
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  FilePenLine,
  Pencil,
  MapPin,
  Plus,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react'
import {
  getMyTrips,
  submitTripForApproval,
  cancelOrganizerTrip,
  type OrganizerTrip,
  type TripStatus,
} from '../services/api'
import { useAuth } from '../context/AuthContext'

const statusStyles: Record<TripStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-amber-100 text-amber-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export default function OrganizerDashboard() {
  const { user } = useAuth()

  const [trips, setTrips] = useState<OrganizerTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<'ALL' | TripStatus>('ALL')
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [savingCancellation, setSavingCancellation] = useState(false)

  async function loadTrips() {
    setLoading(true)
    setError('')

    try {
      const response = await getMyTrips()
      setTrips(response.data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load your trips.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTrips()
  }, [])

  async function handleSubmitForApproval(id: string) {
    if (submittingId) return

    const confirmed = window.confirm(
      'Submit this trip for administrator approval? You will not be able to edit it while it is under review.'
    )

    if (!confirmed) return

    setSubmittingId(id)
    setError('')
    setSuccess('')

    try {
      await submitTripForApproval(id)

      setTrips((current) =>
        current.map((trip) =>
          trip.id === id
            ? { ...trip, status: 'PENDING', rejectionReason: null, reviewedAt: null }
            : trip
        )
      )

      setSuccess(
        'Your trip has been submitted for approval successfully.'
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit trip for approval.'
      )
    } finally {
      setSubmittingId(null)
    }
  }

  async function handleCancelTrip(id: string) {
    if (savingCancellation) return

    const reason = cancelReason.trim()
    if (reason.length < 10 || reason.length > 1000) {
      setError('Cancellation reason must contain 10–1000 characters.')
      return
    }

    if (!window.confirm('Cancel this trip and all active registrations?')) return

    setSavingCancellation(true)
    setError('')
    setSuccess('')

    try {
      await cancelOrganizerTrip(id, reason)
      setTrips((current) =>
        current.map((trip) =>
          trip.id === id
            ? { ...trip, status: 'CANCELLED', cancellationReason: reason, availableSpots: trip.maxParticipants }
            : trip
        )
      )
      setCancellingId(null)
      setCancelReason('')
      setSuccess('Trip cancelled successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to cancel this trip.')
    } finally {
      setSavingCancellation(false)
    }
  }

  const published = trips.filter(
    (trip) => trip.status === 'PUBLISHED'
  ).length

  const drafts = trips.filter(
    (trip) => trip.status === 'DRAFT'
  ).length

  const pending = trips.filter(
    (trip) => trip.status === 'PENDING'
  ).length

  const filteredTrips =
    filter === 'ALL'
      ? trips
      : trips.filter((trip) => trip.status === filter)

  const stats = [
    {
      label: 'Total Trips',
      value: trips.length,
      icon: Compass,
      color: 'bg-teal-50 text-teal-700',
    },
    {
      label: 'Published',
      value: published,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Drafts',
      value: drafts,
      icon: FilePenLine,
      color: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'Pending Review',
      value: pending,
      icon: Clock3,
      color: 'bg-amber-50 text-amber-700',
    },
  ]

  const filters: Array<{
    label: string
    value: 'ALL' | TripStatus
  }> = [
    { label: 'All Trips', value: 'ALL' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Drafts', value: 'DRAFT' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ]

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
              <Compass size={16} />
              Organizer Workspace
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back, {user?.firstName || 'Organizer'}!
            </h1>

            <p className="mt-3 max-w-xl text-slate-500">
              Manage your adventures, track their progress, and
              create unforgettable travel experiences.
            </p>
          </div>

          <Link
            to="/organizer/trips/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            <Plus size={19} />
            Create New Trip
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon size={23} />
                </div>

                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {loading ? '—' : stat.value}
                </p>
              </div>
            )
          })}
        </div>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                My Trips
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                All the adventures you have created.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadTrips()}
              disabled={loading || submittingId !== null || savingCancellation}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {success && (
            <div
              role="status"
              className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
            >
              <CheckCircle2 size={19} className="shrink-0" />
              {success}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="mb-7 flex flex-wrap gap-2">
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

          {loading ? (
            <div className="py-20 text-center text-slate-500">
              Loading your trips...
            </div>
          ) : !error && filteredTrips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <Compass
                size={40}
                className="mx-auto mb-4 text-teal-600"
              />

              <h3 className="text-xl font-bold text-slate-900">
                {filter === 'ALL'
                  ? 'Your adventure starts here'
                  : 'No trips with this status'}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-slate-500">
                {filter === 'ALL'
                  ? 'Create your first trip and start planning something amazing.'
                  : 'Try another filter to see your trips.'}
              </p>
            </div>
          ) : !error ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTrips.map((trip) => {
                const canEdit =
                  trip.status === 'DRAFT' ||
                  trip.status === 'REJECTED'

                return (
                  <article
                    key={trip.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-teal-200 hover:shadow-md"
                  >
                    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100">
                      {trip.coverUrl ? (
                        <img
                          src={trip.coverUrl}
                          alt={trip.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Compass
                          size={54}
                          className="text-teal-300"
                        />
                      )}

                      <span
                        className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[trip.status]}`}
                      >
                        {trip.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-teal-700">
                        <MapPin size={15} />
                        {trip.destination.name},{' '}
                        {trip.destination.country}
                      </div>

                      <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                        {trip.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-500">
                        {trip.description}
                      </p>

                      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={16}
                            className="text-teal-600"
                          />
                          {formatDate(trip.startDate)} –{' '}
                          {formatDate(trip.endDate)}
                        </div>

                        <div className="flex items-center gap-2">
                          <Users
                            size={16}
                            className="text-teal-600"
                          />
                          {trip.maxParticipants -
                            trip.availableSpots}{' '}
                          / {trip.maxParticipants} participants
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {trip.category}
                        </span>

                        {trip.status === 'PUBLISHED' ? (
                          <Link
                            to={`/trips/${trip.id}`}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-900"
                          >
                            View Trip
                            <ArrowRight size={16} />
                          </Link>
                        ) : canEdit ? (
                          <Link
                            to={`/organizer/trips/${trip.id}/edit`}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-900"
                          >
                            <Pencil size={15} />
                            Edit Trip
                            <ArrowRight size={16} />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400">
                            {trip.status === 'PENDING' ? (
                              <Clock3 size={15} />
                            ) : (
                              <FilePenLine size={15} />
                            )}
                            {trip.status === 'PENDING'
                              ? 'Under Review'
                              : 'Not public'}
                          </span>
                        )}
                      </div>
                      {trip.status === 'PUBLISHED' && (
                        <Link
                            to={`/organizer/trips/${trip.id}/registrations`}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
                        >
                            <Users size={17} />
                            Manage Registrations
                            <ArrowRight size={16} />
                        </Link>
                        )}

                      {trip.status === 'PUBLISHED' && (
                        <div className="mt-4">
                          {cancellingId === trip.id ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                              <p className="text-sm font-bold text-red-800">Cancel Trip</p>
                              <p className="mt-2 text-xs text-red-700">
                                All active registrations will also be cancelled.
                              </p>
                              <textarea
                                value={cancelReason}
                                onChange={(event) => setCancelReason(event.target.value)}
                                placeholder="Explain why this trip is being cancelled..."
                                maxLength={1000}
                                rows={3}
                                className="mt-3 w-full rounded-xl border border-red-200 bg-white p-3 text-sm outline-none focus:border-red-400"
                              />
                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleCancelTrip(trip.id)}
                                  disabled={savingCancellation || cancelReason.trim().length < 10}
                                  className="flex-1 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                                >
                                  {savingCancellation ? 'Cancelling...' : 'Confirm Cancellation'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setCancellingId(null); setCancelReason('') }}
                                  disabled={savingCancellation}
                                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
                                >
                                  Back
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => { setCancellingId(trip.id); setCancelReason(''); setError('') }}
                              disabled={savingCancellation}
                              className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              Cancel Trip
                            </button>
                          )}
                        </div>
                      )}

                      {trip.status === 'CANCELLED' && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                          <p className="text-sm font-bold text-red-800">Trip Cancelled</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-red-700">
                            {trip.cancellationReason || 'No cancellation reason available.'}
                          </p>
                        </div>
                      )}

                      {trip.status === 'REJECTED' && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                          <p className="text-sm font-bold text-red-800">
                            Trip Rejected
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-700">
                            {trip.rejectionReason ||
                              'Your trip was not approved. Please review the details and update your trip before submitting it again.'}
                          </p>
                          <p className="mt-3 text-xs font-medium text-red-600">
                            Edit your trip and submit it again for approval.
                          </p>
                        </div>
                      )}

                      {canEdit && (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() =>
                              void handleSubmitForApproval(trip.id)
                            }
                            disabled={submittingId !== null}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {submittingId === trip.id ? (
                              <>
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send size={16} />
                                Submit for Approval
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
