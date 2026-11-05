
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DestinationPicker from '../components/DestinationPicker'
import TripItineraryEditor from '../components/TripItineraryEditor'
import PlaceAutocomplete from '../components/PlaceAutocomplete'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Compass,
  ImagePlus,
  Loader2,
  Users,
} from 'lucide-react'
import {
  createTrip,
  getMyTripById,
  updateTrip,
  type DestinationSuggestion,
  type ActivityFormData,
  type PlaceSuggestion,
} from '../services/api'

const categories = [
  'City Break',
  'Nature',
  'Adventure',
  'Culture',
  'Beach',
  'Hiking',
  'Food & Drink',
  'Other',
]

const difficulties = ['Easy', 'Moderate', 'Challenging']

export default function CreateTripPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const [loadingTrip, setLoadingTrip] = useState(Boolean(id))
  const [loadedStatus, setLoadedStatus] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('10')
  const [meetingPlace, setMeetingPlace] = useState<PlaceSuggestion | null>(null)
  const [draftActivities, setDraftActivities] = useState<ActivityFormData[]>([])
  const [coverUrl, setCoverUrl] = useState('')

  const [selectedDestination, setSelectedDestination] =
    useState<DestinationSuggestion | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toLocaleDateString('en-CA')

  useEffect(() => {
    if (!id) return

    let active = true
    async function loadTrip() {
      try {
        const response = await getMyTripById(id!)
        if (!active) return
        const trip = response.data
        if (trip.status !== 'DRAFT' && trip.status !== 'REJECTED') {
          setError('Only draft or rejected trips can be edited.')
          return
        }
        setLoadedStatus(trip.status)
        setTitle(trip.title)
        setDescription(trip.description)
        setCategory(trip.category)
        setDifficulty(trip.difficulty)
        setStartDate(trip.startDate.slice(0, 10))
        setEndDate(trip.endDate.slice(0, 10))
        setMaxParticipants(String(trip.maxParticipants))
        // Existing trips store a meeting-point string only; retain that legacy value.
        setMeetingPlace({ placeId: '', name: trip.meetingPoint, displayName: trip.meetingPoint,
          city: trip.destination.name, country: trip.destination.country,
          latitude: trip.destination.latitude, longitude: trip.destination.longitude })
        setCoverUrl(trip.coverUrl ?? '')
        setSelectedDestination({
          externalPlaceId: trip.destination.externalPlaceId ?? '',
          name: trip.destination.name,
          country: trip.destination.country,
          displayName: `${trip.destination.name}, ${trip.destination.country}`,
          latitude: trip.destination.latitude,
          longitude: trip.destination.longitude,
        })
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load trip.')
      } finally {
        if (active) setLoadingTrip(false)
      }
    }
    void loadTrip()
    return () => { active = false }
  }, [id])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!selectedDestination) {
      setError('Please select a destination from the search results.')
      return
    }

    if (!meetingPlace) {
      setError('Please select a meeting point from the location suggestions.')
      return
    }

    if (draftActivities.some((a) => a.activityDate < startDate || a.activityDate > endDate)) {
      setError('Some itinerary activities are outside the selected trip dates.')
      return
    }

    if (endDate < startDate) {
      setError('End date cannot be before the start date.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        startDate,
        endDate,
        maxParticipants: Number(maxParticipants),
        meetingPoint: meetingPlace.displayName.trim(),
        ...(!id && { activities: draftActivities }),
        coverUrl: coverUrl.trim(),
        destination: {
          externalPlaceId: selectedDestination.externalPlaceId,
          name: selectedDestination.name,
          country: selectedDestination.country,
          latitude: selectedDestination.latitude,
          longitude: selectedDestination.longitude,
        },
      }

      if (id) {
        // Existing seeded destinations may have no externalPlaceId.
        // Preserve the current destination in that case rather than
        // sending an invalid empty identifier to the backend.
        if (!payload.destination.externalPlaceId) {
          const { destination: _destination, ...withoutDestination } = payload
          void _destination
          await updateTrip(id, withoutDestination)
        } else {
          await updateTrip(id, payload)
        }
      } else {
        await createTrip(payload)
      }

      navigate('/organizer', {
        replace: true,
        state: { message: id ? 'Trip updated successfully.' : 'Your trip was saved as a draft.' },
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create your trip.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100'

  const labelClass = 'block text-sm font-semibold text-slate-700'

  if (loadingTrip) {
    return <main className="min-h-screen bg-slate-50 px-6 py-24 text-center text-slate-500">Loading trip details...</main>
  }

  if (isEditing && !loadedStatus) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-24 text-center">
        <p className="mb-5 text-red-600">{error || 'Trip unavailable.'}</p>
        <Link to="/organizer" className="font-semibold text-teal-700">Back to Dashboard</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
        <Link
          to="/organizer"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-teal-700"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-9">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            <Compass size={16} />
            Organizer Workspace
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {isEditing ? 'Edit Trip' : 'Create a New Trip'}
          </h1>

          <p className="mt-3 text-slate-500">
            {isEditing
              ? 'Update your trip details and save your changes.'
              : 'Plan your next adventure. Add activities below, then save everything as a draft.'}
          </p>
        </div>

        <form id="trip-details-form" onSubmit={(event) => void handleSubmit(event)} className="space-y-7">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              1. Basic Information
            </h2>
            <p className="mb-6 mt-1 text-sm text-slate-500">
              Tell travelers what makes your trip special.
            </p>

            <div className="space-y-5">
              <label className={labelClass}>
                Trip Title *
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={150}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Barcelona Weekend Adventure"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Description *
                <textarea
                  required
                  minLength={20}
                  maxLength={5000}
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the experience, highlights and what travelers can expect..."
                  className={`${inputClass} resize-y`}
                />
                <span className="mt-1 block text-right text-xs font-normal text-slate-400">
                  {description.length} / 5000
                </span>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Category *
                  <select
                    required
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClass}>
                  Difficulty *
                  <select
                    required
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select difficulty</option>
                    {difficulties.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              2. Choose Your Destination
            </h2>
            <p className="mb-6 mt-2 text-sm text-slate-500">
              Find a real destination anywhere in the world.
              Select a location to preview it on the map.
            </p>
            <DestinationPicker
              value={selectedDestination}
              onChange={setSelectedDestination}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              3. Dates & Group Details
            </h2>
            <p className="mb-6 mt-1 text-sm text-slate-500">
              Choose when the trip takes place and how many people can join.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={17} className="text-teal-700" />
                  Start Date *
                </span>
                <input
                  type="date"
                  required
                  min={isEditing ? undefined : today}
                  value={startDate}
                  onChange={(event) => {
                    const value = event.target.value
                    setStartDate(value)
                    if (endDate && endDate < value) setEndDate('')
                  }}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                End Date *
                <input
                  type="date"
                  required
                  min={startDate || (isEditing ? undefined : today)}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                <span className="inline-flex items-center gap-2">
                  <Users size={17} className="text-teal-700" />
                  Maximum Participants *
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  max={1000}
                  step={1}
                  value={maxParticipants}
                  onChange={(event) => setMaxParticipants(event.target.value)}
                  className={inputClass}
                />
              </label>

              <PlaceAutocomplete
                label="Meeting Point"
                required
                value={meetingPlace}
                onChange={(place) => { setMeetingPlace(place) }}
                city={selectedDestination?.name}
                country={selectedDestination?.country}
                placeholder="Search for a station, landmark or address..."
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              4. Cover Photo
            </h2>
            <p className="mb-6 mt-1 text-sm text-slate-500">
              Add an image URL to give travelers a preview of your trip.
              You can leave this blank for now.
            </p>

            <label className={labelClass}>
              Image URL (optional)
              <input
                type="url"
                maxLength={2000}
                value={coverUrl}
                onChange={(event) => setCoverUrl(event.target.value)}
                placeholder="https://example.com/trip-photo.jpg"
                className={inputClass}
              />
            </label>

            {coverUrl.trim() && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={coverUrl.trim()}
                  alt="Trip cover preview"
                  className="h-56 w-full bg-slate-100 object-cover"
                />
              </div>
            )}

            {!coverUrl.trim() && (
              <div className="mt-4 flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                <ImagePlus size={30} />
                <span className="mt-2 text-sm">No cover photo selected</span>
              </div>
            )}
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

        </form>

          <div className="mt-7">
            <TripItineraryEditor
              tripId={id}
              startDate={startDate}
              endDate={endDate}
              city={selectedDestination?.name}
              country={selectedDestination?.country}
              draftActivities={draftActivities}
              onDraftActivitiesChange={setDraftActivities}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/organizer"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              form="trip-details-form"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} />
                  {isEditing ? 'Save Changes' : 'Save as Draft'}
                </>
              )}
            </button>
          </div>

      </div>
    </main>
  )
}
