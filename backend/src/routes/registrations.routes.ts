
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import {
  authenticate,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

export const registrationsRouter = Router()

const uuidSchema = z.string().uuid()

function getTripId(value: unknown): string | null {
  return typeof value === 'string' && uuidSchema.safeParse(value).success
    ? value
    : null
}

function formatRegistration(registration: {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  registeredAt: Date
}) {
  return {
    id: registration.id,
    status: registration.status,
    registeredAt: registration.registeredAt,
  }
}

// GET – check my registration status
registrationsRouter.get(
  '/:tripId/registrations/me',
  authenticate,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const tripId = getTripId(req.params.tripId)

      if (!tripId) {
        return res.status(400).json({ message: 'Invalid trip ID.' })
      }

      const trip = await prisma.trip.findFirst({
        where: { id: tripId, status: 'PUBLISHED' },
        select: { id: true },
      })

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' })
      }

      const registration = await prisma.registration.findFirst({
        where: { tripId, userId: req.user!.id },
        orderBy: { registeredAt: 'desc' },
      })

      return res.json({
        data: registration ? formatRegistration(registration) : null,
      })
    } catch (error) {
      next(error)
    }
  }
)

// POST – join a published trip
registrationsRouter.post(
  '/:tripId/registrations',
  authenticate,
  authorize('PARTICIPANT', 'ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const tripId = getTripId(req.params.tripId)

      if (!tripId) {
        return res.status(400).json({ message: 'Invalid trip ID.' })
      }

      const userId = req.user!.id

      const result = await prisma.$transaction(async (tx) => {
        // Prevent simultaneous registrations for the same trip.
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${tripId}))
        `

        const trip = await tx.trip.findFirst({
          where: { id: tripId, status: 'PUBLISHED' },
          select: {
            organizerId: true,
            maxParticipants: true,
            startDate: true,
          },
        })

        if (!trip) return { error: 'Trip not found.', status: 404 }

        if (trip.organizerId === userId) {
          return {
            error: 'You cannot join your own trip.',
            status: 403,
          }
        }

        if (trip.startDate < new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z')) {
          return {
            error: 'Registration for this trip is closed.',
            status: 409,
          }
        }

        const acceptedCount = await tx.registration.count({
          where: { tripId, status: 'ACCEPTED' },
        })

        if (acceptedCount >= trip.maxParticipants) {
          return { error: 'This trip is fully booked.', status: 409 }
        }

        const existing = await tx.registration.findFirst({
          where: { tripId, userId },
          orderBy: { registeredAt: 'desc' },
        })

        if (
          existing?.status === 'PENDING' ||
          existing?.status === 'ACCEPTED'
        ) {
          return {
            error: 'You have already registered for this trip.',
            status: 409,
          }
        }

        // Reuse the previous cancelled/rejected registration.
        const registration = existing
          ? await tx.registration.update({
              where: { id: existing.id },
              data: {
                status: 'PENDING',
                registeredAt: new Date(),
                reviewedAt: null,
              },
            })
          : await tx.registration.create({
              data: {
                tripId,
                userId,
                status: 'PENDING',
              },
            })

        return {
          data: formatRegistration(registration),
        }
      })

      if ('error' in result) {
        return res.status(result.status!).json({
          message: result.error,
        })
      }

      return res.status(201).json({
        message: 'Registration submitted successfully.',
        data: result.data,
      })
    } catch (error) {
      next(error)
    }
  }
)

// PATCH – cancel my registration
registrationsRouter.patch(
  '/:tripId/registrations/cancel',
  authenticate,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const tripId = getTripId(req.params.tripId)

      if (!tripId) {
        return res.status(400).json({ message: 'Invalid trip ID.' })
      }

      const result = await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${tripId}))
        `

        const existing = await tx.registration.findFirst({
          where: {
            tripId,
            userId: req.user!.id,
            status: { in: ['PENDING', 'ACCEPTED'] },
          },
          orderBy: { registeredAt: 'desc' },
        })

        if (!existing) return null

        return tx.registration.update({
          where: { id: existing.id },
          data: {
            status: 'CANCELLED',
            reviewedAt: null,
          },
        })
      })

      if (!result) {
        return res.status(404).json({
          message: 'Active registration not found.',
        })
      }

      return res.json({
        message: 'Registration cancelled successfully.',
        data: formatRegistration(result),
      })
    } catch (error) {
      next(error)
    }
  }
)
