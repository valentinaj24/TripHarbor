
import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export const tripsRouter = Router()

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
