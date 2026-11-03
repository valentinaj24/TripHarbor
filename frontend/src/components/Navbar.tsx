
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Compass, Menu, X, ArrowUpRight } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/trips', label: 'Explore Trips' },
  ]

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
          {[
            ...links,
            { to: '/login', label: 'Log In' },
            { to: '/register', label: 'Sign Up' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-teal-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
