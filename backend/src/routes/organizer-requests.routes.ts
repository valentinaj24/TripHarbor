import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

export const organizerRequestsRouter = Router()
export const adminOrganizerRequestsRouter = Router()

const uuidSchema = z.string().uuid()
const submitSchema = z.object({
  motivation: z.string().trim().min(20).max(2000),
  experience: z.string().trim().min(20).max(2000),
}).strict()
const reviewSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().trim().max(1000).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.decision === 'REJECT' && !value.reason) {
    ctx.addIssue({ code: 'custom', path: ['reason'], message: 'A rejection reason is required.' })
  }
})

organizerRequestsRouter.use(authenticate)

// GET /api/organizer-requests/me
organizerRequestsRouter.get('/me', async (req: AuthenticatedRequest, res, next) => {
  try {
    const requests = await prisma.organizerRequest.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    })
    return res.json({ data: requests })
  } catch (error) { next(error) }
})

// POST /api/organizer-requests
organizerRequestsRouter.post('/', authorize('PARTICIPANT'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = submitSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid organizer request.', errors: parsed.error.flatten().fieldErrors })
    }

    const pending = await prisma.organizerRequest.findFirst({
      where: { userId: req.user!.id, status: 'PENDING' },
      select: { id: true },
    })
    if (pending) return res.status(409).json({ message: 'You already have a pending organizer request.' })

    const created = await prisma.organizerRequest.create({
      data: { userId: req.user!.id, ...parsed.data },
    })
    return res.status(201).json({ message: 'Organizer request submitted successfully.', data: created })
  } catch (error) { next(error) }
})

adminOrganizerRequestsRouter.use(authenticate, authorize('ADMIN'))

// GET /api/admin/organizer-requests?status=PENDING
adminOrganizerRequestsRouter.get('/', async (req, res, next) => {
  try {
    const parsed = z.object({
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    }).safeParse(req.query)
    if (!parsed.success) return res.status(400).json({ message: 'Invalid status filter.' })

    const requests = await prisma.organizerRequest.findMany({
      where: parsed.data.status ? { status: parsed.data.status } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })
    return res.json({ data: requests })
  } catch (error) { next(error) }
})

// PATCH /api/admin/organizer-requests/:id/review
adminOrganizerRequestsRouter.patch('/:id/review', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id
    if (typeof id !== 'string' || !uuidSchema.safeParse(id).success) {
      return res.status(400).json({ message: 'Invalid request ID.' })
    }
    const parsed = reviewSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid review data.', errors: parsed.error.flatten().fieldErrors })
    }

    const status = parsed.data.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.organizerRequest.updateMany({
        where: { id, status: 'PENDING' },
        data: {
          status,
          rejectionReason: status === 'REJECTED' ? parsed.data.reason ?? null : null,
          reviewedById: req.user!.id,
          reviewedAt: new Date(),
        },
      })
      if (updated.count === 0) return null

      const reviewed = await tx.organizerRequest.findUniqueOrThrow({ where: { id } })
      if (status === 'APPROVED') {
        const promoted = await tx.user.updateMany({
          where: { id: reviewed.userId, role: 'PARTICIPANT', accountStatus: 'ACTIVE' },
          data: { role: 'ORGANIZER' },
        })
        if (promoted.count !== 1) {
          throw new Error('The applicant is no longer an active participant.')
        }
      }
      return reviewed
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    if (!result) return res.status(409).json({ message: 'Request not found or already reviewed.' })
    return res.json({ message: status === 'APPROVED' ? 'Organizer request approved.' : 'Organizer request rejected.', data: result })
  } catch (error) {
    if (error instanceof Error && error.message === 'The applicant is no longer an active participant.') {
      return res.status(409).json({ message: error.message })
    }
    next(error)
  }
})
