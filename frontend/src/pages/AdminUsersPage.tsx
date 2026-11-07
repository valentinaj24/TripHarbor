
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react'
import {
  getAdminUsers,
  updateAdminUserStatus,
  type AdminUser,
} from '../services/api'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAdminUsers()
      setUsers(response.data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load users.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesRole =
        role === 'ALL' || user.role === role

      const matchesStatus =
        status === 'ALL' || user.accountStatus === status

      const matchesSearch =
        `${user.firstName} ${user.lastName} ${user.email}`
          .toLowerCase()
          .includes(query)

      return matchesRole && matchesStatus && matchesSearch
    })
  }, [users, role, status, search])

  async function toggle(user: AdminUser) {
    if (busyId) return

    const next =
      user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'

    const action = next === 'SUSPENDED' ? 'Suspend' : 'Activate'

    if (
      !window.confirm(
        `${action} ${user.firstName} ${user.lastName}?`
      )
    ) {
      return
    }

    setBusyId(user.id)
    setError('')
    setNotice('')

    try {
      const response = await updateAdminUserStatus(user.id, next)

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? {
                ...item,
                accountStatus: response.data.accountStatus,
              }
            : item
        )
      )

      setNotice(response.message)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update account.'
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            User Management
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Users
          </h1>

          <p className="mt-3 text-slate-500">
            Manage registered travelers and organizers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh Data
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="mb-5 rounded-xl bg-emerald-50 p-4 text-emerald-800"
        >
          {notice}
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap gap-3">
          <label className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-4 py-3">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
              aria-label="Search users"
              className="w-full outline-none"
            />
          </label>

          <select
            aria-label="Filter by role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <option value="ALL">All Roles</option>
            <option value="PARTICIPANT">Participant</option>
            <option value="ORGANIZER">Organizer</option>
            <option value="ADMIN">Administrator</option>
          </select>

          <select
            aria-label="Filter by account status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <p className="mb-4 text-sm text-slate-500">
          {filtered.length} of {users.length} users
        </p>

        {loading ? (
          <p className="py-14 text-center text-slate-500">
            Loading users...
          </p>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center text-slate-500">
            <Users className="mx-auto mb-3" />
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {[
                    'User',
                    'Role',
                    'Status',
                    'Trips',
                    'Registrations',
                    'Joined',
                    'Action',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-4 font-semibold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {user.email}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {user.role}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          user.accountStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {user.accountStatus}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {user.tripCount}
                    </td>

                    <td className="px-4 py-4">
                      {user.registrationCount}
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString('en-US')}
                    </td>

                    <td className="px-4 py-4">
                      {user.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <ShieldAlert size={14} />
                          Protected
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() => void toggle(user)}
                          className={`rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50 ${
                            user.accountStatus === 'ACTIVE'
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                          }`}
                        >
                          {busyId === user.id
                            ? 'Saving...'
                            : user.accountStatus === 'ACTIVE'
                              ? 'Suspend'
                              : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
