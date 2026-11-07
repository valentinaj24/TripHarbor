
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'

import HomePage from './pages/HomePage'
import TripsPage from './pages/TripsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TripDetailsPage from './pages/TripDetailsPage'
import OrganizerDashboard from './pages/OrganizerDashboard'
import CreateTripPage from './pages/CreateTripPage'
import TripRegistrationsPage from './pages/TripRegistrationsPage'
import MyTripsPage from './pages/MyTripsPage'
import ProfilePage from './pages/ProfilePage'
import AdminOverviewPage from './pages/AdminOverviewPage'
import AdminTripApprovalsPage from './pages/AdminTripApprovalsPage'
import BecomeOrganizerPage from './pages/BecomeOrganizerPage'
import AdminOrganizerRequestsPage from './pages/AdminOrganizerRequestsPage'
import AdminAllTripsPage from './pages/AdminAllTripsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminAnalyticsPage from './pages/AdminAnalyticsPage'

export default function App() {
  const location = useLocation()
  const isAdminPage =
    location.pathname === '/admin' ||
    location.pathname.startsWith('/admin/')

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {!isAdminPage && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/trips/:id" element={<TripDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/my-trips"
          element={
            <ProtectedRoute allowedRoles={['PARTICIPANT', 'ORGANIZER', 'ADMIN']}>
              <MyTripsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['PARTICIPANT', 'ORGANIZER', 'ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/trips/new"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <CreateTripPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/trips/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <CreateTripPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/trips/:id/registrations"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER']}>
              <TripRegistrationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminOverviewPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trips/pending"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminTripApprovalsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trips"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminAllTripsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/organizers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminOrganizerRequestsPage />
              </AdminLayout>
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

        <Route
          path="/become-organizer"
          element={
            <ProtectedRoute allowedRoles={['PARTICIPANT']}>
              <BecomeOrganizerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminAnalyticsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </div>
  )
}
