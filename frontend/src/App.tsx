
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import TripsPage from './pages/TripsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/organizer"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <main className="mx-auto max-w-7xl px-6 py-24">
                <h1 className="text-4xl font-bold">
                  Organizer Dashboard
                </h1>
                <p className="mt-4 text-slate-500">
                  Only organizers and administrators can access this page.
                </p>
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <main className="mx-auto max-w-7xl px-6 py-24">
                <h1 className="text-4xl font-bold">
                  Admin Dashboard
                </h1>
                <p className="mt-4 text-slate-500">
                  Only administrators can access this page.
                </p>
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <main className="mx-auto max-w-7xl px-6 py-24 text-center">
              <h1 className="text-5xl font-extrabold">404</h1>
              <p className="mt-4 text-slate-500">
                Page not found.
              </p>
            </main>
          }
        />
      </Routes>
    </div>
  )
}
