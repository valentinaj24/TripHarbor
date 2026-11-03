
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

router.post('/register', async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: 'Invalid registration data.',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const { firstName, lastName, password } = result.data;
    const email = result.data.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        message: 'An account with this email already exists.',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role: 'PARTICIPANT',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'Account created successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
});


router.post('/login', async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: 'Invalid login data.',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const email = result.data.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        message: 'Invalid email or password.',
      });
      return;
    }

    if (user.accountStatus !== 'ACTIVE') {
      res.status(403).json({
        message: 'Your account is not active.',
      });
      return;
    }

    const passwordValid = await bcrypt.compare(
      result.data.password,
      user.passwordHash
    );

    if (!passwordValid) {
      res.status(401).json({
        message: 'Invalid email or password.',
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured.');
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      secret,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});


router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        message: 'User not found.',
      });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});




export default router;
