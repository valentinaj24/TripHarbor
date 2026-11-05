
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Users,
  UserRound,
  Compass,
  Clock3,
  Mountain,
  ArrowRight,
} from 'lucide-react'
import {
  getTripById,
   getMyTripRegistration,
  joinTrip,
  cancelTripRegistration,
  type TripDetails,
  type TripRegistration,
} from '../services/api'
import { useAuth } from '../context/AuthContext'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date))
}

export default function TripDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [trip, setTrip] = useState<TripDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registration, setRegistration] = useState<TripRegistration | null>(null)
const [registrationLoading, setRegistrationLoading] = useState(false)
const [registrationSaving, setRegistrationSaving] = useState(false)
const [registrationError, setRegistrationError] = useState('')
const [registrationNotice, setRegistrationNotice] = useState('')

  useEffect(() => {
    let active = true

    async function loadTrip() {
      if (!id) {
        setError('Invalid trip.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await getTripById(id)
        if (active) setTrip(response.data)
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load trip.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadTrip()
    return () => { active = false }
  }, [id])

  
useEffect(() => {
  if (!id || !user || user.role === 'ADMIN') {
    setRegistration(null)
    return
  }

  let active = true
  setRegistration(null)
  setRegistrationLoading(true)
  setRegistrationError('')

  getMyTripRegistration(id)
    .then((response) => {
      if (active) setRegistration(response.data)
    })
    .catch((err: unknown) => {
      if (active) {
        setRegistrationError(
          err instanceof Error
            ? err.message
            : 'Unable to load registration.'
        )
      }
    })
    .finally(() => {
      if (active) setRegistrationLoading(false)
    })

  return () => {
    active = false
  }
}, [id, user?.id, user?.role])


async function handleJoinTrip() {
  if (!id || registrationSaving) return

  setRegistrationSaving(true)
  setRegistrationError('')
  setRegistrationNotice('')

  try {
    const response = await joinTrip(id)
    setRegistration(response.data)
    setRegistrationNotice(response.message)

    const updatedTrip = await getTripById(id)
    setTrip(updatedTrip.data)
  } catch (err) {
    setRegistrationError(
      err instanceof Error
        ? err.message
        : 'Unable to join this trip.'
    )
  } finally {
    setRegistrationSaving(false)
  }
}

async function handleCancelRegistration() {
  if (!id || registrationSaving) return

  if (!window.confirm('Are you sure you want to cancel your registration?')) {
    return
  }

  setRegistrationSaving(true)
  setRegistrationError('')
  setRegistrationNotice('')

  try {
    const response = await cancelTripRegistration(id)
    setRegistration(response.data)
    setRegistrationNotice(response.message)

    const updatedTrip = await getTripById(id)
    setTrip(updatedTrip.data)
  } catch (err) {
    setRegistrationError(
      err instanceof Error
        ? err.message
        : 'Unable to cancel registration.'
    )
  } finally {
    setRegistrationSaving(false)
  }
}


  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading trip details...</p>
      </main>
    )
  }

  if (error || !trip) {
    return (
      <main className="min-h-[70vh] bg-slate-50 px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Trip Not Found
        </h1>
        <p className="mt-4 text-slate-500">
          {error || 'This trip is not available.'}
        </p>
        <Link
          to="/trips"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white"
        >
          <ArrowLeft size={18} />
          Back to Trips
        </Link>
      </main>
    )
  }

  const canRegister =
  user?.role === 'PARTICIPANT' ||
  (user?.role === 'ORGANIZER' && user.id !== trip.organizer.id)

const isOwnTrip =
  user?.role === 'ORGANIZER' && user.id === trip.organizer.id

const isFull = trip.availableSpots === 0

const hasActiveRegistration =
  registration?.status === 'PENDING' ||
  registration?.status === 'ACCEPTED'

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-teal-800 px-6 py-16 text-white sm:py-20">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/10" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-200 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Explore Trips
          </Link>

          <div className="mt-10 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold">
              {trip.category}
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold">
              {trip.difficulty} Difficulty
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            {trip.title}
          </h1>

          <div className="mt-6 flex flex-wrap gap-6 text-teal-100">
            <span className="flex items-center gap-2">
              <MapPin size={19} />
              {trip.destination.name}, {trip.destination.country}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays size={19} />
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_350px] lg:px-8">
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex items-center gap-3">
              <Compass size={23} className="text-teal-700" />
              <h2 className="text-2xl font-extrabold text-slate-900">
                About This Trip
              </h2>
            </div>
            <p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-600">
              {trip.description}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex items-center gap-3">
              <Mountain size={23} className="text-teal-700" />
              <h2 className="text-2xl font-extrabold text-slate-900">
                Trip Information
              </h2>
            </div>

            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Destination</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {trip.destination.name}, {trip.destination.country}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Difficulty</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {trip.difficulty}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Meeting Point</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {trip.meetingPoint}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Category</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {trip.category}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex items-center gap-3">
              <Clock3 size={23} className="text-teal-700" />
              <h2 className="text-2xl font-extrabold text-slate-900">
                Trip Itinerary
              </h2>
            </div>

            {trip.activities.length === 0 ? (
              <div className="mt-7 rounded-2xl bg-slate-50 p-7 text-center">
                <CalendarDays
                  size={30}
                  className="mx-auto text-teal-700"
                />
                <p className="mt-4 font-semibold text-slate-800">
                  Itinerary Coming Soon
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  The organizer has not added the daily
                  activities yet.
                </p>
              </div>
            ) : (
              <div className="mt-7 space-y-4">
                {trip.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      {formatDate(activity.activityDate)}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">
                      {activity.title}
                    </h3>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={15} />
                      {activity.locationName}
                    </p>
                    {activity.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {activity.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900">
              Join This Adventure
            </h2>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-teal-50 p-4">
              <Users size={25} className="text-teal-700" />
              <div>
                <p className="text-2xl font-extrabold text-teal-800">
                  {trip.availableSpots}
                </p>
                <p className="text-xs font-medium text-teal-700">
                  Spots available of {trip.maxParticipants}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Start Date</span>
                <span className="font-semibold text-slate-900">
                  {formatDate(trip.startDate)}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">End Date</span>
                <span className="font-semibold text-slate-900">
                  {formatDate(trip.endDate)}
                </span>
              </div>
            </div>

            
<div className="mt-7 space-y-4 border-t border-slate-100 pt-6">
  {registrationError && (
    <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
      {registrationError}
    </p>
  )}

  {registrationNotice && (
    <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
      {registrationNotice}
    </p>
  )}

  {!user ? (
    <Link
      to="/login"
      className="flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-4 font-semibold text-white hover:bg-teal-800"
    >
      Log In to Join
      <ArrowRight size={18} />
    </Link>
  ) : isOwnTrip ? (
    <p className="rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-600">
      You are the organizer of this trip.
    </p>
  ) : !canRegister ? (
    <p className="rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-600">
      Trip registration is not available for your account.
    </p>
  ) : registrationLoading ? (
    <p className="py-4 text-center text-sm text-slate-500">
      Loading your registration...
    </p>
  ) : hasActiveRegistration ? (
    <>
      <div className="rounded-xl bg-teal-50 p-4 text-center">
        <p className="font-bold text-teal-800">
          {registration?.status === 'ACCEPTED'
            ? 'Registration Accepted'
            : 'Pending Approval'}
        </p>
        <p className="mt-2 text-sm text-teal-700">
          {registration?.status === 'ACCEPTED'
            ? 'Your place on this trip is confirmed.'
            : 'Your registration is waiting for organizer approval.'}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void handleCancelRegistration()}
        disabled={registrationSaving}
        className="w-full rounded-xl border border-red-200 px-5 py-4 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {registrationSaving ? 'Please wait...' : 'Cancel Registration'}
      </button>
    </>
  ) : isFull ? (
    <p className="rounded-xl bg-red-50 p-4 text-center text-sm font-semibold text-red-700">
      This trip is fully booked.
    </p>
  ) : new Date(trip.startDate).getTime() <
      new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z').getTime() ? (
    <p className="rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-600">
      Registration for this trip is closed.
    </p>
  ) : (
    <>
      {registration?.status === 'CANCELLED' && (
        <p className="text-center text-sm text-slate-500">
          You cancelled your previous registration.
        </p>
      )}

      {registration?.status === 'REJECTED' && (
        <p className="text-center text-sm text-slate-500">
          Your previous registration was not accepted.
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleJoinTrip()}
        disabled={registrationSaving}
        className="w-full rounded-xl bg-teal-700 px-5 py-4 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {registrationSaving ? 'Submitting...' : 'Join Trip'}
      </button>
    </>
  )}
</div>

          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <UserRound size={23} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Your Trip Organizer
                </p>
                <p className="font-bold text-slate-900">
                  {trip.organizer.firstName}{' '}
                  {trip.organizer.lastName}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
