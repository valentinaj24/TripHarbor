
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Compass,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import {
  getMyOrganizerRequests,
  submitOrganizerRequest,
  type OrganizerRequest,
} from '../services/api'

export default function BecomeOrganizerPage() {
  const [motivation, setMotivation] = useState('')
  const [experience, setExperience] = useState('')
  const [requests, setRequests] = useState<OrganizerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    async function loadRequests() {
      try {
        const response = await getMyOrganizerRequests()

        if (active) {
          setRequests(response.data)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load your organizer requests.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadRequests()

    return () => {
      active = false
    }
  }, [])

  const pendingRequest = requests.find(
    (request) => request.status === 'PENDING'
  )

  const latestRequest = requests[0]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting || pendingRequest) return

    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const response = await submitOrganizerRequest({
        motivation: motivation.trim(),
        experience: experience.trim(),
      })

      setRequests((current) => [response.data, ...current])
      setMotivation('')
      setExperience('')
      setSuccess(response.message)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit your organizer request.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/profile"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          <ArrowLeft size={17} />
          Back to Profile
        </Link>

        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            <Compass size={17} />
            TripHarbor Organizers
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Become an Organizer
          </h1>

          <p className="mt-4 leading-relaxed text-slate-500">
            Share your passion for travel, create memorable
            adventures, and bring people together. Tell us why
            you would like to become a TripHarbor organizer.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={20} className="shrink-0" />
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            Loading your application...
          </div>
        ) : (
          <>
            {pendingRequest && (
              <div className="mb-7 rounded-3xl border border-amber-200 bg-amber-50 p-7">
                <div className="flex items-start gap-3">
                  <Clock3
                    size={25}
                    className="mt-1 shrink-0 text-amber-700"
                  />

                  <div>
                    <h2 className="text-xl font-bold text-amber-900">
                      Application Under Review
                    </h2>

                    <p className="mt-2 leading-relaxed text-amber-800">
                      Your application has been submitted successfully.
                      Our administrators will review it. You cannot
                      submit another application while this one is pending.
                    </p>

                    <p className="mt-3 text-sm text-amber-700">
                      Submitted on{' '}
                      {new Date(
                        pendingRequest.createdAt
                      ).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!pendingRequest &&
              latestRequest?.status === 'REJECTED' && (
                <div className="mb-7 rounded-3xl border border-red-200 bg-red-50 p-7">
                  <div className="flex items-start gap-3">
                    <XCircle
                      size={25}
                      className="mt-1 shrink-0 text-red-700"
                    />

                    <div>
                      <h2 className="text-xl font-bold text-red-900">
                        Previous Application Rejected
                      </h2>

                      <p className="mt-2 text-red-800">
                        Your previous application was not approved.
                        You can review the feedback and submit a
                        new application.
                      </p>

                      {latestRequest.rejectionReason && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-white p-4">
                          <p className="text-sm font-bold text-red-900">
                            Administrator Feedback
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm text-red-800">
                            {latestRequest.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {!pendingRequest &&
              latestRequest?.status === 'APPROVED' && (
                <div className="mb-7 rounded-3xl border border-emerald-200 bg-emerald-50 p-7">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={25}
                      className="mt-1 shrink-0 text-emerald-700"
                    />

                    <div>
                      <h2 className="text-xl font-bold text-emerald-900">
                        Application Approved
                      </h2>

                      <p className="mt-2 text-emerald-800">
                        Your organizer application has been approved.
                        Your account now has organizer privileges.
                      </p>

                      <Link
                        to="/organizer"
                        className="mt-4 inline-flex items-center gap-2 font-bold text-emerald-800 hover:text-emerald-950"
                      >
                        Go to Organizer Dashboard
                        <ArrowRight size={17} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

            {!pendingRequest &&
              latestRequest?.status !== 'APPROVED' && (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-7 sm:p-9">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Organizer Application
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Complete the form below to apply for an
                      organizer account.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-7 p-7 sm:p-9"
                  >
                    <div>
                      <label
                        htmlFor="motivation"
                        className="mb-2 block font-semibold text-slate-800"
                      >
                        Why do you want to become an organizer?
                      </label>

                      <p className="mb-3 text-sm text-slate-500">
                        Tell us what motivates you to plan trips
                        and connect with other travelers.
                      </p>

                      <textarea
                        id="motivation"
                        value={motivation}
                        onChange={(event) =>
                          setMotivation(event.target.value)
                        }
                        minLength={20}
                        maxLength={2000}
                        rows={5}
                        required
                        placeholder="I would love to become an organizer because..."
                        className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-teal-500"
                      />

                      <p className="mt-2 text-right text-xs text-slate-400">
                        {motivation.length}/2000
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="experience"
                        className="mb-2 block font-semibold text-slate-800"
                      >
                        What experience do you have?
                      </label>

                      <p className="mb-3 text-sm text-slate-500">
                        Describe your experience with travel,
                        trip planning, or organizing group activities.
                      </p>

                      <textarea
                        id="experience"
                        value={experience}
                        onChange={(event) =>
                          setExperience(event.target.value)
                        }
                        minLength={20}
                        maxLength={2000}
                        rows={5}
                        required
                        placeholder="My experience with travel and planning includes..."
                        className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-teal-500"
                      />

                      <p className="mt-2 text-right text-xs text-slate-400">
                        {experience.length}/2000
                      </p>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                      <ShieldCheck
                        size={20}
                        className="mt-0.5 shrink-0 text-teal-700"
                      />

                      <p className="text-sm leading-relaxed text-slate-600">
                        Your application will be reviewed by a
                        TripHarbor administrator. If approved,
                        you will be able to create and manage trips.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send size={18} />
                      {submitting
                        ? 'Submitting Application...'
                        : 'Submit Application'}
                    </button>
                  </form>
                </div>
              )}
          </>
        )}
      </div>
    </main>
  )
}
