
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  MapPin,
  Compass,
  Users,
  CalendarDays,
  Search,
  Map,
  Heart,
  ArrowUpRight,
} from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Discover New Places',
    description:
      'Find trips based on destination, date, category, and difficulty level.',
  },
  {
    icon: Map,
    title: 'Explore the Map',
    description:
      'Discover trip destinations and explore their locations on an interactive map.',
  },
  {
    icon: Users,
    title: 'Travel Together',
    description:
      'Join group adventures, meet new people, and create unforgettable memories.',
  },
]

export default function HomePage() {
  return (
    <main>
      <section className="relative flex min-h-[610px] items-center overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85"
          alt="Beautiful mountain landscape"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/15" />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <Compass size={16} className="text-teal-300" />
              Your next adventure starts here
            </span>

            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Discover the World.
              <br />
              <span className="text-teal-300">Make Memories.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-200">
              Explore breathtaking destinations, discover exciting group
              trips, and experience unforgettable moments with people
              who share your passion for travel.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/trips"
                className="inline-flex items-center gap-3 rounded-xl bg-teal-500 px-7 py-4 font-bold text-white shadow-lg shadow-teal-950/20 transition hover:bg-teal-600"
              >
                Explore Trips <ArrowRight size={19} />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Join Us <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-300 to-transparent" />
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
              Why TripHarbor?
            </span>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything for Your Next Adventure
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-500">
              From the first idea to an unforgettable experience.
              Everything in one place.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-8 transition hover:-translate-y-1 hover:border-teal-100 hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  <Icon size={27} />
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-8">
          <div className="overflow-hidden rounded-3xl shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1100&q=85"
              alt="Nature and travel"
              className="h-[420px] w-full object-cover"
            />
          </div>

          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
              Travel Your Way
            </span>

            <h2 className="mt-4 text-4xl font-extrabold leading-tight text-slate-900">
              More Than Just a Trip.
              <br />
              <span className="text-teal-700">
                An Experience to Remember.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              TripHarbor connects travel enthusiasts and group trip
              organizers. Discover exciting destinations, explore
              detailed itineraries, and join your next adventure.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: MapPin,
                  text: 'Amazing destinations and different trip categories',
                },
                {
                  icon: CalendarDays,
                  text: 'Well-organized itineraries and activities',
                },
                {
                  icon: Heart,
                  text: 'Shared experiences and new friendships',
                },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                    <Icon size={18} />
                  </div>
                  <span className="font-medium text-slate-700">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <Link
              to="/trips"
              className="mt-9 inline-flex items-center gap-2 font-bold text-teal-700 hover:text-teal-900"
            >
              Discover Trips <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-teal-800 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready for Your Next Adventure?
          </h2>

          <p className="mt-5 text-lg text-teal-100">
            Start exploring amazing trips and discover your next
            destination.
          </p>

          <Link
            to="/trips"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-teal-800 transition hover:bg-teal-50"
          >
            Explore Trips <ArrowRight size={19} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-9">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 sm:flex-row lg:px-8">
          <span className="flex items-center gap-2 font-bold text-slate-800">
            <Compass size={19} className="text-teal-700" />
            TripHarbor
          </span>

          <span>
            © {new Date().getFullYear()} TripHarbor. All rights reserved.
          </span>
        </div>
      </footer>
    </main>
  )
}
