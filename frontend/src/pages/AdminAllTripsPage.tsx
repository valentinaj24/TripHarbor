import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, CalendarDays, CheckCircle2, Clock3, Compass,
  MapPin, RefreshCw, Search, Users, XCircle, AlertCircle,
} from 'lucide-react'
import {
  cancelAdminTrip,
  getAdminTrips,
  type AdminTrip,
  type TripStatus,
} from '../services/api'

const statuses: Array<{ label: string; value: 'ALL' | TripStatus }> = [
  { label: 'All Trips', value: 'ALL' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const statusStyles: Record<TripStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-amber-100 text-amber-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-200 text-slate-700',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(value))
}

export default function AdminAllTripsPage() {
  const [trips, setTrips] = useState<AdminTrip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<AdminTrip | null>(null)
  const [status, setStatus] = useState<'ALL' | TripStatus>('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
const [cancelling, setCancelling] = useState(false)
const [cancelReason, setCancelReason] = useState('')
const [showCancelForm, setShowCancelForm] = useState(false)
const [notice, setNotice] = useState('')

  const loadTrips = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getAdminTrips()
      setTrips(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load trips.')
    } finally {
      setLoading(false)
    }
  }, [])
  
async function handleCancelTrip() {
  if (!selectedTrip || cancelling) return

  const reason = cancelReason.trim()

  if (reason.length < 10 || reason.length > 1000) {
    setError('Please enter a reason between 10 and 1000 characters.')
    return
  }

  setCancelling(true)
  setError('')
  setNotice('')

  try {
    await cancelAdminTrip(selectedTrip.id, reason)

    setTrips((current) =>
      current.map((trip) =>
        trip.id === selectedTrip.id
          ? {
              ...trip,
              status: 'CANCELLED' as TripStatus,
              acceptedParticipants: 0,
            }
          : trip
      )
    )

    setSelectedTrip((current) =>
      current
        ? {
            ...current,
            status: 'CANCELLED',
            acceptedParticipants: 0,
          }
        : null
    )

    setShowCancelForm(false)
    setCancelReason('')
    setNotice('Trip cancelled successfully.')
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Unable to cancel trip.'
    )
  } finally {
    setCancelling(false)
  }
}


  useEffect(() => { void loadTrips() }, [loadTrips])

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLowerCase()
    return trips.filter((trip) => {
      if (status !== 'ALL' && trip.status !== status) return false
      if (!query) return true
      return [
        trip.title, trip.category, trip.destination.name,
        trip.destination.country, trip.organizer.firstName,
        trip.organizer.lastName, trip.organizer.email,
      ].some((value) => value.toLowerCase().includes(query))
    })
  }, [trips, search, status])

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">Trip Management</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">All Trips</h1>
          <p className="mt-3 text-slate-500">Browse and review every trip created on TripHarbor.</p>
        </div>
        <button type="button" onClick={() => void loadTrips()} disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {notice && (
        <p
          role="status"
          className="mb-6 rounded-xl bg-emerald-50 p-4 text-emerald-700"
        >
          {notice}
        </p>
      )}

      {selectedTrip ? (
        <div className="space-y-6">
          <button type="button" onClick={() => setSelectedTrip(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700">
            <ArrowLeft size={18} /> Back to all trips
          </button>
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {selectedTrip.coverUrl && (
              <img src={selectedTrip.coverUrl} alt={selectedTrip.title} className="h-64 w-full object-cover sm:h-80" />
            )}
            <div className="p-6 sm:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[selectedTrip.status]}`}>{selectedTrip.status}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{selectedTrip.category}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{selectedTrip.difficulty}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">{selectedTrip.title}</h2>
              <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                <p className="flex items-center gap-2"><MapPin size={18} className="text-teal-700" /> {selectedTrip.destination.name}, {selectedTrip.destination.country}</p>
                <p className="flex items-center gap-2"><CalendarDays size={18} className="text-teal-700" /> {formatDate(selectedTrip.startDate)} – {formatDate(selectedTrip.endDate)}</p>
                <p className="flex items-center gap-2"><Users size={18} className="text-teal-700" /> Max {selectedTrip.maxParticipants} participants</p>
                <p className="flex items-center gap-2"><MapPin size={18} className="text-teal-700" /> Meeting point: {selectedTrip.meetingPoint}</p>
                <p className="flex items-center gap-2"><Clock3 size={18} className="text-teal-700" /> Created {formatDate(selectedTrip.createdAt)}</p>
                {selectedTrip.acceptedParticipants !== undefined && (
                  <p className="flex items-center gap-2"><CheckCircle2 size={18} className="text-teal-700" /> {selectedTrip.acceptedParticipants} accepted participants</p>
                )}
              </div>
              <section className="mt-8 border-t border-slate-100 pt-7">
                <h3 className="text-lg font-bold text-slate-900">Trip Description</h3>
                <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{selectedTrip.description}</p>
              </section>
              <section className="mt-8 border-t border-slate-100 pt-7">
                <h3 className="text-lg font-bold text-slate-900">Organizer Information</h3>
                <div className="mt-4 rounded-xl bg-slate-50 p-5">
                  <p className="font-bold text-slate-900">{selectedTrip.organizer.firstName} {selectedTrip.organizer.lastName}</p>
                  <p className="mt-1 text-sm text-slate-500">{selectedTrip.organizer.email}</p>
                </div>
              </section>
              <section className="mt-8 border-t border-slate-100 pt-7">
                <h3 className="text-lg font-bold text-slate-900">Trip Itinerary</h3>
                {selectedTrip.activities.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No activities have been added.</p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {selectedTrip.activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-4 rounded-xl border border-slate-200 p-5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">{index + 1}</div>
                        <div>
                          <h4 className="font-bold text-slate-900">{activity.title}</h4>
                          <p className="mt-1 text-sm text-slate-500">{formatDate(activity.activityDate)} · {activity.locationName}</p>
                          {activity.description && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{activity.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
                          
            {selectedTrip.status === 'PUBLISHED' && (
              <section className="mt-8 border-t border-slate-100 pt-7">
                <h3 className="text-lg font-bold text-slate-900">
                  Administrative Actions
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Cancel this trip if it violates platform rules or cannot proceed.
                  This action will also cancel pending and accepted registrations.
                </p>

                {!showCancelForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setShowCancelForm(true)
                    }}
                    className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
                  >
                    Cancel Trip
                  </button>
                ) : (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5">
                    <label
                      htmlFor="cancel-reason"
                      className="block text-sm font-bold text-red-900"
                    >
                      Cancellation Reason
                    </label>

                    <textarea
                      id="cancel-reason"
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                      maxLength={1000}
                      rows={4}
                      placeholder="Explain why this trip is being cancelled..."
                      className="mt-3 w-full rounded-xl border border-red-200 bg-white p-3 text-sm outline-none focus:border-red-500"
                    />

                    <p className="mt-2 text-xs text-red-700">
                      Minimum 10 characters. This action cannot be undone here.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={cancelling || cancelReason.trim().length < 10}
                        onClick={() => void handleCancelTrip()}
                        className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                      >
                        {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                      </button>

                      <button
                        type="button"
                        disabled={cancelling}
                        onClick={() => {
                          setShowCancelForm(false)
                          setCancelReason('')
                          setError('')
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                      >
                        Keep Trip
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

              {selectedTrip.status === 'CANCELLED' && (
                <p className="mt-8 flex items-center gap-2 rounded-xl bg-slate-100 p-4 text-sm text-slate-600"><XCircle size={18} /> This trip has been cancelled.</p>
              )}
            </div>
          </article>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal-50 p-3 text-teal-700"><Compass size={23} /></div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">{trips.length}</p>
                  <p className="text-sm text-slate-500">Total trips on the platform</p>
                </div>
              </div>
              <div className="relative w-full sm:max-w-sm">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search trips, destinations, organizers..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              {statuses.map((option) => (
                <button key={option.value} type="button" onClick={() => setStatus(option.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${status === option.value ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {option.label}
                  <span className="ml-2 opacity-75">{option.value === 'ALL' ? trips.length : trips.filter((trip) => trip.status === option.value).length}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center text-slate-500">Loading trips...</div>
          ) : filteredTrips.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
              <Search size={42} className="mx-auto mb-4 text-slate-300" />
              <h2 className="text-xl font-bold text-slate-900">No trips found</h2>
              <p className="mt-2 text-slate-500">Try another search or status filter.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Trip</th>
                      <th className="px-5 py-4 font-semibold">Organizer</th>
                      <th className="px-5 py-4 font-semibold">Dates</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-slate-50">
                        <td className="min-w-64 px-5 py-4">
                          <div className="flex items-center gap-3">
                            {trip.coverUrl ? <img src={trip.coverUrl} alt="" className="h-14 w-16 rounded-lg object-cover" /> : <div className="flex h-14 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><Compass size={24} /></div>}
                            <div>
                              <p className="font-bold text-slate-900">{trip.title}</p>
                              <p className="mt-1 text-xs text-slate-500">{trip.destination.name}, {trip.destination.country}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{trip.organizer.firstName} {trip.organizer.lastName}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(trip.startDate)}</td>
                        <td className="px-5 py-4"><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[trip.status]}`}>{trip.status}</span></td>
                        <td className="px-5 py-4 text-right">
                          <button type="button" onClick={() => setSelectedTrip(trip)} className="whitespace-nowrap rounded-lg bg-teal-50 px-4 py-2 font-bold text-teal-700 hover:bg-teal-100">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">Showing {filteredTrips.length} of {trips.length} trips</div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
