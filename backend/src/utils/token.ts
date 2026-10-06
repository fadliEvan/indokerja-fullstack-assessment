import jwt from 'jsonwebtoken';
import { CookieOptions } from 'express';
import { ENV } from '../config/env';
import { AuthTokenPayload } from '../types/auth.types';

export const AUTH_COOKIE_NAME = 'token';

export const generateToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: '24h'
  });
};

export const verifyToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as AuthTokenPayload;
};

export const getAuthCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
};

export const getClearCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'lax'
  };
};
