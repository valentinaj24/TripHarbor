
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import {
  authenticate,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'
import type { Prisma, TripActivity } from '@prisma/client'

export const activitiesRouter = Router()

const uuidSchema = z.string().uuid()

const activitySchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  activityDate: z.iso.date(),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable()
    .optional(),
  locationName: z.string().trim().min(2).max(255),
  latitude: z.number().finite().min(-90).max(90).nullable().optional(),
  longitude: z.number().finite().min(-180).max(180).nullable().optional(),
  sortOrder: z.number().int().min(1).max(10000).default(1),
})

const updateActivitySchema = activitySchema.partial()

function toPrismaTime(time: string | null | undefined): Date | null {
  if (!time) return null

  return new Date(`1970-01-01T${time}:00.000Z`)
}

function fromPrismaTime(time: Date | null): string | null {
  if (!time) return null

  return time.toISOString().slice(11, 16)
}

function formatActivity(activity: TripActivity) {
  return {
    id: activity.id,
    tripId: activity.tripId,
    title: activity.title,
    description: activity.description,
    activityDate: activity.activityDate.toISOString().slice(0, 10),
    startTime: fromPrismaTime(activity.startTime),
    locationName: activity.locationName,
    latitude:
      activity.latitude === null
        ? null
        : Number(activity.latitude),
    longitude:
      activity.longitude === null
        ? null
        : Number(activity.longitude),
    sortOrder: activity.sortOrder,
  }
}


// Keep positions contiguous (1, 2, 3...) for every date.
async function normalizeActivityOrders(tx: Prisma.TransactionClient, tripId: string) {
  const activities = await tx.tripActivity.findMany({
    where: { tripId },
    orderBy: [{ activityDate: 'asc' }, { sortOrder: 'asc' }, { startTime: 'asc' }, { id: 'asc' }],
  })
  const counters = new Map<string, number>()
  for (const activity of activities) {
    const day = activity.activityDate.toISOString().slice(0, 10)
    const position = (counters.get(day) ?? 0) + 1
    counters.set(day, position)
    if (activity.sortOrder !== position) {
      await tx.tripActivity.update({ where: { id: activity.id }, data: { sortOrder: position } })
    }
  }
}

async function getEditableTrip(tripId: string, userId: string) {
  return prisma.trip.findFirst({
    where: {
      id: tripId,
      organizerId: userId,
      status: { in: ['DRAFT', 'REJECTED'] },
    },
  })
}

// GET – list activities belonging to an organizer's trip
activitiesRouter.get(
  '/:tripId/activities',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const tripId = req.params.tripId

      if (typeof tripId !== 'string' || !uuidSchema.safeParse(tripId).success) {
        return res.status(400).json({ message: 'Invalid trip ID.' })
      }

      const trip = await prisma.trip.findFirst({
        where: {
          id: tripId,
          organizerId: req.user!.id,
        },
      })

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' })
      }

      const activities = await prisma.tripActivity.findMany({
        where: { tripId },
        orderBy: [
          { activityDate: 'asc' },
          { sortOrder: 'asc' },
          { startTime: 'asc' },
          { id: 'asc' },
        ],
      })

      return res.json({
        data: activities.map(formatActivity),
      })
    } catch (error) {
      next(error)
    }
  }
)


const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).max(1000),
})

// PATCH – reorder all activities within a trip
activitiesRouter.patch(
  '/:tripId/activities/reorder',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const tripId = req.params.tripId

      if (
        typeof tripId !== 'string' ||
        !uuidSchema.safeParse(tripId).success
      ) {
        return res.status(400).json({
          message: 'Invalid trip ID.',
        })
      }

      const parsed = reorderSchema.safeParse(req.body)

      if (!parsed.success) {
        return res.status(400).json({
          message: 'Invalid activity order.',
        })
      }

      const trip = await getEditableTrip(
        tripId,
        req.user!.id
      )

      if (!trip) {
        return res.status(404).json({
          message: 'Editable trip not found.',
        })
      }

      const activities = await prisma.tripActivity.findMany({
        where: { tripId },
      })

      const orderedIds = parsed.data.orderedIds
      const validIds = new Set(activities.map((a) => a.id))

      if (
        orderedIds.length !== activities.length ||
        new Set(orderedIds).size !== orderedIds.length ||
        orderedIds.some((id) => !validIds.has(id))
      ) {
        return res.status(400).json({
          message: 'Activity list does not match this trip.',
        })
      }

      const byId = new Map(
        activities.map((activity) => [activity.id, activity])
      )

      const counters = new Map<string, number>()

      await prisma.$transaction(
        orderedIds.map((id) => {
          const activity = byId.get(id)!
          const date = activity.activityDate
            .toISOString()
            .slice(0, 10)

          const order = (counters.get(date) ?? 0) + 1
          counters.set(date, order)

          return prisma.tripActivity.update({
            where: { id },
            data: { sortOrder: order },
          })
        })
      )

      const updated = await prisma.tripActivity.findMany({
        where: { tripId },
        orderBy: [
          { activityDate: 'asc' },
          { sortOrder: 'asc' },
          { id: 'asc' },
        ],
      })

      return res.json({
        message: 'Activity order updated.',
        data: updated.map(formatActivity),
      })
    } catch (error) {
      next(error)
    }
  }
)


// GET – non-blocking itinerary warnings for an organizer's trip
activitiesRouter.get(
  '/:tripId/activities/warnings',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const tripId = req.params.tripId
      if (typeof tripId !== 'string' || !uuidSchema.safeParse(tripId).success) {
        return res.status(400).json({ message: 'Invalid trip ID.' })
      }
      const trip = await prisma.trip.findFirst({
        where: { id: tripId, organizerId: req.user!.id },
      })
      if (!trip) return res.status(404).json({ message: 'Trip not found.' })

      const activities = await prisma.tripActivity.findMany({
        where: { tripId },
        orderBy: [{ activityDate: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
      })
      const warnings: Array<{
        code: 'DUPLICATE_TIME' | 'DUPLICATE_ORDER' | 'OUTSIDE_TRIP_DATES'
        message: string
        activityIds: string[]
      }> = []
      const timeGroups = new Map<string, TripActivity[]>()
      const orderGroups = new Map<string, TripActivity[]>()

      for (const activity of activities) {
        const date = activity.activityDate.toISOString().slice(0, 10)
        if (activity.activityDate < trip.startDate || activity.activityDate > trip.endDate) {
          warnings.push({
            code: 'OUTSIDE_TRIP_DATES',
            message: `Activity "${activity.title}" is outside the trip dates.`,
            activityIds: [activity.id],
          })
        }
        const orderKey = `${date}|${activity.sortOrder}`
        orderGroups.set(orderKey, [...(orderGroups.get(orderKey) ?? []), activity])
        const time = fromPrismaTime(activity.startTime)
        if (time) {
          const timeKey = `${date}|${time}`
          timeGroups.set(timeKey, [...(timeGroups.get(timeKey) ?? []), activity])
        }
      }
      for (const [key, group] of timeGroups) {
        if (group.length < 2) continue
        const [date, time] = key.split('|')
        warnings.push({
          code: 'DUPLICATE_TIME',
          message: `${group.length} activities on ${date} start at ${time}. Check for a scheduling conflict.`,
          activityIds: group.map((activity) => activity.id),
        })
      }
      for (const [key, group] of orderGroups) {
        if (group.length < 2) continue
        const [date, order] = key.split('|')
        warnings.push({
          code: 'DUPLICATE_ORDER',
          message: `${group.length} activities on ${date} have order ${order}.`,
          activityIds: group.map((activity) => activity.id),
        })
      }
      return res.json({ warnings })
    } catch (error) {
      next(error)
    }
  }
)

// POST – add a new activity
activitiesRouter.post(
  '/:tripId/activities',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const tripId = req.params.tripId

      if (typeof tripId !== 'string' || !uuidSchema.safeParse(tripId).success) {
        return res.status(400).json({ message: 'Invalid trip ID.' })
      }

      const parsed = activitySchema.safeParse(req.body)

      if (!parsed.success) {
        return res.status(400).json({
          message: 'Invalid activity data.',
          errors: parsed.error.flatten(),
        })
      }

      const trip = await getEditableTrip(tripId, req.user!.id)

      if (!trip) {
        return res.status(404).json({
          message: 'Editable trip not found.',
        })
      }

      const data = parsed.data
      const activityDate = new Date(`${data.activityDate}T00:00:00.000Z`)

      if (activityDate < trip.startDate || activityDate > trip.endDate) {
        return res.status(400).json({
          message: 'Activity date must be within the trip dates.',
        })
      }

      const activity = await prisma.$transaction(async (tx) => {
        const created = await tx.tripActivity.create({
          data: {
            tripId,
            title: data.title,
            description: data.description ?? null,
            activityDate,
            startTime: toPrismaTime(data.startTime),
            locationName: data.locationName,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            sortOrder: data.sortOrder,
          },
        })
        await normalizeActivityOrders(tx, tripId)
        return tx.tripActivity.findUniqueOrThrow({ where: { id: created.id } })
      })

      return res.status(201).json({
        message: 'Activity created successfully.',
        data: formatActivity(activity),
      })
    } catch (error) {
      next(error)
    }
  }
)

// PATCH – edit an existing activity
activitiesRouter.patch(
  '/:tripId/activities/:activityId',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const tripId = req.params.tripId
      const activityId = req.params.activityId

      if (
        typeof tripId !== 'string' ||
        typeof activityId !== 'string' ||
        !uuidSchema.safeParse(tripId).success ||
        !uuidSchema.safeParse(activityId).success
      ) {
        return res.status(400).json({
          message: 'Invalid trip or activity ID.',
        })
      }

      const parsed = updateActivitySchema.safeParse(req.body)

      if (!parsed.success) {
        return res.status(400).json({
          message: 'Invalid activity data.',
          errors: parsed.error.flatten(),
        })
      }

      const trip = await getEditableTrip(tripId, req.user!.id)

      if (!trip) {
        return res.status(404).json({
          message: 'Editable trip not found.',
        })
      }

      const existing = await prisma.tripActivity.findFirst({
        where: { id: activityId, tripId },
      })

      if (!existing) {
        return res.status(404).json({
          message: 'Activity not found.',
        })
      }

      const data = parsed.data

      const activityDate = data.activityDate
        ? new Date(`${data.activityDate}T00:00:00.000Z`)
        : existing.activityDate

      if (activityDate < trip.startDate || activityDate > trip.endDate) {
        return res.status(400).json({
          message: 'Activity date must be within the trip dates.',
        })
      }

      const activity = await prisma.$transaction(async (tx) => {
        const updated = await tx.tripActivity.update({
          where: { id: activityId },
          data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.activityDate !== undefined && { activityDate }),
          ...(data.startTime !== undefined && {
            startTime: toPrismaTime(data.startTime),
            }),
          ...(data.locationName !== undefined && {
            locationName: data.locationName,
          }),
          ...(data.latitude !== undefined && {
            latitude: data.latitude,
          }),
          ...(data.longitude !== undefined && {
            longitude: data.longitude,
          }),
          ...((data.activityDate !== undefined &&
            data.activityDate !== existing.activityDate.toISOString().slice(0, 10))
            ? { sortOrder: 10000 }
            : data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        },
      })

        await normalizeActivityOrders(tx, tripId)
        return tx.tripActivity.findUniqueOrThrow({ where: { id: updated.id } })
      })

      return res.json({
        message: 'Activity updated successfully.',
        data: formatActivity(activity),
      })
    } catch (error) {
      next(error)
    }
  }
)

// DELETE – remove an activity
activitiesRouter.delete(
  '/:tripId/activities/:activityId',
  authenticate,
  authorize('ORGANIZER'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const tripId = req.params.tripId
      const activityId = req.params.activityId

      if (
        typeof tripId !== 'string' ||
        typeof activityId !== 'string' ||
        !uuidSchema.safeParse(tripId).success ||
        !uuidSchema.safeParse(activityId).success
      ) {
        return res.status(400).json({
          message: 'Invalid trip or activity ID.',
        })
      }

      const trip = await getEditableTrip(tripId, req.user!.id)

      if (!trip) {
        return res.status(404).json({
          message: 'Editable trip not found.',
        })
      }

      
const deleted = await prisma.$transaction(async (tx) => {
  const result = await tx.tripActivity.deleteMany({
    where: { id: activityId, tripId },
  })

  if (result.count === 0) return result

  const remaining = await tx.tripActivity.findMany({
    where: { tripId },
    orderBy: [
      { activityDate: 'asc' },
      { sortOrder: 'asc' },
      { startTime: 'asc' },
      { id: 'asc' },
    ],
  })

  const counters = new Map<string, number>()

        for (const activity of remaining) {
            const date = activity.activityDate
            .toISOString()
            .slice(0, 10)

            const order = (counters.get(date) ?? 0) + 1
            counters.set(date, order)

            if (activity.sortOrder !== order) {
            await tx.tripActivity.update({
                where: { id: activity.id },
                data: { sortOrder: order },
            })
            }
        }

        return result
        })

        if (deleted.count === 0) {
        return res.status(404).json({
            message: 'Activity not found.',
        })
        }


      return res.json({
        message: 'Activity deleted successfully.',
      })
    } catch (error) {
      next(error)
    }
  }
)
