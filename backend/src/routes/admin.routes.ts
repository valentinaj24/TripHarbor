
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import {
  authenticate,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

export const adminRouter = Router()

// All routes in this router require an administrator.
adminRouter.use(authenticate, authorize('ADMIN'))

const uuidSchema = z.string().uuid()

const reviewTripSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().trim().max(1000).optional(),
}).strict().superRefine((data, ctx) => {
  if (data.decision === 'REJECT' && !data.reason) {
    ctx.addIssue({
      code: 'custom',
      path: ['reason'],
      message: 'A rejection reason is required.',
    })
  }
})


 // GET /api/admin/stats
adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrganizers,
      totalParticipants,
      pendingOrganizerRequests,
      totalTrips,
      publishedTrips,
      pendingTrips,
      draftTrips,
      rejectedTrips,
      totalRegistrations,
      acceptedRegistrations,
      pendingRegistrations,
      recentTrips,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ORGANIZER' } }),
      prisma.user.count({ where: { role: 'PARTICIPANT' } }),

      prisma.organizerRequest.count({
        where: { status: 'PENDING' },
      }),

      prisma.trip.count(),
      prisma.trip.count({ where: { status: 'PUBLISHED' } }),
      prisma.trip.count({ where: { status: 'PENDING' } }),
      prisma.trip.count({ where: { status: 'DRAFT' } }),
      prisma.trip.count({ where: { status: 'REJECTED' } }),

      prisma.registration.count(),
      prisma.registration.count({ where: { status: 'ACCEPTED' } }),
      prisma.registration.count({ where: { status: 'PENDING' } }),

      prisma.trip.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
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
      }),
    ])

    return res.json({
      data: {
        pendingOrganizerRequests,

        users: {
          total: totalUsers,
          organizers: totalOrganizers,
          participants: totalParticipants,
        },

        trips: {
          total: totalTrips,
          published: publishedTrips,
          pending: pendingTrips,
          drafts: draftTrips,
          rejected: rejectedTrips,
        },

        registrations: {
          total: totalRegistrations,
          accepted: acceptedRegistrations,
          pending: pendingRegistrations,
        },

        recentTrips,
      },
    })
  } catch (error) {
    next(error)
  }
})


// GET /api/admin/trips
// Optional query: ?status=PENDING
adminRouter.get('/trips', async (req, res, next) => {
  try {
    const parsed = z.object({
      status: z.enum([
        'DRAFT',
        'PENDING',
        'PUBLISHED',
        'REJECTED',
        'CANCELLED',
      ]).optional(),
    }).safeParse(req.query)

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid trip filter.',
      })
    }

    const trips = await prisma.trip.findMany({
      where: parsed.data.status
        ? { status: parsed.data.status }
        : {},
      orderBy: { createdAt: 'desc' },
      include: {
        destination: true,
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        activities: {
          orderBy: [
            { activityDate: 'asc' },
            { sortOrder: 'asc' },
          ],
        },
        _count: {
          select: {
            registrations: {
              where: { status: 'ACCEPTED' },
            },
          },
        },
      },
    })

    res.json({
      data: trips.map((trip) => ({
        id: trip.id,
        title: trip.title,
        description: trip.description,
        coverUrl: trip.coverUrl,
        category: trip.category,
        difficulty: trip.difficulty,
        startDate: trip.startDate,
        endDate: trip.endDate,
        maxParticipants: trip.maxParticipants,
        acceptedParticipants: trip._count.registrations,
        status: trip.status,
        meetingPoint: trip.meetingPoint,
        createdAt: trip.createdAt,
        organizer: trip.organizer,
        destination: {
          ...trip.destination,
          latitude: Number(trip.destination.latitude),
          longitude: Number(trip.destination.longitude),
        },
        activities: trip.activities.map((activity) => ({
          ...activity,
          latitude:
            activity.latitude === null
              ? null
              : Number(activity.latitude),
          longitude:
            activity.longitude === null
              ? null
              : Number(activity.longitude),
        })),
      })),
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/trips/pending
adminRouter.get('/trips/pending', async (_req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        destination: true,
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        activities: {
          orderBy: [
            { activityDate: 'asc' },
            { sortOrder: 'asc' },
          ],
        },
      },
    })

    res.json({
      data: trips.map((trip) => ({
        ...trip,
        destination: {
          ...trip.destination,
          latitude: Number(trip.destination.latitude),
          longitude: Number(trip.destination.longitude),
        },
        activities: trip.activities.map((activity) => ({
          ...activity,
          latitude:
            activity.latitude === null
              ? null
              : Number(activity.latitude),
          longitude:
            activity.longitude === null
              ? null
              : Number(activity.longitude),
        })),
      })),
    })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/admin/trips/:id/review
adminRouter.patch(
  '/trips/:id/review',
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = req.params.id

      if (typeof id !== 'string' || !uuidSchema.safeParse(id).success) {
        return res.status(400).json({
          message: 'Invalid trip ID.',
        })
      }

      const parsed = reviewTripSchema.safeParse(req.body)

      if (!parsed.success) {
        return res.status(400).json({
          message: 'Invalid review data.',
          errors: parsed.error.flatten().fieldErrors,
        })
      }

      const newStatus =
        parsed.data.decision === 'APPROVE'
          ? 'PUBLISHED'
          : 'REJECTED'

      const result = await prisma.trip.updateMany({
        where: {
          id,
          status: 'PENDING',
        },
        data: {
            status: newStatus,
            rejectionReason:
                newStatus === 'REJECTED'
                ? parsed.data.reason?.trim() ?? null
                : null,
            reviewedAt: new Date(),
            },
      })

      if (result.count === 0) {
        return res.status(409).json({
          message: 'Trip not found or no longer pending review.',
        })
      }

      return res.json({
        message:
          newStatus === 'PUBLISHED'
            ? 'Trip approved and published successfully.'
            : 'Trip rejected successfully.',
        data: {
          id,
          status: newStatus,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

const cancelTripSchema = z.object({
  reason: z.string().trim().min(10).max(1000),
}).strict()

// PATCH /api/admin/trips/:id/cancel
adminRouter.patch(
  '/trips/:id/cancel',
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = req.params.id

      if (typeof id !== 'string' || !uuidSchema.safeParse(id).success) {
        return res.status(400).json({
          message: 'Invalid trip ID.',
        })
      }

      const parsed = cancelTripSchema.safeParse(req.body)

      if (!parsed.success) {
        return res.status(400).json({
          message: 'Cancellation reason must contain 10–1000 characters.',
        })
      }

      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.trip.updateMany({
          where: {
            id,
            status: 'PUBLISHED',
          },
          data: {
            status: 'CANCELLED',
          },
        })

        if (updated.count === 0) {
          return false
        }

        await tx.registration.updateMany({
          where: {
            tripId: id,
            status: {
              in: ['PENDING', 'ACCEPTED'],
            },
          },
          data: {
            status: 'CANCELLED',
          },
        })

        return true
      })

      if (!result) {
        return res.status(409).json({
          message: 'Trip not found or is not published.',
        })
      }

      return res.json({
        message: 'Trip cancelled successfully.',
        data: {
          id,
          status: 'CANCELLED',
        },
      })
    } catch (error) {
      next(error)
    }
  }
)
