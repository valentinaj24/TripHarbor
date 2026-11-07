
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  MapPin,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from 'lucide-react'
import {
  getAdminPendingTrips,
  reviewAdminTrip,
  type AdminTrip,
} from '../services/api'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export default function AdminTripApprovalsPage() {
  const [trips, setTrips] = useState<AdminTrip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<AdminTrip | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const loadTrips = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAdminPendingTrips()
      setTrips(response.data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load pending trips.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTrips()
  }, [loadTrips])

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return trips

    return trips.filter((trip) => {
      const values = [
        trip.title,
        trip.destination.name,
        trip.destination.country,
        trip.organizer.firstName,
        trip.organizer.lastName,
        trip.category,
      ]

      return values.some((value) =>
        value.toLowerCase().includes(query)
      )
    })
  }, [trips, search])

  async function handleReview() {
    if (!selectedTrip || !decision || submitting) return

    if (decision === 'REJECT' && !rejectionReason.trim()) {
      setError('Please provide a reason for rejection.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await reviewAdminTrip(
        selectedTrip.id,
        decision,
        rejectionReason.trim()
      )

      setTrips((current) =>
        current.filter((trip) => trip.id !== selectedTrip.id)
      )

      setSuccess(response.message)
      setSelectedTrip(null)
      setDecision(null)
      setRejectionReason('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to review this trip.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  function openTrip(trip: AdminTrip) {
    setSelectedTrip(trip)
    setDecision(null)
    setRejectionReason('')
    setError('')
    setSuccess('')
  }

  function closeTrip() {
    setSelectedTrip(null)
    setDecision(null)
    setRejectionReason('')
    setError('')
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            Trip Management
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Trip Approvals
          </h1>

          <p className="mt-3 text-slate-500">
            Review submitted trips and decide which adventures go live.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadTrips()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {success && (
        <div
          role="status"
          className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
        >
          <CheckCircle2 size={20} />
          {success}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {!selectedTrip ? (
        <>
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <Clock3 size={23} />
              </div>

              <div>
                <p className="text-2xl font-extrabold text-slate-900">
                  {trips.length}
                </p>
                <p className="text-sm text-slate-500">
                  Trips awaiting approval
                </p>
              </div>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search trips, destinations..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center text-slate-500">
              Loading pending trips...
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
              <CheckCircle2
                size={46}
                className="mx-auto mb-5 text-teal-600"
              />

              <h2 className="text-xl font-bold text-slate-900">
                {search ? 'No matching trips' : 'All caught up!'}
              </h2>

              <p className="mt-2 text-slate-500">
                {search
                  ? 'Try searching with a different keyword.'
                  : 'There are no trips waiting for approval.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredTrips.map((trip) => (
                <article
                  key={trip.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="h-52 bg-slate-100 sm:h-auto sm:w-44 sm:shrink-0">
                      {trip.coverUrl ? (
                        <img
                          src={trip.coverUrl}
                          alt={trip.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <Compass size={44} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-5">
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                        Pending Review
                      </span>

                      <h2 className="mt-3 text-lg font-extrabold text-slate-900">
                        {trip.title}
                      </h2>

                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={16} />
                        {trip.destination.name}, {trip.destination.country}
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays size={16} />
                        {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Organizer: {trip.organizer.firstName}{' '}
                        {trip.organizer.lastName}
                      </p>

                      <button
                        type="button"
                        onClick={() => openTrip(trip)}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                      >
                        Review Trip
                        <ArrowLeft size={17} className="rotate-180" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <button
            type="button"
            onClick={closeTrip}
            disabled={submitting}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700 disabled:opacity-50"
          >
            <ArrowLeft size={18} />
            Back to pending trips
          </button>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {selectedTrip.coverUrl && (
              <img
                src={selectedTrip.coverUrl}
                alt={selectedTrip.title}
                className="h-64 w-full object-cover sm:h-80"
              />
            )}

            <div className="p-6 sm:p-8">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  Pending Review
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {selectedTrip.category}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {selectedTrip.difficulty}
                </span>
              </div>

              <h2 className="text-3xl font-extrabold text-slate-900">
                {selectedTrip.title}
              </h2>

              <div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <MapPin size={18} className="text-teal-700" />
                  {selectedTrip.destination.name},{' '}
                  {selectedTrip.destination.country}
                </p>

                <p className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-teal-700" />
                  {formatDate(selectedTrip.startDate)} –{' '}
                  {formatDate(selectedTrip.endDate)}
                </p>

                <p className="flex items-center gap-2">
                  <Users size={18} className="text-teal-700" />
                  Max {selectedTrip.maxParticipants} participants
                </p>

                <p className="flex items-center gap-2">
                  <MapPin size={18} className="text-teal-700" />
                  Meeting point: {selectedTrip.meetingPoint}
                </p>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-7">
                <h3 className="text-lg font-bold text-slate-900">
                  Trip Description
                </h3>
                <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                  {selectedTrip.description}
                </p>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-7">
                <h3 className="text-lg font-bold text-slate-900">
                  Organizer Information
                </h3>

                <div className="mt-4 rounded-xl bg-slate-50 p-5">
                  <p className="font-bold text-slate-900">
                    {selectedTrip.organizer.firstName}{' '}
                    {selectedTrip.organizer.lastName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedTrip.organizer.email}
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-7">
                <h3 className="text-lg font-bold text-slate-900">
                  Trip Itinerary
                </h3>

                {selectedTrip.activities.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No activities have been added.
                  </p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {selectedTrip.activities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex gap-4 rounded-xl border border-slate-200 p-5"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
                          {index + 1}
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900">
                            {activity.title}
                          </h4>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(activity.activityDate)} ·{' '}
                            {activity.locationName}
                          </p>

                          {activity.description && (
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-9 flex flex-wrap gap-3 border-t border-slate-100 pt-7">
                <button
                  type="button"
                  onClick={() => {
                    setDecision('APPROVE')
                    setError('')
                  }}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={19} />
                  Approve Trip
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecision('REJECT')
                    setError('')
                  }}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle size={19} />
                  Reject Trip
                </button>
              </div>

              {decision && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    {decision === 'APPROVE'
                      ? 'Confirm Trip Approval'
                      : 'Reject This Trip'}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    {decision === 'APPROVE'
                      ? 'This trip will become visible to travelers.'
                      : 'Provide a reason explaining why this trip cannot be published.'}
                  </p>

                  {decision === 'REJECT' && (
                    <div className="mt-5">
                      <label
                        htmlFor="rejection-reason"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Rejection Reason
                      </label>

                      <textarea
                        id="rejection-reason"
                        rows={4}
                        maxLength={1000}
                        value={rejectionReason}
                        onChange={(event) =>
                          setRejectionReason(event.target.value)
                        }
                        placeholder="Explain what the organizer should improve..."
                        className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleReview()}
                      disabled={
                        submitting ||
                        (decision === 'REJECT' && !rejectionReason.trim())
                      }
                      className={`rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-50 ${
                        decision === 'APPROVE'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {submitting
                        ? 'Processing...'
                        : decision === 'APPROVE'
                          ? 'Confirm Approval'
                          : 'Confirm Rejection'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision(null)}
                      disabled={submitting}
                      className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
