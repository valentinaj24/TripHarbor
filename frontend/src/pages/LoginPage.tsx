
import { Link } from 'react-router-dom'
import { Compass, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  return (
    <main className="grid min-h-[calc(100vh-80px)] lg:grid-cols-2">
      <div className="flex items-center justify-center bg-white px-6 py-16 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <Compass size={29} />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Welcome Back!
          </h1>

          <p className="mt-3 text-slate-500">
            Log in to continue your next adventure.
          </p>

          <form
            className="mt-10 space-y-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-4 font-bold text-white opacity-60"
              title="Login will be available after authentication is implemented."
            >
              Log In <ArrowRight size={19} />
            </button>

            <p className="text-center text-xs text-slate-400">
              Login will be available once user accounts are enabled.
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-teal-700 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-slate-900 lg:block">
        <img
          src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85"
          alt="Beautiful landscape"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />

        <div className="absolute bottom-16 left-12 right-12 text-white">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
            TripHarbor
          </p>

          <h2 className="max-w-lg text-4xl font-extrabold leading-tight">
            The Best Stories Begin with a Single Step.
          </h2>

          <p className="mt-4 text-lg text-slate-200">
            Discover places, people, and experiences you will
            never forget.
          </p>
        </div>
      </div>
    </main>
  )
}
