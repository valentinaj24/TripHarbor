import { useEffect, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, CalendarDays, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import PlaceAutocomplete from './PlaceAutocomplete'
import {
  getTripActivities,
  createTripActivity,
  updateTripActivity,
  deleteTripActivity,
  reorderTripActivities,
  type ActivityFormData,
  type TripItineraryActivity,
  type PlaceSuggestion,
} from '../services/api'

type Props = {
  tripId?: string
  startDate: string
  endDate: string
  city?: string
  country?: string
  draftActivities?: ActivityFormData[]
  onDraftActivitiesChange?: (activities: ActivityFormData[]) => void
}

type FormState = {
  title: string
  description: string
  activityDate: string
  startTime: string
  place: PlaceSuggestion | null
}

type Item = { data: ActivityFormData; id?: string; index: number }

function emptyForm(date: string): FormState {
  return { title: '', description: '', activityDate: date, startTime: '', place: null }
}

function dateOnly(date: string): string {
  return date.slice(0, 10)
}

function sortItems(items: Item[]): Item[] {
  return [...items].sort((a, b) =>
    dateOnly(a.data.activityDate).localeCompare(dateOnly(b.data.activityDate)) ||
    a.data.sortOrder - b.data.sortOrder ||
    a.index - b.index
  )
}

function renumber(items: ActivityFormData[]): ActivityFormData[] {
  const counts = new Map<string, number>()
  return items.map((activity) => {
    const day = dateOnly(activity.activityDate)
    const order = (counts.get(day) ?? 0) + 1
    counts.set(day, order)
    return { ...activity, sortOrder: order }
  })
}

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
const labelClass = 'block text-sm font-semibold text-slate-700'

export default function TripItineraryEditor({
  tripId,
  startDate,
  endDate,
  city,
  country,
  draftActivities = [],
  onDraftActivitiesChange,
}: Props) {
  const [savedActivities, setSavedActivities] = useState<TripItineraryActivity[]>([])
  const [loading, setLoading] = useState(Boolean(tripId))
  const [saving, setSaving] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(() => emptyForm(startDate))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!tripId) {
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    getTripActivities(tripId)
      .then((result) => { if (active) setSavedActivities(result.data) })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load activities.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [tripId])

  const activities: Item[] = tripId
    ? savedActivities.map((data, index) => ({ data, id: data.id, index }))
    : draftActivities.map((data, index) => ({ data, index }))
  const ordered = sortItems(activities)
  const dates = [...new Set(ordered.map((item) => dateOnly(item.data.activityDate)))]

  function startAdding() {
    setEditingIndex(null)
    setEditingId(null)
    setForm(emptyForm(startDate))
    setError('')
    setNotice('')
    setShowForm(true)
  }

  function startEditing(activity: ActivityFormData, index: number, id?: string) {
    setEditingIndex(index)
    setEditingId(id ?? null)
    setForm({
      title: activity.title,
      description: activity.description ?? '',
      activityDate: dateOnly(activity.activityDate),
      startTime: activity.startTime ?? '',
      place: activity.latitude != null && activity.longitude != null
        ? {
            placeId: '',
            name: activity.locationName,
            displayName: activity.locationName,
            city: city ?? '',
            country: country ?? '',
            latitude: activity.latitude,
            longitude: activity.longitude,
          }
        : null,
    })
    setError('')
    setNotice('')
    setShowForm(true)
  }

  async function refreshSavedActivities() {
    if (!tripId) return
    const response = await getTripActivities(tripId)
    setSavedActivities(response.data)
  }

  async function saveActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!startDate || !endDate) {
      setError('Choose the trip start and end dates first.')
      return
    }
    if (form.activityDate < startDate || form.activityDate > endDate) {
      setError('Activity date must be within the trip dates.')
      return
    }
    if (!form.place) {
      setError('Please select an activity location from the search suggestions.')
      return
    }

    const current = editingId
      ? savedActivities.find((activity) => activity.id === editingId)
      : editingIndex !== null ? draftActivities[editingIndex] : undefined
    const sameDay = current && dateOnly(current.activityDate) === form.activityDate
    const maxOrder = ordered
      .filter((item) => dateOnly(item.data.activityDate) === form.activityDate)
      .reduce((max, item) => Math.max(max, item.data.sortOrder), 0)

    const payload: ActivityFormData = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      activityDate: form.activityDate,
      startTime: form.startTime || null,
      locationName: form.place.displayName,
      latitude: form.place.latitude,
      longitude: form.place.longitude,
      sortOrder: sameDay ? current.sortOrder : maxOrder + 1,
    }

    setSaving(true)
    try {
      if (!tripId) {
        if (!onDraftActivitiesChange) throw new Error('Draft itinerary is not configured.')
        const next = editingIndex === null
          ? [...draftActivities, payload]
          : draftActivities.map((activity, index) => index === editingIndex ? payload : activity)
        const normalized = renumber(sortItems(next.map((data, index) => ({ data, index }))).map((item) => item.data))
        onDraftActivitiesChange(normalized)
      } else if (editingId) {
        await updateTripActivity(tripId, editingId, payload)
        await refreshSavedActivities()
      } else {
        await createTripActivity(tripId, payload)
        await refreshSavedActivities()
      }
      setNotice(current ? 'Activity updated.' : 'Activity added.')
      setShowForm(false)
      setEditingIndex(null)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save activity.')
    } finally {
      setSaving(false)
    }
  }

  async function removeActivity(item: Item) {
    if (!window.confirm(`Delete activity "${item.data.title}"?`)) return
    setError('')
    setNotice('')
    setSaving(true)
    try {
      if (!tripId) {
        if (!onDraftActivitiesChange) throw new Error('Draft itinerary is not configured.')
        const next = ordered.filter((candidate) => candidate.index !== item.index)
        onDraftActivitiesChange(renumber(next.map((candidate) => candidate.data)))
      } else {
        if (!item.id) throw new Error('Missing activity ID.')
        await deleteTripActivity(tripId, item.id)
        await refreshSavedActivities()
      }
      setNotice('Activity deleted.')
      setShowForm(false)
      setEditingIndex(null)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete activity.')
    } finally {
      setSaving(false)
    }
  }

  async function moveActivity(index: number, direction: -1 | 1) {
    if (saving || loading) return
    const first = ordered[index]
    const second = ordered[index + direction]
    if (!first || !second || dateOnly(first.data.activityDate) !== dateOnly(second.data.activityDate)) return

    setError('')
    setNotice('')
    setSaving(true)
    try {
      const next = [...ordered]
      ;[next[index], next[index + direction]] = [next[index + direction], next[index]]

      if (tripId) {
        const ids = next.map((item) => item.id)
        if (ids.some((id) => !id)) throw new Error('Missing activity ID.')
        const response = await reorderTripActivities(tripId, ids as string[])
        setSavedActivities(response.data)
      } else {
        if (!onDraftActivitiesChange) throw new Error('Draft itinerary is not configured.')
        onDraftActivitiesChange(renumber(next.map((item) => item.data)))
      }
      setNotice('Activity order updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder activities.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">5. Trip Itinerary</h2>
          <p className="mt-1 text-sm text-slate-500">Organize activities by day and change their order using the arrows.</p>
        </div>
        <button type="button" onClick={startAdding} disabled={saving || loading || !startDate || !endDate} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
          <Plus size={17} /> Add Activity
        </button>
      </div>

      {(!startDate || !endDate) && <p className="mt-4 text-sm text-amber-700">Select the trip dates before adding activities.</p>}
      {!tripId && <p className="mt-3 text-sm text-slate-500">Activities will be saved together with your trip when you click Save as Draft.</p>}
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

      {showForm && (
        <form id="trip-activity-form" onSubmit={(event) => void saveActivity(event)} className="mt-6 space-y-4 rounded-xl border border-teal-100 bg-teal-50/40 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">{editingIndex !== null || editingId ? 'Edit Activity' : 'New Activity'}</h3>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close activity form" className="text-slate-500"><X size={19} /></button>
          </div>
          <label className={labelClass}>Activity Title *
            <input required minLength={3} maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="e.g. Explore Gothic Quarter" />
          </label>
          <label className={labelClass}>Description
            <textarea maxLength={2000} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} placeholder="What will participants do?" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>Date *
              <input type="date" required min={startDate} max={endDate} value={form.activityDate} onChange={(event) => setForm({ ...form, activityDate: event.target.value })} className={inputClass} />
            </label>
            <label className={labelClass}>Start Time
              <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} className={inputClass} />
            </label>
            <PlaceAutocomplete label="Activity Location" required value={form.place} onChange={(place) => setForm((current) => ({ ...current, place }))} city={city} country={country} placeholder="Search for a landmark or address..." />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editingIndex !== null || editingId ? 'Save Activity' : 'Add Activity'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">Loading activities...</div>
      ) : ordered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-slate-500">
          <CalendarDays size={30} className="mx-auto mb-3 text-teal-500" />
          No activities yet. Add your first activity.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {dates.map((date) => {
            const dayItems = ordered.filter((item) => dateOnly(item.data.activityDate) === date)
            return (
              <div key={date}>
                <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                  <CalendarDays size={18} className="text-teal-700" />
                  Day {Math.round((Date.parse(date) - Date.parse(startDate)) / 86400000) + 1} ·{' '}
                  {new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                </h3>
                <div className="space-y-3 border-l-2 border-teal-100 pl-4">
                  {dayItems.map((item, position) => {
                    const globalIndex = ordered.indexOf(item)
                    return (
                      <div key={item.id ?? item.index} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                              {item.data.startTime || 'Time not set'} · Order {position + 1}
                            </p>
                            <h4 className="mt-1 font-bold text-slate-900">{item.data.title}</h4>
                            <p className="mt-1 text-sm text-slate-600">{item.data.locationName}</p>
                            {item.data.description && <p className="mt-2 text-sm text-slate-500">{item.data.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button type="button" disabled={saving || showForm || position === 0} onClick={() => void moveActivity(globalIndex, -1)} aria-label={`Move ${item.data.title} up`} title="Move up" className="rounded-lg border border-slate-200 p-2 text-teal-700 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-30"><ArrowUp size={17} /></button>
                            <button type="button" disabled={saving || showForm || position === dayItems.length - 1} onClick={() => void moveActivity(globalIndex, 1)} aria-label={`Move ${item.data.title} down`} title="Move down" className="rounded-lg border border-slate-200 p-2 text-teal-700 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-30"><ArrowDown size={17} /></button>
                            <button type="button" onClick={() => startEditing(item.data, item.index, item.id)} disabled={saving || showForm} aria-label={`Edit ${item.data.title}`} className="rounded-lg border border-slate-200 p-2 text-teal-700 hover:bg-teal-50 disabled:opacity-30"><Pencil size={17} /></button>
                            <button type="button" onClick={() => void removeActivity(item)} disabled={saving || showForm} aria-label={`Delete ${item.data.title}`} className="rounded-lg border border-slate-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-30"><Trash2 size={17} /></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
