import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ENV } from './config/env';
import { apiRoutes } from './routes';
import { errorHandler } from './errors/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Defensive Headers
  app.use(helmet());

  // CORS Configuration with Credentials for HTTP-Only Cookie Transport
  app.use(
    cors({
      origin: ENV.CORS_ORIGIN,
      credentials: true
    })
  );

  // Body and Cookie Parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Health Check Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'IndoKerja API is healthy',
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
        environment: ENV.NODE_ENV
      }
    });
  });

  // Mount API Routes
  app.use('/api', apiRoutes);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
