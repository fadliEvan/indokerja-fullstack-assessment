import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError';
import { verifyToken, AUTH_COOKIE_NAME } from '../utils/token';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedError('Authentication required', 'UNAUTHORIZED');
    }

    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      companyProfileId: payload.companyProfileId
    };

    next();
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) {
      next(err);
      return;
    }
    next(new UnauthorizedError('Invalid or expired authentication session', 'UNAUTHORIZED'));
  }
};

export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (token) {
      const payload = verifyToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        companyProfileId: payload.companyProfileId
      };
    }
  } catch {
    // If token is invalid or expired, ignore and proceed as unauthenticated guest
    req.user = undefined;
  }
  next();
};
