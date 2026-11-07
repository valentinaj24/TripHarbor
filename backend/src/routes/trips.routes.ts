
import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { z } from 'zod'
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

export const tripsRouter = Router()

tripsRouter.get(
  '/my',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const trips = await prisma.trip.findMany({
        where: {
          organizerId: req.user!.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          destination: true,
          _count: {
            select: {
              registrations: {
                where: { status: 'ACCEPTED' },
              },
            },
          },
        },
      })

      return res.json({
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
          availableSpots: Math.max(
            0,
            trip.maxParticipants - trip._count.registrations
          ),
          status: trip.status,
            rejectionReason: trip.rejectionReason,
            reviewedAt: trip.reviewedAt,
            cancellationReason: trip.cancellationReason,
            meetingPoint: trip.meetingPoint,
            createdAt: trip.createdAt,
          destination: {
            id: trip.destination.id,
            name: trip.destination.name,
            country: trip.destination.country,
            latitude: Number(trip.destination.latitude),
            longitude: Number(trip.destination.longitude),
          },
        })),
      })
    } catch (error) {
      next(error)
    }
  }
)


// Organizer-only details, including unpublished trips.
tripsRouter.get(
  '/my/:id',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = req.params.id
      if (typeof id !== 'string' || !z.uuid().safeParse(id).success) {
        return res.status(400).json({ message: 'Invalid trip ID.' })
      }

      const trip = await prisma.trip.findFirst({
        where: { id, organizerId: req.user!.id },
        include: { destination: true },
      })

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' })
      }

      return res.json({
        data: {
          ...trip,
          destination: {
            ...trip.destination,
            latitude: Number(trip.destination.latitude),
            longitude: Number(trip.destination.longitude),
          },
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

tripsRouter.get('/', async (req, res, next) => {
  try {
    const getQuery = (key: string) => {
      const value = req.query[key]
      return typeof value === 'string' ? value.trim() : ''
    }

    const search = getQuery('search')
    const category = getQuery('category')
    const difficulty = getQuery('difficulty')
    const startDate = getQuery('startDate')
    const endDate = getQuery('endDate')
    const sort = getQuery('sort') || 'date_asc'

    const pageInput = Number(getQuery('page') || '1')
    const limitInput = Number(getQuery('limit') || '9')

    if (
      !Number.isInteger(pageInput) ||
      pageInput < 1 ||
      !Number.isInteger(limitInput) ||
      limitInput < 1 ||
      limitInput > 50
    ) {
      return res.status(400).json({
        message: 'Invalid pagination parameters.',
      })
    }

    const parseDate = (value: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

      const date = new Date(`${value}T00:00:00.000Z`)

      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
      ) {
        return null
      }

      return date
    }

    const from = startDate ? parseDate(startDate) : null
    const to = endDate ? parseDate(endDate) : null

    if (
      (startDate && !from) ||
      (endDate && !to) ||
      (from && to && from > to)
    ) {
      return res.status(400).json({
        message: 'Invalid date range.',
      })
    }

    const orderBy: Prisma.TripOrderByWithRelationInput =
      sort === 'date_desc'
        ? { startDate: 'desc' }
        : sort === 'title_asc'
          ? { title: 'asc' }
          : { startDate: 'asc' }

    const where: Prisma.TripWhereInput = {
      status: 'PUBLISHED',

      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          {
            destination: {
              is: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { country: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      }),

      ...(category && {
        category: { equals: category, mode: 'insensitive' },
      }),

      ...(difficulty && {
        difficulty: { equals: difficulty, mode: 'insensitive' },
      }),

      ...(from && { endDate: { gte: from } }),
        ...(to && { startDate: { lte: to } }),
    }

    const page = pageInput
    const limit = limitInput

    const [trips, total] = await prisma.$transaction([
      prisma.trip.findMany({
        where,
        orderBy: [orderBy, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          destination: true,
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              registrations: {
                where: { status: 'ACCEPTED' },
              },
            },
          },
        },
      }),
      prisma.trip.count({ where }),
    ])

    const results = trips.map((trip) => ({
      id: trip.id,
      title: trip.title,
      description: trip.description,
      category: trip.category,
      difficulty: trip.difficulty,
      startDate: trip.startDate,
      endDate: trip.endDate,
      maxParticipants: trip.maxParticipants,
      availableSpots: Math.max(
        0,
        trip.maxParticipants - trip._count.registrations
      ),
      meetingPoint: trip.meetingPoint,
      destination: {
        id: trip.destination.id,
        name: trip.destination.name,
        country: trip.destination.country,
        latitude: Number(trip.destination.latitude),
        longitude: Number(trip.destination.longitude),
      },
      organizer: trip.organizer,
    }))

    res.json({
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
})


tripsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id

    if (typeof id !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        message: 'Invalid trip ID.',
      })
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        status: 'PUBLISHED',
      },
      include: {
        destination: true,
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

    if (!trip) {
      return res.status(404).json({
        message: 'Trip not found.',
      })
    }

    res.json({
      data: {
        id: trip.id,
        title: trip.title,
        description: trip.description,
        category: trip.category,
        difficulty: trip.difficulty,
        startDate: trip.startDate,
        endDate: trip.endDate,
        maxParticipants: trip.maxParticipants,
        availableSpots: Math.max(
          0,
          trip.maxParticipants - trip._count.registrations
        ),
        meetingPoint: trip.meetingPoint,
        destination: {
          id: trip.destination.id,
          name: trip.destination.name,
          country: trip.destination.country,
          latitude: Number(trip.destination.latitude),
          longitude: Number(trip.destination.longitude),
        },
        organizer: trip.organizer,
        activities: trip.activities.map((activity) => ({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          activityDate: activity.activityDate,
          startTime: activity.startTime,
          locationName: activity.locationName,
          latitude: activity.latitude === null
            ? null
            : Number(activity.latitude),
          longitude: activity.longitude === null
            ? null
            : Number(activity.longitude),
          sortOrder: activity.sortOrder,
        })),
      },
    })
  } catch (error) {
    next(error)
  }
})

const itineraryActivitySchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  activityDate: z.iso.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  locationName: z.string().trim().min(2).max(255),
  latitude: z.number().finite().min(-90).max(90).nullable().optional(),
  longitude: z.number().finite().min(-180).max(180).nullable().optional(),
  sortOrder: z.number().int().min(0).max(10000),
})

const tripBaseSchema = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(20).max(5000),
  coverUrl: z.union([z.url().max(2000), z.literal('')]).optional(),
  category: z.string().trim().min(2).max(50),
  difficulty: z.string().trim().min(2).max(50),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  maxParticipants: z.number().int().min(1).max(1000),
  meetingPoint: z.string().trim().min(3).max(255),
  activities: z.array(itineraryActivitySchema).max(200).optional(),
  destination: z.object({
    externalPlaceId: z.string().trim().min(1),
    name: z.string().trim().min(1).max(200),
    country: z.string().trim().min(1).max(200),
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
  }),
})

const createTripSchema = tripBaseSchema.superRefine((data, ctx) => {
  if (data.endDate < data.startDate) {
    ctx.addIssue({ code: 'custom', message: 'End date must be on or after start date.', path: ['endDate'] })
  }
  data.activities?.forEach((activity, index) => {
    if (activity.activityDate < data.startDate || activity.activityDate > data.endDate) {
      ctx.addIssue({ code: 'custom', message: 'Activity date must be within trip dates.', path: ['activities', index, 'activityDate'] })
    }
  })
})

tripsRouter.post(
  '/',
  authenticate,
  authorize('ORGANIZER'),
  async  (req: AuthenticatedRequest, res, next)  => {
    try {
      const parsed = createTripSchema.safeParse(req.body)

      if (!parsed.success) {
        return res.status(400).json({
          message: 'Invalid trip data.',
          errors: parsed.error.flatten(),
        })
      }

      const userId = req.user!.id
      const data = parsed.data

      const trip = await prisma.$transaction(async (tx) => {
        let destination = await tx.destination.findFirst({
          where: {
            externalPlaceId: data.destination.externalPlaceId,
          },
        })

        if (!destination) {
          destination = await tx.destination.create({
            data: {
              name: data.destination.name,
              country: data.destination.country,
              latitude: data.destination.latitude,
              longitude: data.destination.longitude,
              externalPlaceId: data.destination.externalPlaceId,
            },
          })
        }

        return tx.trip.create({
          data: {
            organizerId: userId,
            destinationId: destination.id,
            title: data.title,
            description: data.description,
            coverUrl: data.coverUrl || null,
            category: data.category,
            difficulty: data.difficulty,
            startDate: new Date(`${data.startDate}T00:00:00.000Z`),
            endDate: new Date(`${data.endDate}T00:00:00.000Z`),
            maxParticipants: data.maxParticipants,
            meetingPoint: data.meetingPoint,
            status: 'DRAFT',
            activities: {
              create: (data.activities ?? []).map((activity) => ({
                title: activity.title,
                description: activity.description ?? null,
                activityDate: new Date(`${activity.activityDate}T00:00:00.000Z`),
                startTime: activity.startTime
                ? new Date(`1970-01-01T${activity.startTime}:00.000Z`)
                : null,
                locationName: activity.locationName,
                latitude: activity.latitude ?? null,
                longitude: activity.longitude ?? null,
                sortOrder: activity.sortOrder,
              })),
            },
          },
          include: {
            destination: true,
          },
        })
      })

      return res.status(201).json({
        message: 'Trip created successfully.',
        data: {
          ...trip,
          destination: {
            ...trip.destination,
            latitude: Number(trip.destination.latitude),
            longitude: Number(trip.destination.longitude),
          },
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

// Full form update via PATCH; only the owner may edit drafts/rejected trips.
tripsRouter.patch(
  '/:id',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = req.params.id
      if (typeof id !== 'string' || !z.uuid().safeParse(id).success) {
        return res.status(400).json({ message: 'Invalid trip ID.' })
      }

      const parsed = tripBaseSchema.omit({ activities: true }).extend({ destination: tripBaseSchema.shape.destination.optional() }).superRefine((data, ctx) => {
        if (data.endDate < data.startDate) ctx.addIssue({ code: 'custom', message: 'End date must be on or after start date.', path: ['endDate'] })
      }).safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Invalid trip data.',
          errors: parsed.error.flatten(),
        })
      }

      const data = parsed.data
      const result = await prisma.$transaction(async (tx) => {
        const existing = await tx.trip.findFirst({
          where: { id, organizerId: req.user!.id },
          select: { id: true, status: true },
        })

        if (!existing) return { kind: 'not_found' as const }
        if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
          return { kind: 'not_editable' as const }
        }

        // Existing seeded trips can keep their original destination.
        let destinationId: string | undefined
        if (data.destination) {
          let destination = await tx.destination.findFirst({
            where: { externalPlaceId: data.destination.externalPlaceId },
          })
          if (!destination) {
            destination = await tx.destination.create({
              data: {
                externalPlaceId: data.destination.externalPlaceId,
                name: data.destination.name,
                country: data.destination.country,
                latitude: data.destination.latitude,
                longitude: data.destination.longitude,
              },
            })
          }
          destinationId = destination.id
        }

        // Never shorten the trip so existing activities fall outside its dates.
        const outsideActivities = await tx.tripActivity.count({
          where: {
            tripId: id,
            OR: [
              { activityDate: { lt: new Date(`${data.startDate}T00:00:00.000Z`) } },
              { activityDate: { gt: new Date(`${data.endDate}T00:00:00.000Z`) } },
            ],
          },
        })
        if (outsideActivities > 0) return { kind: 'invalid_dates' as const }

        // Status and ownership are checked again during the update.
        const updated = await tx.trip.updateMany({
          where: {
            id,
            organizerId: req.user!.id,
            status: { in: ['DRAFT', 'REJECTED'] },
          },
          data: {
            title: data.title,
            description: data.description,
            coverUrl: data.coverUrl || null,
            category: data.category,
            difficulty: data.difficulty,
            startDate: new Date(`${data.startDate}T00:00:00.000Z`),
            endDate: new Date(`${data.endDate}T00:00:00.000Z`),
            maxParticipants: data.maxParticipants,
            meetingPoint: data.meetingPoint,
            ...(destinationId && { destinationId }),
            // Rejected trips return to draft for another submission.
            status: 'DRAFT',
            rejectionReason: null,
            reviewedAt: null,
          },
        })

        if (updated.count === 0) return { kind: 'not_editable' as const }

        const trip = await tx.trip.findUniqueOrThrow({
          where: { id },
          include: { destination: true },
        })
        return { kind: 'success' as const, trip }
      })

      if (result.kind === 'invalid_dates') {
        return res.status(400).json({ message: 'Some activities fall outside the new trip dates. Update or remove them first.' })
      }
      if (result.kind === 'not_found') {
        return res.status(404).json({ message: 'Trip not found.' })
      }
      if (result.kind === 'not_editable') {
        return res.status(409).json({
          message: 'Only draft or rejected trips can be edited.',
        })
      }

      return res.json({
        message: 'Trip updated successfully.',
        data: {
          ...result.trip,
          destination: {
            ...result.trip.destination,
            latitude: Number(result.trip.destination.latitude),
            longitude: Number(result.trip.destination.longitude),
          },
        },
      })
    } catch (error) {
      next(error)
    }
  }
)
tripsRouter.patch(
  '/:id/submit',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = req.params.id

      if (
        typeof id !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      ) {
        return res.status(400).json({
          message: 'Invalid trip ID.',
        })
      }

      const trip = await prisma.trip.findFirst({
        where: {
          id,
          organizerId: req.user!.id,
        },
      })

      if (!trip) {
        return res.status(404).json({
          message: 'Trip not found.',
        })
      }

      if (trip.status !== 'DRAFT' && trip.status !== 'REJECTED') {
        return res.status(409).json({
          message: 'Only draft or rejected trips can be submitted for approval.',
        })
      }

      const updated = await prisma.trip.updateMany({
        where: {
          id,
          organizerId: req.user!.id,
          status: { in: ['DRAFT', 'REJECTED'] },
        },
        data: {
          status: 'PENDING',
          rejectionReason: null,
          reviewedAt: null,
        },
      })

      if (updated.count === 0) {
        return res.status(409).json({
          message: 'Trip status has changed. Please refresh and try again.',
        })
      }

      return res.json({
        message: 'Trip submitted for approval successfully.',
        data: {
          id,
          status: 'PENDING',
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

const cancelOrganizerTripSchema = z.object({
  reason: z.string().trim().min(10).max(1000),
}).strict()

// PATCH /api/trips/:id/cancel
tripsRouter.patch(
  '/:id/cancel',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = req.params.id

      if (typeof id !== 'string' || !z.uuid().safeParse(id).success) {
        return res.status(400).json({
          message: 'Invalid trip ID.',
        })
      }

      const parsed = cancelOrganizerTripSchema.safeParse(req.body)

      if (!parsed.success) {
        return res.status(400).json({
          message: 'Cancellation reason must contain 10–1000 characters.',
        })
      }

      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.trip.updateMany({
          where: {
            id,
            organizerId: req.user!.id,
            status: 'PUBLISHED',
          },
          data: {
            status: 'CANCELLED',
            cancellationReason: parsed.data.reason,
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
          message: 'Trip not found, not published, or not owned by you.',
        })
      }

      return res.json({
        message: 'Trip cancelled successfully.',
        data: {
          id,
          status: 'CANCELLED',
          cancellationReason: parsed.data.reason,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)
