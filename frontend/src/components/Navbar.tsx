
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Compass,
  Menu,
  X,
  ArrowUpRight,
  LogOut,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = useNavigate()
  const { user, signOut, loading } = useAuth()

const links = [
  { to: '/', label: 'Home' },
  { to: '/trips', label: 'Explore Trips' },

  ...(user
    ? [{ to: '/my-trips', label: 'My Trips' }]
    : []),

  ...(user?.role === 'ORGANIZER'
    ? [{ to: '/organizer', label: 'Dashboard' }]
    : []),

  ...(user?.role === 'ADMIN'
    ? [{ to: '/admin', label: 'Admin Dashboard' }]
    : []),
]

  function handleLogout() {
    signOut()
    setMenuOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setMenuOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white">
            <Compass size={23} strokeWidth={2.2} />
          </div>

          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Trip<span className="text-teal-700">Harbor</span>
          </span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-semibold transition ${
                  isActive
                    ? 'text-teal-700'
                    : 'text-slate-600 hover:text-teal-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          {loading ? null : user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
                >
                <UserRound size={18} />
                <span>{user.firstName}</span>
                </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={17} />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-teal-700"
              >
                Log In
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
              >
                Sign Up <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {menuOpen && (
        <div className="space-y-1 border-t border-slate-100 bg-white px-5 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-teal-50"
            >
              {link.label}
            </Link>
          ))}

          {loading ? null : user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-3 text-sm font-semibold text-teal-800"
                >
                <UserRound size={18} />
                <span>
                    {user.firstName} {user.lastName}
                </span>
                </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-teal-50"
              >
                Log In
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg bg-teal-700 px-3 py-3 text-sm font-semibold text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
