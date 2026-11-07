import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  UserCheck,
  XCircle,
} from 'lucide-react'
import {
  getAdminOrganizerRequests,
  reviewAdminOrganizerRequest,
  type AdminOrganizerRequest,
  type OrganizerRequestStatus,
} from '../services/api'

type Filter = 'ALL' | OrganizerRequestStatus
type Decision = 'APPROVE' | 'REJECT'

const statusStyles: Record<OrganizerRequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-700',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(value))
}

export default function AdminOrganizerRequestsPage() {
  const [requests, setRequests] = useState<AdminOrganizerRequest[]>([])
  const [filter, setFilter] = useState<Filter>('PENDING')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<AdminOrganizerRequest | null>(null)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getAdminOrganizerRequests()
      setRequests(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load organizer requests.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadRequests() }, [loadRequests])

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase()
    return requests.filter((request) => {
      if (filter !== 'ALL' && request.status !== filter) return false
      const haystack = `${request.user.firstName} ${request.user.lastName} ${request.user.email} ${request.motivation} ${request.experience}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [requests, filter, search])

  const pendingCount = requests.filter((request) => request.status === 'PENDING').length

  function openRequest(request: AdminOrganizerRequest) {
    setSelected(request)
    setDecision(null)
    setReason('')
    setError('')
    setSuccess('')
  }

  function closeRequest() {
    setSelected(null)
    setDecision(null)
    setReason('')
    setError('')
  }

  async function handleReview() {
    if (!selected || !decision || submitting) return
    if (decision === 'REJECT' && !reason.trim()) {
      setError('Please provide a reason for rejection.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const response = await reviewAdminOrganizerRequest(
        selected.id,
        decision,
        decision === 'REJECT' ? reason.trim() : undefined
      )
      setSuccess(response.message)
      setSelected(null)
      setDecision(null)
      setReason('')
      await loadRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to review this application.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">User Management</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Organizer Requests</h1>
          <p className="mt-3 text-slate-500">Review applications from travelers who want to organize trips.</p>
        </div>
        <button type="button" onClick={() => void loadRequests()} disabled={loading || submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {success && <div role="status" className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"><CheckCircle2 size={20} />{success}</div>}
      {error && <div role="alert" className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={20} />{error}</div>}

      {!selected ? (
        <>
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 p-3 text-amber-700"><Clock3 size={23} /></div>
                <div><p className="text-2xl font-extrabold text-slate-900">{pendingCount}</p><p className="text-sm text-slate-500">Applications awaiting review</p></div>
              </div>
              <div className="relative w-full sm:max-w-sm">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applicants..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              {(['PENDING', 'ALL', 'APPROVED', 'REJECTED'] as Filter[]).map((item) => (
                <button key={item} type="button" onClick={() => setFilter(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === item ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {item === 'ALL' ? 'All Requests' : item.charAt(0) + item.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center text-slate-500">Loading organizer requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
              <UserCheck size={46} className="mx-auto mb-5 text-teal-600" />
              <h2 className="text-xl font-bold text-slate-900">No matching applications</h2>
              <p className="mt-2 text-slate-500">Try another filter or check back later.</p>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredRequests.map((request) => (
                <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">{request.user.firstName.charAt(0)}{request.user.lastName.charAt(0)}</div>
                      <div className="min-w-0"><h2 className="font-extrabold text-slate-900">{request.user.firstName} {request.user.lastName}</h2><p className="break-all text-sm text-slate-500">{request.user.email}</p></div>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[request.status]}`}>{request.status}</span>
                  </div>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">{request.motivation}</p>
                  <p className="mt-4 text-xs text-slate-400">Submitted {formatDate(request.createdAt)}</p>
                  <button type="button" onClick={() => openRequest(request)}
                    className="mt-5 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800">Review Application</button>
                </article>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <button type="button" onClick={closeRequest} disabled={submitting}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700 disabled:opacity-50"><ArrowLeft size={18} /> Back to organizer requests</button>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-extrabold text-slate-900">{selected.user.firstName} {selected.user.lastName}</h2>
              <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[selected.status]}`}>{selected.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{selected.user.email} · Submitted {formatDate(selected.createdAt)}</p>
            <div className="mt-8 border-t border-slate-100 pt-7"><h3 className="text-lg font-bold text-slate-900">Motivation</h3><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{selected.motivation}</p></div>
            <div className="mt-7 border-t border-slate-100 pt-7"><h3 className="text-lg font-bold text-slate-900">Experience</h3><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{selected.experience}</p></div>

            {selected.status === 'REJECTED' && selected.rejectionReason && (
              <div className="mt-7 rounded-xl border border-red-200 bg-red-50 p-5"><h3 className="font-bold text-red-900">Rejection Reason</h3><p className="mt-2 whitespace-pre-wrap text-sm text-red-800">{selected.rejectionReason}</p></div>
            )}
            {selected.status !== 'PENDING' && selected.reviewedAt && (
              <p className="mt-6 text-sm text-slate-500">Reviewed {formatDate(selected.reviewedAt)}{selected.reviewedBy ? ` by ${selected.reviewedBy.firstName} ${selected.reviewedBy.lastName}` : ''}</p>
            )}

            {selected.status === 'PENDING' && (
              <>
                <div className="mt-9 flex flex-wrap gap-3 border-t border-slate-100 pt-7">
                  <button type="button" disabled={submitting} onClick={() => { setDecision('APPROVE'); setError('') }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"><CheckCircle2 size={19} /> Approve Application</button>
                  <button type="button" disabled={submitting} onClick={() => { setDecision('REJECT'); setError('') }}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"><XCircle size={19} /> Reject Application</button>
                </div>
                {decision && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <h3 className="text-lg font-bold text-slate-900">{decision === 'APPROVE' ? 'Confirm Organizer Approval' : 'Reject This Application'}</h3>
                    <p className="mt-2 text-sm text-slate-600">{decision === 'APPROVE' ? 'This user will receive organizer privileges.' : 'Explain why this application was not approved.'}</p>
                    {decision === 'REJECT' && (
                      <div className="mt-5"><label htmlFor="organizer-rejection-reason" className="mb-2 block text-sm font-semibold text-slate-700">Rejection Reason</label>
                        <textarea id="organizer-rejection-reason" rows={4} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain what the applicant should improve..."
                          className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-teal-500" /></div>
                    )}
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button type="button" onClick={() => void handleReview()} disabled={submitting || (decision === 'REJECT' && !reason.trim())}
                        className={`rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-50 ${decision === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                        {submitting ? 'Processing...' : decision === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
                      </button>
                      <button type="button" onClick={() => { setDecision(null); setReason('') }} disabled={submitting}
                        className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
