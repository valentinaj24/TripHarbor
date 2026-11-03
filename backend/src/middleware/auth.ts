
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'PARTICIPANT' | 'ORGANIZER' | 'ADMIN';
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({
        message: 'Authentication required.',
      });
      return;
    }

    const token = header.slice(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured.');
    }

    let decoded: string | JwtPayload;

    try {
      decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      });
    } catch {
      res.status(401).json({
        message: 'Invalid or expired token.',
      });
      return;
    }

    if (
      typeof decoded === 'string' ||
      typeof decoded.sub !== 'string'
    ) {
      res.status(401).json({
        message: 'Invalid token payload.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        role: true,
        accountStatus: true,
      },
    });

    if (!user || user.accountStatus !== 'ACTIVE') {
      res.status(401).json({
        message: 'Account not found or inactive.',
      });
      return;
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
