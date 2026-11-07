
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
  ArrowRight,
  Compass,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from '../services/api'

export default function ProfilePage() {
  const { updateUser } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const response = await getMyProfile()

        if (active) {
          setProfile(response.user)
          setFirstName(response.user.firstName)
          setLastName(response.user.lastName)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Unable to load profile.'
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

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving) return

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const response = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })

      setProfile(response.user)
      setFirstName(response.user.firstName)
      setLastName(response.user.lastName)
      updateUser(response.user)
      setSuccess(response.message)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-9">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
            Account Settings
          </p>

          <h1 className="mt-3 text-4xl font-extrabold text-slate-900">
            My Profile
          </h1>

          <p className="mt-3 text-slate-500">
            Manage your personal information and account details.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
          >
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-14 text-center text-slate-500">
            Loading profile...
          </div>
        ) : profile ? (
          <>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-teal-800 to-teal-600 p-8 text-white">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-extrabold">
                    {profile.firstName.charAt(0)}
                    {profile.lastName.charAt(0)}
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold">
                      {profile.firstName} {profile.lastName}
                    </h2>

                    <p className="mt-1 text-teal-100">
                      {profile.role === 'PARTICIPANT'
                        ? 'Traveler'
                        : profile.role === 'ORGANIZER'
                          ? 'Organizer'
                          : 'Administrator'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-7 sm:p-9">
                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <Mail size={20} className="text-teal-700" />

                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="break-all font-semibold text-slate-800">
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <CalendarDays size={20} className="text-teal-700" />

                    <div>
                      <p className="text-xs text-slate-500">Member Since</p>
                      <p className="font-semibold text-slate-800">
                        {new Date(profile.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex items-center gap-2">
                  <UserRound size={21} className="text-teal-700" />
                  <h3 className="text-xl font-bold text-slate-900">
                    Personal Information
                  </h3>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        First Name
                      </label>

                      <input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        minLength={2}
                        maxLength={100}
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Last Name
                      </label>

                      <input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        minLength={2}
                        maxLength={100}
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
                    <p className="flex items-center gap-2 text-sm text-slate-500">
                      <ShieldCheck size={17} className="text-teal-700" />
                      Your account information is protected.
                    </p>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                      <Save size={18} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>

                <div className="mt-9 border-t border-slate-100 pt-7">
                  <Link
                    to="/my-trips"
                    className="inline-flex items-center gap-2 font-bold text-teal-700 hover:text-teal-900"
                  >
                    View My Trips <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>

            {profile.role === 'PARTICIPANT' && (
              <div className="mt-6 rounded-3xl border border-teal-100 bg-white p-7 shadow-sm sm:p-9">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <Compass size={28} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-extrabold text-slate-900">
                      Become an Organizer
                    </h2>

                    <p className="mt-3 max-w-xl leading-relaxed text-slate-500">
                      Passionate about travel and planning adventures?
                      Become a TripHarbor organizer, create your own
                      trips, and bring travelers together.
                    </p>

                    <Link
                      to="/become-organizer"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800"
                    >
                      Apply to Become an Organizer
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  )
}
