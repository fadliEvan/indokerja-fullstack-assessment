import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AUTH_COOKIE_NAME, getAuthCookieOptions, getClearCookieOptions } from '../utils/token';
import { UnauthorizedError } from '../errors/AppError';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await authService.register(req.body);

      res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await authService.login(req.body);

      res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required', 'UNAUTHORIZED');
      }

      const user = await authService.getCurrentUser(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'User session retrieved',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
