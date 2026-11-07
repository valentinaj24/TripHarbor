import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authorize } from '../middleware/authorize.js'
import {
  authenticate,
  type AuthenticatedRequest,
} from '../middleware/auth.js'

export const adminManagementRouter = Router()
adminManagementRouter.use(authenticate, authorize('ADMIN'))

adminManagementRouter.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        role: true, accountStatus: true, createdAt: true,
        _count: { select: { organizedTrips: true, registrations: true } },
      },
    })
    res.json({ data: users.map(({ _count, ...user }) => ({
      ...user, tripCount: _count.organizedTrips,
      registrationCount: _count.registrations,
    })) })
  } catch (error) { next(error) }
})

adminManagementRouter.patch(
  '/users/:id/status',
  async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id
    if (typeof id !== 'string' || !z.string().uuid().safeParse(id).success) {
      return res.status(400).json({ message: 'Invalid user ID.' })
    }
    const parsed = z.object({
      status: z.enum(['ACTIVE', 'SUSPENDED']),
    }).strict().safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid account status.' })
    }
    if (id === req.user?.id) {
      return res.status(403).json({ message: 'You cannot change your own account status.' })
    }
    const target = await prisma.user.findUnique({
      where: { id }, select: { role: true },
    })
    if (!target) return res.status(404).json({ message: 'User not found.' })
    if (target.role === 'ADMIN') {
      return res.status(403).json({ message: 'Administrator accounts cannot be changed here.' })
    }
    const user = await prisma.user.update({
      where: { id }, data: { accountStatus: parsed.data.status },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, role: true, accountStatus: true,
      },
    })
    return res.json({ message: `Account ${parsed.data.status.toLowerCase()} successfully.`, data: user })
  } catch (error) { next(error) }
})

adminManagementRouter.get('/analytics', async (_req, res, next) => {
  try {
    const [users, trips, registrations, destinations, recentUsers] = await prisma.$transaction([
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.trip.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.registration.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.destination.findMany({
        select: {
          id: true, name: true, country: true,
          _count: { select: { trips: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' }, take: 5,
        select: { id: true, firstName: true, lastName: true, role: true, createdAt: true },
      }),
    ])
    res.json({ data: {
      users: users.map(x => ({ name: x.role, count: x._count._all })),
      trips: trips.map(x => ({ name: x.status, count: x._count._all })),
      registrations: registrations.map(x => ({ name: x.status, count: x._count._all })),
      destinations: destinations.map(x => ({
        id: x.id, name: x.name, country: x.country, count: x._count.trips,
      })).filter(x => x.count > 0).sort((a, b) => b.count - a.count).slice(0, 8),
      recentUsers,
    } })
  } catch (error) { next(error) }
})
