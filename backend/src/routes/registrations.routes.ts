
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import {
  authenticate,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

export const registrationsRouter = Router()
export const myTripsRouter = Router()

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
            existing?.status === 'ACCEPTED' ||
            existing?.status === 'REJECTED'
            ) {
          return {
            error: 'You cannot submit another registration for this trip.',
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

const registrationIdSchema = z.string().uuid()

const reviewRegistrationSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
})

// GET – organizer views registrations for their trip
registrationsRouter.get(
  '/:tripId/registrations',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const tripId = getTripId(req.params.tripId)

      if (!tripId) {
        return res.status(400).json({
          message: 'Invalid trip ID.',
        })
      }

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: {
          id: true,
          title: true,
          organizerId: true,
          status: true,
          maxParticipants: true,
        },
      })

      if (!trip) {
        return res.status(404).json({
          message: 'Trip not found.',
        })
      }

      if (trip.organizerId !== req.user!.id) {
        return res.status(403).json({
          message: 'You can only manage your own trips.',
        })
      }

      const registrations = await prisma.registration.findMany({
        where: { tripId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { registeredAt: 'desc' },
      })

      const acceptedCount = registrations.filter(
        (item) => item.status === 'ACCEPTED'
      ).length

      const pendingCount = registrations.filter(
        (item) => item.status === 'PENDING'
      ).length

      return res.json({
        data: {
          trip: {
            id: trip.id,
            title: trip.title,
            status: trip.status,
            maxParticipants: trip.maxParticipants,
            acceptedCount,
            pendingCount,
            availableSpots: Math.max(
              0,
              trip.maxParticipants - acceptedCount
            ),
          },
          registrations: registrations.map((item) => ({
            id: item.id,
            status: item.status,
            registeredAt: item.registeredAt,
            reviewedAt: item.reviewedAt,
            user: item.user,
          })),
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

// PATCH – organizer accepts or rejects a registration
registrationsRouter.patch(
  '/:tripId/registrations/:registrationId/status',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const tripId = getTripId(req.params.tripId)
      const registrationId = req.params.registrationId

      if (
        !tripId ||
        typeof registrationId !== 'string' ||
        !registrationIdSchema.safeParse(registrationId).success
      ) {
        return res.status(400).json({
          message: 'Invalid trip or registration ID.',
        })
      }

      const parsed = reviewRegistrationSchema.safeParse(req.body)

      if (!parsed.success) {
        return res.status(400).json({
          message: 'Status must be ACCEPTED or REJECTED.',
        })
      }

      const requestedStatus = parsed.data.status

      const result = await prisma.$transaction(async (tx) => {
        // Same lock as registration and cancellation routes.
        // Only one operation per trip can proceed at a time.
        await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${tripId}))
        `

        const trip = await tx.trip.findUnique({
          where: { id: tripId },
          select: {
            id: true,
            organizerId: true,
            status: true,
            maxParticipants: true,
          },
        })

        if (!trip) {
          return {
            error: 'Trip not found.',
            httpStatus: 404,
          }
        }

        if (trip.organizerId !== req.user!.id) {
          return {
            error: 'You can only manage your own trips.',
            httpStatus: 403,
          }
        }

        if (trip.status !== 'PUBLISHED') {
          return {
            error: 'Only published trips can accept registrations.',
            httpStatus: 409,
          }
        }

        const registration = await tx.registration.findFirst({
          where: {
            id: registrationId,
            tripId,
          },
        })

        if (!registration) {
          return {
            error: 'Registration not found.',
            httpStatus: 404,
          }
        }

        if (registration.status !== 'PENDING') {
          return {
            error: 'Only pending registrations can be reviewed.',
            httpStatus: 409,
          }
        }

        if (requestedStatus === 'ACCEPTED') {
          const acceptedCount = await tx.registration.count({
            where: {
              tripId,
              status: 'ACCEPTED',
            },
          })

          if (acceptedCount >= trip.maxParticipants) {
            return {
              error: 'This trip is fully booked.',
              httpStatus: 409,
            }
          }
        }

        const updated = await tx.registration.update({
          where: { id: registrationId },
          data: {
            status: requestedStatus,
            reviewedAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        })

        return {
          data: {
            id: updated.id,
            status: updated.status,
            registeredAt: updated.registeredAt,
            reviewedAt: updated.reviewedAt,
            user: updated.user,
          },
        }
      })

      if ('error' in result) {
        return res.status(result.httpStatus!).json({
          message: result.error,
        })
      }

      return res.json({
        message:
          requestedStatus === 'ACCEPTED'
            ? 'Registration accepted successfully.'
            : 'Registration rejected successfully.',
        data: result.data,
      })
    } catch (error) {
      next(error)
    }
  }
)

myTripsRouter.get(
  '/users/me/registrations',
  authenticate,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const registrations = await prisma.registration.findMany({
        where: { userId: req.user!.id },
        include: {
          trip: {
            select: {
              id: true,
              title: true,
              description: true,
              coverUrl: true,
              category: true,
              startDate: true,
              endDate: true,
              meetingPoint: true,
              status: true,
              destination: {
                select: {
                  name: true,
                  country: true,
                },
              },
              organizer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { registeredAt: 'desc' },
      })

      return res.json({
        data: registrations.map((registration) => ({
          id: registration.id,
          status: registration.status,
          registeredAt: registration.registeredAt,
          reviewedAt: registration.reviewedAt,
          trip: registration.trip,
        })),
      })
    } catch (error) {
      next(error)
    }
  }
)

