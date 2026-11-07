
import express from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.routes.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.routes.js'
import { tripsRouter } from './routes/trips.routes.js'
import { destinationsRouter } from './routes/destinations.routes.js'
import { activitiesRouter } from './routes/activities.routes.js'
import { registrationsRouter,myTripsRouter, } from './routes/registrations.routes.js'
import { adminRouter } from './routes/admin.routes.js'
import {
  organizerRequestsRouter,
  adminOrganizerRequestsRouter,
} from './routes/organizer-requests.routes.js'
import { adminManagementRouter } from './routes/admin-management.routes.js'

export const app = express()

app.disable('x-powered-by')

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  })
)

app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRoutes)
app.use('/api/trips', tripsRouter)
app.use('/api/trips', activitiesRouter)
app.use('/api/destinations', destinationsRouter)
app.use('/api/trips', registrationsRouter)
app.use('/api', myTripsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/organizer-requests', organizerRequestsRouter)
app.use('/api/admin/organizer-requests', adminOrganizerRequestsRouter)
app.use('/api/admin', adminManagementRouter)

app.use(notFound)
app.use(errorHandler)
