
import { Link } from 'react-router-dom'
import { Compass, MapPin, ArrowRight, Search } from 'lucide-react'

export default function TripsPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-50">
      <section className="bg-slate-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
            Explore the World
          </span>

          <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
            Discover Your Next Adventure
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Explore exciting destinations and find the perfect
            adventure for you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              All Trips
            </h2>

            <p className="mt-2 text-slate-500">
              Explore available group adventures
            </p>
          </div>

          <span className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            <MapPin size={15} className="mr-1 inline" />
            Discover New Places
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
            <Compass size={38} />
          </div>

          <h3 className="mt-7 text-2xl font-bold text-slate-900">
            Exciting Trips Are Coming Soon
          </h3>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-500">
            We are preparing our trip listings. Soon you will be able
            to search by destination, date, category, and difficulty,
            and explore trip locations on an interactive map.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
              <Search size={17} />
              Search & Filters
            </span>

            <span className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
              <MapPin size={17} />
              Interactive Map
            </span>
          </div>

          <Link
            to="/"
            className="mt-9 inline-flex items-center gap-2 font-semibold text-teal-700 hover:text-teal-900"
          >
            Back to Home <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  )
}
