
import { useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ChevronDown,
  ClipboardCheck,
  Compass,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  UserCheck,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  {
    label: 'Overview',
    to: '/admin',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Trip Approvals',
    to: '/admin/trips/pending',
    icon: ClipboardCheck,
  },
  {
    label: 'Organizer Requests',
    to: '/admin/organizers',
    icon: UserCheck,
  },
  {
    label: 'All Trips',
    to: '/admin/trips',
    icon: Map,
  },
  {
    label: 'Users',
    to: '/admin/users',
    icon: Users,
  },
  {
    label: 'Analytics',
    to: '/admin/analytics',
    icon: BarChart3,
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  function handleLogout() {
    signOut()
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600">
          <Compass size={25} />
        </div>

        <div>
          <p className="text-xl font-extrabold tracking-tight">
            Trip<span className="text-teal-400">Harbor</span>
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Administration
          </p>
        </div>
      </div>

      <div className="px-4 pt-8">
        <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Main Menu
        </p>

        <nav className="space-y-1.5">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end ?? true}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/20'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto space-y-3 border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 font-bold">
            {user?.firstName?.charAt(0) ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400">
              Administrator
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
              aria-label="Open admin navigation"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
                Administration
              </p>
              <p className="text-sm font-medium text-slate-500">
                Manage your platform
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">
                {user?.firstName?.charAt(0) ?? 'A'}
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-bold text-slate-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500">
                  Administrator
                </p>
              </div>

              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-14 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <p className="border-b border-slate-100 px-3 py-3 text-xs text-slate-500">
                  {user?.email}
                </p>

                <Link
                  to="/"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Compass size={17} />
                  View Website
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="min-h-[calc(100vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  )
}
